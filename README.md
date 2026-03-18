
# 🌡️ Monitor Ambiental – Sistema de Monitoreo de Temperatura y Humedad
---

Sistema funcional para monitorear la temperatura y humedad de un espacio cerrado, procesando datos mediante un microcontrolador **Raspberry Pi Pico W** y un sensor ambiental (**DHT22 o BME280**), con visualización en tiempo real en una página web interactiva. Proyecto desarrollado en el **Instituto Tecnológico de Tijuana**.

---

## 📌 Tabla de Contenidos

- [Objetivo del Proyecto](#objetivo-del-proyecto)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Pruebas y Resultados](#pruebas-y-resultados)
- [Conclusiones](#conclusiones)
- [Autores](#autores)

---

## 🎯 Objetivo del Proyecto

**General:**  
Desarrollar un sistema que permita medir y visualizar en tiempo real la temperatura y humedad de un espacio cerrado, generando alertas cuando los valores excedan los límites seguros configurados.

**Específicos:**

- Capturar datos ambientales mediante sensor DHT11 o BME280.
- Programar la Raspberry Pi Pico en MicroPython para enviar los datos al backend.
- Diseñar una página web para visualización de datos en tiempo real.
- Configurar límites máximos de temperatura y humedad.
- Generar alertas automáticas cuando los valores superen los límites establecidos.
- Almacenar las lecturas en una base de datos SQL Server.

---

## ⚡ Características Principales

- Lectura de temperatura y humedad cada intervalo configurable (por defecto 2–3 segundos).
- Visualización en tiempo real en la interfaz web con gráficos interactivos.
- Cálculo del **Índice Térmico Real (HTI)** considerando:
  - Temperatura ambiente
  - Calor emitido por personas
  - Calor emitido por materiales almacenados
- Generación de alertas visuales cuando se superan límites de seguridad.
- Simulador de lecturas para pruebas sin hardware físico.
- Configuración de parámetros: dimensiones del espacio, ocupación y tipo de material.

---

## 🛠️ Tecnologías Utilizadas

**Hardware:**

- Raspberry Pi Pico W
- Sensor DHT11 o BME280
- Protoboard y cables Dupont
- Cable micro-USB

**Software Embebido:**

- MicroPython
- IDE Thonny

**Backend:**

- Node.js v20+
- Express.js v4.18
- MSSQL v9.1.1 (SQL Server)
- Librerías: `dotenv`, `cors`, `body-parser`, `node-fetch`, `selfsigned`

**Frontend:**

- React v19.2
- React Scripts v5.0.1
- Chart.js v4.5.1
- React-Chartjs-2 v5.3.0
- TailwindCSS v3.4.10
- PostCSS v8.5.6
- Autoprefixer v10.4.21

---

## 🏗️ Arquitectura del Sistema

### 1. Diagrama General

    ┌─────────────┐
    │ Sensor DHT11│
    │  / BME280   │
    └─────┬───────┘
          │ GPIO
          │
    ┌─────▼───────────┐
    │ Raspberry Pi Pico│
    │      W           │
    └─────┬───────────┘
          │ USB / HTTP
          │
    ┌─────▼───────────┐
    │  Backend Node.js │
    │   + SQL Server   │
    └─────┬───────────┘
          │ REST API
          │
    ┌─────▼───────────┐
    │ Frontend React   │
    │ + TailwindCSS    │
    └─────────────────┘
--- 
### 2. Flujo de Datos

1. El **sensor** mide temperatura y humedad.
2. La **Raspberry Pi Pico W** envía los datos al backend mediante USB o HTTP.
3. El **backend**:
   - Calcula el **índice térmico real**.
   - Almacena lecturas en SQL Server o memoria temporal.
   - Proporciona APIs REST para la app web.
4. El **frontend React**:
   - Muestra datos en tiempo real.
   - Genera gráficos de tendencia.
   - Indica alertas cuando se superan los límites configurados.

---

## ⚙️ Instalación y Ejecución

### Requisitos Previos

- Node.js y npm
- Python 3.11+ (para MicroPython y Thonny)
- SQL Server (Express o Developer Edition)

### Backend

# Clonar repositorio
```
git clone <URL_DEL_REPOSITORIO>
cd monitor-backend
```
# Instalar dependencias
```
npm install
```
# Generar certificados TLS self-signed
```
node generate-cert.js
```
# Configurar variables de entorno
```
Editar .env con los datos de SQL Server y dirección de la Raspberry Pi Pico
```
Base de Datos

-- Ejecutar script LecturaSensDB.sql en SQL Server
-- Crea base MonitorAmbientalDB, tablas y usuario monitor_admin

---

## Ejecutar Backend
## Producción
```
npm start
```
## Desarrollo
```
npm run dev
```
# Frontend
```
cd monitor-ambiental
npm install
npm start

```
---
### Acceso en navegador: https://localhost:4000 o IP local de la PC.

### Configuración de API: src/config.js

# Raspberry Pi Pico W

### Programar main.py usando Thonny.

### Configurar WiFi y dirección del backend.

### Conectar sensor según esquema GPIO.

### Ejecutar script para transmisión de datos.
--- 
# 🧪 Pruebas y Resultados

- Incremento controlado de humedad con vaporizador. 

- Humedad relativa ajustada coherentemente.

- Alertas visuales generadas al superar límites.

- Actualización en la web en ~5 segundos.
--- 
# 📝 Conclusiones

* Sistema confiable y económico para monitoreo ambiental.

* Sensibilidad suficiente para detectar variaciones pequeñas.

* Escalable: posible conexión WiFi, almacenamiento en la nube y notificaciones automáticas, control de usuarios y perfiles personalizados.

* Aplicable a entornos domésticos, educativos y pequeños almacenes.
--- 
# 👨‍💻 Autor

Carlos Benjamín Armenta Márquez – Instituto Tecnologico de Tijuana, diciembre 2025
---

## Diagrama de conexiones de sensor y Raspberry Pi Pico

<img width="751" height="439" alt="image" src="https://github.com/user-attachments/assets/fb884fa9-10cc-4910-858c-722076fabb16" />

---

