#!/usr/bin/env python
"""
Quick test runner for message endpoints
Run this directly without Postman!
"""
import subprocess
import sys
from pathlib import Path

def main():
    print("=" * 60)
    print("🧪 MESSAGE SYSTEM AUTOMATED TESTS")
    print("=" * 60)
    print()
    
    # Change to Backend directory
    backend_dir = Path(__file__).parent
    
    try:
        # Add the backend directory to Python path
        backend_str = str(backend_dir)
        import sys
        if backend_str not in sys.path:
            sys.path.insert(0, backend_str)
        
        # Run pytest with nice formatting
        result = subprocess.run(
            [
                sys.executable, "-m", "pytest",
                "tests/test_messages.py",
                "-v",  # Verbose
                "-s",  # Show print statements
                "--tb=short",  # Short traceback
                "--color=yes",  # Colored output
            ],
            cwd=backend_dir,
            check=False
        )
        
        print()
        if result.returncode == 0:
            print("✅ All tests passed!")
        else:
            print("❌ Some tests failed. Check output above.")
        
        return result.returncode
        
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        print("\nMake sure you have pytest installed:")
        print("  pip install pytest pytest-order")
        return 1


if __name__ == "__main__":
    sys.exit(main())
