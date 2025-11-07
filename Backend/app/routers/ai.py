import os
import importlib
import importlib.util
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from ..auth.deps import get_current_user
from typing import Optional
import sys, importlib, pathlib

router = APIRouter()

sys.modules.pop('app.services.gemini', None)  # remove the stub
path = pathlib.Path('app/services/gemini.py')  # relative to backend working dir
print(path.exists(), path)
spec = importlib.util.spec_from_file_location('_repair_gemini', str(path))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
print('attrs:', [a for a in dir(mod) if not a.startswith('__')])
# Re-register proper module name for later imports
sys.modules['app.services.gemini'] = mod


@router.post("/generate")
async def generate_career_image(
    dream_job: str = Form(...),
    name: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user),
):
    """Generate a transformed image using AI based on an uploaded photo and dream job.

    Returns a JSON payload with base64-encoded image for easy rendering on mobile.
    """
    # Lazy import the gemini service to avoid import-time errors masking real issues
    # First, try loading the gemini service module directly from the known file path to avoid namespace/package shadowing
    gemini_service = None
    try:
        services_dir = Path(__file__).resolve().parent.parent / "services"
        gemini_path = services_dir / "gemini.py"
        if gemini_path.exists():
            spec = importlib.util.spec_from_file_location("_tutore_gemini_service", str(gemini_path))
            if spec and spec.loader:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)  # type: ignore[attr-defined]
                gemini_service = mod
    except Exception as e:
        # We'll fall back to package import below, but keep this info if needed
        load_path_error = e

    if gemini_service is None:
        try:
            # Fallback: absolute package import
            gemini_service = importlib.import_module('app.services.gemini')
        except Exception as e:
            err_detail = f"AI service import error: {e}"
            try:
                # Include earlier path-load error if present
                if 'load_path_error' in locals():
                    err_detail += f"; file-load error: {load_path_error}"
            except Exception:
                pass
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=err_detail)

    # Determine provider from env; the service will self-validate when called
    provider = os.getenv("AI_PROVIDER", "gemini").lower()

    # Read reference image if provided
    reference_bytes = None
    if image is not None:
        try:
            reference_bytes = await image.read()
        except Exception:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image upload")

    # If provider requires an image, enforce it
    if provider == "freepik" and not reference_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reference image is required for Freepik provider")

    try:
        # Prefer base64 function if available
        gen_b64 = getattr(gemini_service, "generate_image_base64", None)
        if callable(gen_b64):
            b64 = gen_b64(
                child_name=name or current_user.get("name", ""),
                job_role=dream_job,
                ai_provider=provider,
                reference_image_bytes=reference_bytes,
            )
        else:
            # Fallback: call byte-generating function and encode here
            gen_bytes = getattr(gemini_service, "generate_image", None)
            if not callable(gen_bytes):
                available = [attr for attr in dir(gemini_service) if not attr.startswith("__")]
                mod_file = getattr(gemini_service, "__file__", "<unknown>")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"AI service missing generation functions. Module file: {mod_file}. Available: {available}"
                )
            data = gen_bytes(
                child_name=name or current_user.get("name", ""),
                job_role=dream_job,
                ai_provider=provider,
                reference_image_bytes=reference_bytes,
            )
            import base64 as _b64
            b64 = _b64.b64encode(data).decode("utf-8") if data else None

        if not b64:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI generation failed")
        # Default to PNG for data URI
        return {"image_base64": b64, "content_type": "image/png"}
    except HTTPException:
        raise
    except ValueError as e:
        # Configuration or input validation errors from the service
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/debug-module")
async def debug_gemini_module():
    """Return diagnostic info about the loaded gemini service module (file path and exported attrs)."""
    import importlib, importlib.util
    from pathlib import Path
    info = {}
    services_dir = Path(__file__).resolve().parent.parent / "services"
    gemini_path = services_dir / "gemini.py"
    info["expected_path"] = str(gemini_path)
    loaded = None
    try:
        if gemini_path.exists():
            spec = importlib.util.spec_from_file_location("_tutore_gemini_debug", str(gemini_path))
            if spec and spec.loader:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)  # type: ignore[attr-defined]
                loaded = mod
                info["direct_load_file"] = getattr(mod, "__file__", None)
                info["direct_load_attrs"] = [a for a in dir(mod) if not a.startswith("__")]
    except Exception as e:
        info["direct_load_error"] = str(e)

    # Package import attempt
    try:
        pkg_mod = importlib.import_module('app.services.gemini')
        info["package_import_file"] = getattr(pkg_mod, "__file__", None)
        info["package_import_attrs"] = [a for a in dir(pkg_mod) if not a.startswith("__")]
    except Exception as e:
        info["package_import_error"] = str(e)

    # Include config summary if available
    try:
        from app.services.gemini import Config as _Cfg
        info["config_summary"] = _Cfg.summary()
    except Exception as e:
        info["config_summary_error"] = str(e)
    return info
