from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = None

class UserIn(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "client"

class ConsultantIn(UserIn):
    license_number: str
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None
    biography: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    created_at: Optional[datetime]

class UserInDB(UserOut):
    hashed_password: str

class MessageCreate(BaseModel):
    recipient_id: str
    content: str

class MessageOut(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    created_at: datetime
    is_read: bool = False

class ConversationOut(BaseModel):
    other_user_id: str
    other_user_name: str
    other_user_role: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
