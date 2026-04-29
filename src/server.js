import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { createEpisode, deleteEpisode, getEpisodeById, getEpisodes, updateEpisode } from "./backend/service.js";
import { isSupportedAudio, normalizeAudioMetadata } from "./audio/metadata.js";
import { saveAudioForEpisode } from "./audio/storage.js";
import { generatePodcastRss } from "./rss/generator.js";
import { renderEpisodeDetail, renderHome } from "./frontend/templates.js";
import { ROUTES } from "./config/routes.js";

const PORT = Number(process.env.PORT || 3000);

function json(res, code, body) {
  res.writeHead(code, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function serveAudioIfNeeded(pathname, res) {
  if (!pathname.startsWith("/audio/")) return false;
  const target = path.resolve(process.cwd(), "public", pathname.slice(1));
  if (!fs.existsSync(target)) {
    res.writeHead(404);
    res.end("Not Found");
    return true;
  }
  res.writeHead(200, { "content-type": "audio/mpeg" });
  fs.createReadStream(target).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (serveAudioIfNeeded(pathname, res)) return;

  if (req.method === "GET" && pathname === ROUTES.web.home) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(renderHome(getEpisodes()));
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/episodes/") && !pathname.startsWith("/api/")) {
    const id = pathname.split("/")[2];
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(renderEpisodeDetail(getEpisodeById(id)));
    return;
  }

  if (req.method === "GET" && pathname === ROUTES.feed) {
    const xml = generatePodcastRss(getEpisodes(), `http://${req.headers.host}`);
    res.writeHead(200, { "content-type": "application/rss+xml; charset=utf-8" });
    res.end(xml);
    return;
  }

  if (pathname === ROUTES.api.episodes && req.method === "GET") return json(res, 200, { data: getEpisodes() });

  if (pathname === ROUTES.api.episodes && req.method === "POST") {
    const payload = JSON.parse(String(await readBody(req) || "{}") || "{}");
    const created = createEpisode(payload);
    if (created.error) return json(res, 400, { error: created.error });
    return json(res, 201, { data: created.data });
  }

  if (pathname.startsWith("/api/episodes/") && req.method === "PUT") {
    const id = pathname.split("/")[3];
    const payload = JSON.parse(String(await readBody(req) || "{}") || "{}");
    const updated = updateEpisode(id, payload);
    if (updated.error) return json(res, updated.status || 400, { error: updated.error });
    return json(res, 200, { data: updated.data });
  }

  if (pathname.startsWith("/api/episodes/") && req.method === "DELETE") {
    const id = pathname.split("/")[3];
    const out = deleteEpisode(id);
    if (out.error) return json(res, out.status || 404, { error: out.error });
    return json(res, 200, { data: out.data });
  }

  if (pathname.startsWith("/api/episodes/") && pathname.endsWith("/audio") && req.method === "POST") {
    const parts = pathname.split("/");
    const id = parts[3];
    const filename = url.searchParams.get("filename") || "audio.mp3";
    if (!isSupportedAudio(filename)) return json(res, 400, { error: ["unsupported audio format"] });

    const episode = getEpisodeById(id);
    if (!episode) return json(res, 404, { error: ["episode not found"] });

    const data = await readBody(req);
    const publicUrl = saveAudioForEpisode(id, filename, data);
    const technicalMetadata = normalizeAudioMetadata({});
    const updated = updateEpisode(id, { audioUrl: publicUrl });
    if (updated.error) return json(res, 400, { error: updated.error });
    return json(res, 200, { data: { ...updated.data, technicalMetadata } });
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: ["route not found"] }));
});

if (process.env.NODE_ENV !== "test" && process.env.DISABLE_AUTO_LISTEN !== "1") {
  server.listen(PORT, () => {
    console.log(`podcast web running on http://localhost:${PORT}`);
  });
}

export { server };
