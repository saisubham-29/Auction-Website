"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchPlayers, fetchTeamSummary, fetchTeamNames, addTeam, submitPlayer, Player, TeamSummary } from "./lib/api";
import AuctionTable from "./components/AuctionTable";
import TeamSummaryTable from "./components/TeamSummary";

const SLIDES = [
  { url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80", caption: "The Game Begins", sub: "Season 2026 Auction" },
  { url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80", caption: "Bid. Win. Dominate.", sub: "Highest bidder takes all" },
  { url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80", caption: "Build Your Dream Team", sub: "Strategy is everything" },
  { url: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&q=80", caption: "Champions Are Made Here", sub: "Who will you pick?" },
];

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamSummary, setTeamSummary] = useState<TeamSummary[]>([]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"players" | "teams" | "add" | "manage">("players");
  const [slide, setSlide] = useState(0);
  const [muted, setMuted] = useState(true);
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamBudget, setNewTeamBudget] = useState("");
  const [teamAdding, setTeamAdding] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [p, t, names] = await Promise.all([fetchPlayers(), fetchTeamSummary(), fetchTeamNames()]);
    setPlayers(p);
    setTeamSummary(t);
    setTeamNames(names);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const totalSpend = players.reduce((s, p) => s + p.sold, 0);

  async function handleAddTeam() {
    if (!newTeamName.trim()) return;
    setTeamAdding(true);
    await addTeam(newTeamName.trim(), Number(newTeamBudget) || 1000000);
    setNewTeamName("");
    setNewTeamBudget("");
    setTeamAdding(false);
    refresh();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus("loading");
    const fd = new FormData(e.currentTarget);
    try {
      await submitPlayer(
        fd.get("player") as string,
        Number(fd.get("base")),
        fd.get("team") as string,
        Number(fd.get("sold")),
      );
      setFormStatus("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => { setFormStatus("idle"); refresh(); setTab("players"); }, 1500);
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <iframe
            key={muted ? "m" : "u"}
            src={`https://www.youtube.com/embed/vDag_pZuaoU?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=vDag_pZuaoU&controls=0&rel=0&modestbranding=1&playsinline=1`}
            allow="autoplay; encrypted-media"
            className="w-full h-full scale-150"
            style={{ border: "none" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-950" />
        <button
          onClick={() => setMuted(m => !m)}
          className="absolute top-5 right-5 z-20 bg-black/50 hover:bg-black/80 border border-gray-600 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur transition pointer-events-auto"
        >
          {muted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
        <div className="relative z-10 text-center px-4" style={{ animation: "fade-in 1s ease both" }}>
          <p className="text-yellow-400 uppercase tracking-[0.3em] text-sm font-semibold mb-3 animate-pulse">🏏 Live Auction</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-2xl">
            PLAYER <span className="text-yellow-400">AUCTION</span>
          </h1>
          <p className="mt-4 text-gray-300 text-lg font-light">Season 2026 · Bid Smart. Win Big.</p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 text-xs flex flex-col items-center gap-1">
          <span>scroll down</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* DASHBOARD */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Players", value: players.length, icon: "👤" },
            { label: "Teams", value: teamNames.length, icon: "🏆" },
            { label: "Total Spend", value: `₹${totalSpend.toLocaleString()}`, icon: "💰" },
            { label: "Avg Sold Price", value: players.length ? `₹${Math.round(totalSpend / players.length).toLocaleString()}` : "—", icon: "📊" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-wrap">
            {([
              { key: "players", label: "🏏 Players" },
              { key: "teams", label: "🏆 Team Summary" },
              { key: "add", label: "➕ Add Entry" },
              { key: "manage", label: "⚙️ Manage Teams" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs px-3 py-1.5 rounded-lg transition disabled:opacity-50">
            <span className={loading ? "animate-spin inline-block" : ""}>🔄</span> Refresh
          </button>
        </div>

        {/* Tab content */}
        {loading && tab !== "add" && tab !== "manage" ? (
          <div className="text-center py-20 text-gray-500">Loading data…</div>
        ) : (
          <div>
            {/* PLAYERS */}
            {tab === "players" && <AuctionTable data={players} teamNames={teamNames} onRefresh={refresh} />}

            {/* TEAMS */}
            {tab === "teams" && <TeamSummaryTable data={teamSummary} />}

            {/* ADD ENTRY */}
            {tab === "add" && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-5">Register Auction Bid</h2>
                {formStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3 animate-bounce">🎉</div>
                    <p className="font-semibold">Entry Recorded!</p>
                    <p className="text-gray-400 text-sm mt-1">Redirecting…</p>
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
                        {teamNames.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <button type="submit" disabled={formStatus === "loading"}
                        className="bg-yellow-500 hover:bg-yellow-400 active:scale-95 disabled:opacity-60 text-black font-bold px-8 py-2.5 rounded-lg transition-all text-sm">
                        {formStatus === "loading" ? "Submitting…" : "⚡ Submit Entry"}
                      </button>
                      {formStatus === "error" && <p className="text-red-400 text-sm">Something went wrong.</p>}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* MANAGE TEAMS */}
            {tab === "manage" && (
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Add New Team</h2>
                  <div className="flex gap-3 flex-wrap">
                    <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                      placeholder="Team name"
                      className="flex-1 min-w-40 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" />
                    <input value={newTeamBudget} onChange={e => setNewTeamBudget(e.target.value)}
                      type="number" placeholder="Budget (₹)"
                      className="flex-1 min-w-40 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition" />
                    <button onClick={handleAddTeam} disabled={teamAdding || !newTeamName.trim()}
                      className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-lg text-sm transition">
                      {teamAdding ? "Adding…" : "+ Add Team"}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800">
                    <h2 className="font-bold text-lg">Team Registry</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Pulled from Sheet2</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400">
                        <tr>
                          {["#", "Team Name", "Start Budget", "Total Spent", "Remaining", "Players"].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {teamNames.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-10 text-gray-500">No teams in Sheet2.</td></tr>
                        ) : teamNames.map((name, i) => {
                          const summary = teamSummary.find(t => t.team === name);
                          const playerCount = players.filter(p => p.team === name).length;
                          return (
                            <tr key={i} className={`border-t border-gray-800 hover:bg-yellow-500/5 transition-colors ${i % 2 === 0 ? "bg-gray-900/40" : ""}`}>
                              <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                              <td className="px-5 py-3 font-semibold text-white">{name}</td>
                              <td className="px-5 py-3 text-gray-300">₹{(summary?.startValue || 0).toLocaleString()}</td>
                              <td className="px-5 py-3 text-red-400">₹{(summary?.totalSpent || 0).toLocaleString()}</td>
                              <td className={`px-5 py-3 font-semibold ${(summary?.currentAmount ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                ₹{(summary?.currentAmount || 0).toLocaleString()}
                              </td>
                              <td className="px-5 py-3">
                                <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs px-2 py-0.5 rounded-full">{playerCount}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CAROUSEL */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-center text-gray-400 text-xs uppercase tracking-widest mb-8">🏆 Auction Highlights</h3>
          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${slide * 25}%)`, width: `${SLIDES.length * 25}%` }}>
              {SLIDES.map((s, i) => (
                <div key={i} onClick={() => setSlide(i)} style={{ width: `${100 / SLIDES.length}%` }} className="px-2 flex-shrink-0">
                  <div className={`relative h-48 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${i === slide ? "border-yellow-400 scale-105 shadow-yellow-500/30 shadow-xl" : "border-gray-700 opacity-60 hover:opacity-80"}`}>
                    <img src={s.url} alt={s.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-bold text-sm">{s.caption}</p>
                      <p className="text-gray-300 text-xs mt-0.5">{s.sub}</p>
                    </div>
                    {i === slide && <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">LIVE</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-yellow-400" : "w-2 bg-gray-600"}`} />
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-600 text-xs pb-8">Auction Management System · {new Date().getFullYear()}</footer>

      <style>{`
        @keyframes fade-in { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
