import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, create_engine, func
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from app.config import settings

Base = declarative_base()

# Primary PostgreSQL Engine Setup with active connection verification
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = None
if "postgresql" in db_url:
    try:
        from sqlalchemy import text
        connect_args = {"connect_timeout": 15}
        if "neon.tech" in db_url and "sslmode" not in db_url:
            connect_args["sslmode"] = "require"
        candidate = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args=connect_args
        )
        with candidate.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        engine = candidate
        print("[INFO] Successfully connected to Neon / PostgreSQL database.")
    except Exception as e:
        print(f"[WARNING] Primary PostgreSQL connection failed ({e}). Falling back to SQLite.")

if engine is None:
    engine = create_engine(settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})

# Secondary SQLite engine for non-user domain models
sqlite_engine = create_engine(settings.SQLITE_DATABASE_URL, connect_args={"check_same_thread": False})

# ----------------- USERS & AUTH -----------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False, default="user") # 'user', 'admin'
    created_at = Column(DateTime, server_default=func.now(), default=datetime.datetime.utcnow)

    @property
    def full_name(self) -> str:
        return self.name

    @full_name.setter
    def full_name(self, value: str):
        self.name = value

    @property
    def hashed_password(self) -> str:
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, value: str):
        self.password_hash = value

    @property
    def is_active(self) -> bool:
        return True


# ----------------- AREAS & WARDS -----------------
class Area(Base):
    __tablename__ = "areas"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False) # e.g. Velachery, Adyar, T. Nagar
    zone_number = Column(Integer, default=13)
    ward_number = Column(Integer, default=179)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    zoom_level = Column(Integer, default=14)
    boundary_geojson = Column(Text, nullable=True)
    population = Column(Integer, default=185000)
    avg_elevation_m = Column(Float, default=4.5)
    impervious_ratio = Column(Float, default=0.82)
    catchment_area_sqkm = Column(Float, default=14.2)
    risk_level = Column(String(20), default="NORMAL") # NORMAL, WATCH, WARNING, CRITICAL
    
    roads = relationship("Road", back_populates="area")
    drain_nodes = relationship("DrainNode", back_populates="area")
    sensors = relationship("Sensor", back_populates="area")
    alerts = relationship("Alert", back_populates="area")

# ----------------- ROADS & STREETS -----------------
class Road(Base):
    __tablename__ = "roads"
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    name = Column(String(120), nullable=False) # e.g. 100 Feet Bypass Road, Velachery Main Rd
    road_type = Column(String(50), default="Arterial")
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    coordinates_json = Column(Text, nullable=True) # LineString points
    elevation_m = Column(Float, default=3.2)
    length_km = Column(Float, default=1.8)
    width_m = Column(Float, default=18.0)
    current_water_depth_cm = Column(Float, default=0.0)
    predicted_depth_1h_cm = Column(Float, default=0.0)
    predicted_depth_3h_cm = Column(Float, default=0.0)
    flood_probability_pct = Column(Float, default=5.0)
    passability_status = Column(String(20), default="PASSABLE") # PASSABLE, SLOW, IMPASSABLE
    is_critical_route = Column(Boolean, default=False)
    
    area = relationship("Area", back_populates="roads")

