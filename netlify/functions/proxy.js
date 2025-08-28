import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080"; // 👈 your original IPTV server
  const path = event.path.replace("/.netlify/functions/proxy", ""); // remove proxy prefix
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl);

    // If request is for m3u8 playlist
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Rewrite all .ts links (absolute + relative)
      body = body.replace(/(https?:\/\/[^ \n]+\.ts)/g, (match) => {
        // absolute URLs
        return `/.netlify/functions/proxy${match.replace(base, "")}`;
      });

      body = body.replace(/([^\s]+\.ts)/g, (match) => {
        // relative paths
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

    // If request is for TS segment
    const buffer = await response.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "video/mp2t",
        "Access-Control-Allow-Origin": "*",
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
