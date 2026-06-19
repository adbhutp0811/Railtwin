import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot, Send, User, Sparkles, Zap, RotateCcw, ChevronRight,
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle,
  Info, Copy, ThumbsUp, ThumbsDown, RefreshCw, Mic, Paperclip,
  BarChart2, Activity, Clock, Train, MapPin, Cloud, Wind, Eye, Droplets, Thermometer,
} from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { knowledgeBase, fallbackResponse } from "../data/copilotKnowledge";
import { useWeatherContext } from "../context/WeatherContext";

// ─── Suggested prompts ──────────────────────────────────────────────────────
const SUGGESTED = [
  { label: "Network health overview",          icon: "💚", category: "Network"     },
  { label: "Which trains are delayed?",        icon: "🚆", category: "Trains"      },
  { label: "Most vulnerable route?",           icon: "🛤️", category: "Routes"      },
  { label: "Highest congestion risk?",         icon: "👥", category: "Stations"    },
  { label: "What actions should operators take?", icon: "⚡", category: "Actions"  },
  { label: "Live weather impact today?",       icon: "🌦️", category: "Weather"     },
  { label: "Predict delays next 4 hours",      icon: "🔮", category: "Forecast"    },
  { label: "Maintenance schedule",             icon: "🔧", category: "Maintenance" },
  { label: "Daily performance report",         icon: "📊", category: "Reports"     },
  { label: "Emergency response status",        icon: "🚨", category: "Emergency"   },
  { label: "Northgate station status",         icon: "📍", category: "Stations"    },
  { label: "Southbridge station status",       icon: "📍", category: "Stations"    },
  { label: "All active trains",                icon: "🚄", category: "Trains"      },
  { label: "Passenger flow analysis",          icon: "👤", category: "Passengers"  },
  { label: "Simulation scenarios",             icon: "⚙️", category: "Simulation"  },
];

const CATEGORY_COLORS = {
  Network:     "text-rail-green border-rail-green/30 bg-rail-green/10",
  Trains:      "text-rail-accent border-rail-accent/30 bg-rail-accent/10",
  Routes:      "text-blue-400 border-blue-400/30 bg-blue-400/10",
  Stations:    "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Actions:     "text-orange-400 border-orange-400/30 bg-orange-400/10",
  Weather:     "text-sky-400 border-sky-400/30 bg-sky-400/10",
  Forecast:    "text-rail-purple border-rail-purple/30 bg-rail-purple/10",
  Maintenance: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  Reports:     "text-indigo-400 border-indigo-400/30 bg-indigo-400/10",
  Emergency:   "text-red-400 border-red-400/30 bg-red-400/10",
  Passengers:  "text-pink-400 border-pink-400/30 bg-pink-400/10",
  Simulation:  "text-teal-400 border-teal-400/30 bg-teal-400/10",
};

