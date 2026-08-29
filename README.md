# DRAIN-X | Smart City Chennai Urban Flood Nowcasting & Early Warning Platform 🌊

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)

**DRAIN-X** is an end-to-end high-resolution urban flood nowcasting, early warning, and 3D subsurface hydrological digital twin platform engineered for Greater Chennai Corporation (GCC) and Tamil Nadu State Disaster Management Authority (TNSDMA).

---

## 🌟 Key Features

1. **0–3 Hour AI/ML Flood Nowcasting Engine**
   - Rational catchment hydrology model ($Q = 0.278 \times C \times I \times A$).
   - Temporal depth prediction curves across +30m, +1h, +2h, and +3h lead times.

2. **🌊 3D Water Map & Subsurface HGL Digital Twin**
   - Interactive 360° orbit visualization (`YAW`, `PITCH`, `360° Auto`).
   - Dynamically tuned for **all 14 Chennai Metropolitan Zones & Wards** (Velachery, Adyar, Tambaram, T. Nagar, Perungudi, Kodambakkam, Mylapore, Sholinganallur, Guindy, Madipakkam, Pallikaranai, Anna Nagar, Kolathur, Ambattur).
   - Live Hydraulic Grade Line (HGL) cross-section, pipe invert elevations, and river/sea outfall interfaces.

3. **📡 Smart Urban Stormwater Manhole Sensing Architecture**
   - Photorealistic engineering cutaway diagram & hardware callouts.
   - Non-contact ultrasonic water depth transducers (`WATER DEPTH: 82 cm`).
   - In-pipe Doppler discharge flow velocity meters (`FLOW RATE: 46 L/s`).
   - Condition monitoring for drainage restriction & debris blockage ($\text{Level} \uparrow, \text{Flow} \downarrow$).
   - Wall-mounted IP68 Edge Controller (`Node M26`).
   - Subsurface to street-level **LoRaWAN Gateway communication pipeline**.

4. **🚨 Automated Emergency Dispatch & Safe Route Navigation**
   - Automated TNSDMA alerts and NDRF rescue battalion team dispatch.
   - Micro-topography safe route navigation avoiding flooded road segments.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (`drainx_master.db`), Uvicorn, Pydantic, NumPy, Scikit-Learn
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Leaflet GIS, Recharts, Lucide Icons

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ / npm 9+

### 1. Backend Server Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- **Root Health API**: `http://127.0.0.1:8000/`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
- **Web Application URL**: `http://localhost:5173/`

---

## 📁 Repository Structure

```
Urban-Flooding-/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI main entrypoint & startup seeder
│   │   ├── config.py          # Application configuration
│   │   ├── routers/           # REST API endpoints (GIS, Areas, Sensors, Prediction, Alerts)
│   │   ├── services/          # Data seeder, live weather & hydrological engines
│   │   └── models/            # SQLAlchemy database schema
│   ├── requirements.txt
│   └── drainx_master.db       # Master SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/        # React UI components (GisFloodMap, Water3DSubsurfaceView, SensorsView)
│   │   ├── services/          # API client & HTTP fetch handlers
│   │   └── types/             # TypeScript data interfaces
│   ├── public/                # Static assets & Smart Manhole Cutaway Diagram
│   └── package.json
├── README.md
└── .gitignore
```

---

## 📄 License
Developed for Smart India Hackathon & Smart City Chennai Urban Flood Resilience.
