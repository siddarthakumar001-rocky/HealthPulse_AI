# HealthPulse AI

<div align="center">

![HealthPulse AI Banner](https://img.shields.io/badge/HealthPulse_AI-IoMT_Digital_Twin_%26_PHC_Network-0D9488?style=for-the-badge&logo=shield&logoColor=white)

[![Version](https://img.shields.io/badge/version-1.0.0-00F5D4?style=flat-square)](https://github.com/siddhant-deshmukh/healthpulse-ai/releases)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Capacitor](https://img.shields.io/badge/Capacitor_Android-8.6-119EFF?style=flat-square&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**An enterprise-grade Internet of Medical Things (IoMT), Personal Digital Twin, and Public Healthcare Network Command Platform.**

[Features](#-core-features) • [Mobile App & Updates](#-mobile-application--in-app-software-update-system) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Android Build](#-building-the-android-apk) • [API Guide](#-api-architecture)

</div>

---

## 🌟 Core Features

### 1. 🫀 Wearable IoMT Telemetry & Digital Twin HUD
* **High-Frequency Stream Ingestion**: Connects to ESP32 biosensing hardware and Web Bluetooth Low Energy (BLE) peripherals at up to 250 Hz.
* **Low-Latency Fixed-Size Ring Buffer**: Telemetry streams are processed in high-performance memory buffers rendered onto HTML5 2D Canvas contexts with `requestAnimationFrame`, eliminating unnecessary React state re-render overhead.
* **Continuous Waveform Monitoring**: Live Lead-I ECG strip tracing, photoplethysmogram (PPG) pulse contour, dynamic SpO2 oxygenation, and skin temperature trends.
* **CSDI Imputation & Reconstruction**: Self-supervised deep neural state imputation for missing biosensor packets and packet dropout mitigation.
* **Activity & Motion Classification**: 5-class kinematic context tagging (Resting, Walking, Running, Postural Transition, Abnormal Tremor).

### 2. 🏥 Public Healthcare Network (PHC Command Hub)
* **Real-Time Geospatial Intelligence**: Interactive Leaflet maps tracking Primary Health Centres (PHCs), Community Health Centres (CHCs), and District Hospitals.
* **Live GPS Radius Radar**: Automatically locks onto device GPS coordinates and identifies operational healthcare centres within a 35 km proximity radar, with automatic regional hospital network fallback.
* **Dynamic Digital Twin Drawer**: Deep-dive telemetry inspection into individual facilities: bed capacity, staff-on-duty ratios, cold chain vaccine storage stability (2°C to 8°C), and equipment uptime.
* **Smart Medicine Redistribution**: Automated AI-driven inter-facility inventory balancing: flags imminent stockout risks and computes optimal supply redistribution transfers.
* **Epidemiological Outbreak Simulator**: Stress-tests public health infrastructure against simulated Dengue spikes, bed capacity overloads, vaccine refrigerator failures, and connectivity blackouts.

### 3. 🧪 Clinical Intelligence & OCR Analysis
* **Automated Lab Report Digestion**: Client-side OCR extracting and normalizing 35+ clinical parameters (Complete Blood Count, Lipid Profile, Liver & Kidney Function Tests, HbA1c, Electrolytes).
* **AI Clinical Decision Support**: Automated diagnostic pattern highlighting and personalized, evidence-grounded wellness suggestions.

### 4. 🚨 Multi-Channel Emergency Dispatch
* **Real-Time Anomaly Escalation**: Critical vital excursions (arrhythmias, hypoxemia, extreme bradycardia/tachycardia) trigger instant multi-tiered alerts.
* **WhatsApp & SMS Alerts**: Automated notification delivery to designated emergency contacts with live GPS coordinates and vitals snapshot.
* **Local Auditory SOS Alarm**: High-visibility audio-visual alarm HUD with one-tap emergency calling (112 / 108).

### 5. 🛡️ Enterprise Stability & Security
* **Global Error Boundary Recovery**: Intercepts client-side rendering anomalies and restores telemetry state without unmounting the application.
* **Multi-Tier Rate Limiting**: Dedicated rate limiting for authentication, device ingestion, report processing, and general endpoints.
* **NoSQL Injection Sanitization**: Strips dangerous operator keys (`$`, `{}`) from all incoming request payloads.
* **Role-Based Access Control (RBAC)**: Distinguishes Patient, Clinician, and System Admin roles with guarded routing and session tokens.

---

## 📱 Mobile Application & In-App Software Update System

HealthPulse AI includes an **integrated, automated software update engine** designed specifically for Android mobile deployments and browser installations.

```
┌────────────────────────────────────────────────────────┐
│               HealthPulse AI Update Flow               │
└────────────────────────────────────────────────────────┘
                           │
       1. App Boot / Manual "Check for Updates"
                           ▼
        ┌────────────────────────────────────┐
        │  updateService.checkForUpdates()   │
        └────────────────────────────────────┘
          │                                │
          ▼ (Primary)                      ▼ (Fallback)
┌──────────────────────┐        ┌──────────────────────┐
│ GitHub Releases API  │        │ Backend Manifest API │
│ api.github.com/...   │        │   /api/app/version   │
└──────────────────────┘        └──────────────────────┘
          │                                │
          └────────────────┬───────────────┘
                           ▼
          Compare Versions (Installed vs Latest)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
       [Up to Date]               [New Update Found]
   "You are on v1.0.0"                    │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   SoftwareUpdateModal Prompt    │
                         │ • Version badge (v1.0.0 ➔ v1.1.0)│
                         │ • Release notes & changelog     │
                         │ • Direct APK download trigger   │
                         └─────────────────────────────────┘
                                          │
                        Tap "Download & Install New Version"
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │ Browser / OS Downloads Manager  │
                         │ • Downloads app-release.apk     │
                         │ • Android Package Installer     │
                         │   prompts user to update        │
                         │ • All local data preserved      │
                         └─────────────────────────────────┘
```

### How the In-App Update Works
1. **Automated Discovery**:
   - The app automatically queries the latest published release from GitHub (`/releases/latest`) and the backend version manifest (`/api/app/version`).
   - Uses semantic versioning comparison (`compareSemver`) to verify whether an update is available.
2. **Interactive Update Modal (`SoftwareUpdateModal.tsx`)**:
   - Displays the current version versus the newly published release.
   - Shows the release title, publication date, and itemized bullet points of what's new.
   - Accessible anytime via:
     - The **Header Profile Avatar Menu** ➔ `Software Updates`
     - The **Sidebar Navigation Footer** ➔ `Updates v1.0.0`
3. **Automatic APK Download & In-Place Installation**:
   - Tapping **"Download & Install New Version (APK)"** directly triggers the download of the compiled `app-release.apk` from GitHub or the deployment server.
   - On Android devices, downloading the APK prompts the Android Package Installer:
     > *"Do you want to install an update to this existing application? Your existing data will not be lost."*
   - Clicking **Install** applies the update in-place without requiring the user to uninstall the app or re-authenticate.
4. **Alternative Channels**:
   - **GitHub Releases**: Users can view the release tag, source diff, and changelogs directly at `https://github.com/siddhant-deshmukh/healthpulse-ai/releases`.
   - **Product Website**: Web users can access the hosted web version or download the latest APK directly from the landing page.

---

## 🏗️ System Architecture

```
healthpulse-ai/
├── android/                   # Native Android Studio project (Capacitor)
│   ├── app/src/main/          # AndroidManifest.xml, native assets, Java/Kotlin bridges
│   └── build.gradle           # Native Gradle build scripts
├── backend/                   # Node.js Express REST & WebSocket API
│   ├── config/                # Database connection, JWT auth middleware, logger
│   ├── controllers/           # PHC network, AI, IoMT telemetry, report OCR controllers
│   ├── models/                # Mongoose schemas (PHC, User, HealthData, Inventory, Alerts)
│   ├── routes/                # Route definitions & rate limiters
│   └── server.js              # Express HTTP/HTTPS server bootstrap
├── src/                       # React 18 + Vite TypeScript frontend
│   ├── components/            # UI components (HUD, DigitalTwin, ErrorBoundary, UpdateModal)
│   ├── context/               # Theme context (Light / Dark mode)
│   ├── hooks/                 # ScrollFlow, telemetry, Bluetooth, speech synthesis hooks
│   ├── lib/                   # Auth provider, protected route guards, utility functions
│   ├── pages/                 # Full application routes (Dashboard, PHC, Reports, Admin, Map)
│   ├── services/              # API clients, updateService, phcService, healthService
│   ├── App.tsx                # App root, ErrorBoundary, router, notification toasts
│   └── main.tsx               # DOM root mounting
├── capacitor.config.json      # Capacitor native runtime configuration
├── vite.config.ts             # Vite build options, manual vendor chunking, plugins
└── package.json               # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher (recommended: Node 20 LTS or Node 24)
* **npm**: `v9.0.0` or higher
* **MongoDB**: A running local MongoDB instance or MongoDB Atlas connection string
* **Git**: Installed and on system `PATH`

### 1. Clone the Repository
```bash
git clone https://github.com/siddhant-deshmukh/healthpulse-ai.git
cd healthpulse-ai
```

### 2. Environment Variables Configuration

#### Frontend (`.env` in project root)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GA_TRACKING_ID=
```

#### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/healthpulse?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:8081
```

### 3. Install Dependencies
```bash
# Install frontend & root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Run the Development Server
```bash
# Starts both frontend (port 8081) and backend (port 5000) concurrently
npm run dev
```

Visit **`http://localhost:8081`** in your browser.

---

## 📦 Building the Android APK

HealthPulse AI is pre-configured with **Capacitor 8.6** for native Android APK compilation.

### Prerequisites for Mobile Builds
* **Android Studio** (Hedgehog / Iguana / Jellyfish or newer)
* **Java Development Kit (JDK)**: JDK 17 or JDK 21
* **Android SDK**: API Level 34 / 35 installed with Command-line Tools

### Step-by-Step Android Build

```bash
# 1. Compile the web assets and synchronize with the native Android project
npm run mobile:sync

# 2. Open the project inside Android Studio
npm run mobile:open
```

#### Generating Debug APK from Command Line
```bash
cd android
./gradlew assembleDebug
```
* The output APK will be generated at:  
  **`android/app/build/outputs/apk/debug/app-debug.apk`**

#### Generating Release APK (for GitHub Releases & Updates)
```bash
cd android
./gradlew assembleRelease
```
* The output APK will be generated at:  
  **`android/app/build/outputs/apk/release/app-release.apk`**

Upload this `.apk` asset to your new GitHub Release tag (e.g. `v1.0.1`), and any installed HealthPulse AI mobile app will automatically detect it and prompt users to download and update!

---

## 📡 API Architecture

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Kubernetes / Docker liveness probe | No |
| `GET` | `/ready` | Database & cache readiness probe | No |
| `GET` | `/api/app/version` | In-app software release & update manifest | No |
| `POST` | `/api/auth/register` | Patient / Clinician user registration | No |
| `POST` | `/api/auth/login` | Secure JWT token authentication | No |
| `GET` | `/api/auth/user` | Current user profile & metadata | Yes (Bearer) |
| `GET` | `/api/phc/network-overview` | Real-time PHC network KPIs & alerts | Yes (Bearer) |
| `GET` | `/api/phc/facilities` | Nearby facilities filtered by user GPS radius | Yes (Bearer) |
| `GET` | `/api/phc/digital-twin/:id`| Comprehensive facility digital twin telemetry | Yes (Bearer) |
| `POST` | `/api/phc/simulate/:scenario`| Epidemiological stress simulation engine | Yes (Bearer) |
| `GET` | `/api/phc/redistribution/recommendations` | Inter-facility inventory transfer AI engine | Yes (Bearer) |
| `POST` | `/api/device/data` | Biosensing vitals stream ingestion (250 Hz) | Yes (Bearer) |
| `POST` | `/api/reports/analyze` | OCR laboratory report parameter extraction | Yes (Bearer) |
| `POST` | `/api/alerts/emergency` | Emergency dispatch to WhatsApp & SMS contacts | Yes (Bearer) |

---

## 🔒 Security & Medical Data Governance

* **Defensive Resilience**: Global React Error Boundaries ensure uninterrupted monitoring during edge-case rendering anomalies.
* **Granular Sanitization**: Deep recursive query sanitization prevents MongoDB operator injection.
* **Bounded Buffering**: Telemetry ring buffers are capped to fixed time windows (15s to 30s) to prevent memory leaks and browser heap exhaustion.
* **Privacy First**: Sensitive vitals are processed locally in memory before optional batched transmission to the backend.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with ❤️ for resilient, accessible, and intelligence-driven community healthcare.
</div>
