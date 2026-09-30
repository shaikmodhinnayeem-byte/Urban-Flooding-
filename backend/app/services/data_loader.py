import json
import datetime
from sqlalchemy.orm import Session
from app.models.schema import (
    User, Area, Road, DrainNode, DrainSegment, Sensor, SensorReading,
    RainfallRecord, TerrainDEM, FloodPrediction, Alert, RescueTeam, RescueTask,
    DatasetRegistry, MLModelRegistry, AuditLog
)
from app.core.security import get_password_hash

def seed_database(db: Session):
    # Ensure users are seeded regardless of prior area seeds
    try:
        if db.query(User).count() == 0:
            users_data = [
                User(name="Dr. K. Radhakrishnan (Chief Disaster Controller)", email="admin@drainx.gov.in", password_hash=get_password_hash("Admin@123"), role="admin"),
                User(name="Er. S. Anbarasu (Zonal Chief Engineer)", email="user@chennaicorp.gov.in", password_hash=get_password_hash("User@123"), role="user"),
                User(name="Kavitha Raman (Chennai Residents Welfare Association)", email="citizen@chennai.in", password_hash=get_password_hash("Citizen@123"), role="user"),
                User(name="Inspector Rajesh Sharma (NDRF Flood Rescue Lead)", email="rescue.lead@ndrf.gov.in", password_hash=get_password_hash("Rescue@123"), role="user"),
            ]
            db.add_all(users_data)
            db.commit()
            print("[INFO] Users table seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"[INFO] Users seed check/status: {e}")

    # Check if already seeded with all 14 areas
    if db.query(Area).count() >= 14 and db.query(Road).count() >= 40:
        return

    print("[INFO] Re-seeding comprehensive 14 Chennai Metropolitan Zones with official SIH datasets...")
    # Clear existing tables to ensure clean multi-ward seed
    db.query(SensorReading).delete()
    db.query(Sensor).delete()
    db.query(FloodPrediction).delete()
    db.query(TerrainDEM).delete()
    db.query(RainfallRecord).delete()
    db.query(DrainSegment).delete()
    db.query(DrainNode).delete()
    db.query(Road).delete()
    db.query(Area).delete()
    db.query(Alert).delete()
    db.query(RescueTask).delete()
    db.query(RescueTeam).delete()
    db.query(DatasetRegistry).delete()
    db.query(MLModelRegistry).delete()
    db.query(User).delete()
    db.commit()

    # 1. Users
    users_data = [
        User(name="Dr. K. Radhakrishnan (Chief Disaster Controller)", email="admin@drainx.gov.in", password_hash=get_password_hash("Admin@123"), role="admin"),
        User(name="Er. S. Anbarasu (Zonal Chief Engineer)", email="user@chennaicorp.gov.in", password_hash=get_password_hash("User@123"), role="user"),
        User(name="Kavitha Raman (Chennai Residents Welfare Association)", email="citizen@chennai.in", password_hash=get_password_hash("Citizen@123"), role="user"),
        User(name="Inspector Rajesh Sharma (NDRF Flood Rescue Lead)", email="rescue.lead@ndrf.gov.in", password_hash=get_password_hash("Rescue@123"), role="user"),
    ]
    try:
        db.add_all(users_data)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[INFO] Users seed status: {e}")


    # 2. Comprehensive 14 Areas / Wards of Chennai
    areas_data = [
        Area(id=1, name="Velachery", zone_number=13, ward_number=179, center_lat=12.9815, center_lng=80.2180, zoom_level=14, population=185000, avg_elevation_m=2.4, impervious_ratio=0.88, catchment_area_sqkm=14.2, risk_level="WATCH"),
        Area(id=2, name="Adyar", zone_number=13, ward_number=173, center_lat=13.0012, center_lng=80.2565, zoom_level=14, population=142000, avg_elevation_m=3.8, impervious_ratio=0.78, catchment_area_sqkm=18.5, risk_level="NORMAL"),
        Area(id=3, name="Tambaram", zone_number=15, ward_number=192, center_lat=12.9249, center_lng=80.1200, zoom_level=13, population=210000, avg_elevation_m=14.2, impervious_ratio=0.72, catchment_area_sqkm=26.4, risk_level="NORMAL"),
        Area(id=4, name="T. Nagar", zone_number=10, ward_number=136, center_lat=13.0418, center_lng=80.2341, zoom_level=14, population=165000, avg_elevation_m=5.8, impervious_ratio=0.94, catchment_area_sqkm=11.2, risk_level="WATCH"),
        Area(id=5, name="Perungudi", zone_number=14, ward_number=186, center_lat=12.9654, center_lng=80.2461, zoom_level=14, population=128000, avg_elevation_m=2.9, impervious_ratio=0.84, catchment_area_sqkm=15.8, risk_level="WATCH"),
        Area(id=6, name="Kodambakkam", zone_number=10, ward_number=130, center_lat=13.0520, center_lng=80.2220, zoom_level=14, population=152000, avg_elevation_m=5.2, impervious_ratio=0.89, catchment_area_sqkm=9.8, risk_level="NORMAL"),
        Area(id=7, name="Mylapore", zone_number=9, ward_number=124, center_lat=13.0368, center_lng=80.2676, zoom_level=14, population=170000, avg_elevation_m=4.5, impervious_ratio=0.91, catchment_area_sqkm=8.4, risk_level="NORMAL"),
        Area(id=8, name="Sholinganallur", zone_number=15, ward_number=197, center_lat=12.9010, center_lng=80.2279, zoom_level=13, population=140000, avg_elevation_m=3.2, impervious_ratio=0.79, catchment_area_sqkm=22.1, risk_level="NORMAL"),
        Area(id=9, name="Guindy", zone_number=13, ward_number=170, center_lat=13.0067, center_lng=80.2025, zoom_level=14, population=135000, avg_elevation_m=6.8, impervious_ratio=0.92, catchment_area_sqkm=10.5, risk_level="NORMAL"),
        Area(id=10, name="Madipakkam", zone_number=14, ward_number=188, center_lat=12.9620, center_lng=80.1980, zoom_level=14, population=115000, avg_elevation_m=2.6, impervious_ratio=0.86, catchment_area_sqkm=12.4, risk_level="WATCH"),
        Area(id=11, name="Pallikaranai", zone_number=14, ward_number=189, center_lat=12.9380, center_lng=80.2150, zoom_level=13, population=98000, avg_elevation_m=2.2, impervious_ratio=0.76, catchment_area_sqkm=28.0, risk_level="CRITICAL"),
        Area(id=12, name="Anna Nagar", zone_number=8, ward_number=102, center_lat=13.0850, center_lng=80.2100, zoom_level=14, population=175000, avg_elevation_m=8.5, impervious_ratio=0.90, catchment_area_sqkm=13.2, risk_level="NORMAL"),
        Area(id=13, name="Kolathur", zone_number=6, ward_number=64, center_lat=13.1240, center_lng=80.2180, zoom_level=14, population=160000, avg_elevation_m=4.8, impervious_ratio=0.87, catchment_area_sqkm=16.5, risk_level="WATCH"),
        Area(id=14, name="Ambattur", zone_number=7, ward_number=82, center_lat=13.1143, center_lng=80.1548, zoom_level=13, population=240000, avg_elevation_m=12.5, impervious_ratio=0.85, catchment_area_sqkm=31.0, risk_level="NORMAL"),
    ]
    db.add_all(areas_data)
    db.commit()

    # 3. Roads & Streets for ALL 14 LOCATIONS
    roads_data = [
        # --- 1. Velachery (1) ---
        Road(area_id=1, name="Velachery 100 Feet Bypass Road", road_type="Primary Arterial", start_lat=12.9860, start_lng=80.2130, end_lat=12.9780, end_lng=80.2220, elevation_m=2.4, length_km=1.4, width_m=24.0, current_water_depth_cm=8.0, predicted_depth_1h_cm=28.0, predicted_depth_3h_cm=58.0, flood_probability_pct=45.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[12.9860, 80.2130], [12.9825, 80.2170], [12.9780, 80.2220]])),
        Road(area_id=1, name="Velachery Main Road (Vijayanagar Bus Terminus)", road_type="Secondary Arterial", start_lat=12.9760, start_lng=80.2210, end_lat=12.9720, end_lng=80.2240, elevation_m=1.9, length_km=1.1, width_m=18.0, current_water_depth_cm=14.0, predicted_depth_1h_cm=48.0, predicted_depth_3h_cm=85.0, flood_probability_pct=68.0, passability_status="SLOW", is_critical_route=True, coordinates_json=json.dumps([[12.9760, 80.2210], [12.9740, 80.2225], [12.9720, 80.2240]])),
        Road(area_id=1, name="Taramani Link Road", road_type="Primary Arterial", start_lat=12.9780, start_lng=80.2220, end_lat=12.9840, end_lng=80.2380, elevation_m=3.6, length_km=1.9, width_m=22.0, current_water_depth_cm=4.0, predicted_depth_1h_cm=16.0, predicted_depth_3h_cm=35.0, flood_probability_pct=25.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[12.9780, 80.2220], [12.9805, 80.2300], [12.9840, 80.2380]])),

        # --- 2. Adyar (2) ---
        Road(area_id=2, name="Sardar Patel Road (IIT/CLRI Corridor)", road_type="Primary Arterial", start_lat=13.0060, start_lng=80.2450, end_lat=13.0010, end_lng=80.2580, elevation_m=4.8, length_km=1.6, width_m=28.0, current_water_depth_cm=5.0, predicted_depth_1h_cm=18.0, predicted_depth_3h_cm=32.0, flood_probability_pct=22.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0060, 80.2450], [13.0035, 80.2520], [13.0010, 80.2580]])),
        Road(area_id=2, name="L.B. Road (Lattice Bridge Road)", road_type="Primary Arterial", start_lat=13.0010, start_lng=80.2580, end_lat=12.9880, end_lng=80.2600, elevation_m=3.5, length_km=1.5, width_m=22.0, current_water_depth_cm=9.0, predicted_depth_1h_cm=26.0, predicted_depth_3h_cm=52.0, flood_probability_pct=48.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0010, 80.2580], [12.9940, 80.2590], [12.9880, 80.2600]])),

        # --- 3. Tambaram (3) ---
        Road(area_id=3, name="GST Road (Grand Southern Trunk)", road_type="National Highway", start_lat=12.9320, start_lng=80.1140, end_lat=12.9180, end_lng=80.1250, elevation_m=15.2, length_km=2.1, width_m=32.0, current_water_depth_cm=4.0, predicted_depth_1h_cm=14.0, predicted_depth_3h_cm=28.0, flood_probability_pct=18.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[12.9320, 80.1140], [12.9250, 80.1190], [12.9180, 80.1250]])),
        Road(area_id=3, name="Chitlapakkam Main Road", road_type="Secondary Arterial", start_lat=12.9360, start_lng=80.1320, end_lat=12.9260, end_lng=80.1380, elevation_m=11.8, length_km=1.4, width_m=16.0, current_water_depth_cm=12.0, predicted_depth_1h_cm=38.0, predicted_depth_3h_cm=72.0, flood_probability_pct=64.0, passability_status="SLOW", is_critical_route=False, coordinates_json=json.dumps([[12.9360, 80.1320], [12.9310, 80.1350], [12.9260, 80.1380]])),

        # --- 4. T. Nagar (4) ---
        Road(area_id=4, name="Usman Road (Flyover Underpass)", road_type="Primary Arterial", start_lat=13.0460, start_lng=80.2310, end_lat=13.0370, end_lng=80.2360, elevation_m=4.6, length_km=1.3, width_m=22.0, current_water_depth_cm=12.0, predicted_depth_1h_cm=44.0, predicted_depth_3h_cm=78.0, flood_probability_pct=72.0, passability_status="SLOW", is_critical_route=True, coordinates_json=json.dumps([[13.0460, 80.2310], [13.0415, 80.2335], [13.0370, 80.2360]])),
        Road(area_id=4, name="Rangarajapuram Subway Link", road_type="Subway Tunnel", start_lat=13.0420, start_lng=80.2260, end_lat=13.0390, end_lng=80.2290, elevation_m=2.8, length_km=0.5, width_m=12.0, current_water_depth_cm=22.0, predicted_depth_1h_cm=75.0, predicted_depth_3h_cm=125.0, flood_probability_pct=92.0, passability_status="IMPASSABLE", is_critical_route=False, coordinates_json=json.dumps([[13.0420, 80.2260], [13.0405, 80.2275], [13.0390, 80.2290]])),

        # --- 5. Perungudi (5) ---
        Road(area_id=5, name="OMR Expressway (Rajiv Gandhi Salai - Perungudi)", road_type="Expressway Arterial", start_lat=12.9720, start_lng=80.2480, end_lat=12.9580, end_lng=80.2440, elevation_m=3.2, length_km=1.8, width_m=32.0, current_water_depth_cm=7.0, predicted_depth_1h_cm=24.0, predicted_depth_3h_cm=48.0, flood_probability_pct=38.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[12.9720, 80.2480], [12.9650, 80.2460], [12.9580, 80.2440]])),
        Road(area_id=5, name="Perungudi Industrial Estate Road", road_type="Industrial Arterial", start_lat=12.9680, start_lng=80.2380, end_lat=12.9620, end_lng=80.2450, elevation_m=2.6, length_km=1.2, width_m=16.0, current_water_depth_cm=13.0, predicted_depth_1h_cm=45.0, predicted_depth_3h_cm=80.0, flood_probability_pct=70.0, passability_status="SLOW", is_critical_route=False, coordinates_json=json.dumps([[12.9680, 80.2380], [12.9650, 80.2415], [12.9620, 80.2450]])),

        # --- 6. Kodambakkam (6) ---
        Road(area_id=6, name="Arcot Road (Kodambakkam Flyover Corridor)", road_type="Primary Arterial", start_lat=13.0560, start_lng=80.2150, end_lat=13.0480, end_lng=80.2280, elevation_m=5.4, length_km=1.7, width_m=22.0, current_water_depth_cm=8.0, predicted_depth_1h_cm=28.0, predicted_depth_3h_cm=55.0, flood_probability_pct=42.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0560, 80.2150], [13.0520, 80.2215], [13.0480, 80.2280]])),
        Road(area_id=6, name="Trustpuram Main Road", road_type="Local Collector", start_lat=13.0540, start_lng=80.2200, end_lat=13.0490, end_lng=80.2240, elevation_m=4.2, length_km=0.8, width_m=14.0, current_water_depth_cm=14.0, predicted_depth_1h_cm=46.0, predicted_depth_3h_cm=82.0, flood_probability_pct=75.0, passability_status="SLOW", is_critical_route=False, coordinates_json=json.dumps([[13.0540, 80.2200], [13.0515, 80.2220], [13.0490, 80.2240]])),

        # --- 7. Mylapore (7) ---
        Road(area_id=7, name="Kutchery Road (Luz Church Link)", road_type="Primary Arterial", start_lat=13.0410, start_lng=80.2620, end_lat=13.0340, end_lng=80.2720, elevation_m=4.6, length_km=1.3, width_m=18.0, current_water_depth_cm=6.0, predicted_depth_1h_cm=20.0, predicted_depth_3h_cm=40.0, flood_probability_pct=30.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0410, 80.2620], [13.0375, 80.2670], [13.0340, 80.2720]])),
        Road(area_id=7, name="San Thome High Road", road_type="Coastal Arterial", start_lat=13.0350, start_lng=80.2770, end_lat=13.0240, end_lng=80.2780, elevation_m=3.8, length_km=1.2, width_m=20.0, current_water_depth_cm=9.0, predicted_depth_1h_cm=30.0, predicted_depth_3h_cm=58.0, flood_probability_pct=52.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0350, 80.2770], [13.0295, 80.2775], [13.0240, 80.2780]])),

        # --- 8. Sholinganallur (8) ---
        Road(area_id=8, name="OMR IT Corridor (Sholinganallur Junction)", road_type="Primary Expressway", start_lat=12.9120, start_lng=80.2260, end_lat=12.8920, end_lng=80.2300, elevation_m=3.5, length_km=2.3, width_m=34.0, current_water_depth_cm=6.0, predicted_depth_1h_cm=22.0, predicted_depth_3h_cm=45.0, flood_probability_pct=32.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[12.9120, 80.2260], [12.9020, 80.2280], [12.8920, 80.2300]])),
        Road(area_id=8, name="ECR-OMR Link Road (Akkarai Link)", road_type="Secondary Arterial", start_lat=12.9010, start_lng=80.2290, end_lat=12.8980, end_lng=80.2480, elevation_m=2.8, length_km=2.0, width_m=18.0, current_water_depth_cm=12.0, predicted_depth_1h_cm=42.0, predicted_depth_3h_cm=75.0, flood_probability_pct=65.0, passability_status="SLOW", is_critical_route=False, coordinates_json=json.dumps([[12.9010, 80.2290], [12.8995, 80.2385], [12.8980, 80.2480]])),

        # --- 9. Guindy (9) ---
        Road(area_id=9, name="Kathipara Grade Separator (Cloverleaf Corridor)", road_type="Grade Separator", start_lat=13.0100, start_lng=80.1980, end_lat=13.0030, end_lng=80.2070, elevation_m=7.4, length_km=1.5, width_m=36.0, current_water_depth_cm=3.0, predicted_depth_1h_cm=10.0, predicted_depth_3h_cm=20.0, flood_probability_pct=15.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0100, 80.1980], [13.0065, 80.2025], [13.0030, 80.2070]])),
        Road(area_id=9, name="Guindy Industrial Estate Main Road", road_type="Industrial Arterial", start_lat=13.0120, start_lng=80.2060, end_lat=13.0040, end_lng=80.2120, elevation_m=5.8, length_km=1.2, width_m=20.0, current_water_depth_cm=9.0, predicted_depth_1h_cm=32.0, predicted_depth_3h_cm=60.0, flood_probability_pct=50.0, passability_status="PASSABLE", is_critical_route=False, coordinates_json=json.dumps([[13.0120, 80.2060], [13.0080, 80.2090], [13.0040, 80.2120]])),

        # --- 10. Madipakkam (10) ---
        Road(area_id=10, name="Medavakkam Main Road (Madipakkam Jn)", road_type="Primary Arterial", start_lat=12.9690, start_lng=80.1920, end_lat=12.9550, end_lng=80.2020, elevation_m=2.8, length_km=1.9, width_m=22.0, current_water_depth_cm=11.0, predicted_depth_1h_cm=40.0, predicted_depth_3h_cm=72.0, flood_probability_pct=62.0, passability_status="SLOW", is_critical_route=True, coordinates_json=json.dumps([[12.9690, 80.1920], [12.9620, 80.1970], [12.9550, 80.2020]])),
        Road(area_id=10, name="Ram Nagar South 1st Main Road", road_type="Local Collector", start_lat=12.9640, start_lng=80.1950, end_lat=12.9580, end_lng=80.1990, elevation_m=2.1, length_km=0.9, width_m=12.0, current_water_depth_cm=16.0, predicted_depth_1h_cm=52.0, predicted_depth_3h_cm=90.0, flood_probability_pct=80.0, passability_status="IMPASSABLE", is_critical_route=False, coordinates_json=json.dumps([[12.9640, 80.1950], [12.9610, 80.1970], [12.9580, 80.1990]])),

        # --- 11. Pallikaranai (11) ---
        Road(area_id=11, name="200 Feet Radial Road (Marshland Causeway)", road_type="Expressway Causeway", start_lat=12.9460, start_lng=80.2040, end_lat=12.9320, end_lng=80.2260, elevation_m=2.3, length_km=2.8, width_m=34.0, current_water_depth_cm=18.0, predicted_depth_1h_cm=60.0, predicted_depth_3h_cm=105.0, flood_probability_pct=88.0, passability_status="IMPASSABLE", is_critical_route=True, coordinates_json=json.dumps([[12.9460, 80.2040], [12.9390, 80.2150], [12.9320, 80.2260]])),
        Road(area_id=11, name="Pallikaranai Oil Mill Road", road_type="Local Collector", start_lat=12.9420, start_lng=80.2100, end_lat=12.9350, end_lng=80.2180, elevation_m=1.9, length_km=1.1, width_m=14.0, current_water_depth_cm=20.0, predicted_depth_1h_cm=68.0, predicted_depth_3h_cm=115.0, flood_probability_pct=92.0, passability_status="IMPASSABLE", is_critical_route=False, coordinates_json=json.dumps([[12.9420, 80.2100], [12.9385, 80.2140], [12.9350, 80.2180]])),

        # --- 12. Anna Nagar (12) ---
        Road(area_id=12, name="Anna Nagar 2nd Avenue (Roundtana Corridor)", road_type="Primary Arterial", start_lat=13.0900, start_lng=80.2040, end_lat=13.0800, end_lng=80.2160, elevation_m=8.8, length_km=1.6, width_m=26.0, current_water_depth_cm=3.0, predicted_depth_1h_cm=12.0, predicted_depth_3h_cm=24.0, flood_probability_pct=16.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0900, 80.2040], [13.0850, 80.2100], [13.0800, 80.2160]])),
        Road(area_id=12, name="Poonamallee High Road (Anna Arch Section)", road_type="National Highway", start_lat=13.0780, start_lng=80.2140, end_lat=13.0740, end_lng=80.2280, elevation_m=7.2, length_km=1.8, width_m=32.0, current_water_depth_cm=6.0, predicted_depth_1h_cm=22.0, predicted_depth_3h_cm=44.0, flood_probability_pct=34.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.0780, 80.2140], [13.0760, 80.2210], [13.0740, 80.2280]])),

        # --- 13. Kolathur (13) ---
        Road(area_id=13, name="100 Feet Inner Ring Road (Kolathur Jn)", road_type="Primary Arterial", start_lat=13.1300, start_lng=80.2120, end_lat=13.1180, end_lng=80.2240, elevation_m=5.1, length_km=1.7, width_m=28.0, current_water_depth_cm=8.0, predicted_depth_1h_cm=30.0, predicted_depth_3h_cm=58.0, flood_probability_pct=46.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.1300, 80.2120], [13.1240, 80.2180], [13.1180, 80.2240]])),
        Road(area_id=13, name="Thanikachalam Nagar Main Road", road_type="Secondary Arterial", start_lat=13.1260, start_lng=80.2220, end_lat=13.1200, end_lng=80.2280, elevation_m=3.8, length_km=1.0, width_m=16.0, current_water_depth_cm=15.0, predicted_depth_1h_cm=48.0, predicted_depth_3h_cm=85.0, flood_probability_pct=78.0, passability_status="SLOW", is_critical_route=False, coordinates_json=json.dumps([[13.1260, 80.2220], [13.1230, 80.2250], [13.1200, 80.2280]])),

        # --- 14. Ambattur (14) ---
        Road(area_id=14, name="CTH Road (Chennai-Tiruvallur High Road)", road_type="State Highway", start_lat=13.1220, start_lng=80.1450, end_lat=13.1060, end_lng=80.1650, elevation_m=13.2, length_km=2.6, width_m=30.0, current_water_depth_cm=4.0, predicted_depth_1h_cm=15.0, predicted_depth_3h_cm=30.0, flood_probability_pct=20.0, passability_status="PASSABLE", is_critical_route=True, coordinates_json=json.dumps([[13.1220, 80.1450], [13.1140, 80.1550], [13.1060, 80.1650]])),
        Road(area_id=14, name="Ambattur Industrial Estate 3rd Main Road", road_type="Industrial Arterial", start_lat=13.1120, start_lng=80.1520, end_lat=13.1050, end_lng=80.1580, elevation_m=11.6, length_km=1.1, width_m=20.0, current_water_depth_cm=10.0, predicted_depth_1h_cm=36.0, predicted_depth_3h_cm=68.0, flood_probability_pct=58.0, passability_status="PASSABLE", is_critical_route=False, coordinates_json=json.dumps([[13.1120, 80.1520], [13.1085, 80.1550], [13.1050, 80.1580]])),
    ]
    db.add_all(roads_data)
    db.commit()

    # 4. Drainage Network Graph: Nodes for ALL 14 LOCATIONS
    drain_nodes = [
        # Velachery (1)
        DrainNode(id=1, area_id=1, node_code="MH-VEL-01 (Lake Inlet)", node_type="INLET", lat=12.9805, lng=80.2135, invert_level_m=0.5, ground_elevation_m=2.2, chamber_depth_m=3.0, water_level_m=1.4, surcharge_level_m=2.0, status="NORMAL", has_iot_sensor=True, sensor_id="SN-VEL-WL01"),
        DrainNode(id=2, area_id=1, node_code="MH-VEL-03 (Vijayanagar Bus Stand)", node_type="MANHOLE", lat=12.9750, lng=80.2220, invert_level_m=0.3, ground_elevation_m=1.9, chamber_depth_m=3.5, water_level_m=1.7, surcharge_level_m=1.6, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-VEL-WL03"),

        # Adyar (2)
        DrainNode(id=3, area_id=2, node_code="MH-ADY-01 (CLRI Surcharge Node)", node_type="INLET", lat=13.0040, lng=80.2480, invert_level_m=1.2, ground_elevation_m=4.5, chamber_depth_m=3.5, water_level_m=1.0, surcharge_level_m=2.8, status="NORMAL", has_iot_sensor=True, sensor_id="SN-ADY-WL01"),
        DrainNode(id=4, area_id=2, node_code="MH-ADY-02 (Adyar Estuary Outfall)", node_type="OUTFALL", lat=13.0110, lng=80.2600, invert_level_m=0.1, ground_elevation_m=3.2, chamber_depth_m=4.0, water_level_m=1.8, surcharge_level_m=2.5, status="NORMAL", has_iot_sensor=True, sensor_id="SN-ADY-WL02"),

        # Tambaram (3)
        DrainNode(id=5, area_id=3, node_code="MH-TAM-01 (GST Flyover Drain)", node_type="INLET", lat=12.9280, lng=80.1180, invert_level_m=9.5, ground_elevation_m=14.8, chamber_depth_m=4.0, water_level_m=1.2, surcharge_level_m=3.2, status="NORMAL", has_iot_sensor=True, sensor_id="SN-TAM-WL01"),
        DrainNode(id=6, area_id=3, node_code="MH-TAM-02 (Chitlapakkam Lake Surplus)", node_type="OUTFALL", lat=12.9330, lng=80.1340, invert_level_m=8.2, ground_elevation_m=12.1, chamber_depth_m=3.5, water_level_m=1.9, surcharge_level_m=2.4, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-TAM-WL02"),

        # T. Nagar (4)
        DrainNode(id=7, area_id=4, node_code="MH-TN-01 (Mambalam Canal Invert)", node_type="PRIMARY_CANAL", lat=13.0420, lng=80.2330, invert_level_m=1.8, ground_elevation_m=5.4, chamber_depth_m=4.2, water_level_m=2.1, surcharge_level_m=3.0, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-TN-WL01"),
        DrainNode(id=8, area_id=4, node_code="MH-TN-02 (Panagal Park Sump)", node_type="PUMP_STATION", lat=13.0450, lng=80.2360, invert_level_m=2.0, ground_elevation_m=5.9, chamber_depth_m=4.5, water_level_m=1.6, surcharge_level_m=3.2, status="NORMAL", has_iot_sensor=True, sensor_id="SN-TN-PS01"),

        # Perungudi (5)
        DrainNode(id=9, area_id=5, node_code="MH-PER-01 (OMR Storm Channel)", node_type="JUNCTION", lat=12.9670, lng=80.2450, invert_level_m=0.6, ground_elevation_m=3.1, chamber_depth_m=3.2, water_level_m=1.3, surcharge_level_m=2.2, status="NORMAL", has_iot_sensor=True, sensor_id="SN-PER-WL01"),
        DrainNode(id=10, area_id=5, node_code="MH-PER-02 (Marshland Outfall Sluice)", node_type="OUTFALL", lat=12.9600, lng=80.2400, invert_level_m=0.2, ground_elevation_m=2.4, chamber_depth_m=3.5, water_level_m=1.8, surcharge_level_m=2.0, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-PER-WL02"),

        # Kodambakkam (6)
        DrainNode(id=11, area_id=6, node_code="MH-KOD-01 (Trustpuram Surcharge Well)", node_type="MANHOLE", lat=13.0510, lng=80.2210, invert_level_m=1.5, ground_elevation_m=4.8, chamber_depth_m=3.6, water_level_m=1.7, surcharge_level_m=2.5, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-KOD-WL01"),

        # Mylapore (7)
        DrainNode(id=12, area_id=7, node_code="MH-MYL-02 (Buckingham Canal Tidal Outfall)", node_type="OUTFALL", lat=13.0320, lng=80.2740, invert_level_m=0.0, ground_elevation_m=3.6, chamber_depth_m=4.0, water_level_m=2.0, surcharge_level_m=2.4, status="BACKFLOW", has_iot_sensor=True, sensor_id="SN-MYL-WL01"),

        # Sholinganallur (8)
        DrainNode(id=13, area_id=8, node_code="MH-SHO-01 (Sholinganallur Jn Sump)", node_type="JUNCTION", lat=12.9030, lng=80.2280, invert_level_m=0.8, ground_elevation_m=3.6, chamber_depth_m=3.5, water_level_m=1.2, surcharge_level_m=2.6, status="NORMAL", has_iot_sensor=True, sensor_id="SN-SHO-WL01"),

        # Guindy (9)
        DrainNode(id=14, area_id=9, node_code="MH-GUI-01 (Kathipara Basin Drain)", node_type="JUNCTION", lat=13.0070, lng=80.2010, invert_level_m=2.8, ground_elevation_m=7.2, chamber_depth_m=4.0, water_level_m=1.2, surcharge_level_m=3.5, status="NORMAL", has_iot_sensor=True, sensor_id="SN-GUI-WL01"),

        # Madipakkam (10)
        DrainNode(id=15, area_id=10, node_code="MH-MAD-01 (Ram Nagar Surcharge Sump)", node_type="MANHOLE", lat=12.9610, lng=80.1970, invert_level_m=0.4, ground_elevation_m=2.4, chamber_depth_m=3.4, water_level_m=1.6, surcharge_level_m=1.8, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-MAD-WL01"),

        # Pallikaranai (11)
        DrainNode(id=16, area_id=11, node_code="MH-PAL-01 (200ft Radial Rd Sluice)", node_type="PRIMARY_CANAL", lat=12.9390, lng=80.2150, invert_level_m=0.1, ground_elevation_m=2.0, chamber_depth_m=3.8, water_level_m=1.9, surcharge_level_m=1.7, status="OVERFLOW", has_iot_sensor=True, sensor_id="SN-PAL-WL01"),

        # Anna Nagar (12)
        DrainNode(id=17, area_id=12, node_code="MH-ANN-01 (Otteri Nullah Feeder)", node_type="PRIMARY_CANAL", lat=13.0820, lng=80.2120, invert_level_m=3.5, ground_elevation_m=8.2, chamber_depth_m=4.2, water_level_m=1.4, surcharge_level_m=3.8, status="NORMAL", has_iot_sensor=True, sensor_id="SN-ANN-WL01"),

        # Kolathur (13)
        DrainNode(id=18, area_id=13, node_code="MH-KOL-01 (Retteri Surplus Spillway)", node_type="OUTFALL", lat=13.1230, lng=80.2200, invert_level_m=1.2, ground_elevation_m=4.6, chamber_depth_m=3.6, water_level_m=1.7, surcharge_level_m=2.4, status="SURCHARGE", has_iot_sensor=True, sensor_id="SN-KOL-WL01"),

        # Ambattur (14)
        DrainNode(id=19, area_id=14, node_code="MH-AMB-01 (Industrial Lake Sump)", node_type="INLET", lat=13.1110, lng=80.1540, invert_level_m=7.2, ground_elevation_m=12.8, chamber_depth_m=4.5, water_level_m=1.5, surcharge_level_m=3.6, status="NORMAL", has_iot_sensor=True, sensor_id="SN-AMB-WL01"),
    ]
    db.add_all(drain_nodes)
    db.commit()

    # 5. Drainage Network Graph: Segments for ALL LOCATIONS
    drain_segments = [
        DrainSegment(id=1, segment_code="DS-VEL-PRIM-01", source_node_id=1, target_node_id=2, drain_type="PRIMARY_CANAL", length_m=450.0, width_m=3.5, depth_m=2.8, diameter_m=3.0, slope_pct=0.18, manning_roughness_n=0.016, design_capacity_m3s=38.0, current_flow_m3s=18.5, capacity_utilization_pct=48.7, condition_status="NORMAL", debris_blockage_pct=8.0, outfall_name="Velachery Surplus Channel"),
        DrainSegment(id=2, segment_code="DS-ADY-PRIM-01", source_node_id=3, target_node_id=4, drain_type="PRIMARY_CANAL", length_m=1200.0, width_m=5.0, depth_m=3.2, diameter_m=4.5, slope_pct=0.20, manning_roughness_n=0.018, design_capacity_m3s=58.0, current_flow_m3s=22.0, capacity_utilization_pct=37.9, condition_status="NORMAL", debris_blockage_pct=6.0, outfall_name="Adyar River Estuary"),
        DrainSegment(id=3, segment_code="DS-TAM-PRIM-01", source_node_id=5, target_node_id=6, drain_type="PRIMARY_CANAL", length_m=1450.0, width_m=4.0, depth_m=2.6, diameter_m=3.5, slope_pct=0.35, manning_roughness_n=0.020, design_capacity_m3s=42.0, current_flow_m3s=16.0, capacity_utilization_pct=38.1, condition_status="NORMAL", debris_blockage_pct=12.0, outfall_name="Chitlapakkam Lake Surplus"),
        DrainSegment(id=4, segment_code="DS-TN-PRIM-01", source_node_id=7, target_node_id=8, drain_type="PRIMARY_CANAL", length_m=950.0, width_m=4.2, depth_m=3.0, diameter_m=3.8, slope_pct=0.14, manning_roughness_n=0.022, design_capacity_m3s=36.0, current_flow_m3s=29.5, capacity_utilization_pct=81.9, condition_status="PARTIAL_BLOCKAGE", debris_blockage_pct=28.0, outfall_name="Mambalam Canal"),
        DrainSegment(id=5, segment_code="DS-PER-PRIM-01", source_node_id=9, target_node_id=10, drain_type="PRIMARY_CANAL", length_m=1100.0, width_m=4.8, depth_m=3.0, diameter_m=4.0, slope_pct=0.10, manning_roughness_n=0.020, design_capacity_m3s=48.0, current_flow_m3s=38.0, capacity_utilization_pct=79.2, condition_status="PARTIAL_BLOCKAGE", debris_blockage_pct=22.0, outfall_name="Pallikaranai Marshland Sluice"),
        DrainSegment(id=6, segment_code="DS-PAL-PRIM-01", source_node_id=16, target_node_id=10, drain_type="PRIMARY_CANAL", length_m=1800.0, width_m=6.0, depth_m=3.5, diameter_m=5.0, slope_pct=0.08, manning_roughness_n=0.024, design_capacity_m3s=65.0, current_flow_m3s=68.0, capacity_utilization_pct=104.6, condition_status="OVERFLOW", debris_blockage_pct=32.0, outfall_name="Pallikaranai Central Basin"),
        DrainSegment(id=7, segment_code="DS-KOL-PRIM-01", source_node_id=18, target_node_id=18, drain_type="PRIMARY_CANAL", length_m=1250.0, width_m=4.5, depth_m=2.8, diameter_m=3.8, slope_pct=0.15, manning_roughness_n=0.020, design_capacity_m3s=38.0, current_flow_m3s=31.0, capacity_utilization_pct=81.5, condition_status="PARTIAL_BLOCKAGE", debris_blockage_pct=24.0, outfall_name="Thanikachalam Drain"),
    ]
    db.add_all(drain_segments)
    db.commit()

    # 6. IoT Sensors for ALL 14 LOCATIONS
    sensors_data = [
        Sensor(id=1, sensor_code="SN-VEL-WL01", name="Velachery Lake Inflow Radar Depth Gauge", sensor_type="WATER_LEVEL", area_id=1, lat=12.9805, lng=80.2135, current_value=1.42, unit="m", warning_threshold=1.80, critical_threshold=2.50, battery_level_pct=96.0, signal_rssi=-58, health_status="ONLINE"),
        Sensor(id=2, sensor_code="SN-VEL-RG01", name="Velachery TNSDMA Optical Rain Gauge", sensor_type="RAIN_GAUGE", area_id=1, lat=12.9815, lng=80.2180, current_value=24.5, unit="mm/hr", warning_threshold=45.0, critical_threshold=80.0, battery_level_pct=94.0, signal_rssi=-64, health_status="ONLINE"),
        Sensor(id=3, sensor_code="SN-ADY-WL01", name="Adyar River Bridge Water Level Transducer", sensor_type="WATER_LEVEL", area_id=2, lat=13.0090, lng=80.2580, current_value=1.85, unit="m", warning_threshold=2.50, critical_threshold=3.80, battery_level_pct=98.0, signal_rssi=-54, health_status="ONLINE"),
        Sensor(id=4, sensor_code="SN-TAM-WL01", name="Chitlapakkam Surplus Canal Ultrasonic Sensor", sensor_type="WATER_LEVEL", area_id=3, lat=12.9330, lng=80.1340, current_value=1.92, unit="m", warning_threshold=2.20, critical_threshold=3.00, battery_level_pct=89.0, signal_rssi=-68, health_status="WARNING"),
        Sensor(id=5, sensor_code="SN-TN-WL01", name="Mambalam Canal Ultrasonic Depth Gauge", sensor_type="WATER_LEVEL", area_id=4, lat=13.0420, lng=80.2330, current_value=2.15, unit="m", warning_threshold=2.00, critical_threshold=2.80, battery_level_pct=93.0, signal_rssi=-65, health_status="WARNING"),
        Sensor(id=6, sensor_code="SN-PER-WL01", name="Perungudi Marshland Inflow Radar Gauge", sensor_type="WATER_LEVEL", area_id=5, lat=12.9600, lng=80.2400, current_value=1.75, unit="m", warning_threshold=2.00, critical_threshold=2.80, battery_level_pct=94.0, signal_rssi=-59, health_status="ONLINE"),
        Sensor(id=7, sensor_code="SN-KOD-WL01", name="Trustpuram Surcharge Well Radar Gauge", sensor_type="WATER_LEVEL", area_id=6, lat=13.0510, lng=80.2210, current_value=1.68, unit="m", warning_threshold=1.80, critical_threshold=2.50, battery_level_pct=92.0, signal_rssi=-61, health_status="ONLINE"),
        Sensor(id=8, sensor_code="SN-MYL-WL01", name="Buckingham Canal Tidal Outfall Sensor", sensor_type="WATER_LEVEL", area_id=7, lat=13.0320, lng=80.2740, current_value=2.05, unit="m", warning_threshold=2.20, critical_threshold=3.00, battery_level_pct=95.0, signal_rssi=-58, health_status="WARNING"),
        Sensor(id=9, sensor_code="SN-SHO-WL01", name="Sholinganallur Backwater Radar Gauge", sensor_type="WATER_LEVEL", area_id=8, lat=12.8960, lng=80.2350, current_value=1.55, unit="m", warning_threshold=2.20, critical_threshold=3.20, battery_level_pct=96.0, signal_rssi=-57, health_status="ONLINE"),
        Sensor(id=10, sensor_code="SN-GUI-WL01", name="Kathipara Basin Ultrasonic Gauge", sensor_type="WATER_LEVEL", area_id=9, lat=13.0070, lng=80.2010, current_value=1.20, unit="m", warning_threshold=2.00, critical_threshold=3.00, battery_level_pct=97.0, signal_rssi=-55, health_status="ONLINE"),
        Sensor(id=11, sensor_code="SN-MAD-WL01", name="Ram Nagar Lowland Ultrasonic Sensor", sensor_type="WATER_LEVEL", area_id=10, lat=12.9610, lng=80.1970, current_value=1.82, unit="m", warning_threshold=1.80, critical_threshold=2.60, battery_level_pct=91.0, signal_rssi=-63, health_status="WARNING"),
        Sensor(id=12, sensor_code="SN-PAL-WL01", name="Pallikaranai Radial Road Radar Gauge", sensor_type="WATER_LEVEL", area_id=11, lat=12.9390, lng=80.2150, current_value=2.28, unit="m", warning_threshold=1.90, critical_threshold=2.60, battery_level_pct=88.0, signal_rssi=-70, health_status="CRITICAL"),
        Sensor(id=13, sensor_code="SN-ANN-WL01", name="Otteri Nullah Feeder Velocity Sensor", sensor_type="FLOW_VELOCITY", area_id=12, lat=13.0820, lng=80.2120, current_value=2.10, unit="m/s", warning_threshold=3.20, critical_threshold=4.50, battery_level_pct=96.0, signal_rssi=-56, health_status="ONLINE"),
        Sensor(id=14, sensor_code="SN-KOL-WL01", name="Retteri Surplus Spillway Radar Gauge", sensor_type="WATER_LEVEL", area_id=13, lat=13.1230, lng=80.2200, current_value=1.95, unit="m", warning_threshold=2.00, critical_threshold=2.80, battery_level_pct=90.0, signal_rssi=-67, health_status="WARNING"),
        Sensor(id=15, sensor_code="SN-AMB-WL01", name="Ambattur Industrial Lake Depth Gauge", sensor_type="WATER_LEVEL", area_id=14, lat=13.1110, lng=80.1540, current_value=1.45, unit="m", warning_threshold=2.20, critical_threshold=3.20, battery_level_pct=95.0, signal_rssi=-59, health_status="ONLINE"),
    ]
    db.add_all(sensors_data)
    db.commit()

    # 7. Rainfall Records for ALL 14 LOCATIONS
    now = datetime.datetime.utcnow()
    rainfall_records = [
        RainfallRecord(area_id=1, timestamp=now, intensity_mm_hr=24.5, accum_1h_mm=28.0, accum_3h_mm=46.5, radar_reflectivity_dbz=38.5, imd_station_code="IMD-DWR-CHENNAI-PORT", temp_c=26.8, humidity_pct=92.0, wind_speed_kmh=28.0, pressure_hpa=1002.5, forecast_30m_mm=18.0, forecast_1h_mm=38.0, forecast_2h_mm=62.0, forecast_3h_mm=95.0),
        RainfallRecord(area_id=2, timestamp=now, intensity_mm_hr=22.0, accum_1h_mm=25.0, accum_3h_mm=41.0, radar_reflectivity_dbz=36.0, imd_station_code="IMD-AWS-ADYAR", temp_c=27.0, humidity_pct=90.0, wind_speed_kmh=26.0, pressure_hpa=1002.8, forecast_30m_mm=16.0, forecast_1h_mm=34.0, forecast_2h_mm=55.0, forecast_3h_mm=82.0),
        RainfallRecord(area_id=3, timestamp=now, intensity_mm_hr=18.5, accum_1h_mm=20.0, accum_3h_mm=33.0, radar_reflectivity_dbz=32.5, imd_station_code="IMD-AWS-TAMBARAM-AFS", temp_c=27.5, humidity_pct=86.0, wind_speed_kmh=22.0, pressure_hpa=1003.4, forecast_30m_mm=12.0, forecast_1h_mm=26.0, forecast_2h_mm=44.0, forecast_3h_mm=68.0),
        RainfallRecord(area_id=4, timestamp=now, intensity_mm_hr=20.5, accum_1h_mm=23.0, accum_3h_mm=38.0, radar_reflectivity_dbz=35.0, imd_station_code="IMD-AWS-NUNGAMBAKKAM", temp_c=27.2, humidity_pct=89.0, wind_speed_kmh=24.0, pressure_hpa=1003.1, forecast_30m_mm=14.0, forecast_1h_mm=30.0, forecast_2h_mm=50.0, forecast_3h_mm=76.0),
        RainfallRecord(area_id=5, timestamp=now, intensity_mm_hr=23.0, accum_1h_mm=26.0, accum_3h_mm=44.0, radar_reflectivity_dbz=37.0, imd_station_code="IMD-AWS-PERUNGUDI", temp_c=26.9, humidity_pct=91.0, wind_speed_kmh=27.0, pressure_hpa=1002.6, forecast_30m_mm=17.0, forecast_1h_mm=36.0, forecast_2h_mm=58.0, forecast_3h_mm=88.0),
        RainfallRecord(area_id=6, timestamp=now, intensity_mm_hr=19.5, accum_1h_mm=22.0, accum_3h_mm=36.0, radar_reflectivity_dbz=34.0, imd_station_code="IMD-AWS-KODAMBAKKAM", temp_c=27.3, humidity_pct=88.0, wind_speed_kmh=23.0, pressure_hpa=1003.2, forecast_30m_mm=13.0, forecast_1h_mm=28.0, forecast_2h_mm=48.0, forecast_3h_mm=72.0),
        RainfallRecord(area_id=7, timestamp=now, intensity_mm_hr=21.0, accum_1h_mm=24.0, accum_3h_mm=39.0, radar_reflectivity_dbz=35.5, imd_station_code="IMD-AWS-MYLAPORE-PORT", temp_c=27.1, humidity_pct=90.0, wind_speed_kmh=25.0, pressure_hpa=1002.9, forecast_30m_mm=15.0, forecast_1h_mm=32.0, forecast_2h_mm=52.0, forecast_3h_mm=78.0),
        RainfallRecord(area_id=8, timestamp=now, intensity_mm_hr=19.0, accum_1h_mm=21.0, accum_3h_mm=35.0, radar_reflectivity_dbz=33.0, imd_station_code="IMD-AWS-SHOLINGANALLUR", temp_c=27.4, humidity_pct=87.0, wind_speed_kmh=24.0, pressure_hpa=1003.3, forecast_30m_mm=13.0, forecast_1h_mm=27.0, forecast_2h_mm=46.0, forecast_3h_mm=70.0),
        RainfallRecord(area_id=9, timestamp=now, intensity_mm_hr=21.5, accum_1h_mm=23.5, accum_3h_mm=38.5, radar_reflectivity_dbz=35.2, imd_station_code="IMD-AWS-GUINDY-MEENAMBAKKAM", temp_c=27.2, humidity_pct=89.0, wind_speed_kmh=25.0, pressure_hpa=1002.9, forecast_30m_mm=14.5, forecast_1h_mm=31.0, forecast_2h_mm=51.0, forecast_3h_mm=77.0),
        RainfallRecord(area_id=10, timestamp=now, intensity_mm_hr=25.0, accum_1h_mm=28.5, accum_3h_mm=47.0, radar_reflectivity_dbz=39.0, imd_station_code="IMD-AWS-MADIPAKKAM", temp_c=26.7, humidity_pct=93.0, wind_speed_kmh=29.0, pressure_hpa=1002.4, forecast_30m_mm=19.0, forecast_1h_mm=39.0, forecast_2h_mm=64.0, forecast_3h_mm=96.0),
        RainfallRecord(area_id=11, timestamp=now, intensity_mm_hr=28.0, accum_1h_mm=32.0, accum_3h_mm=54.0, radar_reflectivity_dbz=42.0, imd_station_code="IMD-AWS-PALLIKARANAI-MARSH", temp_c=26.4, humidity_pct=95.0, wind_speed_kmh=31.0, pressure_hpa=1001.9, forecast_30m_mm=22.0, forecast_1h_mm=46.0, forecast_2h_mm=75.0, forecast_3h_mm=112.0),
        RainfallRecord(area_id=12, timestamp=now, intensity_mm_hr=17.5, accum_1h_mm=19.0, accum_3h_mm=31.0, radar_reflectivity_dbz=31.5, imd_station_code="IMD-AWS-ANNA-NAGAR", temp_c=27.6, humidity_pct=85.0, wind_speed_kmh=21.0, pressure_hpa=1003.6, forecast_30m_mm=11.0, forecast_1h_mm=24.0, forecast_2h_mm=40.0, forecast_3h_mm=62.0),
        RainfallRecord(area_id=13, timestamp=now, intensity_mm_hr=23.5, accum_1h_mm=26.5, accum_3h_mm=45.0, radar_reflectivity_dbz=37.5, imd_station_code="IMD-AWS-KOLATHUR-PUZHAL", temp_c=26.9, humidity_pct=91.0, wind_speed_kmh=26.0, pressure_hpa=1002.7, forecast_30m_mm=17.5, forecast_1h_mm=37.0, forecast_2h_mm=59.0, forecast_3h_mm=89.0),
        RainfallRecord(area_id=14, timestamp=now, intensity_mm_hr=19.0, accum_1h_mm=21.5, accum_3h_mm=35.5, radar_reflectivity_dbz=33.5, imd_station_code="IMD-AWS-AMBATTUR-ESTATE", temp_c=27.4, humidity_pct=87.0, wind_speed_kmh=23.0, pressure_hpa=1003.3, forecast_30m_mm=13.0, forecast_1h_mm=27.5, forecast_2h_mm=46.5, forecast_3h_mm=71.0),
    ]
    db.add_all(rainfall_records)
    db.commit()

    # 8. Digital Elevation Model (DEM) Grid points for ALL 14 LOCATIONS
    dem_points = [
        TerrainDEM(area_id=1, lat=12.9860, lng=80.2130, elevation_m=3.8, slope_deg=0.8, flow_direction="SE", flow_accumulation_val=1200, is_depression=False),
        TerrainDEM(area_id=1, lat=12.9760, lng=80.2210, elevation_m=1.8, slope_deg=0.2, flow_direction="E", flow_accumulation_val=14200, is_depression=True),
        TerrainDEM(area_id=2, lat=13.0060, lng=80.2450, elevation_m=4.8, slope_deg=0.9, flow_direction="E", flow_accumulation_val=2100, is_depression=False),
        TerrainDEM(area_id=3, lat=12.9320, lng=80.1140, elevation_m=15.8, slope_deg=1.4, flow_direction="NE", flow_accumulation_val=3400, is_depression=False),
        TerrainDEM(area_id=4, lat=13.0460, lng=80.2310, elevation_m=4.6, slope_deg=0.4, flow_direction="S", flow_accumulation_val=7800, is_depression=True),
        TerrainDEM(area_id=5, lat=12.9610, lng=80.2360, elevation_m=2.1, slope_deg=0.2, flow_direction="E", flow_accumulation_val=16500, is_depression=True),
        TerrainDEM(area_id=6, lat=13.0540, lng=80.2200, elevation_m=4.2, slope_deg=0.3, flow_direction="S", flow_accumulation_val=8400, is_depression=True),
        TerrainDEM(area_id=7, lat=13.0410, lng=80.2620, elevation_m=4.8, slope_deg=0.6, flow_direction="E", flow_accumulation_val=3800, is_depression=False),
        TerrainDEM(area_id=8, lat=12.8980, lng=80.2480, elevation_m=2.6, slope_deg=0.2, flow_direction="E", flow_accumulation_val=14800, is_depression=True),
        TerrainDEM(area_id=9, lat=13.0067, lng=80.2025, elevation_m=6.8, slope_deg=0.7, flow_direction="SE", flow_accumulation_val=3200, is_depression=False),
        TerrainDEM(area_id=10, lat=12.9610, lng=80.1970, elevation_m=2.1, slope_deg=0.2, flow_direction="E", flow_accumulation_val=15800, is_depression=True),
        TerrainDEM(area_id=11, lat=12.9380, lng=80.2150, elevation_m=1.6, slope_deg=0.1, flow_direction="E", flow_accumulation_val=24500, is_depression=True),
        TerrainDEM(area_id=12, lat=13.0850, lng=80.2100, elevation_m=8.5, slope_deg=0.8, flow_direction="NE", flow_accumulation_val=2200, is_depression=False),
        TerrainDEM(area_id=13, lat=13.1240, lng=80.2180, elevation_m=4.2, slope_deg=0.3, flow_direction="E", flow_accumulation_val=11200, is_depression=True),
        TerrainDEM(area_id=14, lat=13.1143, lng=80.1548, elevation_m=12.5, slope_deg=0.9, flow_direction="E", flow_accumulation_val=4100, is_depression=False),
    ]
    db.add_all(dem_points)
    db.commit()

    # 9. Flood Predictions for ALL 14 LOCATIONS
    nowcasts = [
        FloodPrediction(area_id=1, target_type="STREET", target_id="Velachery Main Road (Vijayanagar Bus Terminus)", lead_time_min=60, predicted_depth_cm=58.0, flood_probability_pct=88.0, risk_level="CRITICAL", confidence_pct=90.2),
        FloodPrediction(area_id=2, target_type="STREET", target_id="L.B. Road (Lattice Bridge Road)", lead_time_min=60, predicted_depth_cm=26.0, flood_probability_pct=48.0, risk_level="WATCH", confidence_pct=91.0),
        FloodPrediction(area_id=3, target_type="STREET", target_id="Chitlapakkam Main Road", lead_time_min=60, predicted_depth_cm=38.0, flood_probability_pct=64.0, risk_level="WARNING", confidence_pct=88.5),
        FloodPrediction(area_id=4, target_type="STREET", target_id="Rangarajapuram Subway Link", lead_time_min=60, predicted_depth_cm=75.0, flood_probability_pct=92.0, risk_level="CRITICAL", confidence_pct=92.5),
        FloodPrediction(area_id=5, target_type="STREET", target_id="Perungudi Industrial Estate Road", lead_time_min=60, predicted_depth_cm=45.0, flood_probability_pct=70.0, risk_level="WARNING", confidence_pct=89.5),
        FloodPrediction(area_id=6, target_type="STREET", target_id="Trustpuram Main Road", lead_time_min=60, predicted_depth_cm=46.0, flood_probability_pct=75.0, risk_level="WARNING", confidence_pct=90.0),
        FloodPrediction(area_id=7, target_type="STREET", target_id="San Thome High Road", lead_time_min=60, predicted_depth_cm=30.0, flood_probability_pct=52.0, risk_level="WATCH", confidence_pct=88.0),
        FloodPrediction(area_id=8, target_type="STREET", target_id="ECR-OMR Link Road (Akkarai Link)", lead_time_min=60, predicted_depth_cm=42.0, flood_probability_pct=65.0, risk_level="WARNING", confidence_pct=87.5),
        FloodPrediction(area_id=9, target_type="STREET", target_id="Guindy Industrial Estate Main Road", lead_time_min=60, predicted_depth_cm=32.0, flood_probability_pct=50.0, risk_level="WATCH", confidence_pct=90.5),
        FloodPrediction(area_id=10, target_type="STREET", target_id="Ram Nagar South 1st Main Road", lead_time_min=60, predicted_depth_cm=52.0, flood_probability_pct=80.0, risk_level="CRITICAL", confidence_pct=89.8),
        FloodPrediction(area_id=11, target_type="STREET", target_id="200 Feet Radial Road (Marshland Causeway)", lead_time_min=60, predicted_depth_cm=60.0, flood_probability_pct=88.0, risk_level="CRITICAL", confidence_pct=91.2),
        FloodPrediction(area_id=12, target_type="STREET", target_id="Poonamallee High Road (Anna Arch Section)", lead_time_min=60, predicted_depth_cm=22.0, flood_probability_pct=34.0, risk_level="NORMAL", confidence_pct=93.0),
        FloodPrediction(area_id=13, target_type="STREET", target_id="Thanikachalam Nagar Main Road", lead_time_min=60, predicted_depth_cm=48.0, flood_probability_pct=78.0, risk_level="WARNING", confidence_pct=89.0),
        FloodPrediction(area_id=14, target_type="STREET", target_id="Ambattur Industrial Estate 3rd Main Road", lead_time_min=60, predicted_depth_cm=36.0, flood_probability_pct=58.0, risk_level="WATCH", confidence_pct=88.5),
    ]
    db.add_all(nowcasts)
    db.commit()

    # 10. Active Disaster Alerts for Multiple Wards
    alerts_seed = [
        Alert(title="⚠️ INUNDATION WARNING: Velachery Vijayanagar Lowlands", description="Deep water accumulation predicted (40-65cm) within 45 minutes due to heavy monsoon cell convective downpour. Avoid Velachery Main Road.", severity="WARNING", area_id=1, alert_type="FLOOD_NOWCAST", is_active=True, is_acknowledged=False),
        Alert(title="🚨 SUBWAY FLOOD ALERT: T. Nagar Rangarajapuram Underpass", description="Rangarajapuram subway water depth has exceeded 75cm. Traffic police diversion active via Usman Road Flyover.", severity="CRITICAL", area_id=4, alert_type="ROAD_INUNDATION", is_active=True, is_acknowledged=False),
        Alert(title="🚨 RADIAL ROAD DELUGE ALERT: Pallikaranai Marshland Causeway", description="200 Feet Radial Road causeway facing overtopping from marshland surge (>60cm depth). Divert via OMR Expressway.", severity="CRITICAL", area_id=11, alert_type="ROAD_INUNDATION", is_active=True, is_acknowledged=False),
        Alert(title="⚠️ MARSHLAND SURCHARGE ALERT: Perungudi Industrial Corridor", description="Pallikaranai marshland sluice gate water level rising. Secondary conduits surcharging into Burma Colony link road.", severity="WARNING", area_id=5, alert_type="DRAIN_OVERFLOW", is_active=True, is_acknowledged=False),
        Alert(title="⚠️ LOWLAND FLOOD WATCH: Madipakkam Ram Nagar", description="Ram Nagar depression sink accumulating water (40-52cm). Portable dewatering pumps assigned to sector.", severity="WARNING", area_id=10, alert_type="FLOOD_NOWCAST", is_active=True, is_acknowledged=False),
    ]
    db.add_all(alerts_seed)
    db.commit()

    # 11. Emergency Rescue Teams
    rescue_teams = [
        RescueTeam(id=1, team_name="NDRF 4th Battalion - Unit Delta", agency="NDRF Arakkonam Base / Chennai Station", current_lat=12.9900, current_lng=80.2050, personnel_count=16, equipment_type="4x Gemini Inflatable Motor Boats, 6x 100HP Dewatering Pumps, Lifejackets, First Aid", contact_phone="+91 94440 12345", status="AVAILABLE"),
        RescueTeam(id=2, team_name="SDRF Tamil Nadu Flood Response - Squad 2", agency="State Disaster Response Force", current_lat=13.0010, current_lng=80.2500, personnel_count=12, equipment_type="2x High-clearance Unimog Rescue Trucks, 3x Rubber Boats, Diver Kits", contact_phone="+91 94440 67890", status="AVAILABLE"),
        RescueTeam(id=3, team_name="GCC Zone 13 & 14 Stormwater Emergency Dewatering Crew", agency="Greater Chennai Corporation", current_lat=12.9820, current_lng=80.2240, personnel_count=8, equipment_type="High-capacity Diesel Sludge Dewatering Pumps (5000 LPM), JCB Excavator", contact_phone="+91 44 2244 5566", status="DISPATCHED", assigned_task_id=1),
    ]
    db.add_all(rescue_teams)
    db.commit()

    # 12. Rescue Tasks
    tasks_seed = [
        RescueTask(id=1, title="Pre-positioning Dewatering Pumps at Vijayanagar Underpass", area_id=1, priority="CRITICAL", target_lat=12.9750, target_lng=80.2220, location_name="Vijayanagar Bus Terminus Low-Lying Sector", assigned_team_id=3, task_status="DISPATCHED", water_depth_cm=48.0, stranded_count=22, instructions="Deploy 5000 LPM diesel pumps to divert surcharge water into Taramani Link Canal before evening peak transit."),
        RescueTask(id=2, title="Subway Pumping & Barrier at Rangarajapuram", area_id=4, priority="HIGH", target_lat=13.0405, target_lng=80.2275, location_name="Rangarajapuram Subway, T. Nagar", assigned_team_id=1, task_status="ASSIGNED", water_depth_cm=75.0, stranded_count=6, instructions="Maintain physical barricading and operate twin submersible sludge pumps.")
    ]
    db.add_all(tasks_seed)
    db.commit()

    # 13. Comprehensive 35 SIH Official Datasets Registry
    all_35_datasets = [
        DatasetRegistry(name="1. Chennai Doppler Weather Radar (DWR)", category="METEOROLOGY", source_url="https://mausam.imd.gov.in/responsive/radar.php?id=Chennai", record_count=184000, file_format="NetCDF / GeoTIFF dBZ", status="REALTIME_SYNC"),
        DatasetRegistry(name="2. IMD Weather API Specification", category="METEOROLOGY", source_url="https://api.imd.gov.in/public/api_reference.html", record_count=52000, file_format="RESTful JSON", status="ACTIVE_SYNC"),
        DatasetRegistry(name="3. IMD Current Weather Data", category="METEOROLOGY", source_url="https://api.imd.gov.in/api/v1/current_wx", record_count=98000, file_format="JSON Telemetry", status="ACTIVE_SYNC"),
        DatasetRegistry(name="4. IMD District Rainfall Data", category="METEOROLOGY", source_url="https://api.imd.gov.in/api/v1/districtrainfall", record_count=64000, file_format="JSON / Time-series", status="ACTIVE_SYNC"),
        DatasetRegistry(name="5. IMD AWS / ARG Station Data", category="METEOROLOGY", source_url="https://api.imd.gov.in/api/v1/aws_data", record_count=112000, file_format="JSON Stream", status="ACTIVE_SYNC"),
        DatasetRegistry(name="6. IMD Rainfall Forecast (0-3h / State-District)", category="METEOROLOGY", source_url="https://api.imd.gov.in/api/v1/state_district_rainfall_forecast", record_count=45000, file_format="JSON Forecast Grid", status="ACTIVE_SYNC"),
        DatasetRegistry(name="7. IMD District Meteorological Warning", category="METEOROLOGY", source_url="https://api.imd.gov.in/api/v1/districtwarning", record_count=18000, file_format="CAP / JSON", status="ACTIVE_SYNC"),
        DatasetRegistry(name="8. Chennai GIS / TNGIS Spatial Catalog", category="GIS_TERRAIN", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=320000, file_format="ESRI Shapefile / WFS", status="VERIFIED_OK"),
        DatasetRegistry(name="9. Chennai Stormwater Drainage Network", category="DRAINAGE_GRAPH", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=14500, file_format="GeoJSON Directed Graph", status="HYDRAULIC_GRAPH_ACTIVE"),
        DatasetRegistry(name="10. Chennai Water Bodies & Marshlands", category="GIS_TERRAIN", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=8400, file_format="GeoJSON Polygon", status="VERIFIED_OK"),
        DatasetRegistry(name="11. Chennai Land Use / Land Cover (LULC)", category="GIS_TERRAIN", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=185000, file_format="Raster / Vector Grid", status="VERIFIED_OK"),
        DatasetRegistry(name="12. Chennai OpenStreetMap Road Geometry", category="ROADS_ROUTING", source_url="https://www.openstreetmap.org/", record_count=120000, file_format="OSM XML / PBF", status="ROUTING_GRAPH_ACTIVE"),
        DatasetRegistry(name="13. India Road GIS Geofabrik Dataset", category="ROADS_ROUTING", source_url="https://download.geofabrik.de/asia/india.html", record_count=850000, file_format="Shapefile / GeoJSON", status="VERIFIED_OK"),
        DatasetRegistry(name="14. Chennai Digital Elevation Model (CartoDEM 2.5m)", category="GIS_TERRAIN", source_url="https://surveyofindia.gov.in/pages/availability-of-ori-and-dem", record_count=620000, file_format="GeoTIFF / High-Res DEM", status="DEM_GRID_ACTIVE"),
        DatasetRegistry(name="15. ISRO Bhuvan 2D/3D Geospatial Portal", category="GIS_TERRAIN", source_url="https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php", record_count=410000, file_format="WMS / Tile Services", status="VERIFIED_OK"),
        DatasetRegistry(name="16. Bhuvan FEWS Historical Inundation (2015-2023)", category="FLOOD_HISTORY", source_url="https://bhuvan-app1.nrsc.gov.in/fews/index.php", record_count=89500, file_format="Satellite Polygon Flood Hazard", status="CALIBRATED_ML"),
        DatasetRegistry(name="17. Chennai Flood Monitoring & Deluge Records", category="FLOOD_HISTORY", source_url="https://bhuvan-app1.nrsc.gov.in/fews/index.php", record_count=42000, file_format="Raster Hazard Mask", status="CALIBRATED_ML"),
        DatasetRegistry(name="18. IMD Chennai Weather Map & Observation Summaries", category="METEOROLOGY", source_url="https://dss.imd.gov.in/dwr_img/GIS/chennai_obsums.html", record_count=29000, file_format="GIS Layer / Web Map", status="ACTIVE_SYNC"),
        DatasetRegistry(name="19. IMD Geospatial Rainfall Portal", category="METEOROLOGY", source_url="https://imdgeospatial.imd.gov.in/Rainfall/", record_count=78000, file_format="NetCDF / Isohyetal Grid", status="ACTIVE_SYNC"),
        DatasetRegistry(name="20. GCC Ward Manhole Locations & Codes", category="DRAINAGE_GRAPH", source_url="Municipal / Ward Dataset (GCC Zones 1-15)", record_count=18500, file_format="Point GeoJSON / Invert MSL", status="HYDRAULIC_GRAPH_ACTIVE"),
        DatasetRegistry(name="21. GCC Conduit Dimensions (Diameter & Section)", category="DRAINAGE_GRAPH", source_url="Municipal / Ward Dataset (GCC Zones 1-15)", record_count=14500, file_format="Cross-Section CSV / Attribute", status="HYDRAULIC_GRAPH_ACTIVE"),
        DatasetRegistry(name="22. Stormwater Drain Invert & Surface Elevation", category="DRAINAGE_GRAPH", source_url="Municipal / Ward Dataset (GCC Zones 1-15)", record_count=14500, file_format="Longitudinal Profile", status="HYDRAULIC_GRAPH_ACTIVE"),
        DatasetRegistry(name="23. Drain Hydraulic Capacity (Manning's Equation)", category="DRAINAGE_GRAPH", source_url="Municipal / Ward Dataset (Manning Solver)", record_count=14500, file_format="Computed Q_cap m3/s", status="HYDRAULIC_GRAPH_ACTIVE"),
        DatasetRegistry(name="24. Ultrasonic Manhole Water-Level Stream", category="IOT_TELEMETRY", source_url="DRAIN-X IoT Sensor Stream (SN-VEL..AMB)", record_count=245000, file_format="MQTT / Time-Series JSON", status="STREAMING_REALTIME"),
        DatasetRegistry(name="25. Manhole Surcharge & Overflow Detection State", category="IOT_TELEMETRY", source_url="DRAIN-X IoT Sensor Stream", record_count=165000, file_format="Binary State / Alarm Telemetry", status="STREAMING_REALTIME"),
        DatasetRegistry(name="26. Conduit Ultrasonic Debris & Blockage Sensor", category="IOT_TELEMETRY", source_url="DRAIN-X IoT Sensor Stream (SN-BLK01)", record_count=98000, file_format="Blockage % / Ultrasonic", status="STREAMING_REALTIME"),
        DatasetRegistry(name="27. Real-Time Geotagged Sensor Coordinate Register", category="IOT_TELEMETRY", source_url="DRAIN-X IoT Sensor Stream", record_count=1200, file_format="Geospatial Telemetry Node Table", status="STREAMING_REALTIME"),
        DatasetRegistry(name="28. Historical Cyclone Michaung & 2015 Hotspots", category="FLOOD_HISTORY", source_url="https://bhuvan-app1.nrsc.gov.in/fews/index.php", record_count=58000, file_format="Hotspot Polygons", status="CALIBRATED_ML"),
        DatasetRegistry(name="29. Flood Hazard Inundation Depth Zonation", category="FLOOD_HISTORY", source_url="https://bhuvan-app1.nrsc.gov.in/fews/index.php", record_count=35000, file_format="Hazard Depth Contours", status="CALIBRATED_ML"),
        DatasetRegistry(name="30. Chennai Municipal Administrative & Ward Boundaries", category="GIS_TERRAIN", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=200, file_format="Ward Boundary Polygon GeoJSON", status="VERIFIED_OK"),
        DatasetRegistry(name="31. Critical Urban Infrastructure (Substations, Telecom)", category="EMERGENCY_RESCUE", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=4800, file_format="Asset Point GeoJSON", status="VERIFIED_OK"),
        DatasetRegistry(name="32. Hospitals & Fire Rescue Facilities", category="EMERGENCY_RESCUE", source_url="https://www.openstreetmap.org/", record_count=2100, file_format="Hospital / Station Points", status="VERIFIED_OK"),
        DatasetRegistry(name="33. Emergency Evacuation Arteries & Expressways", category="ROADS_ROUTING", source_url="https://www.openstreetmap.org/", record_count=1800, file_format="Arterial LineString", status="ROUTING_GRAPH_ACTIVE"),
        DatasetRegistry(name="34. Rivers (Adyar, Cooum), Tanks & Reservoirs", category="GIS_TERRAIN", source_url="https://tngis.tn.gov.in/apps/cumta/", record_count=3400, file_format="Hydrographic Polygon", status="VERIFIED_OK"),
        DatasetRegistry(name="35. Survey of India Flow Accumulation & Aspect Grid", category="GIS_TERRAIN", source_url="https://surveyofindia.gov.in/pages/availability-of-ori-and-dem", record_count=540000, file_format="Flow Direction Grid Raster", status="DEM_GRID_ACTIVE")
    ]
    db.add_all(all_35_datasets)
    db.commit()

    # 14. ML Models Registry
    models_seed = [
        MLModelRegistry(model_name="DRAIN-X SpatioTemporal LSTM-GNN (0-3h Nowcast)", model_type="Coupled Graph Neural Network + Bidirectional LSTM", version="v2.3.4-PROD", lead_time_target="0 - 180 Minutes (Lead time step 30m)", accuracy_score=94.8, rmse=2.85, mae=1.62, f1_score=0.932, is_active=True),
        MLModelRegistry(model_name="Hydraulic Capacity Manning Surcharge Predictor", model_type="Physics-Informed Neural Network (PINN)", version="v1.8.0", lead_time_target="Real-time Pipe Backflow / Surcharge Index", accuracy_score=96.2, rmse=1.95, mae=1.10, f1_score=0.954, is_active=True),
        MLModelRegistry(model_name="IMD Radar Extrapolation Optical Flow (RainNow)", model_type="PySTEPS ConvLSTM Temporal Echo Tracker", version="v3.1.0", lead_time_target="0 - 120 Minutes Rainfall Intensity", accuracy_score=91.4, rmse=3.40, mae=2.20, f1_score=0.895, is_active=True)
    ]
    db.add_all(models_seed)
    db.commit()

    db.add(AuditLog(username="SYSTEM_INIT", action="BOOTSTRAP_DATABASE_SEED", severity="INFO", details="Initialized all 14 Greater Chennai Zones with authentic roads, directed drainage graph, IoT sensors, and DEM points."))
    db.commit()

    print("[INFO] Seed completed successfully for all 14 locations!")
