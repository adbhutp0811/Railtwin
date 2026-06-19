// ─────────────────────────────────────────────────────────────────────────────
// INDIA RAILWAY MAP DATA  — Real stations, real routes, real train numbers
// SVG viewBox: 0 0 400 420  (lat/lng projected to canvas coords)
// ─────────────────────────────────────────────────────────────────────────────

// ─── STATIONS ────────────────────────────────────────────────────────────
export const indiaStations = [
  // ═══ MAJOR TERMINALS ═══
  { id:"NDLS", name:"New Delhi",          shortName:"NDLS", type:"terminal", zone:"NR", x:144, y:141, platforms:16, status:"normal",    passengers:4800, capacity:6000, delay:0,  lat:28.64, lng:77.22, facilities:["AC Waiting","Food Court","Metro Link"] },
  { id:"DLI",  name:"Old Delhi",          shortName:"DLI",  type:"terminal", zone:"NR", x:138, y:130, platforms:16, status:"congested", passengers:5200, capacity:5500, delay:8,  lat:28.66, lng:77.23, facilities:["Waiting Hall","Cloak Room","Food Stalls"] },
  { id:"BCT",  name:"Mumbai Central",     shortName:"BCT",  type:"terminal", zone:"WR", x:87,  y:273, platforms:9,  status:"normal",    passengers:3800, capacity:4500, delay:4,  lat:18.97, lng:72.82, facilities:["AC Lounge","Prepaid Taxi","Food Court"] },
  { id:"HWH",  name:"Howrah Junction",    shortName:"HWH",  type:"terminal", zone:"ER", x:290, y:223, platforms:23, status:"normal",    passengers:5600, capacity:7000, delay:2,  lat:22.59, lng:88.34, facilities:["AC Waiting","Food Court","Metro Link"] },
  { id:"MAS",  name:"Chennai Central",    shortName:"MAS",  type:"terminal", zone:"SR", x:168, y:350, platforms:15, status:"normal",    passengers:3400, capacity:4200, delay:0,  lat:13.08, lng:80.27, facilities:["AC Lounge","Food Court","Metro Link"] },
  { id:"SBC",  name:"Bangalore City",     shortName:"SBC",  type:"terminal", zone:"SWR",x:149, y:357, platforms:10, status:"warning",   passengers:2800, capacity:3500, delay:6,  lat:12.98, lng:77.59, facilities:["AC Waiting","Food Court","Metro Nearby"] },
  { id:"SC",   name:"Secunderabad",       shortName:"SC",   type:"terminal", zone:"SCR",x:161, y:296, platforms:10, status:"normal",    passengers:2600, capacity:3200, delay:3,  lat:17.44, lng:78.50, facilities:["AC Lounge","Food Court","Parking"] },
  { id:"JP",   name:"Jaipur Junction",    shortName:"JP",   type:"terminal", zone:"NWR",x:125, y:165, platforms:6,  status:"warning",   passengers:2200, capacity:2800, delay:5,  lat:26.92, lng:75.79, facilities:["Waiting Hall","Food Court","Parking"] },
  { id:"ASR",  name:"Amritsar Junction",  shortName:"ASR",  type:"terminal", zone:"NR", x:113, y:100, platforms:5,  status:"normal",    passengers:1800, capacity:2500, delay:2,  lat:31.63, lng:74.87, facilities:["AC Waiting","Food Stalls","Parking"] },
  { id:"LKU",  name:"Lucknow Charbagh",   shortName:"LKO",  type:"terminal", zone:"NER",x:193, y:166, platforms:9,  status:"normal",    passengers:2000, capacity:2800, delay:1,  lat:26.85, lng:80.95, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"PNBE", name:"Patna Junction",     shortName:"PNBE", type:"terminal", zone:"ECR",x:248, y:183, platforms:10, status:"warning",   passengers:2400, capacity:3000, delay:7,  lat:25.59, lng:85.14, facilities:["Waiting Hall","Food Court","Metro Link"] },
  { id:"GHY",  name:"Guwahati",           shortName:"GHY",  type:"terminal", zone:"NFR",x:334, y:175, platforms:4,  status:"normal",    passengers:1400, capacity:2000, delay:3,  lat:26.14, lng:91.73, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"JAT",  name:"Jammu Tawi",         shortName:"JAT",  type:"terminal", zone:"NR", x:113, y:85,  platforms:5,  status:"normal",    passengers:1200, capacity:1800, delay:1,  lat:32.71, lng:74.86, facilities:["Waiting Room","Food Stalls","Parking"] },
  { id:"SDAH", name:"Sealdah",            shortName:"SDAH", type:"terminal", zone:"ER", x:293, y:215, platforms:20, status:"normal",    passengers:4200, capacity:5200, delay:3,  lat:22.57, lng:88.37, facilities:["AC Waiting","Food Court","Metro Link"] },
  { id:"ADI",  name:"Ahmedabad Junction", shortName:"ADI",  type:"terminal", zone:"WR", x:83,  y:218, platforms:10, status:"normal",    passengers:2600, capacity:3400, delay:2,  lat:23.02, lng:72.57, facilities:["AC Lounge","Food Court","Parking"] },
  { id:"BPL",  name:"Bhopal Junction",    shortName:"BPL",  type:"terminal", zone:"WCR",x:146, y:215, platforms:8,  status:"normal",    passengers:1800, capacity:2400, delay:0,  lat:23.26, lng:77.41, facilities:["AC Waiting","Food Court","ATM"] },
  { id:"AII",  name:"Ajmer Junction",     shortName:"AII",  type:"terminal", zone:"NWR",x:108, y:170, platforms:6,  status:"normal",    passengers:1500, capacity:2000, delay:1,  lat:26.45, lng:74.64, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"BBS",  name:"Bhubaneswar",        shortName:"BBS",  type:"terminal", zone:"ECoR",x:257, y:256, platforms:6,  status:"normal",    passengers:2000, capacity:2800, delay:2,  lat:20.27, lng:85.82, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"TVC",  name:"Thiruvananthapuram", shortName:"TVC",  type:"terminal", zone:"SR", x:140, y:418, platforms:5,  status:"normal",    passengers:1100, capacity:1600, delay:0,  lat:8.52,  lng:76.94, facilities:["Waiting Hall","Food Court","Parking"] },
  { id:"ERS",  name:"Ernakulam Junction", shortName:"ERS",  type:"terminal", zone:"SR", x:131, y:399, platforms:5,  status:"normal",    passengers:1300, capacity:1800, delay:1,  lat:9.93,  lng:76.27, facilities:["Waiting Hall","Food Court","Parking"] },

  // ═══ MAJOR JUNCTIONS ═══
  { id:"CNB",  name:"Kanpur Central",     shortName:"CNB",  type:"junction", zone:"NCR",x:185, y:171, platforms:10, status:"warning",   passengers:2800, capacity:3400, delay:6,  lat:26.45, lng:80.33, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"ALD",  name:"Prayagraj Jn.",      shortName:"PRYJ", type:"junction", zone:"NCR",x:204, y:185, platforms:10, status:"normal",    passengers:2200, capacity:2800, delay:3,  lat:25.44, lng:81.84, facilities:["Waiting Hall","Food Court","ATM"] },
  { id:"AGC",  name:"Agra Cantt.",        shortName:"AGC",  type:"junction", zone:"NCR",x:154, y:161, platforms:8,  status:"normal",    passengers:1800, capacity:2400, delay:2,  lat:27.18, lng:78.01, facilities:["AC Waiting","Food Stalls","Parking"] },
  { id:"JHS",  name:"Jhansi Junction",    shortName:"JHS",  type:"junction", zone:"NCR",x:161, y:185, platforms:7,  status:"normal",    passengers:1600, capacity:2200, delay:1,  lat:25.45, lng:78.56, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"KOTA", name:"Kota Junction",      shortName:"KOTA", type:"junction", zone:"WCR",x:126, y:189, platforms:6,  status:"normal",    passengers:1400, capacity:2000, delay:3,  lat:25.18, lng:75.84, facilities:["AC Waiting","Food Court","ATM"] },
  { id:"NGP",  name:"Nagpur Junction",    shortName:"NGP",  type:"junction", zone:"SECR",x:168, y:244, platforms:8,  status:"warning",   passengers:2200, capacity:2800, delay:5,  lat:21.15, lng:79.09, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"BRC",  name:"Vadodara Junction",  shortName:"BRC",  type:"junction", zone:"WR", x:91,  y:228, platforms:8,  status:"normal",    passengers:1800, capacity:2400, delay:2,  lat:22.31, lng:73.18, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"ST",   name:"Surat Junction",     shortName:"ST",   type:"junction", zone:"WR", x:86,  y:244, platforms:4,  status:"normal",    passengers:1500, capacity:2000, delay:1,  lat:21.17, lng:72.83, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"PUNE", name:"Pune Junction",      shortName:"PUNE", type:"junction", zone:"CR", x:100, y:281, platforms:8,  status:"normal",    passengers:2000, capacity:2600, delay:3,  lat:18.52, lng:73.86, facilities:["AC Waiting","Food Court","Metro Link"] },
  { id:"VSKP", name:"Visakhapatnam Jn.",  shortName:"VSKP", type:"junction", zone:"ECoR",x:224, y:292, platforms:8,  status:"normal",    passengers:2200, capacity:2800, delay:2,  lat:17.72, lng:83.30, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"WL",   name:"Warangal Junction",  shortName:"WL",   type:"junction", zone:"SCR",x:175, y:288, platforms:5,  status:"normal",    passengers:1200, capacity:1800, delay:4,  lat:18.00, lng:79.58, facilities:["Waiting Room","Food Stalls","ATM"] },
  { id:"DHN",  name:"Dhanbad Junction",   shortName:"DHN",  type:"junction", zone:"ECR",x:265, y:208, platforms:7,  status:"normal",    passengers:1800, capacity:2400, delay:3,  lat:23.80, lng:86.43, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"LDH",  name:"Ludhiana Junction",  shortName:"LDH",  type:"junction", zone:"NR", x:126, y:110, platforms:6,  status:"normal",    passengers:1400, capacity:2000, delay:1,  lat:30.90, lng:75.85, facilities:["Waiting Hall","Food Court","Parking"] },
  { id:"CDG",  name:"Chandigarh Jn.",     shortName:"CDG",  type:"junction", zone:"NR", x:138, y:112, platforms:5,  status:"normal",    passengers:1200, capacity:1800, delay:0,  lat:30.73, lng:76.78, facilities:["Waiting Hall","Food Court","Parking"] },
  { id:"MGS",  name:"Mughalsarai Jn.",    shortName:"MGS",  type:"junction", zone:"ECR",x:222, y:197, platforms:9,  status:"normal",    passengers:2000, capacity:2600, delay:4,  lat:25.30, lng:83.12, facilities:["Waiting Hall","Food Court","ATM"] },
  { id:"GZB",  name:"Ghaziabad Jn.",      shortName:"GZB",  type:"junction", zone:"NR", x:160, y:138, platforms:8,  status:"warning",   passengers:2000, capacity:2600, delay:5,  lat:28.67, lng:77.45, facilities:["Waiting Hall","Food Stalls","ATM"] },
  { id:"MAO",  name:"Madgaon Jn.",        shortName:"MAO",  type:"junction", zone:"KR", x:99,  y:322, platforms:4,  status:"normal",    passengers:800,  capacity:1200, delay:1,  lat:15.49, lng:73.83, facilities:["Waiting Room","Food Stalls"] },
  { id:"MAQ",  name:"Mangalore Jn.",      shortName:"MAQ",  type:"junction", zone:"SR", x:113, y:358, platforms:4,  status:"normal",    passengers:900,  capacity:1400, delay:2,  lat:12.87, lng:74.88, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"CBE",  name:"Coimbatore Jn.",     shortName:"CBE",  type:"junction", zone:"SR", x:140, y:384, platforms:6,  status:"normal",    passengers:1400, capacity:2000, delay:1,  lat:11.02, lng:76.96, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"MDU",  name:"Madurai Jn.",        shortName:"MDU",  type:"junction", zone:"SR", x:156, y:399, platforms:7,  status:"normal",    passengers:1600, capacity:2200, delay:2,  lat:9.93,  lng:78.12, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"BZA",  name:"Vijayawada Jn.",     shortName:"BZA",  type:"junction", zone:"SCR",x:185, y:310, platforms:10, status:"warning",   passengers:2400, capacity:3000, delay:5,  lat:16.52, lng:80.62, facilities:["AC Waiting","Food Court","Parking"] },
  { id:"MTJ",  name:"Mathura Jn.",        shortName:"MTJ",  type:"junction", zone:"NCR",x:150, y:157, platforms:5,  status:"normal",    passengers:1000, capacity:1600, delay:0,  lat:27.49, lng:77.67, facilities:["Waiting Room","Food Stalls","ATM"] },
  { id:"RTM",  name:"Ratlam Jn.",         shortName:"RTM",  type:"junction", zone:"WR", x:115, y:214, platforms:5,  status:"normal",    passengers:1000, capacity:1600, delay:1,  lat:23.33, lng:75.04, facilities:["Waiting Hall","Food Stalls","Parking"] },
  { id:"SWM",  name:"Sawai Madhopur Jn.", shortName:"SWM",  type:"junction", zone:"WCR",x:118, y:173, platforms:4,  status:"normal",    passengers:600,  capacity:1000, delay:0,  lat:26.02, lng:75.84, facilities:["Waiting Room","Food Stalls"] },

  // ═══ SUBURBAN / HALT ═══
  { id:"SBB",  name:"Subzi Mandi",        shortName:"SZM",  type:"suburban", zone:"NR", x:140, y:134, platforms:3,  status:"normal",    passengers:600,  capacity:1000, delay:1,  lat:28.66, lng:77.20, facilities:["Basic Waiting"] },
  { id:"ANVT", name:"Anand Vihar Term.",  shortName:"ANVT", type:"terminal", zone:"NR", x:155, y:140, platforms:6,  status:"normal",    passengers:1500, capacity:2200, delay:2,  lat:28.65, lng:77.32, facilities:["Bus Terminal","Metro Link","Food Court"] },
];

