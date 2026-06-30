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

const API_URL = "https://patrones-short-backend-production.up.railway.app";

export default function Home() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/clusters`)
      .then((res) => {
        setClusters(res.data);
        setCargando(false);
      })
      .catch((err) => {
        setError("No se pudo conectar con el backend.");
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Cargando patrones...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  const clustersOrdenados = [...clusters].sort(
    (a, b) => a.resultado_futuro_prom - b.resultado_futuro_prom
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Patrones Short Detectados</h1>
      <p className="text-zinc-400 mb-8">
        Basado en {clusters.reduce((acc, c) => acc + c.n_casos, 0)} momentos analizados de
        pump &amp; dump reales
      </p>

      <div className="bg-zinc-900 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Resultado promedio por patron (%)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={clustersOrdenados}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="cluster" tickFormatter={(c) => `Patron ${c}`} stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", border: "1px solid #333" }}
              labelFormatter={(c) => `Patron ${c}`}
            />
            <Bar dataKey="resultado_futuro_prom" radius={[4, 4, 0, 0]}>
              {clustersOrdenados.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.resultado_futuro_prom < -18 ? "#ef4444" : "#f97316"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Detalle de cada patron</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400">
              <th className="py-2 pr-4">Patron</th>
              <th className="py-2 pr-4">Casos</th>
              <th className="py-2 pr-4">Dist. VWAP %</th>
              <th className="py-2 pr-4">Caida desde max %</th>
              <th className="py-2 pr-4">Vol. relativo</th>
              <th className="py-2 pr-4">Velocidad 3min %</th>
              <th className="py-2 pr-4">Velas desde max</th>
              <th className="py-2 pr-4">Rango vela %</th>
              <th className="py-2 pr-4">Resultado futuro %</th>
            </tr>
          </thead>
          <tbody>
            {clustersOrdenados.map((c) => (
              <tr
                key={c.cluster}
                className="border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer"
              >
                <td className="py-2 pr-4 font-semibold">Patron {c.cluster}</td>
                <td className="py-2 pr-4">{c.n_casos}</td>
                <td className="py-2 pr-4">{c.dist_vwap_prom}</td>
                <td className="py-2 pr-4">{c.caida_desde_max_prom}</td>
                <td className="py-2 pr-4">{c.vol_relativo_prom}</td>
                <td className="py-2 pr-4">{c.velocidad_3min_prom}</td>
                <td className="py-2 pr-4">{c.velas_desde_max_prom}</td>
                <td className="py-2 pr-4">{c.rango_vela_prom}</td>
                <td
                  className={`py-2 pr-4 font-semibold ${
                    c.resultado_futuro_prom < -18 ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  {c.resultado_futuro_prom}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}