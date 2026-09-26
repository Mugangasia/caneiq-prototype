import { useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { stageOf, type BeltFarm } from "@/lib/data";
import { makePatches, mulberry32, centroid, type LatLng } from "@/lib/geo";

const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ESRI_SAT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

/* ------------------------------------------------------------------ */
/* Belt map — dashboard                                                */
/* ------------------------------------------------------------------ */

export function BeltMap({
  farms,
  height = 560,
  center = [0.318, 34.5] as LatLng,
  zoom = 12,
  onSelect,
}: {
  farms: BeltFarm[];
  height?: number;
  center?: LatLng;
  zoom?: number;
  onSelect?: (f: BeltFarm) => void;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
      zoomControl={true}
      attributionControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer url={OSM} attribution="© OpenStreetMap" />
      {farms.map((f) => {
        const s = stageOf(f.stage);
        return (
          <Polygon
            key={f.id}
            positions={f.polygon}
            pathOptions={{
              color: f.risk ? "#dc2626" : s.color,
              weight: f.risk ? 2 : 1,
              fillColor: s.color,
              fillOpacity: f.risk ? 0.75 : 0.62,
            }}
            eventHandlers={{ click: () => onSelect?.(f) }}
          >
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{f.farmer}</div>
                <div className="mono" style={{ fontSize: 10, color: "#85827e", marginBottom: 6 }}>
                  {f.id} · {f.cooperative}
                </div>
                <table style={{ fontSize: 11, lineHeight: 1.7 }}>
                  <tbody>
                    <tr><td style={{ color: "#66615a", paddingRight: 12 }}>Stage</td><td style={{ fontWeight: 600 }}>{s.label}</td></tr>
                    <tr><td style={{ color: "#66615a" }}>Area</td><td className="mono">{f.areaHa} ha</td></tr>
                    <tr><td style={{ color: "#66615a" }}>Variety</td><td className="mono">{f.variety}</td></tr>
                    <tr><td style={{ color: "#66615a" }}>Cycle</td><td>{f.cycle}</td></tr>
                    <tr><td style={{ color: "#66615a" }}>Harvest</td><td className="mono">{f.harvestMonth}</td></tr>
                  </tbody>
                </table>
                {f.risk && (
                  <div style={{ marginTop: 6, fontSize: 10.5, color: "#dc2626", fontWeight: 600 }}>
                    ⚠ Flagged for field inspection
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </MapContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Digital twin map                                                    */
/* ------------------------------------------------------------------ */

export interface TwinLayers {
  satellite: boolean;
  historical: boolean;
  boundary: boolean;
  health: boolean;
  rainfall: boolean;
  soil: boolean;
  elevation: boolean;
  readiness: boolean;
}

export function TwinMap({ polygon, layers, height = 520 }: { polygon: LatLng[]; layers: TwinLayers; height?: number }) {
  const c = centroid(polygon);
  const patches = useMemo(() => makePatches(polygon, 16, mulberry32(77)), [polygon]);
  const patchTones = ["#4c9445", "#6fb163", "#9ccb88", "#4c9445", "#6fb163", "#e2a63d", "#c2691a", "#dc2626"];

  const contours = useMemo(() => {
    const lats = polygon.map((p) => p[0]);
    const lngs = polygon.map((p) => p[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    return [0.25, 0.5, 0.75].map((t, i) => ({
      elev: 1424 - i * 6,
      line: [
        [minLat + (maxLat - minLat) * t, minLng + (maxLng - minLng) * 0.04],
        [minLat + (maxLat - minLat) * (t - 0.06), minLng + (maxLng - minLng) * 0.35],
        [minLat + (maxLat - minLat) * (t + 0.05), minLng + (maxLng - minLng) * 0.68],
        [minLat + (maxLat - minLat) * t, minLng + (maxLng - minLng) * 0.96],
      ] as LatLng[],
    }));
  }, [polygon]);

  const rainPoints = useMemo(() => {
    const lats = polygon.map((p) => p[0]);
    const lngs = polygon.map((p) => p[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    return [
      { at: [minLat + (maxLat - minLat) * 0.25, minLng + (maxLng - minLng) * 0.2] as LatLng, mm: "38 mm" },
      { at: [minLat + (maxLat - minLat) * 0.7, minLng + (maxLng - minLng) * 0.55] as LatLng, mm: "44 mm" },
      { at: [minLat + (maxLat - minLat) * 0.4, minLng + (maxLng - minLng) * 0.85] as LatLng, mm: "35 mm" },
    ];
  }, [polygon]);

  return (
    <MapContainer center={c} zoom={16} zoomControl={false} style={{ height, width: "100%" }} attributionControl={true}>
      {layers.satellite ? (
        <>
          <TileLayer
            url={ESRI_SAT}
            attribution="Esri World Imagery"
            className={layers.historical ? "sepia-[0.55] saturate-[0.6] brightness-[0.92]" : ""}
          />
          <TileLayer url={ESRI_LABELS} attribution="" opacity={0.9} />
        </>
      ) : (
        <TileLayer url={OSM} attribution="© OpenStreetMap" />
      )}

      {layers.soil && (
        <Polygon
          positions={polygon}
          pathOptions={{ color: "#8a6d3b", weight: 1.5, dashArray: "6 4", fillColor: "#8a6d3b", fillOpacity: 0.18 }}
        >
          <Tooltip permanent direction="center" className="mono" opacity={0.9}>
            <span style={{ fontSize: 10 }}>Ferralic clay loam · pH 5.8</span>
          </Tooltip>
        </Polygon>
      )}

      {layers.health &&
        patches.map((p, i) => (
          <Polygon
            key={i}
            positions={p}
            pathOptions={{
              color: "transparent",
              fillColor: i === 2 ? patchTones[7] : i === 6 || i === 7 ? patchTones[5] : patchTones[i % 5],
              fillOpacity: 0.5,
            }}
          />
        ))}

      {layers.readiness && (
        <Polygon
          positions={polygon}
          pathOptions={{ color: "#e2a63d", weight: 0, fillColor: "#e2a63d", fillOpacity: 0.16 }}
        >
          <Tooltip permanent direction="center" opacity={0.95}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>HARVEST READINESS 34%</span>
          </Tooltip>
        </Polygon>
      )}

      {layers.elevation &&
        contours.map((cl, i) => (
          <Polyline key={i} positions={cl.line} pathOptions={{ color: "#ffffff", weight: 1.4, opacity: 0.85, dashArray: "1 5", lineCap: "round" }}>
            <Tooltip permanent direction="center" opacity={0.85}>
              <span className="mono" style={{ fontSize: 9 }}>{cl.elev} m</span>
            </Tooltip>
          </Polyline>
        ))}

      {layers.rainfall &&
        rainPoints.map((r, i) => (
          <CircleMarker key={i} center={r.at} radius={16} pathOptions={{ color: "#2b7bbb", weight: 1.5, fillColor: "#2b7bbb", fillOpacity: 0.25 }}>
            <Tooltip permanent direction="top" offset={[0, -16]} opacity={0.95}>
              <span className="mono" style={{ fontSize: 10, color: "#1d639e", fontWeight: 700 }}>{r.mm}</span>
            </Tooltip>
          </CircleMarker>
        ))}

      {layers.boundary && (
        <Polygon
          positions={polygon}
          pathOptions={{ color: "#fef08a", weight: 2.5, fillColor: "#4c9445", fillOpacity: layers.health || layers.soil || layers.readiness ? 0 : 0.28, dashArray: "8 5" }}
        >
          <Tooltip sticky>
            <span style={{ fontSize: 11, fontWeight: 600 }}>Onyango Farm — Plot 01 · 6.72 ac</span>
          </Tooltip>
        </Polygon>
      )}
    </MapContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Mini map — farmer profile                                           */
/* ------------------------------------------------------------------ */

export function MiniMap({ polygons, colors, height = 240 }: { polygons: LatLng[][]; colors: string[]; height?: number }) {
  const bounds = useMemo(() => {
    const all = polygons.flat();
    return L.latLngBounds(all.map((p) => L.latLng(p[0], p[1])));
  }, [polygons]);
  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [18, 18] }} style={{ height, width: "100%" }} zoomControl={false} attributionControl={false} scrollWheelZoom={false} dragging={true}>
      <TileLayer url={ESRI_SAT} />
      {polygons.map((p, i) => (
        <Polygon key={i} positions={p} pathOptions={{ color: "#fef08a", weight: 2, fillColor: colors[i], fillOpacity: 0.55 }} />
      ))}
    </MapContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Route map — field officer                                           */
/* ------------------------------------------------------------------ */

export function RouteMap({ stops, height = 210 }: { stops: { at: LatLng; label: string; high?: boolean }[]; height?: number }) {
  const office: LatLng = [0.3092, 34.4648];
  const route = [office, ...stops.map((s) => s.at)];
  return (
    <MapContainer center={[0.305, 34.468]} zoom={13} style={{ height, width: "100%" }} zoomControl={false} attributionControl={false} scrollWheelZoom={false}>
      <TileLayer url={OSM} />
      <Polyline positions={route} pathOptions={{ color: "#2c5f2c", weight: 2.5, dashArray: "2 6", lineCap: "round" }} />
      <CircleMarker center={office} radius={6} pathOptions={{ color: "#1f3f21", fillColor: "#1f3f21", fillOpacity: 1 }}>
        <Tooltip permanent direction="bottom" offset={[0, 6]} opacity={0.9}>
          <span style={{ fontSize: 9, fontWeight: 700 }}>ZONE OFFICE</span>
        </Tooltip>
      </CircleMarker>
      {stops.map((s, i) => (
        <CircleMarker key={i} center={s.at} radius={7} pathOptions={{ color: s.high ? "#dc2626" : "#387735", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}>
          <Tooltip permanent direction="top" offset={[0, -8]} opacity={0.95}>
            <span className="mono" style={{ fontSize: 9, fontWeight: 700 }}>{i + 1}</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
