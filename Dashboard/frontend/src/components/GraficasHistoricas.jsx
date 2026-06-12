import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ── Opciones base para ambas gráficas ─────────────────────────────
const opcionesBase = (min, max, titulo) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: titulo, font: { size: 13 } },
  },
  scales: {
    y: { min, max },
  },
});

export default function GraficasHistoricas({ datosSensores }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (datosSensores) {
      const hora = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setHistorial((prev) => [...prev, { ...datosSensores, hora }].slice(-15));
    }
  }, [datosSensores]);

  const labels = historial.map((h) => h.hora);

  // ── Gráfica 1: Porcentajes (temp, humedad aire, suelo 1, suelo 2) ──
  const dataPorcentajes = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: historial.map((h) => h.temp),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.3,
      },
      {
        label: "Hum. Aire (%)",
        data: historial.map((h) => h.hum_aire),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
      },
      {
        label: "Suelo Área 1 (%)",
        data: historial.map((h) => h.hum_suelo1),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
      },
      {
        label: "Suelo Área 2 (%)",
        data: historial.map((h) => h.hum_suelo2),
        borderColor: "rgb(5, 150, 105)",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.3,
      },
    ],
  };

  // ── Gráfica 2: Luz y gas (escalas distintas) ──────────────────────
  const dataLuzGas = {
    labels,
    datasets: [
      {
        label: "Luz (lux)",
        data: historial.map((h) => h.luz),
        borderColor: "rgb(234, 179, 8)",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        tension: 0.3,
        yAxisID: "yLuz",
      },
      {
        label: "Gas (ppm)",
        data: historial.map((h) => h.gas),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.3,
        yAxisID: "yGas",
      },
    ],
  };

  // Luz y gas tienen escalas distintas entonces necesitan dos ejes Y
  const opcionesLuzGas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Luz y Gas",
        font: { size: 13 },
      },
    },
    scales: {
      yLuz: {
        type: "linear",
        position: "left",
        min: 0,
        max: 650,
        title: { display: true, text: "lux" },
      },
      yGas: {
        type: "linear",
        position: "right",
        min: 0,
        max: 450,
        title: { display: true, text: "ppm" },
        grid: { drawOnChartArea: false }, // evita líneas duplicadas
      },
    },
  };

  // Mientras no hay suficientes puntos muestra mensaje
  if (historial.length < 2) {
    return (
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-2">📈 Gráficas Históricas</h2>
        <p className="text-slate-400 text-sm italic">
          Recolectando datos, espera unos segundos...
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-6">📈 Gráficas Históricas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfica 1 — Temperatura, humedades */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="h-64">
            <Line
              data={dataPorcentajes}
              options={opcionesBase(0, 100, "Temperatura y Humedades")}
            />
          </div>
        </div>

        {/* Gráfica 2 — Luz y gas con doble eje */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="h-64">
            <Line data={dataLuzGas} options={opcionesLuzGas} />
          </div>
        </div>

      </div>

      {/* Cantidad de puntos recolectados */}
      <p className="text-xs text-slate-300 mt-4 text-right">
        {historial.length} lecturas en pantalla (máx. 15)
      </p>
    </section>
  );
}