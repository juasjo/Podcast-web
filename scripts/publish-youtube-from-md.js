import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const DEFAULT_FILE = path.join(ROOT, "data", "youtube-sources.md");
const ARCHIVE_FILE = path.join(ROOT, "data", "youtube-imported.json");

function parseArgs(argv) {
  const out = { file: DEFAULT_FILE, latest: 3, baseUrl: "http://localhost:3000", status: "published", minDuration: 180 };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--file") out.file = argv[++i];
    else if (token === "--latest") out.latest = Number(argv[++i] || 3);
    else if (token === "--base-url") out.baseUrl = argv[++i];
    else if (token === "--status") out.status = argv[++i];
    else if (token === "--min-duration") out.minDuration = Number(argv[++i] || 180);
    else if (token === "--help") out.help = true;
  }
  return out;
}

function usage() {
  console.log(`Uso:
  node scripts/publish-youtube-from-md.js [--file data/youtube-sources.md] [--latest 3] [--base-url http://localhost:3000] [--status published] [--min-duration 180]

Formato del markdown:
  video: https://www.youtube.com/watch?v=VIDEO_ID
  channel: https://www.youtube.com/@canal | latest=5
  subscription: https://www.youtube.com/@canal
  https://www.youtube.com/watch?v=VIDEO_ID
`);
}

function resolveTool(name) {
  const candidates = [
    `/opt/homebrew/bin/${name}`,
    `/usr/local/bin/${name}`,
    `/usr/bin/${name}`,
    name
  ];

  const probes = [["--version"], ["-version"], []];
  for (const candidate of candidates) {
    for (const args of probes) {
      const probe = spawnSync(candidate, args, { encoding: "utf8" });
      if (!probe.error && probe.status === 0) {
        if (candidate !== name) return candidate;
        const whichOut = spawnSync("which", [name], { encoding: "utf8" });
        const resolved = String(whichOut.stdout || "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .find((line) => line.startsWith("/"));
        return resolved || candidate;
      }
    }
  }

  throw new Error(
    `Falta dependencia '${name}'. Instalala y/o agrega su ruta al PATH (ej: /opt/homebrew/bin).`
  );
}

function run(command, args, opts = {}) {
  const out = spawnSync(command, args, { encoding: "utf8", ...opts });
  if (out.status !== 0) {
    throw new Error(`${command} fallo: ${out.stderr || out.stdout}`);
  }
  return out.stdout;
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function isLikelyVideoUrl(url) {
  const u = String(url || "").toLowerCase();
  return u.includes("watch?v=") || u.includes("youtu.be/");
}

function isLikelyChannelUrl(url) {
  const u = String(url || "").toLowerCase();
  return u.includes("youtube.com/@") || u.includes("youtube.com/channel/") || u.includes("youtube.com/c/");
}

function parseSources(markdown, fallbackLatest) {
  const entries = [];
  const lines = markdown.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;

    const normalized = line.startsWith("- ") ? line.slice(2).trim() : line;
    if (isHttpUrl(normalized)) {
      const type = guessType(normalized);
      if (type === "video" && !isLikelyVideoUrl(normalized)) continue;
      if (type === "channel" && !isLikelyChannelUrl(normalized)) continue;
      entries.push({ type, url: normalized, latest: fallbackLatest });
      continue;
    }

    const match = normalized.match(/^(video|channel|subscription)\s*:\s*(https?:\/\/\S+)(?:\s*\|\s*latest\s*=\s*(\d+))?$/i);
    if (!match) continue;
    const type = match[1].toLowerCase();
    const url = match[2];
    const latest = type === "subscription" ? 1 : Number(match[3] || fallbackLatest);

    if (!isHttpUrl(url)) continue;
    if (type === "video" && !isLikelyVideoUrl(url)) continue;
    if ((type === "channel" || type === "subscription") && !isLikelyChannelUrl(url)) continue;

    entries.push({ type, url, latest });
  }

  return entries;
}

function guessType(url) {
  if (isLikelyVideoUrl(url)) return "video";
  return "channel";
}

function loadArchive() {
  if (!fs.existsSync(ARCHIVE_FILE)) return {};
  return JSON.parse(fs.readFileSync(ARCHIVE_FILE, "utf8"));
}

function saveArchive(archive) {
  fs.mkdirSync(path.dirname(ARCHIVE_FILE), { recursive: true });
  fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2), "utf8");
}

