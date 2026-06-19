import { useState, useEffect, useCallback, useRef } from "react";

// ─── Real Delhi Railway Station Coordinates ────────────────────────────────
const DELHI_STATIONS = {
  "New Delhi (NDLS)":         { lat: 28.6419, lon: 77.2194, zone: "NR" },
  "Old Delhi (DLI)":          { lat: 28.6581, lon: 77.2300, zone: "NR" },
  "Hazrat Nizamuddin (NZM)":  { lat: 28.5894, lon: 77.2519, zone: "NR" },
  "Anand Vihar (ANVT)":       { lat: 28.6469, lon: 77.3159, zone: "NR" },
  "Sarai Rohilla (DEE)":      { lat: 28.6692, lon: 77.1908, zone: "NR" },
  "Ghaziabad (GZB)":          { lat: 28.6692, lon: 77.4538, zone: "NR" },
  "Faridabad (FDB)":          { lat: 28.4089, lon: 77.3178, zone: "NR" },
  "Gurugram (GGN)":           { lat: 28.4595, lon: 77.0266, zone: "NR" },
};

// Primary Delhi coordinate (Connaught Place)
const DELHI_COORD = { lat: 28.6139, lon: 77.2090, city: "New Delhi" };

// OpenWeatherMap free API key
const API_KEY = "4e248af901f569b9dda55692ae6a2fe3";
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// ─── Weather code → icon/label/severity ───────────────────────────────────
function parseWeatherCode(code, description) {
  if (code >= 200 && code < 300) return { icon: "⛈️",  label: "Thunderstorm",   severity: "critical" };
  if (code >= 300 && code < 400) return { icon: "🌦️",  label: "Drizzle",        severity: "medium"   };
  if (code >= 500 && code < 510) return { icon: "🌧️",  label: "Rain",           severity: "high"     };
  if (code === 511)               return { icon: "🌨️",  label: "Freezing Rain",  severity: "critical" };
  if (code >= 511 && code < 600) return { icon: "🌧️",  label: "Heavy Rain",     severity: "high"     };
  if (code >= 600 && code < 700) return { icon: "❄️",   label: "Snow",           severity: "high"     };
  if (code === 701)               return { icon: "🌫️",  label: "Mist",           severity: "medium"   };
  if (code === 711)               return { icon: "🌫️",  label: "Smoke",          severity: "high"     };
  if (code === 721)               return { icon: "🌫️",  label: "Haze",           severity: "medium"   };
  if (code === 731 || code === 761) return { icon: "🌪️", label: "Dust Storm",    severity: "critical" };
  if (code === 741)               return { icon: "🌫️",  label: "Fog",            severity: "high"     };
  if (code === 751 || code === 762) return { icon: "🌫️", label: "Sand/Ash",      severity: "high"     };
  if (code >= 700 && code < 800)  return { icon: "🌫️",  label: "Fog/Haze",      severity: "medium"   };
  if (code === 800)               return { icon: "☀️",   label: "Clear Sky",     severity: "low"      };
  if (code === 801)               return { icon: "🌤️",  label: "Few Clouds",    severity: "low"      };
  if (code === 802)               return { icon: "⛅",   label: "Partly Cloudy", severity: "low"      };
  if (code >= 803)                return { icon: "☁️",   label: "Overcast",      severity: "low"      };
  return { icon: "🌡️", label: description || "Unknown", severity: "low" };
}

// ─── Delhi-specific AQI category ──────────────────────────────────────────
function getAQICategory(aqi) {
  if (aqi === 1) return { label: "Good",       color: "text-green-400",  bg: "bg-green-500/10"  };
  if (aqi === 2) return { label: "Fair",       color: "text-yellow-400", bg: "bg-yellow-500/10" };
  if (aqi === 3) return { label: "Moderate",   color: "text-orange-400", bg: "bg-orange-500/10" };
  if (aqi === 4) return { label: "Poor",       color: "text-red-400",    bg: "bg-red-500/10"    };
  if (aqi === 5) return { label: "Very Poor",  color: "text-purple-400", bg: "bg-purple-500/10" };
  return { label: "Unknown", color: "text-rail-muted", bg: "bg-rail-card" };
}

