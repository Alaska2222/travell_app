
import requests
import pandas as pd
import json

BOUNDING_BOX = "47.9,22.0,49.6,25.5"

def transliterate(text):
    return text.encode("ascii", "ignore").decode()

def fetch_peaks():
    query = f"""
    [out:json][timeout:100];
    node["natural"="peak"]({BOUNDING_BOX});
    out body;
    """
    response = requests.post("https://overpass-api.de/api/interpreter", data={"data": query})
    data = response.json()

    peaks = []
    for el in data['elements']:
        name = el['tags'].get('name')
        if name:
            peaks.append({
                "Id": el['id'],
                "Name": transliterate(name),
                "Lat": el['lat'],
                "Lon": el['lon']
            })
    return pd.DataFrame(peaks)

def fetch_settlements():
    query = f"""
    [out:json][timeout:100];
    (
      node["place"="village"]({BOUNDING_BOX});
      node["place"="town"]({BOUNDING_BOX});
      node["place"="city"]({BOUNDING_BOX});
    );
    out body;
    """
    response = requests.post("https://overpass-api.de/api/interpreter", data={"data": query})
    data = response.json()

    settlements = []
    for el in data['elements']:
        name = el['tags'].get('name')
        if name:
            settlements.append({
                "ID": el['id'],
                "Name": transliterate(name),
                "Lat": el['lat'],
                "Lon": el['lon']
            })
    return pd.DataFrame(settlements)

def load_dataset_and_assign_priority(settlements_df, dataset_path="DATASET.json"):
    with open(dataset_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    start_set = set()
    end_set = set()

    for item in dataset:
        if 'start' in item and isinstance(item['start'], str):
            start_set.add(item['start'].strip().lower())
        if 'end' in item and isinstance(item['end'], str):
            end_set.add(item['end'].strip().lower())

    def determine_priority(name):
        name = name.strip().lower()
        if name in start_set and name in end_set:
            return 2
        elif name in start_set or name in end_set:
            return 1
        return 0

    settlements_df['priority'] = settlements_df['Name'].apply(determine_priority)
    return settlements_df

print("Fetching peaks...")
peaks_df = fetch_peaks()
peaks_df.to_csv("Peaks.csv", index=False)
print(f"Saved {len(peaks_df)} peaks.")

print("Fetching settlements...")
settlements_df = fetch_settlements()
settlements_df = load_dataset_and_assign_priority(settlements_df)
settlements_df.to_csv("Settlements.csv", index=False)
print(f"Saved {len(settlements_df)} settlements with priority.")
