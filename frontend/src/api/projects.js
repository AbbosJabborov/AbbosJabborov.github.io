import API_BASE_URL from "../config/api";

export async function fetchProjects() {
  const r = await fetch(`${API_BASE_URL}/api/projects/`);
  if (!r.ok) throw new Error("Failed fetching projects");
  return r.json();
}
