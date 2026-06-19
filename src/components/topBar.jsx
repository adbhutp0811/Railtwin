import React, { useState, useEffect } from "react";
import { Menu, Bell, RefreshCw, Wifi, AlertTriangle, Wind, Eye, Thermometer, Leaf } from "lucide-react";
import { useWeatherContext } from "../context/WeatherContext";
import { Link } from "react-router-dom";

export default function TopBar({ onMenuToggle }) {
  const [time, setTime] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const { networkWeather, aqi, loading, refresh } = useWeatherContext();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    refresh();
    setTimeout(() => setSyncing(false), 2000);
  };

  const sevBorder = {
    critical: "border-red-500/40 bg-red-500/10",
    high:     "border-orange-500/40 bg-orange-500/10",
    medium:   "border-yellow-500/40 bg-yellow-500/10",
    low:      "border-[#1a3a5c] bg-[#0d1b2a]",
  };
  const sevText = {
    critical: "text-red-400",
    high:     "text-orange-400",
    medium:   "text-yellow-400",
    low:      "text-white",
  };
  const sevDot = {
    critical: "bg-red-500",
    high:     "bg-orange-500",
    medium:   "bg-yellow-500",
    low:      "bg-green-500",
  };

  const sev = networkWeather?.severity || "low";
  const aqiColor = { 1:"text-green-400", 2:"text-yellow-400", 3:"text-orange-400", 4:"text-red-400", 5:"text-purple-400" };

  // IST time
  const istTime = time.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata",
  });
  const istDate = time.toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  });

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#1a3a5c] bg-[#0a1628] min-h-[64px] z-10">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg hover:bg-[#1a3a5c]/50 text-[#4a6080] hover:text-[#00d4ff] transition-colors"
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="text-sm font-semibold text-white">RailTwin AI — New Delhi</div>
          <div className="text-[10px] text-[#4a6080] font-mono">{istDate}</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Delhi Weather Widget */}
        <Link
          to="/weather"
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:opacity-90 cursor-pointer ${sevBorder[sev]}`}
        >
          {loading && !networkWeather ? (
            <RefreshCw size={12} className="text-[#4a6080] animate-spin" />
          ) : (
            <span className="text-lg leading-none">{networkWeather?.icon || "🌡️"}</span>
          )}
          <div>
            <div className={`text-[10px] font-mono font-bold flex items-center gap-1 ${sevText[sev]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sevDot[sev]} animate-pulse`} />
              {networkWeather?.condition || "Loading…"}
            </div>
            <div className="text-[10px] text-[#7a90a0] font-mono flex items-center gap-1.5">
              {networkWeather ? (
                <>
                  <Thermometer size={8} className="text-orange-400" />
                  <span className="text-white font-semibold">{networkWeather.temp}°C</span>
                  <span className="text-[#1a3a5c]">·</span>
                  <Wind size={8} className="text-[#4a6080]" />
                  <span>{networkWeather.windSpeed} km/h</span>
                  <span className="text-[#1a3a5c]">·</span>
                  <Eye size={8} className="text-[#4a6080]" />
                  <span>{networkWeather.visibility} km</span>
                </>
              ) : (
                <span className="text-[#4a6080]">New Delhi…</span>
              )}
            </div>
          </div>
        </Link>

        {/* AQI badge */}
        {aqi && (
          <Link
            to="/weather"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1b2a] border border-[#1a3a5c] hover:border-[#00d4ff]/30 transition-colors"
          >
            <Leaf size={11} className={aqiColor[aqi.aqi] || "text-[#4a6080]"} />
            <div>
              <div className="text-[9px] font-mono text-[#4a6080]">AQI</div>
              <div className={`text-[10px] font-mono font-bold ${aqiColor[aqi.aqi] || "text-white"}`}>
                {aqi.aqi} · {aqi.label}
              </div>
            </div>
          </Link>
        )}

        {/* Weather delay alert */}
        {networkWeather?.delayEstimate > 0 && (
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            networkWeather.delayEstimate >= 15
              ? "bg-red-500/10 border border-red-500/30"
              : networkWeather.delayEstimate >= 8
              ? "bg-orange-500/10 border border-orange-500/30"
              : "bg-yellow-500/10 border border-yellow-500/30"
          }`}>
            <AlertTriangle size={12} className={
              networkWeather.delayEstimate >= 15 ? "text-red-400" :
              networkWeather.delayEstimate >= 8  ? "text-orange-400" : "text-yellow-400"
            } />
            <span className={`text-[10px] font-mono font-bold ${
              networkWeather.delayEstimate >= 15 ? "text-red-400" :
              networkWeather.delayEstimate >= 8  ? "text-orange-400" : "text-yellow-400"
            }`}>
              +{networkWeather.delayEstimate}MIN DELAY
            </span>
          </div>
        )}

        {/* IST Clock */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1b2a] border border-[#1a3a5c]">
          <Wifi size={12} className="text-green-400" />
          <div>
            <div className="text-[9px] font-mono text-[#4a6080]">IST</div>
            <div className="text-xs font-mono text-[#00d4ff] font-bold">{istTime}</div>
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={handleSync}
          className="p-2 rounded-lg hover:bg-[#1a3a5c]/50 text-[#4a6080] hover:text-[#00d4ff] transition-colors"
          title="Refresh Delhi weather"
        >
          <RefreshCw size={16} className={(syncing || loading) ? "animate-spin text-[#00d4ff]" : ""} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#1a3a5c]/50 text-[#4a6080] hover:text-[#00d4ff] transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center text-xs font-bold text-[#00d4ff]">
          OP
        </div>
      </div>
    </header>
  );
}
