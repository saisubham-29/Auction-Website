export type Player = {
  player: string;
  base: number;
  team: string;
  sold: number;
};

export type TeamSummary = {
  team: string;
  startValue: number;
  totalSpent: number;
  currentAmount: number;
};

async function get(action: string) {
  const res = await fetch(`/api/sheet?action=${action}`);
  const json = await res.json();
  return json;
}

export async function fetchPlayers(): Promise<Player[]> {
  const rows: string[][] = await get("getPlayers");
  if (!Array.isArray(rows)) return [];
  return rows.slice(1).filter(r => r[0]).map((r) => ({
    player: r[0], base: parseFloat(r[1]) || 0, team: r[2], sold: parseFloat(r[3]) || 0,
  }));
}

export async function fetchTeamSummary(): Promise<TeamSummary[]> {
  const rows: string[][] = await get("getTeams");
  if (!Array.isArray(rows)) return [];
  return rows.slice(1).filter(r => r[0]).map((r) => ({
    team: r[0],
    startValue: parseFloat(r[1]) || 0,
    totalSpent: parseFloat(r[1]) - (parseFloat(r[3]) || 0),
    currentAmount: parseFloat(r[3]) || 0,
  }));
}

export async function fetchTeamNames(): Promise<string[]> {
  const data = await get("getTeamNames");
  if (!Array.isArray(data)) return [];
  return data.filter(Boolean);
}

export async function submitPlayer(player: string, base: number, team: string, sold: number): Promise<void> {
  const fd = new FormData();
  fd.append("action", "addPlayer");
  fd.append("player", player);
  fd.append("base", String(base));
  fd.append("team", team);
  fd.append("sold", String(sold));
  await fetch("/api/sheet", { method: "POST", body: fd });
}

export async function deletePlayer(row: number, team: string, sold: number): Promise<void> {
  const fd = new FormData();
  fd.append("action", "deletePlayer");
  fd.append("row", String(row));
  fd.append("team", team);
  fd.append("sold", String(sold));
  await fetch("/api/sheet", { method: "POST", body: fd });
}

export async function editPlayer(row: number, player: string, base: number, team: string, sold: number, oldTeam: string, oldSold: number): Promise<void> {
  const fd = new FormData();
  fd.append("action", "editPlayer");
  fd.append("row", String(row));
  fd.append("player", player);
  fd.append("base", String(base));
  fd.append("team", team);
  fd.append("sold", String(sold));
  fd.append("oldTeam", oldTeam);
  fd.append("oldSold", String(oldSold));
  await fetch("/api/sheet", { method: "POST", body: fd });
}
export async function addTeam(teamName: string, budget: number): Promise<void> {
  const fd = new FormData();
  fd.append("action", "addTeam");
  fd.append("teamName", teamName);
  fd.append("budget", String(budget));
  await fetch("/api/sheet", { method: "POST", body: fd });
}