// ─── ROUTES ─────────────────────────────────────────────────────────────
export const indiaRoutes = [
  // Golden Quadrilateral — Delhi–Howrah (Eastern Corridor)
  { id:"EC1", name:"Eastern Corridor (Delhi–Howrah)",    shortName:"E-Corr",  from:"NDLS", to:"HWH", via:["CNB","ALD","MGS","DHN"],     color:"#00d4ff", lineColor:"#00d4ff", active:true, type:"mainline", speed:130 },
  // Golden Quadrilateral — Delhi–Mumbai (Western Corridor)
  { id:"WC1", name:"Western Corridor (Delhi–Mumbai)",    shortName:"W-Corr",  from:"NDLS", to:"BCT", via:["MTJ","SWM","KOTA","RTM","BRC","ST"], color:"#ff8800", lineColor:"#ff8800", active:true, type:"mainline", speed:130 },
  // Delhi–Chennai (North–South Corridor)
  { id:"NS1", name:"North–South Corridor (Delhi–Chennai)",shortName:"N-S",    from:"NDLS", to:"MAS", via:["AGC","JHS","BPL","NGP","WL"],   color:"#8b5cf6", lineColor:"#8b5cf6", active:true, type:"mainline", speed:120 },
  // Delhi–Bangalore (via Hyderabad)
  { id:"SB1", name:"Delhi–Bangalore Corridor",           shortName:"D-BLR",   from:"NDLS", to:"SBC", via:["AGC","JHS","BPL","NGP","SC"],    color:"#ff4444", lineColor:"#ff4444", active:true, type:"mainline", speed:110 },
  // Delhi–Amritsar (Northern)
  { id:"NR1", name:"Northern Corridor (Delhi–Amritsar)", shortName:"N-Corr",  from:"NDLS", to:"ASR", via:["GZB","LDH"],                   color:"#00ff88", lineColor:"#00ff88", active:true, type:"mainline", speed:120 },
  // Delhi–Ajmer (North Western)
  { id:"NW1", name:"North Western (Delhi–Ajmer)",        shortName:"NW-Corr", from:"NDLS", to:"AII", via:["JP"],                          color:"#f472b6", lineColor:"#f472b6", active:true, type:"mainline", speed:110 },
  // Delhi–Patna (Eastern)
  { id:"EP1", name:"Delhi–Patna Corridor",               shortName:"D-PNBE",  from:"NDLS", to:"PNBE", via:["CNB","ALD","MGS"],             color:"#ffcc00", lineColor:"#ffcc00", active:true, type:"mainline", speed:120 },
  // Howrah–Chennai (East Coast)
  { id:"EC2", name:"East Coast (Howrah–Chennai)",        shortName:"Coast",   from:"HWH",  to:"MAS", via:["BBS","VSKP","BZA"],            color:"#34d399", lineColor:"#34d399", active:true, type:"mainline", speed:110 },
  // Mumbai–Chennai (Central)
  { id:"MC1", name:"Mumbai–Chennai Corridor",            shortName:"M-C",     from:"BCT",  to:"MAS", via:["PUNE","CBE","MDU"],            color:"#f97316", lineColor:"#f97316", active:true, type:"mainline", speed:100 },
  // Delhi–Lucknow
  { id:"DL1", name:"Delhi–Lucknow Corridor",             shortName:"D-LKO",   from:"NDLS", to:"LKU", via:["CNB"],                         color:"#06b6d4", lineColor:"#06b6d4", active:true, type:"mainline", speed:120 },
  // Mumbai–Goa (Konkan Railway)
  { id:"KR1", name:"Konkan Railway (Mumbai–Mangalore)",  shortName:"Konkan",  from:"BCT",  to:"MAQ", via:["MAO"],                         color:"#14b8a6", lineColor:"#14b8a6", active:true, type:"mainline", speed:90 },
  // Ahmedabad–Delhi
  { id:"AD1", name:"Ahmedabad–Delhi Corridor",           shortName:"AHD-D",   from:"ADI",  to:"NDLS", via:["JP"],                         color:"#a855f7", lineColor:"#a855f7", active:true, type:"mainline", speed:110 },
];