# ----------------- DRAINAGE GRAPH: NODES (MANHOLES / INLETS) -----------------
class DrainNode(Base):
    __tablename__ = "drain_nodes"
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    node_code = Column(String(50), unique=True, index=True) # e.g. MH-VEL-0104
    node_type = Column(String(50), default="MANHOLE") # MANHOLE, JUNCTION, INLET, OUTFALL, PUMP_STATION
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    invert_level_m = Column(Float, default=0.8) # Bottom of chamber
    ground_elevation_m = Column(Float, default=4.2)
    chamber_depth_m = Column(Float, default=3.4)
    water_level_m = Column(Float, default=0.4)
    surcharge_level_m = Column(Float, default=3.0)
    status = Column(String(30), default="NORMAL") # NORMAL, SURCHARGE, BACKFLOW, OVERFLOW
    has_iot_sensor = Column(Boolean, default=True)
    sensor_id = Column(String(50), nullable=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
    
    area = relationship("Area", back_populates="drain_nodes")

# ----------------- DRAINAGE GRAPH: EDGES (CONDUITS / CANALS) -----------------
class DrainSegment(Base):
    __tablename__ = "drain_segments"
    id = Column(Integer, primary_key=True, index=True)
    segment_code = Column(String(50), unique=True, index=True) # e.g. DRAIN-VEL-P01
    source_node_id = Column(Integer, ForeignKey("drain_nodes.id"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("drain_nodes.id"), nullable=False)
    drain_type = Column(String(50), default="SECONDARY_STORM_PIPE") # PRIMARY_CANAL, SECONDARY_STORM_PIPE, TERTIARY_BOX_DRAIN
    length_m = Column(Float, default=250.0)
    width_m = Column(Float, default=1.5)
    depth_m = Column(Float, default=2.0)
    diameter_m = Column(Float, default=1.2)
    slope_pct = Column(Float, default=0.25)
    manning_roughness_n = Column(Float, default=0.015) # Concrete pipe
    design_capacity_m3s = Column(Float, default=12.5)
    current_flow_m3s = Column(Float, default=1.8)
    capacity_utilization_pct = Column(Float, default=14.4)
    condition_status = Column(String(30), default="NORMAL") # NORMAL, PARTIAL_BLOCKAGE, SEVERE_BLOCKAGE, OVERFLOW, BACKFLOW
    debris_blockage_pct = Column(Float, default=5.0)
    outfall_name = Column(String(100), default="Pallikaranai Marsh / Buckingham Canal")

# ----------------- IoT SENSORS -----------------
class Sensor(Base):
    __tablename__ = "sensors"
    id = Column(Integer, primary_key=True, index=True)
    sensor_code = Column(String(50), unique=True, index=True) # e.g. SN-VEL-WL01
    name = Column(String(100), nullable=False)
    sensor_type = Column(String(50), nullable=False) # WATER_LEVEL, FLOW_VELOCITY, ULTRASONIC_BLOCKAGE, RAIN_GAUGE, WEATHER_STATION
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    current_value = Column(Float, default=0.0)
    unit = Column(String(20), default="m")
    warning_threshold = Column(Float, default=1.8)
    critical_threshold = Column(Float, default=2.8)
    battery_level_pct = Column(Float, default=94.0)
    signal_rssi = Column(Integer, default=-65)
    health_status = Column(String(30), default="ONLINE") # ONLINE, WARNING, CRITICAL, OFFLINE
    last_signal_time = Column(DateTime, default=datetime.datetime.utcnow)
    
    area = relationship("Area", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    value = Column(Float, nullable=False)
    status = Column(String(20), default="NORMAL")
    
    sensor = relationship("Sensor", back_populates="readings")

# ----------------- RAINFALL & WEATHER -----------------
class RainfallRecord(Base):
    __tablename__ = "rainfall_records"
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    intensity_mm_hr = Column(Float, default=12.5)
    accum_1h_mm = Column(Float, default=14.0)
    accum_3h_mm = Column(Float, default=28.5)
    radar_reflectivity_dbz = Column(Float, default=32.0)
    imd_station_code = Column(String(50), default="IMD-CHN-MEENAMBAKKAM")
    temp_c = Column(Float, default=27.4)
    humidity_pct = Column(Float, default=88.0)
    wind_speed_kmh = Column(Float, default=22.0)
    pressure_hpa = Column(Float, default=1004.2)
    forecast_30m_mm = Column(Float, default=8.0)
    forecast_1h_mm = Column(Float, default=22.0)
    forecast_2h_mm = Column(Float, default=45.0)
    forecast_3h_mm = Column(Float, default=70.0)

# ----------------- DEM & TERRAIN GRID -----------------
class TerrainDEM(Base):
    __tablename__ = "terrain_dem"
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    elevation_m = Column(Float, default=3.5)
    slope_deg = Column(Float, default=0.45)
    aspect_deg = Column(Float, default=110.0)
    flow_direction = Column(String(10), default="SE")
    flow_accumulation_val = Column(Float, default=4200.0)
    is_depression = Column(Boolean, default=False)

# ----------------- AI / DL PREDICTIONS -----------------
class FloodPrediction(Base):
    __tablename__ = "flood_predictions"
    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    target_type = Column(String(30), default="STREET") # STREET, MANHOLE, WARD
    target_id = Column(String(60), nullable=False) # Road name or Node ID
    lead_time_min = Column(Integer, default=60) # 0, 30, 60, 120, 180
    predicted_depth_cm = Column(Float, default=15.0)
    flood_probability_pct = Column(Float, default=42.0)
    risk_level = Column(String(20), default="WATCH") # NORMAL, WATCH, WARNING, CRITICAL
    confidence_pct = Column(Float, default=89.5)
    model_version = Column(String(50), default="LSTM-SpatioTemporal-v2.3")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ----------------- ALERTS & EMERGENCY BROADCASTS -----------------
class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="WARNING") # INFO, WATCH, WARNING, CRITICAL
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)
    alert_type = Column(String(50), default="FLOOD_NOWCAST") # FLOOD_NOWCAST, DRAIN_OVERFLOW, ROAD_INUNDATION, CYCLONE_WATCH
    affected_locations_json = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    area = relationship("Area", back_populates="alerts")

# ----------------- RESCUE OPERATIONS -----------------
class RescueTeam(Base):
    __tablename__ = "rescue_teams"
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), nullable=False) # NDRF Team 4 - Adyar Unit, SDRF Boat Squad 2
    agency = Column(String(100), default="NDRF 4th Battalion")
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    personnel_count = Column(Integer, default=12)
    equipment_type = Column(String(120), default="Inflatable Motor Boats, Dewatering Pumps, High-clearance 4x4")
    contact_phone = Column(String(20), default="+91 44 2888 8801")
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, ASSIGNED, EN_ROUTE, ON_SITE, COMPLETED
    assigned_task_id = Column(Integer, nullable=True)

