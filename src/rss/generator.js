function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function generatePodcastRss(episodes, baseUrl = "http://localhost:3000") {
  const published = episodes.filter((e) => e.status === "published" && e.audioUrl);
  const items = published
    .map(
      (e) => `<item>
  <title>${xmlEscape(e.title)}</title>
  <description>${xmlEscape(e.description)}</description>
  <guid>${xmlEscape(e.id)}</guid>
  <pubDate>${new Date(e.publishDate).toUTCString()}</pubDate>
  <itunes:duration>${Math.floor(Number(e.duration))}</itunes:duration>
  ${e.thumbnailUrl ? `<itunes:image href="${xmlEscape(e.thumbnailUrl)}" />` : ""}
  <enclosure url="${xmlEscape(`${baseUrl}${e.audioUrl || ""}`)}" type="audio/mpeg" />
</item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
<channel>
  <title>Podcast Web Platform</title>
  <link>${baseUrl}</link>
  <description>Feed oficial del podcast</description>
  ${items}
</channel>
</rss>`;
}
