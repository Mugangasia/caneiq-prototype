import { useLocation, Link } from "react-router";
import { ArrowLeft } from "lucide-react";

const MODULE_INFO: Record<string, { title: string; desc: string }> = {
  "/map": { title: "Full Map Workspace", desc: "Standalone GIS workbench with layer management, parcel editing and zone analytics — scoped for the next prototype iteration." },
  "/activities": { title: "Activity Register", desc: "Belt-wide log of every verified agronomic activity with GPS, photo and receipt evidence." },
  "/agronomy": { title: "Agronomy Plans", desc: "Variety-specific agronomy templates, scouting protocols and recommendation authoring." },
  "/inputs": { title: "Input Forecasting", desc: "Input demand forecasting by month, zone and cooperative, with procurement planning (82 t NPK due in 30 days)." },
  "/harvests": { title: "Harvest Forecast & Mill Planning", desc: "Tonnage forecast by month and zone against mill crushing capacity, with transport requirements." },
  "/analytics": { title: "Analytics", desc: "Cross-season yield, cost and compliance analytics across the belt." },
  "/alerts": { title: "Alerts Centre", desc: "Weather, anomaly and overdue-activity alert management with escalation rules." },
};

export default function Placeholder() {
  const { pathname } = useLocation();
  const base = "/" + (pathname.split("/")[1] ?? "");
  const info = MODULE_INFO[base] ?? { title: "Module", desc: "Scoped for the next prototype iteration." };

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <div className="label-caps text-stone2">Prototype scope</div>
        <h1 className="mt-2 text-[20px] font-bold tracking-tight">{info.title}</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-clay">{info.desc}</p>
        <p className="mt-3 text-[11px] text-stone2">
          This prototype focuses on six coherent screens: Dashboard, Farmer 360°, Farm Digital Twin, Crop Cycle, Field Queue and Financing.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-cane-700 px-4 py-2 text-[12px] font-semibold text-white hover:bg-cane-800"
        >
          <ArrowLeft size={13} /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
