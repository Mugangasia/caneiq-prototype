import { makeField, mulberry32, type LatLng } from "./geo";

/* ------------------------------------------------------------------ */
/* Crop stages                                                         */
/* ------------------------------------------------------------------ */

export type StageKey = "establishment" | "tillering" | "grandgrowth" | "maturation" | "harvest";

export const STAGES: { key: StageKey; label: string; color: string; text: string }[] = [
  { key: "establishment", label: "Establishment", color: "#b5d99c", text: "#3f6228" },
  { key: "tillering", label: "Tillering", color: "#7cb85f", text: "#2f5222" },
  { key: "grandgrowth", label: "Grand Growth", color: "#3e8e41", text: "#ffffff" },
  { key: "maturation", label: "Maturation", color: "#e2a63d", text: "#5c3d05" },
  { key: "harvest", label: "Harvest Ready", color: "#c2691a", text: "#ffffff" },
];

export const stageOf = (k: StageKey) => STAGES.find((s) => s.key === k)!;

/* ------------------------------------------------------------------ */
/* Sugarcane belt — zones around Mumias / Nzoia, Western Kenya         */
/* ------------------------------------------------------------------ */

export const ZONES: { id: string; label: string; center: LatLng }[] = [
  { id: "Z1", label: "Zone 1 — Mumias North", center: [0.372, 34.442] },
  { id: "Z2", label: "Zone 2 — Mumias East", center: [0.348, 34.515] },
  { id: "Z3", label: "Zone 3 — West Valley", center: [0.302, 34.466] },
  { id: "Z4", label: "Zone 4 — Nzoia South", center: [0.262, 34.532] },
  { id: "Z5", label: "Zone 5 — Booker", center: [0.318, 34.566] },
];

export const COOPERATIVES = [
  "West Valley Growers",
  "Mumias Cane Union",
  "Nzoia Farmers Co-op",
  "Booker Smallholders",
  "Ekero Cane Society",
];

export const AGRONOMISTS = ["Grace Achieng", "David Wafula", "Rose Anyango", "Samuel Barasa"];
export const VARIETIES = ["CO 421", "N14", "KEN 83-737", "CO 617", "EAK73-335"];

export interface BeltFarm {
  id: string;
  farmer: string;
  cooperative: string;
  zone: string;
  stage: StageKey;
  areaHa: number;
  variety: string;
  cycle: string;
  risk: boolean;
  harvestMonth: string;
  polygon: LatLng[];
}

const FIRST = [
  "Peter", "Grace", "John", "Mary", "Samuel", "Faith", "David", "Rose", "James", "Alice",
  "Moses", "Agnes", "Joseph", "Beatrice", "Daniel", "Esther", "Patrick", "Lucy", "George", "Jane",
  "Francis", "Margaret", "Stephen", "Caroline", "Michael", "Hellen", "Anthony", "Susan", "Paul", "Violet",
  "Simon", "Dorcas", "Andrew", "Phoebe", "Robert", "Nancy", "Collins", "Everlyne", "Bramwel", "Judith",
];
const LAST = [
  "Ochieng", "Achieng", "Otieno", "Wanjiru", "Barasa", "Njeri", "Wafula", "Anyango", "Mwangi", "Khadambi",
  "Odhiambo", "Wekesa", "Nyongesa", "Chebet", "Kiprop", "Makokha", "Wamalwa", "Auma", "Onyango", "Juma",
  "Kibet", "Muteshi", "Naliaka", "Okumu", "Simiyu", "Were", "Wanjala", "Khaemba", "Nafula", "Lusweti",
  "Omondi", "Atieno", "Kilonzo", "Mutua", "Mwende", "Kagai", "Wambui", "Gitonga", "Moraa", "Kemunto",
];

const HARVEST_MONTHS = ["Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027"];
const STAGE_KEYS: StageKey[] = ["establishment", "tillering", "grandgrowth", "maturation", "harvest"];
const STAGE_W = [0.16, 0.24, 0.27, 0.2, 0.13];

function pickWeighted(rng: () => number): StageKey {
  const r = rng();
  let acc = 0;
  for (let i = 0; i < STAGE_W.length; i++) {
    acc += STAGE_W[i];
    if (r <= acc) return STAGE_KEYS[i];
  }
  return "tillering";
}

