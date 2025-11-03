from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import MessageCreate, MessageOut, ConversationOut
from ..db.mongo import get_database
from ..auth.deps import get_current_user
from bson import ObjectId
from datetime import datetime, timezone
from typing import List

router = APIRouter()


@router.post("/send", response_model=MessageOut)
async def send_message(message: MessageCreate, current_user=Depends(get_current_user)):
    """Send a message to another user (client or consultant)"""
    db = get_database()
    
    # Verify recipient exists
    try:
        recipient = await db.users.find_one({"_id": ObjectId(message.recipient_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid recipient ID")
    
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")
    
    # Create message document
    now = datetime.now(timezone.utc)
    message_doc = {
        "sender_id": str(current_user.get("_id")),
        "recipient_id": message.recipient_id,
        "content": message.content,
        "created_at": now,
        "is_read": False,
    }
    
    result = await db.messages.insert_one(message_doc)
    
    return {
        "id": str(result.inserted_id),
        "sender_id": message_doc["sender_id"],
        "recipient_id": message_doc["recipient_id"],
        "content": message_doc["content"],
        "created_at": message_doc["created_at"],
        "is_read": message_doc["is_read"],
    }


@router.get("/conversation/{other_user_id}", response_model=List[MessageOut])
async def get_conversation(other_user_id: str, current_user=Depends(get_current_user)):
    """Get all messages between current user and another user"""
    db = get_database()
    current_user_id = str(current_user.get("_id"))
    
    # Verify the other user exists
    try:
        other_user = await db.users.find_one({"_id": ObjectId(other_user_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID")
    
    if not other_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Find all messages between these two users
    messages = []
    async for msg in db.messages.find({
        "$or": [
            {"sender_id": current_user_id, "recipient_id": other_user_id},
            {"sender_id": other_user_id, "recipient_id": current_user_id}
        ]
    }).sort("created_at", 1):  # Sort by time ascending (oldest first)
        messages.append({
            "id": str(msg.get("_id")),
            "sender_id": msg.get("sender_id"),
            "recipient_id": msg.get("recipient_id"),
            "content": msg.get("content"),
            "created_at": msg.get("created_at"),
            "is_read": msg.get("is_read", False),
        })
    
    # Mark messages from other user as read
    await db.messages.update_many(
        {"sender_id": other_user_id, "recipient_id": current_user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return messages


@router.get("/conversations", response_model=List[ConversationOut])
async def get_conversations(current_user=Depends(get_current_user)):
    """Get all conversations for the current user"""
    db = get_database()
    current_user_id = str(current_user.get("_id"))
    
    # Find all unique users the current user has exchanged messages with
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender_id": current_user_id},
                    {"recipient_id": current_user_id}
                ]
            }
        },
        {
            "$project": {
                "other_user_id": {
                    "$cond": {
                        "if": {"$eq": ["$sender_id", current_user_id]},
                        "then": "$recipient_id",
                        "else": "$sender_id"
                    }
                },
                "content": 1,
                "created_at": 1,
                "is_read": 1,
                "recipient_id": 1
            }
        },
        {
            "$sort": {"created_at": -1}
        },
        {
            "$group": {
                "_id": "$other_user_id",
                "last_message": {"$first": "$content"},
                "last_message_time": {"$first": "$created_at"},
                "messages": {"$push": "$$ROOT"}
            }
        }
    ]
    
    conversations = []
    async for conv in db.messages.aggregate(pipeline):
        other_user_id = conv.get("_id")
        
        # Get other user details
        try:
            other_user = await db.users.find_one({"_id": ObjectId(other_user_id)})
        except Exception:
            continue
        
        if not other_user:
            continue
        
        # Count unread messages from this user
        unread_count = await db.messages.count_documents({
            "sender_id": other_user_id,
            "recipient_id": current_user_id,
            "is_read": False
        })
        
        conversations.append({
            "other_user_id": other_user_id,
            "other_user_name": other_user.get("name"),
            "other_user_role": other_user.get("role"),
            "last_message": conv.get("last_message"),
            "last_message_time": conv.get("last_message_time"),
            "unread_count": unread_count,
        })
    
    return conversations


@router.get("/unread-count")
async def get_unread_count(current_user=Depends(get_current_user)):
    """Get total unread message count for current user"""
    db = get_database()
    current_user_id = str(current_user.get("_id"))
    
    count = await db.messages.count_documents({
        "recipient_id": current_user_id,
        "is_read": False
    })
    
    return {"unread_count": count}


@router.put("/{message_id}/read")
async def mark_message_as_read(message_id: str, current_user=Depends(get_current_user)):
    """Mark a specific message as read"""
    db = get_database()
    current_user_id = str(current_user.get("_id"))
    
    try:
        result = await db.messages.update_one(
            {"_id": ObjectId(message_id), "recipient_id": current_user_id},
            {"$set": {"is_read": True}}
        )
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid message ID")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    
    return {"status": "success", "message": "Message marked as read"}
