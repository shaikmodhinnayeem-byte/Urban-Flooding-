import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.schema import (
    Road, DrainNode, DrainSegment, Sensor, RainfallRecord, Alert, AuditLog
)

class SimulationManager:
    """
    Live Scenario & IoT Telemetry State Machine for Real-time Demonstrations
    """

    def apply_scenario(self, db: Session, scenario_type: str, custom_rainfall: float = None) -> Dict[str, Any]:
        scenario = scenario_type.upper()
        now = datetime.datetime.utcnow()
        
        if scenario == "NORMAL":
            rain_rate = 0.0
            accum_1h = 2.0
            accum_3h = 5.0
            radar_dbz = 15.0
            road_depth_mult = 0.1
            sensor_level_mult = 0.4
            drain_flow_mult = 0.2
            surcharge_status = "NORMAL"
            
        elif scenario == "MODERATE_RAIN":
            rain_rate = 28.0
            accum_1h = 32.0
            accum_3h = 55.0
            radar_dbz = 38.0
            road_depth_mult = 1.0
            sensor_level_mult = 1.0
            drain_flow_mult = 0.9
            surcharge_status = "NORMAL"
            
        elif scenario in ["CLOUDBURST_100MM", "EXTREME_STORM"]:
            rain_rate = custom_rainfall if custom_rainfall else 115.0
            accum_1h = 95.0
            accum_3h = 185.0
            radar_dbz = 52.0 # Crimson high reflectivity
            road_depth_mult = 2.6
            sensor_level_mult = 1.95
            drain_flow_mult = 2.2
            surcharge_status = "SURCHARGE"
            
        elif scenario == "SURCHARGE_BACKFLOW":
            rain_rate = 45.0
            accum_1h = 50.0
            accum_3h = 90.0
            radar_dbz = 42.0
            road_depth_mult = 1.8
            sensor_level_mult = 1.7
            drain_flow_mult = 1.5
            surcharge_status = "BACKFLOW"
            
        elif scenario == "RECESSION":
            rain_rate = 5.0
            accum_1h = 10.0
            accum_3h = 30.0
            radar_dbz = 20.0
            road_depth_mult = 0.4
            sensor_level_mult = 0.6
            drain_flow_mult = 0.5
            surcharge_status = "NORMAL"
        else:
            rain_rate = 25.0
            road_depth_mult = 1.0
            sensor_level_mult = 1.0
            drain_flow_mult = 1.0
            surcharge_status = "NORMAL"
            accum_1h = 25.0
            accum_3h = 45.0
            radar_dbz = 35.0

        # 1. Update Rainfall Record
        rain_rec = db.query(RainfallRecord).first()
        if rain_rec:
            rain_rec.intensity_mm_hr = rain_rate
            rain_rec.accum_1h_mm = accum_1h
            rain_rec.accum_3h_mm = accum_3h
            rain_rec.radar_reflectivity_dbz = radar_dbz
            rain_rec.forecast_30m_mm = round(rain_rate * 0.4, 1)
            rain_rec.forecast_1h_mm = round(rain_rate * 0.9, 1)
            rain_rec.forecast_2h_mm = round(rain_rate * 1.5, 1)
            rain_rec.forecast_3h_mm = round(rain_rate * 2.2, 1)

        # 2. Update Roads
        roads = db.query(Road).all()
        for r in roads:
            if "Lake Bund" in r.name:
                r.current_water_depth_cm = round(18.0 * road_depth_mult, 1)
            elif "Vijayanagar" in r.name:
                r.current_water_depth_cm = round(14.0 * road_depth_mult, 1)
            elif "Gandhi" in r.name:
                r.current_water_depth_cm = round(12.0 * road_depth_mult, 1)
            elif "100 Feet" in r.name:
                r.current_water_depth_cm = round(8.0 * road_depth_mult, 1)
            elif "Taramani" in r.name:
                r.current_water_depth_cm = round(4.0 * road_depth_mult, 1)
            else:
                r.current_water_depth_cm = round(6.0 * road_depth_mult, 1)
                
            r.predicted_depth_1h_cm = round(r.current_water_depth_cm * 1.8, 1)
            r.predicted_depth_3h_cm = round(r.current_water_depth_cm * 2.5, 1)
            
            if r.current_water_depth_cm > 40.0:
                r.passability_status = "IMPASSABLE"
                r.flood_probability_pct = 95.0
            elif r.current_water_depth_cm > 15.0:
                r.passability_status = "SLOW"
                r.flood_probability_pct = 65.0
            else:
                r.passability_status = "PASSABLE"
                r.flood_probability_pct = 20.0

        # 3. Update Drain Nodes & Segments
        nodes = db.query(DrainNode).all()
        for n in nodes:
            n.water_level_m = round(min(n.chamber_depth_m, 1.2 * sensor_level_mult), 2)
            if n.water_level_m >= n.surcharge_level_m:
                n.status = "SURCHARGE"
            elif scenario == "SURCHARGE_BACKFLOW" and "Outfall" in n.node_code:
                n.status = "BACKFLOW"
            else:
                n.status = "NORMAL"

        segments = db.query(DrainSegment).all()
        for s in segments:
            s.current_flow_m3s = round(s.design_capacity_m3s * 0.45 * drain_flow_mult, 2)
            s.capacity_utilization_pct = round((s.current_flow_m3s / max(s.design_capacity_m3s, 1.0)) * 100.0, 1)
            if s.capacity_utilization_pct > 100.0:
                s.condition_status = "OVERFLOW"
            elif s.capacity_utilization_pct > 80.0:
                s.condition_status = "PARTIAL_BLOCKAGE"
            else:
                s.condition_status = "NORMAL"

        # 4. Update Sensors
        sensors = db.query(Sensor).all()
        for sn in sensors:
            if sn.sensor_type == "WATER_LEVEL":
                sn.current_value = round(1.2 * sensor_level_mult, 2)
                sn.health_status = "CRITICAL" if sn.current_value >= sn.critical_threshold else ("WARNING" if sn.current_value >= sn.warning_threshold else "ONLINE")
            elif sn.sensor_type == "RAIN_GAUGE":
                sn.current_value = rain_rate
                sn.health_status = "CRITICAL" if sn.current_value >= 80.0 else ("WARNING" if sn.current_value >= 40.0 else "ONLINE")
            elif sn.sensor_type == "FLOW_VELOCITY":
                sn.current_value = round(2.0 * drain_flow_mult, 2)

        # 5. Generate Triggered Alert if Cloudburst
        if scenario in ["CLOUDBURST_100MM", "EXTREME_STORM"]:
            alert = Alert(
                title="🚨 FLASH FLOOD EMERGENCY: 115 mm/hr Extreme Cloudburst",
                description="Convective cloudburst cell centered over Velachery-Adyar basin. Multiple secondary storm drains surcharged. Vijayanagar bus terminus impassable (depth > 85cm). Emergency rescue mobilized.",
                severity="CRITICAL",
                area_id=1,
                alert_type="FLOOD_NOWCAST",
                is_active=True,
                is_acknowledged=False
            )
            db.add(alert)

        # 6. Audit Log
        db.add(AuditLog(
            username="DEMO_CONTROLLER",
            action=f"TRIGGER_SIMULATION_{scenario}",
            severity="WARNING" if "CLOUDBURST" in scenario else "INFO",
            details=f"Applied scenario '{scenario}' across Chennai hydrologic and hydraulic nodes."
        ))

        db.commit()
        return {
            "status": "SUCCESS",
            "scenario": scenario,
            "simulated_rainfall_mm_hr": rain_rate,
            "radar_reflectivity_dbz": radar_dbz,
            "surcharge_status": surcharge_status
        }

simulation_manager = SimulationManager()
