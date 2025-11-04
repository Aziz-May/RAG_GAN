from fastapi import APIRouter, Depends, HTTPException, status
from ..auth.deps import get_current_user
from ..db.mongo import get_database
from ..schemas import ConsultantListOut
from typing import List

router = APIRouter()

@router.get('/me')
async def read_current_consultant(current_user = Depends(get_current_user)):
    # Check if user is a consultant
    if current_user.get('role') != 'consultant':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have the required role")
    
    return {
        'id': str(current_user.get('_id')),
        'name': current_user.get('name'),
        'email': current_user.get('email'),
        'role': current_user.get('role')
    }


@router.get('/list', response_model=List[ConsultantListOut])
async def list_consultants(current_user = Depends(get_current_user)):
    """Return a lightweight list of all consultants users."""
    db = get_database()
    items: List[ConsultantListOut] = []
    async for u in db.users.find({"role": "consultant"}).sort("name", 1):
        items.append(ConsultantListOut(
            id=str(u.get("_id")),
            name=u.get("name", ""),
            email=u.get("email", ""),
            role=u.get("role", "consultant"),
            bio=u.get("bio", ""),
        ))
    return items
