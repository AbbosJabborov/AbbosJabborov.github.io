/**
 * Default seed data for the 3D Neural Network Sphere
 * Used directly on static deployments (GitHub Pages/Cloudflare)
 * and as immediate hydration before/alongside Django backend API.
 */

export const INITIAL_STORIES = [
  {
    id: "gamefest-2026",
    slug: "gamefest-2026",
    title: "Gamefest 2026 Experience & Post-Mortem",
    subtitle: "48 hours, zero sleep, three game prototypes, and an unforgettable community vibe.",
    author: "Abbos Jabborov",
    tags: ["GameDev", "Gamefest", "Hackathon", "Retrospective"],
    reading_time: "4 min read",
    published_at: "February 18, 2026",
    cover_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
    content: `
# Gamefest 2026: Into the Neural Simulation

Last weekend was **Gamefest 2026** — one of the most intense, electrifying hackathons and indie gatherings we've experienced yet. Standing in a massive hall filled with game developers, 3D artists, sound designers, and shader wizards, the energy was pure creative fuel.

> "A game isn't just code and pixels; it's a transient consciousness loop between the designer and the player."

---

## 🎮 The Challenge & Concept

The theme announced at midnight was **"Synchronous Echoes"**. We had exactly 48 hours to design, build, polish, and submit a playable game from scratch.

Our idea: a fast-paced cyberpunk 3D runner where your past ghost actions create temporal bridges and obstacles for your future self. Every jump you missed in iteration *N* leaves a digital ripple you can wall-jump from in iteration *N+1*.

![Gamefest Atmosphere](https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80)

---

## ⚡ Technical Highlights

Here are a few things we learned while crunching shaders and gameplay physics:

1. **Custom HLSL / GLSL Dissolve Shaders**: We wrote procedural noise dissolve materials that disintegrate character clones into glowing voxels upon rewind.
2. **Deterministic Physics State Stacks**: Rewinding time required snapshotting player transforms and velocity vectors at 60Hz.
3. **Adaptive Dynamic Synth Audio**: Modulating synth pitch and low-pass cutoff based on player combo velocity made the game feel alive.

\`\`\`javascript
// Temporal Ghost snapshot sampler
function sampleGhostFrame(timeline, currentTick) {
  const frame = timeline.find(f => f.tick === currentTick);
  if (!frame) return null;
  return {
    position: frame.pos.clone(),
    rotation: frame.rot.clone(),
    energyPulse: Math.sin(currentTick * 0.15) * 0.5 + 0.5
  };
}
\`\`\`

---

## 🏆 The Outcome & Community Reaction

When the judging floor opened, over 150 participants tried the demo. Seeing people get hooked trying to beat each other's ghost speedrun times was the ultimate reward.

We ended up taking **Top 3 Best Mechanics** and made friendships with teams from all over the world.

![Team and Victory](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80)

### What's Next?
We are expanding the prototype into a full Steam title with procedural levels, custom boss battles, and full controller support. Stay tuned for the upcoming beta announcement!
`
  },
  {
    id: "architecture-notes-2026",
    slug: "architecture-notes-2026",
    title: "Designing Spatial Neural Web Interfaces",
    subtitle: "Why 2D flat grids are giving way to interactive 3D constellation graphs.",
    author: "Abbos Jabborov",
    tags: ["WebGL", "ThreeJS", "Spatial UI", "Design"],
    reading_time: "5 min read",
    published_at: "January 14, 2026",
    cover_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1600&q=80",
    content: `
# Spatial Neural Web Interfaces: Beyond the Flat DOM

Modern web applications have spent two decades refining rectangular containers, responsive CSS grids, and cards. But our cognitive mental models aren't flat—they are associative graphs of concepts, projects, memories, and connections.

---

## 🌌 The Constellation Paradigm

When you look at human thought, ideas don't exist in tabs or folders. They exist as **nodes in high-dimensional semantic space**. 

By placing the visitor *inside* a sphere of interconnected synapses:
- **Spatial Memory**: Visitors remember where a project is located in 3D direction ("top-right cyan cluster").
- **Organic Exploration**: Hovering excites neighboring nodes through glowing synaptic axons.
- **Continuous Flow**: Rather than harsh page jumps, transitions feel like zooming through memory space.

\`\`\`glsl
// Synaptic glow intensity formula
float pulse = sin(uTime * 3.0 + nodeIndex * 0.4) * 0.5 + 0.5;
vec3 finalColor = mix(baseColor, glowColor, pulse * hoverWeight);
\`\`\`

---

## 🛠️ Performance & 60FPS Optimization
Building this requires:
1. **InstancedMesh rendering** for hundreds of glowing nodes and stardust particles with a single draw call.
2. **Spherical Fibonacci Distribution** to prevent clustering artifacts and give perfect harmonic spacing.
3. **Quaternion Damped Drag Controls** for silky smooth inertia when swiping on both desktop mice and mobile touchscreens.

The future of personal portfolios is not a static resume document—it is an interactive digital universe.
`
  },
  {
    id: "about-claive",
    slug: "about-claive",
    title: "About Claive // Developer & Creator",
    subtitle: "Software engineer, game developer, and creative technologist.",
    author: "Abbos Jabborov",
    tags: ["About", "Bio", "Stack", "Career"],
    reading_time: "2 min read",
    cover_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    content: `
# Hello, I'm Abbos (Claive) 👋

I am a software engineer and creative technologist passionate about high-performance web systems, 3D graphics, game engines, and building delightful interactive software.

---

## ⚡ What I Build
- **Full-Stack Web Architectures**: React, Three.js, WebGL, Vite, Python, Django, REST APIs, PostgreSQL.
- **Game Development & Systems**: Unreal Engine, Unity, custom C++ / WebGL engines, procedural gameplay systems.
- **Creative Tools & Spatial Interfaces**: Graph visualizations, real-time audio visualizers, and interactive experiments.

---

## 📬 Connect with Me
- **Website**: [claive.uz](https://claive.uz)
- **GitHub**: [github.com/AbbosJabborov](https://github.com/AbbosJabborov)
- **LinkedIn**: [linkedin.com/in/abbos-jabborov](https://www.linkedin.com)
- **Telegram**: [@claive](https://t.me/claive)
`
  }
];