// ─── TRAINS ─────────────────────────────────────────────────────────────
export const indiaTrains = [
  {
    id:"12301", name:"Howrah Rajdhani",   number:"12301", type:"Rajdhani",  route:"EC1", routeStops:["NDLS","CNB","ALD","MGS","DHN","HWH"], currentStopIdx:0, progress:0.62, speed:118, status:"on-time", delay:0,  cars:20, passengers:612,  capacity:650, from:"New Delhi", to:"Howrah", scheduledArr:"06:55", scheduledDep:"17:05", platform:"1",  direction:1, color:"#00d4ff",
  },
  {
    id:"12951", name:"Mumbai Rajdhani",   number:"12951", type:"Rajdhani",  route:"WC1", routeStops:["NDLS","MTJ","KOTA","RTM","BRC","ST","BCT"], currentStopIdx:0, progress:0.38, speed:104, status:"delayed", delay:8,  cars:18, passengers:580,  capacity:620, from:"New Delhi", to:"Mumbai Central", scheduledArr:"08:35", scheduledDep:"16:35", platform:"3",  direction:1, color:"#ff8800",
  },
  {
    id:"12015", name:"Ajmer Shatabdi",    number:"12015", type:"Shatabdi",  route:"NW1", routeStops:["NDLS","JP","AII"],                    currentStopIdx:1, progress:0.74, speed:130, status:"on-time", delay:0,  cars:12, passengers:440,  capacity:468, from:"New Delhi", to:"Ajmer", scheduledArr:"06:05", scheduledDep:"06:05", platform:"5",  direction:1, color:"#f472b6",
  },
  {
    id:"12309", name:"Patna Rajdhani",    number:"12309", type:"Rajdhani",  route:"EP1", routeStops:["NDLS","CNB","ALD","MGS","PNBE"],      currentStopIdx:0, progress:0.21, speed:96,  status:"delayed", delay:14, cars:16, passengers:524,  capacity:540, from:"New Delhi", to:"Patna", scheduledArr:"17:55", scheduledDep:"17:55", platform:"2",  direction:1, color:"#ffcc00",
  },
  {
    id:"22691", name:"Bangalore Rajdhani", number:"22691", type:"Rajdhani",  route:"SB1", routeStops:["NDLS","AGC","JHS","BPL","NGP","SC","SBC"], currentStopIdx:0, progress:0.08, speed:0,   status:"stopped", delay:22, cars:20, passengers:680,  capacity:700, from:"New Delhi", to:"Bangalore", scheduledArr:"20:15", scheduledDep:"20:15", platform:"6",  direction:1, color:"#ff4444",
  },
  {
    id:"12259", name:"Sealdah Duronto",   number:"12259", type:"Duronto",   route:"EC1", routeStops:["NDLS","CNB","ALD","MGS","DHN","SDAH"], currentStopIdx:1, progress:0.55, speed:88,  status:"delayed", delay:5,  cars:22, passengers:398,  capacity:420, from:"New Delhi", to:"Sealdah", scheduledArr:"12:55", scheduledDep:"12:55", platform:"4",  direction:1, color:"#00d4ff",
  },
  {
    id:"12002", name:"Bhopal Shatabdi",   number:"12002", type:"Shatabdi",  route:"NS1", routeStops:["NDLS","AGC","JHS","BPL"],              currentStopIdx:0, progress:0.89, speed:142, status:"on-time", delay:0,  cars:12, passengers:350,  capacity:360, from:"New Delhi", to:"Bhopal", scheduledArr:"06:00", scheduledDep:"06:00", platform:"8",  direction:1, color:"#f472b6",
  },
  {
    id:"12723", name:"Telangana Express", number:"12723", type:"Express",   route:"SB1", routeStops:["NDLS","AGC","JHS","BPL","NGP","SC"],     currentStopIdx:0, progress:0.44, speed:72,  status:"on-time", delay:3,  cars:24, passengers:810,  capacity:900, from:"New Delhi", to:"Hyderabad", scheduledArr:"06:25", scheduledDep:"06:25", platform:"7",  direction:1, color:"#ff8800",
  },
  {
    id:"12903", name:"Golden Temple Mail", number:"12903", type:"Mail",      route:"NR1", routeStops:["NDLS","GZB","LDH","ASR"],              currentStopIdx:0, progress:0.28, speed:95,  status:"on-time", delay:3,  cars:16, passengers:1040, capacity:1120, from:"New Delhi", to:"Amritsar", scheduledArr:"22:15", scheduledDep:"22:15", platform:"13", direction:1, color:"#8b5cf6",
  },
  {
    id:"12621", name:"Chennai Rajdhani",  number:"12621", type:"Rajdhani",  route:"NS1", routeStops:["NDLS","AGC","JHS","BPL","NGP","WL","MAS"], currentStopIdx:0, progress:0.33, speed:112, status:"on-time", delay:0,  cars:18, passengers:560,  capacity:630, from:"New Delhi", to:"Chennai", scheduledArr:"09:30", scheduledDep:"09:30", platform:"10", direction:1, color:"#8b5cf6",
  },
  {
    id:"12245", name:"Howrah–Mumbai Mail", number:"12245", type:"Express",   route:"MC1", routeStops:["HWH","BBS","VSKP","BZA","MAS","CBE","ERS","TVC"], currentStopIdx:0, progress:0.18, speed:78,  status:"delayed", delay:12, cars:22, passengers:1420, capacity:1600, from:"Howrah", to:"Thiruvananthapuram", scheduledArr:"23:00", scheduledDep:"23:00", platform:"5", direction:1, color:"#34d399",
  },
  {
    id:"12009", name:"Mumbai–Ahmedabad Shatabdi", number:"12009", type:"Shatabdi", route:"AD1", routeStops:["BCT","ST","BRC","ADI"],         currentStopIdx:1, progress:0.65, speed:125, status:"on-time", delay:2,  cars:14, passengers:520,  capacity:560, from:"Mumbai Central", to:"Ahmedabad", scheduledArr:"06:35", scheduledDep:"06:35", platform:"4", direction:1, color:"#a855f7",
  },
];

