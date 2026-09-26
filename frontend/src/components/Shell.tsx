import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard, Map as MapIcon, Users, Hexagon, RefreshCcw, ClipboardList,
  FlaskConical, Package, Tractor, Landmark, BarChart3, Bell, Search, ChevronDown,
  TractorIcon,
} from "lucide-react";

const NAV: { label: string; icon: typeof MapIcon; to: string; live: boolean }[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", live: true },
  { label: "Map", icon: MapIcon, to: "/map", live: false },
  { label: "Farmers", icon: Users, to: "/farmers/FMR-00482", live: true },
  { label: "Farms", icon: Hexagon, to: "/farms/plot-01", live: true },
  { label: "Crop Cycles", icon: RefreshCcw, to: "/cycles/CYC-2291", live: true },
  { label: "Activities", icon: ClipboardList, to: "/activities", live: false },
  { label: "Agronomy", icon: FlaskConical, to: "/agronomy", live: false },
  { label: "Inputs", icon: Package, to: "/inputs", live: false },
  { label: "Harvests", icon: Tractor, to: "/harvests", live: false },
  { label: "Finance", icon: Landmark, to: "/finance/FMR-00482", live: true },
  { label: "Field Queue", icon: TractorIcon, to: "/field-queue", live: true },
  { label: "Analytics", icon: BarChart3, to: "/analytics", live: false },
  { label: "Alerts", icon: Bell, to: "/alerts", live: false },
];

function CaneMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <rect width="26" height="26" rx="6" fill="#2c5f2c" />
      <path
        d="M13 21V8.5M13 12.5C13 12.5 10.8 12.2 9.6 10.6C8.4 9 8.7 6.9 8.7 6.9C8.7 6.9 11.5 7 12.6 8.9M13 10C13 10 15.2 9.7 16.4 8.1C17.6 6.5 17.3 4.4 17.3 4.4C17.3 4.4 14.5 4.5 13.4 6.4M13 16.5C13 16.5 10.5 16.3 9.2 14.6M13 16.5C13 16.5 15.5 16.3 16.8 14.6"
        stroke="#dfefd6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Shell() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ---------- left navigation ---------- */}
      <aside className="flex w-[212px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5">
          <CaneMark />
          <div>
            <div className="text-[14px] font-bold leading-none tracking-tight">CaneIQ</div>
            <div className="label-caps mt-1 text-[8.5px] text-stone2">Western Kenya Belt</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "group mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[12.5px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-black/[0.04]",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={15}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-cane-700" : "text-stone2 group-hover:text-clay"}
                  />
                  <span className="flex-1">{item.label}</span>
                  {!item.live && (
                    <span className="mono rounded border border-border px-1 py-px text-[7.5px] uppercase tracking-wider text-stone2">
                      soon
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-md bg-cane-50 p-3">
            <div className="label-caps text-[8.5px] text-cane-700">Coverage</div>
            <div className="mono mt-1.5 text-[15px] font-semibold text-cane-900">11,803 ha</div>
            <div className="mt-0.5 text-[10.5px] text-clay">5 zones · 11 cooperatives · Mumias mill shed</div>
          </div>
        </div>
      </aside>

      {/* ---------- main column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border bg-card px-4">
          <button
            onClick={() => navigate("/")}
            className="flex w-[340px] items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-left text-[12px] text-stone2 transition-colors hover:border-cane-400"
          >
            <Search size={13} />
            <span className="flex-1">Search farmers, farms, plots…</span>
            <kbd className="mono rounded border border-border bg-card px-1.5 py-px text-[9px] text-clay">⌘K</kbd>
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-clay hover:border-cane-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cane-500 pulse-dot" />
            2026/27 · Long Rains
            <ChevronDown size={13} className="text-stone2" />
          </button>
          <button className="relative rounded-md border border-border p-2 text-clay hover:border-cane-400">
            <Bell size={14} />
            <span className="mono absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-risk-red px-0.5 text-[8px] font-bold text-white">
              6
            </span>
          </button>
          <div className="flex items-center gap-2.5 border-l border-border pl-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-earth-700 text-[10px] font-bold text-white">
              GA
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-semibold">Grace Achieng</div>
              <div className="text-[10px] text-stone2">Senior Agronomist</div>
            </div>
          </div>
        </header>

        {/* content */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