function buildBelt(): BeltFarm[] {
  const rng = mulberry32(20260926);
  const farms: BeltFarm[] = [];
  let n = 0;
  ZONES.forEach((z, zi) => {
    const count = 34 + Math.floor(rng() * 10);
    for (let i = 0; i < count; i++) {
      n++;
      const clusterLat = z.center[0] + (rng() - 0.5) * 0.055;
      const clusterLng = z.center[1] + (rng() - 0.5) * 0.06;
      const w = 90 + rng() * 260;
      const h = 90 + rng() * 260;
      const stage = pickWeighted(rng);
      const areaHa = Math.round(((w * h) / 10000) * (0.75 + rng() * 0.4) * 10) / 10;
      const risk = rng() < 0.09;
      farms.push({
        id: `FRM-${String(1000 + n)}`,
        farmer: `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`,
        cooperative: COOPERATIVES[(zi + Math.floor(rng() * 3)) % COOPERATIVES.length],
        zone: z.id,
        stage,
        areaHa,
        variety: VARIETIES[Math.floor(rng() * VARIETIES.length)],
        cycle: rng() < 0.3 ? "Plant cane" : `Ratoon ${1 + Math.floor(rng() * 3)}`,
        risk,
        harvestMonth:
          stage === "harvest"
            ? "Oct 2026"
            : stage === "maturation"
              ? HARVEST_MONTHS[Math.floor(rng() * 3)]
              : HARVEST_MONTHS[2 + Math.floor(rng() * 4)],
        polygon: makeField([clusterLat, clusterLng], w, h, rng() * Math.PI, rng),
      });
    }
  });
  return farms;
}

export const BELT_FARMS: BeltFarm[] = buildBelt();

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export const DASHBOARD_KPIS = [
  { label: "Registered farmers", value: "4,281", delta: "+64 this month", up: true },
  { label: "Active farms", value: "3,912", delta: "+41 this month", up: true },
  { label: "Hectares under cane", value: "11,803", delta: "+212 ha vs last season", up: true },
  { label: "Projected 90-day harvest", value: "18,420 t", delta: "from 486 maturing farms", up: true },
  { label: "Farms requiring attention", value: "126", delta: "38 critical · 88 watch", up: false },
];

export const STAGE_DISTRIBUTION = STAGES.map((s) => ({
  name: s.label,
  key: s.key,
  color: s.color,
  farms: BELT_FARMS.filter((f) => f.stage === s.key).length * 20 + (s.key === "tillering" ? 57 : 0),
}));

export const HARVEST_BY_MONTH = [
  { month: "Sep", tonnes: 2140 },
  { month: "Oct", tonnes: 4680 },
  { month: "Nov", tonnes: 6120 },
  { month: "Dec", tonnes: 7620 },
  { month: "Jan", tonnes: 5810 },
  { month: "Feb", tonnes: 4230 },
  { month: "Mar", tonnes: 3140 },
];

export const INPUT_DEMAND = [
  { month: "Oct", fertilizer: 82, herbicide: 9.8, seedCane: 12, other: 6 },
  { month: "Nov", fertilizer: 64, herbicide: 7.1, seedCane: 30, other: 5 },
  { month: "Dec", fertilizer: 41, herbicide: 5.4, seedCane: 44, other: 8 },
  { month: "Jan", fertilizer: 96, herbicide: 11.2, seedCane: 18, other: 7 },
  { month: "Feb", fertilizer: 58, herbicide: 8.6, seedCane: 9, other: 4 },
  { month: "Mar", fertilizer: 73, herbicide: 6.9, seedCane: 22, other: 6 },
];

export const TICKER_ITEMS = [
  { tone: "water", text: "WEATHER — Heavy rainfall expected Thu–Sat across Zones 2, 3 and 4 (35–60 mm). Review scheduled fertilizer applications." },
  { tone: "risk", text: "ALERT — 38 farms flagged critical: vegetation anomalies (14), overdue agronomy (19), flood risk (5)." },
  { tone: "cane", text: "INPUTS — 82 t NPK fertilizer required within 30 days in Zones 2, 3 and 4. Procurement plan not yet created." },
  { tone: "amber", text: "HARVEST — 486 farms reach maturity in the next 90 days; projected intake 18,420 t against mill capacity of 21,000 t." },
];

