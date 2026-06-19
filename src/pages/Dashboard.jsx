import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from "recharts";
import {
  Train, AlertTriangle, CheckCircle, Clock, Users, Zap,
  TrendingUp, TrendingDown, Minus, Activity, Shield,
  MapPin, Wind, Droplets, Eye, Thermometer, RefreshCw,
  ChevronRight, ArrowUpRight, ArrowDownRight, Radio,
  Cpu, Database, Wifi, BarChart2, Navigation, Bell,
} from "lucide-react";
import { useWeatherContext } from "../context/WeatherContext";
import { Link } from "react-router-dom";

/* ─── static data ─────────────────────────────────────────────────── */
const TRAINS = [
  { id:"12301", name:"Howrah Rajdhani",   from:"NDLS", to:"HWH", speed:118, delay:0,  status:"on-time",  progress:62, platform:1, passengers:612, capacity:650 },
  { id:"12951", name:"Mumbai Rajdhani",   from:"NDLS", to:"BCT", speed:104, delay:8,  status:"delayed",  progress:38, platform:3, passengers:580, capacity:620 },
  { id:"12015", name:"Ajmer Shatabdi",    from:"NDLS", to:"AII", speed:130, delay:0,  status:"on-time",  progress:74, platform:5, passengers:440, capacity:468 },
  { id:"12309", name:"Patna Rajdhani",    from:"NDLS", to:"PNBE",speed:96,  delay:14, status:"delayed",  progress:21, platform:2, passengers:524, capacity:540 },
  { id:"22691", name:"Bangalore Rajdhani",from:"NDLS", to:"SBC", speed:0,   delay:22, status:"stopped",  progress:8,  platform:6, passengers:680, capacity:700 },
  { id:"12259", name:"Sealdah Duronto",   from:"NDLS", to:"SDAH",speed:88,  delay:5,  status:"delayed",  progress:55, platform:4, passengers:398, capacity:420 },
  { id:"12002", name:"Bhopal Shatabdi",   from:"NDLS", to:"BPL", speed:142, delay:0,  status:"on-time",  progress:89, platform:8, passengers:350, capacity:360 },
  { id:"12723", name:"Telangana Express", from:"NDLS", to:"HYB", speed:72,  delay:3,  status:"on-time",  progress:44, platform:7, passengers:810, capacity:900 },
];

const STATIONS = [
  { name:"New Delhi",        code:"NDLS", trains:12, capacity:95, status:"critical",  delay:8  },
  { name:"Hazrat Nizamuddin",code:"NZM",  trains:6,  capacity:72, status:"warning",   delay:4  },
  { name:"Old Delhi",        code:"DLI",  trains:8,  capacity:58, status:"normal",    delay:1  },
  { name:"Anand Vihar",      code:"ANVT", trains:5,  capacity:81, status:"high",      delay:6  },
  { name:"Ghaziabad",        code:"GZB",  trains:4,  capacity:44, status:"normal",    delay:0  },
  { name:"Faridabad",        code:"FDB",  trains:3,  capacity:39, status:"normal",    delay:2  },
];

const HOURLY = [
  { h:"05:00", trains:4,  delay:1.2, pax:1200  },
  { h:"06:00", trains:8,  delay:2.1, pax:4800  },
  { h:"07:00", trains:14, delay:4.8, pax:12400 },
  { h:"08:00", trains:18, delay:7.2, pax:21800 },
  { h:"09:00", trains:16, delay:6.4, pax:18600 },
  { h:"10:00", trains:12, delay:4.1, pax:14200 },
  { h:"11:00", trains:10, delay:3.2, pax:11000 },
  { h:"12:00", trains:11, delay:3.8, pax:12400 },
  { h:"13:00", trains:10, delay:3.1, pax:11800 },
  { h:"14:00", trains:12, delay:4.4, pax:13200 },
  { h:"15:00", trains:14, delay:5.1, pax:15400 },
  { h:"16:00", trains:16, delay:6.8, pax:19200 },
  { h:"17:00", trains:20, delay:9.4, pax:24600 },
  { h:"18:00", trains:18, delay:8.2, pax:22800 },
];

