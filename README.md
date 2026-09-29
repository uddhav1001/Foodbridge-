# FoodBridge - Hackathon Execution Guide

Welcome to the **FoodBridge** complete codebase. This document outlines how to execute the MERN stack application locally for your demo.

## Prerequisites
1. **Node.js** (v18+)
2. **MongoDB Atlas** account (or local MongoDB)

---

## Step 1: Database Setup
1. Open the backend environment file: `c:\FoodBridge\backend\.env`
2. Replace `<username>:<password>` and cluster details in the `MONGO_URI` with your actual MongoDB Atlas credentials.
3. Save the file.

---

## Step 2: Running the Backend
Open a terminal and run the following commands:
```bash
cd c:\FoodBridge\backend
npm install
npm run dev
```
You should see:
```text
🚀 FoodBridge API running on port 5000
📡 Socket.IO ready
✅ MongoDB Connected: cluster0.xxxx.mongodb.net
```

---

## Step 3: Running the Frontend
Open a *new* terminal window/tab and run:
```bash
cd c:\FoodBridge\frontend
npm install
npm run dev
```
You should see:
```text
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

---

## Step 4: Live Demo Flow

To properly show the real-time features to the judges, **open two different browser tabs (or windows)** side-by-side.

1. **Tab 1: The Donor**
   - Go to `http://localhost:5173`
   - Sign up as a **Food Donor**
   - Click "List Surplus Food" and fill out the form.
   - Click submit. A QR code will be generated.

2. **Tab 2: The Volunteer (The "Aha!" Moment)**
   - Open an incognito window to `http://localhost:5173` (to have a separate session)
   - Sign up/Login as a **Volunteer Rider**
   - Wait on the Volunteer Dashboard.
   - Now, switch back to Tab 1 and hit Submit to create another donation.
   - **Look at Tab 2:** The volunteer dashboard instantly updates in real-time with the new pickup and fires a toast notification! No refresh needed (Powered by Socket.IO).

3. **Tab 2: Route Map**
   - Click "View My Active Route Map" to see the dark-themed Leaflet map.

4. **Tab 3: The Admin**
   - Sign up as an **Admin**
   - Go to the Admin Dashboard.
   - Show off the Recharts BarChart (Impact) and the fully rendered interactive Leaflet Heatmap showing donation density.

5. **Show i18n:**
   - In any tab, click the 🌐 EN button in the top right Nav bar to instantly switch the UI to Hindi (🌐 HI).

---
**Good luck with Track 1!**
