import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const EPISODES_FILE = path.join(DATA_DIR, "episodes.json");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(EPISODES_FILE)) fs.writeFileSync(EPISODES_FILE, "[]", "utf8");
}

export function listEpisodes() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(EPISODES_FILE, "utf8"));
}

export function saveEpisodes(episodes) {
  ensureStorage();
  fs.writeFileSync(EPISODES_FILE, JSON.stringify(episodes, null, 2), "utf8");
}
