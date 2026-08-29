"""Academic administration and school-structure workflow endpoints."""
import secrets
import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user, require_admin
from app.core.database import get_db
from app.core.security import hash_password
from app.models.academic import CurriculumSubject, Subject, TeacherAssignment
from app.models.class_model import ClassEnrollment, SchoolClass
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import Role, User

router = APIRouter(prefix="/academic", tags=["Academic Administration"])

class SubjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=30)
class CurriculumCreate(BaseModel):
    grade_level: str = Field(pattern=r"^(?:[1-9]|1[0-2])$")
    subject_id: uuid.UUID
    academic_year: str = Field(min_length=4, max_length=20)
class ClassCreateAcademic(BaseModel):
    grade_level: str = Field(pattern=r"^(?:[1-9]|1[0-2])$")
    section: str = Field(min_length=1, max_length=20)
    academic_year: str = Field(min_length=4, max_length=20)
    class_head_id: uuid.UUID | None = None
    room_number: str | None = None
class AssignmentCreate(BaseModel):
    class_id: uuid.UUID
    subject_id: uuid.UUID
    teacher_id: uuid.UUID
    academic_year: str = Field(min_length=4, max_length=20)
class StudentRegistration(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    student_number: str = Field(min_length=2, max_length=50)
    date_of_birth: str | None = None
    guardian_name: str | None = None
    guardian_contact: str | None = None
class TeacherRegistration(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    teacher_number: str | None = Field(default=None, max_length=50)
    subject_specialization: str = Field(min_length=2, max_length=100)
    department: str | None = Field(default=None, max_length=100)
    phone_number: str | None = Field(default=None, max_length=50)

async def _teacher(teacher_id: uuid.UUID, db: AsyncSession) -> Teacher:
    teacher = (await db.execute(select(Teacher).where(Teacher.id == teacher_id))).scalar_one_or_none()
    if not teacher: raise HTTPException(404, "Teacher not found")
    return teacher
async def _school_class(class_id: uuid.UUID, db: AsyncSession) -> SchoolClass:
    school_class = (await db.execute(select(SchoolClass).where(SchoolClass.id == class_id))).scalar_one_or_none()
    if not school_class: raise HTTPException(404, "Class not found")
    return school_class

@router.post("/teachers/register", status_code=status.HTTP_201_CREATED)
async def register_teacher(payload: TeacherRegistration, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    teacher_number = payload.teacher_number or f"TCH-{secrets.token_hex(4).upper()}"
    if (await db.execute(select(Teacher).where(Teacher.teacher_number == teacher_number))).scalar_one_or_none(): raise HTTPException(409, "Teacher number already exists")
    login_code = secrets.token_urlsafe(8)
    login_id = f"teacher-{teacher_number.lower()}@educore.local"
    user = User(full_name=payload.full_name.strip(), email=login_id, password_hash=hash_password(login_code), role=Role.TEACHER, is_active=True)
    db.add(user); await db.flush()
    teacher = Teacher(user_id=user.id, teacher_number=teacher_number, subject_specialization=payload.subject_specialization.strip(), department=payload.department, phone_number=payload.phone_number)
    db.add(teacher); await db.flush(); await db.commit()
    return {"message":"Teacher registered", "teacher_id":str(teacher.id), "teacher_number":teacher_number, "full_name":user.full_name, "login_id":login_id, "login_code":login_code}

@router.get("/teachers")
async def list_teachers(db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    result = await db.execute(select(Teacher, User).join(User, User.id == Teacher.user_id).where(User.is_active.is_(True)).order_by(User.full_name))
    return [{"id":str(t.id), "teacher_number":t.teacher_number, "full_name":u.full_name, "specialization":t.subject_specialization, "department":t.department} for t,u in result.all()]

@router.post("/subjects", status_code=status.HTTP_201_CREATED)
async def create_subject(payload: SubjectCreate, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    code = payload.code.strip().upper()
    if (await db.execute(select(Subject).where(Subject.code == code))).scalar_one_or_none(): raise HTTPException(409, "Subject code already exists")
    subject = Subject(name=payload.name.strip(), code=code); db.add(subject); await db.flush(); await db.commit()
    return {"id":str(subject.id), "name":subject.name, "code":subject.code}

@router.get("/subjects")
async def list_subjects(db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(get_current_user)]):
    result = await db.execute(select(Subject).where(Subject.is_active.is_(True)).order_by(Subject.name))
    return [{"id":str(s.id), "name":s.name, "code":s.code} for s in result.scalars().all()]

@router.post("/curriculum", status_code=status.HTTP_201_CREATED)
async def add_curriculum_subject(payload: CurriculumCreate, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    if not await db.get(Subject, payload.subject_id): raise HTTPException(404, "Subject not found")
    existing = await db.execute(select(CurriculumSubject).where(CurriculumSubject.grade_level == payload.grade_level, CurriculumSubject.subject_id == payload.subject_id, CurriculumSubject.academic_year == payload.academic_year))
    if existing.scalar_one_or_none(): raise HTTPException(409, "Subject is already in this grade curriculum")
    item = CurriculumSubject(**payload.model_dump()); db.add(item); await db.flush(); await db.commit()
    return {"id":str(item.id), "grade_level":item.grade_level, "subject_id":str(item.subject_id), "academic_year":item.academic_year}

@router.get("/curriculum/{grade_level}")
async def grade_curriculum(grade_level: str, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(get_current_user)]):
    if not grade_level.isdigit() or not 1 <= int(grade_level) <= 12: raise HTTPException(422, "Grade level must be between 1 and 12")
    result = await db.execute(select(CurriculumSubject, Subject).join(Subject, Subject.id == CurriculumSubject.subject_id).where(CurriculumSubject.grade_level == grade_level, CurriculumSubject.is_active.is_(True)).order_by(Subject.name))
    return [{"id":str(r.CurriculumSubject.id), "subject_id":str(r.Subject.id), "name":r.Subject.name, "code":r.Subject.code, "academic_year":r.CurriculumSubject.academic_year} for r in result.all()]

@router.post("/classes", status_code=status.HTTP_201_CREATED)
async def create_academic_class(payload: ClassCreateAcademic, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    if payload.class_head_id: await _teacher(payload.class_head_id, db)
    if (await db.execute(select(SchoolClass).where(SchoolClass.grade_level == payload.grade_level, SchoolClass.section == payload.section.upper(), SchoolClass.academic_year == payload.academic_year))).scalar_one_or_none(): raise HTTPException(409, "That grade and section already exists")
    school_class = SchoolClass(class_name=f"Grade {payload.grade_level}{payload.section.upper()}", grade_level=payload.grade_level, section=payload.section.upper(), academic_year=payload.academic_year, room_number=payload.room_number, class_head_id=payload.class_head_id, teacher_id=payload.class_head_id)
    db.add(school_class); await db.flush(); await db.commit()
    return {"id":str(school_class.id), "class_name":school_class.class_name, "class_head_id":str(school_class.class_head_id) if school_class.class_head_id else None}

@router.get("/classes")
async def list_classes(db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    result = await db.execute(select(SchoolClass).where(SchoolClass.is_active.is_(True)).order_by(SchoolClass.grade_level, SchoolClass.section))
    return [{"id":str(c.id), "class_name":c.class_name, "grade_level":c.grade_level, "section":c.section, "academic_year":c.academic_year, "class_head_id":str(c.class_head_id) if c.class_head_id else None} for c in result.scalars().all()]

@router.put("/classes/{class_id}/head")
async def assign_class_head(class_id: uuid.UUID, teacher_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    school_class = await _school_class(class_id, db); teacher = await _teacher(teacher_id, db)
    school_class.class_head_id = teacher.id; school_class.teacher_id = teacher.id; await db.commit()
    return {"message":"Class head assigned", "class_id":str(class_id), "teacher_id":str(teacher.id)}

@router.post("/assignments", status_code=status.HTTP_201_CREATED)
async def assign_subject_teacher(payload: AssignmentCreate, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(require_admin)]):
    await _school_class(payload.class_id, db); await _teacher(payload.teacher_id, db)
    if not await db.get(Subject, payload.subject_id): raise HTTPException(404, "Subject not found")
    existing = await db.execute(select(TeacherAssignment).where(TeacherAssignment.class_id == payload.class_id, TeacherAssignment.subject_id == payload.subject_id, TeacherAssignment.academic_year == payload.academic_year))
    if existing.scalar_one_or_none(): raise HTTPException(409, "This subject already has a teacher for this class")
    assignment = TeacherAssignment(**payload.model_dump()); db.add(assignment); await db.flush(); await db.commit()
    return {"id":str(assignment.id), "class_id":str(assignment.class_id), "subject_id":str(assignment.subject_id), "teacher_id":str(assignment.teacher_id)}

@router.get("/classes/{class_id}/assignments")
async def list_class_assignments(class_id: uuid.UUID, db: Annotated[AsyncSession, Depends(get_db)], _: Annotated[User, Depends(get_current_user)]):
    await _school_class(class_id, db)
    result = await db.execute(select(TeacherAssignment, Subject, Teacher, User).join(Subject, Subject.id == TeacherAssignment.subject_id).join(Teacher, Teacher.id == TeacherAssignment.teacher_id).join(User, User.id == Teacher.user_id).where(TeacherAssignment.class_id == class_id, TeacherAssignment.is_active.is_(True)))
    return [{"id":str(a.id), "subject_id":str(s.id), "subject":s.name, "subject_code":s.code, "teacher_id":str(t.id), "teacher":u.full_name, "academic_year":a.academic_year} for a,s,t,u in result.all()]

@router.post("/classes/{class_id}/students", status_code=status.HTTP_201_CREATED)
async def register_student(class_id: uuid.UUID, payload: StudentRegistration, db: Annotated[AsyncSession, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    school_class = await _school_class(class_id, db)
    if current_user.role != Role.ADMIN:
        teacher = (await db.execute(select(Teacher).where(Teacher.user_id == current_user.id))).scalar_one_or_none()
        if not teacher or school_class.class_head_id != teacher.id: raise HTTPException(403, "Only the assigned class head can register students in this class")
    if (await db.execute(select(Student).where(Student.student_number == payload.student_number))).scalar_one_or_none(): raise HTTPException(409, "Student number already exists")
    login_code = f"STU-{secrets.token_hex(4).upper()}"
    user = User(full_name=payload.full_name.strip(), email=f"student-{uuid.uuid4()}@educore.local", password_hash=hash_password(login_code), role=Role.STUDENT, is_active=True); db.add(user); await db.flush()
    student = Student(user_id=user.id, student_number=payload.student_number, grade_level=school_class.grade_level, section=school_class.section, guardian_name=payload.guardian_name, guardian_contact=payload.guardian_contact); db.add(student); await db.flush()
    db.add(ClassEnrollment(class_id=class_id, student_id=student.id)); await db.commit()
    return {"message":"Student registered", "student_id":str(student.id), "full_name":user.full_name, "login_id":user.email, "login_code":login_code, "class_id":str(class_id)}
