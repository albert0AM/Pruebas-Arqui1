import { useState, useEffect } from "react";
import { getSensores, getEstado, getEventos, getComandos, getActuadores } from "./api";
import Sensores from "./components/Sensores";
import Controles from "./components/Controles";
import Eventos from "./components/Eventos";
import Historial from "./components/Historial";
import AnalisisArm from "./components/AnalisisArm"; // <-- Importación nueva
import GraficasHistoricas from "./components/GraficasHistoricas"; // <-- Importación nueva

export default function App() {
  const [sensores, setSensores] = useState(null);
  const [estado,   setEstado]   = useState(null);
  const [eventos,  setEventos]  = useState([]);
  const [comandos,   setComandos]   = useState([]);
  const [actuadores, setActuadores] = useState([]);

  const cargarTodo = () => {
    getSensores().then(r => setSensores(r.data));
    getEstado()  .then(r => setEstado(r.data));
    getEventos() .then(r => setEventos(r.data));
    getComandos()  .then(r => setComandos(r.data));
    getActuadores().then(r => setActuadores(r.data));
  };

  useEffect(() => {
    cargarTodo();
    const id = setInterval(cargarTodo, 3000);
    return () => clearInterval(id);
  }, []);

  const esEmergencia = estado?.alarma || estado?.global === "EMERGENCIA";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Banner de Emergencia / Alerta Crítica Exigido por Rúbrica */}
        {esEmergencia && (
          <div className="bg-rose-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base">ESTADO DE ALERTA O EMERGENCIA ACTIVA</h3>
                <p className="text-xs text-rose-100">Los parámetros críticos han sobrepasado los umbrales seguros o la alarma fue activada manual.</p>
              </div>
            </div>
            <span className="hidden sm:inline-block bg-rose-800 px-3 py-1 text-xs font-mono rounded font-bold">CRITICAL_HALT</span>
          </div>
        )}

        {/* Estado global + alarma */}
        <div className="flex flex-wrap gap-3 mb-4">

          <div className={`rounded-lg px-4 py-2 font-bold text-sm ${
            estado?.global === "EMERGENCIA"   ? "bg-red-600 text-white" :
            estado?.global === "ADVERTENCIA"  ? "bg-yellow-400 text-white" :
            estado?.global === "RIEGO_ACTIVO" ? "bg-blue-500 text-white" :
            estado?.global === "MODO_MANUAL"  ? "bg-orange-400 text-white" :
                                                "bg-green-500 text-white"
          }`}>
            Estado: {estado?.global || "..."}
          </div>

          <div className={`rounded-lg px-4 py-2 font-bold text-sm ${
            estado?.alarma ? "bg-red-600 text-white animate-pulse" : "bg-gray-200 text-gray-500"
          }`}>
            {estado?.alarma ? "🔔 ALARMA ACTIVA" : "🔕 Alarma OK"}
          </div>

          <div className={`rounded-lg px-4 py-2 text-sm ${
            estado?.luces ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"
          }`}>
            💡 Luces: {estado?.luces ? "ON" : "OFF"}
          </div>

          <div className={`rounded-lg px-4 py-2 text-sm ${
            estado?.riego !== "RIEGO_OFF" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
          }`}>
            💧 {estado?.riego || "RIEGO_OFF"}
          </div>

          <div className={`rounded-lg px-4 py-2 text-sm ${
            estado?.ventilacion !== "VENTILACION_OFF" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
          }`}>
            🌀 {estado?.ventilacion || "VENTILACION_OFF"}
          </div>

        </div>

        {/* Encabezado */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 flex items-center gap-2">
              <span>🌿</span> Invernadero Inteligente IoT
            </h1>
            <p className="text-slate-500 mt-1">Panel de monitoreo y control automatizado — USAC 2026</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${
            esEmergencia 
              ? 'bg-rose-50 text-rose-800 border-rose-100' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
          }`}>
            Estado global: <span className="uppercase font-bold">{estado?.global || "Cargando..."}</span>
          </div>
        </header>

        {/* Dashboard Grid de 3 Columnas para dar soporte a las Gráficas y ARM64 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Zona de Telemetría, Control y Gráficos (Columna Izquierda y Central) */}
          <div className="lg:col-span-2 space-y-6">
            <Sensores datos={sensores} />
            <GraficasHistoricas datosSensores={sensores} /> {/* <-- Agregado */}
            <Controles estado={estado} datos={sensores} onAccion={cargarTodo} />
            <AnalisisArm datosSensores={sensores} /> {/* <-- Agregado */}
          </div>
          
          {/* Historial de Logs (Columna Derecha) */}
          <div className="lg:col-span-1">
            <Eventos eventos={eventos} />
          </div>
        </div>

        <hr className="my-6" />
        <Historial eventos={eventos} comandos={comandos} actuadores={actuadores} />

      </div>
    </div>
  );
}