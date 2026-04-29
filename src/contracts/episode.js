export const EPISODE_STATUSES = ["draft", "published", "archived"];

export const REQUIRED_FIELDS = [
  "title",
  "description",
  "duration",
  "publishDate",
  "status"
];

export function normalizeEpisode(episode) {
  return {
    id: String(episode.id),
    title: String(episode.title),
    description: String(episode.description),
    duration: Number(episode.duration),
    publishDate: String(episode.publishDate),
    audioUrl: episode.audioUrl ? String(episode.audioUrl) : null,
    thumbnailUrl: episode.thumbnailUrl ? String(episode.thumbnailUrl) : null,
    status: String(episode.status)
  };
}

export function validateEpisodePayload(payload, partial = false) {
  const errors = [];

  if (!partial) {
    for (const field of REQUIRED_FIELDS) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        errors.push(`${field} is required`);
      }
    }
  }

  if (payload.title !== undefined && String(payload.title).trim().length === 0) {
    errors.push("title must not be empty");
  }

  if (payload.description !== undefined && String(payload.description).trim().length === 0) {
    errors.push("description must not be empty");
  }

  if (payload.duration !== undefined) {
    const value = Number(payload.duration);
    if (!Number.isFinite(value) || value <= 0) {
      errors.push("duration must be a positive number");
    }
  }

  if (payload.publishDate !== undefined) {
    const date = new Date(payload.publishDate);
    if (Number.isNaN(date.getTime())) {
      errors.push("publishDate must be a valid date");
    }
  }

  if (payload.status !== undefined && !EPISODE_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${EPISODE_STATUSES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}