// ─── Typewriter hook ─────────────────────────────────────────────────────────
function useTypewriter(text, speed = 12, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);
  return { displayed, done };
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function Markdown({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={li}>
            {parts.map((p, pi) =>
              p.startsWith("**") && p.endsWith("**")
                ? <strong key={pi} className="text-white font-semibold">{p.slice(2, -2)}</strong>
                : <span key={pi}>{p}</span>
            )}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

// ─── Bar row ──────────────────────────────────────────────────────────────────
function BarRow({ label, value, color, status }) {
  const colors     = { red: "bg-red-500", orange: "bg-orange-400", yellow: "bg-yellow-400", green: "bg-rail-green" };
  const textColors = { red: "text-red-400", orange: "text-orange-400", yellow: "text-yellow-400", green: "text-rail-green" };
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-rail-text">{label}</span>
        <div className="flex items-center gap-2">
          {status && <span className={`text-[9px] font-mono ${textColors[color]}`}>{status}</span>}
          <span className={`font-mono font-bold ${textColors[color]}`}>{typeof value === "number" ? `${value}%` : value}</span>
        </div>
      </div>
      <div className="h-1.5 bg-rail-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

// ─── Metric grid ──────────────────────────────────────────────────────────────
function MetricGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 bg-rail-bg/60 rounded-lg px-3 py-2 border border-rail-border/50">
          <span className="text-base">{item.icon}</span>
          <div>
            <div className="text-[10px] text-rail-muted font-mono">{item.label}</div>
            <div className="text-xs font-semibold text-white">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Data table ───────────────────────────────────────────────────────────────
function DataTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  const cols = Object.keys(rows[0]);
  const statusColor = (val) => {
    if (typeof val !== "string") return "text-rail-text";
    if (val === "STOPPED" || val === "CRITICAL") return "text-red-400 font-bold";
    if (val === "DELAYED" || val === "HIGH") return "text-orange-400 font-semibold";
    if (val === "ON TIME" || val === "NORMAL") return "text-rail-green font-semibold";
    if (val === "MINOR" || val === "MEDIUM") return "text-yellow-400";
    if (val === "WARNING") return "text-orange-400";
    return "text-rail-text";
  };
  return (
    <div className="overflow-x-auto rounded-lg border border-rail-border/50">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-rail-border/50 bg-rail-bg/60">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left text-[10px] font-mono text-rail-muted uppercase tracking-wider">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-rail-border/30 hover:bg-rail-border/20 transition-colors">
              {cols.map((c) => (
                <td key={c} className={`px-3 py-2 ${statusColor(row[c])}`}>{row[c]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Forecast row ─────────────────────────────────────────────────────────────
function ForecastRow({ item }) {
  const trendColors = { up: "text-red-400", down: "text-rail-green", stable: "text-yellow-400" };
  const TrendIcon = item.trend === "up" ? TrendingUp : item.trend === "down" ? TrendingDown : Minus;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-rail-border/30 last:border-0">
      <span className="text-xs text-rail-text">{item.label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-rail-muted font-mono">{item.unit}</span>
        <span className="text-xs font-semibold text-white">{item.value}</span>
        <TrendIcon size={12} className={trendColors[item.trend]} />
      </div>
    </div>
  );
}

// ─── Alert box ────────────────────────────────────────────────────────────────
function AlertBox({ severity, text }) {
  const cfg = {
    critical: { bg: "bg-red-500/10 border-red-500/30",       icon: AlertTriangle, color: "text-red-400",    label: "AI CRITICAL" },
    high:     { bg: "bg-orange-500/10 border-orange-500/30", icon: AlertTriangle, color: "text-orange-400", label: "AI ALERT"    },
    medium:   { bg: "bg-yellow-500/10 border-yellow-500/30", icon: Info,          color: "text-yellow-400", label: "AI ADVISORY" },
    low:      { bg: "bg-rail-green/10 border-rail-green/30", icon: CheckCircle,   color: "text-rail-green", label: "AI INFO"     },
    info:     { bg: "bg-rail-purple/10 border-rail-purple/30",icon: Sparkles,     color: "text-rail-purple",label: "AI INSIGHT"  },
  };
  const c = cfg[severity] || cfg.info;
  const Icon = c.icon;
  return (
    <div className={`rounded-lg border p-3 ${c.bg}`}>
      <div className="flex items-start gap-2">
        <Icon size={14} className={`${c.color} mt-0.5 flex-shrink-0`} />
        <div>
          <div className={`text-[9px] font-mono font-bold ${c.color} mb-1`}>{c.label}</div>
          <p className="text-xs text-rail-text leading-relaxed"><Markdown text={text} /></p>
        </div>
      </div>
    </div>
  );
}

// ─── Action item ──────────────────────────────────────────────────────────────
function ActionItem({ item }) {
  const urgencyColors = {
    critical: "bg-red-500/20 border-red-500/40 text-red-400",
    high:     "bg-orange-500/20 border-orange-500/40 text-orange-400",
    medium:   "bg-yellow-500/20 border-yellow-500/40 text-yellow-400",
    low:      "bg-rail-green/20 border-rail-green/40 text-rail-green",
  };
  return (
    <div className="flex items-start gap-3 py-2 border-b border-rail-border/30 last:border-0">
      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${urgencyColors[item.urgency]}`}>
        {item.priority}
      </span>
      <div className="flex-1">
        <div className="text-xs font-semibold text-white"><Markdown text={item.action} /></div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-rail-muted font-mono">{item.station}</span>
          <span className="text-[10px] text-rail-green font-mono">{item.impact}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Live weather card (inside chat) ─────────────────────────────────────────
function LiveWeatherCard({ weather }) {
  if (!weather) return null;
  const sevColor = {
    critical: "border-red-500/40 bg-red-500/10 text-red-400",
    high:     "border-orange-500/40 bg-orange-500/10 text-orange-400",
    medium:   "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    low:      "border-rail-green/40 bg-rail-green/10 text-rail-green",
  };
  const sc = sevColor[weather.severity] || sevColor.low;
  return (
    <div className={`rounded-xl border p-4 mt-3 ${sc.split(" ").slice(0, 2).join(" ")}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{weather.icon}</span>
        <div>
          <div className={`text-sm font-bold ${sc.split(" ")[2]}`}>{weather.condition}</div>
          <div className="text-xs text-rail-muted font-mono">{weather.cityName} · Live</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold text-white">{weather.temp}°C</div>
          <div className="text-[10px] text-rail-muted font-mono">feels {weather.feelsLike}°C</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-rail-muted">
          <Wind size={10} className="text-rail-accent" />
          {weather.windSpeed} km/h {weather.windDir}
        </div>
        <div className="flex items-center gap-1.5 text-rail-muted">
          <Droplets size={10} className="text-blue-400" />
          {weather.humidity}% humidity
        </div>
        <div className="flex items-center gap-1.5 text-rail-muted">
          <Eye size={10} className="text-rail-green" />
          {weather.visibility} km visibility
        </div>
        <div className="flex items-center gap-1.5 text-rail-muted">
          <Thermometer size={10} className="text-orange-400" />
          {weather.pressure} hPa
        </div>
      </div>
      {weather.delayEstimate > 0 && (
        <div className={`mt-3 flex items-center gap-2 p-2 rounded-lg ${sc.split(" ").slice(0, 2).join(" ")}`}>
          <Train size={12} className={sc.split(" ")[2]} />
          <span className={`text-xs font-bold font-mono ${sc.split(" ")[2]}`}>
            Weather adds +{weather.delayEstimate} min to average journey times
          </span>
        </div>
      )}
      {weather.impacts && weather.impacts.length > 0 && (
        <div className="mt-3 space-y-1">
          {weather.impacts.slice(0, 3).map((imp, i) => {
            const ic = { critical: "text-red-400", high: "text-orange-400", medium: "text-yellow-400", low: "text-rail-green" };
            return (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className={`font-mono font-bold text-[9px] flex-shrink-0 mt-0.5 ${ic[imp.type]}`}>
                  {imp.type.toUpperCase()}
                </span>
                <span className="text-rail-text">{imp.msg}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Rich response card ───────────────────────────────────────────────────────
function RichResponse({ response, isNew }) {
  const { displayed } = useTypewriter(response.summary || "", 8, isNew);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-rail-purple rounded-full" />
        <h3 className="text-sm font-bold text-white">{response.title}</h3>
      </div>
      {response.summary && (
        <p className="text-sm text-rail-text leading-relaxed">
          {isNew ? <Markdown text={displayed} /> : <Markdown text={response.summary} />}
        </p>
      )}
      {response.sections && response.sections.map((section, si) => (
        <div key={si} className="space-y-2">
          <h4 className="text-xs font-semibold text-rail-muted uppercase tracking-wider font-mono">{section.heading}</h4>
          {section.type === "bars"     && <div className="space-y-2">{section.items.map((item, ii) => <BarRow key={ii} {...item} />)}</div>}
          {section.type === "metrics"  && <MetricGrid items={section.items} />}
          {section.type === "table"    && <DataTable rows={section.rows} />}
          {section.type === "list"     && (
            <ul className="space-y-1.5">
              {section.items.map((item, ii) => (
                <li key={ii} className="text-xs text-rail-text leading-relaxed flex items-start gap-2">
                  <span className="text-rail-muted mt-0.5 flex-shrink-0">›</span>
                  <Markdown text={item} />
                </li>
              ))}
            </ul>
          )}
          {section.type === "forecast" && (
            <div className="bg-rail-bg/40 rounded-lg border border-rail-border/50 px-3 py-1">
              {section.items.map((item, ii) => <ForecastRow key={ii} item={item} />)}
            </div>
          )}
          {section.type === "alert"   && <AlertBox severity={section.severity} text={section.text} />}
          {section.type === "actions" && (
            <div className="bg-rail-bg/40 rounded-lg border border-rail-border/50 px-3 py-1">
              {section.items.map((item, ii) => <ActionItem key={ii} item={item} />)}
            </div>
          )}
          {section.type === "weather_live" && <LiveWeatherCard weather={section.weather} />}
        </div>
      ))}
    </div>
  );
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-rail-purple/70"
          style={{ animation: `typingBounce 1.3s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:.5} 30%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isLatestBot }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.response?.summary || msg.text || "").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex gap-3 group ${isBot ? "flex-row" : "flex-row-reverse"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
        isBot
          ? "bg-gradient-to-br from-rail-purple/40 to-rail-purple/10 border border-rail-purple/50"
          : "bg-gradient-to-br from-rail-accent/30 to-rail-accent/10 border border-rail-accent/40"
      }`}>
        {isBot ? <Bot size={14} className="text-rail-purple" /> : <User size={14} className="text-rail-accent" />}
      </div>
      <div className={`flex flex-col gap-2 ${isBot ? "items-start max-w-[85%]" : "items-end max-w-[70%]"}`}>
        <div className={`flex items-center gap-2 text-[10px] font-mono text-rail-muted ${isBot ? "" : "flex-row-reverse"}`}>
          <span className="font-semibold text-rail-text">{isBot ? "RailTwin AI" : "Operator"}</span>
          <span>·</span>
          <span>{msg.time}</span>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? "bg-rail-card border border-rail-border text-rail-text rounded-tl-sm"
            : "bg-rail-accent/15 border border-rail-accent/30 text-rail-text rounded-tr-sm"
        }`}>
          {isBot && msg.response ? (
            msg.response.type === "simple"
              ? <p className="text-sm text-rail-text leading-relaxed"><Markdown text={msg.response.text} /></p>
              : <RichResponse response={msg.response} isNew={isLatestBot} />
          ) : (
            <p>{msg.text}</p>
          )}
        </div>
        {isBot && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-rail-muted hover:text-white hover:bg-rail-border/50 transition-colors">
              <Copy size={10} /> {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={() => setLiked(true)}  className={`p-1 rounded hover:bg-rail-border/50 transition-colors ${liked === true  ? "text-rail-green" : "text-rail-muted hover:text-white"}`}><ThumbsUp  size={12} /></button>
            <button onClick={() => setLiked(false)} className={`p-1 rounded hover:bg-rail-border/50 transition-colors ${liked === false ? "text-red-400"   : "text-rail-muted hover:text-white"}`}><ThumbsDown size={12} /></button>
          </div>
        )}
        {msg.tags && (
          <div className="flex flex-wrap gap-1">
            {msg.tags.map((tag, i) => (
              <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rail-purple/10 border border-rail-purple/20 text-rail-purple">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main AICopilot component ─────────────────────────────────────────────────
export default function AICopilot() {
  const { networkWeather, stationWeather, forecast, loading: weatherLoading, lastUpdated } = useWeatherContext();

  const makeWeatherResponse = useCallback((w) => {
    if (!w) return null;
    return {
      type: "rich",
      title: "Live Weather Impact Assessment",
      summary: `**${w.condition}** detected at ${w.cityName}. ${w.delayEstimate > 0 ? `Current conditions are adding approximately **+${w.delayEstimate} minutes** to average journey times.` : "No significant delay impact from current weather."} Wind: ${w.windSpeed} km/h ${w.windDir} · Visibility: ${w.visibility} km · Humidity: ${w.humidity}%.`,
      sections: [
        {
          heading: "🌦️ Live Conditions — Fetched " + (lastUpdated ? lastUpdated.toLocaleTimeString("en-GB") : "just now"),
          type: "weather_live",
          weather: w,
        },
        {
          heading: "🚆 Railway Impact",
          type: "list",
          items: w.impacts.map((i) => `**${i.type.toUpperCase()}** — ${i.msg}`),
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: w.severity === "critical" ? "critical" : w.severity === "high" ? "high" : w.severity === "medium" ? "medium" : "low",
          text: w.delayEstimate >= 15
            ? `Severe weather alert: Activate emergency weather protocol. Speed restrictions on all lines. Delay contingency timetable in effect. Estimated delay: +${w.delayEstimate} min.`
            : w.delayEstimate >= 8
            ? `Weather advisory: Apply speed restrictions on exposed sections. Alert signal maintenance teams. Estimated delay: +${w.delayEstimate} min.`
            : w.delayEstimate >= 3
            ? `Minor weather impact: Monitor signal equipment. Issue advisory to passengers. Estimated delay: +${w.delayEstimate} min.`
            : "No significant weather-related action required. Continue normal operations.",
        },
      ],
      tags: [`${w.condition}`, `${w.temp}°C`, `+${w.delayEstimate} min delay`, w.severity.toUpperCase()],
    };
  }, [lastUpdated]);

  const buildResponse = useCallback((input) => {
    const q = input.toLowerCase();

    // ── Live weather queries ──
    if (q.includes("weather") || q.includes("rain") || q.includes("wind") || q.includes("storm") ||
        q.includes("temperature") || q.includes("humidity") || q.includes("visibility") || q.includes("forecast")) {
      const wr = makeWeatherResponse(networkWeather);
      if (wr) {
        // Attach forecast if asking for forecast
        if ((q.includes("forecast") || q.includes("next") || q.includes("tomorrow") || q.includes("hour")) && forecast.length > 0) {
          wr.sections.splice(1, 0, {
            heading: "📅 48-Hour Forecast",
            type: "forecast",
            items: forecast.slice(0, 6).map((f) => ({
              label: `${f.date} ${f.time}`,
              value: `${f.icon} ${f.condition} ${f.temp}°C`,
              unit: `💧${f.pop}% · 💨${f.windSpeed}km/h`,
              trend: f.severity === "critical" || f.severity === "high" ? "up" : "down",
            })),
          });
        }
        // Attach station weather if asking about stations
        if (q.includes("station") || q.includes("all") || q.includes("each")) {
          const stEntries = Object.entries(stationWeather).slice(0, 6);
          if (stEntries.length > 0) {
            wr.sections.push({
              heading: "📍 Per-Station Conditions",
              type: "table",
              rows: stEntries.map(([name, sw]) => ({
                Station: name.split(" ")[0],
                Condition: `${sw.icon} ${sw.condition}`,
                Temp: `${sw.temp}°C`,
                Wind: `${sw.windSpeed} km/h`,
                Visibility: `${sw.visibility} km`,
                "Delay Risk": sw.delayEstimate > 0 ? `+${sw.delayEstimate} min` : "None",
              })),
            });
          }
        }
        return { response: wr, tags: wr.tags };
      }
    }

    // ── Knowledge base lookup ──
    const entry = knowledgeBase.find((e) =>
      e.patterns.some((p) => q.includes(p.toLowerCase()))
    );
    if (entry) return { response: entry.response, tags: entry.response.tags };

    // ── Fallback ──
    return { response: fallbackResponse, tags: fallbackResponse.tags };
  }, [networkWeather, stationWeather, forecast, makeWeatherResponse]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "",
      response: {
        type: "rich",
        title: "Welcome to RailTwin AI Copilot",
        summary: "I'm your AI operations assistant with **real-time weather integration**. I can answer questions about train delays, station congestion, route risks, live weather impacts, and operational recommendations. What would you like to know?",
        sections: [
          {
            heading: "🌦️ Live Weather Status",
            type: "weather_live",
            weather: networkWeather,
          },
          {
            heading: "💡 Try asking me",
            type: "list",
            items: [
              "\"Live weather impact today?\" — real-time weather + railway impact",
              "\"Which trains are delayed?\" — current delay analysis",
              "\"Highest congestion risk?\" — station capacity status",
              "\"What actions should operators take?\" — AI action plan",
              "\"Most vulnerable route?\" — route risk assessment",
            ],
          },
        ],
        tags: ["Live Weather", "AI Ready", "All Modules Active"],
      },
      tags: ["Live Weather", "AI Ready", "All Modules Active"],
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Update welcome message when weather loads
  useEffect(() => {
    if (networkWeather) {
      setMessages((prev) => prev.map((m) =>
        m.id === 1 ? {
          ...m,
          response: {
            ...m.response,
            sections: [
              { heading: "🌦️ Live Weather Status", type: "weather_live", weather: networkWeather },
              m.response.sections[1],
            ],
          },
        } : m
      ));
    }
  }, [networkWeather]);

  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, typing]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const { response, tags } = buildResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: "",
        response,
        tags,
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, delay);
  }, [buildResponse]);

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
  const handleClear  = () => {
    setMessages([{
      id: Date.now(),
      role: "assistant",
      text: "",
      response: {
        type: "simple",
        text: "Chat cleared. How can I help you with railway operations?",
      },
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  const categories = ["All", ...Array.from(new Set(SUGGESTED.map((s) => s.category)))];
  const filteredSuggested = activeFilter === "All" ? SUGGESTED : SUGGESTED.filter((s) => s.category === activeFilter);

  const latestBotId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)] max-w-screen-2xl mx-auto">

      {/* ── Chat panel ── */}
      <div className="flex flex-col flex-1 min-w-0 panel-border rounded-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-rail-border bg-rail-panel">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rail-purple/40 to-rail-purple/10 border border-rail-purple/50 flex items-center justify-center">
                <Bot size={18} className="text-rail-purple" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-rail-green rounded-full border-2 border-rail-panel" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">RailTwin AI Copilot</div>
              <div className="text-[10px] text-rail-muted font-mono flex items-center gap-2">
                <span className="text-rail-green">● ONLINE</span>
                <span>·</span>
                {networkWeather ? (
                  <span className="flex items-center gap-1">
                    <span>{networkWeather.icon}</span>
                    <span>{networkWeather.temp}°C {networkWeather.condition}</span>
                    {networkWeather.delayEstimate > 0 && (
                      <span className="text-orange-400 font-bold">· +{networkWeather.delayEstimate}min delay</span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-1"><RefreshCw size={8} className="animate-spin" /> Loading weather…</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rail-purple/10 border border-rail-purple/20">
              <Sparkles size={10} className="text-rail-purple" />
              <span className="text-[10px] text-rail-purple font-mono">LangGraph + Live Weather</span>
            </div>
            <button onClick={handleClear} className="p-2 rounded-lg hover:bg-rail-border/50 text-rail-muted hover:text-white transition-colors" title="Clear chat">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} isLatestBot={msg.id === latestBotId && msg.isNew} />
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rail-purple/40 to-rail-purple/10 border border-rail-purple/50 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-rail-purple" />
              </div>
              <div className="bg-rail-card border border-rail-border rounded-2xl rounded-tl-sm px-4 py-3">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-rail-border p-4 bg-rail-panel">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about weather, delays, congestion, routes, actions…"
                className="w-full bg-rail-card border border-rail-border rounded-xl px-4 py-3 pr-10 text-sm text-rail-text placeholder-rail-muted focus:outline-none focus:border-rail-accent/50 transition-colors"
                disabled={typing}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-rail-muted hover:text-rail-accent transition-colors">
                <Mic size={14} />
              </button>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rail-accent text-rail-bg font-semibold text-sm hover:bg-rail-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-rail-muted font-mono">
              {weatherLoading ? "⟳ Updating weather…" : networkWeather ? `☁ Weather: ${networkWeather.condition} · ${networkWeather.temp}°C · Updated ${lastUpdated?.toLocaleTimeString("en-GB") || "—"}` : "Weather: connecting…"}
            </span>
            <span className="text-[10px] text-rail-muted font-mono">{messages.length - 1} messages</span>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">

        {/* Live weather mini panel */}
        <div className="panel-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cloud size={14} className="text-sky-400" />
            <span className="text-xs font-semibold text-white">Live Weather</span>
            {weatherLoading && <RefreshCw size={10} className="text-rail-muted animate-spin ml-auto" />}
          </div>
          {networkWeather ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{networkWeather.icon}</span>
                <div>
                  <div className="text-lg font-bold text-white">{networkWeather.temp}°C</div>
                  <div className="text-[10px] text-rail-muted font-mono">{networkWeather.condition}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px] font-mono text-rail-muted">
                <div className="flex justify-between"><span>💨 Wind</span><span className="text-rail-text">{networkWeather.windSpeed} km/h {networkWeather.windDir}</span></div>
                <div className="flex justify-between"><span>👁️ Visibility</span><span className="text-rail-text">{networkWeather.visibility} km</span></div>
                <div className="flex justify-between"><span>💧 Humidity</span><span className="text-rail-text">{networkWeather.humidity}%</span></div>
                <div className="flex justify-between"><span>🌡️ Feels like</span><span className="text-rail-text">{networkWeather.feelsLike}°C</span></div>
                {networkWeather.delayEstimate > 0 && (
                  <div className="flex justify-between text-orange-400 font-bold border-t border-rail-border/50 pt-1.5 mt-1.5">
                    <span>🚆 Delay risk</span>
                    <span>+{networkWeather.delayEstimate} min</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => sendMessage("Live weather impact today?")}
                className="mt-3 w-full text-[10px] text-sky-400 font-mono hover:text-white transition-colors text-left flex items-center gap-1"
              >
                <ChevronRight size={10} /> Ask about weather impact
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-rail-muted">
              <RefreshCw size={12} className="animate-spin" /> Fetching live data…
            </div>
          )}
        </div>

        {/* Suggested questions */}
        <div className="panel-border rounded-xl p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-rail-purple" />
            <span className="text-xs font-semibold text-white">Suggested Questions</span>
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                  activeFilter === cat
                    ? "bg-rail-accent/20 border-rail-accent/40 text-rail-accent"
                    : "border-rail-border/50 text-rail-muted hover:text-white hover:border-rail-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredSuggested.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.label)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rail-border/30 transition-colors group"
              >
                <span className="text-sm flex-shrink-0">{s.icon}</span>
                <span className="text-xs text-rail-muted group-hover:text-rail-text transition-colors truncate">{s.label}</span>
                <ChevronRight size={10} className="text-rail-border group-hover:text-rail-muted ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* AI model info */}
        <div className="panel-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-rail-yellow" />
            <span className="text-xs font-semibold text-white">AI Stack</span>
          </div>
          <div className="space-y-2 text-[10px] font-mono">
            {[
              { label: "Language Model", value: "LangGraph + Gemini", color: "text-rail-purple" },
              { label: "Delay Prediction", value: "XGBoost + LSTM",   color: "text-rail-accent" },
              { label: "Congestion Model", value: "Random Forest",    color: "text-rail-green"  },
              { label: "Weather API",      value: "OpenWeatherMap",   color: "text-sky-400"     },
              { label: "Refresh Rate",     value: "5 min live",       color: "text-yellow-400"  },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-rail-muted">{item.label}</span>
                <span className={item.color}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
