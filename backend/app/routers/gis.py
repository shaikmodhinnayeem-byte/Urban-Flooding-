import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.models.schema import Road, DrainNode, DrainSegment, Sensor, TerrainDEM, get_db

router = APIRouter(prefix="/gis", tags=["GIS & Map Layers"])

# Ward-specific Water Bodies for all 14 Areas
WARD_WATER_BODIES = {
    1: [ # Velachery
        {"name": "Velachery Lake", "type": "LAKE", "capacity_mcft": 18.5, "current_storage_pct": 74.0, "coordinates": [[80.2100, 12.9810], [80.2140, 12.9800], [80.2150, 12.9730], [80.2110, 12.9720], [80.2090, 12.9770], [80.2100, 12.9810]]},
        {"name": "Pallikaranai Marshland Catchment", "type": "WETLAND", "capacity_mcft": 140.0, "current_storage_pct": 82.0, "coordinates": [[80.2280, 12.9650], [80.2450, 12.9680], [80.2480, 12.9520], [80.2300, 12.9500], [80.2280, 12.9650]]},
        {"name": "Buckingham Canal Feeder", "type": "CANAL", "capacity_mcft": 65.0, "current_storage_pct": 78.0, "coordinates": [[80.2520, 13.0020], [80.2500, 12.9750], [80.2460, 12.9500], [80.2440, 12.9200]]}
    ],
    2: [ # Adyar
        {"name": "Adyar River Estuary", "type": "RIVER", "capacity_mcft": 180.0, "current_storage_pct": 65.0, "coordinates": [[80.2420, 13.0080], [80.2550, 13.0110], [80.2680, 13.0130], [80.2640, 13.0050], [80.2420, 13.0080]]},
        {"name": "Thiruvanmiyur Coastal Basin", "type": "COASTAL", "capacity_mcft": 45.0, "current_storage_pct": 52.0, "coordinates": [[80.2600, 12.9900], [80.2680, 12.9920], [80.2690, 12.9800], [80.2610, 12.9790], [80.2600, 12.9900]]}
    ],
    3: [ # Tambaram
        {"name": "Chitlapakkam Lake", "type": "LAKE", "capacity_mcft": 28.0, "current_storage_pct": 68.0, "coordinates": [[80.1300, 12.9380], [80.1380, 12.9370], [80.1390, 12.9300], [80.1310, 12.9310], [80.1300, 12.9380]]},
        {"name": "Selaiyur Lake", "type": "LAKE", "capacity_mcft": 32.0, "current_storage_pct": 72.0, "coordinates": [[80.1350, 12.9180], [80.1440, 12.9170], [80.1430, 12.9100], [80.1340, 12.9110], [80.1350, 12.9180]]}
    ],
    4: [ # T. Nagar
        {"name": "Mambalam Storm Canal Basin", "type": "CANAL", "capacity_mcft": 24.0, "current_storage_pct": 86.0, "coordinates": [[80.2280, 13.0480], [80.2350, 13.0450], [80.2380, 13.0360], [80.2300, 13.0380], [80.2280, 13.0480]]}
    ],
    5: [ # Perungudi
        {"name": "Perungudi Lake", "type": "LAKE", "capacity_mcft": 22.5, "current_storage_pct": 80.0, "coordinates": [[80.2380, 12.9700], [80.2450, 12.9690], [80.2460, 12.9620], [80.2390, 12.9630], [80.2380, 12.9700]]},
        {"name": "Pallikaranai Marshland OMR Sector", "type": "WETLAND", "capacity_mcft": 120.0, "current_storage_pct": 85.0, "coordinates": [[80.2350, 12.9600], [80.2480, 12.9620], [80.2490, 12.9500], [80.2360, 12.9480], [80.2350, 12.9600]]}
    ],
    6: [ # Kodambakkam
        {"name": "Trustpuram Storm Drain Basin", "type": "CANAL", "capacity_mcft": 16.0, "current_storage_pct": 76.0, "coordinates": [[80.2180, 13.0560], [80.2250, 13.0530], [80.2240, 13.0460], [80.2170, 13.0480], [80.2180, 13.0560]]}
    ],
    7: [ # Mylapore
        {"name": "Mylapore Buckingham Canal Segment", "type": "CANAL", "capacity_mcft": 42.0, "current_storage_pct": 79.0, "coordinates": [[80.2620, 13.0420], [80.2740, 13.0380], [80.2760, 13.0280], [80.2640, 13.0300], [80.2620, 13.0420]]}
    ],
    8: [ # Sholinganallur
        {"name": "Sholinganallur Backwater Estuary", "type": "WETLAND", "capacity_mcft": 95.0, "current_storage_pct": 68.0, "coordinates": [[80.2250, 12.9150], [80.2400, 12.9120], [80.2420, 12.8900], [80.2270, 12.8920], [80.2250, 12.9150]]}
    ],
    9: [ # Guindy
        {"name": "Kathipara Stormwater Retention Basin", "type": "BASIN", "capacity_mcft": 12.0, "current_storage_pct": 45.0, "coordinates": [[80.1980, 13.0110], [80.2070, 13.0090], [80.2060, 13.0010], [80.1970, 13.0030], [80.1980, 13.0110]]}
    ],
    10: [ # Madipakkam
        {"name": "Madipakkam Lake", "type": "LAKE", "capacity_mcft": 35.0, "current_storage_pct": 78.0, "coordinates": [[80.1920, 12.9680], [80.2020, 12.9660], [80.2010, 12.9560], [80.1910, 12.9580], [80.1920, 12.9680]]}
    ],
    11: [ # Pallikaranai
        {"name": "Pallikaranai Central Wetland Sanctuary", "type": "WETLAND", "capacity_mcft": 250.0, "current_storage_pct": 92.0, "coordinates": [[80.2080, 12.9480], [80.2280, 12.9450], [80.2300, 12.9280], [80.2100, 12.9300], [80.2080, 12.9480]]},
        {"name": "Narayanapuram Lake Surplus Channel", "type": "CANAL", "capacity_mcft": 45.0, "current_storage_pct": 88.0, "coordinates": [[80.2000, 12.9420], [80.2150, 12.9400], [80.2160, 12.9340], [80.2010, 12.9350], [80.2000, 12.9420]]}
    ],
    12: [ # Anna Nagar
        {"name": "Otteri Nullah Stormwater Canal", "type": "CANAL", "capacity_mcft": 55.0, "current_storage_pct": 48.0, "coordinates": [[80.2020, 13.0920], [80.2220, 13.0880], [80.2200, 13.0780], [80.2010, 13.0800], [80.2020, 13.0920]]}
    ],
    13: [ # Kolathur
        {"name": "Retteri Lake", "type": "LAKE", "capacity_mcft": 85.0, "current_storage_pct": 84.0, "coordinates": [[80.2100, 13.1320], [80.2260, 13.1300], [80.2240, 13.1180], [80.2080, 13.1200], [80.2100, 13.1320]]},
        {"name": "Thanikachalam Nagar Drain", "type": "CANAL", "capacity_mcft": 30.0, "current_storage_pct": 82.0, "coordinates": [[80.2180, 13.1280], [80.2300, 13.1240], [80.2280, 13.1160], [80.2160, 13.1180], [80.2180, 13.1280]]}
    ],
    14: [ # Ambattur
        {"name": "Ambattur Industrial Estate Lake", "type": "LAKE", "capacity_mcft": 65.0, "current_storage_pct": 62.0, "coordinates": [[80.1480, 13.1200], [80.1620, 13.1180], [80.1600, 13.1060], [80.1460, 13.1080], [80.1480, 13.1200]]},
        {"name": "Korattur Lake Overflow Basin", "type": "LAKE", "capacity_mcft": 110.0, "current_storage_pct": 70.0, "coordinates": [[80.1580, 13.1150], [80.1740, 13.1120], [80.1720, 13.1000], [80.1560, 13.1020], [80.1580, 13.1150]]}
    ]
}