// ─── Delhi-specific railway impact analysis ───────────────────────────────
function generateDelhiImpact(weather) {
  const impacts = [];
  const { code, windSpeed, visibility, temp, humidity, feelsLike } = weather;

  // Thunderstorm
  if (code >= 200 && code < 300) {
    impacts.push({ type: "critical", msg: "⛈️ Thunderstorm — speed restrictions on Delhi-Ghaziabad & Delhi-Faridabad corridors" });
    impacts.push({ type: "high",     msg: "Lightning risk — outdoor staff at NDLS, NZM platforms to seek shelter immediately" });
    impacts.push({ type: "high",     msg: "OHE (Overhead Equipment) vulnerability — monitor catenary tension on ML-1 & ML-3" });
  }
  // Rain
  if (code >= 500 && code < 600) {
    impacts.push({ type: "high",     msg: "🌧️ Rainfall — signal interference risk on Ring Railway & Eastern Corridor" });
    impacts.push({ type: "medium",   msg: "Track adhesion reduced — recommended speed limit 90 km/h on all Delhi corridors" });
    impacts.push({ type: "medium",   msg: "Platform flooding risk at Old Delhi (DLI) — low-lying platform 1 & 2 monitoring active" });
  }
  // Dust storm (very common in Delhi)
  if (code === 731 || code === 761 || code === 751) {
    impacts.push({ type: "critical", msg: "🌪️ Dust storm — immediate speed restriction to 30 km/h across all Delhi lines" });
    impacts.push({ type: "critical", msg: "Visibility critically low — manual block working activated on all sections" });
    impacts.push({ type: "high",     msg: "Pantograph damage risk — monitor OHE at Ghaziabad & Anand Vihar sections" });
  }
  // Fog (major Delhi winter issue)
  if (code === 741 || code === 721 || code === 701) {
    impacts.push({ type: "high",     msg: "🌫️ Fog/Haze — Fog Safety Device (FSD) activated on all Delhi-bound trains" });
    impacts.push({ type: "high",     msg: "Visibility-based speed restrictions: <200m viz → 30 km/h; 200–500m → 60 km/h" });
    impacts.push({ type: "medium",   msg: "Delays expected at NDLS, NZM — cascade effect on outstation trains" });
  }
  // Smoke/haze (Delhi pollution)
  if (code === 711) {
    impacts.push({ type: "high",     msg: "🌫️ Smoke/Pollution haze — reduced visibility on open-line sections" });
    impacts.push({ type: "medium",   msg: "Air quality advisory for platform staff — N95 masks recommended" });
  }
  // Wind
  if (windSpeed > 60) {
    impacts.push({ type: "critical", msg: `💨 Extreme wind ${windSpeed} km/h — suspend all freight operations on Delhi Ring Railway` });
    impacts.push({ type: "critical", msg: "OHE blow-off risk — emergency inspection teams deployed at Sarai Rohilla depot" });
  } else if (windSpeed > 40) {
    impacts.push({ type: "high",     msg: `💨 Strong wind ${windSpeed} km/h — speed restrictions on viaducts & elevated sections` });
  } else if (windSpeed > 25) {
    impacts.push({ type: "medium",   msg: `💨 Moderate wind ${windSpeed} km/h — monitor overhead line tension at Ghaziabad section` });
  }
  // Visibility
  if (visibility < 0.2) {
    impacts.push({ type: "critical", msg: `👁️ Visibility ${(visibility * 1000).toFixed(0)}m — all trains operating under manual block system` });
  } else if (visibility < 1) {
    impacts.push({ type: "critical", msg: `👁️ Visibility ${visibility} km — Fog Safety Device mandatory, max speed 30 km/h` });
  } else if (visibility < 3) {
    impacts.push({ type: "high",     msg: `👁️ Low visibility ${visibility} km — reduced approach speeds, AWS system active` });
  }
  // Extreme heat (Delhi summer)
  if (temp > 45) {
    impacts.push({ type: "critical", msg: `🌡️ Extreme heat ${temp}°C — track buckling ALERT on ML-1 (Delhi–Ghaziabad)` });
    impacts.push({ type: "critical", msg: "Emergency speed restriction 60 km/h on all exposed track sections" });
    impacts.push({ type: "high",     msg: "AC coach failures likely — maintenance teams on standby at all terminals" });
  } else if (temp > 40) {
    impacts.push({ type: "high",     msg: `🌡️ High heat ${temp}°C — track buckling risk, speed limit 100 km/h on sun-facing sections` });
    impacts.push({ type: "medium",   msg: "Passenger heat stress advisory — additional water kiosks deployed at NDLS & NZM" });
  } else if (temp > 35) {
    impacts.push({ type: "medium",   msg: `🌡️ Hot conditions ${temp}°C — monitor track geometry on Faridabad & Gurugram sections` });
  }
  // Cold (Delhi winter)
  if (temp < 5) {
    impacts.push({ type: "high",     msg: `❄️ Cold wave ${temp}°C — track contraction monitoring active on all steel bridges` });
    impacts.push({ type: "medium",   msg: "Point & crossing lubrication required at Ghaziabad, Anand Vihar yards" });
  }
  // Feels like extreme
  if (feelsLike > 48) {
    impacts.push({ type: "high",     msg: `🥵 Feels like ${feelsLike}°C — outdoor maintenance work suspended 12:00–16:00` });
  }
  // High humidity
  if (humidity > 90 && code < 500) {
    impacts.push({ type: "medium",   msg: `💧 High humidity ${humidity}% — signal relay room dehumidifiers activated at DLI, NDLS` });
  }

  if (impacts.length === 0) {
    impacts.push({ type: "low", msg: "✅ No significant weather impacts — normal operations across all Delhi corridors" });
  }
  return impacts;
}

