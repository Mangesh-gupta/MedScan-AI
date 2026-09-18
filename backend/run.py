from pathlib import Path
import sys
import uvicorn

if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
