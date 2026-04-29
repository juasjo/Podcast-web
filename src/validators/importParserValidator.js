import assert from "node:assert/strict";
import { parseSources } from "../../scripts/publish-youtube-from-md.js";

const markdown = `
subscription: https://www.youtube.com/@CanalUno
channel: https://www.youtube.com/@CanalDos | latest=4
video: https://www.youtube.com/watch?v=abc123
`;

const parsed = parseSources(markdown, 3);
const subscription = parsed.find((e) => e.type === "subscription");
const channel = parsed.find((e) => e.type === "channel");
const video = parsed.find((e) => e.type === "video");

assert.ok(subscription, "subscription entry should be parsed");
assert.equal(subscription.latest, 1, "subscription should force latest=1");
assert.ok(channel, "channel entry should be parsed");
assert.equal(channel.latest, 4, "channel should preserve latest override");
assert.ok(video, "video entry should be parsed");

const invalidMarkdown = `
subscription: not-a-url
subscription: https://example.com/random
video: https://www.youtube.com/@not-video
`;

const invalidParsed = parseSources(invalidMarkdown, 3);
assert.equal(invalidParsed.length, 0, "invalid source lines should be ignored");

console.log("importParserValidator: ok");
