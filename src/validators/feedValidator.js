import assert from "node:assert/strict";
import { generatePodcastRss } from "../rss/generator.js";

const sampleEpisodes = [
  {
    id: "1",
    title: "Publicado",
    description: "Desc",
    duration: 120,
    publishDate: "2026-04-28T00:00:00.000Z",
    audioUrl: "/audio/1.mp3",
    status: "published"
  },
  {
    id: "2",
    title: "Draft",
    description: "Desc",
    duration: 120,
    publishDate: "2026-04-28T00:00:00.000Z",
    audioUrl: "/audio/2.mp3",
    status: "draft"
  },
  {
    id: "3",
    title: "Publicado sin audio",
    description: "Desc",
    duration: 120,
    publishDate: "2026-04-28T00:00:00.000Z",
    audioUrl: null,
    status: "published"
  }
];

const xml = generatePodcastRss(sampleEpisodes);
assert.ok(xml.includes("<rss version=\"2.0\""), "RSS 2.0 root missing");
assert.ok(xml.includes("xmlns:itunes="), "iTunes namespace missing");
assert.ok(xml.includes("<item>"), "Published episode not included");
assert.ok(!xml.includes("<guid>2</guid>"), "Draft episode should not be included");
assert.ok(!xml.includes("<guid>3</guid>"), "Published episode without audio should not be included");
assert.ok(xml.includes("<enclosure"), "enclosure is required");
console.log("feedValidator: ok");
