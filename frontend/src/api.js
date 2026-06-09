import axios from "axios";

const BASE = "http://localhost:8000";

export const getSensores   = ()        => axios.get(`${BASE}/sensores`);
export const getEstado     = ()        => axios.get(`${BASE}/estado`);
export const getEventos    = ()        => axios.get(`${BASE}/eventos`);
export const getComandos   = ()        => axios.get(`${BASE}/comandos`);
export const getActuadores = ()        => axios.get(`${BASE}/actuadores`);

export const postRiego     = (area)    => axios.post(`${BASE}/riego`,      { area });
export const postLuces     = (estado)  => axios.post(`${BASE}/luces`,      { estado });
export const postVentilacion=(estado)  => axios.post(`${BASE}/ventilacion`,{ estado });
export const postModo      = (modo)    => axios.post(`${BASE}/modo`,       { modo });
export const postAlarma    = (accion)  => axios.post(`${BASE}/alarma`,     { accion });