import { useState } from "react";
import { useNavigate } from "react-router";
import {
  LineChart, Line, ResponsiveContainer, YAxis,
} from "recharts";
import {
  ArrowLeft, Satellite, Map as MapIcon, Leaf, CloudRain, Mountain, Waves,
  Wheat, History, Camera, CloudSunRain, Sprout, FlaskConical, ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import { TwinMap, type TwinLayers } from "@/components/maps";
import { DataRow, Pill, StageChip } from "@/components/widgets";
import { TWIN, NDVI_TREND, TWIN_EVENTS } from "@/lib/data";
import { formatKES } from "@/lib/geo";
import { cn } from "@/lib/utils";

const LAYER_DEFS: { key: keyof TwinLayers; label: string; icon: typeof Satellite }[] = [
  { key: "satellite", label: "Satellite / Base", icon: Satellite },
  { key: "boundary", label: "Farm boundary", icon: MapIcon },
  { key: "health", label: "Crop health · NDVI", icon: Leaf },
  { key: "rainfall", label: "Rainfall", icon: CloudRain },
  { key: "soil", label: "Soil", icon: Waves },
  { key: "elevation", label: "Elevation", icon: Mountain },
  { key: "readiness", label: "Harvest readiness", icon: Wheat },
  { key: "historical", label: "Historical imagery", icon: History },
];

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  accent = "#387735",
}: {
  title: string;
  icon: typeof Satellite;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left">
        <Icon size={14} style={{ color: accent }} />
        <span className="label-caps flex-1 text-clay">{title}</span>
        <ChevronDown size={14} className={cn("text-stone2 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

const EVENT_ICONS: Record<string, { icon: typeof Camera; color: string; bg: string }> = {
  plant: { icon: Sprout, color: "#2c5f2c", bg: "#dfefd6" },
  input: { icon: FlaskConical, color: "#6e5327", bg: "#efe9e0" },
  visit: { icon: ClipboardCheck, color: "#387735", bg: "#f1f8ec" },
  rain: { icon: CloudSunRain, color: "#1d639e", bg: "#e0eefa" },
  photo: { icon: Camera, color: "#66615a", bg: "#efede8" },
  soil: { icon: Waves, color: "#8a6d3b", bg: "#efe9e0" },
  sat: { icon: Satellite, color: "#c2691a", bg: "#fdf3e3" },
};

export default function FarmTwin() {
  const navigate = useNavigate();
  const [layers, setLayers] = useState<TwinLayers>({
    satellite: true, historical: false, boundary: true, health: true,
    rainfall: false, soil: false, elevation: false, readiness: false,
  });
  const toggle = (k: keyof TwinLayers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  return (
    <div className="p-4">
      {/* identity strip */}
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[11px] font-semibold text-clay hover:text-foreground">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="h-6 w-px bg-border" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-bold tracking-tight">{TWIN.name}</h1>
            <StageChip stage={TWIN.cropStatus.stageKey} size="xs" />
          </div>
          <div className="mono text-[10px] text-stone2">{TWIN.id} · 0.3055° N, 34.4710° E</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1">
          {[
            ["Area", `${TWIN.areaAcres} ac · ${TWIN.areaHa} ha`],
            ["Crop", `${TWIN.crop} · ${TWIN.variety}`],
            ["Cycle", TWIN.cycle],
            ["Planted", TWIN.planted],
          ].map(([l, v]) => (
            <div key={l}>
              <div className="label-caps text-[8.5px] text-stone2">{l}</div>
              <div className="mono text-[12px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {/* map */}
        <div className="relative min-w-0 flex-[1.6] overflow-hidden rounded-lg border border-border">
          <TwinMap polygon={TWIN.polygon} layers={layers} height={560} />
          {/* layer toolbar */}
          <div className="absolute left-3 top-3 z-[500] w-[196px] rounded-lg border border-border bg-white/95 shadow-lg backdrop-blur-sm">
            <div className="label-caps border-b border-border px-3 py-2 text-stone2">Map layers</div>
            <div className="p-1.5">
              {LAYER_DEFS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => toggle(l.key)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition-colors",
                    layers[l.key] ? "bg-cane-50 text-cane-900" : "text-clay hover:bg-black/[0.04]"
                  )}
                >
                  <l.icon size={13} className={layers[l.key] ? "text-cane-700" : "text-stone2"} />
                  <span className="flex-1">{l.label}</span>
                  <span className={cn("h-3.5 w-6 rounded-full p-px transition-colors", layers[l.key] ? "bg-cane-600" : "bg-black/15")}>
                    <span className={cn("block h-3 w-3 rounded-full bg-white shadow transition-transform", layers[l.key] && "translate-x-2.5")} />
                  </span>
                </button>
              ))}
            </div>
            {layers.health && (
              <div className="border-t border-border px-3 py-2">
                <div className="label-caps mb-1.5 text-[8px] text-stone2">NDVI scale</div>
                <div className="flex h-2 overflow-hidden rounded-full">
                  {["#dc2626", "#e2a63d", "#9ccb88", "#4c9445", "#2c5f2c"].map((c) => (
                    <div key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <div className="mono mt-1 flex justify-between text-[8px] text-stone2"><span>0.3</span><span>0.6</span><span>0.8+</span></div>
              </div>
            )}
          </div>
          {layers.historical && (
            <div className="absolute bottom-3 left-3 z-[500] rounded-md border border-amber-300 bg-amber-50/95 px-2.5 py-1.5 backdrop-blur-sm">
              <span className="mono text-[9.5px] font-semibold text-amber-800">IMAGERY: 14 MAR 2026 — PLANTING DATE</span>
            </div>
          )}
        </div>

        {/* information panel */}
        <div className="w-[360px] shrink-0 self-start rounded-lg border border-border bg-card">
          <div className="label-caps border-b border-border px-4 py-2.5 text-clay">Parcel record</div>

          <Section title="Crop status" icon={Sprout} defaultOpen>
            <DataRow label="Crop age" value={TWIN.cropStatus.age} />
            <DataRow label="Current stage" value={<StageChip stage="grandgrowth" size="xs" />} />
            <DataRow label="Days to estimated maturity" value={`${TWIN.cropStatus.daysToMaturity} days`} />
            <DataRow label="Expected harvest window" value={TWIN.cropStatus.harvestWindow} valueClass="text-cane-700" />
          </Section>

          <Section title="Crop health — satellite" icon={Satellite} accent="#c2691a" defaultOpen>
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="label-caps text-stone2">NDVI</div>
                <div className="mono text-[24px] font-bold leading-none">{TWIN.health.ndvi.toFixed(2)}</div>
              </div>
              <Pill tone="amber">▼ {TWIN.health.ndviPrev.toFixed(2)} prev pass</Pill>
            </div>
            <ResponsiveContainer width="100%" height={64}>
              <LineChart data={NDVI_TREND} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <YAxis domain={[0.2, 0.85]} hide />
                <Line type="monotone" dataKey="v" stroke="#387735" strokeWidth={2} dot={{ r: 2, fill: "#387735" }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mono flex justify-between text-[8.5px] text-stone2">
              {NDVI_TREND.map((d) => <span key={d.d}>{d.d}</span>)}
            </div>
            <div className="mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-[10.5px] leading-snug text-amber-800">
              {TWIN.health.note} · obs {TWIN.health.obsDate}
            </div>
          </Section>

          <Section title="Weather" icon={CloudRain} accent="#2b7bbb">
            <DataRow label="Rainfall — 7 days" value={TWIN.weather.rain7} valueClass="text-water-600" />
            <DataRow label="Rainfall — 30 days" value={TWIN.weather.rain30} valueClass="text-water-600" />
            <DataRow label="Temperature (mean)" value={TWIN.weather.temp} />
            <div className="mt-2 rounded-md bg-water-50 px-2.5 py-1.5 text-[10.5px] leading-snug text-water-700">
              Forecast: {TWIN.weather.forecast}
            </div>
          </Section>

          <Section title="Soil" icon={Waves} accent="#8a6d3b">
            <DataRow label="Soil type" value={TWIN.soil.type} />
            <DataRow label="pH" value={TWIN.soil.ph} />
            <DataRow label="Organic carbon" value={TWIN.soil.carbon} />
            <div className="mt-1.5 text-[10px] text-stone2">Source: {TWIN.soil.source}</div>
          </Section>

          <Section title="Economics" icon={FlaskConical} accent="#6e5327">
            <DataRow label="Season budget" value={formatKES(TWIN.economics.budget)} />
            <DataRow label="Spent to date" value={formatKES(TWIN.economics.spent)} />
            <DataRow label="Forecast remaining" value={formatKES(TWIN.economics.remaining)} valueClass="text-risk-orange" />
            <DataRow label="Est. cost per tonne" value={`KES ${TWIN.economics.costPerTonne}/t`} />
            <button
              onClick={() => navigate("/finance/FMR-00482")}
              className="mt-2 w-full rounded-md bg-earth-700 py-1.5 text-[11px] font-semibold text-white hover:bg-earth-900"
            >
              Open financing assessment
            </button>
          </Section>
        </div>
      </div>

      {/* event timeline */}
      <div className="mt-3 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="label-caps text-clay">Parcel timeline — planting to date</span>
          <span className="mono text-[10px] text-stone2">{TWIN_EVENTS.length} verified events</span>
        </div>
        <div className="overflow-x-auto p-4">
          <div className="flex min-w-max items-stretch gap-0">
            {TWIN_EVENTS.map((e, i) => {
              const ic = EVENT_ICONS[e.type];
              return (
                <div key={i} className="relative flex w-[150px] flex-col items-center pt-1">
                  {i < TWIN_EVENTS.length - 1 && (
                    <div className="absolute left-1/2 top-[19px] h-[2px] w-full bg-border" />
                  )}
                  <div
                    className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card"
                    style={{ background: ic.bg }}
                  >
                    <ic.icon size={15} style={{ color: ic.color }} />
                  </div>
                  <div className="mono mt-2 text-[9.5px] font-semibold text-stone2">{e.date}</div>
                  <div className="mt-0.5 px-2 text-center text-[10.5px] leading-snug text-foreground">{e.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
