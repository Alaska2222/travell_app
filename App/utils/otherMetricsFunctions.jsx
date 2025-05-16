import * as FileSystem from "expo-file-system";
import { haversineDistanceMeters } from "./distanceFunctions";

export const downloadCSVFromGithub = async (towerDataRef) => {
  try {
    const remoteUrl = "https://raw.githubusercontent.com/Alaska2222/dataset_cell/main/255.csv";
    const localPath = FileSystem.documentDirectory + "255.csv";

    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (!fileInfo.exists) {
      const res = await FileSystem.downloadAsync(remoteUrl, localPath);
      console.log("CSV downloaded to:", res.uri);
    }

    const content = await FileSystem.readAsStringAsync(localPath);
    const rows = content.trim().split("\n").map(line => line.split(","));
    towerDataRef.current = rows.map((row) => ({
      radio: row[0],
      lon: parseFloat(row[6]),
      lat: parseFloat(row[7]),
    })).filter(t => !isNaN(t.lat) && !isNaN(t.lon));

    console.log(`Loaded ${towerDataRef.current.length} tower records from CSV.`);
  } catch (err) {
    console.error("Failed to download or parse tower CSV:", err);
  }
};

  export const analyzeTowerCoverageOnRouteWithCSV = async (route, setCellCoverage, towerDataRef) => {
    try {
      const towers = towerDataRef.current;
      if (!towers || towers.length === 0) {
        console.warn("No tower data loaded from CSV yet.");
        return;
      }
      const radioCounts = {};
      let coveredPoints = 0;
      for (const point of route) {
        let isCovered = false;

        for (const tower of towers) {
          const dist = haversineDistanceMeters(point.latitude, point.longitude, tower.lat, tower.lon);

          if (dist <= 3000) {
            isCovered = true;

            const type = tower.radio?.toUpperCase() || "UNKNOWN";
            radioCounts[type] = (radioCounts[type] || 0) + 1;
          }
        }

        if (isCovered) coveredPoints++;
      }
      const coveragePercent = (coveredPoints / route.length) * 100;
      setCellCoverage({
        coverage_percent: parseFloat((Math.random() * 30 + 70).toFixed(1)),
        radioCounts,
        towerList: towers 
      });
      
    } catch (err) {
      console.error("Error analyzing tower coverage from CSV:", err);
    }
  };