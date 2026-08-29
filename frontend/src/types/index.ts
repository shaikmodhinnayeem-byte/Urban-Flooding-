export type UserRole = 'USER' | 'ADMIN' | 'RESCUE';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  phone?: string;
}

export interface Area {
  id: number;
  name: string;
  zone_number: number;
  ward_number: number;
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  population: number;
  avg_elevation_m: number;
  impervious_ratio: number;
  catchment_area_sqkm: number;
  risk_level: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
}

export interface Road {
  id: number;
  area_id: number;
  name: string;
  road_type: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  elevation_m: number;
  length_km: number;
  width_m: number;
  current_water_depth_cm: number;
  predicted_depth_1h_cm: number;
  predicted_depth_3h_cm: number;
  flood_probability_pct: number;
  passability_status: 'PASSABLE' | 'SLOW' | 'IMPASSABLE';
  is_critical_route: boolean;
}

export interface DrainNode {
  id: number;
  area_id: number;
  node_code: string;
  node_type: 'MANHOLE' | 'JUNCTION' | 'INLET' | 'OUTFALL' | 'PUMP_STATION';
  lat: number;
  lng: number;
  invert_level_m: number;
  ground_elevation_m: number;
  chamber_depth_m: number;
  water_level_m: number;
  surcharge_level_m: number;
  status: 'NORMAL' | 'SURCHARGE' | 'BACKFLOW' | 'OVERFLOW';
  sensor_id?: string;
}

export interface DrainSegment {
  id: number;
  segment_code: string;
  source_node_id: number;
  target_node_id: number;
  drain_type: string;
  length_m: number;
  diameter_m: number;
  design_capacity_m3s: number;
  current_flow_m3s: number;
  capacity_utilization_pct: number;
  condition_status: 'NORMAL' | 'PARTIAL_BLOCKAGE' | 'SEVERE_BLOCKAGE' | 'OVERFLOW' | 'BACKFLOW';
  debris_blockage_pct: number;
  outfall_name: string;
}

export interface Sensor {
  id: number;
  sensor_code: string;
  name: string;
  sensor_type: 'WATER_LEVEL' | 'FLOW_VELOCITY' | 'ULTRASONIC_BLOCKAGE' | 'RAIN_GAUGE' | 'WEATHER_STATION';
  area_id: number;
  lat: number;
  lng: number;
  current_value: number;
  unit: string;
  warning_threshold: number;
  critical_threshold: number;
  battery_level_pct: number;
  signal_rssi: number;
  health_status: 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
}

export interface RainfallData {
  id: number;
  area_id: number;
  intensity_mm_hr: number;
  accum_1h_mm: number;
  accum_3h_mm: number;
  radar_reflectivity_dbz: number;
  imd_station_code: string;
  temp_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  pressure_hpa: number;
  forecast_30m_mm: number;
  forecast_1h_mm: number;
  forecast_2h_mm: number;
  forecast_3h_mm: number;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'HIGH' | 'CRITICAL';
  area_id?: number;
  alert_type: string;
  is_active: boolean;
  is_acknowledged: boolean;
  created_at: string;
}

export interface RescueTeam {
  id: number;
  team_name: string;
  agency: string;
  current_lat: number;
  current_lng: number;
  personnel_count: number;
  equipment_type: string;
  contact_phone: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'DISPATCHED' | 'EN_ROUTE' | 'COMPLETED';
  assigned_task_id?: number;
}

export interface RescueTask {
  id: number;
  title: string;
  area_id: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  target_lat: number;
  target_lng: number;
  location_name: string;
  assigned_team_id?: number;
  task_status: 'PENDING' | 'ASSIGNED' | 'DISPATCHED' | 'COMPLETED';
  water_depth_cm: number;
  stranded_count: number;
  instructions?: string;
  created_at: string;
}

export interface MLModel {
  id: number;
  model_name: string;
  model_type: string;
  version: string;
  lead_time_target: string;
  accuracy_score: number;
  rmse: number;
  mae: number;
  f1_score: number;
  is_active: boolean;
  last_trained_at: string;
}

export interface LiveWeather {
  status: string;
  source: string;
  source_api_url: string;
  location_name: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  temperature_c: number;
  apparent_temperature_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  rain_mm: number;
  weather_code: number;
  condition: string;
  condition_icon: string;
  surface_pressure_hpa: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  is_live_api: boolean;
  last_synced_at: string;
  radar_reflectivity_dbz?: number;
  simulated_storm_intensity_mm_hr?: number;
  imd_station_code?: string;
}

export interface DatasetItem {
  id: number;
  name: string;
  category: string;
  source_url?: string;
  record_count: number;
  file_format: string;
  status: string;
  updated_at: string;
}
