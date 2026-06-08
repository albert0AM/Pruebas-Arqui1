from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ComandoRiego, ComandoLuces, ComandoVentilacion, ComandoModo, ComandoAlarma
import random

app = FastAPI(title="Invernadero IoT API")

# Permite que React se conecte desde localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Estado global del sistema (simulado) ──────────────────────────
estado = {
    "global": "NORMAL",
    "modo": "AUTOMATICO",
    "temp": 28.0,
    "hum_aire": 65.0,
    "hum_suelo1": 42.0,
    "hum_suelo2": 55.0,
    "luz": 310,
    "gas": 125,
    "riego": "RIEGO_OFF",
    "ventilacion": "VENTILACION_OFF",
    "luces": False,
    "alarma": False,
}

eventos = [
    {"id": 1, "tipo": "INFO", "msg": "Sistema iniciado"},
]

def agregar_evento(tipo, msg):
    eventos.append({"id": len(eventos) + 1, "tipo": tipo, "msg": msg})

# ── Simula lectura de sensores con variación aleatoria ─────────────
def actualizar_sensores():
    estado["temp"]      = round(estado["temp"] + random.uniform(-0.5, 0.5), 1)
    estado["hum_aire"]  = round(max(20, min(95, estado["hum_aire"] + random.uniform(-1, 1))), 1)
    estado["hum_suelo1"]= round(max(10, min(95, estado["hum_suelo1"] + random.uniform(-1, 1))), 1)
    estado["hum_suelo2"]= round(max(10, min(95, estado["hum_suelo2"] + random.uniform(-1, 1))), 1)
    estado["luz"]       = max(50, min(600, estado["luz"] + random.randint(-15, 15)))
    estado["gas"]       = max(80, min(400, estado["gas"] + random.randint(-5, 5)))


# ══════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════

# GET /sensores — retorna todas las lecturas actuales
@app.get("/sensores")
def get_sensores():
    actualizar_sensores()  # simula nueva lectura cada vez que el frontend pregunta
    return {
        "temp": estado["temp"],
        "hum_aire": estado["hum_aire"],
        "hum_suelo1": estado["hum_suelo1"],
        "hum_suelo2": estado["hum_suelo2"],
        "luz": estado["luz"],
        "gas": estado["gas"],
    }

# GET /estado — retorna el estado completo del sistema
@app.get("/estado")
def get_estado():
    return estado

# GET /eventos — retorna el historial de eventos
@app.get("/eventos")
def get_eventos():
    return eventos[-20:]  # últimos 20

# POST /riego — controla la bomba de agua
@app.post("/riego")
def post_riego(cmd: ComandoRiego):
    estado["riego"] = f"RIEGO_{cmd.area.upper()}" if cmd.area != "off" else "RIEGO_OFF"
    if cmd.area != "off":
        estado["global"] = "RIEGO_ACTIVO"
        agregar_evento("INFO", f"Riego activado: {cmd.area}")
    else:
        estado["global"] = "NORMAL"
        agregar_evento("INFO", "Riego detenido")
    return {"ok": True, "riego": estado["riego"]}

# POST /luces — enciende o apaga las luces
@app.post("/luces")
def post_luces(cmd: ComandoLuces):
    estado["luces"] = cmd.estado
    agregar_evento("INFO", f"Luces {'ON' if cmd.estado else 'OFF'}")
    return {"ok": True, "luces": estado["luces"]}

# POST /ventilacion — controla el ventilador
@app.post("/ventilacion")
def post_ventilacion(cmd: ComandoVentilacion):
    estado["ventilacion"] = "VENTILACION_ON" if cmd.estado else "VENTILACION_OFF"
    agregar_evento("INFO", f"Ventilación {'ON' if cmd.estado else 'OFF'}")
    return {"ok": True, "ventilacion": estado["ventilacion"]}

# POST /modo — cambia entre automatico y manual
@app.post("/modo")
def post_modo(cmd: ComandoModo):
    estado["modo"] = cmd.modo
    estado["global"] = "MODO_MANUAL" if cmd.modo == "MANUAL" else "NORMAL"
    agregar_evento("INFO", f"Modo cambiado a {cmd.modo}")
    return {"ok": True, "modo": estado["modo"]}

# POST /alarma — silencia o resetea la alarma
@app.post("/alarma")
def post_alarma(cmd: ComandoAlarma):
    if cmd.accion == "silenciar":
        estado["alarma"] = False
        agregar_evento("WARN", "Alarma silenciada por operador")
    elif cmd.accion == "reset":
        estado["alarma"] = False
        estado["global"] = "NORMAL"
        agregar_evento("INFO", "Estado restablecido")
    return {"ok": True, "alarma": estado["alarma"]}