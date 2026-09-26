import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck, Phone, MapPin, Users, CalendarDays, CloudRainWind, Landmark,
  ArrowRight, FileText, Camera,
} from "lucide-react";
import { Panel, StageChip, Pill, Meter, DataRow } from "@/components/widgets";
import { MiniMap } from "@/components/maps";
import { PETER, PETER_FARMS, PETER_TIMELINE, PETER_UPCOMING, PETER_VISITS, PETER_OUTSTANDING_INPUTS, stageOf } from "@/lib/data";
import { formatKES } from "@/lib/geo";
import { cn } from "@/lib/utils";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-l border-border pl-3 first:border-l-0 first:pl-0">
      <div className="label-caps text-stone2">{label}</div>
      <div className="mono mt-1 text-[17px] font-semibold leading-none">{value}</div>
      {sub && <div className="mt-1 text-[10.5px] text-clay">{sub}</div>}
    </div>
  );
}

function Timeline() {
  return (
    <div className="flex items-start">
      {PETER_TIMELINE.map((t, i) => (
        <div key={t.label} className="relative flex-1">
          {i < PETER_TIMELINE.length - 1 && (
            <div
              className="absolute left-[calc(50%+10px)] right-[calc(-50%+10px)] top-[7px] h-[2px]"
              style={{ background: t.done && PETER_TIMELINE[i + 1].done ? "#387735" : "#e4e2dc" }}
            />
          )}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-[15px] w-[15px] items-center justify-center rounded-full border-2",
                t.done ? "border-cane-600 bg-cane-600" : t.current ? "border-cane-600 bg-card" : "border-border bg-card"
              )}
            >
              {t.current && <div className="h-[7px] w-[7px] rounded-full bg-cane-600 pulse-dot" />}
            </div>
            <div className={cn("text-center text-[10.5px] font-semibold", t.current ? "text-cane-800" : t.done ? "text-foreground" : "text-stone2")}>
              {t.label}
            </div>
            <div className="mono text-[9px] text-stone2">{t.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinancePanel() {
  const navigate = useNavigate();
  const f = PETER.finance;
  const funded = (f.existing / f.remaining) * 100;
  return (
    <Panel
      title="Production finance"
      right={<Landmark size={13} className="text-earth-500" />}
      className="border-earth-300/60"
    >
      <DataRow label="Remaining requirement" value={formatKES(f.remaining)} />
      <DataRow label="Existing financing" value={formatKES(f.existing)} valueClass="text-cane-700" />
      <div className="my-2 border-t border-dashed border-border" />
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-risk-red">Potential funding gap</span>
        <span className="mono text-[16px] font-bold text-risk-red">{formatKES(f.gap)}</span>
      </div>
      <Meter value={funded} className="mt-2" />
      <div className="mono mt-1 text-[9.5px] text-stone2">{Math.round(funded)}% of remaining need already financed</div>
      <button
        onClick={() => navigate("/finance/FMR-00482")}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-earth-700 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-earth-900"
      >
        Open financing assessment <ArrowRight size={13} />
      </button>
    </Panel>
  );
}

export default function FarmerProfile() {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      {/* header */}
      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cane-700 text-[18px] font-bold text-white">
            PO
          </div>
          <div className="mr-4">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-tight">{PETER.name}</h1>
              <Pill tone="green"><ShieldCheck size={11} /> KYC {PETER.kyc}</Pill>
            </div>
            <div className="mono mt-0.5 text-[11px] text-stone2">{PETER.id}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11.5px] text-clay">
              <span className="flex items-center gap-1"><Users size={12} /> {PETER.cooperative}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {PETER.zone}</span>
              <span className="flex items-center gap-1"><Phone size={12} /> {PETER.phone}</span>
              <span className="flex items-center gap-1"><CalendarDays size={12} /> Member since {PETER.since}</span>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-5 gap-5">
            <Stat label="Farms" value={String(PETER.farms)} />
            <Stat label="Total acreage" value={`${PETER.totalAcres} ac`} />
            <Stat label="Under cane" value={`${PETER.caneAcres} ac`} />
            <Stat label="Active cycles" value="2" sub={PETER.cycles} />
            <Stat label="Relationship" value="Active" sub="Good standing" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          {["Overview", "Farms", "Crop Cycles", "Activities", "Costs", "Harvests", "Finance", "Documents"].map((t) => (
            <TabsTrigger
              key={t}
              value={t.toLowerCase().replace(" ", "-")}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-clay data-[state=active]:border-cane-600 data-[state=active]:bg-cane-700 data-[state=active]:text-white"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ---------------- OVERVIEW ---------------- */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="space-y-3 xl:col-span-2">
              {/* key numbers */}
              <Panel title="Current season — 2026/27">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <div className="label-caps text-stone2">Production cost to date</div>
                    <div className="mono mt-1 text-[18px] font-semibold">{formatKES(PETER.productionCost)}</div>
                  </div>
                  <div>
                    <div className="label-caps text-stone2">Expected harvest</div>
                    <div className="mono mt-1 text-[18px] font-semibold">{PETER.expectedHarvest}</div>
                  </div>
                  <div>
                    <div className="label-caps text-stone2">Estimated production</div>
                    <div className="mono mt-1 text-[18px] font-semibold">{PETER.estimatedTonnes} t</div>
                  </div>
                  <div>
                    <div className="label-caps text-stone2">Projected value</div>
                    <div className="mono mt-1 text-[18px] font-semibold text-cane-700">{formatKES(PETER.harvestValue)}</div>
                  </div>
                </div>
              </Panel>

              {/* production timeline */}
              <Panel title="Production timeline — Plot 01, plant cane">
                <Timeline />
              </Panel>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Panel title="Upcoming activities" right={<Pill tone="amber">3 due</Pill>}>
                  <div className="space-y-2">
                    {PETER_UPCOMING.map((a) => (
                      <div key={a.activity} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                        <div className="mono rounded bg-cane-50 px-2 py-1 text-center text-[9.5px] font-semibold leading-tight text-cane-800">
                          {a.date.split(" ")[0]}<br />{a.date.split(" ")[1]}
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold leading-snug">{a.activity}</div>
                          <div className="text-[10.5px] text-stone2">{a.farm} · {a.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Recent field visits">
                  <div className="space-y-2.5">
                    {PETER_VISITS.map((v) => (
                      <div key={v.date} className="border-l-2 border-cane-300 pl-3">
                        <div className="flex items-center justify-between">
                          <span className="mono text-[10.5px] font-semibold">{v.date}</span>
                          <span className="mono text-[10px] text-amber-600">{"★".repeat(v.rating)}{"☆".repeat(5 - v.rating)}</span>
                        </div>
                        <div className="text-[10px] text-stone2">{v.officer}</div>
                        <div className="mt-0.5 text-[11.5px] leading-snug text-clay">{v.note}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>

            {/* right column */}
            <div className="space-y-3">
              <Panel title="Farms — 2 mapped parcels" pad={false}>
                <MiniMap
                  polygons={PETER_FARMS.map((f) => f.polygon)}
                  colors={PETER_FARMS.map((f) => stageOf(f.stage).color)}
                  height={230}
                />
                <div className="space-y-1.5 p-3">
                  {PETER_FARMS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => navigate("/farms/plot-01")}
                      className="hover-lift flex w-full items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-left"
                    >
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: stageOf(f.stage).color }} />
                      <span className="flex-1 truncate text-[11.5px] font-semibold">{f.name}</span>
                      <span className="mono text-[10px] text-clay">{f.acres} ac</span>
                      <ArrowRight size={12} className="text-stone2" />
                    </button>
                  ))}
                </div>
              </Panel>

              <div className="rounded-lg border border-water-200 bg-water-50 p-3" style={{ borderLeft: "3px solid #2b7bbb" }}>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-water-700">
                  <CloudRainWind size={13} /> Weather alert — West Valley
                </div>
                <div className="mt-1 text-[11.5px] leading-snug text-clay">
                  Heavy rain Thu–Sat (35–60 mm). Delay the CAN top-dressing planned for 3 Oct if soils saturate.
                </div>
              </div>

              <Panel title="Outstanding inputs">
                {PETER_OUTSTANDING_INPUTS.map((i) => (
                  <div key={i.input} className="flex items-center justify-between py-1.5">
                    <div>
                      <div className="text-[12px] font-semibold">{i.input}</div>
                      <div className="text-[10px] text-stone2">Required by {i.by}</div>
                    </div>
                    <span className="mono text-[12px] font-bold">{i.qty}</span>
                  </div>
                ))}
              </Panel>

              <FinancePanel />
            </div>
          </div>
        </TabsContent>

        {/* ---------------- FARMS ---------------- */}
        <TabsContent value="farms" className="mt-0">
          <Panel title="Registered farms">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Farm", "ID", "Area", "Variety", "Cycle", "Stage", "Planted", ""].map((h) => (
                    <th key={h} className="label-caps pb-2 pr-4 text-stone2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PETER_FARMS.map((f) => (
                  <tr key={f.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4 font-semibold">{f.name}</td>
                    <td className="mono py-2.5 pr-4 text-clay">{f.id}</td>
                    <td className="mono py-2.5 pr-4">{f.acres} ac</td>
                    <td className="mono py-2.5 pr-4">{f.variety}</td>
                    <td className="py-2.5 pr-4">{f.cycle}</td>
                    <td className="py-2.5 pr-4"><StageChip stage={f.stage} size="xs" /></td>
                    <td className="mono py-2.5 pr-4 text-clay">{f.planted}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => navigate("/farms/plot-01")} className="text-[11px] font-semibold text-cane-700 hover:underline">
                        Digital twin →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </TabsContent>

        {/* ---------------- CROP CYCLES ---------------- */}
        <TabsContent value="crop-cycles" className="mt-0">
          <Panel title="Crop cycles">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Cycle", "Farm", "Variety", "Stage", "Progress", "Planted", "Est. harvest"].map((h) => (
                    <th key={h} className="label-caps pb-2 pr-4 text-stone2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { cyc: "CYC-1187", farm: "Plot 01", v: "CO 421", stage: "grandgrowth" as const, p: 61, pl: "14 Mar 2026", eh: "Mar 2027" },
                  { cyc: "CYC-1204", farm: "Plot 02", v: "N14", stage: "tillering" as const, p: 34, pl: "2 Jun 2026", eh: "Jun 2027" },
                ].map((c) => (
                  <tr key={c.cyc} className="border-b border-border/60 last:border-0">
                    <td className="mono py-2.5 pr-4 font-semibold">{c.cyc}</td>
                    <td className="py-2.5 pr-4">{c.farm}</td>
                    <td className="mono py-2.5 pr-4">{c.v}</td>
                    <td className="py-2.5 pr-4"><StageChip stage={c.stage} size="xs" /></td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <Meter value={c.p} className="w-24" />
                        <span className="mono text-[10.5px]">{c.p}%</span>
                      </div>
                    </td>
                    <td className="mono py-2.5 pr-4 text-clay">{c.pl}</td>
                    <td className="mono py-2.5 text-clay">{c.eh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </TabsContent>

        {/* ---------------- ACTIVITIES ---------------- */}
        <TabsContent value="activities" className="mt-0">
          <Panel title="Activity log — verified" right={<Pill tone="green">13 GPS-stamped</Pill>}>
            <div className="space-y-1.5">
              {[
                { d: "21 Aug 2026", a: "Second weeding + trash lining", f: "Plot 01", c: "KES 8,200" },
                { d: "2 Aug 2026", a: "Photo survey — canopy closure 70%", f: "Plot 01", c: "—" },
                { d: "14 Jun 2026", a: "NPK 17:17:17 top-dress — 110 kg", f: "Plot 01", c: "KES 21,900" },
                { d: "3 May 2026", a: "First weeding — manual, 6 labourers", f: "Plot 01", c: "KES 7,800" },
                { d: "28 Mar 2026", a: "Basal DAP applied — 125 kg", f: "Plot 01", c: "KES 18,750" },
                { d: "14 Mar 2026", a: "Planting — CO 421, 3-bud setts", f: "Plot 01", c: "KES 24,300" },
              ].map((r) => (
                <div key={r.d + r.a} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                  <Camera size={13} className="shrink-0 text-cane-600" />
                  <span className="mono w-24 shrink-0 text-[10.5px] text-stone2">{r.d}</span>
                  <span className="flex-1 text-[12px] font-medium">{r.a}</span>
                  <span className="text-[10.5px] text-stone2">{r.f}</span>
                  <span className="mono w-20 text-right text-[11px] font-semibold">{r.c}</span>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* ---------------- COSTS ---------------- */}
        <TabsContent value="costs" className="mt-0">
          <Panel title="Production costs — season to date">
            <div className="space-y-2">
              {[
                { c: "Inputs — fertilizer & herbicide", v: 56400 },
                { c: "Labour — planting, weeding, scouting", v: 31200 },
                { c: "Land preparation", v: 14600 },
                { c: "Field operations & transport", v: 6200 },
              ].map((r) => (
                <div key={r.c}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] text-clay">{r.c}</span>
                    <span className="mono text-[12px] font-semibold">{formatKES(r.v)}</span>
                  </div>
                  <Meter value={(r.v / 108400) * 100} className="mt-1" />
                </div>
              ))}
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-[12.5px] font-bold">Total spent</span>
                <span className="mono text-[15px] font-bold">{formatKES(108400)}</span>
              </div>
            </div>
          </Panel>
        </TabsContent>

        {/* ---------------- HARVESTS ---------------- */}
        <TabsContent value="harvests" className="mt-0">
          <Panel title="Harvest history">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Season", "Farm", "Tonnes", "t/ha", "Delivered to", "Payment"].map((h) => (
                    <th key={h} className="label-caps pb-2 pr-4 text-stone2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: "2024/25", f: "Plot 02 (Ratoon 3)", t: "58 t", tha: "82.1", m: "Mumias Sugar", p: "Paid in full" },
                  { s: "2023/24", f: "Plot 02 (Ratoon 2)", t: "61 t", tha: "86.4", m: "Mumias Sugar", p: "Paid in full" },
                  { s: "2022/23", f: "Plot 02 (Ratoon 1)", t: "66 t", tha: "88.0", m: "Mumias Sugar", p: "Paid in full" },
                ].map((r) => (
                  <tr key={r.s} className="border-b border-border/60 last:border-0">
                    <td className="mono py-2.5 pr-4 font-semibold">{r.s}</td>
                    <td className="py-2.5 pr-4">{r.f}</td>
                    <td className="mono py-2.5 pr-4">{r.t}</td>
                    <td className="mono py-2.5 pr-4">{r.tha}</td>
                    <td className="py-2.5 pr-4">{r.m}</td>
                    <td className="py-2.5"><Pill tone="green">{r.p}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </TabsContent>

        {/* ---------------- FINANCE ---------------- */}
        <TabsContent value="finance" className="mt-0">
          <div className="max-w-md">
            <FinancePanel />
          </div>
        </TabsContent>

        {/* ---------------- DOCUMENTS ---------------- */}
        <TabsContent value="documents" className="mt-0">
          <Panel title="Farmer documents">
            <div className="space-y-1.5">
              {[
                { d: "National ID — verified copy", m: "Uploaded 14 Feb 2021" },
                { d: "Land title — Plot 01", m: "Verified 20 Feb 2021" },
                { d: "Land lease — Plot 02", m: "Verified 3 Mar 2024" },
                { d: "Cooperative membership — West Valley", m: "Active" },
                { d: "Mill supply contract — Mumias Sugar", m: "Signed 2021" },
              ].map((r) => (
                <div key={r.d} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                  <FileText size={14} className="text-clay" />
                  <span className="flex-1 text-[12px] font-medium">{r.d}</span>
                  <span className="mono text-[10px] text-stone2">{r.m}</span>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
