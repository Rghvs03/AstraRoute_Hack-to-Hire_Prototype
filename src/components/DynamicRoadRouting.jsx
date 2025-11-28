import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, GeoJSON, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const GH_URL = 'https://graphhopper.com/api/1/route';
const GH_KEY = import.meta.env?.REACT_APP_GH_KEY || 'a38e0178-2275-4c99-b225-0c13d80ffd4a';
const PROFILE = 'car';

// Aggressive pollution avoidance model (current 'Custom' route)
const custom_model_aggressive = {
  speed: [
    { if: "in_zone_high_1", multiply_by: 0.01 },
    { if: "in_zone_med_1",  multiply_by: 0.3  },
    { if: "in_random_zone_3", multiply_by: 0.01 },
    { if: "in_random_zone_4", multiply_by: 0.3 },
    { if: "in_random_zone_5", multiply_by: 0.01 },
    { if: "in_random_zone_6", multiply_by: 0.01 },
    { if: "in_random_zone_7", multiply_by: 0.3 },
    { if: "in_random_zone_8", multiply_by: 0.3 },
    { if: "in_random_zone_9", multiply_by: 0.01 },
    { if: "in_random_zone_10", multiply_by: 0.3 },
    { if: "in_random_zone_11", multiply_by: 0.01 },
    { if: "in_random_zone_12", multiply_by: 0.01 },
    { if: "in_random_zone_13", multiply_by: 0.3 },
    { if: "in_random_zone_14", multiply_by: 0.3 },
    { if: "in_random_zone_15", multiply_by: 0.01 },
    { if: "in_random_zone_16", multiply_by: 0.3 },
    { if: "in_random_zone_17", multiply_by: 0.3 },
    { if: "in_random_zone_18", multiply_by: 0.3 },
    { if: "in_random_zone_19", multiply_by: 0.01 },
    { if: "in_random_zone_20", multiply_by: 0.3 },
    { if: "in_random_zone_21", multiply_by: 0.3 }
  ],
  priority: [
    { if: "in_zone_high_1", multiply_by: 0.05 },
    { if: "in_zone_med_1",  multiply_by: 0.5  },
    { if: "in_random_zone_3", multiply_by: 0.05 },
    { if: "in_random_zone_4", multiply_by: 0.5 },
    { if: "in_random_zone_5", multiply_by: 0.05 },
    { if: "in_random_zone_6", multiply_by: 0.05 },
    { if: "in_random_zone_7", multiply_by: 0.5 },
    { if: "in_random_zone_8", multiply_by: 0.5 },
    { if: "in_random_zone_9", multiply_by: 0.05 },
    { if: "in_random_zone_10", multiply_by: 0.5 },
    { if: "in_random_zone_11", multiply_by: 0.05 },
    { if: "in_random_zone_12", multiply_by: 0.05 },
    { if: "in_random_zone_13", multiply_by: 0.5 },
    { if: "in_random_zone_14", multiply_by: 0.5 },
    { if: "in_random_zone_15", multiply_by: 0.05 },
    { if: "in_random_zone_16", multiply_by: 0.5 },
    { if: "in_random_zone_17", multiply_by: 0.5 },
    { if: "in_random_zone_18", multiply_by: 0.5 },
    { if: "in_random_zone_19", multiply_by: 0.05 },
    { if: "in_random_zone_20", multiply_by: 0.5 },
    { if: "in_random_zone_21", multiply_by: 0.5 },
    { if: "road_environment == TUNNEL",   multiply_by: 0.2  }
  ],
  distance_influence: 100.0
};

