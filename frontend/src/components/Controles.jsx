import { postRiego, postLuces, postVentilacion, postModo, postAlarma } from "../api";

export default function Controles({ estado, onAccion }) {
  if (!estado) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400">
      Cargando controles operativos...
    </div>
  );

  const esAutomata = estado.modo === "AUTOMATICO";

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        🎛️ Panel de Control Activo
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Modo de Operación */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema</span>
            <p className="text-sm font-medium mt-1">
              Modo actual: <span className={`font-bold ${esAutomata ? 'text-emerald-600' : 'text-amber-600'}`}>{estado.modo}</span>
            </p>
          </div>
          <button 
            className="mt-3 w-full bg-slate-800 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 active:scale-95 transition-all"
            onClick={() => postRiego("off").then(onAccion)
              .then(() => postModo(esAutomata ? "MANUAL" : "AUTOMATICO"))
              .then(onAccion)}>
            Cambiar a {esAutomata ? "MANUAL" : "AUTOMÁTICO"}
          </button>
        </div>

        {/* Luces */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Iluminación</span>
            <p className="text-sm font-medium mt-1">
              Estado: <span className={`font-bold ${estado.luces ? 'text-amber-500' : 'text-slate-500'}`}>{estado.luces ? "ENCENDIDO" : "APAGADO"}</span>
            </p>
          </div>
          <button 
            className={`mt-3 w-full text-sm font-semibold py-2 px-4 rounded-lg active:scale-95 transition-all border ${
              estado.luces 
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            onClick={() => postLuces(!estado.luces).then(onAccion)}>
            {estado.luces ? "❌ Apagar luces" : "💡 Encender luces"}
          </button>
        </div>

        {/* Riego */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 sm:col-span-2">
          <h3 className="font-semibold text-gray-700 mb-3">💧 Riego</h3>

          <div className={`rounded p-2 text-center font-bold mb-3 ${
            estado.riego === "RIEGO_OFF"
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-100 text-blue-600 animate-pulse"
          }`}>
            {estado.riego === "RIEGO_OFF" ? "⭕ Riego inactivo" : `💧 ${estado.riego} activo`}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => postRiego("area1").then(onAccion)}
              disabled={estado.riego === "RIEGO_AREA1"}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Activar Área 1
            </button>

            <button
              onClick={() => postRiego("area2").then(onAccion)}
              disabled={estado.riego === "RIEGO_AREA2"}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Activar Área 2
            </button>

            <button
              onClick={() => postRiego("off").then(onAccion)}
              disabled={estado.riego === "RIEGO_OFF"}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Detener
            </button>
          </div>
        </div>

        {/* Ventilación */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flujo de Aire</span>
            <p className="text-sm font-medium mt-1">
              Ventilación: <span className="font-bold text-teal-600 uppercase">{estado.ventilacion ? "Activa" : "Inactiva"}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-teal-50 text-teal-700 border border-teal-100 text-xs font-medium py-2 rounded-lg hover:bg-teal-100 active:scale-95 transition-all" onClick={() => postVentilacion(true).then(onAccion)}>Encender</button>
            <button className="bg-slate-200 text-slate-700 text-xs font-medium py-2 rounded-lg hover:bg-slate-300 active:scale-95 transition-all" onClick={() => postVentilacion(false).then(onAccion)}>Apagar</button>
          </div>
        </div>

        {/* Alarma */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
          <div className="mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seguridad</span>
            <p className="text-sm font-medium mt-1">
              Alarma: <span className={`font-bold ${estado.alarma ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>{estado.alarma ? "🚨 ACTIVA" : "✅ OK"}</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium py-2 rounded-lg hover:bg-amber-100 active:scale-95 transition-all" onClick={() => postAlarma("silenciar").then(onAccion)}>Silenciar</button>
            <button className="bg-slate-800 text-white text-xs font-medium py-2 rounded-lg hover:bg-slate-700 active:scale-95 transition-all" onClick={() => postAlarma("reset").then(onAccion)}>Resetear</button>
          </div>
        </div>

      </div>
    </section>
  );
}