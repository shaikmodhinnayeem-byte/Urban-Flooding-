import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "DRAIN-X — Chennai Urban Flood Nowcasting System"
    VERSION: str = "2.0.0-PROD"
    API_PREFIX: str = "/api"
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET", os.getenv("JWT_SECRET_KEY", "drainx_chennai_smart_city_secure_key_2026_x99a"))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # PostgreSQL Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:Nayeem%40786@localhost:5432/urbanflooding")
    SQLITE_DATABASE_URL: str = "sqlite:///./drainx_master.db"
    
    # Simulation & AI Engine
    SIMULATION_INTERVAL_SEC: int = 5
    LEAD_TIME_HOURS: int = 3
    DEFAULT_AREA: str = "Velachery"

settings = Settings()

