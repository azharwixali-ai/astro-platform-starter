import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080";
  const path = event.path.replace("/.netlify/functions/proxy", "");
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "VLC/3.0.21 LibVLC/3.0.21",
        "Accept": "*/*",
        "Accept-Language": "en_US",
        "Cache-Control": "no-cache",
        "Range": event.headers["range"] || "",
      },
    });

    // Playlist (.m3u8)
    if (targetUrl.endsWith(".m3u8")) {
  let body = await response.text();

  // Absolute .ts links (http://....ts)
  body = body.replace(/(https?:\/\/[^\s]+\.ts)/g, (match) => {
    try {
      const url = new URL(match);
      return `/.netlify/functions/proxy${url.pathname}`;
    } catch (e) {
      return match; // fallback
    }
  });

  // Relative .ts links (167569_123.ts)
  body = body.replace(/(^|\n)([^ \n]+\.ts)/g, (full, p1, p2) => {
    const prefix = path.substring(0, path.lastIndexOf("/"));
    return `${p1}/.netlify/functions/proxy${prefix}/${p2}`.replace(/\/+/g, "/");
  });

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
    },
    body,
  };
}

    // Segments (.ts)
const response = await fetch(targetUrl, {
  headers: {
    "User-Agent": "VLC/3.0.21 LibVLC/3.0.21",
    "Accept": "*/*",
    "Accept-Language": "en_US",
    "Accept-Encoding": "deflate, gzip",
    "Cache-Control": "no-cache",
    "Range": event.headers["range"] || ""
  }
});
const buffer = await response.buffer();

return {
  statusCode: response.status,
  headers: {
    "Content-Type": "video/mp2t",
    "Content-Length": buffer.length,
    "Accept-Ranges": "bytes",
    "Access-Control-Allow-Origin": "*",
  },
  body: buffer.toString("base64"),
  isBase64Encoded: true,
};

}