function channelVideos(url, latest, ytDlpBin) {
  const channelVideosUrl = url.includes("/videos") ? url : `${url.replace(/\/+$/, "")}/videos`;
  const output = run(ytDlpBin, [
    "--flat-playlist",
    "--playlist-items",
    `1-${latest}`,
    "--extractor-args",
    "youtube:tab=videos",
    "--print",
    "%(id)s",
    channelVideosUrl
  ]);
  return output
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((id) => `https://www.youtube.com/watch?v=${id}`);
}

function subscriptionLatestVideo(url, ytDlpBin) {
  return channelVideos(url, 1, ytDlpBin).slice(0, 1);
}

function getMetadata(url, ytDlpBin) {
  const json = run(ytDlpBin, ["-J", "--no-warnings", url]);
  const data = JSON.parse(json);
  return {
    id: data.id,
    title: data.title,
    description: (data.description || "").slice(0, 4000),
    duration: Number(data.duration || 1),
    publishDate: data.release_timestamp
      ? new Date(data.release_timestamp * 1000).toISOString()
      : new Date().toISOString(),
    thumbnailUrl: data.thumbnail || (data.id ? `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg` : null),
    webpageUrl: data.webpage_url || url
  };
}

function isShortLike(metadata, minDuration) {
  const link = String(metadata.webpageUrl || "").toLowerCase();
  if (link.includes("/shorts/") || link.includes("/reel/")) return true;
  return Number(metadata.duration || 0) < Number(minDuration || 0);
}

function sanitizeFilename(value) {
  return String(value)
    .replaceAll(/[^a-zA-Z0-9-_\.]/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 80);
}

function downloadMp3(url, id, ytDlpBin, ffmpegBin, ffprobeBin) {
  const dir = path.join(ROOT, "tmp", "youtube-import");
  fs.mkdirSync(dir, { recursive: true });
  const tpl = path.join(dir, `${id}.%(ext)s`);
  const ffmpegDir = path.dirname(ffmpegBin);
  const envPath = `${ffmpegDir}:${path.dirname(ffprobeBin)}:${process.env.PATH || ""}`;
  run(ytDlpBin, ["-x", "--audio-format", "mp3", "--ffmpeg-location", ffmpegBin, "-o", tpl, url], {
    stdio: "inherit",
    env: { ...process.env, PATH: envPath }
  });
  return path.join(dir, `${id}.mp3`);
}

async function requestJson(url, method, payload) {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = { error: ["invalid json response"] };
  }

  if (!res.ok) {
    const err = new Error(`${method} ${url} fallo: ${JSON.stringify(data)}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

async function uploadAudio(baseUrl, episodeId, filePath, filename) {
  const audio = fs.readFileSync(filePath);
  const url = `${baseUrl}/api/episodes/${episodeId}/audio?filename=${encodeURIComponent(filename)}`;
  const res = await fetch(url, { method: "POST", body: audio, headers: { "content-type": "audio/mpeg" } });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = { error: ["invalid json response"] };
  }
  if (!res.ok) {
    const err = new Error(`POST ${url} fallo: ${JSON.stringify(data)}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableHttpStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function withRetries(label, operation, maxAttempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = Number(error?.status || 0);
      const retryable = !status || isRetryableHttpStatus(status);
      if (!retryable || attempt >= maxAttempts) break;
      const delayMs = 300 * 2 ** (attempt - 1);
      console.warn(`  reintento ${attempt}/${maxAttempts - 1} en ${label} (${delayMs}ms): ${error.message}`);
      await sleep(delayMs);
    }
  }
  throw lastError;
}

async function fetchExistingTitles(baseUrl) {
  const episodes = await requestJson(`${baseUrl}/api/episodes`, "GET");
  const titles = new Set();
  for (const episode of episodes.data || []) {
    if (episode.title) titles.add(String(episode.title).trim().toLowerCase());
  }
  return titles;
}