const NETWORK_HEALTH = [
  { name:"Signalling",   value:88, fill:"#00d4ff" },
  { name:"Track",        value:76, fill:"#00ff88" },
  { name:"Rolling Stock",value:82, fill:"#8b5cf6" },
  { name:"Comms",        value:94, fill:"#ffcc00" },
  { name:"Power",        value:71, fill:"#ff8800" },
];

const ALERTS = [
  { id:1, sev:"critical", msg:"Train 22691 (Bangalore Rajdhani) stopped at Platform 6 — 22 min delay", time:"2 min ago",  icon:"🔴" },
  { id:2, sev:"high",     msg:"Platform congestion at NDLS — 95% capacity reached",                    time:"5 min ago",  icon:"🟠" },
  { id:3, sev:"high",     msg:"Train 12309 (Patna Rajdhani) delayed 14 min — signal fault GZB",        time:"8 min ago",  icon:"🟠" },
  { id:4, sev:"medium",   msg:"Weather advisory: Dense fog expected after 22:00 IST",                  time:"12 min ago", icon:"🟡" },
  { id:5, sev:"medium",   msg:"Track maintenance window: NZM–FDB section 23:00–04:00",                 time:"18 min ago", icon:"🟡" },
  { id:6, sev:"low",      msg:"Train 12259 (Sealdah Duronto) 5 min delay — recovered partially",       time:"22 min ago", icon:"🟢" },
];

const PREDICTIONS = [
  { station:"NDLS", delay15:"9 min", delay30:"11 min", delay60:"8 min", conf:91 },
  { station:"NZM",  delay15:"5 min", delay30:"7 min",  delay60:"6 min", conf:87 },
  { station:"ANVT", delay15:"7 min", delay30:"9 min",  delay60:"8 min", conf:83 },
  { station:"GZB",  delay15:"2 min", delay30:"3 min",  delay60:"2 min", conf:94 },
];

const CORRIDOR_RISK = [
  { name:"Main Line 1",    risk:72, trains:5, color:"#00d4ff" },
  { name:"Delhi–Mathura",  risk:88, trains:4, color:"#ff8800" },
  { name:"Ring Railway",   risk:45, trains:3, color:"#00ff88" },
  { name:"Northern Corr.", risk:38, trains:2, color:"#8b5cf6" },
  { name:"Eastern Corr.",  risk:61, trains:3, color:"#ffcc00" },
  { name:"Southern Loop",  risk:55, trains:2, color:"#ff4444" },
];

