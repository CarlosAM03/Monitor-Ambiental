// app.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const cors = require("cors");
const os = require("os");
const db = require("./db");
const { calculateHeatIndex } = require("./calc");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ===============================
// 🔧 CONFIGURACIÓN GENERAL
// ===============================
let currentInterval = 2;
const HTTPS_PORT = Number(process.env.PORT || 4000);
const HTTP_PORT = Number(process.env.HTTP_PORT || 4001);

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ===============================
// 🌐 DETECTAR IP LOCAL
// ===============================
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === "IPv4" && !details.internal) {
        return details.address;
      }
    }
  }
  return "localhost";
}
const localIP = getLocalIP();

// ===============================
// 📦 API ROUTES
// ===============================
app.get("/api", (req, res) => res.json({ ok: true }));

app.get("/api/lecturas/ultimas", async (req, res) => {
  const limit = Math.min(100, Number(req.query.limit || 20));
  const rows = await db.getLatest(limit);
  res.json(rows);
});

app.get("/api/config/activa", async (req, res) => {
  const cfg = await db.getActiveConfig();
  if (!cfg) return res.status(404).json({ error: "no config found" });
  res.json(cfg);
});

app.post("/api/config", async (req, res) => {
  const cfg = req.body;
  if (cfg.interval) currentInterval = cfg.interval;
  const ok = await db.saveConfig(cfg);
  if (!ok) return res.status(500).json({ error: "no se pudo guardar config" });
  res.json({ ok: true });
});

app.get("/api/config/intervalo", async (req, res) => {
  try {
    const cfg = await db.getActiveConfig();
    const intervalo = cfg?.IntervaloSegundos || cfg?.interval || currentInterval || 1;
    res.json({ intervalo });
  } catch (err) {
    console.error("Error en /api/config/intervalo:", err);
    res.status(500).json({ error: "No se pudo obtener intervalo" });
  }
});

// ===============================
// 🧪 SIMULADOR Y DETECCIÓN RASPBERRY
// ===============================
let simulatorActive = process.env.SIMULATOR !== "false";
let raspberryDetected = false;
let lastRaspberryTime = 0;

const simulate = async () => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // ⚠️ Permite certificados self-signed
  const interval = Number(process.env.SIMULATOR_INTERVAL || 1) * 1000;
  setInterval(async () => {
    if (!simulatorActive) return;

    const temperatura = (22 + Math.random() * 8).toFixed(1);
    const humedad = (35 + Math.random() * 30).toFixed(1);
    const payload = {
      temperatura: Number(temperatura),
      humedad: Number(humedad),
      origen: "simulator",
    };

    try {
      await fetch(`https://${localIP}:${HTTPS_PORT}/api/lecturas`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        rejectUnauthorized: false
      });
    } catch (e) {
      console.error("❌ Simulador error:", e.message);
    }
  }, interval);
};

// ===============================
// 🧾 RECEPCIÓN DE DATOS
// ===============================
app.post("/api/lecturas", async (req, res) => {
  try {
    const { temperatura, humedad, origen } = req.body;
    if (temperatura === undefined || humedad === undefined) {
      return res.status(400).json({ error: "temperatura y humedad requeridos" });
    }

    if (origen && origen.toLowerCase().includes("raspberry")) {
      raspberryDetected = true;
      lastRaspberryTime = Date.now();
      if (simulatorActive) {
        console.log("📡 Raspberry detectada — desactivando simulador.");
        simulatorActive = false;
      }
    }

    if (raspberryDetected && Date.now() - lastRaspberryTime > 60000) {
      console.log("⚠️ Raspberry inactiva — reactivando simulador.");
      raspberryDetected = false;
      simulatorActive = true;
    }

    const cfg = (await db.getActiveConfig()) || {};
    const sensor = { temperature: Number(temperatura), humidity: Number(humedad) };

    const indice = calculateHeatIndex(sensor, cfg);
    const reading = { temperature: sensor.temperature, humidity: sensor.humidity, indiceTermico: indice, origen };

    const ok = await db.insertReading(reading);
    if (!ok) return res.status(500).json({ error: "no se pudo guardar lectura" });

    res.json({ ok: true, lectura: reading });
  } catch (err) {
    console.error("POST /api/lecturas error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 🎨 FRONTEND REACT BUILD
// ===============================
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api"))
    return res.status(404).json({ error: "API endpoint no encontrado" });
  res.sendFile(path.join(buildPath, "index.html"));
});

// ===============================
// 🔐 SERVIDORES HTTPS + HTTP
// ===============================
let httpsOptions = {};
try {
  httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "server.cert")),
  };
  console.log("🔐 Certificados TLS cargados correctamente.");
} catch {
  console.warn("⚠️ No se encontraron server.key / server.cert. HTTPS no se iniciará.");
}

// Servidor HTTPS
if (httpsOptions.key && httpsOptions.cert) {
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
    console.log(`✅ HTTPS server listo en: https://${localIP}:${HTTPS_PORT}`);
  });
}

// Servidor HTTP → Redirección
// 🔁 HTTP sin redirección (para Raspberry)
http.createServer(app).listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`✅ HTTP server (Raspberry) listo en: http://${getLocalIP()}:${HTTP_PORT}`);
});


// ===============================
// 🚀 SIMULADOR / ARRANQUE
// ===============================
if (simulatorActive) {
  console.log("🧪 Simulador activo (esperando Raspberry para cambiar a modo real)");
  simulate();
} else {
  console.log("📡 Modo real activo — esperando lecturas desde Raspberry.");
}
