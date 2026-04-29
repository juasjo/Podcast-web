import assert from "node:assert/strict";
import { renderEpisodeDetail, renderHome } from "../frontend/templates.js";

const home = renderHome([
  {
    id: "1",
    title: "Capítulo 1",
    description: "Descripción de prueba",
    status: "published"
  }
]);

assert.ok(home.includes("meta name=\"viewport\""), "viewport meta missing");
assert.ok(home.includes("@media (min-width: 768px)"), "responsive media query missing");
assert.ok(home.includes("Capítulo 1"), "episode title missing in list");

const detail = renderEpisodeDetail({
  id: "1",
  title: "Capítulo 1",
  description: "Descripción completa",
  duration: 60,
  publishDate: "2026-04-28",
  status: "published",
  audioUrl: "/audio/1.mp3"
});

assert.ok(detail.includes("<audio controls"), "audio player missing");
console.log("webValidator: ok");
