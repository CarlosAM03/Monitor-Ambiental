// db.js
const mssql = require("mssql");
const { EventEmitter } = require("events");
require("dotenv").config();

/* ----------------------------- CONFIGURACIÓN ----------------------------- */

const useInMemory = process.env.USE_IN_MEMORY === "true";

const cfg = {
  user: process.env.SQL_USER || "",
  password: process.env.SQL_PASSWORD || "",
  database: process.env.SQL_DATABASE || "",
  server: process.env.SQL_SERVER || "",
  port: Number(process.env.SQL_PORT || 1433),
  options: {
    encrypt: process.env.SQL_ENCRYPT === "true",
    trustServerCertificate:
      process.env.SQL_TRUST === "true" || process.env.SQL_ENCRYPT === "false",
  },
  pool: { max: 5, min: 0, idleTimeoutMillis: 10000 },
};

/* ----------------------------- CLASE DB ----------------------------- */

class DB extends EventEmitter {
  constructor() {
    super();
    this.inMemory = { readings: [], config: null };
    this.pool = null;

    if (!cfg.server || !cfg.database) {
      console.warn("⚠️ Variables SQL incompletas — usando modo in-memory");
      this.inMemoryMode = true;
    } else {
      this.inMemoryMode = useInMemory;
    }

    if (!this.inMemoryMode) this.connectSQL();
    else console.log("💾 DB: usando almacenamiento en memoria (USE_IN_MEMORY=true)");
  }

  /* ----------------------------- CONEXIÓN ----------------------------- */
  async connectSQL() {
    try {
      this.pool = await mssql.connect(cfg);
      console.log("✅ DB: Conectado correctamente a SQL Server");

      const res = await this.pool
        .request()
        .query("SELECT TOP (1) * FROM ParametrosConfiguracion WHERE Activo = 1");
      if (res.recordset.length > 0) this.inMemory.config = res.recordset[0];
    } catch (err) {
      console.error("❌ DB: Error de conexión SQL - usando modo memoria:", err.message);
      this.pool = null;
      this.inMemoryMode = true;
    }
  }

  /* ----------------------------- MÉTODOS ----------------------------- */

  async insertReading(reading) {
    if (!this.inMemoryMode && this.pool) {
      try {
        const req = this.pool.request();
        req.input("temp", mssql.Float, reading.temperature);
        req.input("hum", mssql.Float, reading.humidity);
        req.input("indice", mssql.Float, reading.indiceTermico);
        req.input("origen", mssql.VarChar(50), reading.origen || "simulator");
        await req.query(`
          INSERT INTO LecturasSensor (FechaHora, Temperatura, Humedad, IndiceTermico, Origen)
          VALUES (GETDATE(), @temp, @hum, @indice, @origen)
        `);
        return true;
      } catch (err) {
        console.error("DB insertReading error:", err.message);
        return false;
      }
    } else {
      const rec = {
        IdLectura: this.inMemory.readings.length + 1,
        FechaHora: new Date(),
        Temperatura: reading.temperature,
        Humedad: reading.humidity,
        IndiceTermico: reading.indiceTermico,
        Origen: reading.origen || "simulator",
      };
      this.inMemory.readings.unshift(rec);
      if (this.inMemory.readings.length > 1000) this.inMemory.readings.pop();
      return true;
    }
  }

async getLatest(limit = 20) {
  if (!this.inMemoryMode && this.pool) {
    try {
      const res = await this.pool.request().query(`
        SELECT TOP (${limit}) IdLectura, FechaHora, Temperatura, Humedad, IndiceTermico, Origen
        FROM LecturasSensor ORDER BY IdLectura DESC
      `);

      // ✅ Ajustar hora local sumando el offset (el driver mssql devuelve UTC)
      const adjusted = res.recordset.map((row) => {
        const fecha = new Date(row.FechaHora);
        const local = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);
        return { ...row, FechaHora: local };
      });

      return adjusted;
    } catch (err) {
      console.error("DB getLatest error:", err.message);
      return [];
    }
  } else {
    // Ajuste también para modo memoria
    return this.inMemory.readings.slice(0, limit).map((r) => {
      const fecha = new Date(r.FechaHora);
      const local = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);
      return { ...r, FechaHora: local };
    });
  }
}


  async getActiveConfig() {
    if (!this.inMemoryMode && this.pool) {
      try {
        const res = await this.pool
          .request()
          .query("SELECT TOP (1) * FROM ParametrosConfiguracion WHERE Activo = 1 ORDER BY IdConfig DESC");
        return res.recordset[0] || null;
      } catch (err) {
        console.error("DB getActiveConfig error:", err.message);
        return null;
      }
    } else {
      return this.inMemory.config;
    }
  }

  async saveConfig(config) {
    if (!this.inMemoryMode && this.pool) {
      try {
        const req = this.pool.request();
        req.input("TempLimite", mssql.Float, config.tempLimit);
        req.input("HumedadLimite", mssql.Float, config.humidityLimit);
        req.input("IndiceTermicoLimite", mssql.Float, config.heatIndexLimit);
        req.input("IntervaloSegundos", mssql.Int, config.interval);
        req.input("Ancho", mssql.Float, config.width);
        req.input("Largo", mssql.Float, config.length);
        req.input("Alto", mssql.Float, config.height);
        req.input("PersonasMin", mssql.Int, config.peopleMin);
        req.input("PersonasMax", mssql.Int, config.peopleMax);
        req.input("TipoMaterial", mssql.VarChar(50), config.materialType);
        req.input("CantidadMateriales", mssql.Int, config.materialCount);
        req.input("DimMaterialAncho", mssql.Float, config.materialWidth);
        req.input("DimMaterialLargo", mssql.Float, config.materialLength);
        req.input("DimMaterialAlto", mssql.Float, config.materialHeight);
        await req.query(`
          INSERT INTO ParametrosConfiguracion
          (TempLimite, HumedadLimite, IndiceTermicoLimite, IntervaloSegundos,
           Ancho, Largo, Alto, PersonasMin, PersonasMax, TipoMaterial, CantidadMateriales,
           DimMaterialAncho, DimMaterialLargo, DimMaterialAlto, Activo)
          VALUES
          (@TempLimite, @HumedadLimite, @IndiceTermicoLimite, @IntervaloSegundos,
           @Ancho, @Largo, @Alto, @PersonasMin, @PersonasMax, @TipoMaterial, @CantidadMateriales,
           @DimMaterialAncho, @DimMaterialLargo, @DimMaterialAlto, 1)
        `);
        return true;
      } catch (err) {
        console.error("DB saveConfig error:", err.message);
        return false;
      }
    } else {
      this.inMemory.config = {
        ...config,
        IdConfig: 1,
        FechaRegistro: new Date(),
        Activo: 1,
      };
      return true;
    }
  }
}

/* ----------------------------- EXPORT ----------------------------- */
module.exports = new DB();
