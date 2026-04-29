import crypto from "node:crypto";
import { listEpisodes, saveEpisodes } from "./repository.js";
import { normalizeEpisode, validateEpisodePayload } from "../contracts/episode.js";

export function getEpisodes() {
  return listEpisodes().map(normalizeEpisode);
}

export function getEpisodeById(id) {
  const found = listEpisodes().find((e) => String(e.id) === String(id));
  return found ? normalizeEpisode(found) : null;
}

export function createEpisode(payload) {
  const validation = validateEpisodePayload(payload, false);
  if (!validation.valid) return { error: validation.errors };

  if (payload.status === "published" && !payload.audioUrl) {
    return { error: ["audioUrl is required when status is published"] };
  }

  const episodes = listEpisodes();
  const created = normalizeEpisode({
    id: crypto.randomUUID(),
    ...payload,
    audioUrl: payload.audioUrl || null
  });
  episodes.push(created);
  saveEpisodes(episodes);
  return { data: created };
}

export function updateEpisode(id, payload) {
  const validation = validateEpisodePayload(payload, true);
  if (!validation.valid) return { error: validation.errors };

  const episodes = listEpisodes();
  const idx = episodes.findIndex((e) => String(e.id) === String(id));
  if (idx < 0) return { error: ["episode not found"], status: 404 };

  const nextEpisode = normalizeEpisode({ ...episodes[idx], ...payload });
  if (nextEpisode.status === "published" && !nextEpisode.audioUrl) {
    return { error: ["cannot publish episode without audioUrl"] };
  }

  episodes[idx] = nextEpisode;
  saveEpisodes(episodes);
  return { data: episodes[idx] };
}

export function deleteEpisode(id) {
  const episodes = listEpisodes();
  const filtered = episodes.filter((e) => String(e.id) !== String(id));
  if (filtered.length === episodes.length) return { error: ["episode not found"], status: 404 };
  saveEpisodes(filtered);
  return { data: { id: String(id), deleted: true } };
}