// ─── Delay estimate (Delhi context) ──────────────────────────────────────
function estimateDelhiDelay(weather) {
  let delay = 0;
  const { code, windSpeed, visibility, temp } = weather;
  if (code >= 200 && code < 300) delay += 20; // thunderstorm
  else if (code >= 500 && code < 600) delay += 10; // rain
  else if (code >= 600 && code < 700) delay += 15; // snow
  else if (code === 731 || code === 761) delay += 25; // dust storm
  else if (code === 741) delay += 18; // fog
  else if (code === 721 || code === 701 || code === 711) delay += 8; // haze/mist/smoke
  if (windSpeed > 60) delay += 15;
  else if (windSpeed > 40) delay += 8;
  else if (windSpeed > 25) delay += 3;
  if (visibility < 0.2) delay += 20;
  else if (visibility < 1) delay += 12;
  else if (visibility < 3) delay += 6;
  if (temp < 5) delay += 8;
  else if (temp > 45) delay += 12;
  else if (temp > 40) delay += 6;
  return Math.round(delay);
}

// ─── Fetch current weather ────────────────────────────────────────────────
async function fetchWeatherForCoord(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const code = data.weather[0].id;
  const parsed = parseWeatherCode(code, data.weather[0].description);
  const windSpeed = Math.round((data.wind?.speed || 0) * 3.6);
  const visibility = parseFloat(((data.visibility || 10000) / 1000).toFixed(1));
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const dewPoint = Math.round(temp - ((100 - humidity) / 5));
  const windDir = data.wind?.deg || 0;
  const windDirLabel = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(windDir / 22.5) % 16];
  const clouds = data.clouds?.all || 0;
  const sunrise = data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "--";
  const sunset  = data.sys?.sunset  ? new Date(data.sys.sunset  * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "--";
  const cityName = data.name || "Delhi";
  const uvIndex = data.uvi || null;

  const weatherObj = { code, windSpeed, visibility, temp, feelsLike, humidity };
  const impacts = generateDelhiImpact(weatherObj);
  const delayEstimate = estimateDelhiDelay(weatherObj);

  return {
    condition: parsed.label,
    icon: parsed.icon,
    severity: parsed.severity,
    temp,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    windDir: windDirLabel,
    windDeg: windDir,
    visibility,
    dewPoint,
    clouds,
    sunrise,
    sunset,
    cityName,
    uvIndex,
    description: data.weather[0].description,
    impacts,
    delayEstimate,
    code,
    raw: data,
    fetchedAt: new Date(),
  };
}

