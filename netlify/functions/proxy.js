import fetch from "node-fetch";

export async function handler(event) {
  const targetUrl = "http://xtv.ooo:8080/live/938437191/952117166/167569.m3u8";

  try {
    const response = await fetch(targetUrl);
    const body = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Proxy error: " + err.message,
    };
  }
}

