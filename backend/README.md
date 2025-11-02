# Tutore - Backend (FastAPI)

This folder contains a minimal FastAPI backend scaffold for the Tutore project.

Goals implemented in scaffold:
- FastAPI app with CORS and middleware
- MongoDB connection using Motor (async)
- JWT authentication (python-jose) with role claim (client/consultant)
- Password hashing with passlib
- Role-aware dependencies for route protection
- Placeholder RAG service to be implemented later
- Tests scaffold (pytest) with dependency overrides

Quick start (local development):

1. Create a Python venv and activate it.

2. Install dependencies:

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

3. Copy and edit `.env.example` to `.env` and set values (SECRET_KEY, MONGO_URL).

4. Start the app:

```powershell
# from Backend/ folder
uvicorn app.main:app --reload --port 8000
```

5. Run tests:

```powershell
pytest -q
```

Notes & best practices included in README:
- Use environment variables for secrets
- Keep separate DBs for test/dev/prod
- Use dependency injection to replace DB in tests
- Add HTTPS / reverse proxy (nginx) for production
- Rotate SECRET_KEY and use short-lived access tokens

This scaffold is intentionally minimal — adapt and harden for production workloads (monitoring, rate limiting, schema validation, error reporting).