class RescueTask(Base):
    __tablename__ = "rescue_tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=False)
    priority = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    target_lat = Column(Float, nullable=False)
    target_lng = Column(Float, nullable=False)
    location_name = Column(String(120), nullable=False)
    assigned_team_id = Column(Integer, ForeignKey("rescue_teams.id"), nullable=True)
    task_status = Column(String(30), default="PENDING") # PENDING, ASSIGNED, DISPATCHED, COMPLETED
    water_depth_cm = Column(Float, default=65.0)
    stranded_count = Column(Integer, default=14)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# ----------------- DATASETS & MODEL REGISTRY -----------------
class DatasetRegistry(Base):
    __tablename__ = "dataset_registry"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(60), nullable=False) # IMD_RADAR, TNGIS_DRAINAGE, BHUVAN_ELEVATION, IOT_TELEMETRY, HISTORICAL_FLOODS
    source_url = Column(String(255), nullable=True)
    record_count = Column(Integer, default=45000)
    file_format = Column(String(30), default="GeoJSON / NetCDF / CSV")
    status = Column(String(30), default="ACTIVE_SYNC")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class MLModelRegistry(Base):
    __tablename__ = "ml_model_registry"
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(120), nullable=False)
    model_type = Column(String(60), default="Temporal LSTM + SpatioTemporal GNN")
    version = Column(String(30), default="v2.3")
    lead_time_target = Column(String(50), default="0 - 180 Minutes (Lead time step 30m)")
    accuracy_score = Column(Float, default=94.2)
    rmse = Column(Float, default=3.4) # cm depth error
    mae = Column(Float, default=2.1)
    f1_score = Column(Float, default=0.91)
    is_active = Column(Boolean, default=True)
    last_trained = Column(DateTime, default=datetime.datetime.utcnow)

# ----------------- AUDIT LOGS -----------------
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), default="admin@drainx.gov.in")
    action = Column(String(120), nullable=False)
    severity = Column(String(20), default="INFO")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

def create_session_factory():
    return sessionmaker(
        autocommit=False,
        autoflush=False,
        binds={
            User: engine,
            Area: sqlite_engine,
            Road: sqlite_engine,
            DrainNode: sqlite_engine,
            DrainSegment: sqlite_engine,
            Sensor: sqlite_engine,
            SensorReading: sqlite_engine,
            RainfallRecord: sqlite_engine,
            TerrainDEM: sqlite_engine,
            FloodPrediction: sqlite_engine,
            Alert: sqlite_engine,
            RescueTeam: sqlite_engine,
            RescueTask: sqlite_engine,
            DatasetRegistry: sqlite_engine,
            MLModelRegistry: sqlite_engine,
            AuditLog: sqlite_engine,
        }
    )

SessionLocal = create_session_factory()
SecondarySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_secondary_db():
    db = SecondarySessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from sqlalchemy import inspect
    # Only create the 'users' table on the primary PostgreSQL database as per requirement
    try:
        User.__table__.create(bind=engine, checkfirst=True)
        print("[INFO] PostgreSQL 'users' table created / verified successfully.")
    except Exception as e:
        print(f"[INFO] PostgreSQL table creation status: {e}")
        try:
            Base.metadata.create_all(bind=engine, tables=[User.__table__])
        except Exception as inner_e:
            print(f"[WARNING] Primary PostgreSQL init skipped ({inner_e}). Falling back to secondary database.")
            User.__table__.create(bind=sqlite_engine, checkfirst=True)

    # Initialize non-user application domain tables on secondary engine to preserve app functionality
    try:
        non_user_tables = [table for name, table in Base.metadata.tables.items() if name != "users"]
        Base.metadata.create_all(bind=sqlite_engine, tables=non_user_tables)
    except Exception as e:
        print(f"[INFO] Non-user domain tables initialization status: {e}")

