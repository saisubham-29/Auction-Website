"use client";
import { useState } from "react";
import { submitPlayer } from "../lib/api";

const TEAMS = ["Team A", "Team B", "Team C", "Team D", "Team E"];

export default function AuctionForm({ onSuccess }: { onSuccess: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitPlayer(new FormData(e.currentTarget));
      setStatus("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => { setStatus("idle"); onSuccess(); }, 1500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {status === "success" ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3 animate-bounce">🎉</div>
          <p className="text-white font-semibold">Entry Recorded!</p>
          <p className="text-gray-400 text-sm mt-1">Refreshing data…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Player Name", name: "player", type: "text", placeholder: "e.g. Virat Kohli" },
            { label: "Base Price (₹)", name: "base", type: "number", placeholder: "e.g. 200000" },
            { label: "Sold Price (₹)", name: "sold", type: "number", placeholder: "e.g. 500000" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
              <input type={type} name={name} required min={type === "number" ? 0 : undefined} placeholder={placeholder}
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Team</label>
            <select name="team" required className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition cursor-pointer">
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={status === "loading"}
              className="bg-yellow-500 hover:bg-yellow-400 active:scale-95 disabled:opacity-60 text-black font-bold px-8 py-2.5 rounded-lg transition-all text-sm">
              {status === "loading" ? "Submitting…" : "⚡ Submit Entry"}
            </button>
            {status === "error" && <p className="text-red-400 text-sm">Something went wrong. Try again.</p>}
          </div>
        </form>
      )}
    </div>
  );
}
