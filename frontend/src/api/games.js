import API_BASE_URL from "../config/api";

export async function fetchGames() {
  const r = await fetch(`${API_BASE_URL}/api/games/`);
  if (!r.ok) throw new Error("Failed fetching games");
  return r.json();
}
