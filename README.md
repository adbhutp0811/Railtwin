# RailTwin AI

**Predictive Digital Twin Dashboard for Indian Railway Operations**

A dark-themed, single-page application that simulates real-time monitoring, forecasting, and decision-support for the New Delhi railway network. Built with React, featuring interactive maps, AI-powered delay/congestion predictions, what-if simulation engine, and a conversational AI copilot.

## Features

- **Overview Dashboard** — Live KPIs, delay/passenger charts, corridor risk assessment, AI predictions, weather widget, alert ticker
- **Delhi Railway Map** — Interactive Leaflet map with stations, routes, and animated train markers across India
- **Delay Prediction** — AI-powered delay forecasting with model selection (XGBoost / LSTM / RF), feature importance, and weather impact analysis
- **Congestion Prediction** — Station congestion monitoring with radial gauges, passenger flow charts, and AI recommendations
- **Simulation Engine** — What-if scenario simulator for disruptions (rainfall, platform conflict, maintenance, equipment failure) with cascade impact analysis
- **Weather Dashboard** — Full OpenWeatherMap integration: current conditions, 72-hour forecast, per-station weather grid, AQI, alerts, seasonal calendar
- **AI Copilot** — Conversational assistant with 50+ query patterns, rich responses (tables, charts, metrics, alerts), and live weather context

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18, Vite 5 |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Maps | Leaflet 1.9 (CartoDB dark tiles) |
| Icons | Lucide React |
| Weather | OpenWeatherMap API |
| Animation | Framer Motion |
| Utility | clsx |
| Deployment | Vercel / Render |

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── main.jsx                # App entry point
├── App.jsx                 # Root layout with routing
├── index.css               # Global styles
├── components/             # Reusable UI components
│   ├── Sidebar.jsx
│   ├── topBar.jsx
│   ├── SectionHeader.jsx
│   ├── MetricCard.jsx
│   └── RiskBadge.jsx
├── pages/                  # Page-level components
│   ├── Dashboard.jsx
│   ├── RailwayMap.jsx
│   ├── DelayPrediction.jsx
│   ├── CongestionPrediction.jsx
│   ├── SimulationEngine.jsx
│   ├── WeatherDashboard.jsx
│   └── AICopilot.jsx
├── context/                # React context providers
│   └── WeatherContext.jsx
├── hooks/                  # Custom hooks
│   └── useWeather.js
└── data/                   # Static data files
    ├── railwayData.js
    ├── delhiRailwayData.js
    ├── indiaMapData.js
    └── copilotKnowledge.js
```

## Configuration

- **Weather API** — Add your OpenWeatherMap API key in `src/hooks/useWeather.js` (replace `4e248af...` with your own key)
- **Deployment** — `vercel.json` for Vercel, `render.yaml` for Render
- **Vite** — Configured in `vite.config.js` (host `0.0.0.0:5173`)

## License

MIT
