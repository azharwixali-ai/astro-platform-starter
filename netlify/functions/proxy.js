import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080";
  const path = event.path.replace("/.netlify/functions/proxy", "");
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl, {
      redirect: "follow",  // 👈 important
      headers: {
        "User-Agent": "VLC/3.0.21 LibVLC/3.0.21",
        "Accept": "*/*",
        "Accept-Language": "en_US",
        "Cache-Control": "no-cache",
      }
    });

    // Playlist (.m3u8)
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Get final URL after redirects
      const finalUrl = response.url.replace(/\/[^/]+$/, "");

      // Rewrite .ts links to proxy
      body = body.replace(/(https?:\/\/[^ \n]+\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${match.replace(/^https?:\/\/[^/]+/, "")}`;
      });

      body = body.replace(/([^\s]+\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${finalUrl.replace(/^https?:\/\/[^/]+/, "")}/${match}`.replace(/\/+/g, "/");
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

  } catch (err) {
    return {
      statusCode: 502,
      body: "Proxy error: " + err.message,
    };
  }
}