/* ─── helpers ─────────────────────────────────────────────────────── */
function statusColor(s) {
  return s === "critical" ? "text-red-400"
       : s === "stopped"  ? "text-red-400"
       : s === "delayed"  ? "text-orange-400"
       : s === "high"     ? "text-orange-400"
       : s === "warning"  ? "text-yellow-400"
       : s === "medium"   ? "text-yellow-400"
       : "text-green-400";
}
function statusBg(s) {
  return s === "critical" ? "bg-red-500/10 border-red-500/30"
       : s === "stopped"  ? "bg-red-500/10 border-red-500/30"
       : s === "delayed"  ? "bg-orange-500/10 border-orange-500/30"
       : s === "high"     ? "bg-orange-500/10 border-orange-500/30"
       : s === "warning"  ? "bg-yellow-500/10 border-yellow-500/30"
       : s === "medium"   ? "bg-yellow-500/10 border-yellow-500/30"
       : "bg-green-500/10 border-green-500/30";
}
function riskColor(v) {
  return v >= 80 ? "#ff4444" : v >= 60 ? "#ff8800" : v >= 40 ? "#ffcc00" : "#00ff88";
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a1628] border border-[#1a3a5c] rounded-lg p-2 text-xs font-mono shadow-xl">
      <div className="text-[#00d4ff] mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

/* ─── sub-components ──────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, trend, color = "#00d4ff", pulse }) {
  return (
    <div className="relative rounded-xl border border-[#1a3a5c] bg-[#0a1628] p-4 overflow-hidden group hover:border-[#00d4ff]/40 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity"
           style={{ background: `radial-gradient(circle at top right, ${color}08, transparent 70%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
        {trend === "up"   && <ArrowUpRight   size={14} className="text-red-400 mt-1" />}
        {trend === "down" && <ArrowDownRight size={14} className="text-green-400 mt-1" />}
        {trend === "flat" && <Minus          size={14} className="text-[#4a6080] mt-1" />}
        {pulse && <span className="w-2 h-2 rounded-full animate-pulse mt-1" style={{ background: color }} />}
      </div>
      <div className="text-2xl font-bold text-white font-mono mb-0.5">{value}</div>
      <div className="text-xs text-[#4a6080]">{label}</div>
      {sub && <div className="text-[10px] mt-1 font-mono" style={{ color }}>{sub}</div>}
    </div>
  );
}

function TrainRow({ t, idx }) {
  const [prog, setProg] = useState(t.progress);
  useEffect(() => {
    if (t.status === "stopped") return;
    const id = setInterval(() => setProg(p => Math.min(100, p + 0.02)), 800);
    return () => clearInterval(id);
  }, [t.status]);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-[#00d4ff]/30 ${statusBg(t.status)}`}
         style={{ animationDelay: `${idx * 60}ms` }}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono
          ${t.status === "stopped" ? "bg-red-500/20 text-red-400" :
            t.status === "delayed" ? "bg-orange-500/20 text-orange-400" :
            "bg-green-500/20 text-green-400"}`}>
          {t.status === "stopped" ? "✕" : t.status === "delayed" ? "!" : "✓"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white truncate">{t.name}</span>
          <span className="text-[9px] font-mono text-[#4a6080] bg-[#1a3a5c] px-1.5 py-0.5 rounded">{t.id}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-[#4a6080] font-mono">{t.from}→{t.to}</span>
          <span className={`text-[9px] font-mono font-bold ${statusColor(t.status)}`}>
            {t.delay > 0 ? `+${t.delay}min` : "ON TIME"}
          </span>
        </div>
        <div className="mt-1.5 h-1 bg-[#1a3a5c] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
               style={{
                 width: `${prog}%`,
                 background: t.status === "stopped" ? "#ff4444" :
                             t.status === "delayed" ? "#ff8800" : "#00ff88"
               }} />
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-xs font-mono text-white">{t.speed}<span className="text-[#4a6080] text-[9px]">km/h</span></div>
        <div className="text-[9px] text-[#4a6080] font-mono">Plt {t.platform}</div>
        <div className="text-[9px] font-mono" style={{ color: t.passengers/t.capacity > 0.9 ? "#ff4444" : "#00d4ff" }}>
          {Math.round(t.passengers/t.capacity*100)}%
        </div>
      </div>
    </div>
  );
}

function AlertRow({ a }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${statusBg(a.sev)}`}>
      <span className="text-sm flex-shrink-0 mt-0.5">{a.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white leading-relaxed">{a.msg}</p>
        <p className="text-[9px] text-[#4a6080] font-mono mt-1">{a.time}</p>
      </div>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────── */
export default function Dashboard() {
  const { networkWeather, aqi, loading, refresh } = useWeatherContext();
  const [now, setNow] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("trains");
  const [tick, setTick] = useState(0);
  const tickerRef = useRef(null);

  useEffect(() => {
    const t1 = setInterval(() => setNow(new Date()), 1000);
    const t2 = setInterval(() => setTick(x => x + 1), 3000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const istTime = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit", timeZone:"Asia/Kolkata" });
  const istDate = now.toLocaleDateString("en-IN", { weekday:"long", day:"2-digit", month:"long", year:"numeric", timeZone:"Asia/Kolkata" });

  const onTimeCount  = TRAINS.filter(t => t.status === "on-time").length;
  const delayedCount = TRAINS.filter(t => t.status === "delayed").length;
  const stoppedCount = TRAINS.filter(t => t.status === "stopped").length;
  const avgDelay     = (TRAINS.reduce((s, t) => s + t.delay, 0) / TRAINS.length).toFixed(1);
  const totalPax     = TRAINS.reduce((s, t) => s + t.passengers, 0);

  const handleSync = () => { setSyncing(true); refresh(); setTimeout(() => setSyncing(false), 2000); };

  /* ── live ticker alerts ── */
  const tickerAlerts = [
    "🔴 22691 Bangalore Rajdhani — STOPPED — Platform 6 NDLS",
    "🟠 NDLS Platform congestion 95% — Deploy crowd control",
    "🟡 Dense fog advisory after 22:00 IST — FSD activation recommended",
    "🟠 12309 Patna Rajdhani — 14 min delay — Signal fault GZB",
    "🟢 Delhi Weather: " + (networkWeather ? `${networkWeather.temp}°C ${networkWeather.condition}` : "Loading..."),
    "🔵 AI Prediction: Peak delay window 17:00–19:00 IST today",
    "🟡 Track maintenance NZM–FDB section tonight 23:00–04:00",
  ];

  return (
    <div className="flex flex-col gap-4 h-full animate-fadeInUp">

      {/* ── TICKER ── */}
      <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl overflow-hidden flex items-center gap-0">
        <div className="flex-shrink-0 px-3 py-2 bg-[#00d4ff]/10 border-r border-[#1a3a5c] flex items-center gap-2">
          <Radio size={12} className="text-[#00d4ff] animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-[#00d4ff]">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <div className="animate-ticker whitespace-nowrap text-[11px] font-mono text-[#7a90a0]">
            {tickerAlerts.join("   ·   ")}
          </div>
        </div>
        <div className="flex-shrink-0 px-3 py-2 border-l border-[#1a3a5c] text-[10px] font-mono text-[#00d4ff]">
          {istTime}
        </div>
      </div>

      {/* ── TOP ROW: KPIs ── */}
      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard icon={Train}     label="Active Trains"    value={TRAINS.length}     sub="↑2 from yesterday"  trend="up"   color="#00d4ff" pulse />
        <KpiCard icon={CheckCircle} label="On Time"        value={onTimeCount}       sub={`${Math.round(onTimeCount/TRAINS.length*100)}% rate`} trend="down" color="#00ff88" />
        <KpiCard icon={AlertTriangle} label="Delayed"      value={delayedCount}      sub={`Avg +${avgDelay} min`} trend="up"  color="#ff8800" />
        <KpiCard icon={Clock}     label="Stopped"          value={stoppedCount}      sub="Immediate action"   trend="up"   color="#ff4444" />
        <KpiCard icon={Users}     label="Passengers"       value={`${(totalPax/1000).toFixed(1)}K`} sub="Live on trains" trend="flat" color="#8b5cf6" />
        <KpiCard icon={Activity}  label="Network Health"   value="72%"               sub="Below threshold"    trend="down" color="#ffcc00" />
        <KpiCard icon={Shield}    label="Active Alerts"    value="6"                 sub="2 critical"         trend="up"   color="#ff4444" />
        <KpiCard icon={Cpu}       label="AI Confidence"    value="91%"               sub="Prediction accuracy" trend="flat" color="#00d4ff" />
      </div>

      {/* ── MAIN GRID ── */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 overflow-hidden">

        {/* LEFT COL — trains + alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-hidden">

          {/* Train status tabs */}
          <div className="flex-shrink-0 flex gap-1 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-1">
            {["trains","stations","alerts"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all capitalize
                  ${activeTab === tab ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30" : "text-[#4a6080] hover:text-white"}`}>
                {tab === "trains" ? `🚆 Trains (${TRAINS.length})` : tab === "stations" ? `🏢 Stations` : `🔔 Alerts (${ALERTS.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {activeTab === "trains" && TRAINS.map((t, i) => <TrainRow key={t.id} t={t} idx={i} />)}

            {activeTab === "stations" && STATIONS.map((s, i) => (
              <div key={s.code} className={`p-3 rounded-lg border ${statusBg(s.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] font-mono text-[#4a6080]">{s.code} · {s.trains} trains</div>
                  </div>
                  <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${statusBg(s.status)} ${statusColor(s.status)}`}>
                    {s.status.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-[#4a6080]">Capacity</span>
                  <span style={{ color: riskColor(s.capacity) }}>{s.capacity}%</span>
                </div>
                <div className="h-1.5 bg-[#1a3a5c] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                       style={{ width: `${s.capacity}%`, background: riskColor(s.capacity) }} />
                </div>
                {s.delay > 0 && (
                  <div className="mt-1.5 text-[9px] font-mono text-orange-400">⏱ Avg delay: +{s.delay} min</div>
                )}
              </div>
            ))}

            {activeTab === "alerts" && ALERTS.map(a => <AlertRow key={a.id} a={a} />)}
          </div>
        </div>

        {/* MIDDLE COL — charts */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0 overflow-hidden">

          {/* Hourly delay + traffic chart */}
          <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">Network Activity — Today</div>
                <div className="text-[10px] text-[#4a6080] font-mono">Delay trend + passenger flow</div>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff8800]" />Delay (min)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00d4ff]" />Trains</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={HOURLY} margin={{ top:4, right:4, bottom:0, left:-20 }}>
                <defs>
                  <linearGradient id="gDelay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff8800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff8800" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTrains" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="h" tick={{ fill:"#4a6080", fontSize:9 }} interval={2} />
                <YAxis tick={{ fill:"#4a6080", fontSize:9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="delay"  name="Delay(min)" stroke="#ff8800" fill="url(#gDelay)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="trains" name="Trains"      stroke="#00d4ff" fill="url(#gTrains)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Corridor risk bars */}
          <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">Corridor Risk Assessment</div>
                <div className="text-[10px] text-[#4a6080] font-mono">AI-computed risk scores per route</div>
              </div>
              <Link to="/simulation" className="text-[10px] font-mono text-[#00d4ff] hover:underline flex items-center gap-1">
                Simulate <ChevronRight size={10} />
              </Link>
            </div>
            <div className="space-y-2">
              {CORRIDOR_RISK.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-28 text-[10px] font-mono text-[#7a90a0] truncate">{c.name}</div>
                  <div className="flex-1 h-2 bg-[#1a3a5c] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                         style={{ width:`${c.risk}%`, background: riskColor(c.risk) }} />
                  </div>
                  <div className="w-10 text-right text-[10px] font-mono font-bold" style={{ color: riskColor(c.risk) }}>
                    {c.risk}%
                  </div>
                  <div className="w-6 text-[9px] font-mono text-[#4a6080]">{c.trains}T</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Predictions */}
          <div className="flex-1 min-h-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">AI Delay Predictions</div>
                <div className="text-[10px] text-[#4a6080] font-mono">Next 15 / 30 / 60 min forecast</div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/30">
                <Cpu size={10} className="text-[#8b5cf6]" />
                <span className="text-[9px] font-mono text-[#8b5cf6]">XGBoost + LSTM</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1a3a5c]">
                    <th className="text-left pb-2 text-[#4a6080] font-normal">Station</th>
                    <th className="text-center pb-2 text-[#4a6080] font-normal">+15min</th>
                    <th className="text-center pb-2 text-[#4a6080] font-normal">+30min</th>
                    <th className="text-center pb-2 text-[#4a6080] font-normal">+60min</th>
                    <th className="text-center pb-2 text-[#4a6080] font-normal">Conf.</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {PREDICTIONS.map(p => (
                    <tr key={p.station} className="border-b border-[#1a3a5c]/50">
                      <td className="py-2 text-white font-bold">{p.station}</td>
                      <td className="py-2 text-center text-orange-400">{p.delay15}</td>
                      <td className="py-2 text-center text-orange-400">{p.delay30}</td>
                      <td className="py-2 text-center text-yellow-400">{p.delay60}</td>
                      <td className="py-2 text-center">
                        <span className="text-[#00d4ff]">{p.conf}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COL — weather + network health + copilot */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">

          {/* Live Weather Card */}
          <Link to="/weather" className="flex-shrink-0 block">
            <div className="bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4 hover:border-[#00d4ff]/40 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-white">Delhi Weather</div>
                <div className="flex items-center gap-1.5">
                  {loading && <RefreshCw size={10} className="text-[#4a6080] animate-spin" />}
                  <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">LIVE</span>
                </div>
              </div>
              {networkWeather ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{networkWeather.icon}</span>
                    <div>
                      <div className="text-2xl font-bold text-white">{networkWeather.temp}°C</div>
                      <div className="text-xs text-[#7a90a0]">{networkWeather.condition}</div>
                      <div className="text-[10px] text-[#4a6080] font-mono">Feels {networkWeather.feelsLike}°C</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 text-[#7a90a0]">
                      <Wind size={10} className="text-[#00d4ff]" />{networkWeather.windSpeed} km/h
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7a90a0]">
                      <Droplets size={10} className="text-blue-400" />{networkWeather.humidity}%
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7a90a0]">
                      <Eye size={10} className="text-green-400" />{networkWeather.visibility} km
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7a90a0]">
                      <Thermometer size={10} className="text-orange-400" />{networkWeather.pressure} hPa
                    </div>
                  </div>
                  {networkWeather.delayEstimate > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[10px] font-mono text-orange-400 flex items-center gap-2">
                      <AlertTriangle size={10} />
                      Weather delay risk: +{networkWeather.delayEstimate} min
                    </div>
                  )}
                  {aqi && (
                    <div className="mt-2 p-2 rounded-lg bg-[#1a3a5c]/50 text-[10px] font-mono flex items-center justify-between">
                      <span className="text-[#4a6080]">AQI Delhi</span>
                      <span className={`font-bold ${aqi.aqi <= 2 ? "text-green-400" : aqi.aqi === 3 ? "text-yellow-400" : aqi.aqi === 4 ? "text-orange-400" : "text-red-400"}`}>
                        {aqi.aqi} · {aqi.label}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-[#4a6080] text-xs font-mono">
                  <RefreshCw size={12} className="animate-spin" /> Fetching Delhi weather…
                </div>
              )}
            </div>
          </Link>

          {/* Network Health Radial */}
          <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-1">Network Health</div>
            <div className="text-[10px] text-[#4a6080] font-mono mb-3">System component status</div>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width={100} height={100}>
                <RadialBarChart cx={50} cy={50} innerRadius={18} outerRadius={48} data={NETWORK_HEALTH} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={3} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {NETWORK_HEALTH.map(n => (
                  <div key={n.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: n.fill }} />
                    <div className="flex-1 text-[9px] font-mono text-[#7a90a0] truncate">{n.name}</div>
                    <div className="text-[9px] font-mono font-bold" style={{ color: n.fill }}>{n.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-3">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label:"Open Delhi Railway Map",  to:"/map",        icon:"🗺️",  color:"#00d4ff" },
                { label:"Run Delay Prediction",    to:"/delay",      icon:"⏱️",  color:"#ff8800" },
                { label:"Congestion Analysis",     to:"/congestion", icon:"👥",  color:"#8b5cf6" },
                { label:"Launch Simulation",       to:"/simulation", icon:"⚡",  color:"#ffcc00" },
                { label:"Ask AI Copilot",          to:"/copilot",    icon:"🤖",  color:"#00ff88" },
              ].map(a => (
                <Link key={a.to} to={a.to}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-[#1a3a5c] hover:border-[#00d4ff]/40 transition-all group">
                  <span className="text-base">{a.icon}</span>
                  <span className="text-xs text-[#7a90a0] group-hover:text-white transition-colors flex-1">{a.label}</span>
                  <ChevronRight size={12} className="text-[#4a6080] group-hover:text-[#00d4ff] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4">
            <div className="text-sm font-bold text-white mb-3">System Status</div>
            <div className="space-y-2">
              {[
                { label:"Digital Twin Sync",  value:"98.4%",  ok:true  },
                { label:"AI Model",           value:"ONLINE", ok:true  },
                { label:"Weather API",        value:loading ? "SYNCING" : "LIVE", ok:!loading },
                { label:"Train Data Feed",    value:"LIVE",   ok:true  },
                { label:"Alert Engine",       value:"ACTIVE", ok:true  },
                { label:"Database",           value:"HEALTHY",ok:true  },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-2 text-[#7a90a0]">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse"}`} />
                    {s.label}
                  </div>
                  <span className={s.ok ? "text-green-400" : "text-yellow-400"}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IST date/time */}
          <div className="flex-shrink-0 bg-[#0a1628] border border-[#1a3a5c] rounded-xl p-4 text-center">
            <div className="text-[10px] font-mono text-[#4a6080] mb-1">Indian Standard Time</div>
            <div className="text-2xl font-mono font-bold text-[#00d4ff]">{istTime}</div>
            <div className="text-[10px] font-mono text-[#7a90a0] mt-1">{istDate}</div>
            <button onClick={handleSync}
              className="mt-3 flex items-center gap-2 mx-auto text-[10px] font-mono text-[#4a6080] hover:text-[#00d4ff] transition-colors">
              <RefreshCw size={10} className={syncing ? "animate-spin text-[#00d4ff]" : ""} />
              {syncing ? "Syncing…" : "Refresh data"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
