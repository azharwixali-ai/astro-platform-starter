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

    // ✅ Agar playlist (.m3u8) hai
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Absolute .ts links
      body = body.replace(/(https?:\/\/[^\s]+\.ts)/g, (match) => {
        try {
          const url = new URL(match);
          return `/.netlify/functions/proxy${url.pathname}`;
        } catch (e) {
          return match; // fallback
        }
      });

      // Relative .ts links
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

    // ✅ Agar segment (.ts) hai
    // Agar segment (.ts) hai
if (targetUrl.endsWith(".ts")) {
  const segResponse = await fetch(targetUrl, {
    redirect: "follow",
    headers: {
      "User-Agent": "VLC/3.0.21 LibVLC/3.0.21",
      "Accept": "*/*",
      "Accept-Language": "en_US",
      "Cache-Control": "no-cache",
      "Range": event.headers["range"] || "bytes=0-"
    }
  });

  const buffer = await segResponse.buffer();

  return {
    statusCode: segResponse.status,
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

}