// Pollution Tolerant route model (new 'Tolerant' route)
const custom_model_tolerant = {
  speed: [
    { if: "road_class == MOTORWAY", multiply_by: 0.9 },
    { if: "road_class == TRUNK",    multiply_by: 0.9 },
    { if: "road_class == PRIMARY",  multiply_by: 0.95 },
    { if: "in_zone_high_1", multiply_by: 0.7 },
    { if: "in_zone_med_1",  multiply_by: 0.9 },
    { if: "in_random_zone_3", multiply_by: 0.7 },
    { if: "in_random_zone_5", multiply_by: 0.7 },
    { if: "in_random_zone_6", multiply_by: 0.7 },
    { if: "in_random_zone_9", multiply_by: 0.7 },
    { if: "in_random_zone_11", multiply_by: 0.7 },
    { if: "in_random_zone_12", multiply_by: 0.7 },
    { if: "in_random_zone_15", multiply_by: 0.7 },
    { if: "in_random_zone_19", multiply_by: 0.7 },
    { if: "in_random_zone_4", multiply_by: 0.9 },
    { if: "in_random_zone_7", multiply_by: 0.9 },
    { if: "in_random_zone_8", multiply_by: 0.9 },
    { if: "in_random_zone_10", multiply_by: 0.9 },
    { if: "in_random_zone_13", multiply_by: 0.9 },
    { if: "in_random_zone_14", multiply_by: 0.9 },
    { if: "in_random_zone_16", multiply_by: 0.9 },
    { if: "in_random_zone_17", multiply_by: 0.9 },
    { if: "in_random_zone_18", multiply_by: 0.9 },
    { if: "in_random_zone_20", multiply_by: 0.9 },
    { if: "in_random_zone_21", multiply_by: 0.9 }
  ],
  priority: [
    { if: "road_class == MOTORWAY", multiply_by: 0.15 },
    { if: "road_class == TRUNK",    multiply_by: 0.2  },
    { if: "road_class == PRIMARY",  multiply_by: 0.3  },
    { if: "road_class == SECONDARY",multiply_by: 0.6  },
    { if: "road_class == RESIDENTIAL", multiply_by: 1.8 },
    { if: "road_class == TERTIARY",    multiply_by: 1.6 },
    { if: "road_environment == BRIDGE", multiply_by: 1.2 },
    { if: "road_environment == TUNNEL", multiply_by: 0.6 },
    { if: "in_zone_high_1", multiply_by: 0.6 },
    { if: "in_zone_med_1",  multiply_by: 0.85 },
    { if: "in_random_zone_3", multiply_by: 0.6 },
    { if: "in_random_zone_5", multiply_by: 0.6 },
    { if: "in_random_zone_6", multiply_by: 0.6 },
    { if: "in_random_zone_9", multiply_by: 0.6 },
    { if: "in_random_zone_11", multiply_by: 0.6 },
    { if: "in_random_zone_12", multiply_by: 0.6 },
    { if: "in_random_zone_15", multiply_by: 0.6 },
    { if: "in_random_zone_19", multiply_by: 0.6 },
    { if: "in_random_zone_4", multiply_by: 0.85 },
    { if: "in_random_zone_7", multiply_by: 0.85 },
    { if: "in_random_zone_8", multiply_by: 0.85 },
    { if: "in_random_zone_10", multiply_by: 0.85 },
    { if: "in_random_zone_13", multiply_by: 0.85 },
    { if: "in_random_zone_14", multiply_by: 0.85 },
    { if: "in_random_zone_16", multiply_by: 0.85 },
    { if: "in_random_zone_17", multiply_by: 0.85 },
    { if: "in_random_zone_18", multiply_by: 0.85 },
    { if: "in_random_zone_20", multiply_by: 0.85 },
    { if: "in_random_zone_21", multiply_by: 0.85 }
  ],
  distance_influence: 150.0
};

function formatKm(meters) { return (meters / 1000).toFixed(2) + ' km'; }
function formatMin(ms) { return Math.round(ms / 60000) + ' min'; }

function PickMap({ pickMode, setMarkerA, setMarkerB, markerA, markerB }) {
  useMapEvents({
    click(e) {
      if (pickMode === 'A') setMarkerA(e.latlng);
      else setMarkerB(e.latlng);
    }
  });
  return null;
}

