import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Map, Train, Info, Layers, ZoomIn, ZoomOut, RefreshCw,
  AlertTriangle, Clock, Users, Activity, Navigation,
  Wifi, WifiOff, ChevronRight, X, Bell, TrendingUp,
  MapPin, Gauge, Calendar, ArrowRight, Filter,
} from "lucide-react";
import {
  delhiStations, delhiRoutes, delhiTrains,
  routeSegments, liveAlerts, networkStats,
} from "../data/delhiRailwayData";

// ─── helpers ──────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function getPositionOnRoute(routeId, progress) {
  const segs = routeSegments[routeId];
  if (!segs || segs.length < 2) return { x: 95, y: 72 };
  const total = segs.length - 1;
  const scaled = progress * total;
  const idx = clamp(Math.floor(scaled), 0, total - 1);
  const t = scaled - idx;
  const a = segs[idx];
  const b = segs[idx + 1] || segs[idx];
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function getTrainAngle(routeId, progress) {
  const segs = routeSegments[routeId];
  if (!segs || segs.length < 2) return 0;
  const total = segs.length - 1;
  const scaled = progress * total;
  const idx = clamp(Math.floor(scaled), 0, total - 1);
  const a = segs[idx];
  const b = segs[idx + 1] || segs[idx];
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

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

// ─── mini badge ───────────────────────────────────────────────────────────────
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

// ─── stat row ────────────────────────────────────────────────────────────────
function StatRow({ label, value, color = "text-rail-text" }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[11px] text-rail-muted font-mono">{label}</span>
      <span className={`text-[11px] font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}

// ─── progress bar ─────────────────────────────────────────────────────────────
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

// ─── live clock ───────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RailwayMap() {
  const [trainPositions, setTrainPositions] = useState(
    delhiTrains.map((t) => ({ ...t }))
  );
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedTrain,   setSelectedTrain]   = useState(null);
  const [zoom,            setZoom]            = useState(1);
  const [pan,             setPan]             = useState({ x: 0, y: 0 });
  const [showLabels,      setShowLabels]      = useState(true);
  const [showTrains,      setShowTrains]      = useState(true);
  const [showRoutes,      setShowRoutes]      = useState(true);
  const [filterType,      setFilterType]      = useState("all");
  const [alertIdx,        setAlertIdx]        = useState(0);
  const [lastUpdate,      setLastUpdate]      = useState(new Date());
  const [isPanning,       setIsPanning]       = useState(false);
  const [panStart,        setPanStart]        = useState({ x: 0, y: 0 });
  const [highlightRoute,  setHighlightRoute]  = useState(null);
  const svgRef = useRef(null);

  // ── live train movement ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainPositions((prev) =>
        prev.map((t) => {
          const segs = routeSegments[t.route];
          if (!segs) return t;
          const speed = t.status === "stopped" ? 0
            : t.status === "delayed" ? 0.0008
            : 0.0014;
          // randomise speed slightly for realism
          const jitter = (Math.random() - 0.5) * 0.0002;
          const newProgress = (t.progress + speed + jitter) % 1;
          // occasionally nudge delay
          const delayDelta = Math.random() < 0.02
            ? (Math.random() < 0.5 ? 1 : -1)
            : 0;
          const newDelay = Math.max(0, t.delay + delayDelta);
          const newStatus = newDelay > 10 ? "delayed"
            : newDelay > 0 ? "delayed"
            : "on-time";
          const newSpeed = t.status === "stopped" ? 0
            : Math.round(t.speed + (Math.random() - 0.5) * 4);
          return { ...t, progress: newProgress, delay: newDelay, status: newStatus, speed: newSpeed };
        })
      );
      setLastUpdate(new Date());
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // ── rotate alert ticker ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setAlertIdx((i) => (i + 1) % liveAlerts.length), 4000);
    return () => clearInterval(t);
  }, []);

  // ── pan handlers ─────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.target.closest(".no-pan")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);
  const onMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);
  const onMouseUp = useCallback(() => setIsPanning(false), []);

  // ── wheel zoom ────────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    setZoom((z) => clamp(z - e.deltaY * 0.001, 0.5, 3));
  }, []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── filtered trains ───────────────────────────────────────────────────────
  const filteredTrains = filterType === "all"
    ? trainPositions
    : trainPositions.filter((t) => t.type.toLowerCase() === filterType);

  const delayedCount = trainPositions.filter((t) => t.delay > 0).length;
  const onTimeCount  = trainPositions.filter((t) => t.delay === 0).length;

  return (
    <div className="flex flex-col h-full gap-3 max-w-screen-2xl mx-auto">

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Map size={18} className="text-rail-accent" />
            New Delhi Railway Network
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rail-accent/10 text-rail-accent border border-rail-accent/20">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-rail-muted mt-0.5">
            Real-time train positions · {delhiStations.length} stations · {delhiRoutes.length} corridors · {delhiTrains.length} trains
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

      {/* ── ALERT TICKER ────────────────────────────────────────────────── */}
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

      {/* ── NETWORK KPIs ────────────────────────────────────────────────── */}
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

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-1 min-h-0" style={{ height: "calc(100vh - 320px)", minHeight: 480 }}>

        {/* ── MAP CANVAS ──────────────────────────────────────────────── */}
        <div className="flex-1 panel-border rounded-xl overflow-hidden relative select-none"
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="scan-line" />
          </div>

          {/* Map controls */}
          <div className="no-pan absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button onClick={() => setZoom((z) => clamp(z + 0.2, 0.5, 3))}
              className="p-2 rounded-lg bg-rail-card border border-rail-border hover:border-rail-accent/40 text-rail-muted hover:text-rail-accent transition-colors">
              <ZoomIn size={13} />
            </button>
            <button onClick={() => setZoom((z) => clamp(z - 0.2, 0.5, 3))}
              className="p-2 rounded-lg bg-rail-card border border-rail-border hover:border-rail-accent/40 text-rail-muted hover:text-rail-accent transition-colors">
              <ZoomOut size={13} />
            </button>
            <button onClick={resetView}
              className="p-2 rounded-lg bg-rail-card border border-rail-border hover:border-rail-accent/40 text-rail-muted hover:text-rail-accent transition-colors">
              <Navigation size={13} />
            </button>
            <button onClick={() => setShowLabels((v) => !v)}
              className={`p-2 rounded-lg border transition-colors ${showLabels ? "bg-rail-accent/10 border-rail-accent/40 text-rail-accent" : "bg-rail-card border-rail-border text-rail-muted"}`}>
              <Layers size={13} />
            </button>
          </div>

          {/* Filter pills */}
          <div className="no-pan absolute top-3 left-3 z-20 flex flex-wrap gap-1">
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

          {/* Zoom + train count */}
          <div className="no-pan absolute bottom-3 left-3 z-20 flex items-center gap-3 text-[10px] font-mono text-rail-muted bg-rail-card/90 px-3 py-1.5 rounded-lg border border-rail-border">
            <span>ZOOM {Math.round(zoom * 100)}%</span>
            <span className="w-px h-3 bg-rail-border" />
            <span className="text-rail-green">{filteredTrains.length} TRAINS</span>
            <span className="w-px h-3 bg-rail-border" />
            <span>{delhiStations.length} STATIONS</span>
            <span className="w-px h-3 bg-rail-border" />
            <span className="text-rail-muted">Scroll to zoom · Drag to pan</span>
          </div>

          {/* SVG MAP */}
          <svg
            ref={svgRef}
            viewBox="0 0 200 180"
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center",
              transition: isPanning ? "none" : "transform 0.2s ease",
            }}
          >
            <defs>
              {/* Grid */}
              <pattern id="ndgrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.3" />
              </pattern>
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-strong">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Train marker arrow */}
              {delhiRoutes.map((r) => (
                <marker key={r.id} id={`arrow-${r.id}`} viewBox="0 0 6 6" refX="3" refY="3"
                  markerWidth="4" markerHeight="4" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill={r.color} opacity="0.7" />
                </marker>
              ))}
            </defs>

            {/* Background */}
            <rect width="200" height="180" fill="#050d1a" />
            <rect width="200" height="180" fill="url(#ndgrid)" />

            {/* Yamuna River (decorative) */}
            <path
              d="M 120,10 C 118,30 122,50 118,70 C 114,90 116,110 112,130 C 108,150 110,165 108,175"
              fill="none"
              stroke="#1a3a5c"
              strokeWidth="3"
              opacity="0.5"
            />
            <text x="122" y="85" fontSize="3.5" fill="#1a4a7a" opacity="0.7" transform="rotate(5,122,85)">
              Yamuna River
            </text>

            {/* City zone labels */}
            {[
              { label: "OLD DELHI",      x: 72,  y: 52,  opacity: 0.12 },
              { label: "NEW DELHI",      x: 88,  y: 80,  opacity: 0.12 },
              { label: "EAST DELHI",     x: 130, y: 72,  opacity: 0.10 },
              { label: "SOUTH DELHI",    x: 88,  y: 105, opacity: 0.10 },
              { label: "GURGAON",        x: 58,  y: 115, opacity: 0.10 },
              { label: "NOIDA / GZB",    x: 145, y: 72,  opacity: 0.10 },
              { label: "HARYANA",        x: 42,  y: 55,  opacity: 0.10 },
            ].map(({ label, x, y, opacity }) => (
              <text key={label} x={x} y={y} fontSize="5" fill="#00d4ff"
                opacity={opacity} textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                {label}
              </text>
            ))}

            {/* ── ROUTES ─────────────────────────────────────────────── */}
            {showRoutes && delhiRoutes.map((route) => {
              const segs = routeSegments[route.id];
              if (!segs || segs.length < 2) return null;
              const pts = segs.map((s) => `${s.x},${s.y}`).join(" ");
              const isHighlighted = highlightRoute === route.id;
              return (
                <g key={route.id}>
                  {/* Glow shadow */}
                  <polyline
                    points={pts}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isHighlighted ? 4 : 2.5}
                    opacity={0.15}
                    strokeLinejoin="round"
                  />
                  {/* Main track */}
                  <polyline
                    points={pts}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isHighlighted ? 1.6 : 0.9}
                    opacity={isHighlighted ? 1 : 0.75}
                    strokeLinejoin="round"
                    strokeDasharray={route.type === "ring" ? "3 1.5" : "none"}
                    filter={isHighlighted ? "url(#glow)" : "none"}
                    style={{ cursor: "pointer" }}
                    onClick={() => setHighlightRoute(highlightRoute === route.id ? null : route.id)}
                  />
                  {/* Direction arrows along route */}
                  {segs.slice(0, -1).map((seg, i) => {
                    const next = segs[i + 1];
                    const mx = (seg.x + next.x) / 2;
                    const my = (seg.y + next.y) / 2;
                    const angle = Math.atan2(next.y - seg.y, next.x - seg.x) * 180 / Math.PI;
                    return (
                      <g key={i} transform={`translate(${mx},${my}) rotate(${angle})`}>
                        <polygon
                          points="-1.5,-0.8 1.5,0 -1.5,0.8"
                          fill={route.color}
                          opacity={0.5}
                        />
                      </g>
                    );
                  })}
                  {/* Route name label */}
                  {showLabels && segs.length >= 2 && (() => {
                    const mid = Math.floor(segs.length / 2);
                    const a = segs[mid - 1] || segs[0];
                    const b = segs[mid] || segs[1];
                    const mx = (a.x + b.x) / 2;
                    const my = (a.y + b.y) / 2;
                    return (
                      <text x={mx} y={my - 2.5} fontSize="2.2" fill={route.color}
                        opacity="0.8" textAnchor="middle" fontFamily="monospace">
                        {route.shortName}
                      </text>
                    );
                  })()}
                </g>
              );
            })}

            {/* ── STATIONS ───────────────────────────────────────────── */}
            {delhiStations.map((station) => {
              const color = STATUS_COLOR[station.status] || "#00ff88";
              const isSelected = selectedStation?.id === station.id;
              const isTerminal = station.type === "terminal";
              const isJunction = station.type === "junction";
              const r = isTerminal ? 3.2 : isJunction ? 2.4 : 1.8;
              return (
                <g
                  key={station.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStation(isSelected ? null : station);
                    setSelectedTrain(null);
                  }}
                  style={{ cursor: "pointer" }}
                  className="no-pan"
                >
                  {/* Pulse ring for critical/congested */}
                  {(station.status === "critical" || station.status === "congested") && (
                    <>
                      <circle cx={station.x} cy={station.y} r={r + 3}
                        fill="none" stroke={color} strokeWidth="0.3" opacity="0.3" className="pulse-ring" />
                      <circle cx={station.x} cy={station.y} r={r + 1.5}
                        fill="none" stroke={color} strokeWidth="0.4" opacity="0.5" />
                    </>
                  )}
                  {/* Selection ring */}
                  {isSelected && (
                    <circle cx={station.x} cy={station.y} r={r + 2.5}
                      fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
                  )}
                  {/* Station body */}
                  {isTerminal ? (
                    // Diamond for terminals
                    <g transform={`translate(${station.x},${station.y})`}>
                      <rect x={-r} y={-r} width={r * 2} height={r * 2}
                        rx="0.5"
                        fill={color} opacity={isSelected ? 1 : 0.9}
                        stroke={isSelected ? "#fff" : color}
                        strokeWidth={isSelected ? "0.5" : "0.2"}
                        transform="rotate(45)"
                        filter="url(#glow)"
                      />
                    </g>
                  ) : (
                    <circle cx={station.x} cy={station.y} r={r}
                      fill={color} opacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? "#fff" : color}
                      strokeWidth={isSelected ? "0.5" : "0.2"}
                      filter={isSelected ? "url(#glow)" : "none"}
                    />
                  )}
                  {/* Inner dot */}
                  <circle cx={station.x} cy={station.y} r={r * 0.38} fill="#050d1a" opacity="0.9" />

                  {/* Station label */}
                  {showLabels && (
                    <>
                      <text
                        x={station.x}
                        y={station.y + r + 3.2}
                        fontSize={isTerminal ? "2.6" : isJunction ? "2.2" : "1.9"}
                        fill={isSelected ? "#ffffff" : "#c8d8f0"}
                        opacity={isSelected ? 1 : 0.9}
                        textAnchor="middle"
                        fontFamily="Inter, sans-serif"
                        fontWeight={isTerminal ? "bold" : "normal"}
                      >
                        {station.name}
                      </text>
                      {isTerminal && (
                        <text
                          x={station.x}
                          y={station.y + r + 5.8}
                          fontSize="1.8"
                          fill={color}
                          opacity="0.7"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          [{station.shortName}]
                        </text>
                      )}
                    </>
                  )}

                  {/* Delay badge */}
                  {station.delay > 0 && (
                    <g transform={`translate(${station.x + r + 0.5},${station.y - r - 0.5})`}>
                      <rect x="-2" y="-2" width="8" height="4" rx="1"
                        fill="#ff8800" opacity="0.9" />
                      <text x="2" y="0.8" fontSize="2" fill="#050d1a"
                        textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        +{station.delay}m
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ── TRAINS ─────────────────────────────────────────────── */}
            {showTrains && filteredTrains.map((train) => {
              const pos = getPositionOnRoute(train.route, train.progress);
              const angle = getTrainAngle(train.route, train.progress);
              const isSelected = selectedTrain?.id === train.id;
              const color = TRAIN_STATUS_COLOR[train.status] || "#00ff88";
              const route = delhiRoutes.find((r) => r.id === train.route);
              return (
                <g
                  key={train.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrain(isSelected ? null : { ...train });
                    setSelectedStation(null);
                  }}
                  style={{ cursor: "pointer" }}
                  className="no-pan"
                >
                  {/* Speed trail */}
                  {train.status !== "stopped" && (
                    <ellipse
                      cx={-Math.cos(angle * Math.PI / 180) * 3}
                      cy={-Math.sin(angle * Math.PI / 180) * 3}
                      rx="3" ry="1"
                      fill={color}
                      opacity="0.12"
                      transform={`rotate(${angle})`}
                    />
                  )}
                  {/* Selection ring */}
                  {isSelected && (
                    <circle r="5" fill="none" stroke={color} strokeWidth="0.5"
                      opacity="0.7" className="pulse-ring" />
                  )}
                  {/* Train body */}
                  <g transform={`rotate(${angle})`}>
                    <rect x="-3.5" y="-1.5" width="7" height="3" rx="0.8"
                      fill={color} opacity={isSelected ? 1 : 0.92}
                      stroke="#050d1a" strokeWidth="0.3"
                      filter={isSelected ? "url(#glow)" : "none"}
                    />
                    {/* Cabin window */}
                    <rect x="1.5" y="-1" width="1.5" height="2" rx="0.3"
                      fill="#050d1a" opacity="0.6" />
                    {/* Wheels */}
                    <circle cx="-1.5" cy="1.5" r="0.6" fill="#050d1a" opacity="0.7" />
                    <circle cx="1"    cy="1.5" r="0.6" fill="#050d1a" opacity="0.7" />
                  </g>
                  {/* Train number label */}
                  {showLabels && (
                    <text x="0" y="-3.5" fontSize="2" fill={color}
                      textAnchor="middle" opacity="0.9" fontFamily="monospace" fontWeight="bold">
                      {train.number}
                    </text>
                  )}
                  {/* Delay badge */}
                  {train.delay > 0 && (
                    <g transform="translate(4,-2)">
                      <rect x="-1.5" y="-1.5" width="7" height="3.5" rx="0.8"
                        fill="#ff8800" opacity="0.95" />
                      <text x="1.5" y="0.8" fontSize="2" fill="#050d1a"
                        textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        +{train.delay}m
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ── COMPASS ────────────────────────────────────────────── */}
            <g transform="translate(185,15)">
              <circle r="6" fill="#050d1a" stroke="#00d4ff22" strokeWidth="0.5" />
              <text x="0" y="-3" fontSize="3" fill="#00d4ff" textAnchor="middle" opacity="0.8">N</text>
              <text x="0" y="5"  fontSize="3" fill="#00d4ff55" textAnchor="middle">S</text>
              <text x="-4" y="1" fontSize="3" fill="#00d4ff55" textAnchor="middle">W</text>
              <text x="4"  y="1" fontSize="3" fill="#00d4ff55" textAnchor="middle">E</text>
              <line x1="0" y1="-1.5" x2="0" y2="-4.5" stroke="#00d4ff" strokeWidth="0.5" />
              <polygon points="0,-4.5 -0.8,-1.5 0.8,-1.5" fill="#00d4ff" opacity="0.8" />
            </g>

            {/* ── SCALE BAR ──────────────────────────────────────────── */}
            <g transform="translate(10,170)">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
              <line x1="0" y1="-1" x2="0" y2="1" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
              <line x1="20" y1="-1" x2="20" y2="1" stroke="#00d4ff" strokeWidth="0.5" opacity="0.5" />
              <text x="10" y="-2" fontSize="2.5" fill="#00d4ff" textAnchor="middle" opacity="0.5">~20 km</text>
            </g>
          </svg>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
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
                  <div className="text-[10px] font-mono text-rail-muted">#{selectedTrain.number}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge label={selectedTrain.type} color={TRAIN_STATUS_COLOR[selectedTrain.status]} />
                    <Badge label={selectedTrain.status.replace("-", " ")}
                      color={TRAIN_STATUS_COLOR[selectedTrain.status]} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-rail-muted mt-1">
                  <span className="text-rail-text">{selectedTrain.from}</span>
                  <ArrowRight size={10} />
                  <span className="text-rail-text">{selectedTrain.to}</span>
                </div>
                <div className="space-y-1">
                  <StatRow label="Speed"
                    value={`${selectedTrain.speed} km/h`}
                    color={selectedTrain.speed > 100 ? "text-rail-green" : "text-rail-yellow"} />
                  <StatRow label="Delay"
                    value={selectedTrain.delay > 0 ? `+${selectedTrain.delay} min` : "None"}
                    color={selectedTrain.delay > 0 ? "text-rail-yellow" : "text-rail-green"} />
                  <StatRow label="Passengers"  value={`${selectedTrain.passengers} / ${selectedTrain.capacity}`} />
                  <StatRow label="Cars"        value={selectedTrain.cars} />
                  <StatRow label="Platform"    value={selectedTrain.platform} />
                  <StatRow label="Progress"    value={`${Math.round(selectedTrain.progress * 100)}%`} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-rail-muted mb-1">PASSENGER LOAD</div>
                  <ProgressBar value={selectedTrain.passengers} max={selectedTrain.capacity} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-rail-muted mb-1">ROUTE PROGRESS</div>
                  <ProgressBar
                    value={Math.round(selectedTrain.progress * 100)}
                    max={100}
                    color="#00d4ff"
                  />
                </div>
                <div className="flex gap-3 text-[10px] font-mono text-rail-muted mt-1">
                  <div>
                    <span className="text-rail-muted">Dep: </span>
                    <span className="text-rail-text">{selectedTrain.scheduledDep}</span>
                  </div>
                  <div>
                    <span className="text-rail-muted">Arr: </span>
                    <span className="text-rail-text">{selectedTrain.scheduledArr}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="panel-border rounded-xl p-4 flex-shrink-0">
            <h3 className="text-xs font-semibold text-white mb-3 font-mono">MAP LEGEND</h3>
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">STATION STATUS</div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { color: "#00ff88", label: "Normal" },
                    { color: "#ffcc00", label: "Warning" },
                    { color: "#ff8800", label: "Congested" },
                    { color: "#ff4444", label: "Critical" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[10px] text-rail-text">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">STATION TYPE</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="-4 -4 8 8">
                      <rect x="-2.5" y="-2.5" width="5" height="5" rx="0.4" fill="#00ff88" transform="rotate(45)" />
                    </svg>
                    <span className="text-[10px] text-rail-text">Terminal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="-4 -4 8 8">
                      <circle r="2.5" fill="#00ff88" />
                    </svg>
                    <span className="text-[10px] text-rail-text">Junction / Suburban</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">TRAIN STATUS</div>
                <div className="space-y-1">
                  {[
                    { color: "#00ff88", label: "On Time" },
                    { color: "#ffcc00", label: "Delayed" },
                    { color: "#ff4444", label: "Stopped" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <svg width="18" height="8" viewBox="-9 -4 18 8">
                        <rect x="-7" y="-3" width="14" height="6" rx="1.5" fill={color} />
                      </svg>
                      <span className="text-[10px] text-rail-text">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-rail-muted uppercase tracking-wider mb-1.5">TRAIN TYPES</div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(TYPE_ICON).map(([type, icon]) => (
                    <div key={type} className="flex items-center gap-1">
                      <span className="text-[11px]">{icon}</span>
                      <span className="text-[10px] text-rail-text">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Route List */}
          <div className="panel-border rounded-xl p-4 flex-shrink-0">
            <h3 className="text-xs font-semibold text-white mb-3 font-mono">CORRIDORS</h3>
            <div className="space-y-1.5">
              {delhiRoutes.map((route) => {
                const segs = routeSegments[route.id] || [];
                const trainCount = trainPositions.filter((t) => t.route === route.id).length;
                return (
                  <button
                    key={route.id}
                    onClick={() => setHighlightRoute(highlightRoute === route.id ? null : route.id)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      highlightRoute === route.id
                        ? "bg-rail-accent/10 border border-rail-accent/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: route.color }} />
                    <span className="flex-1 text-[10px] font-mono text-rail-text truncate">{route.shortName}</span>
                    <span className="text-[9px] font-mono text-rail-muted">{trainCount}T</span>
                    <span className="text-[9px] font-mono text-rail-muted">{segs.length - 1}seg</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Train List */}
          <div className="panel-border rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white font-mono">LIVE TRAINS</h3>
              <span className="text-[9px] font-mono text-rail-green animate-pulse">● LIVE</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {trainPositions.map((train) => {
                const color = TRAIN_STATUS_COLOR[train.status];
                return (
                  <button
                    key={train.id}
                    onClick={() => {
                      setSelectedTrain(selectedTrain?.id === train.id ? null : { ...train });
                      setSelectedStation(null);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      selectedTrain?.id === train.id
                        ? "bg-rail-accent/10 border border-rail-accent/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-rail-text truncate">{train.name}</div>
                      <div className="text-[9px] font-mono text-rail-muted">#{train.number} · {train.type}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-mono" style={{ color }}>
                        {train.delay > 0 ? `+${train.delay}m` : "On Time"}
                      </div>
                      <div className="text-[9px] font-mono text-rail-muted">{train.speed} km/h</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="panel-border rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white font-mono">LIVE ALERTS</h3>
              <span className="text-[9px] font-mono text-rail-red">{liveAlerts.length} ACTIVE</span>
            </div>
            <div className="space-y-2">
              {liveAlerts.map((alert) => (
                <div key={alert.id}
                  className="p-2 rounded-lg text-[10px] font-mono"
                  style={{
                    background: ALERT_COLOR[alert.severity] + "11",
                    borderLeft: `2px solid ${ALERT_COLOR[alert.severity]}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold uppercase text-[9px]" style={{ color: ALERT_COLOR[alert.severity] }}>
                      {alert.severity} · {alert.type}
                    </span>
                    <span className="text-rail-muted text-[9px]">{alert.time}</span>
                  </div>
                  <div className="text-rail-text leading-relaxed">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
