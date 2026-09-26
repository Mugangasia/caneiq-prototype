import { useState } from "react";
import {
  Navigation, Phone, Play, MapPin, Camera, CheckCircle2, ArrowLeft,
  Bug, Leaf, PackageCheck, StickyNote, Wifi, BatteryFull, Signal, LocateFixed,
} from "lucide-react";
import { RouteMap } from "@/components/maps";
import { StageChip, Pill } from "@/components/widgets";
import { QUEUE } from "@/lib/data";
import { cn } from "@/lib/utils";

type Stop = (typeof QUEUE.high)[number];

function FarmCard({ stop, high, onStart }: { stop: Stop; high?: boolean; onStart: (s: Stop) => void }) {
  return (
    <div className={cn("rounded-xl border bg-card p-3.5", high ? "border-red-200" : "border-border")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[14px] font-bold leading-tight">{stop.farm}</div>
          <div className="mt-0.5 text-[11.5px] text-clay">{stop.farmer}</div>
        </div>
        <StageChip stage={stop.stage} size="xs" />
      </div>
      <div className={cn("mt-2 flex items-center gap-1.5 text-[12px] font-semibold", high ? "text-risk-red" : "text-cane-800")}>
        {high && <span className="h-1.5 w-1.5 rounded-full bg-risk-red pulse-dot" />}
        {stop.reason}
      </div>
      <div className="mono mt-2 flex items-center gap-3 text-[10px] text-stone2">
        <span className="flex items-center gap-1"><Navigation size={10} /> {stop.distance}</span>
        <span>ETA {stop.eta}</span>
        <span>Last visit {stop.lastVisit}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => onStart(stop)}
          className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-cane-700 text-[12px] font-bold text-white active:bg-cane-900"
        >
          <Play size={13} /> Start
        </button>
        <button className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border text-[12px] font-semibold text-clay active:bg-secondary">
          <Navigation size={13} /> Navigate
        </button>
        <button className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border text-[12px] font-semibold text-clay active:bg-secondary">
          <Phone size={13} /> Call
        </button>
      </div>
    </div>
  );
}

