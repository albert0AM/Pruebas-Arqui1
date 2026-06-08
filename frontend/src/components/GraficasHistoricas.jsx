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
} from "chart.js"; // <-- CORREGIDO: El paquete de registro es 'chart.js', no 'chartjs-2'

// Registrar plugins obligatorios de ChartJS para React
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function GraficasHistoricas({ datosSensores }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (datosSensores) {
      const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistorial((prev) => {
        const nuevoHistorial = [...prev, { ...datosSensores, hora: horaActual }];
        return nuevoHistorial.slice(-10); // Mantener únicamente los últimos 10 registros en pantalla
      });
    }
  }, [datosSensores]);

  const labels = historial.map((h) => h.hora);

  const dataConfig = {
    labels,
    datasets: [
      {
        label: "Temperatura (°C)",
        data: historial.map((h) => h.temp),
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.5)",
        tension: 0.2,
      },
      {
        label: "Hum. Aire (%)",
        data: historial.map((h) => h.hum_aire),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.2,
      },
      {
        label: "Suelo Á.1 (%)",
        data: historial.map((h) => h.hum_suelo1),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { min: 0, max: 100 },
    },
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        📈 Gráficas Históricas Consolidadas
      </h2>
      <div className="h-64 sm:h-80 w-full">
        {historial.length < 2 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            Recolectando suficientes puntos de telemetría para trazar histórico...
          </div>
        ) : (
          <Line data={dataConfig} options={options} />
        )}
      </div>
    </section>
  );
}