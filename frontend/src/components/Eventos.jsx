export default function Eventos({ eventos }) {
  if (!eventos || eventos.length === 0) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400 text-sm">
      Sin eventos recientes registrados.
    </div>
  );

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-h-[580px] flex flex-col">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        📋 Historial Reciente
      </h2>
      
      <div className="overflow-y-auto flex-grow rounded-xl border border-slate-100 custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600 sticky top-0 font-semibold">
              <th className="p-3 w-12">#</th>
              <th className="p-3 w-20">Tipo</th>
              <th className="p-3">Mensaje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eventos.slice().reverse().map((e) => (
              <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="p-3 font-mono text-slate-400">{e.id}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    e.tipo === "WARN" 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {e.tipo}
                  </span>
                </td>
                <td className="p-3 text-slate-600 font-medium">{e.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}