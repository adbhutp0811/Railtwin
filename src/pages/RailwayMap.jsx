import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Map, Train, Info, ZoomIn, ZoomOut, RefreshCw,
  AlertTriangle, Clock, Users, Activity, Navigation,
  Wifi, WifiOff, ChevronRight, X, Bell, TrendingUp,
  MapPin, Gauge, Calendar, ArrowRight, Filter, Layers,
} from "lucide-react";
import {
  indiaStations, indiaRoutes, indiaTrains,
  liveAlerts, networkStats,
} from "../data/indiaMapData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_COLOR = {
  normal:    "#00ff88",
  warning:   "#ffcc00",
  congested: "#ff8800",
  critical:  "#ff4444",
};
const TRAIN_STATUS_COLOR = {
  "on-time": "#00ff88",
  "delayed": "#ffcc00",
  "stopped": "#ff4444",
};
const TYPE_ICON = {
  Rajdhani:  "🔵",
  Shatabdi:  "🟡",
  Duronto:   "🟠",
  Express:   "🟢",
  Mail:      "🔴",
  Passenger: "⚪",
};
const ALERT_COLOR = {
  critical: "#ff4444",
  high:     "#ff8800",
  medium:   "#ffcc00",
  low:      "#00ff88",
};

const stationMap = new Map(indiaStations.map((s) => [s.id, s]));

function getRouteLatLngs(route) {
  const ids = [route.from, ...(route.via || []), route.to];
  return ids.map((id) => {
    const s = stationMap.get(id);
    return s ? [s.lat, s.lng] : null;
  }).filter(Boolean);
}

function interp(a, b, t) { return a + (b - a) * t; }

function getTrainLatLng(routeId, progress) {
  const route = indiaRoutes.find((r) => r.id === routeId);
  if (!route) return [22, 78];
  const pts = getRouteLatLngs(route);
  if (pts.length < 2) return pts[0] || [22, 78];
  const total = pts.length - 1;
  const scaled = progress * total;
  const idx = Math.min(Math.floor(scaled), total - 1);
  const t = scaled - idx;
  return [
    interp(pts[idx][0], pts[idx + 1][0], t),
    interp(pts[idx][1], pts[idx + 1][1], t),
  ];
}

function Badge({ label, color = "#00d4ff" }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase"
      style={{ background: color + "22", color, border: `1px solid ${color}44` }}
    >
      {label}
    </span>
  );
}

