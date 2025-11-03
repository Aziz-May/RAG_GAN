from datetime import datetime, timedelta, timezone
from jose import jwt
from typing import Optional
from ..core.config import settings

ALGORITHM = "HS256"

def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {"sub": subject, "role": role}
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    return payload
