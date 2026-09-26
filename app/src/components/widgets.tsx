import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { stageOf, type StageKey } from "@/lib/data";

/* Panel — the base vessel: white, hairline border, caps header */
export function Panel({
  title,
  right,
  children,
  className,
  bodyClassName,
  pad = true,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  pad?: boolean;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <h3 className="label-caps text-clay">{title}</h3>
          {right}
        </header>
      )}
      <div className={cn(pad && "p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/* KPI card — mono figure, caps label */
export function KpiCard({
  label,
  value,
  delta,
  up,
  accent,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  accent?: "green" | "amber" | "red" | "blue";
}) {
  const bar =
    accent === "red"
      ? "bg-risk-red"
      : accent === "amber"
        ? "bg-amber-500"
        : accent === "blue"
          ? "bg-water-500"
          : "bg-cane-600";
  return (
    <div className="hover-lift rounded-lg border border-border bg-card p-4">
      <div className={cn("mb-3 h-[3px] w-8 rounded-full", bar)} />
      <div className="label-caps text-clay">{label}</div>
      <div className="mono mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-2 text-[11px] font-medium",
            up === false ? "text-risk-orange" : "text-cane-700"
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

/* Stage chip */
export function StageChip({ stage, size = "sm" }: { stage: StageKey; size?: "sm" | "xs" }) {
  const s = stageOf(stage);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-black/10 font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-2 py-px text-[10px]"
      )}
      style={{ backgroundColor: s.color + "26", color: s.text === "#ffffff" ? "#2c4a26" : s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

/* Severity alert row — 3px left accent */
export function AlertRow({
  severity,
  title,
  detail,
  meta,
}: {
  severity: "high" | "medium" | "low";
  title: string;
  detail?: string;
  meta?: string;
}) {
  const color =
    severity === "high" ? "#dc2626" : severity === "medium" ? "#ea580c" : "#2b7bbb";
  return (
    <div
      className="rounded-md border border-border bg-card px-3 py-2.5"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[12.5px] font-semibold leading-snug">{title}</div>
        {meta && <div className="mono shrink-0 text-[10px] text-stone2">{meta}</div>}
      </div>
      {detail && <div className="mt-1 text-[11.5px] leading-snug text-clay">{detail}</div>}
    </div>
  );
}

/* Progress meter */
export function Meter({
  value,
  color = "#387735",
  track = "#efede8",
  className,
}: {
  value: number;
  color?: string;
  track?: string;
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full", className)} style={{ background: track }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

/* Mono label-value row */
export function DataRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-[12px] text-clay">{label}</span>
      <span className={cn("mono text-[12.5px] font-medium text-foreground", valueClass)}>{value}</span>
    </div>
  );
}

/* Pill badge */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
  className?: string;
}) {
  const tones = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    green: "bg-cane-100 text-cane-800 border-cane-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
    blue: "bg-water-100 text-water-700 border-water-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* Map legend item */
export function LegendItem({ color, label, count }: { color: string; label: string; count?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-[3px] border border-black/15" style={{ background: color }} />
      <span className="text-[11px] text-clay">{label}</span>
      {count && <span className="mono ml-auto text-[10px] text-stone2">{count}</span>}
    </div>
  );
}

/* Page header */
export function PageHeader({
  title,
  sub,
  right,
}: {
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[20px] font-bold tracking-tight">{title}</h1>
        {sub && <div className="mt-0.5 text-[12.5px] text-clay">{sub}</div>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
