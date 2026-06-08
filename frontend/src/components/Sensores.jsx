// El umbral lo define el equipo, aquí usamos 33°C como ejemplo
const UMBRAL_TEMP = 35;
const UMBRAL_GAS = 200;

export default function Sensores({ datos }) {
  if (!datos) return <p>Cargando sensores...</p>;

  const tempAlta = datos.temp > UMBRAL_TEMP;
  const gasAlto = datos.gas > UMBRAL_GAS;
  const suelo1 = datos.clasificacion_suelo1 || "NORMAL";
  const suelo2 = datos.clasificacion_suelo2 || "NORMAL";

  const colorSuelo = (clasificacion) => {
    if (clasificacion === "SECO") return "border-red-400 bg-red-50";
    if (clasificacion === "SATURADO") return "border-blue-400 bg-blue-50";
    return "border-gray-200 bg-white";
  };

  const colorTexto = (clasificacion) => {
    if (clasificacion === "SECO") return "text-red-600";
    if (clasificacion === "SATURADO") return "text-blue-600";
    return "text-gray-800";
  };

  const items = [
    { label: "Temperatura", valor: datos.temp, unidad: "°C", alerta: tempAlta },
    { label: "Humedad aire", valor: datos.hum_aire, unidad: "%", alerta: false },
    { label: "Luz", valor: datos.luz, unidad: "lux", alerta: false },
    { label: "Gas / Humo", valor: datos.gas, unidad: "ppm", alerta: gasAlto },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sensores</h2>

      {tempAlta && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ⚠️ <strong>Temperatura alta:</strong> {datos.temp}°C supera el umbral de {UMBRAL_TEMP}°C —
          ventilación activada automáticamente.
        </div>
      )}

      {gasAlto && (
        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
          ⚠️ <strong>Gas / humo detectado:</strong> {datos.gas} ppm supera el umbral de {UMBRAL_GAS} ppm —
          estado: EMERGENCIA.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border p-4 text-center ${
              item.alerta
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-sm text-gray-500 mb-1">{item.label}</div>
            <div className={`text-3xl font-bold ${item.alerta ? "text-red-600" : "text-gray-800"}`}>
              {item.valor}
            </div>
            <div className="text-sm text-gray-400">{item.unidad}</div>
            {item.alerta && (
              <div className="text-xs text-red-500 mt-1 font-semibold">⚠ FUERA DE RANGO</div>
            )}
          </div>
        ))}

        <div className={`rounded-lg border p-4 text-center ${colorSuelo(suelo1)}`}>
          <div className="text-sm text-gray-500 mb-1">Suelo Área 1</div>
          <div className={`text-3xl font-bold ${colorTexto(suelo1)}`}>
            {datos.hum_suelo1}%
          </div>
          <div className={`text-sm font-semibold mt-1 ${colorTexto(suelo1)}`}>
            {suelo1}
          </div>
          {suelo1 === "SECO" && <div className="text-xs text-red-500 mt-1">⚠ Riego activado</div>}
          {suelo1 === "SATURADO" && <div className="text-xs text-blue-500 mt-1">⚠ Riego bloqueado</div>}
        </div>

        <div className={`rounded-lg border p-4 text-center ${colorSuelo(suelo2)}`}>
          <div className="text-sm text-gray-500 mb-1">Suelo Área 2</div>
          <div className={`text-3xl font-bold ${colorTexto(suelo2)}`}>
            {datos.hum_suelo2}%
          </div>
          <div className={`text-sm font-semibold mt-1 ${colorTexto(suelo2)}`}>
            {suelo2}
          </div>
          {suelo2 === "SECO" && <div className="text-xs text-red-500 mt-1">⚠ Riego activado</div>}
          {suelo2 === "SATURADO" && <div className="text-xs text-blue-500 mt-1">⚠ Riego bloqueado</div>}
        </div>
      </div>
    </div>
  );
}