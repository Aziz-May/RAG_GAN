"""
Standalone module for generating AI-transformed images of children as future professionals.
Supports both Google Gemini and Freepik (Nano Banana) APIs.

Usage:
    from generate_photo import generate_image

    image_data = generate_image(
        child_name="John",
        job_role="Doctor",
        ai_provider="gemini",  # or "freepik"
        reference_image_bytes=None  # Required for freepik, optional for gemini
    )
"""

import os
import base64
import time
import requests
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Robust .env loading: try current working dir, then traverse up from this file.
_dot_env = find_dotenv(usecwd=True) or find_dotenv(filename=".env")
if _dot_env:
    load_dotenv(_dot_env)
else:
    # Fallback to default behavior (may still succeed if running from project root)
    load_dotenv()


class Config:
    """Configuration for image generation services."""

    # API Keys
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    freepik_api_key: str = os.getenv("FREEPIK_API_KEY", "")

    # AI Provider Selection
    ai_provider: str = os.getenv("AI_PROVIDER", "gemini").lower()  # "gemini" or "freepik"

    # Optional: Email settings (if you want to send results)
    sendgrid_api_key: str = os.getenv("SENDGRID_API_KEY", "")
    sendgrid_from_email: str = os.getenv("SENDGRID_FROM_EMAIL", "")

    # File output settings
    output_dir: str = os.getenv("OUTPUT_DIR", "./generated_images")

    @classmethod
    def validate(cls):
        """Validate required configuration."""
        if cls.ai_provider == "gemini":
            if not cls.gemini_api_key:
                raise ValueError("GEMINI_API_KEY missing (provider=gemini). Set AI_PROVIDER=freepik if you intend to use Freepik.")
        elif cls.ai_provider == "freepik":
            if not cls.freepik_api_key:
                raise ValueError("FREEPIK_API_KEY missing for Freepik provider.")
        else:
            raise ValueError(f"Unknown AI_PROVIDER '{cls.ai_provider}'. Use 'gemini' or 'freepik'.")

    @classmethod
    def summary(cls) -> dict:
        """Return a non-sensitive summary of config for debugging."""
        return {
            "ai_provider": cls.ai_provider,
            "has_gemini_key": bool(cls.gemini_api_key),
            "has_freepik_key": bool(cls.freepik_api_key),
            "output_dir": cls.output_dir,
        }


class GeminiImageGenerator:
    """Generate images using Google Gemini 2.5 Flash Image API."""

    def __init__(self, api_key: str):
        """Initialize Gemini service."""
        from google import genai
        from google.genai import types

        self.genai = genai
        self.types = types
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash-image"

    def generate(
        self,
        child_name: str,
        job_role: str,
        image_format: str = "PNG"
    ) -> Optional[bytes]:
        """
        Generate a transformed image using Gemini.

        Args:
            child_name: Child's first name
            job_role: Desired job role
            image_format: Output format (PNG, JPEG)

        Returns:
            Image data as bytes, or None if generation fails
        """
        try:
            prompt = self._create_prompt(child_name, job_role, image_format)

            contents = [
                self.types.Content(
                    role="user",
                    parts=[
                        self.types.Part.from_text(text=prompt),
                    ],
                ),
            ]

            generate_content_config = self.types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            )

            # Generate image using streaming
            image_data = None
            for chunk in self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            ):
                if (
                    chunk.candidates is None
                    or chunk.candidates[0].content is None
                    or chunk.candidates[0].content.parts is None
                ):
                    continue

                # Extract image data from inline_data
                if (
                    chunk.candidates[0].content.parts[0].inline_data
                    and chunk.candidates[0].content.parts[0].inline_data.data
                ):
                    inline_data = chunk.candidates[0].content.parts[0].inline_data
                    image_data = inline_data.data
                    print(f"✅ Image generated successfully with Gemini for {child_name}")
                    break

            return image_data

        except Exception as e:
            print(f"❌ Error generating image with Gemini: {str(e)}")
            raise

    @staticmethod
    def _create_prompt(child_name: str, job_role: str, image_format: str) -> str:
        """Create a detailed prompt for Gemini image generation."""
        return f"""Generate a highly detailed, vibrant, and realistic illustration of the same child, aged between 3 and 12 years old, shown as their future self at around 30 years old in their dream job as a {job_role}. Preserve the child's distinctive facial features, hairstyle, and expression so it is clearly the same person. They should be dressed in professional attire suited to {job_role}, placed in a realistic, colorful environment related to that profession — for example, a lab, space station, creative studio, or workplace relevant to {job_role}. Emphasize a clear, lifelike face with strong detail, while the background reflects a cheerful yet professional atmosphere of their chosen career.

Style requirements:
- Bright, vibrant colors
- Cartoon or semi-realistic style suitable for children
- Professional attire and tools typical of a {job_role}
- Positive, inspiring, and encouraging atmosphere
- Child should look happy and confident
- Include relevant background elements (e.g., hospital for doctor, classroom for teacher, space for astronaut)

The image should be:
- High quality and professional
- Safe and appropriate for all ages
- Inspiring and motivational
- Fun and engaging

Generate an image {image_format} that shows {child_name} as a future {job_role} in a realistic but kid-friendly and inspiring way."""