async function publishVideo(baseUrl, status, videoUrl, archive, knownTitles, minDuration, ytDlpBin, ffmpegBin, ffprobeBin) {
  const metadata = getMetadata(videoUrl, ytDlpBin);
  const normalizedTitle = String(metadata.title || "").trim().toLowerCase();
  if (archive[metadata.id]) {
    console.log(`- Saltado ${metadata.title} (${metadata.id}) [ya importado]`);
    return false;
  }
  if (knownTitles.has(normalizedTitle)) {
    console.log(`- Saltado ${metadata.title} (${metadata.id}) [titulo duplicado]`);
    archive[metadata.id] = { skippedAt: new Date().toISOString(), reason: "duplicate-title", sourceUrl: videoUrl };
    return false;
  }
  if (isShortLike(metadata, minDuration)) {
    console.log(`- Saltado ${metadata.title} (${metadata.id}) [short/reel o duracion < ${minDuration}s]`);
    archive[metadata.id] = { skippedAt: new Date().toISOString(), reason: "short-like", sourceUrl: videoUrl };
    return false;
  }

  console.log(`- Importando ${metadata.title}`);
  let episodeId = null;
  try {
    const created = await withRetries("crear episodio", () =>
      requestJson(`${baseUrl}/api/episodes`, "POST", {
        title: metadata.title,
        description: metadata.description || `Importado desde YouTube: ${videoUrl}`,
        duration: metadata.duration,
        publishDate: metadata.publishDate,
        status: "draft",
        thumbnailUrl: metadata.thumbnailUrl
      })
    );

    episodeId = created.data.id;
    const mp3Path = downloadMp3(videoUrl, metadata.id, ytDlpBin, ffmpegBin, ffprobeBin);
    const filename = `${sanitizeFilename(metadata.title || metadata.id)}.mp3`;
    const uploadResult = await withRetries("subir audio", () => uploadAudio(baseUrl, episodeId, mp3Path, filename));
    const uploadedAudioUrl = uploadResult?.data?.audioUrl;
    if (!uploadedAudioUrl) {
      throw new Error(`audioUrl ausente tras subida para episodio ${episodeId}`);
    }

    const targetStatus = status || "published";
    if (targetStatus !== "draft") {
      await withRetries("publicar episodio", () =>
        requestJson(`${baseUrl}/api/episodes/${episodeId}`, "PUT", { status: targetStatus })
      );
    }

    knownTitles.add(normalizedTitle);
    archive[metadata.id] = { episodeId, importedAt: new Date().toISOString(), sourceUrl: videoUrl };
    return true;
  } catch (error) {
    if (episodeId) {
      try {
        await withRetries("rollback borrar episodio", () => requestJson(`${baseUrl}/api/episodes/${episodeId}`, "DELETE"));
      } catch (rollbackError) {
        console.error(`x Rollback fallido para ${episodeId}: ${rollbackError.message}`);
      }
    }
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const ytDlpBin = resolveTool("yt-dlp");
  const ffmpegBin = resolveTool("ffmpeg");
  const ffprobeBin = resolveTool("ffprobe");
  console.log(`Dependencias detectadas: yt-dlp=${ytDlpBin}, ffmpeg=${ffmpegBin}, ffprobe=${ffprobeBin}`);

  if (!fs.existsSync(args.file)) {
    throw new Error(`No existe el archivo de fuentes: ${args.file}`);
  }

  const text = fs.readFileSync(args.file, "utf8");
  const entries = parseSources(text, args.latest);
  if (!entries.length) {
    console.log("No hay entradas validas en el markdown.");
    return;
  }

  const archive = loadArchive();
  const knownTitles = await fetchExistingTitles(args.baseUrl);
  let imported = 0;

  for (const entry of entries) {
    const urls =
      entry.type === "channel"
        ? channelVideos(entry.url, entry.latest, ytDlpBin)
        : entry.type === "subscription"
          ? subscriptionLatestVideo(entry.url, ytDlpBin)
          : [entry.url];
    for (const url of urls) {
      try {
        const ok = await publishVideo(
          args.baseUrl,
          args.status,
          url,
          archive,
          knownTitles,
          args.minDuration,
          ytDlpBin,
          ffmpegBin,
          ffprobeBin
        );
        if (ok) imported += 1;
      } catch (error) {
        console.error(`x Error con ${url}: ${error.message}`);
      }
    }
  }

  saveArchive(archive);
  console.log(`Importacion terminada. Nuevos episodios: ${imported}`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

export { parseSources };
