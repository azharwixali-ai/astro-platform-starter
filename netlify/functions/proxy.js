import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080";
  const path = event.path.replace("/.netlify/functions/proxy", ""); 
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl);

    // Playlist (.m3u8)
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Absolute TS links → proxy ke through
      body = body.replace(/(https?:\/\/[^ \n]+\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${match.replace(base, "")}`;
      });

      // Relative TS links → clean join
      body = body.replace(/([^\s]+\.ts)/g, (match) => {
        const prefix = path.substring(0, path.lastIndexOf("/"));
        return `/.netlify/functions/proxy${prefix}/${match}`.replace(/\/+/g, "/"); // 👈 double slash fix
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
    const buffer = await response.buffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
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