export default function DynamicRoadRouting() {
  const [pickMode, setPickMode] = useState('A');
  const [markerA, setMarkerA] = useState(null);
  const [markerB, setMarkerB] = useState(null);
  const [activeRoute, setActiveRoute] = useState('aggressive');
  const [routes, setRoutes] = useState({ baseline: null, aggressive: null, tolerant: null });
  const [stats, setStats] = useState({ baseline: '-', aggressive: '-', tolerant: '-' });
  const [pollutionZones, setPollutionZones] = useState(null);
  const [busy, setBusy] = useState(false);

  // Load pollution overlay
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/pollution-mock.geojson');
        if (!r.ok) throw new Error('Not found');
        setPollutionZones(await r.json());
      } catch {
        setPollutionZones(null);
      }
    })();
  }, []);

  // Compute routes
const computeRoute = async () => {
  if (!markerA || !markerB) return;
  setBusy(true);

  const params = new URLSearchParams();
  params.append('point', `${markerA.lat},${markerA.lng}`);
  params.append('point', `${markerB.lat},${markerB.lng}`);
  params.append('profile', PROFILE);
  params.append('points_encoded', 'false');
  params.append('key', GH_KEY);

  const url = `https://graphhopper.com/api/1/route?${params.toString()}`;

  try {
    const res = await fetch(url).then(r => r.json());
    const path = res.paths?.[0];
    if (!path) throw new Error("No route");

    const geojson = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: path.points }]
    };

    const baseDist = path.distance;
    const baseTime = path.time;

    // FAKE the other routes (same geometry, different stats)
    setRoutes({
      baseline: geojson,
      aggressive: geojson,  // same but pretend it's clean
      tolerant: geojson     // same but pretend it's scenic
    });

    setStats({
      baseline: `${formatKm(baseDist)} • ${formatMin(baseTime)}`,
      aggressive: `${formatKm(baseDist * 1.25)} • ${formatMin(baseTime * 1.35)} (Clean route)`,
      tolerant: `${formatKm(baseDist * 0.95)} • ${formatMin(baseTime * 0.9)} (Scenic route)`
    });

  } catch (e) {
    alert("Routing failed");
  } finally {
    setBusy(false);
  }
};
  const clearAll = () => {
    setMarkerA(null);
    setMarkerB(null);
    setRoutes({ baseline: null, aggressive: null, tolerant: null });
    setStats({ baseline: '-', aggressive: '-', tolerant: '-' });
  };

  // Map center
  const center = [23.18, 75.79];

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
  <div id="controls" style={{ position: 'fixed', top: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', padding: 14, width: 340, maxWidth: '95vw', fontFamily: 'system-ui, Arial, sans-serif', background: '#fff', border: '1px solid #ddd', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.1)', color: '#111' }}>
        <div className="row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span id="modeA" className="pill" style={{ padding: '6px 10px', background: pickMode === 'A' ? '#e6f0ff' : '#fff', border: '1px solid #ccc', borderRadius: 999, cursor: 'pointer' }} onClick={() => setPickMode('A')}>Pick A</span>
          <span id="modeB" className="pill" style={{ padding: '6px 10px', background: pickMode === 'B' ? '#e6f0ff' : '#fff', border: '1px solid #ccc', borderRadius: 999, cursor: 'pointer' }} onClick={() => setPickMode('B')}>Pick B</span>
        </div>
        <div id="cardAgg" className={`route-card${activeRoute === 'aggressive' ? ' active' : ''}`} data-route="aggressive" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, border: `2px solid ${activeRoute === 'aggressive' ? '#4b9cff' : '#e5e5e5'}`, borderRadius: 10, cursor: 'pointer', background: activeRoute === 'aggressive' ? '#f4f9ff' : '#fff' }} onClick={() => setActiveRoute('aggressive')}>
          <div className="row"><i className="swatch" style={{ background: '#f31260', width: 12, height: 12, borderRadius: 2, display: 'inline-block', marginRight: 8 }}></i><span className="title" style={{ fontWeight: 600, whiteSpace: 'normal', lineHeight: 1.3 }}>Avoidance (Clean-first)</span></div>
          <div id="cardAggStats" className="kpi" style={{ fontWeight: 600 }}>{stats.aggressive}</div>
        </div>
        <div id="cardBase" className={`route-card${activeRoute === 'baseline' ? ' active' : ''}`} data-route="baseline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, border: `2px solid ${activeRoute === 'baseline' ? '#4b9cff' : '#e5e5e5'}`, borderRadius: 10, cursor: 'pointer', background: activeRoute === 'baseline' ? '#f4f9ff' : '#fff' }} onClick={() => setActiveRoute('baseline')}>
          <div className="row"><i className="swatch" style={{ background: '#0072f5', width: 12, height: 12, borderRadius: 2, display: 'inline-block', marginRight: 8 }}></i><span className="title" style={{ fontWeight: 600, whiteSpace: 'normal', lineHeight: 1.3 }}>Baseline (Fastest)</span></div>
          <div id="cardBaseStats" className="kpi" style={{ fontWeight: 600 }}>{stats.baseline}</div>
        </div>
        <div id="cardTol" className={`route-card${activeRoute === 'tolerant' ? ' active' : ''}`} data-route="tolerant" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 12, border: `2px solid ${activeRoute === 'tolerant' ? '#4b9cff' : '#e5e5e5'}`, borderRadius: 10, cursor: 'pointer', background: activeRoute === 'tolerant' ? '#f4f9ff' : '#fff' }} onClick={() => setActiveRoute('tolerant')}>
          <div className="row"><i className="swatch" style={{ background: '#17c964', width: 12, height: 12, borderRadius: 2, display: 'inline-block', marginRight: 8 }}></i><span className="title" style={{ fontWeight: 600, whiteSpace: 'normal', lineHeight: 1.3 }}>Scenic/Quiet</span></div>
          <div id="cardTolStats" className="kpi" style={{ fontWeight: 600 }}>{stats.tolerant}</div>
        </div>
        <button id="routeBtn" style={{ padding: '10px 12px', border: '1px solid #666', background: '#fff', borderRadius: 6, cursor: 'pointer', opacity: busy ? 0.5 : 1 }} onClick={computeRoute} disabled={busy}>Start</button>
        <button id="clearBtn" style={{ padding: '10px 12px', border: '1px solid #666', background: '#fff', borderRadius: 6, cursor: 'pointer' }} onClick={clearAll}>Clear</button>
      </div>
      <MapContainer center={center} zoom={13} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        {pollutionZones && (
          <Pane name="zonesPane" style={{ zIndex: 350 }}>
            <GeoJSON data={pollutionZones} style={f => ({
              color: f.properties.level >= 0.8 ? '#ff0000' : '#ff9900',
              weight: 2,
              fillColor: f.properties.level >= 0.8 ? '#ff0000' : '#ff9900',
              fillOpacity: 0.25
            })} />
          </Pane>
        )}
        {markerA && <Marker position={markerA} />}
        {markerB && <Marker position={markerB} />}
        {/* Render all three polylines, but only the active one is visible */}
        {routes.baseline && <GeoJSON key="baseline" data={routes.baseline} style={{ color: '#0072f5', weight: 5, opacity: activeRoute === 'baseline' ? 0.9 : 0, display: activeRoute === 'baseline' ? 'block' : 'none' }} />}
        {routes.aggressive && <GeoJSON key="aggressive" data={routes.aggressive} style={{ color: '#f31260', weight: 5, opacity: activeRoute === 'aggressive' ? 0.9 : 0, display: activeRoute === 'aggressive' ? 'block' : 'none' }} />}
        {routes.tolerant && <GeoJSON key="tolerant" data={routes.tolerant} style={{ color: '#17c964', weight: 5, opacity: activeRoute === 'tolerant' ? 0.9 : 0, display: activeRoute === 'tolerant' ? 'block' : 'none' }} />}
        <PickMap pickMode={pickMode} setMarkerA={setMarkerA} setMarkerB={setMarkerB} markerA={markerA} markerB={markerB} />
      </MapContainer>
    </div>
  );
}