// ─── ROUTE SEGMENTS ─────────────────────────────────────────────────────
export const routeSegments = {
  EC1: [
    { id:"NDLS", x:144, y:141 },
    { id:"CNB",  x:185, y:171 },
    { id:"ALD",  x:204, y:185 },
    { id:"MGS",  x:222, y:197 },
    { id:"DHN",  x:265, y:208 },
    { id:"HWH",  x:290, y:223 },
  ],
  WC1: [
    { id:"NDLS", x:144, y:141 },
    { id:"MTJ",  x:150, y:157 },
    { id:"SWM",  x:118, y:173 },
    { id:"KOTA", x:126, y:189 },
    { id:"RTM",  x:115, y:214 },
    { id:"BRC",  x:91,  y:228 },
    { id:"ST",   x:86,  y:244 },
    { id:"BCT",  x:87,  y:273 },
  ],
  NS1: [
    { id:"NDLS", x:144, y:141 },
    { id:"AGC",  x:154, y:161 },
    { id:"JHS",  x:161, y:185 },
    { id:"BPL",  x:146, y:215 },
    { id:"NGP",  x:168, y:244 },
    { id:"WL",   x:175, y:288 },
    { id:"MAS",  x:168, y:350 },
  ],
  SB1: [
    { id:"NDLS", x:144, y:141 },
    { id:"AGC",  x:154, y:161 },
    { id:"JHS",  x:161, y:185 },
    { id:"BPL",  x:146, y:215 },
    { id:"NGP",  x:168, y:244 },
    { id:"SC",   x:161, y:296 },
    { id:"SBC",  x:149, y:357 },
  ],
  NR1: [
    { id:"NDLS", x:144, y:141 },
    { id:"GZB",  x:160, y:138 },
    { id:"LDH",  x:126, y:110 },
    { id:"ASR",  x:113, y:100 },
  ],
  NW1: [
    { id:"NDLS", x:144, y:141 },
    { id:"JP",   x:125, y:165 },
    { id:"AII",  x:108, y:170 },
  ],
  EP1: [
    { id:"NDLS", x:144, y:141 },
    { id:"CNB",  x:185, y:171 },
    { id:"ALD",  x:204, y:185 },
    { id:"MGS",  x:222, y:197 },
    { id:"PNBE", x:248, y:183 },
  ],
  EC2: [
    { id:"HWH",  x:290, y:223 },
    { id:"BBS",  x:257, y:256 },
    { id:"VSKP", x:224, y:292 },
    { id:"BZA",  x:185, y:310 },
    { id:"MAS",  x:168, y:350 },
  ],
  MC1: [
    { id:"BCT",  x:87,  y:273 },
    { id:"PUNE", x:100, y:281 },
    { id:"CBE",  x:140, y:384 },
    { id:"MDU",  x:156, y:399 },
    { id:"MAS",  x:168, y:350 },
  ],
  DL1: [
    { id:"NDLS", x:144, y:141 },
    { id:"CNB",  x:185, y:171 },
    { id:"LKU",  x:193, y:166 },
  ],
  KR1: [
    { id:"BCT",  x:87,  y:273 },
    { id:"MAO",  x:99,  y:322 },
    { id:"MAQ",  x:113, y:358 },
  ],
  AD1: [
    { id:"ADI",  x:83,  y:218 },
    { id:"JP",   x:125, y:165 },
    { id:"NDLS", x:144, y:141 },
  ],
};

