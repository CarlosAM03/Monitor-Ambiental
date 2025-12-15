import React from "react";

function SensorCard({ title, value, color, time, config }) {
  // Convertir el valor numérico para comparaciones
  const numericValue = parseFloat(value);

  // Mensaje personalizado según el parámetro
  let alertMessage = null;

  if (title === "Temperatura" && numericValue > config.tempLimit) {
    alertMessage = (
      <p className="text-sm text-red-600 mt-2 text-center">
        ⚠️ Temperatura elevada. Se recomienda ventilar el área o reducir fuentes de calor.
      </p>
    );
  } else if (title === "Humedad" && numericValue > config.humidityLimit) {
    alertMessage = (
      <p className="text-sm text-blue-600 mt-2 text-center">
        💧 Humedad alta. Use un deshumidificador o mejore la ventilación.
      </p>
    );
  } else if (
    (title.includes("Índice") || title.includes("Térmico")) &&
    numericValue > config.heatIndexLimit
  ) {
    alertMessage = (
      <p className="text-sm text-pink-600 mt-2 text-center">
        ☀️ Índice térmico elevado. Reduzca la ocupación o mejore el enfriamiento ambiental.
      </p>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-xl">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-center">
        {title}
      </h2>
      <span className={`text-4xl sm:text-5xl font-bold ${color}`}>{value}</span>
      <p className="text-gray-500 mt-2 text-sm sm:text-base">
        Última lectura: {time}
      </p>
      {alertMessage}
    </div>
  );
}

export default SensorCard;
