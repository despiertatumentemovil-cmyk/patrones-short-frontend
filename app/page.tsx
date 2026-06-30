"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { createChart, ColorType } from "lightweight-charts";
import { useRef } from "react";

const API_URL = "https://patrones-short-backend-production.up.railway.app";

interface Cluster {
  cluster: number;
  n_casos: number;
  dist_vwap_prom: number;
  caida_desde_max_prom: number;
  vol_relativo_prom: number;
  velocidad_3min_prom: number;
  velas_desde_max_prom: number;
  rango_vela_prom: number;
  resultado_futuro_prom: number;
}

interface Caso {
  symbol: string;
  fecha: string;
  timestamp: string;
  cambio_futuro_pct: number;
  cluster: number;
}

interface Vela {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function Home() {
  const [vista, setVista] = useState<"patrones" | "casos" | "grafico">("patrones");
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [clusterSeleccionado, setClusterSeleccionado] = useState<number | null>(null);
  const [casoSeleccionado, setCasoSeleccionado] = useState<Caso | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/clusters`).then((res) => {
      setClusters(res.data);
      setCargando(false);
    });
  }, []);

  const abrirCluster = (clusterNum: number) => {
    setClusterSeleccionado(clusterNum);
    axios.get(`${API_URL}/api/patrones?cluster=${clusterNum}`).then((res) => {
      setCasos(res.data);
      setVista("casos");
    });
  };

  const abrirGrafico = (caso: Caso) => {
    setCasoSeleccionado(caso);
    setVista("grafico");
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Cargando...</p>
      </main>
    );
  }

  const clustersOrdenados = [...clusters].sort(
    (a, b) => a.resultado_futuro_prom - b.resultado_futuro_prom
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      {vista === "patrones" && (
        <>
          <h1 className="text-3xl font-bold mb-2">Patrones Short Detectados</h1>
          <p className="text-zinc-400 mb-8">
            Basado en {clusters.reduce((a, c) => a + c.n_casos, 0)} momentos analizados
          </p>

          <div className="bg-zinc-900 rounded-xl p-6 mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clustersOrdenados}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="cluster" tickFormatter={(c) => `Patron ${c}`} stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #333" }} />
                <Bar dataKey="resultado_futuro_prom" radius={[4, 4, 0, 0]} cursor="pointer">
                  {clustersOrdenados.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.resultado_futuro_prom < -18 ? "#ef4444" : "#f97316"}
                      onClick={() => abrirCluster(entry.cluster)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="py-2 pr-4">Patron</th>
                  <th className="py-2 pr-4">Casos</th>
                  <th className="py-2 pr-4">Dist. VWAP %</th>
                  <th className="py-2 pr-4">Resultado futuro %</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {clustersOrdenados.map((c) => (
                  <tr
                    key={c.cluster}
                    className="border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                    onClick={() => abrirCluster(c.cluster)}
                  >
                    <td className="py-2 pr-4 font-semibold">Patron {c.cluster}</td>
                    <td className="py-2 pr-4">{c.n_casos}</td>
                    <td className="py-2 pr-4">{c.dist_vwap_prom}</td>
                    <td className={`py-2 pr-4 font-semibold ${c.resultado_futuro_prom < -18 ? "text-red-400" : "text-orange-400"}`}>
                      {c.resultado_futuro_prom}%
                    </td>
                    <td className="py-2 pr-4 text-zinc-500">Ver casos →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {vista === "casos" && (
        <>
          <button
            onClick={() => setVista("patrones")}
            className="mb-4 text-zinc-400 hover:text-white"
          >
            ← Volver a patrones
          </button>
          <h1 className="text-2xl font-bold mb-6">
            Casos del Patron {clusterSeleccionado} ({casos.length})
          </h1>
          <div className="bg-zinc-900 rounded-xl p-6 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="py-2 pr-4">Symbol</th>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Hora señal</th>
                  <th className="py-2 pr-4">Resultado %</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {casos.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                    onClick={() => abrirGrafico(c)}
                  >
                    <td className="py-2 pr-4 font-semibold">{c.symbol}</td>
                    <td className="py-2 pr-4">{c.fecha}</td>
                    <td className="py-2 pr-4">{c.timestamp?.split(" ")[1]}</td>
                    <td className="py-2 pr-4 text-red-400">{c.cambio_futuro_pct}%</td>
                    <td className="py-2 pr-4 text-zinc-500">Ver grafico →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {vista === "grafico" && casoSeleccionado && (
        <GraficoVelas
          caso={casoSeleccionado}
          onVolver={() => setVista("casos")}
        />
      )}
    </main>
  );
}

function GraficoVelas({ caso, onVolver }: { caso: Caso; onVolver: () => void }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/velas/${caso.symbol}/${caso.fecha}`)
      .then((res) => {
        const velas: Vela[] = res.data;
        if (!chartRef.current) return;

        chartRef.current.innerHTML = "";

        const chart = createChart(chartRef.current, {
          width: chartRef.current.clientWidth,
          height: 500,
          layout: {
            background: { type: ColorType.Solid, color: "#18181b" },
            textColor: "#d4d4d8",
          },
          grid: {
            vertLines: { color: "#27272a" },
            horzLines: { color: "#27272a" },
          },
        });

        const candleSeries = (chart as any).addCandlestickSeries({
          upColor: "#22c55e",
          downColor: "#ef4444",
          borderVisible: false,
          wickUpColor: "#22c55e",
          wickDownColor: "#ef4444",
        });

        const datosFormateados = velas.map((v) => ({
          time: (new Date(v.timestamp).getTime() / 1000) as any,
          open: v.open,
          high: v.high,
          low: v.low,
          close: v.close,
        }));

        candleSeries.setData(datosFormateados);
        chart.timeScale().fitContent();
      })
      .catch(() => {
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<p class="text-red-400">No se pudo cargar el grafico de este caso.</p>';
        }
      });
  }, [caso]);

  return (
    <>
      <button onClick={onVolver} className="mb-4 text-zinc-400 hover:text-white">
        ← Volver a casos
      </button>
      <h1 className="text-2xl font-bold mb-2">
        {caso.symbol} — {caso.fecha}
      </h1>
      <p className="text-zinc-400 mb-6">
        Resultado tras la señal: <span className="text-red-400">{caso.cambio_futuro_pct}%</span>
      </p>
      <div className="bg-zinc-900 rounded-xl p-4">
        <div ref={chartRef} />
      </div>
    </>
  );
}