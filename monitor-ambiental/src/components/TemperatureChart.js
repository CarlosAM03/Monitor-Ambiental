import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TemperatureChart({ data, config, heatIndexes }) {
  const chartRef = useRef(null);

  // 🔢 Preparar datos (clonamos antes de invertir para no alterar los originales)
  const temps = [...data.map((d) => d.temperature)].reverse();
  const hums = [...data.map((d) => d.humidity)].reverse();
  const heat = [...heatIndexes].reverse();
  const labels = data.map((d) => d.time).reverse();

  // 🔧 Escala dinámica con margen
  const allValues = [...temps, ...hums, ...heat];
  const margin = 15;
  const minY =
    Math.min(
      ...allValues,
      config.tempLimit,
      config.humidityLimit,
      config.heatIndexLimit
    ) - margin;
  const maxY =
    Math.max(
      ...allValues,
      config.tempLimit,
      config.humidityLimit,
      config.heatIndexLimit
    ) + margin;

  // 🧩 Dataset del gráfico
  const chartData = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: temps,
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.3)",
        tension: 0.3,
      },
      {
        label: "Humedad (%)",
        data: hums,
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        tension: 0.3,
      },
      {
        label: "Índice Térmico (HTI)",
        data: heat,
        borderColor: "rgb(255, 10, 173)",
        backgroundColor: "rgba(255, 10, 173, 0.3)",
        tension: 0.3,
      },
      // Líneas de límites
      {
        label: "Límite Temperatura",
        data: Array(labels.length).fill(config.tempLimit),
        borderColor: "rgba(239, 68, 68, 0.7)",
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1.2,
      },
      {
        label: "Límite Humedad",
        data: Array(labels.length).fill(config.humidityLimit),
        borderColor: "rgba(37, 99, 235, 0.7)",
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1.2,
      },
      {
        label: "Límite HTI",
        data: Array(labels.length).fill(config.heatIndexLimit),
        borderColor: "rgb(255, 10, 173, 0.5)",
        borderDash: [4, 4],
        pointRadius: 0,
        borderWidth: 1.2,
      },
    ],
  };

  // ⚙️ Configuración del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    animation: {
      duration: 600,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: {
            size: window.innerWidth < 640 ? 10 : 13,
          },
        },
      },
      title: { display: false },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        min: minY,
        max: maxY,
        title: {
          display: true,
          text: "Valores (°C / %)",
        },
        ticks: {
          font: { size: window.innerWidth < 640 ? 10 : 12 },
          color: "#374151",
        },
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 30,
          font: { size: window.innerWidth < 640 ? 9 : 12 },
          color: "#374151",
        },
      },
    },
  };

  // 🪄 Plugin para pintar fondo dinámico
  const backgroundPlugin = {
    id: "dynamicBackground",
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      // Recalcular color dinámico justo antes de pintar
      const tempsNow = chart.data.datasets[0].data;
      const humsNow = chart.data.datasets[1].data;
      const heatNow = chart.data.datasets[2].data;

      const alertNow =
        tempsNow.some((t) => t > config.tempLimit) ||
        humsNow.some((h) => h > config.humidityLimit) ||
        heatNow.some((hti) => hti > config.heatIndexLimit);

      const dynamicColor = alertNow
        ? "rgba(255, 0, 0, 0.08)" // rojo translúcido
        : "rgba(0, 255, 0, 0.08)"; // verde translúcido

      ctx.save();
      ctx.fillStyle = dynamicColor;
      ctx.fillRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );
      ctx.restore();
    },
  };

  // 🔁 Forzar actualización visual cuando cambian los datos o límites
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data, config, heatIndexes]);

  return (
    <div className="w-full h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] transition-all duration-300">
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[backgroundPlugin]}
      />
    </div>
  );
}

export default TemperatureChart;
