import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080"; // 👈 original server ka base
  const path = event.path.replace("/.netlify/functions/proxy", ""); // relative path nikal lo
  const targetUrl = `${base}${path || "/live/938437191/952117166/219689.m3u8"}`;

  try {
    const response = await fetch(targetUrl);

    // Agar request m3u8 file ka hai
    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

      // Rewrite all .ts segment links to go through our proxy
      body = body.replace(/(.*\.ts)/g, (match) => {
        return `/.netlify/functions/proxy${match}`;
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

    // Agar request TS segment ka hai
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
