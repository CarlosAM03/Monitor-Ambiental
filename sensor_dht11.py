import network
import time
import urequests
import dht
from machine import Pin, reset
time.sleep(3)# 2 segundos para detener el script antes de que inicie
# =========================
# CONFIGURACIÓN
# =========================
WIFI_SSID = "Carlos_BAM"
WIFI_PASSWORD = "strKey0312"

BACKEND_HOST = "192.168.100.5"
BACKEND_PORT = 4001
BACKEND_BASE = f"http://{BACKEND_HOST}:{BACKEND_PORT}"
LECTURAS_URL = f"{BACKEND_BASE}/api/lecturas"
INTERVALO_URL = f"{BACKEND_BASE}/api/config/intervalo"

# Sensor DHT11 en GPIO15
sensor = dht.DHT11(Pin(15))

# LED interno de la Pico W
led = Pin("LED", Pin.OUT)

# =========================
# FUNCIONES LED
# =========================
def led_ok():
    led.on()
    time.sleep(0.05)
    led.off()

def led_error():
    led.on()
    time.sleep(0.2)
    led.off()
    time.sleep(0.2)

def led_wifi_search():
    led.on()
    time.sleep(0.1)
    led.off()
    time.sleep(0.1)

# =========================
# FUNCIÓN: CONECTAR WIFI (VERSIÓN PROFESIONAL)
# Reinicia la interfaz WiFi sin resetear la Pico
# =========================
def conectar_wifi():
    wlan = network.WLAN(network.STA_IF)

    # Reinicio limpio de la interfaz (súper importante)
    wlan.active(False)
    time.sleep(0.3)
    wlan.active(True)

    print("🔌 Conectando a WiFi…")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    timeout = 15
    while not wlan.isconnected() and timeout > 0:
        print("⏳ Esperando conexión…", timeout)
        led_wifi_search()
        time.sleep(1)
        timeout -= 1

    if not wlan.isconnected():
        print("❌ No se pudo conectar a WiFi, reiniciando la Pico…")
        time.sleep(2)
        reset()

    print("✅ WiFi conectado:", wlan.ifconfig())
    return wlan

# Conexión inicial
wlan = conectar_wifi()

# =========================
# LOOP PRINCIPAL — INTERVALO EXACTO
# =========================
intervalo = 2  # valor inicial

print("\n🚀 Sistema profesional inicializado\n")

while True:
    tiempo_inicio = time.ticks_ms()

    try:
        # ---------------------------------------
        # 1. Verificar WiFi
        # ---------------------------------------
        if not wlan.isconnected():
            print("⚠️ WiFi perdido, reconectando…")
            wlan = conectar_wifi()

        # ---------------------------------------
        # 2. Obtener intervalo dinámico
        # ---------------------------------------
        try:
            r = urequests.get(INTERVALO_URL, timeout=3)
            data = r.json()
            r.close()
            intervalo = int(data.get("intervalo", intervalo))
        except Exception as e:
            print("⚠️ No se pudo obtener intervalo:", e)

        # ---------------------------------------
        # 3. Leer sensor
        # ---------------------------------------
        try:
            sensor.measure()
            temperatura = sensor.temperature()
            humedad = sensor.humidity()
        except Exception as e:
            print("❌ Error DHT11:", e)
            led_error()
            temperatura = None
            humedad = None

        print(f"🌡️ {temperatura}°C | 💧 {humedad}% | ⏱️ {intervalo}s")

        # ---------------------------------------
        # 4. Enviar datos
        # ---------------------------------------
        if temperatura is not None:
            payload = {
                "temperatura": temperatura,
                "humedad": humedad,
                "origen": "raspberry-picoW"
            }

            try:
                res = urequests.post(LECTURAS_URL, json=payload, timeout=4)
                print("📤 Enviado:", res.text)
                res.close()
                led_ok()
            except Exception as e:
                print("❌ Error al enviar:", e)
                led_error()

    except Exception as e:
        print("❌ Error general:", e)
        led_error()

    # ---------------------------------------
    # 5. Mantener intervalo EXACTO
    # ---------------------------------------
    tiempo_total = time.ticks_diff(time.ticks_ms(), tiempo_inicio) / 1000
    restante = intervalo - tiempo_total

    if restante > 0:
        time.sleep(restante)