# Ward-specific Critical Facilities for all 14 Areas
WARD_CRITICAL_FACILITIES = {
    1: [ # Velachery
        {"name": "Dr. Kamakshi Memorial Hospital", "type": "HOSPITAL", "lat": 12.9560, "lng": 80.2040, "contact": "+91 44 6630 0300", "status": "OPERATIONAL_SAFE"},
        {"name": "Prashanth Super Speciality Hospital (Velachery)", "type": "HOSPITAL", "lat": 12.9840, "lng": 80.2180, "contact": "+91 44 4227 7777", "status": "GROUND_WATER_WATCH"},
        {"name": "Velachery Fire & Rescue Station", "type": "FIRE_STATION", "lat": 12.9790, "lng": 80.2240, "contact": "101 / +91 44 2243 0101", "status": "ACTIVE_DISPATCH"},
        {"name": "Guru Nanak College Relief Camp (Ward 179)", "type": "EMERGENCY_SHELTER", "lat": 12.9890, "lng": 80.2170, "capacity": 1200, "status": "OPEN_RECEIVING"},
        {"name": "Vijayanagar Substation (TANGEDCO 110kV)", "type": "POWER_GRID", "lat": 12.9745, "lng": 80.2230, "status": "CRITICAL_WATER_SHIELD"}
    ],
    2: [ # Adyar
        {"name": "Fortis Malar Hospital (Adyar)", "type": "HOSPITAL", "lat": 13.0070, "lng": 80.2580, "contact": "+91 44 4289 2222", "status": "OPERATIONAL_SAFE"},
        {"name": "Adyar Fire Rescue Command", "type": "FIRE_STATION", "lat": 13.0020, "lng": 80.2540, "contact": "101 / +91 44 2441 0101", "status": "ACTIVE_DISPATCH"},
        {"name": "Anna University Relief Center", "type": "EMERGENCY_SHELTER", "lat": 13.0110, "lng": 80.2350, "capacity": 2500, "status": "OPEN_RECEIVING"},
        {"name": "Adyar Pumping Station", "type": "PUMP_STATION", "lat": 13.0095, "lng": 80.2560, "status": "ACTIVE_HIGH_LOAD"}
    ],
    3: [ # Tambaram
        {"name": "Hindu Mission Hospital (Tambaram)", "type": "HOSPITAL", "lat": 12.9260, "lng": 80.1180, "contact": "+91 44 2226 2244", "status": "OPERATIONAL_SAFE"},
        {"name": "Tambaram Fire & Rescue Station", "type": "FIRE_STATION", "lat": 12.9230, "lng": 80.1240, "contact": "101 / +91 44 2226 0101", "status": "ACTIVE_DISPATCH"},
        {"name": "Madras Christian College (MCC) Shelter", "type": "EMERGENCY_SHELTER", "lat": 12.9210, "lng": 80.1220, "capacity": 1800, "status": "OPEN_RECEIVING"}
    ],
    4: [ # T. Nagar
        {"name": "Bharathiraja Speciality Hospital", "type": "HOSPITAL", "lat": 13.0440, "lng": 80.2410, "contact": "+91 44 2834 5050", "status": "OPERATIONAL_SAFE"},
        {"name": "T. Nagar Fire Rescue Depot", "type": "FIRE_STATION", "lat": 13.0400, "lng": 80.2320, "contact": "101 / +91 44 2434 0101", "status": "ACTIVE_DISPATCH"},
        {"name": "Panagal Community Hall Relief Camp", "type": "EMERGENCY_SHELTER", "lat": 13.0425, "lng": 80.2335, "capacity": 900, "status": "OPEN_RECEIVING"}
    ],
    5: [ # Perungudi
        {"name": "Apollo Speciality Hospital OMR", "type": "HOSPITAL", "lat": 12.9660, "lng": 80.2470, "contact": "+91 44 2496 1111", "status": "OPERATIONAL_SAFE"},
        {"name": "Perungudi Toll Disaster Post", "type": "EMERGENCY_SHELTER", "lat": 12.9640, "lng": 80.2450, "capacity": 1100, "status": "OPEN_RECEIVING"}
    ],
    6: [ # Kodambakkam
        {"name": "SIMS Hospital Vadapalani Corridor", "type": "HOSPITAL", "lat": 13.0520, "lng": 80.2120, "contact": "+91 44 2000 3000", "status": "OPERATIONAL_SAFE"},
        {"name": "Vadapalani Fire Rescue Station", "type": "FIRE_STATION", "lat": 13.0500, "lng": 80.2160, "contact": "101 / +91 44 2483 0101", "status": "ACTIVE_DISPATCH"}
    ],
    7: [ # Mylapore
        {"name": "Kauvery Hospital (Mylapore)", "type": "HOSPITAL", "lat": 13.0360, "lng": 80.2590, "contact": "+91 44 4000 6000", "status": "OPERATIONAL_SAFE"},
        {"name": "Mylapore Fire Station", "type": "FIRE_STATION", "lat": 13.0340, "lng": 80.2680, "contact": "101 / +91 44 2498 0101", "status": "ACTIVE_DISPATCH"},
        {"name": "St. Bede's Relief Camp", "type": "EMERGENCY_SHELTER", "lat": 13.0330, "lng": 80.2750, "capacity": 1400, "status": "OPEN_RECEIVING"}
    ],
    8: [ # Sholinganallur
        {"name": "Gleneagles Global Health City", "type": "HOSPITAL", "lat": 12.8980, "lng": 80.2180, "contact": "+91 44 4477 7000", "status": "OPERATIONAL_SAFE"},
        {"name": "Sholinganallur Fire & Rescue Squad", "type": "FIRE_STATION", "lat": 12.9020, "lng": 80.2270, "contact": "101 / +91 44 2450 0101", "status": "ACTIVE_DISPATCH"},
        {"name": "Sathyabama University Relief Center", "type": "EMERGENCY_SHELTER", "lat": 12.8720, "lng": 80.2190, "capacity": 3000, "status": "OPEN_RECEIVING"}
    ],
    9: [ # Guindy
        {"name": "Guindy Industrial Estate Emergency Clinic", "type": "HOSPITAL", "lat": 13.0080, "lng": 80.2050, "contact": "+91 44 2250 1100", "status": "OPERATIONAL_SAFE"},
        {"name": "Guindy Fire & Rescue Station", "type": "FIRE_STATION", "lat": 13.0050, "lng": 80.2030, "contact": "101 / +91 44 2235 0101", "status": "ACTIVE_DISPATCH"}
    ],
    10: [ # Madipakkam
        {"name": "Saraswathy Multi Speciality Hospital", "type": "HOSPITAL", "lat": 12.9640, "lng": 80.1980, "contact": "+91 44 2247 1122", "status": "OPERATIONAL_SAFE"},
        {"name": "Madipakkam Community Relief Shelter", "type": "EMERGENCY_SHELTER", "lat": 12.9610, "lng": 80.1960, "capacity": 1000, "status": "OPEN_RECEIVING"}
    ],
    11: [ # Pallikaranai
        {"name": "Dr. Rela Institute & Medical Centre", "type": "HOSPITAL", "lat": 12.9440, "lng": 80.2110, "contact": "+91 44 6666 7777", "status": "OPERATIONAL_SAFE"},
        {"name": "Pallikaranai Marsh Disaster Response Base", "type": "EMERGENCY_SHELTER", "lat": 12.9360, "lng": 80.2170, "capacity": 1500, "status": "OPEN_RECEIVING"}
    ],
    12: [ # Anna Nagar
        {"name": "MGM Healthcare (Nelson Manickam Corridor)", "type": "HOSPITAL", "lat": 13.0810, "lng": 80.2140, "contact": "+91 44 4524 2424", "status": "OPERATIONAL_SAFE"},
        {"name": "Anna Nagar Fire & Rescue Station", "type": "FIRE_STATION", "lat": 13.0840, "lng": 80.2100, "contact": "101 / +91 44 2621 0101", "status": "ACTIVE_DISPATCH"}
    ],
    13: [ # Kolathur
        {"name": "Kolathur Government Peripheral Hospital", "type": "HOSPITAL", "lat": 13.1220, "lng": 80.2190, "contact": "+91 44 2550 4400", "status": "OPERATIONAL_SAFE"},
        {"name": "Don Bosco Kolathur Relief Center", "type": "EMERGENCY_SHELTER", "lat": 13.1250, "lng": 80.2170, "capacity": 1600, "status": "OPEN_RECEIVING"}
    ],
    14: [ # Ambattur
        {"name": "Sir Ivan Stedeford Hospital (Ambattur)", "type": "HOSPITAL", "lat": 13.1180, "lng": 80.1510, "contact": "+91 44 2658 1111", "status": "OPERATIONAL_SAFE"},
        {"name": "Ambattur Fire & Rescue Station", "type": "FIRE_STATION", "lat": 13.1120, "lng": 80.1560, "contact": "101 / +91 44 2658 0101", "status": "ACTIVE_DISPATCH"}
    ]
}

