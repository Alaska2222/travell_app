import pandas as pd
import requests
import joblib
from geopy.distance import geodesic
from itertools import combinations
import json
from statistics import mode
from collections import Counter
import {MAPY_API_KEY} from '../config.js';

SETT_FILE     = "C:/Users/CUMPUKTER/Desktop/Settlements.csv"
CLUSTERS_FILE = "C:/Users/CUMPUKTER/Desktop/route_clusters_all.csv"
PEAKS_FILE    = "C:/Users/CUMPUKTER/Desktop/Peaks.csv"
MODEL_FILE    = "C:/Users/CUMPUKTER/Desktop/xgb_smote_tomek_pipeline.pkl"
LE_FILE       = "C:/Users/CUMPUKTER/Desktop/label_encoder.pkl"
DATASET_JSON  = "C:/Users/CUMPUKTER/Desktop/DATASET.json"
BASE_URL      = "https://api.mapy.cz/v1/routing/route"
TOL_DIST = 3.0  


clusters = pd.read_csv(CLUSTERS_FILE)
peaks    = pd.read_csv(PEAKS_FILE).rename(columns={"Name":"name","Lat":"lat","Lon":"lon","Elevation_m":"elevation"})
model    = joblib.load(MODEL_FILE)
le       = joblib.load(LE_FILE)

with open(DATASET_JSON, encoding='utf-8') as f:
    data = json.load(f)
df_json = pd.json_normalize(data)
df_json['n_peaks'] = df_json.peaks_on_route.apply(len)

def _round_bin(x): return int(round(x))

def _make_counter(grp):
    grp['dist_bin'] = grp.distance_km.apply(_round_bin)
    return Counter(zip(grp.dist_bin, grp.n_peaks))

default_stats, joint_stats, extent_stats = {}, {}, {}
for lvl, grp in df_json.groupby('experience_level'):
    default_stats[lvl] = {
        'dist_mean': grp.distance_km.mean(),
        'peaks_mode': mode(grp.n_peaks)
    }
    joint_stats[lvl] = _make_counter(grp)
    extent_stats[lvl] = {
        'dist_min': grp.distance_km.min(),
        'dist_max': grp.distance_km.max(),
        'peaks_min': grp.n_peaks.min(),
        'peaks_max': grp.n_peaks.max()
    }

def validate_params(exp_req, dist=None, peaks=None):
    ext = extent_stats.get(exp_req)
    if not ext: raise ValueError(f"Unknown experience level: {exp_req}")
    if dist is not None and not (ext['dist_min'] <= dist <= ext['dist_max']):
        raise ValueError(
            f"Distance {dist:.1f} km invalid for {exp_req}. "
            f"Allowed: {ext['dist_min']:.1f}-{ext['dist_max']:.1f} km.")
    if peaks is not None and not (ext['peaks_min'] <= peaks <= ext['peaks_max']):
        raise ValueError(
            f"Peaks {peaks} invalid for {exp_req}. "
            f"Allowed: {ext['peaks_min']}-{ext['peaks_max']} peaks.")

def predict_defaults(exp_req):
    validate_params(exp_req)
    stats = default_stats[exp_req]
    return stats['dist_mean'], stats['peaks_mode']

def predict_peaks(exp_req, dist_target):
    validate_params(exp_req, dist=dist_target)
    dist_bin = _round_bin(dist_target)
    cnt = joint_stats[exp_req]
    candidates = {kp: c for (db, kp), c in cnt.items() if db == dist_bin}
    return max(candidates, key=candidates.get) if candidates else default_stats[exp_req]['peaks_mode']

def predict_distance(exp_req, n_peaks):
    validate_params(exp_req, peaks=n_peaks)
    cnt = joint_stats[exp_req]
    candidates = {db: c for (db, kp), c in cnt.items() if kp == n_peaks}
    return max(candidates, key=candidates.get) if candidates else default_stats[exp_req]['dist_mean']

