import { CheckCircle2, AlertTriangle, Circle, CircleDashed, CloudRainWind, CalendarPlus, ClipboardPlus, ChevronRight } from "lucide-react";
import { Panel, Pill, StageChip } from "@/components/widgets";
import { CYCLE, LIFECYCLE } from "@/lib/data";
import { formatKES } from "@/lib/geo";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  done: { icon: CheckCircle2, color: "#387735", label: "Done" },
  overdue: { icon: AlertTriangle, color: "#ea580c", label: "Overdue" },
  upcoming: { icon: Circle, color: "#2b7bbb", label: "Scheduled" },
  planned: { icon: CircleDashed, color: "#85827e", label: "Planned" },
};

export default function CropCycle() {
  return (
    <div className="p-4">
      {/* header */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-bold tracking-tight">{CYCLE.farm}</h1>
            <StageChip stage="tillering" size="xs" />
          </div>
          <div className="mono mt-0.5 text-[10px] text-stone2">
            {CYCLE.id} · {CYCLE.farmer} · {CYCLE.variety} · {CYCLE.cycle} · planted {CYCLE.planted}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12px] font-semibold text-clay transition-colors hover:border-cane-500 hover:text-foreground">
            <CalendarPlus size={14} /> Schedule Field Visit
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-cane-700 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-cane-800">
            <ClipboardPlus size={14} /> Record Activity
          </button>
        </div>
      </div>

      {/* weather-aware recommendation */}
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-water-200 bg-water-50 px-4 py-3" style={{ borderLeft: "3px solid #2b7bbb" }}>
        <CloudRainWind size={20} className="shrink-0 text-water-600" />
        <div className="flex-1">
          <div className="text-[12.5px] font-bold text-water-700">Weather-aware recommendation</div>
          <div className="text-[12px] leading-snug text-clay">
            Heavy rainfall expected within 48 hours. Review scheduled fertilizer application — NPK top-dressing on saturated soil risks leaching losses of up to 40%.
          </div>
        </div>
        <button className="flex shrink-0 items-center gap-1 rounded-md border border-water-200 bg-card px-3 py-1.5 text-[11px] font-semibold text-water-700 hover:border-water-500">
          Reschedule to 29 Sep <ChevronRight size={12} />
        </button>
      </div>

      {/* progress stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Crop cycle complete", v: `${CYCLE.progress}%` },
          { l: "Activities completed", v: `${CYCLE.activitiesDone} of ${CYCLE.activitiesTotal}` },
          { l: "Spent to date", v: formatKES(CYCLE.spent) },
          { l: "Forecast remaining", v: formatKES(CYCLE.remaining) },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="label-caps text-stone2">{s.l}</div>
            <div className="mono mt-1 text-[20px] font-semibold">{s.v}</div>
          </div>
        ))}
      </div>

      {/* lifecycle */}
      <Panel title="Sugarcane lifecycle — one crop, planting to ratoon" pad={false}>
        <div className="overflow-x-auto">
          <div className="grid min-w-[1240px] grid-cols-8">
            {LIFECYCLE.map((stage, i) => {
              const isCurrent = i === CYCLE.currentStage;
              const isDone = i < CYCLE.currentStage;
              return (
                <div
                  key={stage.name}
                  className={cn(
                    "border-r border-border last:border-r-0",
                    isCurrent && "bg-cane-50/70",
                    isDone && "bg-[#faf9f6]"
                  )}
                >
                  {/* stage head */}
                  <div className={cn("border-b px-3 pb-2.5 pt-3", isCurrent ? "border-cane-300" : "border-border")}>
                    <div className="flex items-center gap-1.5">
                      {isDone ? (
                        <CheckCircle2 size={13} className="shrink-0 text-cane-600" />
                      ) : isCurrent ? (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-cane-600 pulse-dot" />
                      ) : (
                        <CircleDashed size={13} className="shrink-0 text-stone2" />
                      )}
                      <span className={cn("text-[11.5px] font-bold leading-tight", isCurrent ? "text-cane-900" : isDone ? "text-foreground" : "text-stone2")}>
                        {stage.name}
                      </span>
                    </div>
                    <div className="mono mt-1 text-[8.5px] uppercase tracking-wider text-stone2">{stage.window}</div>
                    {isCurrent && <Pill tone="green" className="mt-1.5">Current stage</Pill>}
                  </div>
                  {/* activities */}
                  <div className="space-y-1.5 p-2.5">
                    {stage.activities.map((a) => {
                      const m = STATUS_META[a.status];
                      return (
                        <div
                          key={a.name}
                          className={cn(
                            "rounded-md border px-2 py-1.5",
                            a.status === "overdue"
                              ? "border-risk-orange/40 bg-orange-50"
                              : a.status === "done"
                                ? "border-border bg-card"
                                : "border-dashed border-border bg-transparent"
                          )}
                        >
                          <div className="flex items-start gap-1.5">
                            <m.icon size={12} className="mt-px shrink-0" style={{ color: m.color }} />
                            <span className={cn("text-[10.5px] font-medium leading-snug", a.status === "planned" && "text-stone2")}>
                              {a.name}
                            </span>
                          </div>
                          {a.detail && (
                            <div
                              className="mono mt-1 text-[8.5px] font-semibold"
                              style={{ color: a.status === "overdue" ? "#ea580c" : a.status === "upcoming" ? "#2b7bbb" : "#85827e" }}
                            >
                              {a.detail}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </div>
  );
}
