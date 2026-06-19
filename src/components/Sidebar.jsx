import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Map, Clock, Users, Zap, Bot,
  ChevronLeft, ChevronRight, Train, Cloud, Leaf,
  Wind, Droplets, Eye, Thermometer,
} from "lucide-react";
import clsx from "clsx";
import { useWeatherContext } from "../context/WeatherContext";

const navItems = [
  { to: "/",           icon: LayoutDashboard, label: "Overview",         badge: null    },
  { to: "/map",        icon: Map,             label: "Delhi Railway Map", badge: "LIVE"  },
  { to: "/delay",      icon: Clock,           label: "Delay Prediction",  badge: "4"     },
  { to: "/congestion", icon: Users,           label: "Congestion",        badge: "2"     },
  { to: "/simulation", icon: Zap,             label: "Simulation",        badge: null    },
  { to: "/weather",    icon: Cloud,           label: "Delhi Weather",     badge: "LIVE"  },
  { to: "/copilot",    icon: Bot,             label: "AI Copilot",        badge: "AI"    },
];

export default function Sidebar({ open, setOpen }) {
  const { networkWeather, aqi, loading } = useWeatherContext();

  const sevColor = {
    critical: "text-red-400",
    high:     "text-orange-400",
    medium:   "text-yellow-400",
    low:      "text-green-400",
  };
  const sevBg = {
    critical: "bg-red-500/10 border-red-500/20",
    high:     "bg-orange-500/10 border-orange-500/20",
    medium:   "bg-yellow-500/10 border-yellow-500/20",
    low:      "bg-green-500/10 border-green-500/20",
  };
  const aqiColor = { 1:"text-green-400", 2:"text-yellow-400", 3:"text-orange-400", 4:"text-red-400", 5:"text-purple-400" };

  const sev = networkWeather?.severity || "low";

  return (
    <aside className={clsx(
      "flex flex-col h-full transition-all duration-300 ease-in-out",
      "border-r border-[#1a3a5c] bg-[#0a1628] relative z-20",
      open ? "w-60" : "w-16"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1a3a5c] min-h-[64px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center">
          <Train size={16} className="text-[#00d4ff]" />
        </div>
        {open && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white whitespace-nowrap font-mono">RailTwin AI</div>
            <div className="text-[10px] text-[#4a6080] whitespace-nowrap">New Delhi Network</div>
          </div>
        )}
      </div>

      {/* System Status */}
      {open ? (
        <div className="mx-3 my-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="text-[10px] text-green-400 font-mono">SYSTEM ONLINE</span>
          </div>
          <div className="text-[9px] text-[#4a6080] mt-1 font-mono">Delhi Twin Sync: 98.4%</div>
        </div>
      ) : (
        <div className="flex justify-center my-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-2 cursor-pointer transition-all",
              isActive
                ? "active bg-[#00d4ff]/10 border-[#00d4ff] text-[#00d4ff]"
                : "border-transparent text-[#7a90a0] hover:text-white hover:bg-[#1a3a5c]/30"
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={clsx("flex-shrink-0", isActive ? "text-[#00d4ff]" : "text-[#4a6080]")} />
                {open && (
                  <span className="text-sm font-medium flex-1 whitespace-nowrap">{label}</span>
                )}
                {open && badge && (
                  <span className={clsx(
                    "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold",
                    badge === "LIVE" ? "bg-green-500/20 text-green-400" :
                    badge === "AI"   ? "bg-purple-500/20 text-purple-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Delhi Weather Widget */}
      {open && networkWeather && (
        <NavLink to="/weather" className="mx-3 mb-2">
          <div className={`p-3 rounded-xl border cursor-pointer hover:opacity-90 transition-opacity ${sevBg[sev]}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{networkWeather.icon}</span>
                <div>
                  <div className={`text-[10px] font-mono font-bold ${sevColor[sev]}`}>
                    {networkWeather.condition}
                  </div>
                  <div className="text-[9px] text-[#4a6080] font-mono">New Delhi</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{networkWeather.temp}°C</div>
                <div className="text-[9px] text-[#4a6080] font-mono">feels {networkWeather.feelsLike}°C</div>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
              <div className="flex items-center gap-1 text-[#4a6080]">
                <Wind size={8} className="text-[#00d4ff]" />{networkWeather.windSpeed} km/h {networkWeather.windDir}
              </div>
              <div className="flex items-center gap-1 text-[#4a6080]">
                <Droplets size={8} className="text-blue-400" />{networkWeather.humidity}%
              </div>
              <div className="flex items-center gap-1 text-[#4a6080]">
                <Eye size={8} className="text-green-400" />{networkWeather.visibility} km
              </div>
              <div className="flex items-center gap-1 text-[#4a6080]">
                <Thermometer size={8} className="text-orange-400" />{networkWeather.pressure} hPa
              </div>
            </div>
            {/* AQI */}
            {aqi && (
              <div className={`mt-2 flex items-center gap-1.5 text-[9px] font-mono ${aqiColor[aqi.aqi]}`}>
                <Leaf size={8} />
                AQI {aqi.aqi} · {aqi.label}
                {loading && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
              </div>
            )}
            {networkWeather.delayEstimate > 0 && (
              <div className={`mt-1 text-[9px] font-mono font-bold ${sevColor[sev]} flex items-center gap-1`}>
                <Train size={8} />+{networkWeather.delayEstimate} min delay risk
              </div>
            )}
          </div>
        </NavLink>
      )}

      {!open && networkWeather && (
        <NavLink to="/weather" className="flex justify-center mb-3">
          <div className="text-xl" title={`${networkWeather.temp}°C · ${networkWeather.condition}`}>
            {networkWeather.icon}
          </div>
        </NavLink>
      )}

      {/* Bottom */}
      <div className="border-t border-[#1a3a5c] p-3">
        {open && (
          <div className="mb-2 px-2">
            <div className="flex items-center justify-between text-[10px] text-[#4a6080] font-mono mb-1">
              <span>Network Health</span>
              <span className="text-yellow-400">72%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1a3a5c] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: "72%" }} />
            </div>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-[#1a3a5c]/50 text-[#4a6080] hover:text-[#00d4ff] transition-colors"
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          {open && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
