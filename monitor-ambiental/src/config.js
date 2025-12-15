// src/config.js
// ==========================================
// 🔧 CONFIGURACIÓN GLOBAL DEL FRONTEND
// ==========================================

// src/config.js
const host = window.location.hostname; // toma automáticamente localhost o IP LAN
const CONFIG = {
  API_BASE: `https://${host}:4000`,
};
export default CONFIG;