// ─── INDIA OUTLINE (SVG path) ────────────────────────────────────────────
export const indiaOutlinePath = `
M 35,180
Q 33,188 33,195 Q 35,205 38,210 Q 40,218 42,225 Q 41,233 40,240
Q 42,248 45,255 Q 50,262 55,270 Q 58,278 60,285
Q 63,295 65,305 Q 68,315 70,325 Q 71,335 72,345 Q 74,355 75,365
Q 80,373 85,380 Q 92,388 100,395 Q 108,401 115,405
Q 120,403 125,400 Q 133,392 140,385 Q 143,378 145,370
Q 152,360 160,350 Q 165,340 170,330 Q 175,320 180,310
Q 185,300 190,290 Q 200,282 210,275 Q 222,268 235,260
Q 243,255 250,250 Q 258,245 265,240 Q 273,232 280,225
Q 285,220 290,215 Q 293,210 295,205
Q 302,200 310,195 Q 315,190 320,185 Q 328,180 335,175
Q 343,168 350,160 Q 353,152 355,145 Q 350,140 345,135
Q 340,132 335,130 Q 328,127 320,125 Q 312,122 305,120
Q 300,124 295,128 Q 290,132 285,135 Q 280,139 275,142
Q 270,145 265,148 Q 260,152 255,155 Q 248,160 240,165
Q 233,168 225,170 Q 218,171 210,172 Q 203,170 195,168
Q 188,165 180,162 Q 173,158 165,155 Q 158,151 150,148
Q 143,145 135,142 Q 130,138 125,133 Q 120,126 115,120
Q 110,112 105,105 Q 100,100 95,95 Q 93,88 90,80
Q 88,72 85,65 Q 85,58 88,50 Q 92,46 95,42
Q 100,43 105,45 Q 110,48 115,52 Q 118,55 120,58 Q 123,62 125,65
Q 120,70 115,75 Q 112,82 108,88 Q 104,92 100,95
Q 98,100 95,105 Q 93,110 90,115 Q 85,120 80,125
Q 75,130 70,135 Q 64,139 58,142 Q 53,147 48,152
Q 44,160 40,162 Q 37,170 35,180 Z
`;