export const WEATHER_ALERTS = [
  { severity: "high" as const, title: "Heavy rainfall — Zones 2, 3, 4", detail: "35–60 mm expected Thu–Sat. Hold nitrogen top-dressing on waterlogged plots.", time: "Issued 06:40" },
  { severity: "medium" as const, title: "Dry spell risk — Zone 5", detail: "14-day rainfall deficit of 22 mm. Irrigate establishment-stage plots.", time: "Issued yesterday" },
  { severity: "low" as const, title: "Temperature normal", detail: "Daytime 26–29 °C, within optimal cane range across the belt.", time: "Issued yesterday" },
];

export const OVERDUE_ACTIVITIES = [
  { farm: "Achieng Farm", farmer: "Mary Achieng", activity: "Fertilizer application — NPK 17:17:17", overdue: "3 days overdue", zone: "Z3" },
  { farm: "Wekesa Farm", farmer: "Joseph Wekesa", activity: "Second weeding", overdue: "5 days overdue", zone: "Z2" },
  { farm: "Nyongesa Plot 02", farmer: "Daniel Nyongesa", activity: "Pest scouting — borers", overdue: "2 days overdue", zone: "Z4" },
  { farm: "Khaemba Farm", farmer: "Violet Khaemba", activity: "Gap filling", overdue: "6 days overdue", zone: "Z1" },
];

export const ANOMALIES = [
  { farm: "Onyango Farm — Plot 01", detail: "NDVI drop 0.74 → 0.61 in NE quadrant", detected: "22 Sep pass", severity: "high" as const },
  { farm: "Simiyu Farm", detail: "Patchy vigour, possible smut infection", detected: "20 Sep pass", severity: "medium" as const },
  { farm: "Wanjala Plot 03", detail: "Waterlogging signature after storms", detected: "18 Sep pass", severity: "medium" as const },
];

export const INPUT_REQUIREMENTS_30D = [
  { input: "NPK 17:17:17 fertilizer", qty: "82 t", farms: 1243, zone: "Z2–Z4" },
  { input: "Herbicide (glyphosate)", qty: "9,800 L", farms: 982, zone: "All" },
  { input: "Seed cane (CO 421)", qty: "210 t", farms: 214, zone: "Z1, Z5" },
  { input: "CAN top-dressing", qty: "46 t", farms: 688, zone: "Z3, Z4" },
];

export const INSPECTION_LIST = [
  { farm: "Onyango Farm — Plot 01", farmer: "Peter Ochieng", reason: "Vegetation anomaly", priority: "high" as const, due: "Today" },
  { farm: "Achieng Farm", farmer: "Mary Achieng", reason: "Fertilizer overdue", priority: "high" as const, due: "Today" },
  { farm: "Simiyu Farm", farmer: "Andrew Simiyu", reason: "Smut suspicion", priority: "medium" as const, due: "Tomorrow" },
  { farm: "Wekesa Farm", farmer: "Joseph Wekesa", reason: "Weed pressure", priority: "medium" as const, due: "28 Sep" },
  { farm: "Khaemba Farm", farmer: "Violet Khaemba", reason: "Gap filling check", priority: "low" as const, due: "30 Sep" },
];

/* ------------------------------------------------------------------ */
/* Farmer 360 — Peter Ochieng                                          */
/* ------------------------------------------------------------------ */

export const PETER = {
  name: "Peter Ochieng",
  id: "FMR-00482",
  cooperative: "West Valley Growers",
  zone: "Zone 3 — West Valley",
  phone: "+254 712 448 209",
  kyc: "Verified",
  since: "2021",
  farms: 2,
  totalAcres: 8.4,
  caneAcres: 6.7,
  cycles: "Plant cane + Ratoon 1",
  productionCost: 108400,
  expectedHarvest: "Mar 2027",
  estimatedTonnes: 212,
  harvestValue: 954000,
  finance: { remaining: 71400, existing: 30000, gap: 41400 },
};

