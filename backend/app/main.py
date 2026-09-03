from fastapi import FastAPI

app = FastAPI(title="AarogyaFlow API")

@app.get("/health")
def health():
    return {"status": "ok"}