// Obsidian-style Knowledge Graph Nodes & Links
export const GRAPH_DATA = {
  nodes: [

    // Core Root Hub
    {
      id: "core-claive",
      label: "Abbos Jabborov",
      subtitle: "Personal Knowledge Graph & Nexus",
      category: "CORE",
      node_type: "STORY",
      slug: "about-claive",
      color: "#a855f7", // Obsidian Purple
      size: 14,
      isHub: true,
    },

    // Cluster Hub: Projects
    {
      id: "hub-projects",
      label: "Projects",
      subtitle: "Software systems, tools & libraries",
      category: "PROJECT",
      node_type: "EXTERNAL",
      url: "https://github.com/AbbosJabborov",
      color: "#38bdf8", // Sky Blue
      size: 10,
      isHub: true,
    },
    {
      id: "node-scrolls",
      label: "Scrolls",
      subtitle: "Interactive Markdown reader & canvas workspace",
      category: "PROJECT",
      node_type: "EXTERNAL",
      url: "https://scrolls.claive.uz",
      color: "#38bdf8",
      size: 6,
    },
    {
      id: "node-game-engine",
      label: "Custom C++ Engine",
      subtitle: "Vulkan/OpenGL 3D rendering pipeline",
      category: "PROJECT",
      node_type: "EXTERNAL",
      url: "https://github.com/AbbosJabborov",
      color: "#38bdf8",
      size: 6,
    },
    {
      id: "node-notes-wall",
      label: "Whisper Notes",
      subtitle: "Interactive message board & guest reflections",
      category: "PROJECT",
      node_type: "EXTERNAL",
      url: "https://claive.uz/notes",
      color: "#38bdf8",
      size: 5,
    },
    {
      id: "node-ai-research",
      label: "AI & Neural Graphs",
      subtitle: "Agentic coding systems & vector embeddings",
      category: "PROJECT",
      node_type: "EXTERNAL",
      url: "https://claive.uz",
      color: "#38bdf8",
      size: 5,
    },

    // Cluster Hub: Writing & Stories
    {
      id: "hub-writing",
      label: "Writing & Notes",
      subtitle: "Reflections, post-mortems & digital garden",
      category: "STORY",
      node_type: "STORY",
      slug: "gamefest-2026",
      color: "#ec4899", // Rose
      size: 10,
      isHub: true,
    },
    {
      id: "node-gamefest",
      label: "Gamefest 2026",
      subtitle: "48-hour game jam experience, shaders & post-mortem",
      category: "STORY",
      node_type: "STORY",
      slug: "gamefest-2026",
      color: "#ec4899",
      size: 7,
    },
    {
      id: "node-architecture",
      label: "Neural UI Design",
      subtitle: "Spatial interfaces and 3D constellation architectures",
      category: "STORY",
      node_type: "STORY",
      slug: "architecture-notes-2026",
      color: "#ec4899",
      size: 6,
    },
    {
      id: "node-obsidian-vault",
      label: "Digital Garden",
      subtitle: "Interlinked second-brain notes and evergreen thoughts",
      category: "STORY",
      node_type: "STORY",
      slug: "architecture-notes-2026",
      color: "#ec4899",
      size: 5,
    },
    {
      id: "node-bio",
      label: "About Claive",
      subtitle: "Biography, technical stack & background story",
      category: "STORY",
      node_type: "STORY",
      slug: "about-claive",
      color: "#ec4899",
      size: 6,
    },

    // Cluster Hub: Games
    {
      id: "hub-games",
      label: "Game Vault",
      subtitle: "Indie releases, jam prototypes & game physics",
      category: "GAME",
      node_type: "EXTERNAL",
      url: "https://store.steampowered.com",
      color: "#fbbf24", // Amber Gold
      size: 10,
      isHub: true,
    },
    {
      id: "node-games-vault",
      label: "Indie Game Vault",
      subtitle: "Steam releases, jam prototypes & playable builds",
      category: "GAME",
      node_type: "EXTERNAL",
      url: "https://store.steampowered.com",
      color: "#fbbf24",
      size: 7,
    },
    {
      id: "node-retro-arcade",
      label: "Retro Arcade",
      subtitle: "Browser-based pixel mini-games and physics toys",
      category: "GAME",
      node_type: "EXTERNAL",
      url: "https://claive.uz/games",
      color: "#fbbf24",
      size: 5,
    },
    {
      id: "node-steam-library",
      label: "Steam Library",
      subtitle: "Curated game collection and play history",
      category: "GAME",
      node_type: "EXTERNAL",
      url: "https://steamcommunity.com",
      color: "#fbbf24",
      size: 5,
    },
    {
      id: "node-game-jam-2025",
      label: "Game Jam Archive",
      subtitle: "Past jam submissions and experimental prototypes",
      category: "GAME",
      node_type: "STORY",
      slug: "gamefest-2026",
      color: "#fbbf24",
      size: 5,
    },

    // Cluster Hub: Creative Lab & Experiments
    {
      id: "hub-experiments",
      label: "Creative Lab",
      subtitle: "Real-time shaders, audio synthesizers & canvas toys",
      category: "EXPERIMENT",
      node_type: "EXTERNAL",
      url: "https://claive.uz",
      color: "#34d399", // Emerald Mint
      size: 10,
      isHub: true,
    },
    {
      id: "node-shader-lab",
      label: "Shader Lab",
      subtitle: "Procedural HLSL / GLSL visual experiments",
      category: "EXPERIMENT",
      node_type: "EXTERNAL",
      url: "https://claive.uz",
      color: "#34d399",
      size: 6,
    },
    {
      id: "node-creative-code",
      label: "Generative Canvas",
      subtitle: "Algorithmic geometry and mathematical art",
      category: "EXPERIMENT",
      node_type: "EXTERNAL",
      url: "https://claive.uz",
      color: "#34d399",
      size: 5,
    },
    {
      id: "node-soundscape",
      label: "Soundtrack Synapse",
      subtitle: "Curated ambient game soundtracks & coding flow",
      category: "EXPERIMENT",
      node_type: "EXTERNAL",
      url: "https://open.spotify.com",
      color: "#34d399",
      size: 5,
    },
    {
      id: "node-spatial-audio",
      label: "Spatial Web Audio",
      subtitle: "Positional 3D binaural synthesizer engine",
      category: "EXPERIMENT",
      node_type: "EXTERNAL",
      url: "https://claive.uz",
      color: "#34d399",
      size: 5,
    },

    // Cluster Hub: Social & Network
    {
      id: "hub-socials",
      label: "Social Nexus",
      subtitle: "Direct channels, social profiles & contact",
      category: "SOCIAL",
      node_type: "EXTERNAL",
      url: "https://www.linkedin.com/in/abbos-jabborov",
      color: "#60a5fa", // Blue
      size: 10,
      isHub: true,
    },
    {
      id: "node-linkedin",
      label: "LinkedIn",
      subtitle: "Professional profile, connections & career milestones",
      category: "SOCIAL",
      node_type: "EXTERNAL",
      url: "https://www.linkedin.com/in/abbos-jabborov",
      color: "#60a5fa",
      size: 6,
    },
    {
      id: "node-github",
      label: "GitHub",
      subtitle: "Open-source repositories, engines & experiments",
      category: "SOCIAL",
      node_type: "EXTERNAL",
      url: "https://github.com/AbbosJabborov",
      color: "#60a5fa",
      size: 6,
    },
    {
      id: "node-telegram",
      label: "Telegram",
      subtitle: "Direct messaging & project updates channel",
      category: "SOCIAL",
      node_type: "EXTERNAL",
      url: "https://t.me/claive",
      color: "#60a5fa",
      size: 5,
    },
    {
      id: "node-twitter",
      label: "Twitter / X",
      subtitle: "Tech thoughts, game clips & release announcements",
      category: "SOCIAL",
      node_type: "EXTERNAL",
      url: "https://x.com",
      color: "#60a5fa",
      size: 5,
    },
    {
      id: "node-resume",
      label: "Resume & CV",
      subtitle: "Experience timeline and engineering achievements",
      category: "SOCIAL",
      node_type: "STORY",
      slug: "about-claive",
      color: "#60a5fa",
      size: 5,
    },
    {
      id: "node-contact",
      label: "Get in Touch",
      subtitle: "Collaborations, freelance & contract opportunities",
      category: "SOCIAL",
      node_type: "EXTERNAL",
      url: "mailto:contact@claive.uz",
      color: "#60a5fa",
      size: 5,
    },
  ],

  // Obsidian-style semantic graph links (Interconnected Clusters)
  links: [
    // Core connections to major Hubs
    { source: "core-claive", target: "hub-projects" },
    { source: "core-claive", target: "hub-writing" },
    { source: "core-claive", target: "hub-games" },
    { source: "core-claive", target: "hub-experiments" },
    { source: "core-claive", target: "hub-socials" },

    // Projects Cluster
    { source: "hub-projects", target: "node-scrolls" },
    { source: "hub-projects", target: "node-game-engine" },
    { source: "hub-projects", target: "node-notes-wall" },
    { source: "hub-projects", target: "node-ai-research" },

    // Writing Cluster
    { source: "hub-writing", target: "node-gamefest" },
    { source: "hub-writing", target: "node-architecture" },
    { source: "hub-writing", target: "node-obsidian-vault" },
    { source: "hub-writing", target: "node-bio" },

    // Games Cluster
    { source: "hub-games", target: "node-games-vault" },
    { source: "hub-games", target: "node-retro-arcade" },
    { source: "hub-games", target: "node-steam-library" },
    { source: "hub-games", target: "node-game-jam-2025" },

    // Experiments Cluster
    { source: "hub-experiments", target: "node-shader-lab" },
    { source: "hub-experiments", target: "node-creative-code" },
    { source: "hub-experiments", target: "node-soundscape" },
    { source: "hub-experiments", target: "node-spatial-audio" },

    // Socials Cluster
    { source: "hub-socials", target: "node-linkedin" },
    { source: "hub-socials", target: "node-github" },
    { source: "hub-socials", target: "node-telegram" },
    { source: "hub-socials", target: "node-twitter" },
    { source: "hub-socials", target: "node-resume" },
    { source: "hub-socials", target: "node-contact" },

    // Semantic Cross-Cluster Interconnections (The signature Obsidian graph web)
    { source: "node-gamefest", target: "hub-games" },
    { source: "node-gamefest", target: "node-shader-lab" },
    { source: "node-scrolls", target: "node-obsidian-vault" },
    { source: "node-scrolls", target: "node-notes-wall" },
    { source: "node-game-engine", target: "node-shader-lab" },
    { source: "node-game-engine", target: "node-games-vault" },
    { source: "node-architecture", target: "node-ai-research" },
    { source: "node-architecture", target: "node-creative-code" },
    { source: "node-soundscape", target: "node-spatial-audio" },
    { source: "node-github", target: "hub-projects" },
    { source: "node-github", target: "node-game-engine" },
    { source: "node-bio", target: "node-resume" },
    { source: "node-bio", target: "core-claive" },
    { source: "node-retro-arcade", target: "node-creative-code" },
  ],
};

export const INITIAL_NODES = GRAPH_DATA.nodes;