export const PETER_FARMS = [
  {
    id: "FRM-1187",
    name: "Onyango Farm — Plot 01",
    acres: 6.72,
    stage: "grandgrowth" as StageKey,
    variety: "CO 421",
    cycle: "Plant cane",
    planted: "14 Mar 2026",
    polygon: makeField([0.3055, 34.471], 420, 380, 0.32, mulberry32(1187)),
  },
  {
    id: "FRM-1204",
    name: "Ochieng Farm — Plot 02",
    acres: 1.68,
    stage: "tillering" as StageKey,
    variety: "N14",
    cycle: "Ratoon 1",
    planted: "2 Jun 2026",
    polygon: makeField([0.3122, 34.4805], 150, 130, -0.22, mulberry32(1204)),
  },
];

export const PETER_TIMELINE = [
  { label: "Planting", date: "14 Mar 2026", done: true },
  { label: "Establishment", date: "Apr 2026", done: true },
  { label: "Tillering", date: "Jun 2026", done: true },
  { label: "Growth", date: "Sep 2026", done: false, current: true },
  { label: "Maturity", date: "Jan 2027", done: false },
  { label: "Harvest", date: "Mar 2027", done: false },
];

export const PETER_UPCOMING = [
  { activity: "Pest scouting — stalk borers", date: "29 Sep 2026", farm: "Plot 01" },
  { activity: "CAN top-dressing — 50 kg/acre", date: "3 Oct 2026", farm: "Plot 02" },
  { activity: "Crop-health assessment (field)", date: "9 Oct 2026", farm: "Plot 01" },
];

export const PETER_VISITS = [
  { date: "18 Sep 2026", officer: "Grace Achieng", note: "Vigour good; anomaly flagged in NE quadrant — drainage recommended.", rating: 4 },
  { date: "21 Aug 2026", officer: "Grace Achieng", note: "Weed pressure low after second weeding. Trash lining advised.", rating: 5 },
  { date: "9 Jul 2026", officer: "David Wafula", note: "Tillering even; population ~98,000 stools/ha.", rating: 4 },
];

export const PETER_OUTSTANDING_INPUTS = [
  { input: "CAN fertilizer", qty: "336 kg", by: "3 Oct 2026" },
  { input: "Herbicide — glyphosate", qty: "4 L", by: "9 Oct 2026" },
];

/* ------------------------------------------------------------------ */
/* Farm Digital Twin — Onyango Farm Plot 01                            */
/* ------------------------------------------------------------------ */

export const TWIN = {
  name: "Onyango Farm — Plot 01",
  id: "FRM-1187",
  areaAcres: 6.72,
  areaHa: 2.72,
  crop: "Sugarcane",
  variety: "CO 421",
  cycle: "Plant cane",
  planted: "14 March 2026",
  polygon: makeField([0.3055, 34.471], 420, 380, 0.32, mulberry32(1187)),
  cropStatus: {
    age: "196 days",
    stage: "Grand Growth",
    stageKey: "grandgrowth" as StageKey,
    daysToMaturity: 118,
    harvestWindow: "28 Feb – 20 Mar 2027",
  },
  health: {
    ndvi: 0.74,
    ndviPrev: 0.78,
    obsDate: "22 Sep 2026",
    note: "NE quadrant dropped to 0.61 — inspect drainage",
  },
  weather: {
    rain7: "41 mm",
    rain30: "128 mm",
    temp: "27.4 °C",
    forecast: "Heavy rain Thu–Sat (35–60 mm)",
  },
  soil: {
    type: "Ferralic clay loam",
    ph: "5.8",
    carbon: "1.9 %",
    source: "Regional estimate · lab sample 11 Mar 2026",
  },
  economics: {
    budget: 179000,
    spent: 108000,
    remaining: 71000,
    costPerTonne: 845,
  },
};

export const NDVI_TREND = [
  { d: "Apr", v: 0.32 },
  { d: "May", v: 0.48 },
  { d: "Jun", v: 0.61 },
  { d: "Jul", v: 0.7 },
  { d: "Aug", v: 0.78 },
  { d: "Sep", v: 0.74 },
];

