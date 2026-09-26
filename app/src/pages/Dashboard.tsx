import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { ChevronDown, ChevronUp, CloudRainWind, Radar, PackageOpen, ClipboardCheck, RotateCcw } from "lucide-react";
import { BeltMap } from "@/components/maps";
import { Panel, KpiCard, AlertRow, LegendItem, Pill } from "@/components/widgets";
import {
  BELT_FARMS, DASHBOARD_KPIS, STAGES, STAGE_DISTRIBUTION, HARVEST_BY_MONTH, INPUT_DEMAND,
  TICKER_ITEMS, WEATHER_ALERTS, OVERDUE_ACTIVITIES, ANOMALIES, INPUT_REQUIREMENTS_30D,
  INSPECTION_LIST, ZONES, COOPERATIVES, AGRONOMISTS, VARIETIES,
} from "@/lib/data";
import { cn } from "@/lib/utils";

const toneColor: Record<string, string> = { water: "#2b7bbb", risk: "#dc2626", cane: "#387735", amber: "#b45309" };

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative overflow-hidden border-b border-border bg-[#fbfaf7]">
      <div className="ticker-track flex w-max items-center whitespace-nowrap py-1.5">
        {items.map((t, i) => (
          <span key={i} className="mx-6 flex items-center gap-2 text-[11px] font-medium text-clay">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneColor[t.tone] }} />
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border px-3.5 py-3 last:border-b-0">
      <div className="label-caps mb-2 text-stone2">{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
        active ? "border-cane-600 bg-cane-700 text-white" : "border-border bg-card text-clay hover:border-cane-400"
      )}
    >
      {children}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [zone, setZone] = useState<string | null>(null);
  const [coop, setCoop] = useState<string | null>(null);
  const [agro, setAgro] = useState<string | null>(null);
  const [variety, setVariety] = useState<string | null>(null);
  const [stages, setStages] = useState<Set<string>>(new Set(STAGES.map((s) => s.key)));
  const [cycle, setCycle] = useState<string | null>(null);
  const [harvest, setHarvest] = useState<string | null>(null);
  const [riskOnly, setRiskOnly] = useState(false);
  const [intelOpen, setIntelOpen] = useState(true);

  const filtered = useMemo(
    () =>
      BELT_FARMS.filter(
        (f) =>
          (!zone || f.zone === zone) &&
          (!coop || f.cooperative === coop) &&
          (!variety || f.variety === variety) &&
          stages.has(f.stage) &&
          (!cycle || (cycle === "Plant cane" ? f.cycle === "Plant cane" : f.cycle !== "Plant cane")) &&
          (!harvest || f.harvestMonth === harvest) &&
          (!riskOnly || f.risk) &&
          (!agro || true)
      ),
    [zone, coop, variety, stages, cycle, harvest, riskOnly, agro]
  );

  const activeFilters = [zone, coop, agro, variety, cycle, harvest].filter(Boolean).length + (riskOnly ? 1 : 0) + (stages.size < 5 ? 1 : 0);
  const reset = () => {
    setZone(null); setCoop(null); setAgro(null); setVariety(null);
    setStages(new Set(STAGES.map((s) => s.key))); setCycle(null); setHarvest(null); setRiskOnly(false);
  };

  return (
    <div>
      <Ticker />
      <div className="p-4">
        {/* KPI strip */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {DASHBOARD_KPIS.map((k, i) => (
            <KpiCard key={k.label} {...k} accent={i === 4 ? "red" : i === 3 ? "amber" : "green"} />
          ))}
        </div>

        {/* command centre row */}
        <div className="flex gap-3">
          {/* filter rail */}
          <div className="w-[230px] shrink-0 self-start rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
              <span className="label-caps text-clay">Belt filters</span>
              {activeFilters > 0 && (
                <button onClick={reset} className="flex items-center gap-1 text-[10px] font-semibold text-cane-700 hover:underline">
                  <RotateCcw size={10} /> Reset ({activeFilters})
                </button>
              )}
            </div>
            <FilterGroup label="Zone">
              <div className="flex flex-wrap gap-1">
                {ZONES.map((z) => (
                  <Chip key={z.id} active={zone === z.id} onClick={() => setZone(zone === z.id ? null : z.id)}>{z.id}</Chip>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup label="Cooperative">
              <select value={coop ?? ""} onChange={(e) => setCoop(e.target.value || null)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[11.5px] text-foreground outline-none focus:border-cane-500">
                <option value="">All cooperatives</option>
                {COOPERATIVES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Agronomist">
              <select value={agro ?? ""} onChange={(e) => setAgro(e.target.value || null)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[11.5px] outline-none focus:border-cane-500">
                <option value="">All agronomists</option>
                {AGRONOMISTS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Variety">
              <select value={variety ?? ""} onChange={(e) => setVariety(e.target.value || null)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[11.5px] outline-none focus:border-cane-500">
                <option value="">All varieties</option>
                {VARIETIES.map((v) => <option key={v}>{v}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Crop stage">
              <div className="space-y-1.5">
                {STAGES.map((s) => (
                  <label key={s.key} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={stages.has(s.key)}
                      onChange={() => {
                        const next = new Set(stages);
                        if (next.has(s.key)) next.delete(s.key); else next.add(s.key);
                        setStages(next);
                      }}
                      className="h-3.5 w-3.5 accent-[#2c5f2c]"
                    />
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                    <span className="text-[11.5px] text-foreground">{s.label}</span>
                  </label>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup label="Plant / Ratoon">
              <div className="flex gap-1">
                {["Plant cane", "Ratoon"].map((c) => (
                  <Chip key={c} active={cycle === c} onClick={() => setCycle(cycle === c ? null : c)}>{c}</Chip>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup label="Harvest month">
              <select value={harvest ?? ""} onChange={(e) => setHarvest(e.target.value || null)} className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[11.5px] outline-none focus:border-cane-500">
                <option value="">Any month</option>
                {["Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup label="Risk">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={riskOnly} onChange={(e) => setRiskOnly(e.target.checked)} className="h-3.5 w-3.5 accent-[#dc2626]" />
                <span className="text-[11.5px] text-foreground">Flagged farms only</span>
                <Pill tone="red" className="ml-auto">126</Pill>
              </label>
            </FilterGroup>
          </div>

          {/* map */}
          <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="label-caps text-clay">Sugarcane belt — live parcels</span>
                <span className="mono rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                  {filtered.length} parcels
                </span>
              </div>
              <div className="flex items-center gap-3">
                {STAGES.map((s) => (
                  <LegendItem key={s.key} color={s.color} label={s.label} />
                ))}
                <LegendItem color="#dc2626" label="Risk" />
              </div>
            </div>
            <BeltMap farms={filtered} height={540} onSelect={() => navigate("/farms/plot-01")} />
          </div>

          {/* intelligence rail */}
          <div className={cn("shrink-0 self-start rounded-lg border border-border bg-card transition-all", intelOpen ? "w-[330px]" : "w-[46px]")}>
            <button
              onClick={() => setIntelOpen(!intelOpen)}
              className="flex w-full items-center justify-between border-b border-border px-3.5 py-2.5"
            >
              {intelOpen && <span className="label-caps text-clay">Intelligence</span>}
              {intelOpen ? <ChevronUp size={14} className="text-stone2" /> : <ChevronDown size={14} className="mx-auto text-stone2" />}
            </button>
            {intelOpen && (
              <div className="max-h-[560px] space-y-4 overflow-y-auto p-3">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-water-600">
                    <CloudRainWind size={13} /> Weather alerts
                  </div>
                  <div className="space-y-1.5">
                    {WEATHER_ALERTS.map((a) => <AlertRow key={a.title} severity={a.severity} title={a.title} detail={a.detail} meta={a.time} />)}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-risk-orange">
                    <ClipboardCheck size={13} /> Overdue agronomic activity
                  </div>
                  <div className="space-y-1.5">
                    {OVERDUE_ACTIVITIES.map((a) => (
                      <div key={a.farm} className="rounded-md border border-border px-3 py-2" style={{ borderLeft: "3px solid #ea580c" }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold">{a.farm}</span>
                          <span className="mono text-[9.5px] font-semibold text-risk-orange">{a.overdue}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-clay">{a.activity} · {a.farmer}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-risk-red">
                    <Radar size={13} /> Crop-health anomalies
                  </div>
                  <div className="space-y-1.5">
                    {ANOMALIES.map((a) => <AlertRow key={a.farm} severity={a.severity} title={a.farm} detail={a.detail} meta={a.detected} />)}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-earth-500">
                    <PackageOpen size={13} /> Input requirements — 30 days
                  </div>
                  <div className="space-y-1.5">
                    {INPUT_REQUIREMENTS_30D.map((r) => (
                      <div key={r.input} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <div>
                          <div className="text-[11.5px] font-semibold">{r.input}</div>
                          <div className="text-[10px] text-stone2">{r.farms.toLocaleString()} farms · {r.zone}</div>
                        </div>
                        <span className="mono text-[12px] font-bold text-earth-700">{r.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* below-map analytics */}
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Panel title="Crop stage distribution">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={STAGE_DISTRIBUTION} dataKey="farms" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={2} strokeWidth={0}>
                  {STAGE_DISTRIBUTION.map((s) => <Cell key={s.key} fill={s.color} />)}
                </Pie>
                <RTooltip formatter={(v: number) => [`${v.toLocaleString()} farms`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 space-y-1">
              {STAGE_DISTRIBUTION.map((s) => (
                <LegendItem key={s.key} color={s.color} label={s.name} count={s.farms.toLocaleString()} />
              ))}
            </div>
          </Panel>

          <Panel title="Expected harvest by month" right={<span className="mono text-[10px] text-stone2">tonnes</span>}>
            <ResponsiveContainer width="100%" height={252}>
              <BarChart data={HARVEST_BY_MONTH} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e4e2dc" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#85827e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#85827e", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <RTooltip cursor={{ fill: "#f1f8ec" }} formatter={(v: number) => [`${v.toLocaleString()} t`, "Expected"]} />
                <Bar dataKey="tonnes" radius={[3, 3, 0, 0]}>
                  {HARVEST_BY_MONTH.map((m, i) => (
                    <Cell key={m.month} fill={i === 3 ? "#c2691a" : "#387735"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Input demand forecast" right={<span className="mono text-[10px] text-stone2">t / kL</span>}>
            <ResponsiveContainer width="100%" height={252}>
              <BarChart data={INPUT_DEMAND} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e4e2dc" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#85827e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#85827e", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                <RTooltip cursor={{ fill: "#f1f8ec" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                <Bar dataKey="fertilizer" name="Fertilizer (t)" stackId="a" fill="#387735" />
                <Bar dataKey="seedCane" name="Seed cane (t)" stackId="a" fill="#9ccb88" />
                <Bar dataKey="herbicide" name="Herbicide (kL)" stackId="a" fill="#e2a63d" />
                <Bar dataKey="other" name="Other" stackId="a" fill="#c8b596" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Farms requiring field inspection" right={<Pill tone="red">5 urgent</Pill>}>
            <div className="space-y-1.5">
              {INSPECTION_LIST.map((f) => (
                <button
                  key={f.farm}
                  onClick={() => navigate("/field-queue")}
                  className="hover-lift flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      f.priority === "high" ? "bg-risk-red pulse-dot" : f.priority === "medium" ? "bg-risk-orange" : "bg-water-500"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold">{f.farm}</div>
                    <div className="truncate text-[10.5px] text-clay">{f.reason} · {f.farmer}</div>
                  </div>
                  <span className="mono shrink-0 text-[10px] text-stone2">{f.due}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/field-queue")}
              className="mt-3 w-full rounded-md bg-cane-700 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-cane-800"
            >
              Open field work queue
            </button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
