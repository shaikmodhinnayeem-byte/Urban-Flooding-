from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "USER"
    department: Optional[str] = "Citizen / Public"
    phone: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Area schemas
class AreaOut(BaseModel):
    id: int
    name: str
    zone_number: int
    ward_number: int
    center_lat: float
    center_lng: float
    zoom_level: int
    population: int
    avg_elevation_m: float
    impervious_ratio: float
    catchment_area_sqkm: float
    risk_level: str

    class Config:
        from_attributes = True

# Road schemas
class RoadOut(BaseModel):
    id: int
    area_id: int
    name: str
    road_type: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    elevation_m: float
    length_km: float
    width_m: float
    current_water_depth_cm: float
    predicted_depth_1h_cm: float
    predicted_depth_3h_cm: float
    flood_probability_pct: float
    passability_status: str
    is_critical_route: bool
    coordinates_json: Optional[str] = None

    class Config:
        from_attributes = True

# Drain Node schemas
class DrainNodeOut(BaseModel):
    id: int
    area_id: int
    node_code: str
    node_type: str
    lat: float
    lng: float
    invert_level_m: float
    ground_elevation_m: float
    chamber_depth_m: float
    water_level_m: float
    surcharge_level_m: float
    status: str
    has_iot_sensor: bool
    sensor_id: Optional[str] = None
    last_updated: datetime

    class Config:
        from_attributes = True

# Drain Segment schemas
class DrainSegmentOut(BaseModel):
    id: int
    segment_code: str
    source_node_id: int
    target_node_id: int
    drain_type: str
    length_m: float
    width_m: float
    depth_m: float
    diameter_m: float
    slope_pct: float
    manning_roughness_n: float
    design_capacity_m3s: float
    current_flow_m3s: float
    capacity_utilization_pct: float
    condition_status: str
    debris_blockage_pct: float
    outfall_name: str

    class Config:
        from_attributes = True

# Sensor schemas
class SensorOut(BaseModel):
    id: int
    sensor_code: str
    name: str
    sensor_type: str
    area_id: int
    lat: float
    lng: float
    current_value: float
    unit: str
    warning_threshold: float
    critical_threshold: float
    battery_level_pct: float
    signal_rssi: int
    health_status: str
    last_signal_time: datetime

    class Config:
        from_attributes = True

class SensorReadingOut(BaseModel):
    id: int
    sensor_id: int
    timestamp: datetime
    value: float
    status: str

    class Config:
        from_attributes = True

# Rainfall schemas
class RainfallOut(BaseModel):
    id: int
    area_id: int
    timestamp: datetime
    intensity_mm_hr: float
    accum_1h_mm: float
    accum_3h_mm: float
    radar_reflectivity_dbz: float
    imd_station_code: str
    temp_c: float
    humidity_pct: float
    wind_speed_kmh: float
    pressure_hpa: float
    forecast_30m_mm: float
    forecast_1h_mm: float
    forecast_2h_mm: float
    forecast_3h_mm: float

    class Config:
        from_attributes = True

# Prediction schemas
class PredictionOut(BaseModel):
    id: int
    area_id: int
    target_type: str
    target_id: str
    lead_time_min: int
    predicted_depth_cm: float
    flood_probability_pct: float
    risk_level: str
    confidence_pct: float
    model_version: str

    class Config:
        from_attributes = True

# Alert schemas
class AlertCreate(BaseModel):
    title: str
    description: str
    severity: str = "WARNING"
    area_id: Optional[int] = None
    alert_type: str = "FLOOD_NOWCAST"
    affected_locations: Optional[List[str]] = []

class AlertOut(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    area_id: Optional[int]
    alert_type: str
    is_active: bool
    is_acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Rescue schemas
class RescueTeamOut(BaseModel):
    id: int
    team_name: str
    agency: str
    current_lat: float
    current_lng: float
    personnel_count: int
    equipment_type: str
    contact_phone: str
    status: str
    assigned_task_id: Optional[int]

    class Config:
        from_attributes = True

class RescueTaskCreate(BaseModel):
    title: str
    area_id: int
    priority: str = "HIGH"
    target_lat: float
    target_lng: float
    location_name: str
    water_depth_cm: float = 40.0
    stranded_count: int = 5
    instructions: Optional[str] = None
    assigned_team_id: Optional[int] = None

class RescueTaskOut(BaseModel):
    id: int
    title: str
    area_id: int
    priority: str
    target_lat: float
    target_lng: float
    location_name: str
    assigned_team_id: Optional[int]
    task_status: str
    water_depth_cm: float
    stranded_count: int
    instructions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Route Navigation
class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    vehicle_type: str = "CAR" # BIKE, CAR, RESCUE_TRUCK

class RouteSegment(BaseModel):
    street_name: str
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    end_lat: Optional[float] = None
    end_lng: Optional[float] = None
    distance_km: float
    elevation_m: Optional[float] = None
    water_depth_cm: float
    risk_level: Optional[str] = None
    is_passable: bool

class RouteResponse(BaseModel):
    status: str # SAFE, MODERATE_HAZARD, BLOCKED
    recommended_route: List[RouteSegment]
    alternative_route: Optional[List[RouteSegment]] = None
    total_distance_km: float
    est_travel_time_min: float
    max_flood_depth_encountered_cm: float
    hazard_warning: Optional[str] = None
    avoided_hazard: Optional[Dict[str, Any]] = None

# Simulation Trigger
class SimulationEvent(BaseModel):
    scenario_type: str # NORMAL, MODERATE_RAIN, CLOUDBURST_100MM, SURCHARGE_BACKFLOW, RECESSION
    target_area: Optional[str] = "Velachery"
    custom_rainfall_mm_hr: Optional[float] = None
