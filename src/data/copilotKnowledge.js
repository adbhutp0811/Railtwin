// ─── RailTwin AI Copilot Knowledge Base ───────────────────────────────────────
// Full response library covering every railway operations topic

export const knowledgeBase = [
  // ── DELAYS ──────────────────────────────────────────────────────────────────
  {
    patterns: ["delay", "late", "behind schedule", "delayed train", "how late"],
    category: "delays",
    response: {
      type: "rich",
      title: "Current Delay Analysis",
      summary: "4 trains are currently experiencing delays. Average network delay is **6.4 minutes** — elevated above the 3.2-min baseline.",
      sections: [
        {
          heading: "🚨 Critical Delays",
          type: "table",
          rows: [
            { Train: "T003 Intercity 003", Route: "South Line (R4)", Delay: "14 min", Status: "STOPPED", Cause: "Track maintenance + congestion" },
            { Train: "T005 Airport 005", Route: "Airport Spur (R5)", Delay: "9 min", Status: "DELAYED", Cause: "High passenger volume" },
            { Train: "T002 Express 002", Route: "East Line (R2)", Delay: "7 min", Status: "DELAYED", Cause: "Signal interference" },
          ],
        },
        {
          heading: "📊 Delay Forecast (Next 3 Hours)",
          type: "forecast",
          items: [
            { label: "Southbridge", value: 18, unit: "min", trend: "up", color: "red" },
            { label: "Northgate", value: 12, unit: "min", trend: "up", color: "orange" },
            { label: "Airport Express", value: 11, unit: "min", trend: "stable", color: "orange" },
            { label: "Eastport Terminal", value: 6, unit: "min", trend: "stable", color: "yellow" },
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "high",
          text: "Reroute T003 via West Line immediately. Estimated delay reduction: 8 minutes. Notify downstream passengers at Southbridge via real-time app update.",
        },
      ],
      tags: ["4 Delayed Trains", "Avg +6.4 min", "AI Action Ready"],
    },
  },

  // ── CONGESTION ───────────────────────────────────────────────────────────────
  {
    patterns: ["congestion", "crowd", "overcrowded", "packed", "capacity", "passenger load", "busy station"],
    category: "congestion",
    response: {
      type: "rich",
      title: "Station Congestion Report",
      summary: "**2 stations are at critical capacity** (>90%). Immediate intervention required at Northgate and Southbridge.",
      sections: [
        {
          heading: "🔴 Capacity Status — All Stations",
          type: "bars",
          items: [
            { label: "Northgate", value: 96, color: "red", status: "CRITICAL" },
            { label: "Southbridge", value: 95, color: "red", status: "CRITICAL" },
            { label: "Airport Express", value: 89, color: "orange", status: "HIGH" },
            { label: "Central Hub", value: 81, color: "orange", status: "MEDIUM" },
            { label: "Eastport Terminal", value: 72, color: "yellow", status: "MEDIUM" },
            { label: "Metro Park", value: 60, color: "yellow", status: "MEDIUM" },
            { label: "Westfield Jct.", value: 45, color: "green", status: "LOW" },
            { label: "Riverside Halt", value: 38, color: "green", status: "LOW" },
          ],
        },
        {
          heading: "⏱️ Peak Congestion Times",
          type: "list",
          items: [
            "Northgate: Peak at **08:15** — 1,920 / 2,000 passengers",
            "Southbridge: Peak at **08:45** — 2,100 / 2,200 passengers",
            "Airport Express: Peak at **09:00** — 3,100 / 3,500 passengers",
            "Central Hub: Peak at **08:30** — 2,840 / 3,500 passengers",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "critical",
          text: "Deploy crowd flow barriers at Northgate platforms 2 & 3. Issue passenger advisory to divert 400+ passengers to Metro Park via Loop West. Activate overflow protocol at Southbridge.",
        },
      ],
      tags: ["2 Critical Stations", "Northgate 96%", "Southbridge 95%"],
    },
  },

  // ── VULNERABLE ROUTE ─────────────────────────────────────────────────────────
  {
    patterns: ["vulnerable route", "most at risk route", "weakest route", "risky route", "route risk"],
    category: "route_risk",
    response: {
      type: "rich",
      title: "Route Vulnerability Analysis",
      summary: "The **South Line (R4)** is the most vulnerable route today with a composite Risk Score of **91/100**.",
      sections: [
        {
          heading: "📊 Route Risk Scores",
          type: "bars",
          items: [
            { label: "South Line (R4)", value: 91, color: "red", status: "CRITICAL" },
            { label: "Airport Spur (R5)", value: 78, color: "orange", status: "HIGH" },
            { label: "North Line (R1)", value: 74, color: "orange", status: "HIGH" },
            { label: "East Line (R2)", value: 62, color: "yellow", status: "MEDIUM" },
            { label: "Loop West (R7)", value: 55, color: "yellow", status: "MEDIUM" },
            { label: "West Line (R3)", value: 28, color: "green", status: "LOW" },
            { label: "River Line (R6)", value: 22, color: "green", status: "LOW" },
            { label: "Loop South (R8)", value: 18, color: "green", status: "LOW" },
          ],
        },
        {
          heading: "🔍 South Line Risk Factors",
          type: "list",
          items: [
            "🚆 Train T003 stopped — 14-minute delay propagating",
            "🔧 Planned track maintenance window active",
            "🌧️ Rainfall reducing track adhesion by 18%",
            "👥 Southbridge at 95% capacity (2,100 / 2,200)",
            "⚠️ Single-track operation reducing throughput by 40%",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "critical",
          text: "Activate South Line contingency plan: Deploy 3 replacement buses (Southbridge ↔ Central Hub), reroute T003 via West Line, and pre-position maintenance crew at Signal Box 7.",
        },
      ],
      tags: ["South Line Risk: 91", "T003 Stopped", "Action Required"],
    },
  },

  // ── WEATHER ──────────────────────────────────────────────────────────────────
  {
    patterns: ["weather", "rain", "rainfall", "wind", "storm", "visibility", "temperature", "humidity"],
    category: "weather",
    response: {
      type: "rich",
      title: "Weather Impact Assessment",
      summary: "**Heavy rainfall advisory active.** Current conditions are causing signal interference and reduced track adhesion across 2 corridors.",
      sections: [
        {
          heading: "🌧️ Current Conditions",
          type: "metrics",
          items: [
            { label: "Condition", value: "Heavy Rain", icon: "🌧️" },
            { label: "Temperature", value: "14°C", icon: "🌡️" },
            { label: "Wind Speed", value: "32 km/h", icon: "💨" },
            { label: "Visibility", value: "4.2 km", icon: "👁️" },
            { label: "Humidity", value: "88%", icon: "💧" },
            { label: "Alert Level", value: "AMBER", icon: "⚠️" },
          ],
        },
        {
          heading: "🚆 Operational Impact",
          type: "list",
          items: [
            "North Line: Signal interference detected — +5 min delay forecast",
            "South Line: Track adhesion -18% — speed restriction below 100 km/h",
            "Airport Spur: Crosswind advisory — reduced speed near elevated sections",
            "Visibility 4.2 km: Manual signal checks required at 3 junctions",
          ],
        },
        {
          heading: "📅 24-Hour Forecast",
          type: "forecast",
          items: [
            { label: "Next 2 Hours", value: "Heavy Rain", unit: "", trend: "stable", color: "red" },
            { label: "Afternoon", value: "Moderate Rain", unit: "", trend: "down", color: "orange" },
            { label: "Evening", value: "Light Showers", unit: "", trend: "down", color: "yellow" },
            { label: "Night", value: "Clearing", unit: "", trend: "down", color: "green" },
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "high",
          text: "Issue speed restriction advisory for North and South Lines. Activate weather-contingency timetable. Alert signal maintenance teams for proactive checks at junctions J4, J7, and J11.",
        },
      ],
      tags: ["Heavy Rain", "2 Corridors Affected", "Speed Restriction"],
    },
  },

  // ── OPERATOR ACTIONS ─────────────────────────────────────────────────────────
  {
    patterns: ["action", "recommend", "what should", "operator", "what to do", "steps", "fix", "resolve", "intervention"],
    category: "actions",
    response: {
      type: "rich",
      title: "Operator Action Plan",
      summary: "AI has generated **7 prioritized actions** based on current network state. Estimated delay reduction: **9.2 minutes** if all actions are executed.",
      sections: [
        {
          heading: "🚨 Immediate Actions (Next 15 Minutes)",
          type: "actions",
          items: [
            { priority: "P1", action: "Reroute T003 via West Line", impact: "−8 min delay", station: "Southbridge → Central Hub", urgency: "critical" },
            { priority: "P2", action: "Deploy crowd barriers at Northgate Platforms 2 & 3", impact: "−12% congestion", station: "Northgate", urgency: "critical" },
            { priority: "P3", action: "Issue passenger advisory — divert to Metro Park", impact: "−400 passengers", station: "Northgate / Southbridge", urgency: "high" },
          ],
        },
        {
          heading: "⚡ Short-Term Actions (Next 1 Hour)",
          type: "actions",
          items: [
            { priority: "P4", action: "Alert signal team — Airport Express delay rising", impact: "Prevent +4 min", station: "Airport Express", urgency: "high" },
            { priority: "P5", action: "Apply speed restriction — North & South Lines", impact: "Safety compliance", station: "All affected lines", urgency: "high" },
            { priority: "P6", action: "Pre-position maintenance crew at Signal Box 7", impact: "Preventive", station: "Eastport Terminal", urgency: "medium" },
          ],
        },
        {
          heading: "📋 Planned Actions (Today)",
          type: "actions",
          items: [
            { priority: "P7", action: "Review evening timetable for South Line recovery", impact: "Schedule normalization", station: "South Line", urgency: "low" },
          ],
        },
        {
          heading: "🤖 AI Confidence",
          type: "alert",
          severity: "info",
          text: "Action plan generated with 87% confidence. Based on historical incident data (2,847 similar events), executing P1–P3 within 15 minutes reduces cascade probability by 73%.",
        },
      ],
      tags: ["7 Actions", "P1–P3 Urgent", "87% AI Confidence"],
    },
  },

  // ── NETWORK HEALTH ───────────────────────────────────────────────────────────
  {
    patterns: ["network health", "overall status", "system status", "how is the network", "network overview", "health score"],
    category: "network",
    response: {
      type: "rich",
      title: "Network Health Overview",
      summary: "Overall network health is **72/100** — degraded from the daily baseline of 94. Primary causes: South Line stoppage and Northgate congestion.",
      sections: [
        {
          heading: "📊 Key Performance Indicators",
          type: "metrics",
          items: [
            { label: "Network Health", value: "72 / 100", icon: "💚" },
            { label: "On-Time Rate", value: "67%", icon: "⏱️" },
            { label: "Avg Delay", value: "6.4 min", icon: "🕐" },
            { label: "Active Trains", value: "6 / 8", icon: "🚆" },
            { label: "Active Alerts", value: "4", icon: "🚨" },
            { label: "Passengers Today", value: "48,200", icon: "👥" },
          ],
        },
        {
          heading: "🔴 Active Alerts",
          type: "list",
          items: [
            "🔴 CRITICAL — T003 stopped on South Line (14-min delay)",
            "🔴 CRITICAL — Northgate at 96% capacity",
            "🟠 HIGH — Southbridge at 95% capacity",
            "🟠 HIGH — Airport Express delayed 9 minutes",
          ],
        },
        {
          heading: "✅ Healthy Systems",
          type: "list",
          items: [
            "✅ West Line (R3) — On time, 28% risk",
            "✅ River Line (R6) — On time, 22% risk",
            "✅ Loop South (R8) — On time, 18% risk",
            "✅ Westfield Junction — 45% capacity, normal",
            "✅ Riverside Halt — 38% capacity, normal",
          ],
        },
      ],
      tags: ["Health: 72/100", "On-Time: 67%", "4 Active Alerts"],
    },
  },

  // ── SPECIFIC STATION ─────────────────────────────────────────────────────────
  {
    patterns: ["northgate", "north gate"],
    category: "station",
    response: {
      type: "rich",
      title: "Northgate Station — Live Status",
      summary: "**Northgate is at CRITICAL status** — 96% capacity with a rising trend. Immediate intervention required.",
      sections: [
        {
          heading: "📍 Station Details",
          type: "metrics",
          items: [
            { label: "Status", value: "CRITICAL", icon: "🔴" },
            { label: "Passengers", value: "1,920 / 2,000", icon: "👥" },
            { label: "Capacity", value: "96%", icon: "📊" },
            { label: "Platforms", value: "4", icon: "🚉" },
            { label: "Current Delay", value: "7 min", icon: "⏱️" },
            { label: "Predicted Delay", value: "12 min", icon: "🔮" },
          ],
        },
        {
          heading: "🔮 AI Predictions",
          type: "list",
          items: [
            "Peak congestion: **08:15** (80 passengers/min arrival rate)",
            "Capacity breach (100%): **08:22** if no intervention",
            "Delay escalation: 7 → 12 min within 45 minutes",
            "Cause: Heavy rainfall + signal fault on North Line",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "critical",
          text: "IMMEDIATE: Deploy crowd barriers on Platforms 2 & 3. Issue app advisory to reroute passengers via Westfield Jct. Request 2 additional staff from Central Hub. Estimated intervention effect: −18% congestion within 20 minutes.",
        },
      ],
      tags: ["Northgate CRITICAL", "96% Capacity", "Delay: 7→12 min"],
    },
  },

  {
    patterns: ["southbridge", "south bridge"],
    category: "station",
    response: {
      type: "rich",
      title: "Southbridge Station — Live Status",
      summary: "**Southbridge is at CRITICAL status** — T003 is stopped here with a 14-minute delay. Congestion at 95% and rising.",
      sections: [
        {
          heading: "📍 Station Details",
          type: "metrics",
          items: [
            { label: "Status", value: "CRITICAL", icon: "🔴" },
            { label: "Passengers", value: "2,100 / 2,200", icon: "👥" },
            { label: "Capacity", value: "95%", icon: "📊" },
            { label: "Platforms", value: "5", icon: "🚉" },
            { label: "Current Delay", value: "14 min", icon: "⏱️" },
            { label: "Predicted Delay", value: "18 min", icon: "🔮" },
          ],
        },
        {
          heading: "🚆 Stopped Train — T003",
          type: "list",
          items: [
            "Train: Intercity 003 (10 cars, 680 passengers)",
            "Stopped duration: 22 minutes",
            "Cause: Track maintenance + signal fault",
            "Cascading impact: 3 downstream trains delayed",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "critical",
          text: "Activate overflow protocol: Deploy 3 buses on Southbridge ↔ Central Hub corridor. Reroute T003 via alternative track. Passenger advisory issued. Maintenance crew ETA: 18 minutes.",
        },
      ],
      tags: ["Southbridge CRITICAL", "T003 Stopped", "Delay: 14→18 min"],
    },
  },

  {
    patterns: ["central hub", "central station"],
    category: "station",
    response: {
      type: "rich",
      title: "Central Hub — Live Status",
      summary: "**Central Hub is operating at MEDIUM risk** — 81% capacity with stable trend. Monitor closely during peak hours.",
      sections: [
        {
          heading: "📍 Station Details",
          type: "metrics",
          items: [
            { label: "Status", value: "NORMAL", icon: "🟡" },
            { label: "Passengers", value: "2,840 / 3,500", icon: "👥" },
            { label: "Capacity", value: "81%", icon: "📊" },
            { label: "Platforms", value: "8", icon: "🚉" },
            { label: "Current Delay", value: "0 min", icon: "⏱️" },
            { label: "Predicted Delay", value: "2 min", icon: "🔮" },
          ],
        },
        {
          heading: "🔮 AI Predictions",
          type: "list",
          items: [
            "Capacity will reach 88% if T003 passengers divert here",
            "Peak at **08:30** — 2,640 passengers/hour inflow",
            "Platform 3 & 4 most congested — 6-minute dwell times",
            "Risk escalation probability: 34% without intervention",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "medium",
          text: "Monitor Platform 3 & 4 utilization. Pre-position 1 additional staff member. If T003 reroutes through Central Hub, activate overflow protocol on Platforms 6–8.",
        },
      ],
      tags: ["Central Hub NORMAL", "81% Capacity", "Monitor Required"],
    },
  },

  {
    patterns: ["airport", "airport express"],
    category: "station",
    response: {
      type: "rich",
      title: "Airport Express Station — Live Status",
      summary: "**Airport Express is at HIGH risk** — 89% capacity with rising trend. T005 delayed 9 minutes on Airport Spur.",
      sections: [
        {
          heading: "📍 Station Details",
          type: "metrics",
          items: [
            { label: "Status", value: "WARNING", icon: "🟠" },
            { label: "Passengers", value: "3,100 / 3,500", icon: "👥" },
            { label: "Capacity", value: "89%", icon: "📊" },
            { label: "Platforms", value: "6", icon: "🚉" },
            { label: "Current Delay", value: "9 min", icon: "⏱️" },
            { label: "Predicted Delay", value: "11 min", icon: "🔮" },
          ],
        },
        {
          heading: "✈️ Airport Operations Impact",
          type: "list",
          items: [
            "3 flight connections at risk due to 9-minute delay",
            "International terminal queue: 340 passengers waiting",
            "T005 Airport 005: 310 passengers, speed 120 km/h",
            "Crosswind advisory active — speed capped at 110 km/h",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "high",
          text: "Coordinate with airport operations for connection notifications. Deploy express lane for connecting passengers. Alert signal team for T005 priority clearance through Junction J9.",
        },
      ],
      tags: ["Airport WARNING", "89% Capacity", "Flight Risk: 3 Connections"],
    },
  },

  // ── SPECIFIC TRAIN ───────────────────────────────────────────────────────────
  {
    patterns: ["t003", "intercity 003", "stopped train", "which train is stopped"],
    category: "train",
    response: {
      type: "rich",
      title: "Train T003 — Intercity 003",
      summary: "**T003 is currently STOPPED** on the South Line near Southbridge with a 14-minute delay. This is the most critical train incident right now.",
      sections: [
        {
          heading: "🚆 Train Details",
          type: "metrics",
          items: [
            { label: "Status", value: "STOPPED", icon: "🔴" },
            { label: "Route", value: "South Line (R4)", icon: "🛤️" },
            { label: "Delay", value: "14 minutes", icon: "⏱️" },
            { label: "Cars", value: "10", icon: "🚃" },
            { label: "Passengers", value: "680", icon: "👥" },
            { label: "Speed", value: "0 km/h", icon: "💨" },
          ],
        },
        {
          heading: "🔍 Incident Analysis",
          type: "list",
          items: [
            "Stopped at: km 47.3 near Southbridge South Junction",
            "Stop duration: 22 minutes and counting",
            "Primary cause: Track maintenance window + signal fault",
            "Secondary cause: Rainfall-induced track adhesion loss",
            "Cascade impact: 3 following trains delayed 4–9 minutes",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "critical",
          text: "Reroute T003 via West Line (R3) — adds 6 minutes but clears blockage. Deploy emergency bus service for 200 passengers unwilling to wait. ETA for track clearance: 18 minutes (maintenance crew en route).",
        },
      ],
      tags: ["T003 STOPPED", "680 Passengers", "14-min Delay"],
    },
  },

  {
    patterns: ["all trains", "train status", "train positions", "where are the trains", "active trains"],
    category: "trains",
    response: {
      type: "rich",
      title: "All Active Trains — Live Status",
      summary: "**6 trains active** across 5 routes. 2 on-time, 3 delayed, 1 stopped.",
      sections: [
        {
          heading: "🚆 Train Fleet Overview",
          type: "table",
          rows: [
            { Train: "T001 Express 001", Route: "North Line (R1)", Speed: "112 km/h", Delay: "0 min", Status: "ON TIME", Passengers: "420" },
            { Train: "T002 Express 002", Route: "East Line (R2)", Speed: "98 km/h", Delay: "7 min", Status: "DELAYED", Passengers: "380" },
            { Train: "T003 Intercity 003", Route: "South Line (R4)", Speed: "0 km/h", Delay: "14 min", Status: "STOPPED", Passengers: "680" },
            { Train: "T004 Regional 004", Route: "West Line (R3)", Speed: "88 km/h", Delay: "0 min", Status: "ON TIME", Passengers: "210" },
            { Train: "T005 Airport 005", Route: "Airport Spur (R5)", Speed: "120 km/h", Delay: "9 min", Status: "DELAYED", Passengers: "310" },
            { Train: "T006 Metro 006", Route: "Loop South (R8)", Speed: "72 km/h", Delay: "2 min", Status: "MINOR", Passengers: "195" },
          ],
        },
        {
          heading: "🤖 AI Summary",
          type: "alert",
          severity: "high",
          text: "Total passengers on delayed/stopped trains: 1,370. Priority action: resolve T003 stoppage. Combined delay-minutes: 32. Fleet efficiency today: 67%.",
        },
      ],
      tags: ["6 Active Trains", "1 Stopped", "3 Delayed"],
    },
  },

  // ── SIMULATION ───────────────────────────────────────────────────────────────
  {
    patterns: ["simulation", "simulate", "scenario", "what if", "impact analysis"],
    category: "simulation",
    response: {
      type: "rich",
      title: "Simulation Engine — Active Scenarios",
      summary: "**4 scenarios** are loaded in the simulation engine. The Track Maintenance scenario has the highest risk score at **91/100**.",
      sections: [
        {
          heading: "⚡ Active Simulations",
          type: "bars",
          items: [
            { label: "Track Maintenance — South Line", value: 91, color: "red", status: "PLANNED" },
            { label: "Equipment Failure — Signal Box 7", value: 94, color: "red", status: "SIMULATED" },
            { label: "Platform Conflict — Central Hub", value: 85, color: "orange", status: "SIMULATED" },
            { label: "Heavy Rainfall Event", value: 78, color: "orange", status: "ACTIVE" },
          ],
        },
        {
          heading: "📊 Simulation Outcomes",
          type: "list",
          items: [
            "Heavy Rainfall: +8 min avg delay, +23% congestion across 3 stations",
            "Platform Conflict: +12 min avg delay, cascade to 4 downstream stations",
            "Track Maintenance: +15 min avg delay, +31% congestion, single-track ops",
            "Signal Box Failure: +20 min avg delay, +45% congestion, manual operation",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "high",
          text: "Signal Box 7 failure scenario shows highest risk (94/100). Recommend scheduling preventive maintenance this week. Estimated cost of prevention: £2,400 vs. estimated disruption cost: £18,700.",
        },
      ],
      tags: ["4 Scenarios", "Max Risk: 94", "Prevention Recommended"],
    },
  },

  // ── MAINTENANCE ──────────────────────────────────────────────────────────────
  {
    patterns: ["maintenance", "repair", "track condition", "equipment", "signal", "infrastructure"],
    category: "maintenance",
    response: {
      type: "rich",
      title: "Maintenance & Infrastructure Status",
      summary: "**3 maintenance items** require attention. Signal Box 7 is the highest priority — predictive failure probability 67% within 72 hours.",
      sections: [
        {
          heading: "🔧 Maintenance Queue",
          type: "table",
          rows: [
            { Item: "Signal Box 7 — Eastport", Priority: "HIGH", Status: "Scheduled", ETA: "Tomorrow 02:00", Risk: "94/100" },
            { Item: "South Line Track — km 47", Priority: "HIGH", Status: "Active", ETA: "Today 14:00", Risk: "91/100" },
            { Item: "Platform 3 Barrier — Northgate", Priority: "MEDIUM", Status: "Pending", ETA: "This week", Risk: "62/100" },
            { Item: "Rolling Stock T003 — Inspection", Priority: "MEDIUM", Status: "Queued", ETA: "Tonight", Risk: "58/100" },
            { Item: "CCTV System — Southbridge", Priority: "LOW", Status: "Scheduled", ETA: "Next week", Risk: "31/100" },
          ],
        },
        {
          heading: "🤖 Predictive Maintenance AI",
          type: "list",
          items: [
            "Signal Box 7: 67% failure probability within 72 hours (LSTM model)",
            "South Line Track km 47: Adhesion degrading — replace by end of week",
            "T003 Bogies: Vibration anomaly detected — inspect at next depot visit",
          ],
        },
        {
          heading: "🤖 AI Recommendation",
          type: "alert",
          severity: "high",
          text: "Schedule Signal Box 7 maintenance tonight (02:00–04:00 low-traffic window). Estimated cost: £2,400. Avoiding failure saves estimated £18,700 in disruption costs and 4.2 hours of delays.",
        },
      ],
      tags: ["3 High Priority", "Signal Box 7 Risk: 94", "Predictive AI Active"],
    },
  },

  // ── EMERGENCY ────────────────────────────────────────────────────────────────
  {
    patterns: ["emergency", "incident", "accident", "evacuation", "fire", "medical", "security"],
    category: "emergency",
    response: {
      type: "rich",
      title: "Emergency Response Protocol",
      summary: "**No active emergencies** at this time. Emergency response protocols are armed and ready. Last incident: Platform slip at Northgate (3 days ago).",
      sections: [
        {
          heading: "🚨 Emergency Readiness Status",
          type: "metrics",
          items: [
            { label: "Emergency Status", value: "STANDBY", icon: "🟢" },
            { label: "Response Teams", value: "4 Ready", icon: "👮" },
            { label: "Medical Units", value: "2 On-Site", icon: "🏥" },
            { label: "Evacuation Routes", value: "All Clear", icon: "🚪" },
            { label: "CCTV Coverage", value: "94%", icon: "📷" },
            { label: "Last Incident", value: "3 days ago", icon: "📋" },
          ],
        },
        {
          heading: "📋 Emergency Protocols",
          type: "list",
          items: [
            "🔴 Level 1 (Minor): Station staff response — 2-minute SLA",
            "🔴 Level 2 (Major): Emergency services + train hold — 5-minute SLA",
            "🔴 Level 3 (Critical): Full network halt + evacuation — 8-minute SLA",
            "🔴 Level 4 (Catastrophic): Regional emergency services — immediate",
          ],
        },
        {
          heading: "⚠️ Risk Monitoring",
          type: "list",
          items: [
            "Northgate platform crowding: Slip/fall risk elevated (wet conditions)",
            "Southbridge: Passenger frustration index HIGH (14-min delay)",
            "T003 passengers: 680 stranded — welfare check recommended",
          ],
        },
      ],
      tags: ["No Active Emergency", "4 Teams Ready", "Monitoring Active"],
    },
  },

  // ── PERFORMANCE REPORT ───────────────────────────────────────────────────────
  {
    patterns: ["performance", "report", "statistics", "kpi", "metrics", "today's performance", "daily report"],
    category: "performance",
    response: {
      type: "rich",
      title: "Daily Performance Report",
      summary: "Today's network performance is **below target** — on-time rate 67% vs. 92% target. Main driver: South Line stoppage and weather-related delays.",
      sections: [
        {
          heading: "📊 Today vs. Target",
          type: "bars",
          items: [
            { label: "On-Time Rate", value: 67, color: "orange", status: "Target: 92%" },
            { label: "Network Health", value: 72, color: "orange", status: "Target: 90%" },
            { label: "Passenger Satisfaction", value: 61, color: "red", status: "Target: 85%" },
            { label: "Fleet Utilization", value: 75, color: "yellow", status: "Target: 88%" },
            { label: "Platform Punctuality", value: 58, color: "red", status: "Target: 90%" },
          ],
        },
        {
          heading: "📈 Today's Numbers",
          type: "metrics",
          items: [
            { label: "Passengers Today", value: "48,200", icon: "👥" },
            { label: "Trains Operated", value: "6 / 8", icon: "🚆" },
            { label: "Total Delay-Minutes", value: "32 min", icon: "⏱️" },
            { label: "Incidents", value: "1 (T003)", icon: "🚨" },
            { label: "Avg Delay", value: "6.4 min", icon: "🕐" },
            { label: "Cancellations", value: "0", icon: "✅" },
          ],
        },
        {
          heading: "🤖 AI Insight",
          type: "alert",
          severity: "medium",
          text: "Performance degradation is primarily weather-driven (62%) and maintenance-related (38%). Resolving T003 stoppage will recover approximately 14 delay-minutes and improve on-time rate to ~79%. Full recovery expected by 14:00 if current actions are executed.",
        },
      ],
      tags: ["On-Time: 67%", "48,200 Passengers", "Recovery by 14:00"],
    },
  },

  // ── PASSENGER INFO ───────────────────────────────────────────────────────────
  {
    patterns: ["passenger", "traveller", "commuter", "people", "how many people"],
    category: "passengers",
    response: {
      type: "rich",
      title: "Passenger Flow Analysis",
      summary: "**48,200 passengers** served today. Peak morning rush is ongoing — 3 stations approaching critical capacity.",
      sections: [
        {
          heading: "👥 Passenger Distribution",
          type: "bars",
          items: [
            { label: "Airport Express", value: 89, color: "orange", status: "3,100 pax" },
            { label: "Central Hub", value: 81, color: "orange", status: "2,840 pax" },
            { label: "Southbridge", value: 95, color: "red", status: "2,100 pax" },
            { label: "Northgate", value: 96, color: "red", status: "1,920 pax" },
            { label: "Eastport Terminal", value: 72, color: "yellow", status: "1,450 pax" },
            { label: "Metro Park", value: 60, color: "yellow", status: "1,200 pax" },
            { label: "Westfield Jct.", value: 45, color: "green", status: "880 pax" },
            { label: "Riverside Halt", value: 38, color: "green", status: "560 pax" },
          ],
        },
        {
          heading: "⏱️ Peak Hour Analysis",
          type: "list",
          items: [
            "Morning peak: 07:00–09:30 (currently active)",
            "Highest inflow: Central Hub at 2,640 passengers/hour",
            "Stranded passengers (T003): 680 requiring assistance",
            "Diverted passengers (recommended): 400 from Northgate → Metro Park",
          ],
        },
      ],
      tags: ["48,200 Passengers", "Peak Hour Active", "680 Stranded"],
    },
  },

  // ── PREDICTIONS ──────────────────────────────────────────────────────────────
  {
    patterns: ["predict", "forecast", "future", "upcoming", "will happen", "next hour", "this afternoon"],
    category: "predictions",
    response: {
      type: "rich",
      title: "AI Predictions — Next 4 Hours",
      summary: "AI models (XGBoost + LSTM) are forecasting **worsening conditions** in the next 2 hours, followed by gradual recovery from 11:00.",
      sections: [
        {
          heading: "🔮 Delay Forecast",
          type: "forecast",
          items: [
            { label: "09:00–10:00", value: "Peak delays", unit: "+9.8 min avg", trend: "up", color: "red" },
            { label: "10:00–11:00", value: "Plateau", unit: "+7.2 min avg", trend: "stable", color: "orange" },
            { label: "11:00–12:00", value: "Recovery", unit: "+4.8 min avg", trend: "down", color: "yellow" },
            { label: "12:00–13:00", value: "Near normal", unit: "+3.1 min avg", trend: "down", color: "green" },
          ],
        },
        {
          heading: "🔮 Congestion Forecast",
          type: "list",
          items: [
            "Northgate: Will breach 100% at **08:22** without intervention",
            "Southbridge: Delay escalates to 18 min by **09:15**",
            "Airport Express: Stabilizes at 11 min delay by **09:30**",
            "Central Hub: Will reach 88% capacity if T003 passengers divert",
          ],
        },
        {
          heading: "🤖 Model Performance",
          type: "metrics",
          items: [
            { label: "Delay Model (XGBoost)", value: "91.2% accuracy", icon: "🎯" },
            { label: "Congestion Model (LSTM)", value: "88.7% accuracy", icon: "🎯" },
            { label: "Incident Prediction", value: "84.3% accuracy", icon: "🎯" },
            { label: "Data Freshness", value: "< 30 seconds", icon: "⚡" },
          ],
        },
      ],
      tags: ["XGBoost + LSTM", "91.2% Accuracy", "4-Hour Forecast"],
    },
  },

  // ── HELP ─────────────────────────────────────────────────────────────────────
  {
    patterns: ["help", "what can you do", "capabilities", "features", "commands", "how to use"],
    category: "help",
    response: {
      type: "rich",
      title: "RailTwin AI Copilot — Capabilities",
      summary: "I'm your **AI Operations Copilot** for the railway network. I can answer questions about any aspect of operations in real time.",
      sections: [
        {
          heading: "🚆 Train Operations",
          type: "list",
          items: [
            "\"Which trains are delayed?\" — Live delay status for all trains",
            "\"Where is T003?\" — Specific train position and status",
            "\"All train positions\" — Fleet overview with speeds and delays",
          ],
        },
        {
          heading: "🏢 Station Intelligence",
          type: "list",
          items: [
            "\"Northgate status\" — Live station metrics and predictions",
            "\"Which station is most congested?\" — Congestion rankings",
            "\"Passenger flow at Central Hub\" — Detailed passenger data",
          ],
        },
        {
          heading: "⚡ Operations & Planning",
          type: "list",
          items: [
            "\"What actions should operators take?\" — Prioritized action plan",
            "\"Run a simulation\" — Scenario impact analysis",
            "\"Maintenance schedule\" — Infrastructure health and queue",
          ],
        },
        {
          heading: "📊 Analytics & Reports",
          type: "list",
          items: [
            "\"Daily performance report\" — KPIs vs. targets",
            "\"Network health\" — Overall system status",
            "\"Predict next 4 hours\" — AI forecasts",
          ],
        },
      ],
      tags: ["30+ Query Types", "Real-Time Data", "AI Powered"],
    },
  },

  // ── GREETING ─────────────────────────────────────────────────────────────────
  {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "greetings"],
    category: "greeting",
    response: {
      type: "rich",
      title: "Good Morning — Network Briefing",
      summary: "Hello! I'm **RailTwin AI Copilot**. Here's your live network briefing for today.",
      sections: [
        {
          heading: "📊 Network Snapshot",
          type: "metrics",
          items: [
            { label: "Network Health", value: "72 / 100", icon: "💚" },
            { label: "On-Time Rate", value: "67%", icon: "⏱️" },
            { label: "Active Trains", value: "6", icon: "🚆" },
            { label: "Active Alerts", value: "4", icon: "🚨" },
            { label: "Passengers Today", value: "48,200", icon: "👥" },
            { label: "Weather", value: "Heavy Rain 🌧️", icon: "🌡️" },
          ],
        },
        {
          heading: "🔴 Top Issues Right Now",
          type: "list",
          items: [
            "T003 Intercity stopped on South Line — 14-min delay, 680 passengers",
            "Northgate at 96% capacity — breach imminent",
            "Southbridge at 95% capacity — rising trend",
            "Airport Express delayed 9 minutes — 3 flight connections at risk",
          ],
        },
        {
          heading: "💡 Try asking me...",
          type: "list",
          items: [
            "\"What actions should operators take?\"",
            "\"Which route is most vulnerable?\"",
            "\"Predict delays for next 4 hours\"",
            "\"Show maintenance schedule\"",
          ],
        },
      ],
      tags: ["Live Briefing", "4 Alerts", "Action Required"],
    },
  },

  // ── THANK YOU ────────────────────────────────────────────────────────────────
  {
    patterns: ["thank", "thanks", "great", "good job", "well done", "perfect", "awesome"],
    category: "acknowledgement",
    response: {
      type: "simple",
      text: "You're welcome! I'm continuously monitoring the network and will alert you to any changes. Is there anything else you'd like to know about railway operations?",
      tags: ["Monitoring Active", "Ready to Help"],
    },
  },
];

// ── FALLBACK ──────────────────────────────────────────────────────────────────
export const fallbackResponse = {
  type: "rich",
  title: "Network Analysis",
  summary: "I'm analyzing the current railway network state. Here's a real-time overview based on your query.",
  sections: [
    {
      heading: "📊 Current Network State",
      type: "metrics",
      items: [
        { label: "Network Health", value: "72 / 100", icon: "💚" },
        { label: "On-Time Rate", value: "67%", icon: "⏱️" },
        { label: "Active Alerts", value: "4", icon: "🚨" },
        { label: "Avg Delay", value: "6.4 min", icon: "🕐" },
      ],
    },
    {
      heading: "💡 I can help you with",
      type: "list",
      items: [
        "Delay predictions and train status",
        "Station congestion analysis",
        "Operator action recommendations",
        "Weather impact on operations",
        "Maintenance scheduling",
        "Emergency response protocols",
        "Performance reports and KPIs",
      ],
    },
  ],
  tags: ["Network Health: 72%", "4 Alerts Active", "Ask Me Anything"],
};
