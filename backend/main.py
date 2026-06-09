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
    "hum_suelo1": 15.0,
    "hum_suelo2": 40.0,
    "luz": 310,
    "gas": 125,
    "riego": "RIEGO_OFF",
    "ventilacion": "VENTILACION_OFF",
    "luces": False,
    "alarma": False,
}

UMBRAL_LUZ = 200  # lux — el equipo puede cambiar este valor
UMBRAL_TEMP_VENT = 33   # °C
UMBRAL_GAS_WARN = 200  # ppm — advertencia
UMBRAL_GAS_EMERG = 250  # ppm — emergencia

eventos = [
    {"id": 1, "tipo": "INFO", "msg": "Sistema iniciado"},
]

comandos = []
actuadores = []

def agregar_evento(tipo, msg):
    eventos.append({"id": len(eventos) + 1, "tipo": tipo, "msg": msg})


def agregar_comando(origen, accion, valor):
    comandos.append({
        "id": len(comandos) + 1,
        "origen": origen,
        "accion": accion,
        "valor": str(valor),
    })


def agregar_actuador(actuador, estado_act):
    actuadores.append({
        "id": len(actuadores) + 1,
        "actuador": actuador,
        "estado": estado_act,
    })

# ── Simula lectura de sensores con variación aleatoria ─────────────
def actualizar_sensores():
    estado["temp"]      = round(estado["temp"] + random.uniform(-0.5, 0.5), 1)
    estado["hum_aire"]  = round(max(20, min(95, estado["hum_aire"] + random.uniform(-1, 1))), 1)
    estado["hum_suelo1"]= round(max(10, min(95, estado["hum_suelo1"] + random.uniform(-1, 1))), 1)
    estado["hum_suelo2"]= round(max(10, min(95, estado["hum_suelo2"] + random.uniform(-1, 1))), 1)
    estado["luz"]       = max(50, min(600, estado["luz"] + random.randint(-15, 15)))
    estado["gas"]       = max(80, min(400, estado["gas"] + random.randint(-5, 5)))


def clasificar_suelo(val):
    if val < 30:
        return "SECO"
    elif val > 70:
        return "SATURADO"
    else:
        return "NORMAL"


def revisar_suelo_automatico():
    s1 = clasificar_suelo(estado["hum_suelo1"])
    s2 = clasificar_suelo(estado["hum_suelo2"])

    # Área 1
    if s1 == "SECO" and estado["riego"] == "RIEGO_OFF":
        estado["riego"] = "RIEGO_AREA1"
        estado["global"] = "RIEGO_ACTIVO"
        agregar_evento("INFO", "Suelo Área 1 SECO — riego activado automáticamente")

    elif s1 == "SATURADO":
        agregar_evento("WARN", "Suelo Área 1 SATURADO — riego bloqueado")

    # Área 2
    if s2 == "SECO" and estado["riego"] == "RIEGO_OFF":
        estado["riego"] = "RIEGO_AREA2"
        estado["global"] = "RIEGO_ACTIVO"
        agregar_evento("INFO", "Suelo Área 2 SECO — riego activado automáticamente")

    elif s2 == "SATURADO":
        agregar_evento("WARN", "Suelo Área 2 SATURADO — riego bloqueado")


def revisar_luz_automatico():
    if estado["luz"] < UMBRAL_LUZ and not estado["luces"]:
        estado["luces"] = True
        agregar_evento("INFO", f"Luz baja ({estado['luz']} lux) — iluminación artificial ON")

    elif estado["luz"] >= UMBRAL_LUZ and estado["luces"]:
        estado["luces"] = False
        agregar_evento("INFO", f"Luz suficiente ({estado['luz']} lux) — iluminación artificial OFF")


def clasificar_gas(val):
    if val >= UMBRAL_GAS_EMERG:
        return "GAS_EMERGENCIA"
    elif val >= UMBRAL_GAS_WARN:
        return "GAS_ADVERTENCIA"
    else:
        return "GAS_NORMAL"


def revisar_ventilacion_automatico():
    gas_estado = clasificar_gas(estado["gas"])

    if gas_estado == "GAS_EMERGENCIA":
        if estado["ventilacion"] != "VENTILACION_EMERGENCIA":
            estado["ventilacion"] = "VENTILACION_EMERGENCIA"
            estado["global"] = "EMERGENCIA"
            estado["alarma"] = True
            agregar_evento("ERROR", f"EMERGENCIA — gas {estado['gas']} ppm — ventilación forzada")

    elif estado["modo"] == "AUTOMATICO":
        if estado["temp"] > UMBRAL_TEMP_VENT:
            if estado["ventilacion"] == "VENTILACION_OFF":
                estado["ventilacion"] = "VENTILACION_ON"
                agregar_evento("WARN", f"Temperatura alta ({estado['temp']}°C) — ventilación ON")
        else:
            if estado["ventilacion"] == "VENTILACION_ON":
                estado["ventilacion"] = "VENTILACION_OFF"
                agregar_evento("INFO", "Temperatura normal — ventilación OFF")


def revisar_estado_global():
    if clasificar_gas(estado["gas"]) == "GAS_EMERGENCIA":
        estado["global"] = "EMERGENCIA"
        return


# ══════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════

# GET /sensores — retorna todas las lecturas actuales
@app.get("/sensores")
def get_sensores():
    actualizar_sensores()
    revisar_ventilacion_automatico()  # <- siempre, no solo en automático
    revisar_estado_global()
    if estado["modo"] == "AUTOMATICO":
        revisar_suelo_automatico()
        revisar_luz_automatico()
    return {
        "temp":               estado["temp"],
        "hum_aire":           estado["hum_aire"],
        "hum_suelo1":         estado["hum_suelo1"],
        "hum_suelo2":         estado["hum_suelo2"],
        "luz":                estado["luz"],
        "gas":                estado["gas"],
        "clasificacion_suelo1": clasificar_suelo(estado["hum_suelo1"]),
        "clasificacion_suelo2": clasificar_suelo(estado["hum_suelo2"]),
        "clasificacion_gas":    clasificar_gas(estado["gas"]),
    }

# GET /estado — retorna el estado completo del sistema
@app.get("/estado")
def get_estado():
    return estado

# GET /eventos — retorna el historial de eventos
@app.get("/eventos")
def get_eventos():
    return eventos[-20:]  # últimos 20


@app.get("/comandos")
def get_comandos():
    return comandos[-20:]


@app.get("/actuadores")
def get_actuadores():
    return actuadores[-20:]

# POST /riego — controla la bomba de agua
@app.post("/riego")
def post_riego(cmd: ComandoRiego):
    estado["riego"] = f"RIEGO_{cmd.area.upper()}" if cmd.area != "off" else "RIEGO_OFF"
    agregar_comando("dashboard", "riego", cmd.area)
    agregar_actuador("BOMBA", estado["riego"])
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
    # No se puede apagar si hay emergencia por gas
    if estado["ventilacion"] == "VENTILACION_EMERGENCIA" and not cmd.estado:
        return {"ok": False, "msg": "No se puede apagar — emergencia activa"}

    if cmd.estado:
        estado["ventilacion"] = "VENTILACION_MANUAL"
        agregar_evento("INFO", "Ventilación activada manualmente desde dashboard")
    else:
        estado["ventilacion"] = "VENTILACION_OFF"
        agregar_evento("INFO", "Ventilación apagada desde dashboard")

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