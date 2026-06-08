from pydantic import BaseModel

class ComandoRiego(BaseModel):
    area: str  # "area1", "area2", "off"

class ComandoLuces(BaseModel):
    estado: bool  # True = ON, False = OFF

class ComandoVentilacion(BaseModel):
    estado: bool

class ComandoModo(BaseModel):
    modo: str  # "AUTOMATICO" o "MANUAL"

class ComandoAlarma(BaseModel):
    accion: str  # "silenciar" o "reset"