function VisitForm({ stop, onDone }: { stop: Stop; onDone: () => void }) {
  const [rating, setRating] = useState(4);
  const [pests, setPests] = useState<Set<string>>(new Set());
  const [verified, setVerified] = useState<Set<string>>(new Set(["NPK top-dress"]));
  const [gps, setGps] = useState(false);

  const toggle = (set: Set<string>, v: string, fn: (s: Set<string>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v); else n.add(v);
    fn(n);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button onClick={onDone} className="rounded-full p-1.5 active:bg-secondary"><ArrowLeft size={17} /></button>
        <div className="flex-1">
          <div className="text-[13px] font-bold leading-tight">Field visit — {stop.farm}</div>
          <div className="text-[10px] text-stone2">{stop.farmer} · GPS + photo verified</div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* GPS */}
        <button
          onClick={() => setGps(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left",
            gps ? "border-cane-500 bg-cane-50" : "border-dashed border-border bg-card"
          )}
        >
          <LocateFixed size={18} className={gps ? "text-cane-700" : "text-stone2"} />
          <div className="flex-1">
            <div className="text-[12.5px] font-bold">{gps ? "GPS confirmed — inside farm boundary" : "Confirm GPS location"}</div>
            {gps && <div className="mono text-[10px] text-cane-700">0.30551° N, 34.47102° E · ±4 m</div>}
          </div>
          {gps && <CheckCircle2 size={17} className="text-cane-700" />}
        </button>

        {/* photos */}
        <div>
          <div className="label-caps mb-1.5 text-stone2">Photos</div>
          <div className="grid grid-cols-2 gap-2">
            {["Canopy", "Anomaly zone"].map((p) => (
              <button key={p} className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-card text-stone2 active:bg-secondary">
                <Camera size={17} />
                <span className="text-[10.5px] font-semibold">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {/* crop health rating */}
        <div>
          <div className="label-caps mb-1.5 text-stone2">Crop health rating</div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-xl border text-[15px] font-bold transition-colors",
                  rating === n ? "border-cane-600 bg-cane-700 text-white" : "border-border bg-card text-clay"
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mono mt-1 flex justify-between text-[8.5px] text-stone2"><span>POOR</span><span>EXCELLENT</span></div>
        </div>

        {/* pests */}
        <div>
          <div className="label-caps mb-1.5 flex items-center gap-1 text-stone2"><Bug size={11} /> Pest / disease observed</div>
          <div className="flex flex-wrap gap-1.5">
            {["Stalk borer", "Smut", "Aphids", "Rat damage", "None"].map((p) => (
              <button
                key={p}
                onClick={() => toggle(pests, p, setPests)}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11.5px] font-semibold",
                  pests.has(p) ? "border-risk-orange bg-orange-50 text-risk-orange" : "border-border bg-card text-clay"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* input verification */}
        <div>
          <div className="label-caps mb-1.5 flex items-center gap-1 text-stone2"><PackageCheck size={11} /> Input verification</div>
          <div className="space-y-1.5">
            {["NPK top-dress", "Herbicide", "Seed cane"].map((i) => (
              <button
                key={i}
                onClick={() => toggle(verified, i, setVerified)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left",
                  verified.has(i) ? "border-cane-500 bg-cane-50" : "border-border bg-card"
                )}
              >
                <CheckCircle2 size={16} className={verified.has(i) ? "text-cane-700" : "text-black/15"} />
                <span className="flex-1 text-[12.5px] font-semibold">{i}</span>
                <span className="mono text-[9px] text-stone2">{verified.has(i) ? "VERIFIED" : "TAP TO VERIFY"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* notes */}
        <div>
          <div className="label-caps mb-1.5 flex items-center gap-1 text-stone2"><StickyNote size={11} /> Farmer notes</div>
          <textarea
            rows={2}
            placeholder="Short note — voice typing recommended…"
            className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-[12.5px] outline-none focus:border-cane-500"
          />
        </div>

        {/* next action */}
        <div>
          <div className="label-caps mb-1.5 flex items-center gap-1 text-stone2"><Leaf size={11} /> Recommended next action</div>
          <div className="flex flex-wrap gap-1.5">
            {["Drainage check", "Re-scout in 7 days", "Apply CAN", "Escalate to agronomist"].map((a, i) => (
              <button
                key={a}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11.5px] font-semibold",
                  i === 0 ? "border-cane-600 bg-cane-700 text-white" : "border-border bg-card text-clay"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <button onClick={onDone} className="h-12 w-full rounded-xl bg-cane-700 text-[14px] font-bold text-white active:bg-cane-900">
          Complete Visit — sync when online
        </button>
      </div>
    </div>
  );
}

export default function FieldQueue() {
  const [visiting, setVisiting] = useState<Stop | null>(null);
  const [logged, setLogged] = useState(false);

  const stops = [...QUEUE.high, ...QUEUE.today].map((s, i) => ({
    at: s.center, label: s.farm, high: i < QUEUE.high.length,
  }));

  return (
    <div className="flex min-h-full flex-col items-center bg-[#eceae4] px-4 py-8">
      <div className="mb-5 text-center">
        <h1 className="text-[18px] font-bold tracking-tight">Field Officer Work Queue</h1>
        <p className="mt-1 text-[12px] text-clay">
          Mobile-first surface for field teams — large touch targets, minimal typing, offline capture with GPS + photo verification.
        </p>
      </div>

      {/* phone frame */}
      <div className="w-full max-w-[400px] rounded-[2.2rem] border-[6px] border-earth-900 bg-card shadow-2xl">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pb-1 pt-2.5">
          <span className="mono text-[10px] font-semibold">07:42</span>
          <div className="flex items-center gap-1.5 text-stone2">
            <Signal size={11} /><Wifi size={11} /><BatteryFull size={12} />
          </div>
        </div>

        <div className="h-[640px] overflow-hidden rounded-b-[1.8rem]">
          {visiting ? (
            <VisitForm stop={visiting} onDone={() => { setVisiting(null); setLogged(true); }} />
          ) : (
            <div className="flex h-full flex-col overflow-y-auto">
              {/* header */}
              <div className="px-4 pb-3 pt-2">
                <div className="text-[20px] font-extrabold tracking-tight">Good Morning, {QUEUE.officer}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-clay">
                  <MapPin size={11} /> Today's area: <b className="text-foreground">{QUEUE.area}</b>
                  <Pill tone="green" className="ml-auto">{QUEUE.assigned} farms assigned</Pill>
                </div>
              </div>

              {logged && (
                <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-cane-300 bg-cane-50 px-3 py-2">
                  <CheckCircle2 size={14} className="text-cane-700" />
                  <span className="text-[11.5px] font-semibold text-cane-900">Visit logged — will sync when online</span>
                </div>
              )}

              {/* route map */}
              <div className="mx-4 shrink-0 overflow-hidden rounded-xl border border-border">
                <RouteMap stops={stops} />
                <div className="mono flex items-center justify-between bg-card px-3 py-1.5 text-[9px] text-stone2">
                  <span>SUGGESTED ROUTE · 5 STOPS · 21.4 KM</span>
                  <span className="text-cane-700">OPTIMIZED</span>
                </div>
              </div>

              {/* high priority */}
              <div className="px-4 pt-4">
                <div className="label-caps mb-2 flex items-center gap-1.5 text-risk-red">
                  <span className="h-1.5 w-1.5 rounded-full bg-risk-red pulse-dot" /> High priority
                </div>
                <div className="space-y-2.5">
                  {QUEUE.high.map((s) => <FarmCard key={s.farm} stop={s} high onStart={setVisiting} />)}
                </div>
              </div>

              {/* today */}
              <div className="px-4 py-4">
                <div className="label-caps mb-2 text-stone2">Today</div>
                <div className="space-y-2.5">
                  {QUEUE.today.map((s) => <FarmCard key={s.farm} stop={s} onStart={setVisiting} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
