export default function Sensores({ datos }) {
  if (!datos) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse text-center text-slate-400">
      Cargando telemetría de sensores...
    </div>
  );

  const items = [
    { label: "Temperatura",  valor: datos.temp,      unidad: "°C", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Humedad Aire", valor: datos.hum_aire,  unidad: "%",   color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Suelo Área 1", valor: datos.hum_suelo1,unidad: "%",   color: "text-emerald-600",bg: "bg-emerald-50" },
    { label: "Suelo Área 2", valor: datos.hum_suelo2,unidad: "%",   color: "text-teal-600",   bg: "bg-teal-50" },
    { label: "Radiación Luz",valor: datos.luz,       unidad: "lux", color: "text-amber-500",  bg: "bg-amber-50" },
    { label: "Nivel de Gas", valor: datos.gas,       unidad: "ppm", color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        📊 Lecturas en Tiempo Real
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.label} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:shadow-md transition-shadow duration-200">
            <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-1">{item.label}</div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${item.color}`}>
                {item.valor}
              </span>
              <span className="text-xs font-medium text-slate-400">{item.unidad}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}