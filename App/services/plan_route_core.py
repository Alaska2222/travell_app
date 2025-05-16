import pandas as pd
import requests
import joblib
from geopy.distance import geodesic
from itertools import combinations

SETT_FILE     = "../datasets/Settlements.csv"
CLUSTERS_FILE = "../datasets/route_clusters_all.csv"
PEAKS_FILE    = "../datasets/Desktop/Peaks.csv"
MODEL_FILE    = "../datasets/Desktop/xgb_smote_tomek_pipeline.pkl"
LE_FILE       = "../datasets/Desktop/label_encoder.pkl"
MAPYCZ_KEY    = "gFeJKlnchNFmUiLYjhegVqd2x7dJ2wq34nmUCYhtWRc"
BASE_URL      = "https://api.mapy.cz/v1/routing/route"

TOL_DIST = 3.0

sett     = pd.read_csv(SETT_FILE).rename(columns={"Name":"name","Lat":"lat","Lon":"lon"})
clusters = pd.read_csv(CLUSTERS_FILE)
peaks    = pd.read_csv(PEAKS_FILE).rename(columns={"Name":"name","Lat":"lat","Lon":"lon","Elevation_m":"elevation"})
model    = joblib.load(MODEL_FILE)
le       = joblib.load(LE_FILE)

def predict_experience(route_row, n_peaks):
    feat = {
        "distance_km": route_row.distance_km,
        "estimated_duration_hours": route_row.distance_km / 5.0,
        "max_elevation": peaks.elevation.max(),
        "avg_elevation": peaks.elevation.mean(),
        "n_peaks": n_peaks,
        "elev_gain_start": 0,
        "elev_gain_end": 0,
        "start_priority": 1 if route_row.category == "SP" else 0,
        "end_priority": 1 if route_row.category == "EP" else 0
    }
    X = pd.DataFrame([feat])
    yhat = model.predict(X)[0]
    return le.inverse_transform([yhat])[0]

def find_best_peak_combo(start, end, k, multiplier=3):
    base = geodesic(start, end).km
    peaks["detour"] = peaks.apply(lambda p: geodesic(start, (p.lat,p.lon)).km + geodesic((p.lat,p.lon), end).km - base, axis=1)
    cands = peaks.nsmallest(min(len(peaks), k*multiplier), "detour")
    if k == 1:
        return cands.head(1).copy()
    best, best_sum = None, float("inf")
    for combo in combinations(cands.itertuples(), k):
        s = sum(p.detour for p in combo)
        if s < best_sum:
            best_sum, best = s, combo
    return pd.DataFrame([{"name": p.name, "lat": p.lat, "lon": p.lon, "elevation": p.elevation, "detour": p.detour} for p in best])

def validate_with_mapycz(coord_sequence):
    params = {"apikey": MAPYCZ_KEY, "routeType": "foot_fast"}
    slat, slon = coord_sequence[0]
    elat, elon = coord_sequence[-1]
    params["start"] = f"{slon},{slat}"
    params["end"]   = f"{elon},{elat}"
    wps = coord_sequence[1:-1]
    if wps:
        params["waypoints"] = ";".join(f"{lon},{lat}" for lat, lon in wps)
    for _ in range(10):
        try:
            r = requests.get(BASE_URL, params=params)
            r.raise_for_status()
            data = r.json()
        except:
            continue
        if "geometry" in data:
            seg = data["geometry"]["geometry"]["coordinates"]
            return data.get("length",0)/1000.0, data.get("duration",0)/3600.0, seg
    return None, None, []

def plan_route(request):
    exp_req  = request["experience_level"]
    dist_lim = request.get("distance_limit")
    peak_lim = request.get("peak_limit")

    cands = clusters.copy()
    if dist_lim is not None:
        cands = cands[cands.distance_km.between(dist_lim - TOL_DIST, dist_lim + TOL_DIST)]
    cands = cands.sample(frac=1)

    for _, row in cands.iterrows():
        if predict_experience(row, peak_lim or 0) != exp_req:
            continue

        start = (row.start_lat, row.start_lon)
        end   = (row.end_lat,   row.end_lon)
        if peak_lim:
            sel   = find_best_peak_combo(start, end, peak_lim)
            total = row.distance_km + sel.detour.sum()
            if dist_lim and abs(total - dist_lim) > TOL_DIST:
                continue
            seq = [start] + [(p.lat, p.lon) for _, p in sel.iterrows()] + [end]
        else:
            sel   = pd.DataFrame(columns=["name", "lat", "lon", "elevation"])
            total = row.distance_km
            seq   = [start, end]

        mapy_d, mapy_t, full_coords = validate_with_mapycz(seq)
        if mapy_d is None or abs(mapy_d - total) > TOL_DIST:
            continue

        return {
            "experience_level": exp_req,
            "start": {
                "name": row.start,
                "lat": row.start_lat,
                "lon": row.start_lon
            },
            "end": {
                "name": row.end,
                "lat": row.end_lat,
                "lon": row.end_lon
            },
            "peaks": [
                {
                    "name":      p["name"],
                    "lat":       p["lat"],
                    "lon":       p["lon"],
                    "elevation": p["elevation"]
                }
                for _, p in sel.iterrows()
            ],
            "distance_km": round(mapy_d, 2),
            "duration_hr": round(mapy_t, 2),
            "route_coords": full_coords
        }

    return None
