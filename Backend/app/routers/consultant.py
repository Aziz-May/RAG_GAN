from fastapi import APIRouter, Depends, HTTPException, status
from ..auth.deps import get_current_user

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
