import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam)
    return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const decodedUrl = decodeURIComponent(urlParam);

  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    Referer: "https://netfilm.world/",
    Origin: "https://netfilm.world",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.7",
    "Accept-Encoding": "identity;q=1, *;q=0",
  };

  const clientRange = req.headers.get("Range");
  if (clientRange) headers["Range"] = clientRange;

  const upstream = await fetch(decodedUrl, {
    method: req.method === "HEAD" ? "HEAD" : "GET",
    headers,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse(`Upstream failed: ${upstream.status}`, {
      status: upstream.status,
    });
  }

  const newHeaders = new Headers(upstream.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Accept-Ranges", "bytes");
  newHeaders.set(
    "Content-Type",
    upstream.headers.get("content-type") || "video/mp4",
  );

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: newHeaders,
  });
}