class FreepikImageGenerator:
    """Generate images using Freepik API (Nano Banana - Gemini 2.5 Flash)."""

    def __init__(self, api_key: str):
        """Initialize Freepik service."""
        self.api_key = api_key
        self.base_url = "https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview"
        self.headers = {
            "x-freepik-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        self.max_retries = 30
        self.retry_delay = 2

    def generate(
        self, child_name: str, job_role: str, reference_image_bytes: bytes
    ) -> Optional[bytes]:
        """
        Generate a transformed image using Freepik API.

        Args:
            child_name: Child's first name
            job_role: Desired job role
            reference_image_bytes: Reference image as bytes

        Returns:
            Image data as bytes, or None if generation fails
        """
        try:
            # Step 1: Create the generation task
            task_id = self._create_task(child_name, job_role, reference_image_bytes)
            if not task_id:
                raise Exception("Failed to create generation task")

            print(f"✅ Task created with ID: {task_id}")

            # Step 2: Poll for task completion
            image_url = self._wait_for_completion(task_id)
            if not image_url:
                raise Exception("Failed to generate image or task timed out")

            print(f"✅ Image generated successfully")

            # Step 3: Download the image from the URL
            image_data = self._download_image(image_url)
            if not image_data:
                raise Exception("Failed to download generated image")

            return image_data

        except Exception as e:
            print(f"❌ Error generating image with Freepik: {str(e)}")
            raise

    def _create_task(
        self, child_name: str, job_role: str, reference_image_bytes: bytes
    ) -> Optional[str]:
        """Create a new image generation task."""
        try:
            # Convert image to base64
            image_base64 = base64.b64encode(reference_image_bytes).decode("utf-8")

            # Create the prompt
            prompt = self._create_prompt(child_name, job_role)

            # Prepare the request payload
            payload = {"prompt": prompt, "reference_images": [image_base64]}

            # Make the API request
            response = requests.post(
                self.base_url, json=payload, headers=self.headers, timeout=30
            )

            response.raise_for_status()
            data = response.json()

            # Extract task_id from response
            task_id = data.get("data", {}).get("task_id")
            status = data.get("data", {}).get("status")

            print(f"📝 Task created - ID: {task_id}, Status: {status}")

            return task_id

        except Exception as e:
            print(f"❌ Error creating task: {str(e)}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response: {e.response.text}")
            return None

    def _wait_for_completion(self, task_id: str) -> Optional[str]:
        """Poll the API until the task is completed."""
        url = f"{self.base_url}/{task_id}"

        for attempt in range(self.max_retries):
            try:
                response = requests.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                data = response.json()

                status = data.get("data", {}).get("status")
                generated = data.get("data", {}).get("generated", [])

                print(f"🔄 Attempt {attempt + 1}/{self.max_retries} - Status: {status}")

                if status == "COMPLETED" and generated:
                    image_url = generated[0]
                    print(f"✅ Task completed!")
                    return image_url

                elif status == "FAILED":
                    print(f"❌ Task failed")
                    return None

                elif status in ["CREATED", "PROCESSING", "IN_PROGRESS"]:
                    # Task is still processing, wait and retry
                    time.sleep(self.retry_delay)
                    continue

                else:
                    print(f"⚠️ Unknown status: {status}")
                    time.sleep(self.retry_delay)
                    continue

            except Exception as e:
                print(f"❌ Error checking task status: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                return None

        print(f"⏱️ Task timed out after {self.max_retries} attempts")
        return None

    def _download_image(self, image_url: str) -> Optional[bytes]:
        """Download the generated image from the provided URL."""
        try:
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()

            print(f"✅ Image downloaded successfully ({len(response.content)} bytes)")
            return response.content

        except Exception as e:
            print(f"❌ Error downloading image: {str(e)}")
            return None

    @staticmethod
    def _create_prompt(child_name: str, job_role: str) -> str:
        """Create a detailed prompt for Freepik image generation."""
        return f"""Generate a highly detailed, vibrant, and realistic illustration of the same child, aged between 3 and 12 years old, shown as their future self at around 30 years old in their dream job as a {job_role}. Preserve the child's distinctive facial features, hairstyle, and expression so it is clearly the same person. They should be dressed in professional attire suited to {job_role}, placed in a realistic, colorful environment related to that profession — for example, a lab, space station, creative studio, or workplace relevant to {job_role}. Emphasize a clear, lifelike face with strong detail, while the background reflects a cheerful yet professional atmosphere of their chosen career.

Style Requirements:
- PHOTOREALISTIC style, NOT cartoon or illustration
- Professional photography quality with natural lighting
- Realistic human proportions and features
- Keep the child's original face and features clearly recognizable
- Natural skin tones and realistic textures

Attire and Setting:
- Authentic professional {job_role} uniform, clothing, and equipment
- Place them in a realistic {job_role} workplace environment
- Include accurate professional tools and props for a {job_role}
- Professional workplace background with realistic details

Mood and Composition:
- Child should appear confident, happy, and professional
- Natural, genuine smile and body language
- High-quality professional portrait composition
- Proper depth of field and realistic lighting
- Inspiring and motivational atmosphere

Technical Quality:
- 4K photorealistic quality
- Sharp focus on the subject
- Professional color grading
- Realistic shadows and highlights
- Natural environmental lighting

Create a photorealistic, professional-quality image of {child_name} as a {job_role} that looks like an authentic professional portrait photograph."""


def generate_image(
    child_name: str,
    job_role: str,
    ai_provider: Optional[str] = None,
    reference_image_bytes: Optional[bytes] = None,
    save_to_file: bool = False,
) -> Optional[bytes]:
    """
    Generate an AI-transformed image of a child as a future professional.

    Args:
        child_name: Child's first name
        job_role: Desired job role (e.g., "Doctor", "Astronaut", "Teacher")
        ai_provider: AI provider to use ("gemini" or "freepik"). Defaults to config setting.
        reference_image_bytes: Reference image as bytes (required for Freepik)
        save_to_file: Whether to save the generated image to disk

    Returns:
        Image data as bytes, or None if generation fails

    Raises:
        ValueError: If configuration is invalid or required parameters are missing
    """
    # Validate configuration
    Config.validate()

    # Use configured provider if not specified
    provider = (ai_provider or Config.ai_provider).lower()

    if provider == "gemini":
        print(f"🤖 Using Gemini API to generate image for {child_name} as {job_role}")
        generator = GeminiImageGenerator(Config.gemini_api_key)
        image_data = generator.generate(child_name, job_role)

    elif provider == "freepik":
        if not reference_image_bytes:
            raise ValueError("reference_image_bytes is required for Freepik provider")
        print(f"🤖 Using Freepik API to generate image for {child_name} as {job_role}")
        generator = FreepikImageGenerator(Config.freepik_api_key)
        image_data = generator.generate(child_name, job_role, reference_image_bytes)

    else:
        raise ValueError("Unknown AI provider: {provider}. Must be 'gemini' or 'freepik'")

    # Save to file if requested
    if save_to_file and image_data:
        output_dir = Path(Config.output_dir)
        output_dir.mkdir(exist_ok=True)

        filename = f"{child_name}_{job_role.replace(' ', '_')}.png"
        filepath = output_dir / filename

        try:
            with open(filepath, "wb") as f:
                f.write(image_data)
            print(f"💾 Image saved to: {filepath}")
        except Exception as e:
            print(f"⚠️ Failed to save image: {str(e)}")

    return image_data


def generate_image_base64(
    child_name: str,
    job_role: str,
    ai_provider: Optional[str] = None,
    reference_image_bytes: Optional[bytes] = None,
) -> Optional[str]:
    """
    Generate an AI-transformed image and return it as base64-encoded string.

    Args:
        child_name: Child's first name
        job_role: Desired job role
        ai_provider: AI provider to use ("gemini" or "freepik")
        reference_image_bytes: Reference image as bytes (required for Freepik)

    Returns:
        Base64-encoded image string, or None if generation fails
    """
    image_data = generate_image(
        child_name=child_name,
        job_role=job_role,
        ai_provider=ai_provider,
        reference_image_bytes=reference_image_bytes,
    )

    if image_data:
        return base64.b64encode(image_data).decode("utf-8")

    return None


# Example usage
if __name__ == "__main__":
    # Example 1: Generate with Gemini
    try:
        print("=" * 60)
        print("Example: Generate with Gemini API")
        print("=" * 60)
        image_data = generate_image(
            child_name="Emma", job_role="Scientist", ai_provider="gemini", save_to_file=True
        )
        if image_data:
            print(f"✅ Successfully generated image ({len(image_data)} bytes)")
    except Exception as e:
        print(f"❌ Example 1 failed: {str(e)}")

    # Example 2: Generate with Freepik (requires reference image)
    try:
        print("\n" + "=" * 60)
        print("Example: Generate with Freepik API")
        print("=" * 60)

        # Read a reference image (for testing)
        test_image_path = Path("test_child_photo.jpg")
        if test_image_path.exists():
            with open(test_image_path, "rb") as f:
                reference_image = f.read()

            image_data = generate_image(
                child_name="Lucas",
                job_role="Astronaut",
                ai_provider="freepik",
                reference_image_bytes=reference_image,
                save_to_file=True,
            )
            if image_data:
                print(f"✅ Successfully generated image ({len(image_data)} bytes)")
        else:
            print(f"⚠️ Test image not found: {test_image_path}")

    except Exception as e:
        print(f"❌ Example 2 failed: {str(e)}")
"""
Standalone module for generating AI-transformed images of children as future professionals.
Supports both Google Gemini and Freepik (Nano Banana) APIs.

Usage:
    from generate_photo import generate_image

    image_data = generate_image(
        child_name="John",
        job_role="Doctor",
        ai_provider="gemini",  # or "freepik"
        reference_image_bytes=None  # Required for freepik, optional for gemini
    )
"""

import os
import base64
import time
import requests
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration for image generation services."""

    # API Keys
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    freepik_api_key: str = os.getenv("FREEPIK_API_KEY", "")

    # AI Provider Selection
    ai_provider: str = os.getenv("AI_PROVIDER", "gemini").lower()  # "gemini" or "freepik"

    # Optional: Email settings (if you want to send results)
    sendgrid_api_key: str = os.getenv("SENDGRID_API_KEY", "")
    sendgrid_from_email: str = os.getenv("SENDGRID_FROM_EMAIL", "")

    # File output settings
    output_dir: str = os.getenv("OUTPUT_DIR", "./generated_images")

    @classmethod
    def validate(cls):
        """Validate required configuration."""
        if cls.ai_provider == "gemini" and not cls.gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required for Gemini provider")
        if cls.ai_provider == "freepik" and not cls.freepik_api_key:
            raise ValueError("FREEPIK_API_KEY environment variable is required for Freepik provider")


class GeminiImageGenerator:
    """Generate images using Google Gemini 2.5 Flash Image API."""

    def __init__(self, api_key: str):
        """Initialize Gemini service."""
        from google import genai
        from google.genai import types

        self.genai = genai
        self.types = types
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash-image"

    def generate(
        self,
        child_name: str,
        job_role: str,
        image_format: str = "PNG"
    ) -> Optional[bytes]:
        """
        Generate a transformed image using Gemini.

        Args:
            child_name: Child's first name
            job_role: Desired job role
            image_format: Output format (PNG, JPEG)

        Returns:
            Image data as bytes, or None if generation fails
        """
        try:
            prompt = self._create_prompt(child_name, job_role, image_format)

            contents = [
                self.types.Content(
                    role="user",
                    parts=[
                        self.types.Part.from_text(text=prompt),
                    ],
                ),
            ]

            generate_content_config = self.types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            )

            # Generate image using streaming
            image_data = None
            for chunk in self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=generate_content_config,
            ):
                if (
                    chunk.candidates is None
                    or chunk.candidates[0].content is None
                    or chunk.candidates[0].content.parts is None
                ):
                    continue

                # Extract image data from inline_data
                if (
                    chunk.candidates[0].content.parts[0].inline_data
                    and chunk.candidates[0].content.parts[0].inline_data.data
                ):
                    inline_data = chunk.candidates[0].content.parts[0].inline_data
                    image_data = inline_data.data
                    print(f"✅ Image generated successfully with Gemini for {child_name}")
                    break

            return image_data

        except Exception as e:
            print(f"❌ Error generating image with Gemini: {str(e)}")
            raise

    @staticmethod
    def _create_prompt(child_name: str, job_role: str, image_format: str) -> str:
        """Create a detailed prompt for Gemini image generation."""
        return f"""Generate a highly detailed, vibrant, and realistic illustration of the same child, aged between 3 and 12 years old, shown as their future self at around 30 years old in their dream job as a {job_role}. Preserve the child's distinctive facial features, hairstyle, and expression so it is clearly the same person. They should be dressed in professional attire suited to {job_role}, placed in a realistic, colorful environment related to that profession — for example, a lab, space station, creative studio, or workplace relevant to {job_role}. Emphasize a clear, lifelike face with strong detail, while the background reflects a cheerful yet professional atmosphere of their chosen career.

Style requirements:
- Bright, vibrant colors
- Cartoon or semi-realistic style suitable for children
- Professional attire and tools typical of a {job_role}
- Positive, inspiring, and encouraging atmosphere
- Child should look happy and confident
- Include relevant background elements (e.g., hospital for doctor, classroom for teacher, space for astronaut)

The image should be:
- High quality and professional
- Safe and appropriate for all ages
- Inspiring and motivational
- Fun and engaging

Generate an image {image_format} that shows {child_name} as a future {job_role} in a realistic but kid-friendly and inspiring way."""


class FreepikImageGenerator:
    """Generate images using Freepik API (Nano Banana - Gemini 2.5 Flash)."""

    def __init__(self, api_key: str):
        """Initialize Freepik service."""
        self.api_key = api_key
        self.base_url = "https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview"
        self.headers = {
            "x-freepik-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        self.max_retries = 30
        self.retry_delay = 2

    def generate(
        self, child_name: str, job_role: str, reference_image_bytes: bytes
    ) -> Optional[bytes]:
        """
        Generate a transformed image using Freepik API.

        Args:
            child_name: Child's first name
            job_role: Desired job role
            reference_image_bytes: Reference image as bytes

        Returns:
            Image data as bytes, or None if generation fails
        """
        try:
            # Step 1: Create the generation task
            task_id = self._create_task(child_name, job_role, reference_image_bytes)
            if not task_id:
                raise Exception("Failed to create generation task")

            print(f"✅ Task created with ID: {task_id}")

            # Step 2: Poll for task completion
            image_url = self._wait_for_completion(task_id)
            if not image_url:
                raise Exception("Failed to generate image or task timed out")

            print(f"✅ Image generated successfully")

            # Step 3: Download the image from the URL
            image_data = self._download_image(image_url)
            if not image_data:
                raise Exception("Failed to download generated image")

            return image_data

        except Exception as e:
            print(f"❌ Error generating image with Freepik: {str(e)}")
            raise

    def _create_task(
        self, child_name: str, job_role: str, reference_image_bytes: bytes
    ) -> Optional[str]:
        """Create a new image generation task."""
        try:
            # Convert image to base64
            image_base64 = base64.b64encode(reference_image_bytes).decode("utf-8")

            # Create the prompt
            prompt = self._create_prompt(child_name, job_role)

            # Prepare the request payload
            payload = {"prompt": prompt, "reference_images": [image_base64]}

            # Make the API request
            response = requests.post(
                self.base_url, json=payload, headers=self.headers, timeout=30
            )

            response.raise_for_status()
            data = response.json()

            # Extract task_id from response
            task_id = data.get("data", {}).get("task_id")
            status = data.get("data", {}).get("status")

            print(f"📝 Task created - ID: {task_id}, Status: {status}")

            return task_id

        except Exception as e:
            print(f"❌ Error creating task: {str(e)}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response: {e.response.text}")
            return None

    def _wait_for_completion(self, task_id: str) -> Optional[str]:
        """Poll the API until the task is completed."""
        url = f"{self.base_url}/{task_id}"

        for attempt in range(self.max_retries):
            try:
                response = requests.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                data = response.json()

                status = data.get("data", {}).get("status")
                generated = data.get("data", {}).get("generated", [])

                print(f"🔄 Attempt {attempt + 1}/{self.max_retries} - Status: {status}")

                if status == "COMPLETED" and generated:
                    image_url = generated[0]
                    print(f"✅ Task completed!")
                    return image_url

                elif status == "FAILED":
                    print(f"❌ Task failed")
                    return None

                elif status in ["CREATED", "PROCESSING", "IN_PROGRESS"]:
                    # Task is still processing, wait and retry
                    time.sleep(self.retry_delay)
                    continue

                else:
                    print(f"⚠️ Unknown status: {status}")
                    time.sleep(self.retry_delay)
                    continue

            except Exception as e:
                print(f"❌ Error checking task status: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                return None

        print(f"⏱️ Task timed out after {self.max_retries} attempts")
        return None

    def _download_image(self, image_url: str) -> Optional[bytes]:
        """Download the generated image from the provided URL."""
        try:
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()

            print(f"✅ Image downloaded successfully ({len(response.content)} bytes)")
            return response.content

        except Exception as e:
            print(f"❌ Error downloading image: {str(e)}")
            return None

    @staticmethod
    def _create_prompt(child_name: str, job_role: str) -> str:
        """Create a detailed prompt for Freepik image generation."""
        return f"""Generate a highly detailed, vibrant, and realistic illustration of the same child, aged between 3 and 12 years old, shown as their future self at around 30 years old in their dream job as a {job_role}. Preserve the child's distinctive facial features, hairstyle, and expression so it is clearly the same person. They should be dressed in professional attire suited to {job_role}, placed in a realistic, colorful environment related to that profession — for example, a lab, space station, creative studio, or workplace relevant to {job_role}. Emphasize a clear, lifelike face with strong detail, while the background reflects a cheerful yet professional atmosphere of their chosen career.

Style Requirements:
- PHOTOREALISTIC style, NOT cartoon or illustration
- Professional photography quality with natural lighting
- Realistic human proportions and features
- Keep the child's original face and features clearly recognizable
- Natural skin tones and realistic textures

Attire and Setting:
- Authentic professional {job_role} uniform, clothing, and equipment
- Place them in a realistic {job_role} workplace environment
- Include accurate professional tools and props for a {job_role}
- Professional workplace background with realistic details

Mood and Composition:
- Child should appear confident, happy, and professional
- Natural, genuine smile and body language
- High-quality professional portrait composition
- Proper depth of field and realistic lighting
- Inspiring and motivational atmosphere

Technical Quality:
- 4K photorealistic quality
- Sharp focus on the subject
- Professional color grading
- Realistic shadows and highlights
- Natural environmental lighting

Create a photorealistic, professional-quality image of {child_name} as a {job_role} that looks like an authentic professional portrait photograph."""


def generate_image(
    child_name: str,
    job_role: str,
    ai_provider: Optional[str] = None,
    reference_image_bytes: Optional[bytes] = None,
    save_to_file: bool = False,
) -> Optional[bytes]:
    """
    Generate an AI-transformed image of a child as a future professional.

    Args:
        child_name: Child's first name
        job_role: Desired job role (e.g., "Doctor", "Astronaut", "Teacher")
        ai_provider: AI provider to use ("gemini" or "freepik"). Defaults to config setting.
        reference_image_bytes: Reference image as bytes (required for Freepik)
        save_to_file: Whether to save the generated image to disk

    Returns:
        Image data as bytes, or None if generation fails

    Raises:
        ValueError: If configuration is invalid or required parameters are missing
    """
    # Validate configuration
    Config.validate()

    # Use configured provider if not specified
    provider = (ai_provider or Config.ai_provider).lower()

    if provider == "gemini":
        print(f"🤖 Using Gemini API to generate image for {child_name} as {job_role}")
        generator = GeminiImageGenerator(Config.gemini_api_key)
        image_data = generator.generate(child_name, job_role)

    elif provider == "freepik":
        if not reference_image_bytes:
            raise ValueError("reference_image_bytes is required for Freepik provider")
        print(f"🤖 Using Freepik API to generate image for {child_name} as {job_role}")
        generator = FreepikImageGenerator(Config.freepik_api_key)
        image_data = generator.generate(child_name, job_role, reference_image_bytes)

    else:
        raise ValueError("Unknown AI provider: {provider}. Must be 'gemini' or 'freepik'")

    # Save to file if requested
    if save_to_file and image_data:
        output_dir = Path(Config.output_dir)
        output_dir.mkdir(exist_ok=True)

        filename = f"{child_name}_{job_role.replace(' ', '_')}.png"
        filepath = output_dir / filename

        try:
            with open(filepath, "wb") as f:
                f.write(image_data)
            print(f"💾 Image saved to: {filepath}")
        except Exception as e:
            print(f"⚠️ Failed to save image: {str(e)}")

    return image_data


def generate_image_base64(
    child_name: str,
    job_role: str,
    ai_provider: Optional[str] = None,
    reference_image_bytes: Optional[bytes] = None,
) -> Optional[str]:
    """
    Generate an AI-transformed image and return it as base64-encoded string.

    Args:
        child_name: Child's first name
        job_role: Desired job role
        ai_provider: AI provider to use ("gemini" or "freepik")
        reference_image_bytes: Reference image as bytes (required for Freepik)

    Returns:
        Base64-encoded image string, or None if generation fails
    """
    image_data = generate_image(
        child_name=child_name,
        job_role=job_role,
        ai_provider=ai_provider,
        reference_image_bytes=reference_image_bytes,
    )

    if image_data:
        return base64.b64encode(image_data).decode("utf-8")

    return None


# Example usage
if __name__ == "__main__":
    # Example 1: Generate with Gemini
    try:
        print("=" * 60)
        print("Example: Generate with Gemini API")
        print("=" * 60)
        image_data = generate_image(
            child_name="Emma", job_role="Scientist", ai_provider="gemini", save_to_file=True
        )
        if image_data:
            print(f"✅ Successfully generated image ({len(image_data)} bytes)")
    except Exception as e:
        print(f"❌ Example 1 failed: {str(e)}")

    # Example 2: Generate with Freepik (requires reference image)
    try:
        print("\n" + "=" * 60)
        print("Example: Generate with Freepik API")
        print("=" * 60)

        # Read a reference image (for testing)
        test_image_path = Path("test_child_photo.jpg")
        if test_image_path.exists():
            with open(test_image_path, "rb") as f:
                reference_image = f.read()

            image_data = generate_image(
                child_name="Lucas",
                job_role="Astronaut",
                ai_provider="freepik",
                reference_image_bytes=reference_image,
                save_to_file=True,
            )
            if image_data:
                print(f"✅ Successfully generated image ({len(image_data)} bytes)")
        else:
            print(f"⚠️ Test image not found: {test_image_path}")

    except Exception as e:
        print(f"❌ Example 2 failed: {str(e)}")
