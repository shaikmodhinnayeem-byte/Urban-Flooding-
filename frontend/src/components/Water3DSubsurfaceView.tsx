import React, { useState, useEffect, useRef } from 'react';
import { Area } from '../types';
import { 
  Waves, RotateCcw, RefreshCw, ZoomIn, ZoomOut, Compass, 
  ChevronUp, ChevronDown, Activity, Satellite, Moon, Sun
} from 'lucide-react';

interface Water3DSubsurfaceViewProps {
  currentArea: Area | undefined;
  gisData?: any;
  baseMapType?: string;
  onSelectBaseMapType?: (type: any) => void;
  onClose2D?: () => void;
}

interface AreaSubsurfaceNode {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  status: 'NORMAL' | 'SURCHARGE' | 'CRITICAL';
  depthCm: number;
  hgl: number;
  invertM: number;
  groundM: number;
}

interface Conduit {
  from: string;
  to: string;
  color: string;
  weight: number;
}

export const Water3DSubsurfaceView: React.FC<Water3DSubsurfaceViewProps> = ({
  currentArea,
  gisData,
  baseMapType = 'water',
  onSelectBaseMapType,
  onClose2D,
}) => {
  const [yaw, setYaw] = useState<number>(32);
  const [pitch, setPitch] = useState<number>(42);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(false);
  const [showHglProfile, setShowHglProfile] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startYaw: number; startPitch: number }>({ x: 0, y: 0, startYaw: 32, startPitch: 42 });

  // Auto-Orbit Effect
  useEffect(() => {
    let animId: number;
    if (isAutoOrbit) {
      const loop = () => {
        setYaw((prev) => (prev + 0.4) % 360);
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isAutoOrbit]);

  // Mouse Orbit Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: yaw,
      startPitch: pitch,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    let newYaw = (dragStartRef.current.startYaw + deltaX * 0.5) % 360;
    if (newYaw < 0) newYaw += 360;
    
    let newPitch = Math.min(75, Math.max(10, dragStartRef.current.startPitch + deltaY * 0.3));

    setYaw(Math.round(newYaw));
    setPitch(Math.round(newPitch));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const areaId = currentArea?.id || 1;
  const areaName = currentArea?.name || 'Velachery';
  const zoneNum = currentArea?.zone_number || 13;
  const wardNum = currentArea?.ward_number || 179;
  const avgElev = currentArea?.avg_elevation_m || 2.4;

  // DYNAMIC AREA SUBSURFACE NETWORKS FOR ALL 14 CHENNAI LOCATIONS (Spacious Non-Overlapping Layout)
  const getSubsurfaceNetworkForArea = (): { nodes: AreaSubsurfaceNode[]; conduits: Conduit[]; outfallName: string } => {
    switch (areaId) {
      case 1: // Velachery
        return {
          outfallName: '🌊 PALLIKARANAI MARSHLAND & BUCKINGHAM CANAL',
          nodes: [
            { id: 'v1', name: 'Vijayanagar Bus Terminus', x: 130, y: 140, z: 40, status: 'CRITICAL', depthCm: 85, hgl: 3.2, invertM: 0.8, groundM: 2.4 },
            { id: 'v2', name: '100ft Bypass Canal', x: 280, y: 310, z: 35, status: 'SURCHARGE', depthCm: 58, hgl: 3.8, invertM: 1.1, groundM: 2.6 },
            { id: 'v3', name: 'Taramani Link Conduit', x: 430, y: 120, z: 25, status: 'NORMAL', depthCm: 35, hgl: 4.2, invertM: 1.5, groundM: 3.6 },
            { id: 'v4', name: 'Velachery Lake Outfall', x: 580, y: 300, z: 45, status: 'CRITICAL', depthCm: 92, hgl: 2.5, invertM: 0.5, groundM: 1.9 },
            { id: 'v5', name: 'Pallikaranai Sluice', x: 710, y: 170, z: 15, status: 'SURCHARGE', depthCm: 72, hgl: 2.1, invertM: 0.4, groundM: 2.2 },
          ],
          conduits: [
            { from: 'v1', to: 'v2', color: '#ef4444', weight: 6 },
            { from: 'v2', to: 'v3', color: '#06b6d4', weight: 4 },
            { from: 'v2', to: 'v4', color: '#ef4444', weight: 6 },
            { from: 'v4', to: 'v5', color: '#3b82f6', weight: 6 },
            { from: 'v3', to: 'v5', color: '#06b6d4', weight: 4 },
          ]
        };

      case 2: // Adyar
        return {
          outfallName: '🌊 ADYAR RIVER ESTUARY & BAY OF BENGAL',
          nodes: [
            { id: 'a1', name: 'Sardar Patel Road Trunk', x: 130, y: 140, z: 20, status: 'NORMAL', depthCm: 28, hgl: 5.4, invertM: 2.2, groundM: 4.8 },
            { id: 'a2', name: 'L.B. Road (Lattice Bridge)', x: 280, y: 310, z: 35, status: 'SURCHARGE', depthCm: 52, hgl: 4.1, invertM: 1.6, groundM: 3.5 },
            { id: 'a3', name: 'CLRI Junction Siphon', x: 430, y: 120, z: 22, status: 'NORMAL', depthCm: 32, hgl: 4.8, invertM: 2.0, groundM: 4.2 },
            { id: 'a4', name: 'Adyar River Estuary Sluice', x: 580, y: 300, z: 40, status: 'SURCHARGE', depthCm: 68, hgl: 3.0, invertM: 0.9, groundM: 2.8 },
            { id: 'a5', name: 'Thiruvanmiyur Outfall', x: 710, y: 170, z: 12, status: 'NORMAL', depthCm: 24, hgl: 2.4, invertM: 0.5, groundM: 2.1 },
          ],
          conduits: [
            { from: 'a1', to: 'a3', color: '#06b6d4', weight: 4 },
            { from: 'a1', to: 'a2', color: '#f59e0b', weight: 5 },
            { from: 'a2', to: 'a4', color: '#ef4444', weight: 6 },
            { from: 'a3', to: 'a4', color: '#06b6d4', weight: 5 },
            { from: 'a4', to: 'a5', color: '#3b82f6', weight: 6 },
          ]
        };

      case 3: // Tambaram
        return {
          outfallName: '🌊 ADYAR RIVER HEADWATERS BASIN',
          nodes: [
            { id: 'tb1', name: 'GST National Highway', x: 130, y: 140, z: 15, status: 'NORMAL', depthCm: 22, hgl: 15.8, invertM: 12.0, groundM: 15.2 },
            { id: 'tb2', name: 'Chitlapakkam Main Canal', x: 280, y: 310, z: 42, status: 'SURCHARGE', depthCm: 72, hgl: 12.6, invertM: 9.2, groundM: 11.8 },
            { id: 'tb3', name: 'East Tambaram Station', x: 430, y: 120, z: 20, status: 'NORMAL', depthCm: 28, hgl: 14.9, invertM: 11.5, groundM: 14.5 },
            { id: 'tb4', name: 'Selaiyur Lake Inflow', x: 580, y: 300, z: 32, status: 'SURCHARGE', depthCm: 58, hgl: 13.1, invertM: 10.1, groundM: 12.4 },
            { id: 'tb5', name: 'Mudichur Outfall Drain', x: 710, y: 170, z: 48, status: 'CRITICAL', depthCm: 88, hgl: 10.8, invertM: 7.8, groundM: 9.8 },
          ],
          conduits: [
            { from: 'tb1', to: 'tb3', color: '#06b6d4', weight: 4 },
            { from: 'tb1', to: 'tb2', color: '#f59e0b', weight: 5 },
            { from: 'tb2', to: 'tb4', color: '#ef4444', weight: 6 },
            { from: 'tb3', to: 'tb4', color: '#06b6d4', weight: 4 },
            { from: 'tb4', to: 'tb5', color: '#ef4444', weight: 6 },
          ]
        };

      case 4: // T. Nagar
        return {
          outfallName: '🌊 MAMBALAM CANAL & COOUM RIVER TRUNK',
          nodes: [
            { id: 'tn1', name: 'Usman Road Flyover', x: 130, y: 140, z: 38, status: 'SURCHARGE', depthCm: 65, hgl: 6.2, invertM: 3.5, groundM: 5.8 },
            { id: 'tn2', name: 'Pondy Bazaar Central', x: 280, y: 310, z: 48, status: 'CRITICAL', depthCm: 94, hgl: 5.4, invertM: 2.8, groundM: 4.9 },
            { id: 'tn3', name: 'Panagal Park Basin', x: 430, y: 120, z: 42, status: 'CRITICAL', depthCm: 82, hgl: 5.8, invertM: 3.1, groundM: 5.2 },
            { id: 'tn4', name: 'Mambalam Canal Siphon', x: 580, y: 300, z: 50, status: 'CRITICAL', depthCm: 98, hgl: 4.8, invertM: 2.1, groundM: 4.2 },
            { id: 'tn5', name: 'GN Chetty Canal Sluice', x: 710, y: 170, z: 35, status: 'SURCHARGE', depthCm: 74, hgl: 4.3, invertM: 1.8, groundM: 3.8 },
          ],
          conduits: [
            { from: 'tn1', to: 'tn2', color: '#ef4444', weight: 6 },
            { from: 'tn2', to: 'tn4', color: '#ef4444', weight: 7 },
            { from: 'tn3', to: 'tn2', color: '#ef4444', weight: 5 },
            { from: 'tn4', to: 'tn5', color: '#3b82f6', weight: 6 },
          ]
        };

      case 5: // Perungudi
        return {
          outfallName: '🌊 KOVALAM BASIN & MARSHLAND CATCHMENT',
          nodes: [
            { id: 'p1', name: 'OMR IT Corridor', x: 130, y: 140, z: 25, status: 'NORMAL', depthCm: 32, hgl: 3.8, invertM: 1.2, groundM: 3.2 },
            { id: 'p2', name: 'Seevaram Station Drain', x: 280, y: 310, z: 38, status: 'SURCHARGE', depthCm: 62, hgl: 3.1, invertM: 0.9, groundM: 2.7 },
            { id: 'p3', name: 'Kallukuttai Wetland Basin', x: 430, y: 120, z: 45, status: 'CRITICAL', depthCm: 86, hgl: 2.5, invertM: 0.4, groundM: 2.1 },
            { id: 'p4', name: 'Perungudi Lake Outfall', x: 580, y: 300, z: 40, status: 'SURCHARGE', depthCm: 75, hgl: 2.7, invertM: 0.6, groundM: 2.3 },
            { id: 'p5', name: 'SRP Tools Node', x: 710, y: 170, z: 22, status: 'NORMAL', depthCm: 36, hgl: 3.5, invertM: 1.1, groundM: 2.9 },
          ],
          conduits: [
            { from: 'p1', to: 'p2', color: '#f59e0b', weight: 5 },
            { from: 'p2', to: 'p3', color: '#ef4444', weight: 6 },
            { from: 'p3', to: 'p4', color: '#ef4444', weight: 6 },
            { from: 'p4', to: 'p5', color: '#3b82f6', weight: 5 },
          ]
        };

      case 6: // Kodambakkam
        return {
          outfallName: '🌊 TRUSTPURAM CANAL & COOUM RIVER',
          nodes: [
            { id: 'k1', name: 'Arcot Road Conduit', x: 130, y: 140, z: 22, status: 'NORMAL', depthCm: 26, hgl: 5.9, invertM: 3.2, groundM: 5.4 },
            { id: 'k2', name: 'Vadapalani Metro Siphon', x: 280, y: 310, z: 32, status: 'SURCHARGE', depthCm: 48, hgl: 5.2, invertM: 2.8, groundM: 4.9 },
            { id: 'k3', name: 'Trustpuram Canal Basin', x: 430, y: 120, z: 42, status: 'SURCHARGE', depthCm: 70, hgl: 4.5, invertM: 2.0, groundM: 4.2 },
            { id: 'k4', name: 'Liberty Junction Node', x: 580, y: 300, z: 28, status: 'NORMAL', depthCm: 35, hgl: 5.1, invertM: 2.6, groundM: 4.8 },
            { id: 'k5', name: 'Mount Road Outfall', x: 710, y: 170, z: 20, status: 'NORMAL', depthCm: 22, hgl: 4.1, invertM: 1.8, groundM: 3.7 },
          ],
          conduits: [
            { from: 'k1', to: 'k2', color: '#06b6d4', weight: 4 },
            { from: 'k2', to: 'k3', color: '#f59e0b', weight: 6 },
            { from: 'k3', to: 'k4', color: '#06b6d4', weight: 5 },
            { from: 'k4', to: 'k5', color: '#3b82f6', weight: 5 },
          ]
        };

      case 7: // Mylapore
        return {
          outfallName: '🌊 BUCKINGHAM CANAL & BAY OF BENGAL OUTFALL',
          nodes: [
            { id: 'm1', name: 'Luz Corner Junction', x: 130, y: 140, z: 24, status: 'NORMAL', depthCm: 30, hgl: 5.2, invertM: 2.6, groundM: 4.6 },
            { id: 'm2', name: 'Kutchery Road Trunk', x: 280, y: 310, z: 36, status: 'SURCHARGE', depthCm: 54, hgl: 4.3, invertM: 1.9, groundM: 3.8 },
            { id: 'm3', name: 'Buckingham Canal Sluice', x: 430, y: 120, z: 46, status: 'CRITICAL', depthCm: 82, hgl: 3.4, invertM: 1.1, groundM: 2.9 },
            { id: 'm4', name: 'Kapaleeshwarar Basin', x: 580, y: 300, z: 28, status: 'NORMAL', depthCm: 36, hgl: 4.6, invertM: 2.1, groundM: 4.1 },
            { id: 'm5', name: 'Foreshore Estate Outfall', x: 710, y: 170, z: 12, status: 'NORMAL', depthCm: 20, hgl: 2.1, invertM: 0.4, groundM: 1.8 },
          ],
          conduits: [
            { from: 'm1', to: 'm2', color: '#06b6d4', weight: 4 },
            { from: 'm2', to: 'm3', color: '#ef4444', weight: 6 },
            { from: 'm3', to: 'm4', color: '#06b6d4', weight: 5 },
            { from: 'm3', to: 'm5', color: '#3b82f6', weight: 6 },
          ]
        };

      case 8: // Sholinganallur
        return {
          outfallName: '🌊 OKKIYAM MADAVU ESTUARY & BAY OF BENGAL',
          nodes: [
            { id: 'sh1', name: 'ECR Sea Link Junction', x: 130, y: 140, z: 18, status: 'NORMAL', depthCm: 20, hgl: 4.1, invertM: 1.8, groundM: 3.5 },
            { id: 'sh2', name: 'OMR Toll Plaza Conduit', x: 280, y: 310, z: 30, status: 'NORMAL', depthCm: 38, hgl: 3.6, invertM: 1.4, groundM: 3.1 },
            { id: 'sh3', name: 'Okkiyam Madavu Estuary', x: 430, y: 120, z: 45, status: 'SURCHARGE', depthCm: 68, hgl: 2.8, invertM: 0.6, groundM: 2.2 },
            { id: 'sh4', name: 'ELCOT IT Park Node', x: 580, y: 300, z: 22, status: 'NORMAL', depthCm: 25, hgl: 3.9, invertM: 1.6, groundM: 3.3 },
            { id: 'sh5', name: 'Maritime Expressway Sluice', x: 710, y: 170, z: 10, status: 'NORMAL', depthCm: 16, hgl: 1.9, invertM: 0.3, groundM: 1.6 },
          ],
          conduits: [
            { from: 'sh1', to: 'sh2', color: '#06b6d4', weight: 4 },
            { from: 'sh2', to: 'sh3', color: '#f59e0b', weight: 5 },
            { from: 'sh3', to: 'sh4', color: '#06b6d4', weight: 4 },
            { from: 'sh3', to: 'sh5', color: '#3b82f6', weight: 6 },
          ]
        };

      case 9: // Guindy
        return {
          outfallName: '🌊 KATHIPARA RETENTION BASIN & ADYAR RIVER',
          nodes: [
            { id: 'g1', name: 'Kathipara Cloverleaf Basin', x: 130, y: 140, z: 25, status: 'NORMAL', depthCm: 32, hgl: 7.4, invertM: 4.2, groundM: 6.8 },
            { id: 'g2', name: 'Race Course Retention Pond', x: 280, y: 310, z: 36, status: 'SURCHARGE', depthCm: 50, hgl: 6.8, invertM: 3.9, groundM: 6.2 },
            { id: 'g3', name: 'Guindy Industrial Drain', x: 430, y: 120, z: 22, status: 'NORMAL', depthCm: 24, hgl: 7.8, invertM: 4.8, groundM: 7.1 },
            { id: 'g4', name: 'Ekkattuthangal Conduit', x: 580, y: 300, z: 42, status: 'SURCHARGE', depthCm: 64, hgl: 5.9, invertM: 3.1, groundM: 5.2 },
            { id: 'g5', name: 'Adyar River Outfall Gate', x: 710, y: 170, z: 15, status: 'NORMAL', depthCm: 18, hgl: 4.8, invertM: 2.2, groundM: 4.1 },
          ],
          conduits: [
            { from: 'g1', to: 'g2', color: '#06b6d4', weight: 4 },
            { from: 'g2', to: 'g4', color: '#f59e0b', weight: 5 },
            { from: 'g3', to: 'g4', color: '#06b6d4', weight: 4 },
            { from: 'g4', to: 'g5', color: '#3b82f6', weight: 6 },
          ]
        };

      case 10: // Madipakkam
        return {
          outfallName: '🌊 MADIPAKKAM LAKE SURPLUS CHANNEL',
          nodes: [
            { id: 'mp1', name: 'Keelkattalai Canal Inflow', x: 130, y: 140, z: 35, status: 'SURCHARGE', depthCm: 56, hgl: 3.4, invertM: 1.1, groundM: 2.8 },
            { id: 'mp2', name: 'Madipakkam Lake Outlet', x: 280, y: 310, z: 45, status: 'CRITICAL', depthCm: 84, hgl: 2.9, invertM: 0.7, groundM: 2.4 },
            { id: 'mp3', name: 'Sabari Nagar Basin', x: 430, y: 120, z: 40, status: 'SURCHARGE', depthCm: 68, hgl: 3.1, invertM: 0.9, groundM: 2.6 },
            { id: 'mp4', name: 'Moovarasampettai Drain', x: 580, y: 300, z: 28, status: 'NORMAL', depthCm: 36, hgl: 3.6, invertM: 1.3, groundM: 3.1 },
            { id: 'mp5', name: 'Velachery Link Siphon', x: 710, y: 170, z: 42, status: 'CRITICAL', depthCm: 78, hgl: 2.6, invertM: 0.5, groundM: 2.2 },
          ],
          conduits: [
            { from: 'mp1', to: 'mp2', color: '#f59e0b', weight: 5 },
            { from: 'mp2', to: 'mp3', color: '#ef4444', weight: 6 },
            { from: 'mp3', to: 'mp4', color: '#06b6d4', weight: 4 },
            { from: 'mp2', to: 'mp5', color: '#ef4444', weight: 6 },
          ]
        };

      case 11: // Pallikaranai
        return {
          outfallName: '🌊 PALLIKARANAI CENTRAL WETLAND SANCTUARY',
          nodes: [
            { id: 'pk1', name: '200ft Radial Road Siphon', x: 130, y: 140, z: 48, status: 'CRITICAL', depthCm: 96, hgl: 2.5, invertM: 0.3, groundM: 2.1 },
            { id: 'pk2', name: 'Central Wetland Basin', x: 280, y: 310, z: 52, status: 'CRITICAL', depthCm: 110, hgl: 2.1, invertM: 0.1, groundM: 1.8 },
            { id: 'pk3', name: 'Medavakkam High Road', x: 430, y: 120, z: 42, status: 'CRITICAL', depthCm: 88, hgl: 2.8, invertM: 0.6, groundM: 2.4 },
            { id: 'pk4', name: 'Perumbakkam Outfall Canal', x: 580, y: 300, z: 46, status: 'CRITICAL', depthCm: 90, hgl: 2.3, invertM: 0.4, groundM: 2.0 },
            { id: 'pk5', name: 'Okkiyam Sluice Gates', x: 710, y: 170, z: 38, status: 'SURCHARGE', depthCm: 76, hgl: 2.0, invertM: 0.2, groundM: 1.7 },
          ],
          conduits: [
            { from: 'pk1', to: 'pk2', color: '#ef4444', weight: 7 },
            { from: 'pk2', to: 'pk4', color: '#ef4444', weight: 7 },
            { from: 'pk3', to: 'pk2', color: '#ef4444', weight: 6 },
            { from: 'pk4', to: 'pk5', color: '#3b82f6', weight: 6 },
          ]
        };

      case 12: // Anna Nagar
        return {
          outfallName: '🌊 OTTERI NULLAH & COOUM RIVER CANAL',
          nodes: [
            { id: 'an1', name: 'Roundtana Central Node', x: 130, y: 140, z: 18, status: 'NORMAL', depthCm: 20, hgl: 9.2, invertM: 6.4, groundM: 8.6 },
            { id: 'an2', name: '100ft Inner Ring Conduit', x: 280, y: 310, z: 28, status: 'NORMAL', depthCm: 32, hgl: 8.6, invertM: 5.8, groundM: 8.1 },
            { id: 'an3', name: 'Tower Park Retention Pond', x: 430, y: 120, z: 22, status: 'NORMAL', depthCm: 25, hgl: 9.0, invertM: 6.1, groundM: 8.4 },
            { id: 'an4', name: 'Otteri Nullah Canal Sluice', x: 580, y: 300, z: 35, status: 'SURCHARGE', depthCm: 48, hgl: 7.8, invertM: 4.9, groundM: 7.2 },
            { id: 'an5', name: 'Koyambedu Outfall Trunk', x: 710, y: 170, z: 15, status: 'NORMAL', depthCm: 18, hgl: 7.1, invertM: 4.2, groundM: 6.5 },
          ],
          conduits: [
            { from: 'an1', to: 'an2', color: '#06b6d4', weight: 4 },
            { from: 'an2', to: 'an4', color: '#f59e0b', weight: 5 },
            { from: 'an3', to: 'an2', color: '#06b6d4', weight: 4 },
            { from: 'an4', to: 'an5', color: '#3b82f6', weight: 5 },
          ]
        };

      case 13: // Kolathur
        return {
          outfallName: '🌊 RETTERI LAKE OVERFLOW & OTTERI NULLAH',
          nodes: [
            { id: 'kl1', name: 'Retteri Lake Sluice Gate', x: 130, y: 140, z: 42, status: 'CRITICAL', depthCm: 82, hgl: 5.4, invertM: 2.8, groundM: 4.8 },
            { id: 'kl2', name: 'Red Hills Road Conduit', x: 280, y: 310, z: 36, status: 'SURCHARGE', depthCm: 64, hgl: 5.8, invertM: 3.2, groundM: 5.2 },
            { id: 'kl3', name: 'Paper Mills Road Basin', x: 430, y: 120, z: 40, status: 'SURCHARGE', depthCm: 70, hgl: 5.1, invertM: 2.5, groundM: 4.5 },
            { id: 'kl4', name: 'Villivakkam Canal Node', x: 580, y: 300, z: 38, status: 'SURCHARGE', depthCm: 66, hgl: 4.8, invertM: 2.2, groundM: 4.2 },
            { id: 'kl5', name: '200ft Ring Road Trunk', x: 710, y: 170, z: 20, status: 'NORMAL', depthCm: 28, hgl: 5.9, invertM: 3.4, groundM: 5.3 },
          ],
          conduits: [
            { from: 'kl1', to: 'kl2', color: '#ef4444', weight: 6 },
            { from: 'kl2', to: 'kl4', color: '#f59e0b', weight: 5 },
            { from: 'kl3', to: 'kl4', color: '#f59e0b', weight: 5 },
            { from: 'kl4', to: 'kl5', color: '#3b82f6', weight: 5 },
          ]
        };

      case 14: // Ambattur
        return {
          outfallName: '🌊 KORATTUR LAKE SURPLUS & COOUM RIVER',
          nodes: [
            { id: 'am1', name: 'Ambattur Industrial Estate Lake', x: 130, y: 140, z: 20, status: 'NORMAL', depthCm: 26, hgl: 13.2, invertM: 9.8, groundM: 12.5 },
            { id: 'am2', name: 'Ambattur OT Main Junction', x: 280, y: 310, z: 28, status: 'NORMAL', depthCm: 34, hgl: 12.8, invertM: 9.4, groundM: 12.1 },
            { id: 'am3', name: 'Korattur Lake Overflow Basin', x: 430, y: 120, z: 42, status: 'SURCHARGE', depthCm: 68, hgl: 11.5, invertM: 8.2, groundM: 10.8 },
            { id: 'am4', name: 'CTH Road Conduit', x: 580, y: 300, z: 25, status: 'NORMAL', depthCm: 30, hgl: 12.4, invertM: 9.1, groundM: 11.8 },
            { id: 'am5', name: 'Ayapakkam Storm Siphon', x: 710, y: 170, z: 18, status: 'NORMAL', depthCm: 22, hgl: 11.8, invertM: 8.5, groundM: 11.2 },
          ],
          conduits: [
            { from: 'am1', to: 'am2', color: '#06b6d4', weight: 4 },
            { from: 'am2', to: 'am3', color: '#f59e0b', weight: 5 },
            { from: 'am3', to: 'am4', color: '#06b6d4', weight: 4 },
            { from: 'am4', to: 'am5', color: '#3b82f6', weight: 5 },
          ]
        };

      default:
        return {
          outfallName: `🌊 ${areaName.toUpperCase()} LOCAL DRAINAGE OUTFALL`,
          nodes: [
            { id: 'd1', name: `${areaName} Main Junction`, x: 150, y: 150, z: 30, status: 'NORMAL', depthCm: 30, hgl: avgElev + 1.2, invertM: avgElev - 1.2, groundM: avgElev },
            { id: 'd2', name: `${areaName} Primary Canal`, x: 380, y: 300, z: 40, status: 'SURCHARGE', depthCm: 55, hgl: avgElev + 0.8, invertM: avgElev - 1.5, groundM: avgElev - 0.5 },
            { id: 'd3', name: `${areaName} Outfall Sluice`, x: 650, y: 170, z: 25, status: 'NORMAL', depthCm: 25, hgl: avgElev + 0.4, invertM: avgElev - 1.8, groundM: avgElev - 1.0 },
          ],
          conduits: [
            { from: 'd1', to: 'd2', color: '#06b6d4', weight: 5 },
            { from: 'd2', to: 'd3', color: '#3b82f6', weight: 6 },
          ]
        };
    }
  };

  const { nodes: areaNodes, conduits, outfallName } = getSubsurfaceNetworkForArea();
  const selectedNodeObj = areaNodes.find(n => n.id === selectedNode) || areaNodes[0];

  return (
    <div 
      className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-[#020617] select-none flex flex-col cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 1. UNIFIED TOP HEADER BAR (Embeds Basemap Switcher + Area Title + Camera Controls with ZERO Overlaps) */}
      <div className="absolute top-3 left-3 right-3 z-50 flex flex-wrap items-center justify-between gap-3 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 p-2 rounded-2xl shadow-2xl">
        
        {/* Left: Mode Switcher (Satellite HD / Dark / Streets / Water Map) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectBaseMapType?.('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
              baseMapType === 'satellite'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite HD</span>
          </button>

          <button
            onClick={() => onSelectBaseMapType?.('dark')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
              baseMapType === 'dark'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark Mode</span>
          </button>

          <button
            onClick={() => onSelectBaseMapType?.('streets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${
              baseMapType === 'streets'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Street View</span>
          </button>

          <button
            onClick={() => onSelectBaseMapType?.('water')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-black text-xs bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-lg shadow-cyan-500/40 ring-1 ring-cyan-300"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-100 animate-pulse" />
            <span>🌊 Water Map</span>
          </button>
        </div>

        {/* Center: Selected Area Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-700/60 rounded-xl text-cyan-300 font-extrabold text-xs">
          <span>📍</span>
          <span>{areaName}</span>
          <span className="text-slate-400 font-mono text-[10px]">(Zone {zoneNum} • Ward {wardNum})</span>
        </div>

        {/* Right: Camera Orbit & Pitch Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-bold">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{yaw}° YAW</span>
            <span className="text-slate-700">|</span>
            <span>{pitch}° PITCH</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setIsAutoOrbit(!isAutoOrbit); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold transition text-xs ${
              isAutoOrbit
                ? 'bg-cyan-500 text-slate-950 shadow-md ring-1 ring-cyan-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{isAutoOrbit ? '⏸️ Orbiting' : '▷ 360° Auto'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setYaw(32); setPitch(42); setZoom(1.0); }}
              title="Reset View"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.15, 1.6)); }}
              title="Zoom In"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-300 transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.15, 0.6)); }}
              title="Zoom Out"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-300 transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3D ISOMETRIC CANVAS (Spacious 880px Stage) */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden pt-12 pb-12">
        <div 
          className="relative w-[860px] h-[480px] transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${zoom}) rotateX(${pitch}deg) rotateZ(${yaw - 32}deg)`,
            transformStyle: 'preserve-3d',
            perspective: '1200px',
          }}
        >
          {/* Base Grid Floor */}
          <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-3xl bg-slate-950/90 shadow-[0_0_100px_rgba(6,182,212,0.2)] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:45px_45px]">
            <div className="absolute top-4 left-6 text-[11px] font-mono text-cyan-400/90 font-extrabold uppercase tracking-widest bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800">
              ZONE {zoneNum} • WARD {wardNum} • {areaName.toUpperCase()}
            </div>
            <div className="absolute bottom-6 left-8 text-[10px] font-mono text-slate-500 uppercase font-bold">
              ELEVATION: {avgElev}m MSL
            </div>
          </div>

          {/* Dynamic River / Ocean Outfall Wall Interface (Right Edge Pane) */}
          <div className="absolute right-0 top-0 bottom-0 w-44 bg-gradient-to-l from-cyan-500/40 via-blue-600/30 to-transparent border-r-4 border-cyan-400/90 rounded-r-3xl flex items-center justify-center shadow-[0_0_40px_#06b6d4]">
            <div className="transform -rotate-90 text-[11px] font-mono font-black text-cyan-200 uppercase tracking-widest drop-shadow-[0_0_12px_#06b6d4] text-center px-2">
              {outfallName}
            </div>
          </div>

          {/* SVG Pipe Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {conduits.map((c, i) => {
              const source = areaNodes.find(n => n.id === c.from);
              const target = areaNodes.find(n => n.id === c.to);
              if (!source || !target) return null;

              return (
                <g key={i}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#020617"
                    strokeWidth={c.weight + 4}
                    strokeLinecap="round"
                  />
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={c.color}
                    strokeWidth={c.weight}
                    strokeLinecap="round"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                </g>
              );
            })}
          </svg>

          {/* 3D Nodes (Spacious Zigzag Placement with ZERO Badge Collisions) */}
          {areaNodes.map((node) => {
            const isSelected = selectedNodeObj.id === node.id;
            const isCritical = node.status === 'CRITICAL';
            const isSurcharge = node.status === 'SURCHARGE';
            
            return (
              <div
                key={node.id}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
              >
                <div className="relative flex flex-col items-center">
                  {/* Target Node Marker Circle */}
                  <div className="relative flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-slate-950/90 shadow-2xl transition-all group-hover:scale-125 ${
                      isCritical
                        ? 'border-red-500 text-red-400 shadow-red-500/80 bg-red-950/50'
                        : isSurcharge
                        ? 'border-amber-400 text-amber-300 shadow-amber-500/60 bg-amber-950/50'
                        : 'border-cyan-400 text-cyan-300 shadow-cyan-500/60 bg-cyan-950/50'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        isCritical ? 'bg-red-500 animate-ping' : isSurcharge ? 'bg-amber-400' : 'bg-cyan-400'
                      }`} />
                    </div>

                    <div className={`absolute -inset-2.5 rounded-full border border-dashed animate-spin-slow pointer-events-none ${
                      isCritical ? 'border-red-500/70' : isSurcharge ? 'border-amber-400/60' : 'border-cyan-400/50'
                    }`} />
                  </div>

                  {/* Clean Non-Overlapping Badge */}
                  <div className={`mt-1.5 px-3 py-1 rounded-xl border text-[11px] font-extrabold font-['Outfit'] shadow-2xl flex items-center gap-1.5 backdrop-blur-md transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-white ring-2 ring-cyan-300 scale-105'
                      : isCritical
                      ? 'bg-slate-900/95 text-red-300 border-red-500/70'
                      : isSurcharge
                      ? 'bg-slate-900/95 text-amber-300 border-amber-500/70'
                      : 'bg-slate-900/95 text-white border-slate-700 hover:border-cyan-400'
                  }`}>
                    <span>🏢</span>
                    <span>{node.name}</span>
                    <span className="text-[10px] font-mono opacity-90">({node.depthCm}cm)</span>
                  </div>

                  {/* Vertical Hydraulic Height Bar */}
                  <div 
                    className={`w-1 rounded-t transition-all ${
                      isCritical ? 'bg-gradient-to-t from-red-600 to-amber-300' : 
                      isSurcharge ? 'bg-gradient-to-t from-amber-600 to-yellow-200' : 
                      'bg-gradient-to-t from-cyan-600 to-teal-200'
                    }`}
                    style={{ height: `${node.z}px` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CLEAN BOTTOM BAR & EXPANDABLE HGL DRAWER */}
      <div className="absolute bottom-3 left-3 right-3 z-50 flex flex-col gap-2 pointer-events-auto">
        
        {/* Bottom Status & Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2 rounded-2xl text-xs">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Left Drag: <b>360° Orbit</b> • Right Drag: <b>Pan</b> • Wheel: <b>Zoom</b></span>
          </div>

          {/* Depth Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
            <span className="text-slate-400 uppercase">Legend:</span>
            <span className="text-emerald-400 flex items-center gap-1">🟢 &lt;15cm (Passable)</span>
            <span className="text-amber-400 flex items-center gap-1">🟡 15–28cm (Slow)</span>
            <span className="text-orange-400 flex items-center gap-1">🟠 28–50cm (Hazard)</span>
            <span className="text-red-400 flex items-center gap-1">🔴 &gt;50cm (Impassable)</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setShowHglProfile(!showHglProfile); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs shadow-md hover:brightness-110 transition border border-cyan-400/40"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-200" />
            <span>⚡ Subsurface HGL Profile ({areaName})</span>
            {showHglProfile ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Subsurface HGL Profile Drawer */}
        {showHglProfile && (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 p-3.5 rounded-2xl shadow-2xl space-y-2.5 max-h-48 overflow-y-auto animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-extrabold font-['Outfit'] uppercase">
                  Hydraulic Grade Line (HGL) Surcharge Profile
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {areaName} Trunk Conduit
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-amber-400">DEM Ground: {avgElev}m MSL</span>
                <span className="text-cyan-400">Live HGL Profile</span>
                <span className="text-slate-400">Pipe Invert Level</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center text-xs">
              {areaNodes.map((node) => {
                const isSelected = selectedNodeObj.id === node.id;
                return (
                  <div 
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-2 rounded-xl border cursor-pointer transition ${
                      isSelected 
                        ? 'bg-cyan-950/90 border-cyan-400 text-white shadow-md ring-1 ring-cyan-300' 
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-extrabold text-[11px] truncate text-cyan-300" title={node.name}>
                      {node.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      HGL: <b className="text-white">{node.hgl}m MSL</b>
                    </div>
                    <div className="mt-0.5 text-[10px] font-mono font-bold text-amber-400">
                      Water Depth: {node.depthCm} cm
                    </div>
                    <div className={`mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      node.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                      node.status === 'SURCHARGE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {node.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
