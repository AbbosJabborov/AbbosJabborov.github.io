export async function fetchGames() {
  const r = await fetch("/api/games/");
  if (!r.ok) throw new Error("Failed fetching games");
  return r.json();
}
