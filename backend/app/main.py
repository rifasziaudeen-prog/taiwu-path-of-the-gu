from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router as api_v1_router

app = FastAPI(
    title="Taiwu: Path of the Gu API",
    description="Backend engine for the Taiwu-inspired Gu Cultivation Sandbox",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev. In prod, lock this down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
