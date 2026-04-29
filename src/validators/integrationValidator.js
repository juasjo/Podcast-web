import assert from "node:assert/strict";

const port = 3101;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  process.env.DISABLE_AUTO_LISTEN = "1";
  const { server } = await import("../server.js");
  await new Promise((resolve) => server.listen(port, resolve));
  await sleep(100);

  const createRes = await fetch(`http://localhost:${port}/api/episodes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "E2E Episode",
      description: "Integración",
      duration: 180,
      publishDate: "2026-04-28T00:00:00.000Z",
      status: "draft"
    })
  });
  assert.equal(createRes.status, 201, "create episode failed");
  const created = await createRes.json();
  const id = created.data.id;

  const audioRes = await fetch(`http://localhost:${port}/api/episodes/${id}/audio?filename=test.mp3`, {
    method: "POST",
    headers: { "content-type": "audio/mpeg" },
    body: Buffer.from("fake-audio")
  });
  assert.equal(audioRes.status, 200, "audio upload failed");

  const publishRes = await fetch(`http://localhost:${port}/api/episodes/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "published" })
  });
  assert.equal(publishRes.status, 200, "publish failed");

  const webRes = await fetch(`http://localhost:${port}/`);
  const webHtml = await webRes.text();
  assert.ok(webHtml.includes("E2E Episode"), "episode missing in web list");

  const feedRes = await fetch(`http://localhost:${port}/feed.xml`);
  const xml = await feedRes.text();
  assert.ok(xml.includes("E2E Episode"), "episode missing in RSS");
  assert.ok(xml.includes("<enclosure"), "RSS enclosure missing");

  server.close();
  console.log("integrationValidator: ok");
}

run().catch((err) => {
  server.close();
  console.error(err);
  process.exit(1);
});
