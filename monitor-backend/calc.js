// calc.js
function calculateHeatIndex(sensor, cfg) {
  // sensor: { temperature, humidity }
  // cfg: configuración con dimensiones, people, materials...
  const width = cfg.width || 1;
  const length = cfg.length || 1;
  const height = cfg.height || 1;
  const roomVolume = width * length * height;

  const materialVolume =
    (cfg.materialCount || 0) *
    ((cfg.materialWidth || 0) * (cfg.materialLength || 0) * (cfg.materialHeight || 0));

  const occupationFactor = ((cfg.peopleMin || 0) + (cfg.peopleMax || 0)) / 2;

  const materialTemps = {
    electronic: 32,
    medicine: 25,
    food: 22,
    paper: 24,
    textile: 26,
    chemical: 28,
    metal: 30,
    plastico: 27,
  };

  const T_material = materialTemps[cfg.materialType] || 25;
  const T_personas = 36.5;
  const T_ambiente = parseFloat(sensor.temperature || 0);

  const T_emitida = (T_ambiente + T_personas + T_material) / 3;

  const baseHeat =
    T_emitida +
    (parseFloat(sensor.humidity || 0) / 100) * 5 +
    0.6 * occupationFactor +
    0.07 * ((roomVolume > 0) ? (materialVolume / roomVolume) * 100 : 0);

  return Number(baseHeat.toFixed(2));
}

module.exports = { calculateHeatIndex };
