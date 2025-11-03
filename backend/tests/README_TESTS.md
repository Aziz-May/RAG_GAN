# 🧪 Automated Message System Tests

Say goodbye to Postman! This automated test suite tests all your message endpoints.

## 📋 What Gets Tested

✅ **User Setup**
- Creating consultant and client accounts
- Authentication and token generation

✅ **Messaging**
- Sending messages from client to consultant
- Sending messages from consultant to client
- Multiple messages back and forth

✅ **Conversations**
- Retrieving conversation history
- Correct message ordering (oldest first)
- Both users can see the same conversation

✅ **Read Status**
- Unread message count
- Marking messages as read
- Auto-marking on conversation view

✅ **Error Handling**
- Invalid user IDs
- Non-existent recipients
- Missing authentication
- Unauthorized access

## 🚀 Quick Start

### Option 1: Run with Python
```powershell
python run_tests.py
```

### Option 2: Run with Batch File
```powershell
.\run_message_tests.bat
```

### Option 3: Run Directly with Pytest
```powershell
pytest tests/test_messages.py -v -s
```

## 📦 Installation

Make sure you have the required packages:
```powershell
pip install -r requirements.txt
```

## 🔍 Test Details

The test suite creates:
- 1 Consultant account (Dr. Sarah Johnson)
- 1 Client account (John Doe)
- Multiple messages exchanged between them
- Tests all 7 message endpoints

### Endpoints Covered:
1. `POST /messages/send` - Send a message
2. `GET /messages/conversation/{user_id}` - Get conversation
3. `GET /messages/conversations` - List all conversations
4. `GET /messages/unread-count` - Get unread count
5. `PUT /messages/{message_id}/read` - Mark as read

## 📊 Output

You'll see detailed output like:
```
✓ Consultant created: 507f1f77bcf86cd799439011
✓ Client created: 507f191e810c19729de860ea
✓ Message sent from client to consultant: 507f1f77bcf86cd799439012
✓ Retrieved 6 messages in conversation
✓ Client has 1 conversation(s)
  - With: Dr. Sarah Johnson (consultant)
  - Unread: 3
```

## 🎯 Run Specific Tests

```powershell
# Run only one test
pytest tests/test_messages.py::test_send_message_client_to_consultant -v

# Run with more detail
pytest tests/test_messages.py -vv -s

# Stop on first failure
pytest tests/test_messages.py -x
```

## ⚙️ Requirements

- Python 3.8+
- FastAPI application running
- MongoDB connection configured
- All packages from requirements.txt

## 💡 Tips

- Tests run in order (using pytest-order)
- Each test builds on previous ones
- Users are created fresh each run
- Check output for detailed status messages
- Tests are independent of Postman!

## 🐛 Troubleshooting

**Tests fail with connection error?**
- Make sure your FastAPI app is running
- Check MongoDB is accessible
- Verify .env configuration

**Import errors?**
- Run: `pip install -r requirements.txt`
- Make sure pytest-order is installed

**Authentication issues?**
- Check JWT settings in config
- Verify token expiration times
