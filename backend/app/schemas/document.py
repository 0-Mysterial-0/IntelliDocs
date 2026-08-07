from pydantic import BaseModel
from typing import Optional, List
import uuid

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: str

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: uuid.UUID
    file_url: str
    
    model_config = {"from_attributes": True}

class PaginatedResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    page: int
    size: int
