function layout(title, content) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root {
      --bg: #040605;
      --bg-2: #0a120d;
      --ink: #f3fff7;
      --muted: #a8c1b0;
      --card: #0e1812;
      --line: #203628;
      --accent: #39ff88;
      --accent-2: #ffd84d;
      --accent-soft: rgba(57, 255, 136, 0.14);
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Orbitron", "Rajdhani", "Trebuchet MS", sans-serif;
      margin: 0;
      color: var(--ink);
      background:
        radial-gradient(circle at 20% 20%, rgba(57, 255, 136, 0.12), transparent 35%),
        radial-gradient(circle at 80% 10%, rgba(255, 216, 77, 0.08), transparent 30%),
        linear-gradient(135deg, var(--bg), var(--bg-2));
    }
    header, main { max-width: 980px; margin: 0 auto; padding: 16px; }
    header h1 {
      margin: 0;
      font-size: 1.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 0 12px rgba(57, 255, 136, 0.45);
    }
    header p { margin: 8px 0 0; color: var(--muted); }
    .group {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: linear-gradient(180deg, rgba(22, 18, 36, 0.95), rgba(16, 13, 30, 0.95));
      margin: 0 0 14px;
      overflow: hidden;
      box-shadow: 0 0 0 1px rgba(57, 255, 136, 0.12), 0 14px 32px rgba(0, 0, 0, 0.35);
    }
    .group summary {
      list-style: none;
      cursor: pointer;
      padding: 12px 14px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--accent);
      background: linear-gradient(180deg, rgba(10, 18, 13, 0.95), rgba(13, 25, 18, 0.95));
      border-bottom: 1px solid var(--line);
    }
    .group summary::-webkit-details-marker { display: none; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 12px; padding: 12px; }
    .card {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(16, 28, 20, 0.96), rgba(12, 22, 16, 0.96));
      padding: 12px;
      transform: translateY(4px);
      opacity: 0;
      animation: reveal 0.35s ease forwards;
    }
    .card h2 { margin: 0 0 8px; font-size: 1.08rem; }
    .card p { margin: 0 0 10px; color: var(--muted); }
    .thumb {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--line);
      margin: 0 0 10px;
      box-shadow: 0 0 0 1px rgba(255, 216, 77, 0.2);
    }
    .meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .status {
      font-size: 12px;
      border-radius: 999px;
      padding: 3px 8px;
      background: linear-gradient(90deg, var(--accent-soft), rgba(255, 216, 77, 0.18));
      color: var(--ink);
      text-transform: capitalize;
      border: 1px solid rgba(57, 255, 136, 0.3);
    }
    .empty { padding: 14px; color: var(--muted); }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .detail {
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 16px;
      background: linear-gradient(180deg, rgba(16, 28, 20, 0.96), rgba(12, 22, 16, 0.96));
      box-shadow: 0 0 0 1px rgba(57, 255, 136, 0.12), 0 14px 32px rgba(0, 0, 0, 0.35);
    }
    .detail ul { padding-left: 18px; color: var(--muted); }
    @keyframes reveal { to { transform: translateY(0); opacity: 1; } }
    @media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Podcast Web Platform</h1>
    <p>Neon feed para tu podcast en modo cyberpunk</p>
  </header>
  <main>${content}</main>
</body>
</html>`;
}

export function renderHome(episodes) {
  if (!episodes.length) {
    return layout("Podcast - Inicio", '<p class="empty">Sin episodios.</p>');
  }

  const byStatus = episodes.reduce((acc, episode) => {
    const key = episode.status || "draft";
    if (!acc[key]) acc[key] = [];
    acc[key].push(episode);
    return acc;
  }, {});

  const groups = Object.entries(byStatus)
    .map(([status, items]) => {
      const cards = items
        .map(
          (e) => `<article class="card">
  ${e.thumbnailUrl ? `<img class="thumb" src="${e.thumbnailUrl}" alt="Miniatura de ${e.title}" />` : ""}
  <h2><a href="/episodes/${e.id}">${e.title}</a></h2>
  <p>${e.description.slice(0, 140)}</p>
  <div class="meta"><span class="status">${e.status}</span></div>
</article>`
        )
        .join("\n");

      return `<details class="group" open>
  <summary>${status} (${items.length})</summary>
  <section class="grid">${cards}</section>
</details>`;
    })
    .join("\n");

  return layout("Podcast - Inicio", groups);
}

export function renderEpisodeDetail(episode) {
  if (!episode) return layout("No encontrado", "<p>Episodio no encontrado</p>");
  return layout(
    episode.title,
    `<article class="detail">
  ${episode.thumbnailUrl ? `<img class="thumb" src="${episode.thumbnailUrl}" alt="Miniatura de ${episode.title}" />` : ""}
  <h2>${episode.title}</h2>
  <p>${episode.description}</p>
  <ul>
    <li>Duración: ${episode.duration}s</li>
    <li>Publicación: ${episode.publishDate}</li>
    <li>Estado: ${episode.status}</li>
  </ul>
  ${
    episode.audioUrl
      ? `<audio controls src="${episode.audioUrl}">Tu navegador no soporta audio.</audio>`
      : "<p>Audio no disponible</p>"
  }
</article>`
  );
}
