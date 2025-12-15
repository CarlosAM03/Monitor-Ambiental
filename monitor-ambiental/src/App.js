import React, { useState, useEffect } from "react";
import "./App.css";
import SensorCard from "./components/SensorCard";
import TemperatureChart from "./components/TemperatureChart";
import ConfigPanel from "./components/ConfigPanel";
import CONFIG from "./config";

// 🔢 Cálculo del índice térmico real (HTI)
const calculateHeatIndex = (sensor, cfg) => {
  const roomVolume = cfg.width * cfg.length * cfg.height;
  const materialVolume =
    cfg.materialCount *
    (cfg.materialWidth * cfg.materialLength * cfg.materialHeight);

  const occupationFactor = (cfg.peopleMin + cfg.peopleMax) / 2;

  const materialTemps = {
    electronic: 32,
    medicine: 25,
    food: 22,
    metal: 30,
    plastic: 27,
  };

  const T_material = materialTemps[cfg.materialType] || 25;
  const T_personas = 36.5;
  const T_ambiente = parseFloat(sensor.temperature);

  const T_emitida = (T_ambiente + T_personas + T_material) / 3;

  const baseHeat =
    T_emitida +
    (parseFloat(sensor.humidity) / 100) * 5 +
    0.6 * occupationFactor +
    0.07 * (materialVolume / roomVolume) * 100;

  return baseHeat.toFixed(2);
};

// 🔗 Función para obtener datos del backend
async function fetchSensorData() {
  try {
    const baseURL = CONFIG.API_BASE;
    const response = await fetch(`${baseURL}/api/lecturas/ultimas`);
    if (!response.ok) throw new Error("Error al obtener lecturas del servidor");
    const data = await response.json();

    return data.map((item) => ({
      temperature: parseFloat(item.Temperatura),
      humidity: parseFloat(item.Humedad),
      time: new Date(item.FechaHora).toLocaleTimeString(),
    }));
  } catch (err) {
    console.error("❌ Error en fetchSensorData:", err);
    return [];
  }
}

function App() {
  const [config, setConfig] = useState({
    tempLimit: 35,
    humidityLimit: 65,
    heatIndexLimit: 38,
    interval: 1,
    width: 5,
    length: 8,
    height: 3,
    peopleMin: 2,
    peopleMax: 5,
    materialType: "electronic",
    materialCount: 50,
    materialWidth: 0.3,
    materialLength: 0.3,
    materialHeight: 0.3,
  });

  const [data, setData] = useState({
    temperature: 0,
    humidity: 0,
    time: new Date().toLocaleTimeString(),
  });

  const [history, setHistory] = useState([]);
  const [heatIndex, setHeatIndex] = useState(0);

  // 🛰️ Cargar lecturas desde el backend periódicamente
  useEffect(() => {
    const fetchAndUpdate = async () => {
      const readings = await fetchSensorData();
      if (readings.length > 0) {
        const latest = readings[0];
        setData(latest);
        setHistory(readings.slice(0, 10));
      }
    };

    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, config.interval * 1000);
    return () => clearInterval(interval);
  }, [config.interval]);

  // ♨️ Calcular índice térmico
  useEffect(() => {
    const newHeat = calculateHeatIndex(data, config);
    setHeatIndex(newHeat);
  }, [data, config]);

  const systemStatus =
    data.temperature > config.tempLimit ||
    data.humidity > config.humidityLimit ||
    heatIndex > config.heatIndexLimit
      ? { text: "⚠️ Alerta – Parámetros fuera de rango", color: "text-red-600" }
      : { text: "🟢 En funcionamiento", color: "text-green-600" };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 bg-white p-4 rounded-2xl shadow-lg text-center w-full max-w-screen-lg">
        🌡️ Monitor Ambiental – Temperatura y Humedad
      </h1>

      {/* Panel de configuración */}
      <ConfigPanel config={config} onUpdate={setConfig} />

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-screen-xl mt-8">
        <SensorCard
          title="Temperatura"
          value={`${data.temperature}°C`}
          color={
            data.temperature > config.tempLimit ? "text-red-600" : "text-red-500"
          }
          time={data.time}
          config={config}
        />

        <SensorCard
          title="Humedad"
          value={`${data.humidity}%`}
          color={
            data.humidity > config.humidityLimit ? "text-blue-700" : "text-blue-500"
          }
          time={data.time}
          config={config}
        />

        <SensorCard
          title="Índice Térmico Real"
          value={`${heatIndex}°C`}
          color={
            heatIndex > config.heatIndexLimit ? "text-red-600" : "text-orange-600"
          }
          time={data.time}
          config={config}
        />

        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-center">
            Estado del Sistema
          </h2>
          <span className={`text-base sm:text-lg font-semibold ${systemStatus.color}`}>
            {systemStatus.text}
          </span>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Última lectura: {data.time}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="mt-10 w-full max-w-screen-xl bg-white p-4 sm:p-6 rounded-2xl shadow-lg overflow-x-auto">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">
          Tendencia de Temperatura y Humedad
        </h3>
        <TemperatureChart
          data={history}
          config={config}
          heatIndexes={history.map((item) =>
            parseFloat(calculateHeatIndex(item, config))
          )}
        />
      </div>

      {/* Tabla */}
      <div className="mt-8 w-full max-w-screen-xl bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-10 overflow-x-auto">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">
          Historial de Lecturas
        </h3>
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-blue-100 text-left">
              <th className="p-2 border">Hora</th>
              <th className="p-2 border">Temperatura</th>
              <th className="p-2 border">Humedad</th>
              <th className="p-2 border">Índice Térmico</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => {
              const computed = calculateHeatIndex(item, config);
              const tempAlert = item.temperature > config.tempLimit;
              const humAlert = item.humidity > config.humidityLimit;
              const heatAlert = computed > config.heatIndexLimit;

              return (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${
                    tempAlert || humAlert || heatAlert ? "bg-red-50" : ""
                  }`}
                >
                  <td className="p-2 border">{item.time}</td>
                  <td className={`p-2 border ${tempAlert ? "text-red-600" : ""}`}>
                    {item.temperature}°C
                  </td>
                  <td className={`p-2 border ${humAlert ? "text-red-600" : ""}`}>
                    {item.humidity}%
                  </td>
                  <td className={`p-2 border ${heatAlert ? "text-red-600" : ""}`}>
                    {computed}°C
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
