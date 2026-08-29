"""Student portal for high-school profiles, approved results and result PDFs."""
from collections import defaultdict
from io import BytesIO
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User, Role
from app.models.student import Student
from app.models.class_model import ClassEnrollment
from app.models.academic import CurriculumSubject
from app.models.grade import Grade, GradeStatus
from app.utils.grading import calculate_grade_letter

router = APIRouter(prefix="/student-portal", tags=["Student Portal"])
SCHOOL_NAME = "Hawassa Tabor Secondary School"

async def _student(db: AsyncSession, user: User) -> Student:
    if user.role != Role.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student access required.")
    result = await db.execute(select(Student).where(Student.user_id == user.id).options(selectinload(Student.user)))
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return student

async def _final_result(db: AsyncSession, student: Student):
    result = await db.execute(select(Grade).where(Grade.student_id == student.id, Grade.status == GradeStatus.APPROVED).options(selectinload(Grade.subject)).order_by(Grade.subject_id, Grade.created_at))
    grades = result.scalars().all()
    if not grades:
        return [], 0.0, None
    academic_year = grades[-1].academic_year
    curriculum_result = await db.execute(select(CurriculumSubject).where(CurriculumSubject.grade_level == student.grade_level, CurriculumSubject.academic_year == academic_year, CurriculumSubject.is_active.is_(True)).options(selectinload(CurriculumSubject.subject)))
    required_items = curriculum_result.scalars().all()
    required = {item.subject_id: item.subject for item in required_items}
    grouped: dict = defaultdict(list)
    for grade in grades:
        grouped[grade.subject_id].append(grade)
    if required:
        missing = [subject.name for sid, subject in required.items() if sid not in grouped]
        if missing:
            raise HTTPException(status_code=409, detail={"message": "Final result is not ready. All curriculum subjects must be approved by the class head.", "missing_subjects": sorted(missing)})
    subjects = required if required else {g.subject_id: g.subject for g in grades}
    rows = []
    for subject_id, subject in subjects.items():
        subject_grades = grouped.get(subject_id, [])
        total_score = sum(g.score for g in subject_grades)
        total_max = sum(g.max_score for g in subject_grades)
        average = round((total_score / total_max) * 100, 2) if total_max else 0.0
        rows.append({"subject_id": subject_id, "subject_code": subject.code, "subject_name": subject.name, "average": average, "grade": calculate_grade_letter(average)})
    rows.sort(key=lambda item: item["subject_name"].lower())
    overall_average = round(sum(row["average"] for row in rows) / len(rows), 2) if rows else 0.0
    return rows, overall_average, academic_year

@router.get("/me")
async def profile(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    student = await _student(db, current_user)
    result = await db.execute(select(ClassEnrollment).where(ClassEnrollment.student_id == student.id).options(selectinload(ClassEnrollment.school_class)))
    enrollments = result.scalars().all()
    return {"id": student.id, "student_number": student.student_number, "full_name": student.user.full_name, "grade_level": student.grade_level, "section": student.section, "classes": [{"id": e.school_class.id, "name": e.school_class.class_name, "academic_year": e.school_class.academic_year} for e in enrollments]}

@router.get("/grades")
async def grades(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    student = await _student(db, current_user)
    result = await db.execute(select(Grade).where(Grade.student_id == student.id, Grade.status == GradeStatus.APPROVED).options(selectinload(Grade.subject)).order_by(Grade.term, Grade.created_at.desc()))
    return result.scalars().all()

@router.get("/results")
async def results(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    student = await _student(db, current_user)
    rows, overall_average, academic_year = await _final_result(db, student)
    return {"student_id": student.id, "student_number": student.student_number, "student_name": student.user.full_name, "school_name": SCHOOL_NAME, "grade_level": student.grade_level, "section": student.section, "academic_year": academic_year, "subjects": rows, "total": round(sum(row["average"] for row in rows), 2), "overall_average": overall_average, "overall_grade": calculate_grade_letter(overall_average) if rows else None}

def _pdf_escape(value: object) -> str:
    return str(value).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

def _make_pdf(lines: list[str]) -> bytes:
    parts = ["BT", "/F1 11 Tf", "50 790 Td"]
    for index, line in enumerate(lines):
        if index: parts.append("0 -18 Td")
        parts.append(f"({_pdf_escape(line)}) Tj")
    parts.append("ET")
    stream = "\n".join(parts).encode("latin-1", "replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]
    pdf = BytesIO(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(pdf.tell()); pdf.write(f"{number} 0 obj\n".encode()); pdf.write(obj); pdf.write(b"\nendobj\n")
    xref = pdf.tell(); pdf.write(f"xref\n0 {len(objects)+1}\n".encode()); pdf.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]: pdf.write(f"{offset:010d} 00000 n \n".encode())
    pdf.write(f"trailer\n<< /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode())
    return pdf.getvalue()

@router.get("/results/pdf")
async def download_result_pdf(db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    student = await _student(db, current_user)
    rows, overall_average, academic_year = await _final_result(db, student)
    if not rows:
        raise HTTPException(status_code=409, detail="Final result is not ready because there are no approved subject grades.")
    total = round(sum(row["average"] for row in rows), 2)
    lines = [SCHOOL_NAME, "FINAL STUDENT RESULT", f"Student Name: {student.user.full_name}", f"Student Number: {student.student_number}", f"Grade: {student.grade_level}    Section: {student.section}", f"Academic Year: {academic_year or '-'}", "", "Subject                         Average       Grade", "----------------------------------------------------"]
    for row in rows:
        lines.append(f"{row['subject_name'][:28]:28} {row['average']:>8.2f}       {row['grade']}")
    lines.extend(["----------------------------------------------------", f"Total: {total:.2f}", f"Overall Average: {overall_average:.2f}", "", "Only class-head-approved subject grades are included in this report."])
    return Response(content=_make_pdf(lines), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{student.student_number}_final_result.pdf"'})
