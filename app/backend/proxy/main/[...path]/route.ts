import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "www.screenify.fun";
const PROXY_PATH = "/backend/proxy/main";

export async function GET(req: NextRequest) {
  // Reconstruct upstream URL from the path after /backend/proxy/main
  const upstreamPath = req.nextUrl.pathname.replace("/backend/proxy/main", "");
  const url = `https://${ALLOWED_HOST}${upstreamPath}`;

  const upstream = await fetch(url, {
    headers: {
      Referer: "https://www.screenify.fun/",
      Origin: "https://www.screenify.fun/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      Accept: "*/*",
    },
    cache: "no-store",
  });

  if (!upstream.ok) return new NextResponse("Bad gateway", { status: 502 });

  const contentType = upstream.headers.get("Content-Type") || "";
  const isM3u8 = url.includes(".m3u8") || contentType.includes("mpegurl");

  if (isM3u8) {
    const text = await upstream.text();
    const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);

    const rewritten = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // Rewrite URI="..." in #EXT-X-MEDIA lines (audio, subtitles)
        if (trimmed.startsWith("#") && trimmed.includes('URI="')) {
          return trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
            const abs = uri.startsWith("http") ? uri : baseUrl + uri;
            const path = new URL(abs).pathname;
            return `URI="${PROXY_PATH}${path}"`;
          });
        }

        if (trimmed.startsWith("#")) return line;

        // Bare URL lines (variant playlists + segments)
        const abs = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
        const path = new URL(abs).pathname;
        return `${PROXY_PATH}${path}`;
      })
      .join("\n");

    return new NextResponse(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Binary segment (.ts)
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType || "video/mp2t",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
