import React, { useState, useEffect } from "react";
import {
  Cloud, RefreshCw, Wind, Droplets, Eye, Thermometer, Gauge,
  AlertTriangle, CheckCircle, TrendingUp, Sun, MapPin, Zap,
  Activity, Train, Clock, Info, Leaf, BarChart2, Radio,
  Navigation, Sunrise, Sunset, Umbrella, CloudRain, Flame,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import SectionHeader from "../components/SectionHeader";
import { useWeatherContext } from "../context/WeatherContext";

// ─── Severity config ───────────────────────────────────────────────────────
const SEV = {
  critical: { bg: "bg-red-500/10 border-red-500/30",       text: "text-red-400",    badge: "bg-red-500/20 text-red-400",    dot: "bg-red-500"    },
  high:     { bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-400", dot: "bg-orange-500" },
  medium:   { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-500" },
  low:      { bg: "bg-green-500/10 border-green-500/30",   text: "text-green-400",  badge: "bg-green-500/20 text-green-400",  dot: "bg-green-500"  },
};

// ─── Custom tooltip ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1b2a] border border-[#1a3a5c] rounded-lg p-3 text-xs font-mono shadow-xl">
      <div className="text-[#4a6080] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Wind compass ──────────────────────────────────────────────────────────
function WindCompass({ deg, speed }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center">
          <div className="absolute inset-2 rounded-full border border-[#1a3a5c]/50" />
          {["N","E","S","W"].map((d, i) => (
            <span key={d} className="absolute text-[9px] font-mono text-[#4a6080]"
              style={{ top: i===0?"2px":i===2?"auto":"50%", bottom: i===2?"2px":"auto",
                left: i===3?"2px":i===1?"auto":"50%", right: i===1?"2px":"auto",
                transform: (i===0||i===2)?"translateX(-50%)":"translateY(-50%)" }}>
              {d}
            </span>
          ))}
          <div
            className="absolute w-1 h-8 rounded-full origin-bottom"
            style={{
              background: "linear-gradient(to top, #ef4444, #00d4ff)",
              transform: `rotate(${deg}deg)`,
              bottom: "50%",
              left: "calc(50% - 2px)",
            }}
          />
          <div className="w-2 h-2 rounded-full bg-white z-10" />
        </div>
      </div>
      <div className="text-xs font-mono text-white font-bold">{speed} km/h</div>
    </div>
  );
}

// ─── UV Index bar ──────────────────────────────────────────────────────────
function UVBar({ uv }) {
  if (uv === null || uv === undefined) return null;
  const pct = Math.min(100, (uv / 11) * 100);
  const label = uv <= 2 ? "Low" : uv <= 5 ? "Moderate" : uv <= 7 ? "High" : uv <= 10 ? "Very High" : "Extreme";
  const color = uv <= 2 ? "#22c55e" : uv <= 5 ? "#eab308" : uv <= 7 ? "#f97316" : uv <= 10 ? "#ef4444" : "#9333ea";
  return (
    <div className="bg-[#0d1b2a]/60 rounded-lg p-3 border border-[#1a3a5c]/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sun size={12} className="text-yellow-400" />
          <span className="text-[10px] text-[#4a6080] font-mono">UV Index</span>
        </div>
        <span className="text-xs font-bold font-mono" style={{ color }}>{uv} — {label}</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #9333ea)" }}>
        <div className="relative h-full">
          <div className="absolute top-0 h-full w-1 rounded-full bg-white shadow-lg" style={{ left: `calc(${pct}% - 2px)` }} />
        </div>
      </div>
    </div>
  );
}

// ─── AQI panel ────────────────────────────────────────────────────────────
function AQIPanel({ aqi }) {
  if (!aqi) return null;
  const aqiColors = { 1: "#22c55e", 2: "#eab308", 3: "#f97316", 4: "#ef4444", 5: "#9333ea" };
  const aqiBg    = { 1: "bg-green-500/10 border-green-500/30", 2: "bg-yellow-500/10 border-yellow-500/30",
                     3: "bg-orange-500/10 border-orange-500/30", 4: "bg-red-500/10 border-red-500/30",
                     5: "bg-purple-500/10 border-purple-500/30" };
  const color = aqiColors[aqi.aqi] || "#4a6080";
  const bg    = aqiBg[aqi.aqi]    || "bg-[#0d1b2a] border-[#1a3a5c]";
  const pollutants = [
    { key: "pm2_5", label: "PM2.5",  unit: "μg/m³", limit: 25  },
    { key: "pm10",  label: "PM10",   unit: "μg/m³", limit: 50  },
    { key: "no2",   label: "NO₂",    unit: "μg/m³", limit: 40  },
    { key: "o3",    label: "O₃",     unit: "μg/m³", limit: 100 },
    { key: "co",    label: "CO",     unit: "μg/m³", limit: 4000},
    { key: "so2",   label: "SO₂",    unit: "μg/m³", limit: 20  },
  ];
  return (
    <div className={`panel-border rounded-xl p-5 border ${bg}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Leaf size={14} style={{ color }} />
          Air Quality Index — New Delhi
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold font-mono" style={{ color }}>{aqi.aqi}</span>
          <div>
            <div className="text-[10px] text-[#4a6080] font-mono">AQI</div>
            <div className="text-xs font-bold font-mono" style={{ color }}>{aqi.label}</div>
          </div>
        </div>
      </div>
      {/* AQI scale */}
      <div className="mb-4">
        <div className="flex h-3 rounded-full overflow-hidden mb-1">
          {[1,2,3,4,5].map(v => (
            <div key={v} className="flex-1 relative" style={{ background: aqiColors[v] }}>
              {aqi.aqi === v && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white shadow-lg" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] font-mono text-[#4a6080]">
          <span>Good</span><span>Fair</span><span>Moderate</span><span>Poor</span><span>Very Poor</span>
        </div>
      </div>
      {/* Pollutants */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {pollutants.map(p => {
          const val = parseFloat(aqi.components[p.key] || 0);
          const pct = Math.min(100, (val / p.limit) * 100);
          const barColor = pct > 150 ? "#9333ea" : pct > 100 ? "#ef4444" : pct > 75 ? "#f97316" : pct > 50 ? "#eab308" : "#22c55e";
          return (
            <div key={p.key} className="bg-[#0d1b2a]/60 rounded-lg p-2.5 border border-[#1a3a5c]/50">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono text-[#4a6080]">{p.label}</span>
                <span className="text-[10px] font-mono font-bold text-white">{val}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1a3a5c] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: barColor }} />
              </div>
              <div className="text-[9px] font-mono text-[#4a6080] mt-1">{p.unit} · limit {p.limit}</div>
            </div>
          );
        })}
      </div>
      <div className={`mt-3 p-2 rounded-lg text-[10px] font-mono ${bg}`} style={{ color }}>
        ⚠️ Delhi AQI Advisory: {aqi.aqi >= 4
          ? "Very poor air quality — sensitive groups avoid prolonged outdoor exposure. Platform staff use N95 masks."
          : aqi.aqi >= 3
          ? "Moderate pollution — outdoor maintenance work: limit exposure during peak hours (10:00–18:00)."
          : "Air quality acceptable — no special precautions needed for railway operations."}
      </div>
    </div>
  );
}

// ─── Big current weather card ──────────────────────────────────────────────
function CurrentWeatherCard({ weather, loading, lastUpdated, refresh }) {
  if (loading && !weather) {
    return (
      <div className="panel-border rounded-xl p-6 flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <RefreshCw size={24} className="text-[#00d4ff] animate-spin mx-auto" />
          <p className="text-sm text-[#4a6080] font-mono">Fetching live Delhi weather…</p>
          <p className="text-xs text-[#4a6080] font-mono">📡 Connecting to OpenWeatherMap API</p>
        </div>
      </div>
    );
  }
  if (!weather) return null;
  const sev = SEV[weather.severity] || SEV.low;

  return (
    <div className={`panel-border rounded-xl p-6 border ${sev.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-5">
          <div className="text-7xl drop-shadow-lg">{weather.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={12} className="text-[#00d4ff]" />
              <span className="text-xs font-mono text-[#4a6080]">New Delhi, India (28.6°N, 77.2°E)</span>
            </div>
            <div className="text-5xl font-bold text-white">{weather.temp}°C</div>
            <div className="text-sm text-[#4a6080] mt-1 capitalize">{weather.description}</div>
            <div className={`text-xs font-mono font-bold mt-1 ${sev.text}`}>{weather.condition}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${sev.bg} ${sev.text}`}>
            <span className={`w-2 h-2 rounded-full ${sev.dot} animate-pulse`} />
            LIVE · IST {new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-[10px] text-[#4a6080] font-mono mt-2">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}
          </div>
          <button
            onClick={refresh}
            className="mt-2 flex items-center gap-1 text-[10px] text-[#00d4ff] hover:text-white transition-colors ml-auto font-mono"
          >
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox icon={Thermometer} label="Feels Like"  value={`${weather.feelsLike}°C`}              color="text-orange-400" />
        <StatBox icon={Droplets}    label="Humidity"    value={`${weather.humidity}%`}                 color="text-blue-400"  />
        <StatBox icon={Eye}         label="Visibility"  value={`${weather.visibility} km`}             color="text-green-400" />
        <StatBox icon={Gauge}       label="Pressure"    value={`${weather.pressure} hPa`}              color="text-purple-400"/>
        <StatBox icon={Cloud}       label="Cloud Cover" value={`${weather.clouds}%`}                   color="text-[#4a6080]" />
        <StatBox icon={Droplets}    label="Dew Point"   value={`${weather.dewPoint}°C`}                color="text-cyan-400"  />
        <div className="bg-[#0d1b2a]/60 rounded-lg p-3 border border-[#1a3a5c]/50 col-span-1">
          <div className="text-[10px] text-[#4a6080] font-mono mb-1">SUNRISE / SUNSET</div>
          <div className="flex items-center gap-2">
            <Sunrise size={12} className="text-yellow-400" />
            <span className="text-xs text-white font-mono">{weather.sunrise}</span>
            <span className="text-[#1a3a5c]">|</span>
            <Sunset size={12} className="text-orange-400" />
            <span className="text-xs text-white font-mono">{weather.sunset}</span>
          </div>
        </div>
        <div className="bg-[#0d1b2a]/60 rounded-lg p-3 border border-[#1a3a5c]/50">
          <div className="text-[10px] text-[#4a6080] font-mono mb-1">WIND</div>
          <div className="flex items-center gap-2">
            <Wind size={12} className="text-[#00d4ff]" />
            <span className="text-xs text-white font-mono">{weather.windSpeed} km/h {weather.windDir}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#0d1b2a]/60 rounded-lg p-3 border border-[#1a3a5c]/50">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={color} />
        <span className="text-[10px] text-[#4a6080] font-mono">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

// ─── Delay banner ──────────────────────────────────────────────────────────
function DelayBanner({ weather }) {
  if (!weather) return null;
  const delay = weather.delayEstimate;
  const sev = delay >= 15 ? "critical" : delay >= 8 ? "high" : delay >= 3 ? "medium" : "low";
  const s = SEV[sev];
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${s.bg}`}>
      <Train size={20} className={s.text} />
      <div className="flex-1">
        <div className={`text-xs font-bold font-mono ${s.text}`}>
          WEATHER-INDUCED DELAY ESTIMATE — DELHI RAILWAY NETWORK
        </div>
        <div className="text-sm text-white mt-0.5">
          Current Delhi conditions may add approximately{" "}
          <span className={`font-bold ${s.text}`}>
            {delay === 0 ? "no additional time" : `+${delay} minutes`}
          </span>{" "}
          to average journey times across NDLS, NZM, DLI corridors.
        </div>
      </div>
      <div className={`text-4xl font-bold font-mono ${s.text} text-right`}>
        {delay === 0 ? "0" : `+${delay}`}
        <div className="text-sm font-normal">min</div>
      </div>
    </div>
  );
}

// ─── Impact list ──────────────────────────────────────────────────────────
function ImpactList({ weather }) {
  if (!weather?.impacts) return null;
  return (
    <div className="panel-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Zap size={14} className="text-yellow-400" />
        Delhi Railway Impact Assessment
      </h3>
      <div className="space-y-2">
        {weather.impacts.map((imp, i) => {
          const s = SEV[imp.type] || SEV.low;
          const Icon = imp.type === "critical" ? AlertTriangle : imp.type === "high" ? AlertTriangle : imp.type === "medium" ? Info : CheckCircle;
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg}`}>
              <Icon size={14} className={`${s.text} flex-shrink-0 mt-0.5`} />
              <p className="text-xs text-white flex-1">{imp.msg}</p>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${s.badge}`}>
                {imp.type.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Forecast strip ────────────────────────────────────────────────────────
function ForecastStrip({ forecast }) {
  if (!forecast?.length) return null;
  return (
    <div className="panel-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Clock size={14} className="text-[#00d4ff]" />
        72-Hour Delhi Forecast
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {forecast.slice(0, 16).map((f, i) => {
          const s = SEV[f.severity] || SEV.low;
          return (
            <div key={i} className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border min-w-[88px] ${
              i === 0 ? "bg-[#00d4ff]/10 border-[#00d4ff]/30" : "bg-[#0d1b2a]/60 border-[#1a3a5c]/50"
            }`}>
              <div className="text-[9px] text-[#4a6080] font-mono text-center leading-tight">{f.date}</div>
              <div className="text-[10px] text-[#4a6080] font-mono">{f.time}</div>
              <div className="text-2xl">{f.icon}</div>
              <div className="text-sm font-bold text-white">{f.temp}°C</div>
              <div className="text-[9px] text-[#4a6080] font-mono">{f.tempMin}° / {f.tempMax}°</div>
              <div className={`text-[9px] font-mono ${s.text} text-center leading-tight`}>{f.condition}</div>
              <div className="flex items-center gap-1 text-[9px] text-blue-400 font-mono">
                <Umbrella size={8} />{f.pop}%
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[#4a6080] font-mono">
                <Wind size={8} />{f.windSpeed}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Forecast chart ────────────────────────────────────────────────────────
function ForecastChart({ forecast }) {
  if (!forecast?.length) return null;
  const data = forecast.slice(0, 12).map(f => ({
    time: f.time,
    "Temp °C": f.temp,
    "Humidity %": f.humidity,
    "Wind km/h": f.windSpeed,
    "Rain %": f.pop,
  }));

  return (
    <div className="panel-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={14} className="text-green-400" />
        Weather Trends — Next 36 Hours (Delhi IST)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
          <XAxis dataKey="time" tick={{ fill: "#4a6080", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#4a6080", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: "#4a6080" }} />
          <Line type="monotone" dataKey="Temp °C"    stroke="#ff8800" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="Humidity %" stroke="#00d4ff" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="Wind km/h"  stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="2 3" />
          <Line type="monotone" dataKey="Rain %"     stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="6 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Station weather grid ──────────────────────────────────────────────────
function StationWeatherGrid({ stationWeather }) {
  const entries = Object.entries(stationWeather);
  if (!entries.length) return null;

  return (
    <div className="panel-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <MapPin size={14} className="text-yellow-400" />
        Delhi Station-Level Weather (Live)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {entries.map(([name, w]) => {
          const sev = SEV[w.severity] || SEV.low;
          return (
            <div key={name} className={`rounded-xl border p-4 ${sev.bg}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs font-semibold text-white leading-tight">{name}</div>
                  <div className="text-[10px] text-[#4a6080] font-mono">{w.cityName}</div>
                </div>
                <div className="text-2xl">{w.icon}</div>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div className="text-2xl font-bold text-white">{w.temp}°C</div>
                <div className={`text-[10px] font-mono font-bold ${sev.text}`}>{w.condition}</div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                <div className="flex items-center gap-1 text-[#4a6080]">
                  <Wind size={9} className="text-[#00d4ff]" />{w.windSpeed} km/h {w.windDir}
                </div>
                <div className="flex items-center gap-1 text-[#4a6080]">
                  <Droplets size={9} className="text-blue-400" />{w.humidity}%
                </div>
                <div className="flex items-center gap-1 text-[#4a6080]">
                  <Eye size={9} className="text-green-400" />{w.visibility} km
                </div>
                <div className="flex items-center gap-1 text-[#4a6080]">
                  <Thermometer size={9} className="text-orange-400" />{w.feelsLike}°C
                </div>
              </div>
              {w.delayEstimate > 0 && (
                <div className={`mt-2 text-[9px] font-mono font-bold ${sev.text} flex items-center gap-1`}>
                  <Train size={9} />+{w.delayEstimate} min delay risk
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Station comparison chart ──────────────────────────────────────────────
function StationCompareChart({ stationWeather }) {
  const entries = Object.entries(stationWeather);
  if (!entries.length) return null;
  const data = entries.map(([name, w]) => ({
    name: name.split(" ")[0],
    "Temp °C":   w.temp,
    "Wind km/h": w.windSpeed,
    "Humidity":  w.humidity,
    "Delay min": w.delayEstimate,
  }));

  return (
    <div className="panel-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart2 size={14} className="text-purple-400" />
        Station Weather Comparison
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
          <XAxis dataKey="name" tick={{ fill: "#4a6080", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#4a6080", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: "#4a6080" }} />
          <Bar dataKey="Temp °C"   fill="#ff8800" radius={[3,3,0,0]} />
          <Bar dataKey="Wind km/h" fill="#8b5cf6" radius={[3,3,0,0]} />
          <Bar dataKey="Delay min" fill="#ef4444" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Weather alerts ────────────────────────────────────────────────────────
function WeatherAlerts({ stationWeather, networkWeather }) {
  const alerts = [];
  if (networkWeather) {
    networkWeather.impacts
      .filter(i => i.type === "critical" || i.type === "high")
      .forEach(i => alerts.push({ station: "Network-Wide", ...i }));
  }
  Object.entries(stationWeather).forEach(([name, w]) => {
    w.impacts
      .filter(i => i.type === "critical")
      .forEach(i => alerts.push({ station: name, ...i }));
  });

  return (
    <div className="panel-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <AlertTriangle size={14} className="text-red-400" />
        Active Weather Alerts
        <span className="ml-auto text-[10px] font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
          {alerts.length} ACTIVE
        </span>
      </h3>
      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-sm text-green-400 font-mono">No active weather alerts — All Delhi corridors clear</span>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => {
            const s = SEV[a.type] || SEV.low;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg}`}>
                <AlertTriangle size={14} className={`${s.text} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className={`text-[10px] font-mono font-bold ${s.text} mb-0.5`}>{a.station}</div>
                  <p className="text-xs text-white">{a.msg}</p>
                </div>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${s.badge}`}>
                  {a.type.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Live ticker ───────────────────────────────────────────────────────────
function LiveTicker({ weather, aqi }) {
  const [idx, setIdx] = useState(0);
  const msgs = [
    weather ? `🌡️ New Delhi: ${weather.temp}°C, feels like ${weather.feelsLike}°C — ${weather.condition}` : null,
    weather ? `💨 Wind: ${weather.windSpeed} km/h ${weather.windDir} · Humidity: ${weather.humidity}% · Pressure: ${weather.pressure} hPa` : null,
    weather ? `👁️ Visibility: ${weather.visibility} km · Cloud cover: ${weather.clouds}%` : null,
    aqi ? `🌿 Air Quality: AQI ${aqi.aqi} (${aqi.label}) · PM2.5: ${aqi.components.pm2_5} μg/m³ · PM10: ${aqi.components.pm10} μg/m³` : null,
    weather?.delayEstimate > 0 ? `🚆 Weather delay estimate: +${weather.delayEstimate} min across Delhi network` : "🚆 No weather-related delays — all Delhi corridors operating normally",
    `📡 Data source: OpenWeatherMap API · Next refresh in 5 min · IST ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}`,
  ].filter(Boolean);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % msgs.length), 4000);
    return () => clearInterval(t);
  }, [msgs.length]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/20 overflow-hidden">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Radio size={12} className="text-[#00d4ff] animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-[#00d4ff]">LIVE</span>
      </div>
      <div className="text-[11px] font-mono text-white truncate transition-all">{msgs[idx]}</div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
const TABS = ["Overview", "Stations", "Forecast", "AQI", "Alerts"];

export default function WeatherDashboard() {
  const [tab, setTab] = useState("Overview");
  const { networkWeather, stationWeather, forecast, aqi, loading, error, lastUpdated, refresh } = useWeatherContext();

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Cloud}
        title="Delhi Real-Time Weather"
        subtitle="Live OpenWeatherMap data for New Delhi Railway Network · Auto-refresh every 5 minutes"
        badge="LIVE"
        badgeColor="green"
      />

      {/* Live ticker */}
      <LiveTicker weather={networkWeather} aqi={aqi} />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-mono font-bold text-yellow-400">API Notice</div>
            <div className="text-xs text-white">Live weather unavailable ({error}) — showing realistic Delhi mock data</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#0d1b2a] border border-[#1a3a5c]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all ${
              tab === t
                ? "bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30"
                : "text-[#4a6080] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "Overview" && (
        <div className="space-y-4">
          <CurrentWeatherCard weather={networkWeather} loading={loading} lastUpdated={lastUpdated} refresh={refresh} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DelayBanner weather={networkWeather} />
            </div>
            <div className="panel-border rounded-xl p-5 flex flex-col items-center justify-center gap-4">
              <div className="text-xs font-mono text-[#4a6080] text-center">WIND DIRECTION</div>
              <WindCompass deg={networkWeather?.windDeg || 0} speed={networkWeather?.windSpeed || 0} />
              <UVBar uv={networkWeather?.uvIndex} />
            </div>
          </div>
          <ImpactList weather={networkWeather} />
        </div>
      )}

      {tab === "Stations" && (
        <div className="space-y-4">
          <StationWeatherGrid stationWeather={stationWeather} />
          <StationCompareChart stationWeather={stationWeather} />
        </div>
      )}

      {tab === "Forecast" && (
        <div className="space-y-4">
          <ForecastStrip forecast={forecast} />
          <ForecastChart forecast={forecast} />
        </div>
      )}

      {tab === "AQI" && (
        <div className="space-y-4">
          <AQIPanel aqi={aqi} />
          {networkWeather && (
            <div className="panel-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Leaf size={14} className="text-green-400" />
                Delhi Pollution Impact on Railway Operations
              </h3>
              <div className="space-y-2">
                {[
                  { sev: "medium", msg: "High pollution levels reduce outdoor visibility — signal sighting distances may be affected on open-line sections" },
                  { sev: "medium", msg: "Platform staff at NDLS, NZM, DLI advised to use N95 masks during high AQI periods (AQI > 150)" },
                  { sev: "low",    msg: "Train HVAC systems switching to recirculation mode — fresh air intake reduced at all coaches" },
                  { sev: "low",    msg: "Maintenance window adjusted — outdoor track inspection shifted to early morning (05:00–07:00) for lower pollution" },
                ].map((item, i) => {
                  const s = SEV[item.sev];
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${s.bg}`}>
                      <Info size={14} className={`${s.text} flex-shrink-0 mt-0.5`} />
                      <p className="text-xs text-white">{item.msg}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "Alerts" && (
        <div className="space-y-4">
          <WeatherAlerts stationWeather={stationWeather} networkWeather={networkWeather} />
          <div className="panel-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={14} className="text-[#00d4ff]" />
              Delhi Seasonal Weather Calendar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { season: "Winter (Dec–Feb)", icon: "❄️", risk: "FOG", desc: "Dense fog causes 100+ train delays daily. FSD mandatory.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
                { season: "Summer (Mar–Jun)", icon: "🌡️", risk: "HEAT", desc: "Temperatures 40–48°C. Track buckling & AC failures.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
                { season: "Monsoon (Jul–Sep)", icon: "🌧️", risk: "RAIN", desc: "Heavy rainfall, waterlogging, signal interference.", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
                { season: "Autumn (Oct–Nov)", icon: "🌫️", risk: "SMOG", desc: "Crop burning + Diwali fireworks create severe AQI.", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl border p-4 ${s.bg}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-xs font-semibold text-white mb-1">{s.season}</div>
                  <div className={`text-[10px] font-mono font-bold ${s.color} mb-2`}>{s.risk} RISK</div>
                  <div className="text-[10px] text-[#4a6080]">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#4a6080] px-1">
        <span>📡 Source: OpenWeatherMap API · New Delhi (28.6139°N, 77.2090°E)</span>
        <span>🔄 Auto-refresh: 5 min · Last: {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}</span>
      </div>
    </div>
  );
}
