import math
from typing import Dict, Any, List
import networkx as nx

class HydraulicSolver:
    """
    Hydraulic Capacity & Stormwater Network Graph Solver
    Implements Manning's Equation for open and closed conduits:
    Q = (1/n) * A * (R^(2/3)) * (S^(1/2))
    """
    
    @staticmethod
    def calculate_pipe_capacity(
        diameter_m: float,
        slope_pct: float,
        manning_n: float = 0.015,
        blockage_pct: float = 0.0
    ) -> Dict[str, float]:
        # Cross-sectional area for circular conduit running full
        r = diameter_m / 2.0
        area = math.pi * (r ** 2)
        # Wetted perimeter
        perimeter = 2.0 * math.pi * r
        # Hydraulic radius R = A / P
        hydraulic_radius = area / perimeter if perimeter > 0 else 0.0
        # Slope S (m/m)
        slope_m_per_m = max(slope_pct / 100.0, 0.0005)
        
        # Theoretical full-flow capacity Q (m3/s)
        q_theoretical = (1.0 / max(manning_n, 0.010)) * area * (hydraulic_radius ** (2.0 / 3.0)) * math.sqrt(slope_m_per_m)
        
        # Effective capacity adjusted for debris blockage
        effective_capacity = q_theoretical * (1.0 - (min(blockage_pct, 90.0) / 100.0))
        
        return {
            "theoretical_capacity_m3s": round(q_theoretical, 2),
            "effective_capacity_m3s": round(effective_capacity, 2),
            "hydraulic_radius_m": round(hydraulic_radius, 3),
            "velocity_ms": round(effective_capacity / area if area > 0 else 0, 2)
        }

    @staticmethod
    def calculate_open_canal_capacity(
        width_m: float,
        depth_m: float,
        slope_pct: float,
        manning_n: float = 0.020,
        blockage_pct: float = 0.0
    ) -> Dict[str, float]:
        area = width_m * depth_m
        perimeter = width_m + 2.0 * depth_m
        hydraulic_radius = area / perimeter if perimeter > 0 else 0.0
        slope_m_per_m = max(slope_pct / 100.0, 0.0005)
        
        q_theoretical = (1.0 / max(manning_n, 0.012)) * area * (hydraulic_radius ** (2.0 / 3.0)) * math.sqrt(slope_m_per_m)
        effective_capacity = q_theoretical * (1.0 - (min(blockage_pct, 90.0) / 100.0))
        
        return {
            "theoretical_capacity_m3s": round(q_theoretical, 2),
            "effective_capacity_m3s": round(effective_capacity, 2),
            "hydraulic_radius_m": round(hydraulic_radius, 3),
            "velocity_ms": round(effective_capacity / area if area > 0 else 0, 2)
        }

    @staticmethod
    def evaluate_node_surcharge(
        water_level_m: float,
        surcharge_threshold_m: float,
        ground_elevation_m: float,
        invert_elevation_m: float,
        outfall_backwater_m: float = 0.0
    ) -> Dict[str, Any]:
        total_depth = ground_elevation_m - invert_elevation_m
        head_room = ground_elevation_m - (invert_elevation_m + water_level_m)
        
        status = "NORMAL"
        surcharge_pct = min(100.0, max(0.0, (water_level_m / total_depth) * 100.0)) if total_depth > 0 else 0
        
        if outfall_backwater_m > 1.2:
            status = "BACKFLOW"
        elif water_level_m >= total_depth - 0.15:
            status = "OVERFLOW"
        elif water_level_m >= surcharge_threshold_m:
            status = "SURCHARGE"
            
        return {
            "status": status,
            "surcharge_pct": round(surcharge_pct, 1),
            "freeboard_m": round(max(0.0, head_room), 2),
            "overflow_risk": status in ["SURCHARGE", "OVERFLOW", "BACKFLOW"]
        }

    @staticmethod
    def build_network_graph(nodes: List[Dict], segments: List[Dict]) -> nx.DiGraph:
        G = nx.DiGraph()
        for node in nodes:
            G.add_node(node["id"], **node)
        for seg in segments:
            G.add_edge(seg["source_node_id"], seg["target_node_id"], **seg)
        return G
