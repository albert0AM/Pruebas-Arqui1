import { postRiego, postLuces, postVentilacion, postModo, postAlarma } from "../api";

export default function Controles({ estado, datos, onAccion }) {
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">💡 Iluminación</h3>

          <div className={`rounded p-2 text-center font-bold mb-3 ${
            estado.luces
              ? "bg-yellow-100 text-yellow-600"
              : "bg-gray-100 text-gray-400"
          }`}>
            {estado.luces ? "💡 Luces encendidas" : "💡 Luces apagadas"}
          </div>

          <div className={`text-xs text-center mb-3 font-semibold ${
            estado.modo === "AUTOMATICO" ? "text-green-600" : "text-orange-500"
          }`}>
            {estado.modo === "AUTOMATICO"
              ? "🤖 Modo automático — Python controla según LDR"
              : "🖐 Modo manual — tú controlas las luces"}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => postLuces(true).then(onAccion)}
              disabled={estado.modo === "AUTOMATICO" || estado.luces}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Encender
            </button>

            <button
              onClick={() => postLuces(false).then(onAccion)}
              disabled={estado.modo === "AUTOMATICO" || !estado.luces}
              className="bg-gray-400 hover:bg-gray-500 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Apagar
            </button>
          </div>

          {estado.modo === "AUTOMATICO" && (
            <p className="text-xs text-gray-400 mt-2">
              Cambia a modo manual para controlar las luces desde aquí.
            </p>
          )}
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-700 mb-3">🌀 Ventilación</h3>

          <div className={`rounded p-2 text-center font-bold mb-3 ${
            estado.ventilacion === "VENTILACION_EMERGENCIA" ? "bg-red-100 text-red-600 animate-pulse" :
            estado.ventilacion === "VENTILACION_ON"         ? "bg-green-100 text-green-600" :
            estado.ventilacion === "VENTILACION_MANUAL"     ? "bg-orange-100 text-orange-600" :
                                                              "bg-gray-100 text-gray-400"
          }`}>
            {estado.ventilacion === "VENTILACION_EMERGENCIA" && "🚨 EMERGENCIA — ventilación forzada"}
            {estado.ventilacion === "VENTILACION_ON"         && "✅ Ventilación ON — automático"}
            {estado.ventilacion === "VENTILACION_MANUAL"     && "🖐 Ventilación ON — manual"}
            {estado.ventilacion === "VENTILACION_OFF"        && "⭕ Ventilación apagada"}
          </div>

          {estado.ventilacion !== "VENTILACION_OFF" && (
            <div className="text-xs text-gray-500 mb-3 text-center">
              {estado.ventilacion === "VENTILACION_EMERGENCIA" && `Gas: ${datos?.gas} ppm — por encima del umbral`}
              {estado.ventilacion === "VENTILACION_ON"         && `Temperatura: ${datos?.temp}°C — por encima del umbral`}
              {estado.ventilacion === "VENTILACION_MANUAL"     && "Activado manualmente desde dashboard"}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => postVentilacion(true).then(onAccion)}
              disabled={
                estado.ventilacion === "VENTILACION_ON" ||
                estado.ventilacion === "VENTILACION_MANUAL" ||
                estado.ventilacion === "VENTILACION_EMERGENCIA"
              }
              className="bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Encender
            </button>

            <button
              onClick={() => postVentilacion(false).then(onAccion)}
              disabled={
                estado.ventilacion === "VENTILACION_OFF" ||
                estado.ventilacion === "VENTILACION_EMERGENCIA"
              }
              className="bg-gray-400 hover:bg-gray-500 disabled:opacity-40 text-white text-sm px-3 py-2 rounded"
            >
              Apagar
            </button>
          </div>

          {estado.ventilacion === "VENTILACION_EMERGENCIA" && (
            <p className="text-xs text-red-500 mt-2">
              No se puede apagar manualmente durante emergencia.
            </p>
          )}
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