from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import UserIn, UserOut, Token, ConsultantIn, UserLogin
from ..db.mongo import get_database
from passlib.context import CryptContext
from bson import ObjectId
from ..auth.jwt import create_access_token
from datetime import datetime, timezone
import sys

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


@router.post("/signup", response_model=UserOut)
async def signup(user: UserIn):
    db = get_database()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    print(f"Received password: '{user.password}', Length: {len(user.password.encode('utf-8'))}", file=sys.stderr)
    hashed = pwd_context.hash(user.password)
    now = datetime.now(timezone.utc)
    doc = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed,
        "role": user.role or "client",
        "created_at": now,
    }
    res = await db.users.insert_one(doc)
    return {
        "id": str(res.inserted_id),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc["role"],
        "created_at": doc["created_at"],
    }


@router.post("/login", response_model=Token)
async def login(form_data: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": form_data.email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not pwd_context.verify(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(str(user.get("_id")), user.get("role"))
    return {"access_token": access_token, "token_type": "bearer"}


# DEBUG ENDPOINT - Remove this in production
@router.get("/debug/users")
async def debug_list_users():
    db = get_database()
    users = []
    async for user in db.users.find({}):
        users.append({
            "id": str(user.get("_id")),
            "email": user.get("email"),
            "name": user.get("name"),
            "role": user.get("role"),
            "has_password": bool(user.get("hashed_password"))
        })
    return {"count": len(users), "users": users}
