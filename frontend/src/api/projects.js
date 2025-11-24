export async function fetchProjects() {
  const r = await fetch("/api/projects/");
  if (!r.ok) throw new Error("Failed fetching projects");
  return r.json();
}