function StatRow({ label, value, color = "text-rail-text" }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[11px] text-rail-muted font-mono">{label}</span>
      <span className={`text-[11px] font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = Math.round((value / max) * 100);
  const col = pct > 90 ? "#ff4444" : pct > 70 ? "#ffcc00" : "#00ff88";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color || col }}
        />
      </div>
      <span className="text-[10px] font-mono" style={{ color: color || col }}>{pct}%</span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-rail-accent tabular-nums">
      {time.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })} IST
    </span>
  );
}

export default function RailwayMap() {
  const [trainData, setTrainData] = useState(
    indiaTrains.map((t) => ({ ...t, progress: Math.random() }))
  );
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedTrain,   setSelectedTrain]   = useState(null);
  const [showLabels,      setShowLabels]      = useState(true);
  const [showTrains,      setShowTrains]      = useState(true);
  const [showRoutes,      setShowRoutes]      = useState(true);
  const [filterType,      setFilterType]      = useState("all");
  const [alertIdx,        setAlertIdx]        = useState(0);
  const [lastUpdate,      setLastUpdate]      = useState(new Date());
  const [highlightRoute,  setHighlightRoute]  = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const trainMarkersRef = useRef({});
  const stationLayersRef = useRef({});
  const routeLayersRef = useRef({});
  const initializedRef = useRef(false);

  const filteredTrains = filterType === "all"
    ? trainData
    : trainData.filter((t) => t.type.toLowerCase() === filterType);
  const delayedCount = trainData.filter((t) => t.delay > 0).length;
  const onTimeCount  = trainData.filter((t) => t.delay === 0).length;

  // ── map init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;

    const map = L.map(mapRef.current, {
      center: [22.5, 78],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      maxBounds: L.latLngBounds([5, 65], [38, 100]),
      maxBoundsViscosity: 1,
      minZoom: 4,
      maxZoom: 10,
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const zoomControl = L.control.zoom({ position: "topright" });
    zoomControl.addTo(map);

    // ── stations ──────────────────────────────────────────────────────
    indiaStations.forEach((s) => {
      const color = STATUS_COLOR[s.status] || "#00ff88";
      const isTerminal = s.type === "terminal";
      const isJunction = s.type === "junction";
      const r = isTerminal ? 6 : isJunction ? 5 : 4;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          position:relative;width:${r*2}px;height:${r*2}px;
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="
            width:${r*2-2}px;height:${r*2-2}px;
            border-radius:${isTerminal ? '2px' : '50%'};
            background:${color};opacity:0.9;
            border:1px solid ${color};
            transform:${isTerminal ? 'rotate(45deg)' : 'none'};
            box-shadow:0 0 4px ${color}66;
          "></div>
          <div style="
            position:absolute;width:4px;height:4px;border-radius:50%;
            background:#050d1a;opacity:0.9;
          "></div>
        </div>`,
        iconSize: [r * 2, r * 2],
        iconAnchor: [r, r],
      });

      const marker = L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .on("click", () => {
          setSelectedStation((prev) => (prev?.id === s.id ? null : s));
          setSelectedTrain(null);
        });

      if (s.status === "critical" || s.status === "congested") {
        marker.getElement().classList.add("pulse-ring");
      }

      if (showLabels) {
        const labelText = isTerminal
          ? `<div style="font-size:9px;font-family:monospace;text-align:center;color:#c8d8f0;font-weight:${isTerminal?'bold':'normal'};line-height:1.2">${s.name}${isTerminal ? `<br><span style="color:${color};font-size:7px;opacity:0.7">[${s.shortName}]</span>` : ""}</div>`
          : `<div style="font-size:8px;font-family:monospace;text-align:center;color:#c8d8f0">${s.name}</div>`;
        const labelIcon = L.divIcon({
          className: "",
          html: labelText,
          iconSize: [80, isTerminal ? 24 : 14],
          iconAnchor: [40, -r - 4],
        });
        const labelMarker = L.marker([s.lat, s.lng], { icon: labelIcon, interactive: false }).addTo(map);
        stationLayersRef.current[s.id] = { marker, label: labelMarker };
      } else {
        stationLayersRef.current[s.id] = { marker, label: null };
      }
    });

    // ── routes ────────────────────────────────────────────────────────
    indiaRoutes.forEach((route) => {
      const pts = getRouteLatLngs(route);
      if (pts.length < 2) return;

      const polyline = L.polyline(pts, {
        color: route.color,
        weight: 1.2,
        opacity: 0.75,
        smoothFactor: 1,
        dashArray: route.type === "ring" ? "8 4" : null,
      }).addTo(map);

      polyline.on("click", () => {
        setHighlightRoute((prev) => (prev === route.id ? null : route.id));
      });

      routeLayersRef.current[route.id] = polyline;

      // Route label at midpoint
      if (showLabels && pts.length >= 2) {
        const mid = Math.floor(pts.length / 2);
        const p = pts[mid] || pts[0];
        const labelIcon = L.divIcon({
          className: "",
          html: `<div style="font-size:7px;font-family:monospace;color:${route.color};opacity:0.8;background:#0a1628aa;padding:1px 3px;border-radius:2px;white-space:nowrap">${route.shortName}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        L.marker(p, { icon: labelIcon, interactive: false }).addTo(map);
      }
    });

    // ── trains ────────────────────────────────────────────────────────
    trainData.forEach((t) => {
      const pos = getTrainLatLng(t.route, t.progress);
      const color = TRAIN_STATUS_COLOR[t.status] || "#00ff88";
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:8px;height:8px;border-radius:2px;
          background:${color};opacity:0.92;
          transform:rotate(45deg);
          box-shadow:0 0 6px ${color}88,0 0 2px ${color};
        "></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });
      const marker = L.marker(pos, { icon })
        .addTo(map)
        .on("click", () => {
          setSelectedTrain((prev) => (prev?.id === t.id ? null : { ...t }));
          setSelectedStation(null);
        });
      trainMarkersRef.current[t.id] = marker;
    });

    return () => {
      map.remove();
      initializedRef.current = false;
      trainMarkersRef.current = {};
      stationLayersRef.current = {};
      routeLayersRef.current = {};
    };
  }, []);

  // ── label visibility toggle ──────────────────────────────────────────
  useEffect(() => {
    Object.values(stationLayersRef.current).forEach(({ label }) => {
      if (label && mapInstanceRef.current) {
        if (showLabels) label.addTo(mapInstanceRef.current);
        else mapInstanceRef.current.removeLayer(label);
      }
    });
  }, [showLabels]);

  // ── highlight route ──────────────────────────────────────────────────
  useEffect(() => {
    Object.entries(routeLayersRef.current).forEach(([id, polyline]) => {
      const isHL = highlightRoute === id;
      polyline.setStyle({ weight: isHL ? 2.5 : 1.2, opacity: isHL ? 1 : 0.75 });
      if (isHL) polyline.bringToFront();
    });
  }, [highlightRoute]);

  // ── train movement loop ──────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainData((prev) =>
        prev.map((t) => {
          const speed = t.status === "stopped" ? 0
            : t.status === "delayed" ? 0.0008 : 0.0014;
          const jitter = (Math.random() - 0.5) * 0.0002;
          const newProgress = (t.progress + speed + jitter) % 1;
          const delayDelta = Math.random() < 0.02
            ? (Math.random() < 0.5 ? 1 : -1) : 0;
          const newDelay = Math.max(0, t.delay + delayDelta);
          const newStatus = newDelay > 0 ? "delayed" : "on-time";
          const newSpeed = t.status === "stopped" ? 0
            : Math.round(t.speed + (Math.random() - 0.5) * 4);

          // Update Leaflet marker position
          const marker = trainMarkersRef.current[t.id];
          if (marker && mapInstanceRef.current) {
            const pos = getTrainLatLng(t.route, newProgress);
            marker.setLatLng(pos);
          }
          return { ...t, progress: newProgress, delay: newDelay, status: newStatus, speed: newSpeed };
        })
      );
      setLastUpdate(new Date());
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // ── alert ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setAlertIdx((i) => (i + 1) % liveAlerts.length), 4000);
    return () => clearInterval(t);
  }, []);

  // ── update train marker colors when filter changes ────────────────────
  useEffect(() => {
    filteredTrains.forEach((t) => {
      const marker = trainMarkersRef.current[t.id];
      if (!marker) return;
      const color = TRAIN_STATUS_COLOR[t.status] || "#00ff88";
      const el = marker.getElement();
      if (el) {
        const inner = el.querySelector("div");
        if (inner) inner.style.background = color;
      }
    });
    Object.entries(trainMarkersRef.current).forEach(([id, marker]) => {
      const train = filteredTrains.find((t) => t.id === id);
      if (!train && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(marker);
      }
    });
  }, [filteredTrains]);

  return (
    <div className="flex flex-col h-full gap-3 max-w-screen-2xl mx-auto">

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Map size={18} className="text-rail-accent" />
            Indian Railway Network
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rail-accent/10 text-rail-accent border border-rail-accent/20">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-rail-muted mt-0.5">
            Real-time train positions · {indiaStations.length} stations · {indiaRoutes.length} corridors · {indiaTrains.length} trains
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <LiveClock />
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-rail-green/10 border border-rail-green/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rail-green animate-pulse" />
            <span className="text-[10px] font-mono text-rail-green">LIVE TRACKING</span>
          </div>
          <span className="text-[10px] font-mono text-rail-muted">
            Updated {lastUpdate.toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" })}
          </span>
        </div>
      </div>

      {/* ── ALERT TICKER ────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-xl border overflow-hidden"
        style={{
          background: ALERT_COLOR[liveAlerts[alertIdx].severity] + "11",
          borderColor: ALERT_COLOR[liveAlerts[alertIdx].severity] + "44",
        }}
      >
        <Bell size={13} style={{ color: ALERT_COLOR[liveAlerts[alertIdx].severity] }} className="flex-shrink-0 animate-pulse" />
        <span className="text-[11px] font-mono text-rail-text flex-1 truncate">
          {liveAlerts[alertIdx].message}
        </span>
        <span className="text-[10px] font-mono text-rail-muted flex-shrink-0">
          {liveAlerts[alertIdx].time}
        </span>
        <div className="flex gap-1 flex-shrink-0">
          {liveAlerts.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: i === alertIdx ? "#00d4ff" : "#ffffff22" }}
            />
          ))}
        </div>
      </div>

      {/* ── NETWORK KPIs ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "Active Trains",    value: networkStats.activeTrains,                   color: "#00d4ff",  icon: Train },
          { label: "On Time",          value: `${onTimeCount}`,                            color: "#00ff88",  icon: Activity },
          { label: "Delayed",          value: `${delayedCount}`,                           color: "#ffcc00",  icon: Clock },
          { label: "Avg Delay",        value: `${networkStats.avgDelay} min`,              color: "#ff8800",  icon: TrendingUp },
          { label: "Passengers",       value: networkStats.totalPassengers.toLocaleString(), color: "#8b5cf6", icon: Users },
          { label: "On-Time Rate",     value: `${networkStats.onTimeRate}%`,               color: "#00ff88",  icon: Gauge },
          { label: "Network Health",   value: `${networkStats.networkHealth}%`,            color: "#00d4ff",  icon: Wifi },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="panel-border rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Icon size={11} style={{ color }} />
              <span className="text-[9px] font-mono text-rail-muted uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-base font-bold font-mono" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-1 min-h-0" style={{ height: "calc(100vh - 320px)", minHeight: 480 }}>

        {/* ── MAP ──────────────────────────────────────────────────── */}
        <div className="flex-1 panel-border rounded-xl overflow-hidden relative">

          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="scan-line" />
          </div>

          {/* Map controls */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button onClick={() => setShowLabels((v) => !v)}
              className={`p-2 rounded-lg border transition-colors ${showLabels ? "bg-rail-accent/10 border-rail-accent/40 text-rail-accent" : "bg-rail-card/80 border-rail-border text-rail-muted"}`}>
              <Layers size={13} />
            </button>
          </div>

          {/* Filter pills */}
          <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1">
            {["all", "rajdhani", "shatabdi", "duronto", "express", "mail", "passenger"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase transition-colors ${
                  filterType === f
                    ? "bg-rail-accent text-rail-bg font-bold"
                    : "bg-rail-card/80 text-rail-muted border border-rail-border hover:border-rail-accent/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 text-[10px] font-mono text-rail-muted bg-rail-card/90 px-3 py-1.5 rounded-lg border border-rail-border">
            <span className="text-rail-green">{filteredTrains.length} TRAINS</span>
            <span className="w-px h-3 bg-rail-border" />
            <span>{indiaStations.length} STATIONS</span>
            <span className="w-px h-3 bg-rail-border" />
            <span className="text-rail-muted">Scroll to zoom · Drag to pan</span>
          </div>

          {/* Leaflet map container */}
          <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 480, background: "#050d1a" }} />
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "100%" }}>

          {/* Selected Station */}
          {selectedStation && (
            <div className="panel-border rounded-xl p-4 border-rail-accent/30 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-rail-accent" />
                  <span className="text-xs font-semibold text-white">Station Details</span>
                </div>
                <button onClick={() => setSelectedStation(null)}
                  className="text-rail-muted hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-bold text-rail-accent">{selectedStation.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge label={selectedStation.shortName} color="#00d4ff" />
                    <Badge label={selectedStation.type} color={STATUS_COLOR[selectedStation.status]} />
                    <Badge label={selectedStation.zone} color="#8b5cf6" />
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  <StatRow label="Platforms"   value={selectedStation.platforms} />
                  <StatRow label="Passengers"  value={selectedStation.passengers.toLocaleString()} />
                  <StatRow label="Capacity"    value={selectedStation.capacity.toLocaleString()} />
                  <StatRow label="Delay"
                    value={selectedStation.delay > 0 ? `+${selectedStation.delay} min` : "None"}
                    color={selectedStation.delay > 0 ? "text-rail-yellow" : "text-rail-green"} />
                </div>
                <div className="mt-1">
                  <div className="text-[10px] font-mono text-rail-muted mb-1">CAPACITY LOAD</div>
                  <ProgressBar value={selectedStation.passengers} max={selectedStation.capacity} />
                </div>
                {selectedStation.facilities && (
                  <div className="mt-2">
                    <div className="text-[10px] font-mono text-rail-muted mb-1">FACILITIES</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedStation.facilities.map((f) => (
                        <span key={f} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-rail-muted border border-rail-border">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-[10px] font-mono text-rail-muted mt-1">
                  📍 {selectedStation.lat}°N, {selectedStation.lng}°E
                </div>
              </div>
            </div>
          )}

          {/* Selected Train */}
          {selectedTrain && (
            <div className="panel-border rounded-xl p-4 border-rail-accent/30 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Train size={13} className="text-rail-accent" />
                  <span className="text-xs font-semibold text-white">Train Details</span>
                </div>
                <button onClick={() => setSelectedTrain(null)}
                  className="text-rail-muted hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-bold text-rail-accent">{selectedTrain.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge label={selectedTrain.number} color="#00d4ff" />
                    <Badge label={selectedTrain.type} color="#8b5cf6" />
                    <Badge label={selectedTrain.status} color={TRAIN_STATUS_COLOR[selectedTrain.status] || "#00ff88"} />
                  </div>
                  <div className="text-[10px] font-mono text-rail-muted mt-1">{selectedTrain.from} → {selectedTrain.to}</div>
                </div>
                <div className="space-y-1 mt-2">
                  <StatRow label="Speed" value={`${selectedTrain.speed || 110} km/h`} />
                  <StatRow label="Delay"
                    value={selectedTrain.delay > 0 ? `+${selectedTrain.delay} min` : "On time"}
                    color={selectedTrain.delay > 0 ? "text-rail-yellow" : "text-rail-green"} />
                  <StatRow label="Route" value={selectedTrain.route || "—"} />
                </div>
                <div className="mt-1">
                  <div className="text-[10px] font-mono text-rail-muted mb-1">ROUTE PROGRESS</div>
                  <ProgressBar value={Math.round((selectedTrain.progress || 0) * 100)} max={100} color="#00d4ff" />
                </div>
              </div>
            </div>
          )}

          {/* ── LEGEND ──────────────────────────────────────────────── */}
          <div className="panel-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={12} className="text-rail-accent" />
              <span className="text-xs font-semibold text-white">Map Legend</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">Station Status</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Normal",    color: "#00ff88" },
                    { label: "Warning",   color: "#ffcc00" },
                    { label: "Congested", color: "#ff8800" },
                    { label: "Critical",  color: "#ff4444" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-[9px] font-mono text-rail-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">Station Type</div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1">
                    <svg width="8" height="8" viewBox="-4 -4 8 8">
                      <rect x="-3" y="-3" width="6" height="6" rx="0.8" fill="#00d4ff" transform="rotate(45)" />
                    </svg>
                    <span className="text-[9px] font-mono text-rail-muted">Terminal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="8" height="8" viewBox="-4 -4 8 8">
                      <circle cx="0" cy="0" r="3" fill="#00d4ff" />
                    </svg>
                    <span className="text-[9px] font-mono text-rail-muted">Junction</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="8" height="8" viewBox="-4 -4 8 8">
                      <circle cx="0" cy="0" r="2" fill="#00d4ff" />
                    </svg>
                    <span className="text-[9px] font-mono text-rail-muted">Suburban</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">Train Status</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "On Time", color: "#00ff88" },
                    { label: "Delayed", color: "#ffcc00" },
                    { label: "Stopped", color: "#ff4444" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1">
                      <svg width="8" height="8" viewBox="-4 -4 8 8">
                        <rect x="-2" y="-2" width="4" height="4" rx="0.5" fill={color} />
                      </svg>
                      <span className="text-[9px] font-mono text-rail-muted">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">Train Types</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TYPE_ICON).map(([type, icon]) => (
                    <span key={type} className="text-[9px] font-mono text-rail-muted">{icon} {type}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── CORRIDORS ──────────────────────────────────────────── */}
          <div className="panel-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={12} className="text-rail-accent" />
              <span className="text-xs font-semibold text-white">Railway Corridors</span>
            </div>
            <div className="space-y-1">
              {indiaRoutes.map((route) => {
                const isHL = highlightRoute === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => setHighlightRoute(isHL ? null : route.id)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03]"
                    style={{ background: isHL ? route.color + "11" : "transparent" }}
                  >
                    <span className="w-2.5 h-0.5 rounded-full flex-shrink-0" style={{ background: route.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-rail-text truncate">{route.shortName}</div>
                      <div className="text-[8px] font-mono text-rail-muted truncate">{route.from} → {route.to}</div>
                    </div>
                    <span className="text-[8px] font-mono text-rail-muted flex-shrink-0">{route.via?.length || 0} segs</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── LIVE TRAINS ─────────────────────────────────────────── */}
          <div className="panel-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Train size={12} className="text-rail-accent" />
                <span className="text-xs font-semibold text-white">Live Trains</span>
              </div>
              <button onClick={() => setShowTrains((v) => !v)}
                className="text-[9px] font-mono px-2 py-0.5 rounded bg-rail-card border border-rail-border text-rail-muted hover:text-rail-accent transition-colors">
                {showTrains ? "HIDE" : "SHOW"}
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredTrains.slice(0, 30).map((train) => {
                const isSelected = selectedTrain?.id === train.id;
                const color = TRAIN_STATUS_COLOR[train.status] || "#00ff88";
                const typeIcon = TYPE_ICON[train.type] || "🚆";
                return (
                  <div
                    key={train.id}
                    onClick={() => setSelectedTrain(isSelected ? null : { ...train })}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03]"
                    style={{ background: isSelected ? color + "11" : "transparent" }}
                  >
                    <span className="flex-shrink-0">{typeIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-rail-text truncate">{train.number} {train.name}</div>
                      <div className="text-[8px] font-mono text-rail-muted truncate">{train.from} → {train.to}</div>
                    </div>
                    <span className="text-[9px] font-mono flex-shrink-0" style={{ color }}>
                      {train.speed || 110} km/h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── LIVE ALERTS ─────────────────────────────────────────── */}
          <div className="panel-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell size={12} className="text-rail-accent" />
              <span className="text-xs font-semibold text-white">Live Alerts</span>
            </div>
            <div className="space-y-1.5">
              {liveAlerts.map((alert) => (
                <div key={alert.id}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-lg border"
                  style={{ borderColor: ALERT_COLOR[alert.severity] + "33", background: ALERT_COLOR[alert.severity] + "08" }}
                >
                  <AlertTriangle size={10} style={{ color: ALERT_COLOR[alert.severity] }} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded"
                        style={{ background: ALERT_COLOR[alert.severity] + "22", color: ALERT_COLOR[alert.severity] }}>
                        {alert.severity}
                      </span>
                      <span className="text-[8px] font-mono text-rail-muted">{alert.type}</span>
                    </div>
                    <div className="text-[9px] font-mono text-rail-text mt-0.5 truncate">{alert.message}</div>
                    <div className="text-[8px] font-mono text-rail-muted mt-0.5">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
