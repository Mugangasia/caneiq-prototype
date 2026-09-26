"""Seed the database with the demo cane belt.

This is a faithful Python port of the frontend's deterministic mock-data
generator (frontend/src/lib/data.ts + geo.ts): same mulberry32 seed, same
call order, same zones / cooperatives / varieties — so the API serves the
same belt the prototype renders today.

Usage (from backend/, with DATABASE_URL_SYNC set):
    python -m scripts.seed
"""

import math
from datetime import date

from geoalchemy2 import WKTElement
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Cooperative, CropCycle, CropStage, Farm, Farmer, Zone

# --- mulberry32 (JS-faithful, unsigned 32-bit) -------------------------------


# The JS sequence is: a advance; t = imul(a ^ a>>>15, 1|a);
# t = (t + imul(t ^ t>>>7, 61|t)) ^ t; return ((t ^ t>>>14) >>> 0) / 2**32
def mulberry32(seed: int):
    state = {"a": seed & 0xFFFFFFFF}

    def rng() -> float:
        a = (state["a"] + 0x6D2B79F5) & 0xFFFFFFFF
        state["a"] = a
        t = ((a ^ (a >> 15)) * (a | 1)) & 0xFFFFFFFF
        t = ((t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF) ^ t
        t = (t ^ (t >> 14)) & 0xFFFFFFFF
        return t / 4294967296

    return rng


# --- geo helpers (port of geo.ts) ---------------------------------------------

M_PER_DEG_LAT = 111320


def make_field(center, w, h, rot, rng):
    d_lng = 1 / (M_PER_DEG_LAT * math.cos(math.radians(center[0])))
    corners = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
    cos_r, sin_r = math.cos(rot), math.sin(rot)
    ring = []
    for x, y in corners:
        jx = x * (0.82 + rng() * 0.36)
        jy = y * (0.82 + rng() * 0.36)
        rx = jx * cos_r - jy * sin_r
        ry = jx * sin_r + jy * cos_r
        ring.append((center[0] + ry / M_PER_DEG_LAT, center[1] + rx * d_lng))
    ring.append(ring[0])
    return ring


def ring_to_wkt(ring) -> str:
    # WKT is (lng lat); rings in the app are [lat, lng]
    coords = ", ".join(f"{lng} {lat}" for lat, lng in ring)
    return f"POLYGON(({coords}))"


# --- belt data (port of data.ts) ------------------------------------------------

ZONES = [
    ("Z1", "Zone 1 — Mumias North", (0.372, 34.442)),
    ("Z2", "Zone 2 — Mumias East", (0.348, 34.515)),
    ("Z3", "Zone 3 — West Valley", (0.302, 34.466)),
    ("Z4", "Zone 4 — Nzoia South", (0.262, 34.532)),
    ("Z5", "Zone 5 — Booker", (0.318, 34.566)),
]
COOPERATIVES = [
    "West Valley Growers",
    "Mumias Cane Union",
    "Nzoia Farmers Co-op",
    "Booker Smallholders",
    "Ekero Cane Society",
]
VARIETIES = ["CO 421", "N14", "KEN 83-737", "CO 617", "EAK73-335"]
FIRST = [
    "Peter", "Grace", "John", "Mary", "Samuel", "Faith", "David", "Rose", "James", "Alice",
    "Moses", "Agnes", "Joseph", "Beatrice", "Daniel", "Esther", "Patrick", "Lucy", "George", "Jane",
    "Francis", "Margaret", "Stephen", "Caroline", "Michael", "Hellen", "Anthony", "Susan", "Paul", "Violet",
    "Simon", "Dorcas", "Andrew", "Phoebe", "Robert", "Nancy", "Collins", "Everlyne", "Bramwel", "Judith",
]
LAST = [
    "Ochieng", "Achieng", "Otieno", "Wanjiru", "Barasa", "Njeri", "Wafula", "Anyango", "Mwangi", "Khadambi",
    "Odhiambo", "Wekesa", "Nyongesa", "Chebet", "Kiprop", "Makokha", "Wamalwa", "Auma", "Onyango", "Juma",
    "Kibet", "Muteshi", "Naliaka", "Okumu", "Simiyu", "Were", "Wanjala", "Khaemba", "Nafula", "Lusweti",
    "Omondi", "Atieno", "Kilonzo", "Mutua", "Mwende", "Kagai", "Wambui", "Gitonga", "Moraa", "Kemunto",
]
HARVEST_MONTHS = [
    date(2026, 10, 1), date(2026, 11, 1), date(2026, 12, 1),
    date(2027, 1, 1), date(2027, 2, 1), date(2027, 3, 1),
]
STAGE_KEYS = [
    CropStage.ESTABLISHMENT, CropStage.TILLERING, CropStage.GRAND_GROWTH,
    CropStage.MATURATION, CropStage.HARVEST,
]
STAGE_W = [0.16, 0.24, 0.27, 0.2, 0.13]


def pick_weighted(rng):
    r = rng()
    acc = 0.0
    for i, w in enumerate(STAGE_W):
        acc += w
        if r <= acc:
            return STAGE_KEYS[i]
    return CropStage.TILLERING


def zone_boundary(center):
    lat, lng = center
    d = 0.035
    ring = [
        (lat - d, lng - d), (lat - d, lng + d),
        (lat + d, lng + d), (lat + d, lng - d), (lat - d, lng - d),
    ]
    return WKTElement(ring_to_wkt(ring), srid=4326)


def seed(session: Session) -> None:
    if session.scalar(select(Farm).limit(1)) is not None:
        print("Database already seeded — skipping.")
        return

    coops = {name: Cooperative(name=name) for name in COOPERATIVES}
    session.add_all(coops.values())

    zones = {
        code: Zone(code=code, label=label, boundary=zone_boundary(center))
        for code, label, center in ZONES
    }
    session.add_all(zones.values())
    session.flush()

    rng = mulberry32(20260926)
    n = 0
    for zi, (code, _label, center) in enumerate(ZONES):
        count = 34 + int(rng() * 10)
        for _ in range(count):
            n += 1
            cluster_lat = center[0] + (rng() - 0.5) * 0.055
            cluster_lng = center[1] + (rng() - 0.5) * 0.06
            w = 90 + rng() * 260
            h = 90 + rng() * 260
            stage = pick_weighted(rng)
            area_ha = round(((w * h) / 10000) * (0.75 + rng() * 0.4) * 10) / 10
            risk = rng() < 0.09
            name = f"{FIRST[int(rng() * len(FIRST))]} {LAST[int(rng() * len(LAST))]}"
            coop = coops[COOPERATIVES[(zi + int(rng() * 3)) % len(COOPERATIVES)]]
            variety = VARIETIES[int(rng() * len(VARIETIES))]
            is_plant = rng() < 0.3
            ratoon = 0 if is_plant else 1 + int(rng() * 3)
            label = "Plant cane" if is_plant else f"Ratoon {ratoon}"
            if stage is CropStage.HARVEST:
                harvest = HARVEST_MONTHS[0]
            elif stage is CropStage.MATURATION:
                harvest = HARVEST_MONTHS[int(rng() * 3)]
            else:
                harvest = HARVEST_MONTHS[2 + int(rng() * 4)]
            polygon = make_field((cluster_lat, cluster_lng), w, h, rng() * math.pi, rng)

            farmer = Farmer(full_name=name, cooperative=coop)
            farm = Farm(
                code=f"FRM-{1000 + n}",
                area_ha=area_ha,
                variety=variety,
                at_risk=risk,
                boundary=WKTElement(ring_to_wkt(polygon), srid=4326),
                farmer=farmer,
                zone=zones[code],
            )
            cycle = CropCycle(
                label=label,
                ratoon_number=ratoon,
                stage=stage,
                expected_harvest=harvest,
                farm=farm,
            )
            session.add_all([farmer, farm, cycle])

    session.commit()
    print(f"Seeded {n} farms across {len(zones)} zones.")


def main() -> None:
    engine = create_engine(get_settings().database_url_sync)
    with Session(engine) as session:
        seed(session)


if __name__ == "__main__":
    main()