export const TWIN_EVENTS = [
  { date: "11 Mar", type: "soil", label: "Soil sample — pH 5.8, OC 1.9%" },
  { date: "14 Mar", type: "plant", label: "Planting — CO 421 seed cane, 3-bud setts" },
  { date: "28 Mar", type: "input", label: "Basal DAP applied — 125 kg" },
  { date: "12 Apr", type: "visit", label: "Germination check — 87% strike" },
  { date: "3 May", type: "input", label: "First weeding — manual, 6 labourers" },
  { date: "26 May", type: "rain", label: "Rainfall event — 38 mm in 24 h" },
  { date: "14 Jun", type: "input", label: "NPK 17:17:17 top-dress — 110 kg" },
  { date: "9 Jul", type: "visit", label: "Tillering count — 98k stools/ha" },
  { date: "2 Aug", type: "photo", label: "Photo survey — canopy closure 70%" },
  { date: "21 Aug", type: "input", label: "Second weeding + trash lining" },
  { date: "6 Sep", type: "rain", label: "Rainfall event — 29 mm" },
  { date: "18 Sep", type: "visit", label: "Field visit — NE drainage flagged" },
  { date: "22 Sep", type: "sat", label: "Satellite pass — NDVI 0.74 (NE 0.61)" },
];

/* ------------------------------------------------------------------ */
/* Crop cycle — Achieng Farm Plot 01                                   */
/* ------------------------------------------------------------------ */

export const CYCLE = {
  farm: "Achieng Farm — Plot 01",
  farmer: "Mary Achieng",
  id: "CYC-2291",
  variety: "CO 421",
  cycle: "Ratoon 1",
  planted: "2 June 2026",
  currentStage: 3, // tillering index in LIFECYCLE
  progress: 43,
  activitiesDone: 11,
  activitiesTotal: 17,
  spent: 108400,
  remaining: 71200,
};

export const LIFECYCLE: {
  name: string;
  window: string;
  activities: { name: string; status: string; detail?: string }[];
}[] = [
  { name: "Land Preparation", window: "May 2026", activities: [
    { name: "Ploughing & harrowing", status: "done" },
    { name: "Furrowing — 1.2 m spacing", status: "done" },
  ]},
  { name: "Planting", window: "2 Jun 2026", activities: [
    { name: "Seed cane treatment", status: "done" },
    { name: "Planting — 3-bud setts", status: "done" },
    { name: "Basal fertilizer (DAP)", status: "done" },
  ]},
  { name: "Establishment", window: "Jun–Jul 2026", activities: [
    { name: "Germination assessment", status: "done" },
    { name: "Gap filling", status: "done" },
    { name: "First weeding", status: "done" },
  ]},
  { name: "Tillering", window: "Aug–Oct 2026", activities: [
    { name: "Weed control — second pass", status: "done", detail: "Completed 12 Sep" },
    { name: "Field inspection", status: "done", detail: "Completed 15 Sep" },
    { name: "Fertilizer application — NPK 17:17:17", status: "overdue", detail: "Overdue by 3 days" },
    { name: "Pest inspection — stalk borers", status: "upcoming", detail: "Due in 5 days" },
    { name: "Crop-health assessment", status: "upcoming", detail: "Due in 12 days" },
  ]},
  { name: "Grand Growth", window: "Nov 2026–Feb 2027", activities: [
    { name: "CAN top-dressing", status: "planned" },
    { name: "Earthing up", status: "planned" },
    { name: "Trash lining", status: "planned" },
  ]},
  { name: "Maturation", window: "Mar–May 2027", activities: [
    { name: "Brix testing", status: "planned" },
    { name: "Pre-harvest burning assessment", status: "planned" },
  ]},
  { name: "Harvest", window: "Jun 2027", activities: [
    { name: "Harvest scheduling with mill", status: "planned" },
    { name: "Cane cutting & transport", status: "planned" },
  ]},
  { name: "Ratoon / Replant", window: "Jul 2027", activities: [
    { name: "Stubble shaving & gap filling", status: "planned" },
    { name: "Ratoon fertilizer", status: "planned" },
  ]},
];

/* ------------------------------------------------------------------ */
/* Field officer queue — Grace Achieng                                 */
/* ------------------------------------------------------------------ */

