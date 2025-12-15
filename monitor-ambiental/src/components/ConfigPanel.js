import React, { useState, useEffect } from "react";

function ConfigPanel({ config, onUpdate }) {
  const [formData, setFormData] = useState(config);

  // 🔁 Si la configuración cambia desde fuera, sincroniza el formulario
  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const parsed = {
      ...formData,
      tempLimit: parseFloat(formData.tempLimit),
      humidityLimit: parseFloat(formData.humidityLimit),
      heatIndexLimit: parseFloat(formData.heatIndexLimit),
      interval: parseInt(formData.interval),
      width: parseFloat(formData.width),
      length: parseFloat(formData.length),
      height: parseFloat(formData.height),
      peopleMin: parseInt(formData.peopleMin),
      peopleMax: parseInt(formData.peopleMax),
      materialCount: parseInt(formData.materialCount),
      materialWidth: parseFloat(formData.materialWidth),
      materialLength: parseFloat(formData.materialLength),
      materialHeight: parseFloat(formData.materialHeight),
    };
    onUpdate(parsed);
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-11/12 max-w-5xl mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-6">
        ⚙️ Configuración Ambiental
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Límite de Temperatura */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Límite de Temperatura (°C)
          </label>
          <input
            name="tempLimit"
            type="number"
            value={formData.tempLimit}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Límite de Humedad */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Límite de Humedad (%)
          </label>
          <input
            name="humidityLimit"
            type="number"
            value={formData.humidityLimit}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* ✅ Límite de Índice Térmico Real */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Límite de Índice Térmico Real (°C)
          </label>
          <input
            name="heatIndexLimit"
            type="number"
            value={formData.heatIndexLimit}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
            step="0.1"
          />
        </div>

        {/* Intervalo de actualización */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Intervalo de actualización (seg)
          </label>
          <input
            name="interval"
            type="number"
            min="1"
            value={formData.interval}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-2">
        📏 Dimensiones del Lugar
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="width"
          type="number"
          placeholder="Ancho (m)"
          value={formData.width}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
        <input
          name="length"
          type="number"
          placeholder="Largo (m)"
          value={formData.length}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
        <input
          name="height"
          type="number"
          placeholder="Alto (m)"
          value={formData.height}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
      </div>

      <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-2">
        👥 Ocupación Humana
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="peopleMin"
          type="number"
          placeholder="Personas mínimas esperadas"
          value={formData.peopleMin}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
        <input
          name="peopleMax"
          type="number"
          placeholder="Personas máximas permitidas"
          value={formData.peopleMax}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
      </div>

      <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-2">
        📦 Material Almacenado
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Tipo de material
          </label>
          <select
            name="materialType"
            value={formData.materialType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="electronic">Componentes electrónicos</option>
            <option value="medicine">Medicamentos</option>
            <option value="food">Perecederos</option>
            <option value="paper">Documentos / Papel</option>
            <option value="textile">Textiles</option>
            <option value="chemical">Material químico</option>
            <option value="metal">Metales</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Cantidad de materiales
          </label>
          <input
            name="materialCount"
            type="number"
            value={formData.materialCount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-2">
        📐 Dimensiones promedio del material (m)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="materialWidth"
          type="number"
          placeholder="Ancho"
          value={formData.materialWidth}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
        <input
          name="materialLength"
          type="number"
          placeholder="Largo"
          value={formData.materialLength}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
        <input
          name="materialHeight"
          type="number"
          placeholder="Alto"
          value={formData.materialHeight}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2"
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

export default ConfigPanel;
