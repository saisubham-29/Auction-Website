"use client";
import { useState, useMemo } from "react";
import { Player, TeamSummary } from "../lib/api";

export default function TeamPlayerView({ players, teamSummary }: { players: Player[]; teamSummary: TeamSummary[] }) {
  const teams = useMemo(() => [...new Set(players.map(p => p.team))].sort(), [players]);
  const [selected, setSelected] = useState<string>("ALL");

  const filtered = useMemo(() =>
    selected === "ALL" ? players : players.filter(p => p.team === selected),
    [players, selected]);

  const summary = teamSummary.find(t => t.team === selected);
  const totalSpent = filtered.reduce((s, p) => s + p.sold, 0);

  return (
    <div className="space-y-5">

      {/* Team pills */}
      <div className="flex flex-wrap gap-2">
        {["ALL", ...teams].map(t => (
          <button key={t} onClick={() => setSelected(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected === t
                ? "bg-yellow-500 text-black border-yellow-500"
                : "bg-gray-900 text-gray-400 border-gray-700 hover:border-yellow-500 hover:text-white"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Stats strip (only when a team is selected) */}
      {selected !== "ALL" && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Players", value: filtered.length, color: "text-white" },
            { label: "Budget", value: `₹${summary.startValue.toLocaleString()}`, color: "text-gray-300" },
            { label: "Spent", value: `₹${summary.totalSpent.toLocaleString()}`, color: "text-red-400" },
            { label: "Remaining", value: `₹${summary.currentAmount.toLocaleString()}`, color: summary.currentAmount >= 0 ? "text-green-400" : "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Player cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No players found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const multiplier = p.base ? (p.sold / p.base).toFixed(1) : "—";
            return (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-yellow-500/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-white">{p.player}</p>
                    <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {p.team}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">{multiplier}x</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <div>
                    <p className="text-gray-500 text-xs">Base</p>
                    <p className="text-gray-300 font-medium">₹{p.base.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Sold</p>
                    <p className="text-green-400 font-bold">₹{p.sold.toLocaleString()}</p>
                  </div>
                </div>
                {/* price bar */}
                <div className="mt-3 bg-gray-800 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((p.sold / (totalSpent || 1)) * 100 * filtered.length, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
