"""Fee payment creation and links.et receipt verification."""
import base64
import json
import re
import uuid
from decimal import Decimal, InvalidOperation
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import require_admin
from app.core.config import settings
from app.core.database import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.student import Student
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse, PaymentVerifyUrl

router = APIRouter(prefix="/payments", tags=["Payments"])

MAX_IMAGE_BYTES = 3_500_000


def _api_key() -> str:
    key = settings.LINKS_ET_API_KEY
    if not key:
        raise HTTPException(status_code=503, detail="Payment verification is not configured.")
    return key


def _money(value: object) -> Decimal | None:
    if value is None:
        return None
    if isinstance(value, (int, float, Decimal)):
        return Decimal(str(value)).quantize(Decimal("0.01"))
    text = str(value).replace(",", "")
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    if not match:
        return None
    try:
        return Decimal(match.group(0)).quantize(Decimal("0.01"))
    except InvalidOperation:
        return None


def _receipt_data(response: dict, image: bool = False) -> tuple[dict | None, dict]:
    if image:
        upstream = response.get("upstream") or {}
        receipt_result = upstream.get("result") or {}
        return receipt_result.get("receipt"), response
    return response.get("receipt"), response


def _receipt_fields(receipt: dict) -> tuple[Decimal | None, str | None, str | None, str | None, str | None]:
    provider = receipt.get("providerKey") or receipt.get("source")
    reference = (
        receipt.get("receiptNo")
        or receipt.get("reference")
        or receipt.get("vatReceiptNo")
    )
    amount = (
        _money(receipt.get("settledAmount"))
        or _money(receipt.get("transferredAmount"))
        or _money(receipt.get("creditAmount"))
        or _money(receipt.get("totalPaidAmount"))
        or _money(receipt.get("amount"))
    )
    transaction_status = receipt.get("transactionStatus")
    payer_name = receipt.get("payerName")
    payment_date = receipt.get("paymentDate") or receipt.get("processingDate")
    return amount, provider, reference, payer_name, payment_date or transaction_status


def _verified_amount(response: dict, image: bool) -> tuple[dict | None, Decimal | None, str | None, str | None, str | None, str | None]:
    receipt, _ = _receipt_data(response, image=image)
    if not receipt:
        return None, None, None, None, None, None
    amount, provider, reference, payer, date_or_status = _receipt_fields(receipt)
    transaction_status = receipt.get("transactionStatus")
    return receipt, amount, provider, reference, payer, transaction_status or date_or_status


