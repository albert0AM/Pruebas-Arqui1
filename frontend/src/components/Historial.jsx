export default function Historial({ eventos, comandos, actuadores }) {

  const colorTipo = (tipo) => {
    if (tipo === "WARN")  return "text-orange-500";
    if (tipo === "ERROR") return "text-red-600";
    return "text-green-600";
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-6">📋 Historial</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Columna 1 — Eventos y alertas */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">📌 Eventos y alertas</h3>
          {eventos.length === 0 && (
            <p className="text-xs text-slate-300 italic">Sin eventos aún</p>
          )}
          {eventos.slice().reverse().map((e) => (
            <div key={e.id} className="text-xs border-b border-slate-100 py-2">
              <span className={`font-bold ${colorTipo(e.tipo)}`}>
                {e.tipo}
              </span>
              <span className="text-slate-500 ml-2">{e.msg}</span>
            </div>
          ))}
        </div>

        {/* Columna 2 — Comandos remotos */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">🖱 Comandos remotos</h3>
          {comandos.length === 0 && (
            <p className="text-xs text-slate-300 italic">
              Usa los controles para ver comandos aquí
            </p>
          )}
          {comandos.slice().reverse().map((c) => (
            <div key={c.id} className="text-xs border-b border-slate-100 py-2">
              <span className="font-bold text-blue-500">{c.accion}</span>
              <span className="text-slate-400 ml-2">→ {c.valor}</span>
              <span className="text-slate-300 ml-2 text-xs">({c.origen})</span>
            </div>
          ))}
        </div>

        {/* Columna 3 — Activaciones de actuadores */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <h3 className="font-semibold text-slate-700 mb-3 text-sm">⚙ Activaciones</h3>
          {actuadores.length === 0 && (
            <p className="text-xs text-slate-300 italic">
              Sin activaciones aún
            </p>
          )}
          {actuadores.slice().reverse().map((a) => (
            <div key={a.id} className="text-xs border-b border-slate-100 py-2">
              <span className="font-bold text-purple-500">{a.actuador}</span>
              <span className={`ml-2 font-semibold ${
                a.estado.includes("OFF") ? "text-slate-400" : "text-green-500"
              }`}>
                {a.estado}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}