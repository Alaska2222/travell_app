import pandas as pd
import requests
import random
import os
from geopy.distance import geodesic

SETT_FILE  = "C:/Users/CUMPUKTER/Desktop/Settlements.csv"
OSRM_URL   = "http://127.0.0.1:5000/route/v1/foot/"
OUTPUT     = "./route_clusters_all.csv"
bins       = [5,10,15,20,25,30,35,40,45,50,55,60]
labels     = ["5-10","10-15","15-20","20-25","25-30",
              "30-35","35-40","40-45","45-50","50-55","55-60"]
TARGETS    = {"SP":50, "EP":50, "NN":100}

df        = pd.read_csv(SETT_FILE).rename(columns={"Name":"name","Lat":"lat","Lon":"lon"})
coords    = df[['lon','lat']].values.tolist()
prio_idxs = df[df.priority>0].index.tolist()
non_idxs  = df[df.priority==0].index.tolist()

cols = ["bin","category","start","end",
        "start_lat","start_lon","end_lat","end_lon",
        "distance_km","duration_min"]
pd.DataFrame(columns=cols).to_csv(OUTPUT, index=False, encoding='utf-8-sig')

results = {lbl: {cat: [] for cat in TARGETS} for lbl in labels}
seen    = {lbl: {cat: set() for cat in TARGETS} for lbl in labels}
completed_bins = set()

def osrm_route(i, j):
    lon1,lat1 = coords[i]
    lon2,lat2 = coords[j]
    r = requests.get(f"{OSRM_URL}{lon1},{lat1};{lon2},{lat2}", params={"overview":"false"})
    r.raise_for_status()
    rt = r.json()["routes"][0]
    return rt["distance"]/1000, rt["duration"]/60
pairs = [(i, j) for i in range(len(coords)) for j in range(i+1, len(coords))]
random.shuffle(pairs)

for i, j in pairs:
    if len(completed_bins) == len(labels):
        break
    try:
        d_km, t_min = osrm_route(i, j)
    except Exception as e:
        continue

    real_lbl = None
    for lo, hi, lbl in zip(bins[:-1], bins[1:], labels):
        if lo <= d_km < hi:
            real_lbl = lbl
            break
    if real_lbl is None or real_lbl in completed_bins:
        continue
    if all(len(results[real_lbl][cat]) >= TARGETS[cat] for cat in TARGETS):
        continue
    for cat, (starts, ends) in {
        "SP": (prio_idxs, non_idxs),
        "EP": (non_idxs, prio_idxs),
        "NN": (non_idxs, non_idxs)
    }.items():
        if not (i in starts and j in ends):
            continue
        if len(results[real_lbl][cat]) >= TARGETS[cat]:
            continue
        if (i, j) in seen[real_lbl][cat]:
            continue

        seen[real_lbl][cat].add((i, j))
        results[real_lbl][cat].append((i, j, d_km, t_min))
        idx = len(results[real_lbl][cat])
        print(f"[{real_lbl}/{cat}] #{idx} added {df.at[i,'name']}→{df.at[j,'name']}: {d_km:.1f} km, {t_min:.1f} min")

    if all(len(results[real_lbl][cat]) >= TARGETS[cat] for cat in TARGETS):
        print(f"*** BIN {real_lbl} complete: " +
              ", ".join(f"{cat}={len(results[real_lbl][cat])}" for cat in TARGETS) +
              " ***")
        rows = []
        for cat in TARGETS:
            for i2, j2, d2, t2 in results[real_lbl][cat]:
                rows.append({
                    "bin": real_lbl,
                    "category": cat,
                    "start": df.at[i2,'name'],
                    "end": df.at[j2,'name'],
                    "start_lat": df.at[i2,'lat'],
                    "start_lon": df.at[i2,'lon'],
                    "end_lat": df.at[j2,'lat'],
                    "end_lon": df.at[j2,'lon'],
                    "distance_km": round(d2,2),
                    "duration_min": round(t2,1)
                })
        pd.DataFrame(rows)[cols].to_csv(
            OUTPUT, mode='a', header=False, index=False, encoding='utf-8-sig'
        )
        completed_bins.add(real_lbl)

print(f"\nFinished. Completed bins: {sorted(completed_bins)}")
print(f"Results appended to {OUTPUT}")
