import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "DRAIN-X — Chennai Urban Flood Nowcasting System"
    VERSION: str = "2.0.0-PROD"
    API_PREFIX: str = "/api"
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "drainx_chennai_smart_city_secure_key_2026_x99a")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./drainx_master.db")
    
    # Simulation & AI Engine
    SIMULATION_INTERVAL_SEC: int = 5
    LEAD_TIME_HOURS: int = 3
    DEFAULT_AREA: str = "Velachery"

settings = Settings()
