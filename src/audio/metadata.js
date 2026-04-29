import path from "node:path";

const SUPPORTED_EXTENSIONS = [".mp3", ".m4a", ".wav", ".ogg"];

export function isSupportedAudio(filename) {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filename).toLowerCase());
}

export function normalizeAudioMetadata(input) {
  return {
    mimeType: input.mimeType || "audio/mpeg",
    bitrateKbps: Number(input.bitrateKbps || 128),
    channels: Number(input.channels || 2),
    sampleRateHz: Number(input.sampleRateHz || 44100)
  };
}
