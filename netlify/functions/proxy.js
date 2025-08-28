import fetch from "node-fetch";

export async function handler(event) {
  const base = "http://xtv.ooo:8080";
  const path = event.path.replace("/.netlify/functions/proxy", "");
  const targetUrl = `${base}${path || "/live/938437191/952117166/167569.m3u8"}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "VLC/3.0.16 LibVLC/3.0.16",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Referer": base,
        "Origin": base,
        // agar server cookies use karta hai to yahan add karna hoga
        "Cookie": event.headers["cookie"] || "",
      }
    });

    if (targetUrl.endsWith(".m3u8")) {
      let body = await response.text();

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

    // .ts segment handling
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
