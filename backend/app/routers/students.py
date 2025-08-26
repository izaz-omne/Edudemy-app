from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models import Student
from ..schemas import StudentCreate, StudentRead
from ..core.deps import require_role

router = APIRouter(prefix="/students", tags=["students"])

@router.post('/', response_model=StudentRead)
def create_student(payload: StudentCreate, session: Session = Depends(get_session), _=Depends(require_role('admin','academic'))):
    st = Student(**payload.dict())
    session.add(st)
    session.commit()
    session.refresh(st)
    return st

@router.get('/', response_model=list[StudentRead])
def list_students(session: Session = Depends(get_session), _=Depends(require_role('admin','teacher','academic'))):
    stmt = select(Student)
    res = session.exec(stmt).all()
    return res

@router.get('/{student_id}', response_model=StudentRead)
def get_student(student_id: int, session: Session = Depends(get_session), _=Depends(require_role('admin','teacher','academic'))):
    st = session.get(Student, student_id)
    if not st:
        raise HTTPException(status_code=404, detail='Not found')
    return st