import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080";
  const path = event.path.replace("/.netlify/functions/proxy", "");
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Forward common headers like VLC does
        "User-Agent": "VLC/3.0.16 LibVLC/3.0.16",
        "Accept": "*/*",
        "Referer": base,
        "Origin": base,
      },
    });

    // Playlist (.m3u8)
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Rewrite segment URLs
      body = body.replace(/(https?:\/\/[^ \n]+\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${match.replace(base, "")}`;
      });

      body = body.replace(/([^\s]+\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${path.substring(0, path.lastIndexOf("/"))}/${match}`;
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

    // Segment (.ts)
    const buffer = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Proxy error: " + err.message,
    };
  }
}
