import math
from typing import Dict, Any

class HydrologicalModel:
    """
    2D Surface Hydrology & Runoff Estimation Model
    Utilizes Rational Method: Q = 0.278 * C * I * A
    Where:
    Q = Peak Runoff Rate (m3/s)
    C = Weighted Runoff Coefficient (0.0 to 1.0)
    I = Rainfall Intensity (mm/hr)
    A = Catchment Area (km2)
    """

    @staticmethod
    def calculate_weighted_runoff_c(
        built_up_ratio: float = 0.65,
        paved_roads_ratio: float = 0.20,
        vegetation_ratio: float = 0.10,
        water_bodies_ratio: float = 0.05
    ) -> float:
        # Standard SCS / CPWD Runoff Coefficients
        c_built = 0.88 # Concrete roofs & dense urban
        c_road = 0.92 # Bituminous / concrete roads
        c_veg = 0.22 # Lawns & shrubs
        c_water = 1.00 # Direct precipitation onto water body
        
        weighted_c = (
            (built_up_ratio * c_built) +
            (paved_roads_ratio * c_road) +
            (vegetation_ratio * c_veg) +
            (water_bodies_ratio * c_water)
        )
        return min(1.0, max(0.1, round(weighted_c, 3)))

    @staticmethod
    def estimate_surface_runoff(
        rainfall_intensity_mm_hr: float,
        catchment_area_sqkm: float,
        runoff_coefficient: float
    ) -> Dict[str, float]:
        # Q = 0.278 * C * I * A (m3/s)
        peak_runoff_m3s = 0.278 * runoff_coefficient * rainfall_intensity_mm_hr * catchment_area_sqkm
        # Hourly volume in m3
        hourly_volume_m3 = (rainfall_intensity_mm_hr / 1000.0) * (catchment_area_sqkm * 1_000_000) * runoff_coefficient
        
        return {
            "peak_runoff_m3s": round(peak_runoff_m3s, 2),
            "hourly_runoff_volume_m3": round(hourly_volume_m3, 1),
            "effective_intensity_mm_hr": round(rainfall_intensity_mm_hr * runoff_coefficient, 2)
        }

    @staticmethod
    def calculate_street_accumulation(
        rainfall_intensity_mm_hr: float,
        elevation_m: float,
        slope_deg: float,
        is_depression: bool,
        drainage_capacity_utilization: float
    ) -> Dict[str, Any]:
        """
        Calculates street water depth accumulation based on DEM depression and drainage surcharge
        """
        # Baseline depth from direct downpour
        base_depth_cm = (rainfall_intensity_mm_hr * 0.4)
        
        # Depression bowl multiplier (e.g. Velachery Vijayanagar elevation < 2.5m)
        depression_multiplier = 1.8 if is_depression or elevation_m < 2.5 else 1.0
        
        # Slope drain-off effect: steeper slopes shed water faster
        slope_factor = max(0.5, 1.0 - (slope_deg * 0.2))
        
        # Drainage surcharge backflow effect: if drain is > 100% capacity, water ponds on surface
        surcharge_factor = 1.0
        if drainage_capacity_utilization > 100.0:
            surcharge_factor = 1.0 + ((drainage_capacity_utilization - 100.0) / 50.0)
        elif drainage_capacity_utilization > 75.0:
            surcharge_factor = 1.2
            
        final_depth_cm = base_depth_cm * depression_multiplier * slope_factor * surcharge_factor
        
        # Passability classification
        if final_depth_cm < 15.0:
            passability = "PASSABLE"
            risk = "NORMAL" if final_depth_cm < 8.0 else "WATCH"
        elif final_depth_cm < 30.0:
            passability = "SLOW"
            risk = "WARNING"
        else:
            passability = "IMPASSABLE"
            risk = "CRITICAL"
            
        return {
            "water_depth_cm": round(final_depth_cm, 1),
            "passability_status": passability,
            "risk_level": risk,
            "depression_effect": is_depression or elevation_m < 2.5
        }