async def _verify_url(url: str, idempotency_key: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
            response = await client.post(
                "https://links.et/api/verify",
                headers={
                    "x-api-key": _api_key(),
                    "content-type": "application/json",
                    "Idempotency-Key": idempotency_key,
                },
                json={"url": url},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Payment verification service is unreachable: {exc}") from exc

    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Payment verification service returned invalid JSON.") from exc

    if response.status_code >= 400:
        error = payload.get("error")
        message = error.get("message") if isinstance(error, dict) else error
        raise HTTPException(status_code=response.status_code, detail=message or "Receipt verification failed.")
    return payload


async def _verify_image(image_bytes: bytes, idempotency_key: str) -> dict:
    encoded = base64.b64encode(image_bytes).decode("ascii")
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(45.0, connect=10.0)) as client:
            response = await client.post(
                "https://links.et/api/verify-image",
                headers={
                    "x-api-key": _api_key(),
                    "content-type": "application/json",
                    "Idempotency-Key": idempotency_key,
                },
                json={"imageBase64": encoded},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Payment screenshot service is unreachable: {exc}") from exc

    try:
        payload = response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Payment screenshot service returned invalid JSON.") from exc

    if response.status_code >= 400:
        error = payload.get("error")
        message = error.get("message") if isinstance(error, dict) else error
        raise HTTPException(status_code=response.status_code, detail=message or "Screenshot verification failed.")
    return payload


async def _apply_verification(
    payment: Payment,
    response: dict,
    admin: User,
    db: AsyncSession,
    *,
    image: bool = False,
) -> Payment:
    receipt, amount, provider, reference, payer_name, transaction_status = _verified_amount(response, image)
    payment.verification_response = response

    if not receipt:
        payment.verification_status = PaymentStatus.REJECTED
        payment.verification_message = "No bank/provider-confirmed receipt was returned."
        return payment

    payment.provider = provider
    payment.receipt_reference = reference
    payment.amount = amount
    payment.payer_name = payer_name
    payment.transaction_status = transaction_status
    payment.payment_date = receipt.get("paymentDate") or receipt.get("processingDate")

    duplicate_query = select(Payment).where(
        Payment.provider == provider,
        Payment.receipt_reference == reference,
        Payment.id != payment.id,
    )
    duplicate = (await db.execute(duplicate_query)).scalar_one_or_none()
    if reference and duplicate:
        payment.verification_status = PaymentStatus.REJECTED
        payment.verification_message = "This transaction receipt has already been registered."
        return payment

    confirmed = bool(response.get("ok"))
    if image:
        upstream = response.get("upstream") or {}
        confirmed = confirmed and bool(upstream.get("attempted")) and bool((upstream.get("result") or {}).get("ok"))

    if transaction_status and transaction_status.lower() not in {"completed", "success", "successful"}:
        confirmed = False
        payment.verification_message = f"Provider status is {transaction_status}, not completed."

    if not confirmed:
        payment.verification_status = PaymentStatus.REJECTED
        payment.verification_message = payment.verification_message or "The provider did not confirm this receipt."
        return payment

    if amount is None:
        payment.verification_status = PaymentStatus.MANUAL_REVIEW
        payment.verification_message = "Provider confirmed the receipt, but no payable amount could be read."
        return payment

    if amount != Decimal(payment.expected_amount).quantize(Decimal("0.01")):
        payment.verification_status = PaymentStatus.REJECTED
        payment.verification_message = (
            f"Verified amount is {amount:.2f} ETB, but the expected amount is "
            f"{Decimal(payment.expected_amount):.2f} ETB."
        )
        return payment

    payment.verification_status = PaymentStatus.VERIFIED
    payment.verification_message = "Payment confirmed by the upstream provider."
    payment.verified_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    payment.verified_by = admin.id
    return payment


def _response(payment: Payment) -> PaymentResponse:
    student = payment.student
    return PaymentResponse(
        id=payment.id,
        student_id=payment.student_id,
        student_name=student.user.full_name if student.user else "Unknown",
        student_number=student.student_number,
        expected_amount=payment.expected_amount,
        amount=payment.amount,
        provider=payment.provider,
        receipt_url=payment.receipt_url,
        receipt_reference=payment.receipt_reference,
        payer_name=payment.payer_name,
        transaction_status=payment.transaction_status,
        payment_date=payment.payment_date,
        verification_status=payment.verification_status,
        verification_message=payment.verification_message,
        verified_at=payment.verified_at,
        created_at=payment.created_at,
    )


async def _load_payment(db: AsyncSession, payment_id: uuid.UUID) -> Payment:
    payment = (
        await db.execute(
            select(Payment)
            .where(Payment.id == payment_id)
            .options(selectinload(Payment.student).selectinload(Student.user))
        )
    ).scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found.")
    return payment


@router.get("", response_model=list[PaymentResponse])
async def list_payments(
    db: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[User, Depends(require_admin)],
) -> list[PaymentResponse]:
    result = await db.execute(
        select(Payment)
        .options(selectinload(Payment.student).selectinload(Student.user))
        .order_by(Payment.created_at.desc())
    )
    return [_response(payment) for payment in result.scalars().all()]


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> PaymentResponse:
    student = (
        await db.execute(select(Student).where(Student.id == payload.student_id).options(selectinload(Student.user)))
    ).scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    payment = Payment(
        student_id=payload.student_id,
        expected_amount=payload.expected_amount,
        receipt_url=str(payload.receipt_url) if payload.receipt_url else None,
        verification_status=PaymentStatus.PENDING,
    )
    db.add(payment)
    await db.flush()

    if payload.receipt_url:
        payment.verification_status = PaymentStatus.VERIFYING
        try:
            response = await _verify_url(str(payload.receipt_url), str(payment.id))
            await _apply_verification(payment, response, admin, db)
        except HTTPException as exc:
            payment.verification_status = PaymentStatus.REJECTED
            payment.verification_message = exc.detail if isinstance(exc.detail, str) else "Verification request failed."
            raise

    await db.flush()
    await db.refresh(payment)
    return _response(payment)


@router.post("/{payment_id}/verify-url", response_model=PaymentResponse)
async def verify_payment_url(
    payment_id: uuid.UUID,
    payload: PaymentVerifyUrl,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> PaymentResponse:
    payment = await _load_payment(db, payment_id)
    payment.receipt_url = str(payload.receipt_url)
    payment.verification_status = PaymentStatus.VERIFYING
    response = await _verify_url(str(payload.receipt_url), str(payment.id))
    await _apply_verification(payment, response, admin, db)
    await db.flush()
    await db.refresh(payment)
    return _response(payment)


@router.post("/{payment_id}/verify-image", response_model=PaymentResponse)
async def verify_payment_image(
    payment_id: uuid.UUID,
    file: Annotated[UploadFile, File(...)],
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(require_admin)],
) -> PaymentResponse:
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP receipt image.")
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Receipt image is too large. Keep it below 3.5 MB.")

    payment = await _load_payment(db, payment_id)
    payment.verification_status = PaymentStatus.VERIFYING
    response = await _verify_image(data, str(payment.id))
    await _apply_verification(payment, response, admin, db, image=True)
    await db.flush()
    await db.refresh(payment)
    return _response(payment)
