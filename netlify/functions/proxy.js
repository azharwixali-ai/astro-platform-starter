import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080";
  const path = event.path.replace("/.netlify/functions/proxy", "");
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // 👇 Forward range requests
        "Range": event.headers["range"] || "",
        "User-Agent": event.headers["user-agent"] || "Mozilla/5.0",
        "Referer": base,
        "Origin": base,
      }
    });

    // Playlist
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Rewrite .ts links
      body = body.replace(/(https?:\/\/[^ \n]+\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${match.replace(base, "")}`;
      });

      body = body.replace(/([^\s]+\.ts)/g, (match) => {
        const prefix = path.substring(0, path.lastIndexOf("/"));
        return `/.netlify/functions/proxy${prefix}/${match}`.replace(/\/+/g, "/");
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

    // Segments (.ts) → stream as binary (NO base64)
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
      isBase64Encoded: true,  // ✅ Netlify needs this for binary
    };

  } catch (err) {
    return {
      statusCode: 502,
      body: "Proxy error: " + err.message,
    };
  }
}
