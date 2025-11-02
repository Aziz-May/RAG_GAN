from fastapi import APIRouter, Depends , HTTPException, status
from ..auth.deps import get_current_user

router = APIRouter()

@router.get('/me')
async def read_current_client(current_user = Depends(get_current_user)):
    # return basic safe info
    if current_user.get('role') != 'client':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User does not have the required role")
    
    return {
        'id': str(current_user.get('_id')),
        'name': current_user.get('name'),
        'email': current_user.get('email'),
        'role': current_user.get('role')
    }
