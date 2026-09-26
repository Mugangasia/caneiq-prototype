import { CheckCircle2, Clock, Lock, ShieldCheck, FileText, Download, CloudRainWind, Leaf, History, ClipboardCheck, Landmark } from "lucide-react";
import { Panel, Pill, StageChip, Meter, DataRow, PageHeader } from "@/components/widgets";
import { FINANCE } from "@/lib/data";
import { formatKES } from "@/lib/geo";
import { cn } from "@/lib/utils";

const TRANCHE_ICON = {
  released: { icon: CheckCircle2, color: "#387735", bg: "#f1f8ec", ring: "#9ccb88" },
  pending: { icon: Clock, color: "#b45309", bg: "#fdf3e3", ring: "#e2a63d" },
  locked: { icon: Lock, color: "#85827e", bg: "#efede8", ring: "#d8d5cd" },
};

const RISK_TONE = {
  amber: { border: "#e2a63d", bg: "#fdf8ec", text: "#92610c" },
  cane: { border: "#9ccb88", bg: "#f5faf1", text: "#2c5f2c" },
};

export default function Financing() {
  const F = FINANCE;
  const fundedPct = (F.spent / F.budget) * 100;
  const value = F.yieldT * F.pricePerT;

  return (
    <div className="p-4">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            Production Financing Assessment
            <StageChip stage={F.stage} size="xs" />
          </span>
        }
        sub={
          <span className="mono text-[11px]">
            {F.farmer} · {F.id} · {F.farm} · {F.acres} ac sugarcane
          </span>
        }
        right={
          <>
            <Pill tone="green"><ShieldCheck size={11} /> Evidence-based — no credit score</Pill>
            <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12px] font-semibold text-clay hover:border-cane-500">
              <Download size={13} /> Export evidence pack
            </button>
          </>
        }
      />

      {/* summary band */}
      <div className="mb-3 rounded-lg border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-7">
          {[
            { l: "Total production budget", v: formatKES(F.budget) },
            { l: "Amount spent", v: formatKES(F.spent), c: "text-cane-700" },
            { l: "Remaining requirement", v: formatKES(F.remaining), c: "text-risk-orange" },
            { l: "Crop progress", v: `${F.cropProgress}%` },
            { l: "Activities completed", v: `${F.activitiesDone}%` },
            { l: "Expected harvest", v: F.harvest },
            { l: "Estimated yield", v: `${F.yieldT} t`, s: `@ KES ${F.pricePerT.toLocaleString()}/t` },
          ].map((s) => (
            <div key={s.l} className="border-l border-border pl-4 first:border-l-0 first:pl-0">
              <div className="label-caps text-[8.5px] text-stone2">{s.l}</div>
              <div className={cn("mono mt-1 text-[16px] font-semibold leading-none", s.c)}>{s.v}</div>
              {s.s && <div className="mono mt-1 text-[9.5px] text-stone2">{s.s}</div>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="label-caps shrink-0 text-stone2">Budget utilisation</span>
          <Meter value={fundedPct} className="flex-1" />
          <span className="mono text-[11px] font-semibold">{Math.round(fundedPct)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
        {/* left */}
        <div className="space-y-3 xl:col-span-3">
          {/* where the money goes */}
          <Panel title="Where the remaining KES 71,000 is required" right={<Landmark size={13} className="text-earth-500" />}>
            <div className="space-y-3">
              {F.breakdown.map((b) => (
                <div key={b.item}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] font-medium">{b.item}</span>
                    <span className="mono text-[12.5px] font-bold">{formatKES(b.amount)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Meter value={b.share * 2.2} color="#6e5327" className="flex-1" />
                    <span className="mono w-10 text-right text-[10px] text-stone2">{b.share}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-secondary px-3 py-2 text-[11px] leading-snug text-clay">
              Every line item is tied to a scheduled agronomy activity with GPS-verified history — not a farmer-declared estimate.
            </div>
          </Panel>

          {/* disbursement timeline */}
          <Panel title="Milestone-based disbursement">
            <div className="space-y-0">
              {F.tranches.map((t, i) => {
                const m = TRANCHE_ICON[t.status];
                return (
                  <div key={t.name} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < F.tranches.length - 1 && (
                      <div className="absolute left-[17px] top-9 h-[calc(100%-24px)] w-[2px] bg-border" />
                    )}
                    <div
                      className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                      style={{ background: m.bg, borderColor: m.ring }}
                    >
                      <m.icon size={15} style={{ color: m.color }} />
                    </div>
                    <div className="flex-1 rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[13px] font-bold">{t.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="mono text-[14px] font-bold">{formatKES(t.amount)}</span>
                          <Pill tone={t.status === "released" ? "green" : t.status === "pending" ? "amber" : "neutral"}>
                            {t.status.toUpperCase()}
                          </Pill>
                        </div>
                      </div>
                      <div className="mono mt-1.5 text-[10px] text-clay">{t.milestone}</div>
                      <div className="mt-1 flex items-center gap-1 text-[10.5px] text-stone2">
                        <FileText size={10} /> {t.evidence}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border border-earth-300/60 bg-[#faf6ef] px-3 py-2.5">
              <span className="text-[12px] font-semibold text-earth-700">Unfunded gap if Tranches 2–3 are declined</span>
              <span className="mono text-[14px] font-bold text-risk-red">{formatKES(41400)}</span>
            </div>
          </Panel>
        </div>

        {/* right — risk & context */}
        <div className="space-y-3 xl:col-span-2">
          <Panel title="Risk & context — production evidence">
            <div className="space-y-2">
              {F.riskCards.map((r, i) => {
                const tone = RISK_TONE[r.tone];
                const icons = [CloudRainWind, Leaf, History, ClipboardCheck];
                const Icon = icons[i];
                return (
                  <div
                    key={r.title}
                    className="rounded-md border border-border px-3 py-2.5"
                    style={{ borderLeft: `3px solid ${tone.border}`, background: tone.bg }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[12px] font-bold">
                        <Icon size={13} style={{ color: tone.text }} /> {r.title}
                      </span>
                      <span className="mono text-[10px] font-bold" style={{ color: tone.text }}>{r.level}</span>
                    </div>
                    <div className="mt-1 text-[11px] leading-snug text-clay">{r.detail}</div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Repayment capacity — modelled">
            <DataRow label="Estimated harvest" value={`${F.yieldT} t`} />
            <DataRow label="Mill price (2026/27)" value={`KES ${F.pricePerT.toLocaleString()}/t`} />
            <DataRow label="Gross harvest value" value={formatKES(value)} valueClass="text-cane-700" />
            <DataRow label="Remaining production cost" value={formatKES(F.remaining)} />
            <div className="my-1.5 border-t border-dashed border-border" />
            <DataRow label="Net position at harvest" value={formatKES(value - F.spent - F.remaining)} valueClass="text-cane-700 font-bold" />
            <div className="mt-2 text-[10px] leading-snug text-stone2">
              Modelled from mapped acreage × zone yield curve × farmer's 3-cycle history. Not a credit score.
            </div>
          </Panel>

          <Panel title="Evidence pack" right={<Pill tone="green">5 verified</Pill>}>
            <div className="space-y-1.5">
              {F.evidencePack.map((e) => (
                <div key={e.doc} className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2">
                  <CheckCircle2 size={13} className="shrink-0 text-cane-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11.5px] font-semibold">{e.doc}</div>
                    <div className="text-[10px] text-stone2">{e.meta}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full rounded-md bg-earth-700 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-earth-900">
              Share with financial institution
            </button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