// ─── Fetch 5-day/3-hour forecast ──────────────────────────────────────────
async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=24`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  return (data.list || []).map((item) => {
    const code = item.weather[0].id;
    const parsed = parseWeatherCode(code, item.weather[0].description);
    const windSpeed = Math.round((item.wind?.speed || 0) * 3.6);
    const dt = new Date(item.dt * 1000);
    return {
      time: dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }),
      date: dt.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", timeZone: "Asia/Kolkata" }),
      timestamp: item.dt,
      temp: Math.round(item.main.temp),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      feels: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed,
      windDeg: item.wind?.deg || 0,
      condition: parsed.label,
      icon: parsed.icon,
      severity: parsed.severity,
      code,
      pop: Math.round((item.pop || 0) * 100),
      clouds: item.clouds?.all || 0,
      visibility: parseFloat(((item.visibility || 10000) / 1000).toFixed(1)),
    };
  });
}

// ─── Fetch Air Quality Index (Delhi is famous for AQI issues) ─────────────
async function fetchAQI(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const item = data.list?.[0];
    if (!item) return null;
    const aqi = item.main.aqi;
    const cat = getAQICategory(aqi);
    return {
      aqi,
      label: cat.label,
      color: cat.color,
      bg: cat.bg,
      components: {
        co:   item.components.co?.toFixed(1),
        no2:  item.components.no2?.toFixed(1),
        o3:   item.components.o3?.toFixed(1),
        pm2_5: item.components.pm2_5?.toFixed(1),
        pm10:  item.components.pm10?.toFixed(1),
        so2:   item.components.so2?.toFixed(1),
      },
    };
  } catch {
    return null;
  }
}

// ─── Main hook ────────────────────────────────────────────────────────────
export function useWeather() {
  const [networkWeather, setNetworkWeather] = useState(null);
  const [stationWeather, setStationWeather] = useState({});
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const timerRef = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Delhi network weather + forecast + AQI in parallel
      const [nw, fc, aqiData] = await Promise.all([
        fetchWeatherForCoord(DELHI_COORD.lat, DELHI_COORD.lon),
        fetchForecast(DELHI_COORD.lat, DELHI_COORD.lon),
        fetchAQI(DELHI_COORD.lat, DELHI_COORD.lon),
      ]);
      setNetworkWeather(nw);
      setForecast(fc);
      setAqi(aqiData);

      // Fetch per-station weather (parallel, best-effort)
      const stationEntries = Object.entries(DELHI_STATIONS);
      const results = await Promise.allSettled(
        stationEntries.map(([name, coords]) =>
          fetchWeatherForCoord(coords.lat, coords.lon).then((w) => ({ name, w }))
        )
      );
      const sw = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") sw[r.value.name] = r.value.w;
      });
      setStationWeather(sw);
      setLastUpdated(new Date());
      setRefreshCount((c) => c + 1);
    } catch (err) {
      setError(err.message);
      setNetworkWeather(getDelhiMockWeather());
      setForecast(getDelhiMockForecast());
      setAqi(getMockAQI());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    timerRef.current = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchAll]);

  return {
    networkWeather,
    stationWeather,
    forecast,
    aqi,
    loading,
    error,
    lastUpdated,
    refreshCount,
    refresh: fetchAll,
    city: "New Delhi",
    timezone: "Asia/Kolkata",
  };
}

// ─── Delhi mock fallback ──────────────────────────────────────────────────
function getDelhiMockWeather() {
  const now = new Date();
  const hour = now.getHours();
  // Simulate realistic Delhi conditions based on time of day
  const isHot = hour >= 11 && hour <= 16;
  const isMorning = hour >= 5 && hour <= 9;
  return {
    condition: isMorning ? "Haze" : isHot ? "Clear Sky" : "Partly Cloudy",
    icon: isMorning ? "🌫️" : isHot ? "☀️" : "⛅",
    severity: isMorning ? "medium" : "low",
    temp: isHot ? 38 : isMorning ? 26 : 31,
    feelsLike: isHot ? 42 : isMorning ? 28 : 33,
    humidity: isHot ? 45 : 68,
    pressure: 1003,
    windSpeed: 14,
    windDir: "NW",
    windDeg: 315,
    visibility: isMorning ? 3.5 : 8.0,
    dewPoint: 22,
    clouds: isHot ? 10 : 35,
    sunrise: "05:42",
    sunset: "19:18",
    cityName: "New Delhi",
    uvIndex: isHot ? 9 : 4,
    description: isMorning ? "morning haze" : isHot ? "clear sky" : "partly cloudy",
    impacts: [
      isHot
        ? { type: "medium", msg: "🌡️ High temperature 38°C — track expansion monitoring active on all Delhi corridors" }
        : { type: "low", msg: "✅ No significant weather impacts — normal operations across all Delhi corridors" }
    ],
    delayEstimate: isHot ? 4 : 0,
    code: isMorning ? 721 : isHot ? 800 : 802,
    fetchedAt: new Date(),
  };
}

function getDelhiMockForecast() {
  const icons =  ["☀️", "🌤️", "⛅", "🌫️", "☀️", "🌤️", "⛅", "🌧️", "⛈️", "🌧️", "⛅", "🌤️"];
  const labels = ["Clear", "Few Clouds", "Partly Cloudy", "Haze", "Clear", "Few Clouds", "Overcast", "Rain", "Thunderstorm", "Rain", "Overcast", "Few Clouds"];
  const temps =  [32, 35, 38, 40, 41, 39, 36, 32, 28, 27, 29, 31];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    return {
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }),
      date: d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" }),
      timestamp: Math.floor(d.getTime() / 1000),
      temp: temps[i] || 33,
      tempMin: (temps[i] || 33) - 3,
      tempMax: (temps[i] || 33) + 2,
      feels: (temps[i] || 33) + 3,
      humidity: 45 + Math.round(Math.random() * 30),
      pressure: 1002 + Math.round(Math.random() * 5),
      windSpeed: 10 + Math.round(Math.random() * 20),
      windDeg: Math.round(Math.random() * 360),
      condition: labels[i],
      icon: icons[i],
      severity: i === 8 ? "critical" : i === 7 || i === 9 ? "high" : "low",
      code: i === 8 ? 211 : i === 7 || i === 9 ? 501 : 800,
      pop: i >= 7 && i <= 9 ? 70 + Math.round(Math.random() * 25) : Math.round(Math.random() * 20),
      clouds: Math.round(Math.random() * 60),
      visibility: i >= 7 && i <= 9 ? 2 + Math.random() * 3 : 6 + Math.random() * 4,
    };
  });
}

function getMockAQI() {
  return {
    aqi: 4,
    label: "Poor",
    color: "text-red-400",
    bg: "bg-red-500/10",
    components: {
      co: "1245.3",
      no2: "68.4",
      o3: "42.1",
      pm2_5: "89.3",
      pm10: "142.7",
      so2: "12.4",
    },
  };
}
