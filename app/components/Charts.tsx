"use client";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { Player, TeamSummary } from "../lib/api";

const COLORS = ["#eab308","#22c55e","#3b82f6","#f97316","#a855f7","#ec4899","#14b8a6","#f43f5e"];

const fmt = (v: number | string | undefined) => { const n = Number(v); return `₹${n >= 1e6 ? (n / 1e6).toFixed(1) + "L" : n.toLocaleString()}`; };

export default function Charts({ players, teamSummary }: { players: Player[]; teamSummary: TeamSummary[] }) {
  // 1. Spend per team (bar)
  const spendData = useMemo(() =>
    teamSummary.map(t => ({ name: t.team, spent: t.totalSpent, remaining: t.currentAmount })),
    [teamSummary]);

  // 2. Player count per team (pie)
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    players.forEach(p => { map[p.team] = (map[p.team] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [players]);

  // 3. Top 8 most expensive players (bar)
  const topPlayers = useMemo(() =>
    [...players].sort((a, b) => b.sold - a.sold).slice(0, 8).map(p => ({ name: p.player, sold: p.sold, base: p.base })),
    [players]);

  // 4. Budget utilisation radar
  const radarData = useMemo(() =>
    teamSummary.map(t => ({
      team: t.team,
      utilisation: t.startValue ? Math.round((t.totalSpent / t.startValue) * 100) : 0,
    })),
    [teamSummary]);

  if (!players.length && !teamSummary.length) {
    return <div className="text-center py-20 text-gray-500">No data to chart yet.</div>;
  }

  return (
    <div className="space-y-6">

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Spend vs Remaining */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-semibold mb-4 text-gray-300">💰 Spend vs Remaining per Team</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={spendData} margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tickFormatter={fmt} tick={{ fill: "#6b7280", fontSize: 10 }} width={55} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} labelStyle={{ color: "#f9fafb" }} />
              <Bar dataKey="spent" name="Spent" fill="#eab308" radius={[4, 4, 0, 0]} />
              <Bar dataKey="remaining" name="Remaining" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Player distribution pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-semibold mb-4 text-gray-300">🏏 Player Distribution by Team</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top players */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-semibold mb-4 text-gray-300">🔥 Top 8 Most Expensive Players</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topPlayers} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" tickFormatter={fmt} tick={{ fill: "#6b7280", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} width={90} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} labelStyle={{ color: "#f9fafb" }} />
              <Bar dataKey="sold" name="Sold Price" radius={[0, 4, 4, 0]}>
                {topPlayers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget utilisation radar */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-semibold mb-4 text-gray-300">📡 Budget Utilisation % (Radar)</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={85}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="team" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Radar name="Utilisation %" dataKey="utilisation" stroke="#eab308" fill="#eab308" fillOpacity={0.25} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
