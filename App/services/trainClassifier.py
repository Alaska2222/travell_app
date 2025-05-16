import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from imblearn.pipeline import Pipeline
from imblearn.combine import SMOTETomek
from xgboost import XGBClassifier
import joblib

with open("C:/Users/CUMPUKTER/Desktop/DATASET.json", encoding="utf-8") as f:
    data = json.load(f)
df = pd.DataFrame(data)

def extract_coord(point, idx):
    coords = point.get("coordinates")
    if isinstance(coords, dict):
        return coords["lat"] if idx == 0 else coords["lon"]
    if isinstance(coords, (list, tuple)) and len(coords) >= 2:
        return coords[idx]
    return None

df["start_lat"]  = df["start_point"].apply(lambda p: extract_coord(p, 0))
df["start_lon"]  = df["start_point"].apply(lambda p: extract_coord(p, 1))
df["start_elev"] = df["start_point"].apply(lambda p: p.get("elevation"))

df["end_lat"]    = df["end_point"].apply(lambda p: extract_coord(p, 0))
df["end_lon"]    = df["end_point"].apply(lambda p: extract_coord(p, 1))
df["end_elev"]   = df["end_point"].apply(lambda p: p.get("elevation"))

peaks_df = pd.read_csv("C:/Users/CUMPUKTER/Desktop/Peaks.csv", encoding="utf-8")
sett_df = pd.read_csv("C:/Users/CUMPUKTER/Desktop/Settlements.csv", encoding="utf-8")

print(peaks_df.head())
print(sett_df.head())
priority_map = dict(zip(sett_df["Name"], sett_df["priority"]))

df["n_peaks"] = df["peaks_on_route"].apply(len)
df["elev_gain_start"] = df["max_elevation"] - df["start_point"].apply(lambda p: p["elevation"])
df["elev_gain_end"]   = df["max_elevation"] - df["end_point"].apply(lambda p: p["elevation"])
df["start_priority"]  = df["start_point"].apply(lambda p: priority_map.get(p["name"], 0))
df["end_priority"]    = df["end_point"].apply(lambda p: priority_map.get(p["name"], 0))

feature_cols = [
    "distance_km",
    "estimated_duration_hours",
    "max_elevation",
    "n_peaks",
    "elev_gain_start",
    "elev_gain_end",
    "start_priority",
    "end_priority"
]
X = df[feature_cols]
y = df["experience_level"]

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc,
    test_size=0.2,
    random_state=42,
    stratify=y_enc
)

best_params = {
    "learning_rate": 0.05,
    "max_depth": 6,
    "n_estimators": 200,
    "subsample": 0.8
}

pipeline = Pipeline([
    ("smote_tomek", SMOTETomek(random_state=42)),
    ("clf", XGBClassifier(
        learning_rate=best_params["learning_rate"],
        max_depth=best_params["max_depth"],
        n_estimators=best_params["n_estimators"],
        subsample=best_params["subsample"],
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42
    ))
])

pipeline.fit(X_train, y_train)
y_pred = pipeline.predict(X_test)

#joblib.dump(pipeline, "xgb_smote_tomek_pipeline.pkl")
#joblib.dump(le, "label_encoder.pkl")