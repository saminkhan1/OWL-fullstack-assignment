from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.stocks import router as stocks_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stock Market API")

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the stocks router with prefix
app.include_router(stocks_router, prefix="/api/stocks", tags=["stocks"])

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 