# Travel App – Hiking Route Safety & Planning System
This is the official repository for my Bachelor’s diploma project, a mobile application designed to help hikers plan safe mountain routes based on real-time data and personal experience level.
Demo: https://drive.google.com/file/d/1am_WqolUjlQ-ZrALvoTM_ZJaOHhRs8d4/view?usp=drive_link

## Key Features
-  Smart Route Generator: Generates hiking routes based on experience level, distance, and desired peaks.
-  Risk Classification System: Evaluates hiking risks using weather, elevation, POIs, and terrain difficulty.
-  Map Visualization: Interactive map view using Mapy.cz API with markers for start/end points, peaks, and POIs.
-  Emergency Accessibility Metrics: Integrates Overpass API and weather data to assess safety in real-time.
-  Composite Risk Scoring: Calculates overall route risk using a modified Hiking Suitability Index (HSI) approach, inspired by Turgut et al., 2021.

##  Technologies Used
- Frontend: React Native, Tailwind CSS
- Backend: Python
- APIs: Mapy.cz, Overpass API, OpenWeather
- ML Models: XGBoost (for route classification), Decision Trees (for risk scoring)

## 📚 Academic Context
Developed as part of my Bachelor’s thesis in Computer Science, focusing on AI for environmental safety and route optimization for hikers.


