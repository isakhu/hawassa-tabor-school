"""Schemas for school fee payments and payment verification."""
import uuid
from decimal import Decimal
from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl

from app.models.payment import PaymentStatus


class PaymentCreate(BaseModel):
    student_id: uuid.UUID
    expected_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    receipt_url: HttpUrl | None = None


class PaymentVerifyUrl(BaseModel):
    receipt_url: HttpUrl


class PaymentResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    student_name: str
    student_number: str
    expected_amount: Decimal
    amount: Decimal | None
    provider: str | None
    receipt_url: str | None
    receipt_reference: str | None
    payer_name: str | None
    transaction_status: str | None
    payment_date: str | None
    verification_status: PaymentStatus
    verification_message: str | None
    verified_at: datetime | None
    created_at: datetime
