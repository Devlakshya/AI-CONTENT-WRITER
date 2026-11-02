from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.auth.security import get_current_user
from app.database.session import get_sync_db
from app.models import KnowledgeBase, Document
from sqlalchemy.orm import Session
import shutil
import os
from app.tasks.rag_tasks import process_document

router = APIRouter()


@router.post('/knowledge-bases', status_code=201)
def create_kb(name: str, workspace_id: int, db: Session = Depends(get_sync_db), user=Depends(get_current_user)):
    kb = KnowledgeBase(name=name, workspace_id=workspace_id, owner_id=user.id)
    db.add(kb)
    db.commit()
    db.refresh(kb)
    return {'id': kb.id, 'name': kb.name}


@router.post('/knowledge-bases/{kb_id}/upload')
def upload_document(kb_id: int, file: UploadFile = File(...), db: Session = Depends(get_sync_db), user=Depends(get_current_user)):
    # basic validation
    allowed = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown']
    if file.content_type not in allowed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Unsupported file type')

    upload_dir = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, file.filename)
    with open(filepath, 'wb') as out:
        shutil.copyfileobj(file.file, out)

    doc = Document(knowledge_base_id=kb_id, title=file.filename, filename=file.filename, content_type=file.content_type, uploaded_by=user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # enqueue processing
    process_document.delay(doc.id, filepath, file.content_type)

    return {'id': doc.id, 'filename': doc.filename}
