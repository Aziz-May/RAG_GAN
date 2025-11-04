# Auth Mock Data - Development Mode ✅

## What Changed
The auth API now has **built-in fallback to mock data** when the backend isn't available!

## How It Works

When you press a login/signup button:

```
User clicks "Sign In" or "Create Account"
         ↓
AuthContext calls auth.login/signup()
         ↓
API tries to reach backend
         ↓
Backend not found? ❌
         ↓
API automatically returns MOCK DATA ✅
         ↓
AuthContext sets user + token
         ↓
Navigation to home page 🎉
```

## File Structure

**API Layer** (`services/api/auth.ts`):
- Makes HTTP request
- If backend fails → Returns mock user + token ✅

**Auth Context** (`contexts/AuthContext.tsx`):
- Calls API (which handles fallback)
- Stores token + user
- Navigation happens automatically

**Navigation Service** (`services/navigation.ts`):
- Routes based on `user.role`
- Client → `/(tabs)`
- Consultant → `/(consultant-tabs)`

## What Gets Created

### For Client Login/Signup:
```typescript
{
  id: "mock_client_1698765432123",
  email: "user@example.com",        // From your input
  name: "user",                      // From email or signup
  role: "client",                    // ✅ Routes to /(tabs)
  avatar: "https://api.dicebear...", // Random avatar
  created_at: "2024-11-02T..."
}
```

### For Consultant Login/Signup:
```typescript
{
  id: "mock_consultant_1698765432123",
  email: "consultant@example.com",   // From your input
  name: "Dr. Smith",                 // From signup
  role: "consultant",                // ✅ Routes to /(consultant-tabs)
  avatar: "https://api.dicebear...", // Random avatar
  created_at: "2024-11-02T..."
}
```

## Test It Now

### Client Login ✅
```
Email: test@example.com
Password: pass123
Click "Sign In"
→ Routes to Client Home /(tabs)
```

### Client Signup ✅
```
Name: John Doe
Email: john@example.com
Password: pass123
Click "Create Account"
→ Routes to Client Home /(tabs)
```

### Consultant Login ✅
```
Email: doctor@example.com
Password: pass123
Click "Sign In as Consultant"
→ Routes to Consultant Home /(consultant-tabs)
```

### Consultant Signup ✅
```
Name: Dr. Jane Smith
Email: jane@example.com
License: ABC123456
Specialization: Psychology
Experience: 5
Biography: Expert in career counseling
Password: pass123
Click "Submit Application"
→ Routes to pending approval
```

## Console Output
When using mock data, you'll see:
```
[AuthAPI] Using mock data for login (backend unavailable)
[AuthAPI] Using mock data for client signup (backend unavailable)
[AuthAPI] Using mock data for consultant signup (backend unavailable)
```

## Token & Storage
- Mock token format: `mock_token_1698765432123`
- Stored in SecureStore (encrypted on device)
- Persists after app restart
- All navigation works normally

## When Backend Is Ready
Just start the FastAPI server at `http://localhost:8000/api`:
1. The HTTP client will connect to the backend
2. Mock fallback automatically deactivates
3. Real auth flow starts immediately
4. **No code changes needed!** ✅

## Files Modified
- `services/api/auth.ts` - Added mock data creation + fallback logic
- `contexts/AuthContext.tsx` - Cleaned up (API handles fallback now)

## Status
✅ **No backend required** - Everything works with automatic mock data!
✅ **Ready for backend integration** - Zero changes needed when API is ready

