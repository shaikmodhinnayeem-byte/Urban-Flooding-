import httpx
import json
import urllib.parse
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.schema import Road, Area, DatasetRegistry

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
HEADERS = {"User-Agent": "DRAIN-X-Chennai-Flood-System/1.0 (contact@drainx.gov.in)"}

def fetch_osm_roads_for_area(db: Session, area: Area) -> List[Dict[str, Any]]:
    """
    Fetch live OpenStreetMap road geometries for a Chennai ward bounding box using Overpass API
    and update/cache in SQLite database.
    """
    # Create bounding box (+/- 0.015 degrees ~ 1.5km around ward center)
    lat_min, lat_max = area.center_lat - 0.012, area.center_lat + 0.012
    lng_min, lng_max = area.center_lng - 0.012, area.center_lng + 0.012

    query = f"""
    [out:json][timeout:20];
    (
      way["highway"~"primary|secondary|tertiary|trunk|residential"]({lat_min:.4f},{lng_min:.4f},{lat_max:.4f},{lng_max:.4f});
    );
    out body 25;
    >;
    out skel qt;
    """

    try:
        with httpx.Client(timeout=12.0) as client:
            resp = client.post(OVERPASS_URL, data={"data": query}, headers=HEADERS)
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                
                # Parse nodes map
                nodes_map = {el["id"]: (el["lat"], el["lon"]) for el in elements if el.get("type") == "node"}
                ways = [el for el in elements if el.get("type") == "way"]
                
                fetched_roads = []
                for way in ways:
                    tags = way.get("tags", {})
                    road_name = tags.get("name", tags.get("name:en", f"OSM Road {way['id']}"))
                    road_type = tags.get("highway", "Arterial").capitalize() + " Road"
                    node_ids = way.get("nodes", [])
                    
                    coords = [nodes_map[nid] for nid in node_ids if nid in nodes_map]
                    if len(coords) >= 2:
                        start_lat, start_lng = coords[0]
                        end_lat, end_lng = coords[-1]
                        
                        fetched_roads.append({
                            "name": road_name,
                            "road_type": road_type,
                            "start_lat": start_lat,
                            "start_lng": start_lng,
                            "end_lat": end_lat,
                            "end_lng": end_lng,
                            "coordinates_json": json.dumps(coords),
                            "osm_id": way["id"]
                        })

                # Update or insert into Road table
                for r_data in fetched_roads[:5]: # Update first 5 roads per area
                    existing = db.query(Road).filter(Road.area_id == area.id, Road.name == r_data["name"]).first()
                    if existing:
                        existing.coordinates_json = r_data["coordinates_json"]
                        existing.start_lat = r_data["start_lat"]
                        existing.start_lng = r_data["start_lng"]
                        existing.end_lat = r_data["end_lat"]
                        existing.end_lng = r_data["end_lng"]
                    else:
                        new_road = Road(
                            area_id=area.id,
                            name=r_data["name"],
                            road_type=r_data["road_type"],
                            start_lat=r_data["start_lat"],
                            start_lng=r_data["start_lng"],
                            end_lat=r_data["end_lat"],
                            end_lng=r_data["end_lng"],
                            coordinates_json=r_data["coordinates_json"],
                            elevation_m=area.avg_elevation_m,
                            length_km=1.2,
                            width_m=18.0,
                            passability_status="PASSABLE"
                        )
                        db.add(new_road)
                
                # Update DatasetRegistry sync timestamp
                ds = db.query(DatasetRegistry).filter(DatasetRegistry.id == 12).first()
                if ds:
                    ds.status = "LIVE"
                    ds.last_synced_at = datetime.datetime.utcnow()
                    ds.updated_at = datetime.datetime.utcnow()

                db.commit()
                return fetched_roads
    except Exception as e:
        print(f"[WARN] Overpass OSM fetch fallback for area {area.name}: {e}")

    return []