export const QUEUE = {
  officer: "Grace",
  area: "Zone 3 — West Valley",
  assigned: 14,
  high: [
    {
      farm: "Onyango Farm — Plot 01", farmer: "Peter Ochieng", stage: "grandgrowth" as StageKey,
      reason: "Vegetation anomaly detected", distance: "3.2 km", lastVisit: "18 Sep", eta: "12 min",
      center: [0.3055, 34.471] as LatLng,
    },
    {
      farm: "Achieng Farm", farmer: "Mary Achieng", stage: "tillering" as StageKey,
      reason: "Fertilizer application overdue", distance: "5.8 km", lastVisit: "15 Sep", eta: "19 min",
      center: [0.2985, 34.458] as LatLng,
    },
  ],
  today: [
    {
      farm: "Peter Farm", farmer: "Peter Wafula", stage: "establishment" as StageKey,
      reason: "Routine crop inspection", distance: "7.1 km", lastVisit: "2 Sep", eta: "24 min",
      center: [0.313, 34.452] as LatLng,
    },
    {
      farm: "Otieno Farm", farmer: "John Otieno", stage: "establishment" as StageKey,
      reason: "Germination assessment", distance: "8.4 km", lastVisit: "—", eta: "28 min",
      center: [0.2965, 34.479] as LatLng,
    },
    {
      farm: "Naliaka Plot 02", farmer: "Dorcas Naliaka", stage: "tillering" as StageKey,
      reason: "Weed pressure follow-up", distance: "9.0 km", lastVisit: "28 Aug", eta: "31 min",
      center: [0.3105, 34.486] as LatLng,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Financing — Peter Ochieng                                           */
/* ------------------------------------------------------------------ */

export const FINANCE = {
  farmer: "Peter Ochieng",
  id: "FMR-00482",
  farm: "Onyango Farm — Plot 01",
  acres: 6.72,
  stage: "grandgrowth" as StageKey,
  budget: 179000,
  spent: 108000,
  remaining: 71000,
  cropProgress: 61,
  activitiesDone: 87,
  harvest: "March 2027",
  yieldT: 212,
  pricePerT: 4500,
  breakdown: [
    { item: "Fertilizer — CAN top-dress", amount: 24500, share: 34.5 },
    { item: "Weed management", amount: 9800, share: 13.8 },
    { item: "Labour — earthing up & trash", amount: 14200, share: 20 },
    { item: "Harvest preparation", amount: 12500, share: 17.6 },
    { item: "Transport to mill", amount: 10000, share: 14.1 },
  ],
  tranches: [
    { name: "Tranche 1 — Crop Maintenance", amount: 30000, status: "released" as const, milestone: "Tillering completed · 15 Sep 2026", evidence: "9 verified activities, 2 visit reports" },
    { name: "Tranche 2 — Maturity", amount: 25000, status: "pending" as const, milestone: "Grand growth sign-off · est. Dec 2026", evidence: "Requires field visit + NDVI ≥ 0.65" },
    { name: "Tranche 3 — Harvest", amount: 16400, status: "locked" as const, milestone: "Harvest order issued · est. Mar 2027", evidence: "Requires mill delivery order" },
  ],
  riskCards: [
    { title: "Weather exposure", level: "Moderate", tone: "amber" as const, detail: "Plot drains slowly; 35–60 mm rain forecast Thu–Sat. Drainage mitigation recorded 18 Sep." },
    { title: "Crop-health trend", level: "Stable", tone: "cane" as const, detail: "NDVI 0.74, seasonal norm 0.71–0.79. NE quadrant dip under observation." },
    { title: "Historical production", level: "3 cycles", tone: "cane" as const, detail: "Avg 74 t/ha across 2021–2024 ratoons. Delivery compliance 100% to Mumias mill." },
    { title: "Activity compliance", level: "87%", tone: "cane" as const, detail: "13 of 15 planned activities completed on schedule; 1 fertilizer pass 3 days late." },
  ],
  evidencePack: [
    { doc: "Verified activity log — 13 records", meta: "GPS + photo stamped" },
    { doc: "Satellite observation history", meta: "6 passes · Apr–Sep 2026" },
    { doc: "Field visit reports — 3", meta: "Signed by G. Achieng" },
    { doc: "Input receipts — 5", meta: "KES 96,400 verified" },
    { doc: "Soil test — 11 Mar 2026", meta: "pH 5.8 · OC 1.9%" },
  ],
};
