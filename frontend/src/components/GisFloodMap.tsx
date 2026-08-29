import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Eye, EyeOff, MapPin, Satellite, Moon, Sun, Compass, Waves } from 'lucide-react';
import { Area } from '../types';
import { Water3DSubsurfaceView } from './Water3DSubsurfaceView';

// Fix standard leaflet icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface GisFloodMapProps {
  currentArea: Area | undefined;
  gisData: any;
  leadTimeSelected: number; // 0, 30, 60, 120, 180 min
  onSelectRoad?: (roadName: string) => void;
}

export const GisFloodMap: React.FC<GisFloodMapProps> = ({
  currentArea,
  gisData,
  leadTimeSelected,
  onSelectRoad,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelTileLayerRef = useRef<L.TileLayer | null>(null);

  // Basemap switch: Default to High-Resolution Satellite (satellite | dark | streets | water)
  const [baseMapType, setBaseMapType] = useState<'satellite' | 'dark' | 'streets' | 'water'>('satellite');

  // Layer toggles
  const [layersVisibility, setLayersVisibility] = useState({
    roads: true,
    drainage: true,
    manholes: true,
    sensors: true,
    waterBodies: true,
    criticalFacilities: true,
    demContour: true,
  });

  const toggleLayer = (layerName: keyof typeof layersVisibility) => {
    setLayersVisibility(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  // Base Tile URLs
  const getTileConfig = (type: 'satellite' | 'dark' | 'streets' | 'water') => {
    switch (type) {
      case 'satellite':
        return {
          base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          labels: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, GIS User Community',
          maxZoom: 19,
        };
      case 'dark':
        return {
          base: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          labels: null,
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
          maxZoom: 19,
        };
      case 'streets':
        return {
          base: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          labels: null,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        };
      case 'water':
        return {
          base: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          labels: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          attribution: 'DRAIN-X Hydrological Water Inundation Model & Subsurface Digital Twin',
          maxZoom: 19,
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentArea?.center_lat || 12.9815, currentArea?.center_lng || 80.2180],
        zoom: currentArea?.zoom_level || 14,
        zoomControl: false,
      });

      const config = getTileConfig('satellite');
      const baseLayer = L.tileLayer(config.base, {
        attribution: config.attribution,
        maxZoom: config.maxZoom,
      }).addTo(map);
      baseTileLayerRef.current = baseLayer;

      if (config.labels) {
        const labelLayer = L.tileLayer(config.labels, {
          maxZoom: config.maxZoom,
          opacity: 0.85,
        }).addTo(map);
        labelTileLayerRef.current = labelLayer;
      }

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer groups
      layerGroupsRef.current = {
        roads: L.layerGroup().addTo(map),
        drainage: L.layerGroup().addTo(map),
        manholes: L.layerGroup().addTo(map),
        sensors: L.layerGroup().addTo(map),
        waterBodies: L.layerGroup().addTo(map),
        criticalFacilities: L.layerGroup().addTo(map),
        demContour: L.layerGroup().addTo(map),
      };

      mapInstanceRef.current = map;
    }
  }, []);

  // Switch Basemap Tile on user toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove previous base & label layers
    if (baseTileLayerRef.current) map.removeLayer(baseTileLayerRef.current);
    if (labelTileLayerRef.current) map.removeLayer(labelTileLayerRef.current);

    const config = getTileConfig(baseMapType);
    const newBase = L.tileLayer(config.base, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);
    baseTileLayerRef.current = newBase;

    if (config.labels) {
      const newLabel = L.tileLayer(config.labels, {
        maxZoom: config.maxZoom,
        opacity: 0.85,
      }).addTo(map);
      labelTileLayerRef.current = newLabel;
    }

    // Re-add vector layers so they sit above new basemap
    Object.values(layerGroupsRef.current).forEach(lg => {
      lg.eachLayer((l: any) => {
        if (typeof l.bringToFront === 'function') l.bringToFront();
      });
    });
  }, [baseMapType]);

  // Update Center when Area changes
  useEffect(() => {
    if (mapInstanceRef.current && currentArea) {
      mapInstanceRef.current.flyTo([currentArea.center_lat, currentArea.center_lng], currentArea.zoom_level, {
        duration: 1.2,
      });
    }
  }, [currentArea?.id]);

  // Render & Re-render Map Layers when data or lead time changes
  useEffect(() => {
    if (!mapInstanceRef.current || !gisData) return;

    const { roads, drainage, manholes, sensors, waterBodies, criticalFacilities, demContour } = layerGroupsRef.current;

    // Clear previous
    roads.clearLayers();
    drainage.clearLayers();
    manholes.clearLayers();
    sensors.clearLayers();
    waterBodies.clearLayers();
    criticalFacilities.clearLayers();
    demContour.clearLayers();

    // 1. Render Water Bodies (Crisp High-Contrast Sky Blue Polygon Outline & Shading)
    if (layersVisibility.waterBodies && gisData.water_bodies) {
      gisData.water_bodies.forEach((wb: any) => {
        const latlngs = wb.coordinates.map((c: number[]) => [c[1], c[0]]);
        
        const poly = L.polygon(latlngs, {
          color: '#38bdf8',
          weight: 3.5,
          opacity: 0.95,
          fillColor: '#0284c7',
          fillOpacity: 0.45,
        });

        poly.bindPopup(`
          <div style="font-family: system-ui; padding: 6px; min-width: 190px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 14px; display: flex; align-items: center; gap: 4px;">
              🌊 ${wb.name}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Classification: <b>${wb.type}</b></div>
            <div style="font-size: 11px; color: #e2e8f0; margin-top: 4px;">Storage Capacity: <b>${wb.capacity_mcft} Mcft</b></div>
            <div style="font-size: 11px; color: #fbbf24; font-weight: bold; margin-top: 2px;">
              Current Volume: ${wb.current_storage_pct}%
            </div>
          </div>
        `);
        waterBodies.addLayer(poly);
      });
    }

    // 2. Render Drainage Segments (Pipes & Canals with High-Contrast Outer Casing)
    if (layersVisibility.drainage && gisData.drain_segments_geojson?.features) {
      gisData.drain_segments_geojson.features.forEach((feat: any) => {
        const props = feat.properties;
        const coords = feat.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
        
        let coreColor = '#06b6d4'; // Vivid Neon Cyan for Primary Canal
        let dashArray = undefined;
        let coreWeight = props.drain_type === 'PRIMARY_CANAL' ? 6 : 4;

        if (props.condition === 'OVERFLOW' || props.utilization_pct > 100) {
          coreColor = '#ef4444'; // Surcharge Red
          dashArray = '10, 8';
          coreWeight = 7;
        } else if (props.condition === 'PARTIAL_BLOCKAGE' || props.utilization_pct > 80) {
          coreColor = '#f59e0b'; // Amber Surcharge
          coreWeight = 5;
        } else if (props.condition === 'BACKFLOW') {
          coreColor = '#c084fc'; // Purple Backflow
          dashArray = '8, 6';
        } else if (props.drain_type !== 'PRIMARY_CANAL') {
          coreColor = '#3b82f6'; // Royal Blue for Secondary
        }

        // Casing Line (Dark border behind the vibrant conduit line for ultra-crisp clarity against satellite tiles)
        const casingLine = L.polyline(coords, {
          color: '#000000',
          weight: coreWeight + 4,
          opacity: 0.95,
        });
        drainage.addLayer(casingLine);

        // Core Glowing Line
        const coreLine = L.polyline(coords, {
          color: coreColor,
          weight: coreWeight,
          dashArray,
          opacity: 1.0,
        });

        coreLine.bindPopup(`
          <div style="font-family: system-ui; padding: 6px; min-width: 200px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 13px;">
              🚰 Conduit: ${props.code}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Type: <b>${props.drain_type}</b></div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Manning Capacity: <b>${props.capacity_m3s} m³/s</b></div>
            <div style="font-size: 11px; color: #cbd5e1;">Real-Time Flow: <b>${props.current_flow_m3s} m³/s</b></div>
            <div style="font-size: 12px; font-weight: 800; color: ${props.utilization_pct > 100 ? '#ef4444' : '#10b981'}; margin-top: 4px;">
              Utilization: ${props.utilization_pct}% (${props.condition})
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Outfall Sink: ${props.outfall}</div>
          </div>
        `);
        drainage.addLayer(coreLine);
      });
    }

    // 3. Render Roads (Double-Stroke High-Contrast Lines with Instant Depth Grading)
    if (layersVisibility.roads && gisData.roads_geojson?.features) {
      const leadMultiplier = leadTimeSelected === 0 ? 1.0 : (leadTimeSelected === 30 ? 1.4 : (leadTimeSelected === 60 ? 1.9 : (leadTimeSelected === 120 ? 2.4 : 2.8)));

      gisData.roads_geojson.features.forEach((feat: any) => {
        const props = feat.properties;
        const coords = feat.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);

        const effectiveDepth = Math.round(props.current_water_depth_cm * leadMultiplier);
        
        let strokeColor = '#10b981'; // Vivid Green Passable
        let strokeWeight = 6;
        let passability = 'PASSABLE';

        if (effectiveDepth > 50) {
          strokeColor = '#ef4444'; // Bright Red Impassable
          strokeWeight = 8;
          passability = 'IMPASSABLE';
        } else if (effectiveDepth > 28) {
          strokeColor = '#f97316'; // Vivid Orange Hazard
          strokeWeight = 7;
          passability = 'HAZARD';
        } else if (effectiveDepth > 12) {
          strokeColor = '#facc15'; // Bright Yellow Slow
          strokeWeight = 6;
          passability = 'SLOW';
        }

        // Casing Line for Street (Gives black shadow edge against real satellite imagery)
        const roadCasing = L.polyline(coords, {
          color: '#000000',
          weight: strokeWeight + 4,
          opacity: 0.95,
        });
        roads.addLayer(roadCasing);

        // Core Vivid Road Line
        const roadLine = L.polyline(coords, {
          color: strokeColor,
          weight: strokeWeight,
          opacity: 1.0,
        });

        roadLine.bindPopup(`
          <div style="font-family: system-ui; padding: 6px; min-width: 220px;">
            <div style="font-weight: 800; color: #ffffff; font-size: 14px;">🛣️ ${props.name}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              ${props.road_type} • Elevation: <b>${props.elevation_m}m MSL</b>
            </div>
            <div style="margin-top: 6px; font-size: 14px; font-weight: 800; color: ${strokeColor};">
              Forecast Water Depth: ${effectiveDepth} cm
            </div>
            <div style="font-size: 11px; font-weight: 700; color: ${strokeColor};">
              Status: ${passability} (Nowcast +${leadTimeSelected}m)
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
              Inundation Probability: <b>${Math.min(99, Math.round(props.flood_probability_pct * (leadMultiplier * 0.8)))}%</b>
            </div>
          </div>
        `);

        roadLine.on('click', () => {
          if (onSelectRoad) onSelectRoad(props.name);
        });

        roads.addLayer(roadLine);
      });
    }

    // 4. Render Manhole Nodes (High-Visibility Glowing Circles)
    if (layersVisibility.manholes && gisData.drain_nodes_geojson?.features) {
      gisData.drain_nodes_geojson.features.forEach((feat: any) => {
        const props = feat.properties;
        const [lng, lat] = feat.geometry.coordinates;

        let fillColor = '#38bdf8';
        if (props.status === 'OVERFLOW') fillColor = '#ef4444';
        else if (props.status === 'SURCHARGE') fillColor = '#f59e0b';
        else if (props.status === 'BACKFLOW') fillColor = '#a855f7';

        const marker = L.circleMarker([lat, lng], {
          radius: props.status === 'SURCHARGE' || props.status === 'OVERFLOW' ? 9 : 7,
          fillColor,
          color: '#ffffff',
          weight: 2.5,
          opacity: 1,
          fillOpacity: 0.95,
        });

        marker.bindPopup(`
          <div style="font-family: system-ui; padding: 6px; min-width: 180px;">
            <div style="font-weight: 800; color: ${fillColor}; font-size: 13px;">
              🕳️ ${props.code}
            </div>
            <div style="font-size: 11px; color: #94a3b8;">Type: <b>${props.type}</b></div>
            <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Invert Level: <b>${props.invert_level_m}m MSL</b></div>
            <div style="font-size: 11px; color: #cbd5e1;">Ground Elev: <b>${props.ground_elevation_m}m MSL</b></div>
            <div style="font-size: 12px; font-weight: 800; color: ${fillColor}; margin-top: 4px;">
              Status: ${props.status}
            </div>
          </div>
        `);
        manholes.addLayer(marker);
      });
    }

    // 5. Render IoT Sensors (High-Contrast Diamond Telemetry Badges)
    if (layersVisibility.sensors && gisData.sensors_geojson?.features) {
      gisData.sensors_geojson.features.forEach((feat: any) => {
        const props = feat.properties;
        const [lng, lat] = feat.geometry.coordinates;

        const sensorIcon = L.divIcon({
          className: 'custom-sensor-marker',
          html: `
            <div style="
              background: #020617; 
              border: 2px solid ${props.health === 'ONLINE' ? '#10b981' : '#f59e0b'}; 
              box-shadow: 0 0 12px ${props.health === 'ONLINE' ? 'rgba(16,185,129,0.8)' : 'rgba(245,158,11,0.8)'};
              border-radius: 8px; 
              width: 26px; 
              height: 26px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 12px;
            ">
              📡
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([lat, lng], { icon: sensorIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui; padding: 6px; min-width: 190px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 13px;">📡 ${props.name}</div>
            <div style="font-size: 10px; color: #94a3b8;">Code: ${props.code} • ${props.type}</div>
            <div style="margin-top: 6px; font-size: 14px; font-weight: 800; color: #10b981;">
              Reading: ${props.value} ${props.unit}
            </div>
            <div style="font-size: 11px; color: #cbd5e1;">Battery: <b>${props.battery}%</b> | Health: <b>${props.health}</b></div>
          </div>
        `);
        sensors.addLayer(marker);
      });
    }

    // 6. Render Critical Infrastructure (High-Visibility Pin Badges)
    if (layersVisibility.criticalFacilities && gisData.critical_facilities) {
      gisData.critical_facilities.forEach((fac: any) => {
        let iconEmoji = '🏥';
        let borderColor = '#ef4444';
        if (fac.type === 'FIRE_STATION') {
          iconEmoji = '🚒';
          borderColor = '#f97316';
        } else if (fac.type === 'EMERGENCY_SHELTER') {
          iconEmoji = '🏕️';
          borderColor = '#10b981';
        } else if (fac.type === 'PUMP_STATION') {
          iconEmoji = '⚙️';
          borderColor = '#06b6d4';
        } else if (fac.type === 'POWER_GRID') {
          iconEmoji = '⚡';
          borderColor = '#eab308';
        }

        const facIcon = L.divIcon({
          className: 'custom-fac-marker',
          html: `
            <div style="
              background: #020617; 
              border: 2px solid ${borderColor}; 
              box-shadow: 0 0 12px ${borderColor};
              border-radius: 50%; 
              width: 30px; 
              height: 30px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 15px;
            ">
              ${iconEmoji}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([fac.lat, fac.lng], { icon: facIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui; padding: 6px; min-width: 190px;">
            <div style="font-weight: 800; color: #f8fafc; font-size: 13px;">${iconEmoji} ${fac.name}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Type: <b>${fac.type}</b></div>
            ${fac.contact ? `<div style="font-size: 11px; color: #38bdf8; margin-top: 3px;">📞 ${fac.contact}</div>` : ''}
            ${fac.capacity ? `<div style="font-size: 11px; color: #10b981; margin-top: 3px;">Shelter Capacity: <b>${fac.capacity} Persons</b></div>` : ''}
            <div style="font-size: 10px; font-weight: 700; color: #10b981; margin-top: 4px;">Status: ${fac.status}</div>
          </div>
        `);
        criticalFacilities.addLayer(marker);
      });
    }

    // 7. DEM Elevation Points
    if (layersVisibility.demContour && gisData.dem_geojson?.features) {
      gisData.dem_geojson.features.forEach((feat: any) => {
        const props = feat.properties;
        const [lng, lat] = feat.geometry.coordinates;

        const demMarker = L.circleMarker([lat, lng], {
          radius: props.is_depression ? 6 : 4,
          fillColor: props.is_depression ? '#ef4444' : '#64748b',
          color: '#ffffff',
          weight: 1,
          opacity: 0.8,
          fillOpacity: props.is_depression ? 0.8 : 0.4,
        });

        demMarker.bindPopup(`
          <div style="font-family: system-ui; padding: 4px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 12px;">🏔️ DEM Point (CartoDEM 2.5m)</div>
            <div style="font-size: 11px; color: #cbd5e1;">Elevation: <b>${props.elevation_m}m MSL</b></div>
            <div style="font-size: 11px; color: #cbd5e1;">Slope: <b>${props.slope_deg}° (${props.flow_dir})</b></div>
            ${props.is_depression ? '<div style="color: #ef4444; font-weight: bold; font-size: 11px; margin-top: 2px;">⚠️ Depression Sink Hole</div>' : ''}
          </div>
        `);
        demContour.addLayer(demMarker);
      });
    }

  }, [gisData, leadTimeSelected, layersVisibility]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 3D Water Map & Subsurface HGL Overlay (Active when baseMapType === 'water') */}
      {baseMapType === 'water' && (
        <div className="absolute inset-0 z-[450]">
          <Water3DSubsurfaceView
            currentArea={currentArea}
            gisData={gisData}
            baseMapType={baseMapType}
            onSelectBaseMapType={setBaseMapType}
            onClose2D={() => setBaseMapType('satellite')}
          />
        </div>
      )}

      {/* 2D Basemap Switcher & GIS Layer Controls (Active when NOT in water 3D mode) */}
      {baseMapType !== 'water' && (
        <>
          {/* Top Left: Basemap Switcher (Satellite HD / Dark / Streets / Water Map) */}
          <div className="absolute top-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 flex-wrap max-w-xl">
            <button
              onClick={() => setBaseMapType('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition ${
                baseMapType === 'satellite'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>🛰️ Satellite HD</span>
            </button>

            <button
              onClick={() => setBaseMapType('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                baseMapType === 'dark'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>🌑 Dark Mode</span>
            </button>

            <button
              onClick={() => setBaseMapType('streets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                baseMapType === 'streets'
                  ? 'bg-slate-800 text-cyan-300 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>🗺️ Street View</span>
            </button>

            {/* 4th Option: Water Map */}
            <button
              onClick={() => setBaseMapType('water')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all text-cyan-400 hover:text-cyan-200 hover:bg-slate-800/80 border border-cyan-500/40 bg-slate-950/80"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-200" />
              <span>🌊 Water Map</span>
            </button>
          </div>

          {/* Top Right: Floating Layer Visibility Controls */}
          <div className="absolute top-4 right-4 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl space-y-2 max-w-xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400 uppercase tracking-wider pb-2 border-b border-slate-800">
              <Layers className="w-3.5 h-3.5" />
              <span>GIS System Layers</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => toggleLayer('roads')}
                className={`flex items-center gap-2 p-1.5 rounded-lg border font-bold text-[11px] transition ${
                  layersVisibility.roads
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {layersVisibility.roads ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>🛣️ Streets ({gisData?.roads_geojson?.features?.length || 0})</span>
              </button>

              <button
                onClick={() => toggleLayer('drainage')}
                className={`flex items-center gap-2 p-1.5 rounded-lg border font-bold text-[11px] transition ${
                  layersVisibility.drainage
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {layersVisibility.drainage ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>🚰 Conduits</span>
              </button>

              <button
                onClick={() => toggleLayer('manholes')}
                className={`flex items-center gap-2 p-1.5 rounded-lg border font-bold text-[11px] transition ${
                  layersVisibility.manholes
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {layersVisibility.manholes ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>🕳️ Manholes ({gisData?.drain_nodes_geojson?.features?.length || 0})</span>
              </button>

              <button
                onClick={() => toggleLayer('sensors')}
                className={`flex items-center gap-2 p-1.5 rounded-lg border font-bold text-[11px] transition ${
                  layersVisibility.sensors
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {layersVisibility.sensors ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>📡 IoT Nodes ({gisData?.sensors_geojson?.features?.length || 0})</span>
              </button>

              <button
                onClick={() => toggleLayer('waterBodies')}
                className={`flex items-center gap-2 p-1.5 rounded-lg border font-bold text-[11px] transition ${
                  layersVisibility.waterBodies
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {layersVisibility.waterBodies ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>🌊 Water Bodies</span>
              </button>

              <button
                onClick={() => toggleLayer('criticalFacilities')}
                className={`flex items-center gap-2 p-1.5 rounded-lg border font-bold text-[11px] transition ${
                  layersVisibility.criticalFacilities
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {layersVisibility.criticalFacilities ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>🏥 Facilities</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Left: High-Contrast Legend Pill */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-2xl flex flex-wrap items-center gap-3 text-xs">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Depth Legend:</div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          <span className="text-[11px] text-slate-200 font-bold">&lt;15cm (Passable)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded-full bg-yellow-400 inline-block shadow-sm"></span>
          <span className="text-[11px] text-slate-200 font-bold">15-28cm (Slow)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded-full bg-orange-500 inline-block shadow-sm"></span>
          <span className="text-[11px] text-slate-200 font-bold">28-50cm (Hazard)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-2 rounded-full bg-red-500 inline-block shadow-sm"></span>
          <span className="text-[11px] text-slate-200 font-bold">&gt;50cm (Impassable)</span>
        </div>
        <div className="border-l border-slate-700 pl-3 flex items-center gap-2">
          <span className="w-4 h-1.5 bg-cyan-400 inline-block"></span>
          <span className="text-[11px] text-cyan-300 font-bold">Primary Canal</span>
          <span className="w-4 h-1.5 bg-blue-500 inline-block"></span>
          <span className="text-[11px] text-blue-300 font-bold">Secondary Pipe</span>
        </div>
      </div>
    </div>
  );
};