@router.get("/layers/{area_id}")
def get_area_gis_layers(area_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # 1. Roads GeoJSON
    roads = db.query(Road).filter(Road.area_id == area_id).all()
    road_features = []
    for r in roads:
        coords = json.loads(r.coordinates_json) if r.coordinates_json else [
            [r.start_lat, r.start_lng],
            [r.end_lat, r.end_lng]
        ]
        geojson_coords = [[pt[1], pt[0]] for pt in coords]
        
        road_features.append({
            "type": "Feature",
            "properties": {
                "id": r.id,
                "name": r.name,
                "road_type": r.road_type,
                "elevation_m": r.elevation_m,
                "length_km": r.length_km,
                "current_water_depth_cm": r.current_water_depth_cm,
                "predicted_depth_1h_cm": r.predicted_depth_1h_cm,
                "predicted_depth_3h_cm": r.predicted_depth_3h_cm,
                "flood_probability_pct": r.flood_probability_pct,
                "passability_status": r.passability_status,
                "is_critical_route": r.is_critical_route
            },
            "geometry": {
                "type": "LineString",
                "coordinates": geojson_coords
            }
        })

    # 2. Drain Nodes GeoJSON
    nodes = db.query(DrainNode).filter(DrainNode.area_id == area_id).all()
    node_features = []
    node_id_set = {n.id for n in nodes}
    for n in nodes:
        node_features.append({
            "type": "Feature",
            "properties": {
                "id": n.id,
                "code": n.node_code,
                "type": n.node_type,
                "invert_level_m": n.invert_level_m,
                "ground_elevation_m": n.ground_elevation_m,
                "water_level_m": n.water_level_m,
                "surcharge_level_m": n.surcharge_level_m,
                "status": n.status,
                "sensor_id": n.sensor_id
            },
            "geometry": {
                "type": "Point",
                "coordinates": [n.lng, n.lat]
            }
        })

    # 3. Drainage Segments GeoJSON
    segments = db.query(DrainSegment).all()
    segment_features = []
    node_map = {n.id: n for n in db.query(DrainNode).all()}
    for s in segments:
        if s.source_node_id in node_id_set or s.target_node_id in node_id_set:
            src = node_map.get(s.source_node_id)
            tgt = node_map.get(s.target_node_id)
            if src and tgt:
                segment_features.append({
                    "type": "Feature",
                    "properties": {
                        "id": s.id,
                        "code": s.segment_code,
                        "drain_type": s.drain_type,
                        "length_m": s.length_m,
                        "diameter_m": s.diameter_m,
                        "capacity_m3s": s.design_capacity_m3s,
                        "current_flow_m3s": s.current_flow_m3s,
                        "utilization_pct": s.capacity_utilization_pct,
                        "condition": s.condition_status,
                        "blockage_pct": s.debris_blockage_pct,
                        "outfall": s.outfall_name
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[src.lng, src.lat], [tgt.lng, tgt.lat]]
                    }
                })

    # 4. IoT Sensors GeoJSON
    sensors = db.query(Sensor).filter(Sensor.area_id == area_id).all()
    sensor_features = []
    for sn in sensors:
        sensor_features.append({
            "type": "Feature",
            "properties": {
                "id": sn.id,
                "code": sn.sensor_code,
                "name": sn.name,
                "type": sn.sensor_type,
                "value": sn.current_value,
                "unit": sn.unit,
                "battery": sn.battery_level_pct,
                "health": sn.health_status,
                "warning_threshold": sn.warning_threshold,
                "critical_threshold": sn.critical_threshold
            },
            "geometry": {
                "type": "Point",
                "coordinates": [sn.lng, sn.lat]
            }
        })

    # 5. DEM Points GeoJSON
    dem_pts = db.query(TerrainDEM).filter(TerrainDEM.area_id == area_id).all()
    dem_features = []
    for d in dem_pts:
        dem_features.append({
            "type": "Feature",
            "properties": {
                "elevation_m": d.elevation_m,
                "slope_deg": d.slope_deg,
                "flow_dir": d.flow_direction,
                "is_depression": d.is_depression,
                "accumulation": d.flow_accumulation_val
            },
            "geometry": {
                "type": "Point",
                "coordinates": [d.lng, d.lat]
            }
        })

    # 6. Ward-specific Water Bodies
    water_bodies = WARD_WATER_BODIES.get(area_id, WARD_WATER_BODIES[1])

    # 7. Ward-specific Critical Facilities
    critical_facilities = WARD_CRITICAL_FACILITIES.get(area_id, WARD_CRITICAL_FACILITIES[1])

    return {
        "area_id": area_id,
        "roads_geojson": {"type": "FeatureCollection", "features": road_features},
        "drain_nodes_geojson": {"type": "FeatureCollection", "features": node_features},
        "drain_segments_geojson": {"type": "FeatureCollection", "features": segment_features},
        "sensors_geojson": {"type": "FeatureCollection", "features": sensor_features},
        "dem_geojson": {"type": "FeatureCollection", "features": dem_features},
        "water_bodies": water_bodies,
        "critical_facilities": critical_facilities
    }
