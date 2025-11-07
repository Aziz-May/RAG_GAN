from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import UserIn, UserOut, Token, ConsultantIn, UserLogin, UserUpdate
from ..db.mongo import get_database
from passlib.context import CryptContext
from bson import ObjectId
from ..auth.jwt import create_access_token
from datetime import datetime, timezone
import sys
from ..auth.deps import get_current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


@router.post("/signup", response_model=UserOut)
async def signup(user: UserIn):
    db = get_database()
    # Normalize email (lowercase, strip)
    normalized_email = user.email.strip().lower()
    existing = await db.users.find_one({"email": normalized_email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    print(f"Received password: '{user.password}', Length: {len(user.password.encode('utf-8'))}", file=sys.stderr)
    hashed = pwd_context.hash(user.password)
    now = datetime.now(timezone.utc)
    doc = {
        "name": user.name,
        "email": normalized_email,
        "hashed_password": hashed,
        "role": user.role or "client",
        "phone": user.phone,
        "school": user.school or "",
        "dream_job": user.dream_job or "",
        "bio": user.bio or "",
        "created_at": now,
    }
    res = await db.users.insert_one(doc)
    return {
        "id": str(res.inserted_id),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc["role"],
        "phone": doc.get("phone"),
        "school": doc.get("school"),
        "dream_job": doc.get("dream_job"),
        "bio": doc.get("bio"),
        "created_at": doc["created_at"],
    }


@router.post("/login", response_model=Token)
async def login(form_data: UserLogin):
    db = get_database()
    # Normalize email to match storage
    normalized_email = form_data.email.strip().lower()
    user = await db.users.find_one({"email": normalized_email})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not pwd_context.verify(form_data.password, user.get("hashed_password")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(str(user.get("_id")), user.get("role"))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return {
        "id": str(current_user.get("_id")),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "phone": current_user.get("phone"),
        "school": current_user.get("school", ""),
        "dream_job": current_user.get("dream_job", ""),
        "bio": current_user.get("bio", ""),
        "created_at": current_user.get("created_at"),
    }


@router.patch("/me", response_model=UserOut)
async def update_me(update: UserUpdate, current_user=Depends(get_current_user)):
    """Partially update the current user's profile."""
    db = get_database()
    fields = {}
    for k, v in update.model_dump(exclude_unset=True).items():
        if v is not None:
            fields[k] = v
    if not fields:
        # Nothing to update, return current
        return await get_me(current_user)
    # Apply update
    await db.users.update_one({"_id": current_user.get("_id")}, {"$set": fields})
    # Merge for response
    for k, v in fields.items():
        current_user[k] = v
    return {
        "id": str(current_user.get("_id")),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "phone": current_user.get("phone"),
        "school": current_user.get("school", ""),
        "dream_job": current_user.get("dream_job", ""),
        "bio": current_user.get("bio", ""),
        "created_at": current_user.get("created_at"),
    }


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
