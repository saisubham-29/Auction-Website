"use client";
import { useState, useMemo } from "react";
import { Player, editPlayer, deletePlayer } from "../lib/api";

export default function AuctionTable({ data, teamNames, onRefresh, isAdmin }: { data: Player[]; teamNames: string[]; onRefresh: () => void; isAdmin?: boolean }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Player>("player");
  const [sortAsc, setSortAsc] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);

  async function handleDelete(r: Player, i: number) {
    if (!confirm(`Delete "${r.player}"?`)) return;
    setDeletingIdx(i);
    const rowNum = data.indexOf(filtered[i]) + 2;
    await deletePlayer(rowNum, r.team, r.sold);
    setDeletingIdx(null);
    onRefresh();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...data]
      .filter((r) => r.player.toLowerCase().includes(q) || r.team.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        return sortAsc ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
      });
  }, [data, search, sortKey, sortAsc]);

  function toggleSort(key: keyof Player) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  function startEdit(player: Player, idx: number) {
    setEditIdx(idx);
    setEditForm({ ...player });
  }

  async function saveEdit() {
    if (!editForm || editIdx === null) return;
    setSaving(true);
    const original = filtered[editIdx];
    // row = original index in data + 2 (1 for header, 1 for 1-based)
    const rowNum = data.indexOf(original) + 2;
    await editPlayer(rowNum, editForm.player, editForm.base, editForm.team, editForm.sold, original.team, original.sold);
    setSaving(false);
    setEditIdx(null);
    setEditForm(null);
    onRefresh();
  }

  const Th = ({ label, k }: { label: string; k: keyof Player }) => (
    <th onClick={() => toggleSort(k)}
      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-yellow-400 transition-colors">
      {label} {sortKey === k ? (sortAsc ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player or team…"
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
              <Th label="Player" k="player" />
              <Th label="Base Price" k="base" />
              <Th label="Team" k="team" />
              <Th label="Sold Price" k="sold" />
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">No entries found.</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={i} className={`border-t border-gray-800 hover:bg-yellow-500/5 transition-colors ${i % 2 === 0 ? "bg-gray-900/40" : ""}`}>
                <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                {editIdx === i ? (
                  <>
                    <td className="px-2 py-2"><input value={editForm!.player} onChange={e => setEditForm(f => ({ ...f!, player: e.target.value }))}
                      className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-yellow-500" /></td>
                    <td className="px-2 py-2"><input type="number" value={editForm!.base} onChange={e => setEditForm(f => ({ ...f!, base: Number(e.target.value) }))}
                      className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm w-24 focus:outline-none focus:border-yellow-500" /></td>
                    <td className="px-2 py-2">
                      <select value={editForm!.team} onChange={e => setEditForm(f => ({ ...f!, team: e.target.value }))}
                        className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-yellow-500">
                        {teamNames.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2"><input type="number" value={editForm!.sold} onChange={e => setEditForm(f => ({ ...f!, sold: Number(e.target.value) }))}
                      className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm w-24 focus:outline-none focus:border-yellow-500" /></td>
                    <td className="px-2 py-2 flex gap-2">
                      <button onClick={saveEdit} disabled={saving}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded transition disabled:opacity-50">
                        {saving ? "…" : "Save"}
                      </button>
                      <button onClick={() => setEditIdx(null)} className="text-gray-400 hover:text-white text-xs px-2 py-1">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-5 py-3 font-medium text-white">{r.player}</td>
                    <td className="px-5 py-3 text-gray-300">₹{r.base.toLocaleString()}</td>
                    <td className="px-5 py-3"><span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs px-2 py-0.5 rounded-full">{r.team}</span></td>
                    <td className="px-5 py-3 text-green-400 font-semibold">₹{r.sold.toLocaleString()}</td>
                    <td className="px-5 py-3 flex gap-3">
                      {isAdmin && <>
                        <button onClick={() => startEdit(r, i)} className="text-gray-500 hover:text-yellow-400 text-xs transition">✏️ Edit</button>
                        <button onClick={() => handleDelete(r, i)} disabled={deletingIdx === i}
                          className="text-gray-500 hover:text-red-400 text-xs transition disabled:opacity-50">
                          {deletingIdx === i ? "…" : "🗑️ Delete"}
                        </button>
                      </>}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