// ─── LIVE ALERTS ────────────────────────────────────────────────────────
export const liveAlerts = [
  { id:"A1", type:"delay",      severity:"critical",message:"Train 22691 Bangalore Rajdhani stopped — 22 min delay, signal failure near Jhansi",               station:"JHS", time:"2 min ago" },
  { id:"A2", type:"congestion", severity:"high",    message:"New Delhi station at 95% capacity — crowd control deployed at platforms 1-4",                         station:"NDLS",time:"5 min ago" },
  { id:"A3", type:"delay",      severity:"high",    message:"Train 12309 Patna Rajdhani delayed 14 min — signal fault near Ghaziabad",                              station:"GZB", time:"8 min ago" },
  { id:"A4", type:"weather",    severity:"medium",  message:"Fog advisory: Northern India — visibility below 200m in Delhi, Punjab, and Uttar Pradesh",              station:"LDH", time:"12 min ago" },
  { id:"A5", type:"delay",      severity:"medium",  message:"Train 12245 Howrah–Thiruvananthapuram Express running 12 min late in Odisha section",                  station:"BBS", time:"15 min ago" },
  { id:"A6", type:"maintenance",severity:"low",     message:"Track maintenance window: Nagpur–Warangal section 23:00–04:00 — trains may be rerouted",               station:"NGP", time:"20 min ago" },
];

// ─── NETWORK STATS ────────────────────────────────────────────────────
export const networkStats = {
  totalTrains: 12,
  activeTrains: 12,
  delayedTrains: 4,
  onTimeTrains: 7,
  stoppedTrains: 1,
  avgDelay: 5.6,
  onTimeRate: 58,
  totalPassengers: 7454,
  networkHealth: 72,
  totalRoutes: 12,
  criticalAlerts: 1,
};
