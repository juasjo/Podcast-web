import fs from "node:fs";
import path from "node:path";

const AUDIO_DIR = path.resolve(process.cwd(), "public", "audio");

function ensureDir() {
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export function saveAudioForEpisode(episodeId, originalName, binaryData) {
  ensureDir();
  const ext = path.extname(originalName).toLowerCase();
  const stableName = `${episodeId}${ext}`;
  const absolutePath = path.join(AUDIO_DIR, stableName);
  fs.writeFileSync(absolutePath, binaryData);
  return `/audio/${stableName}`;
}