def predict_experience(route_row, n_peaks):
    feat = {"distance_km": route_row.distance_km,
            "estimated_duration_hours": route_row.distance_km/5.0,
            "max_elevation": peaks.elevation.max(),
            "avg_elevation": peaks.elevation.mean(),
            "n_peaks": n_peaks,
            "elev_gain_start": 0,
            "elev_gain_end": 0,
            "start_priority": 1 if getattr(route_row,'category',None)=="SP" else 0,
            "end_priority": 1 if getattr(route_row,'category',None)=="EP" else 0}
    X = pd.DataFrame([feat])
    return le.inverse_transform(model.predict(X))[0]

def find_best_peak_combo(start, end, k, multiplier=3):
    base = geodesic(start,end).km
    peaks['detour'] = peaks.apply(lambda p: geodesic(start,(p.lat,p.lon)).km + geodesic((p.lat,p.lon),end).km - base, axis=1)
    cands = peaks.nsmallest(min(len(peaks),k*multiplier),'detour')
    if k==1: return cands.head(1).copy()
    best_sum=1e9; best=None
    for combo in combinations(cands.itertuples(index=False),k):
        s=sum(p.detour for p in combo)
        if s<best_sum: best_sum, best= s, combo
    return pd.DataFrame([{'name':p.name,'lat':p.lat,'lon':p.lon,'elevation':p.elevation,'detour':p.detour} for p in best])

def validate_with_mapycz(seq):
    params={'apikey':MAPY_API_KEY,'routeType':'foot_fast'}
    slat, slon=seq[0]; elat, elon=seq[-1]
    params['start']=f"{slon},{slat}"; params['end']=f"{elon},{elat}"
    wps=seq[1:-1]
    if wps: params['waypoints']=';'.join(f"{lon},{lat}" for lat,lon in wps)
    for _ in range(5):
        try:
            r=requests.get(BASE_URL,params=params,timeout=5); r.raise_for_status(); d=r.json()
            if 'geometry' in d:
                return d['length']/1000.0, d['duration']/3600.0, d['geometry']['geometry']['coordinates']
        except: pass
    return None,None,[]
def plan_route(request):
    exp_req  = request.get('experience_level')
    dist_lim = request.get('distance_limit')
    peak_lim = request.get('peak_limit')
    if dist_lim is None and peak_lim is None:
        dist_lim, peak_lim = predict_defaults(exp_req)
    validate_params(exp_req, dist=dist_lim, peaks=peak_lim)
    rng_low, rng_high = dist_lim-TOL_DIST, dist_lim+TOL_DIST
    cands = clusters[clusters.distance_km.between(rng_low,rng_high)].sample(frac=1)
    for _, row in cands.iterrows():
        if predict_experience(row, peak_lim)!=exp_req: continue
        start=(row.start_lat,row.start_lon); end=(row.end_lat,row.end_lon)
        if peak_lim:
            sel=find_best_peak_combo(start,end,peak_lim)
            total=row.distance_km+sel.detour.sum()
            if abs(total-dist_lim)>TOL_DIST: continue
            seq=[start]+[(p.lat,p.lon) for _,p in sel.iterrows()]+[end]
        else:
            seq=[start,end]
            total=row.distance_km
        d,t,coords=validate_with_mapycz(seq)
        if d is None or abs(d-total)>TOL_DIST: continue
        return {'experience_level':exp_req,
                'start':{'name':row.start,'lat':row.start_lat,'lon':row.start_lon},
                'end':{'name':row.end,'lat':row.end_lat,'lon':row.end_lon},
                'peaks':[{'name':p["name"], 'lat':p.lat,'lon':p.lon,'elevation':p.elevation} for _,p in sel.iterrows()],
                'distance_km':round(d,2),'duration_hr':round(t,2),'route_coords':coords}
    raise ValueError(f"No suitable route for {exp_req} with distance~{dist_lim:.1f}km and {peak_lim} peaks.")
