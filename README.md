# 🕉️ AstraRoute AI for Simhastha 2028 A Smart Pilgrim Route Planner

_A modern, crowd-aware route planning web application for Simhastha 2028 in Ujjain._

The app helps pilgrims and event organizers find the safest and most efficient routes by dynamically avoiding crowded areas in real time.

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [How-It-Works](#-how-it-works)
- [Architecture Overview](#-architecture-overview)
- [Key Components](#-key-components)
- [Crowd Simulation & Routing Logic](#-crowd-simulation--routing-logic)
- [Technologies Used](#-technologies-used)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Extending the App](#-extending-the-app)
- [Notes](#-notes)

---

## 🔍 Overview

**Simhastha 2028 Smart Pilgrim Route Planner** is a modern React web application built to assist during the Simhastha 2028 event in Ujjain.  
It focuses on safe, efficient movement by dynamically calculating routes that avoid crowded zones using real-time or simulated crowd data.

---

## ✨ Features

- 🗺️ **Interactive Map** – Pan, zoom, and explore a live map of Ujjain.
- 🚶 **Dynamic Routing** – Calculates optimal routes that avoid crowded areas.
- 👥 **Crowd Simulation** – Right-click to add simulated people/crowds at any location.
- 🛣️ **Multiple Route Options** – Direct, avoidance, and alternative routes with analysis.
- 📊 **Route Analysis** – Distance, crowd intersection, number of points, efficiency score.
- 💻 **Modern UI** – Clean, responsive UI with side panels for controls and route details.
- 🧱 **Error Handling** – Error boundaries prevent the app from crashing due to runtime errors.

---

## 🧭 How It Works

1. **Set Start and End Points**

   - Left-click on the map to set the **start** point.
   - Left-click again to set the **end** point.
   - A third left-click resets the start point and lets you choose again.

2. **Simulate Crowds**

   - Right-click on the map to add a **person** at that location.
   - The app groups nearby people into **crowd zones** and displays them as circles with colors depending on density (green, orange, red, dark red).

3. **Calculate Routes**

   - Click the **“Calculate Routes”** button.
   - The app requests multiple route types:
     - **Direct Route** – shortest path between start and end.
     - **Avoidance Route** – attempts to route around the most crowded zones.
     - **Alternative Route** – an extra option if OSRM provides one.
   - Each route is analyzed for how much it overlaps with crowd zones and given an efficiency score.

4. **View and Analyze Routes**

   - Switch between route options from the sidebar or dedicated UI controls.
   - See route type, distance, total points, crowd intersections, and efficiency score.

5. **Reset / Clear**
   - **Clear All** – remove all crowds and routes.
   - **Add Test Crowds** – quickly populate the map with a sample crowded scenario.

---

## 🏗️ Architecture Overview

- **App.jsx** – Entry point; wraps the main content in an error boundary and renders the map UI.
- **DynamicRoadRouting.jsx** – Core feature component; manages map state, crowds, routing, and panels.
- **DynamicPopulationGrid** – Manages population data and builds crowd zones based on density.
- **DynamicOSRMRouter** – Talks to OSRM for routing and applies crowd-aware logic.
- **MapClickHandler** – Handles all left-click and right-click events on the map via React-Leaflet.

---

## 🧩 Key Components

### `DynamicRoadRouting.jsx`

- Central hub for routing, map, and UI.
- Manages state for:
  - Start and end points.
  - Crowd points and computed crowd zones.
  - Available routes (direct, avoidance, alternative).
  - Selected route and UI controls.
- Triggers route calculations and updates the map and side panels accordingly.

### `DynamicPopulationGrid`

- Tracks individual people placed on the map.
- Clusters nearby people into **crowd zones** with:
  - Center coordinates.
  - Radius.
  - Population count.
  - Routing **weight** used to penalize travel through that zone.
- Supplies data for visualization (circles) and for scoring routes.

### `DynamicOSRMRouter`

- Integrates with the **OSRM** public demo server.
- Requests:
  - Standard shortest-path routes.
  - Routes with extra waypoints for crowd avoidance.
  - Alternative routes, when available.
- For each route, computes:
  - Overlap with crowd zones.
  - Aggregated crowd weights.
  - Metrics for route scoring and comparison.

### `MapClickHandler`

- Uses `useMapEvents` from **React-Leaflet**.
- Handles:
  - Left-clicks to set start and end markers.
  - Right-clicks to add simulated people.
- Forwards events to `DynamicRoadRouting` to update global state.

---

## 🧮 Crowd Simulation & Routing Logic

### Crowd Zones

- Each right-click adds an individual **person** to the map.
- Nearby people are grouped into **zones** based on proximity.
- Each zone contains:
  - Center latitude/longitude.
  - Radius (zone size).
  - Total population count.
  - A **weight** that influences route scoring.
- Zones are shown as colored circles representing density:
  - 🟢 Low density.
  - 🟠 Medium density.
  - 🔴 High density.
  - 🟥 Very high density.

### Routing Logic

- OSRM provides baseline routing between start and end coordinates.
- For crowd avoidance:
  - The app identifies the most problematic crowd zones along the straight path.
  - Waypoints are injected to nudge OSRM around those zones when possible.
- After routes are fetched:
  - Each route’s geometry points are checked against crowd zones.
  - The app counts how many points fall inside zones and sums their weights.
  - It calculates:
    - Total segment count.
    - Number of crowded segments.
    - Average crowd weight.
    - Approximate distance.
    - Final **efficiency score** (higher = better, less crowd exposure).

---

## 🛠️ Technologies Used

- ⚛️ **React** – Component-based UI library.
- 🗺️ **React-Leaflet** & **Leaflet** – Map rendering and interaction.
- 🌍 **OpenStreetMap** – Base map tiles and geographic data.
- 🧮 **OSRM** – Routing engine (public demo server instance).
- ✨ **JavaScript (ES6+)** – Application logic and utilities.

---

## 🚀 Getting Started

1. **Install dependencies**

2. **Start the development server**

3. **Open in browser**

- Visit the local development URL, typically:  
  `http://localhost:5173`

---

## 🔧 Extending the App

Potential enhancements:

- 🔄 Plug in **real-time crowd data** from sensors or APIs instead of pure simulation.
- 👤 Add **authentication and roles** (pilgrims vs organizers, admins, etc.).
- 🌐 Add **multi-language support** for diverse pilgrim groups.
- 📈 Store and visualize historical routes and crowd data for planning and analytics.

---

## 📝 Notes

- ⚠️ The OSRM public demo server is intended for testing and has rate and usage limits. For production deployment, host a dedicated OSRM instance.
- 🧪 The simulation tools (`Add Test Crowds` and right-click crowd placement) are ideal for demo scenarios, testing, and UX validation before integrating live data.
- 🕉️ While designed around **Simhastha 2028 in Ujjain**, the architecture can be adapted for other large-scale religious or public events.
