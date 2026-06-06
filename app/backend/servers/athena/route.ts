import { fetchWithTimeout } from "@/lib/fetch-timeout";
import { NextRequest, NextResponse } from "next/server";
import { validateBackendToken } from "@/lib/validate-token";
import { isValidReferer } from "@/lib/allowed-referers";
import { FIELD_MAP } from "@/lib/token";

const SCREENIFY = "https://www.screenify.fun";

async function fetchSrc(
  imdbId: string,
  media_type: string,
  season: string | null,
  episode: string | null,
): Promise<string | null> {
  const watchPage =
    media_type === "tv"
      ? `${SCREENIFY}/watch-series/${imdbId}`
      : `${SCREENIFY}/watch-movies/${imdbId}`;

  const page = await fetchWithTimeout(
    watchPage,
    {
      headers: {
        Referer: `${SCREENIFY}/`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
      cache: "no-store",
    },
    12000,
  );

  if (!page.ok) return null;

  const html = await page.text();
  const match = html.match(/var initialSrc='([^']+)'/);
  if (!match) return null;

  let srcPath = match[1];

  if (media_type === "tv" && season && episode) {
    srcPath = srcPath.replace(
      /\/(\d+)\/(\d+)\/playlist\.m3u8$/,
      `/${season}/${episode}/playlist.m3u8`,
    );
  }

  return srcPath;
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get(FIELD_MAP.id);
    const media_type = req.nextUrl.searchParams.get("b");
    const season = req.nextUrl.searchParams.get(FIELD_MAP.season);
    const episode = req.nextUrl.searchParams.get(FIELD_MAP.episode);
    const imdbId = req.nextUrl.searchParams.get(FIELD_MAP.imdbId);
    const ts = Number(req.nextUrl.searchParams.get(FIELD_MAP.ts));
    const token = req.nextUrl.searchParams.get(FIELD_MAP.token)!;
    const f_token = req.nextUrl.searchParams.get(FIELD_MAP.fToken)!;

    if (!id || !media_type || !ts || !token) {
      return NextResponse.json(
        { success: false, error: "need token" },
        { status: 404 },
      );
    }

    if (Date.now() - Number(ts) > 8000) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );
    }

    if (!validateBackendToken(id, f_token, ts, token)) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );
    }

    const referer = req.headers.get("referer") || "";
    if (!isValidReferer(referer)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    let srcPath: string | null = null;

    try {
      srcPath = await fetchSrc(imdbId!, media_type, season, episode);

      if (!srcPath) {
        const mxId = imdbId!.replace(/^tt/, "mx");
        srcPath = await fetchSrc(mxId, media_type, season, episode);
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Timed out" },
        { status: 504 },
      );
    }

    if (!srcPath) {
      return NextResponse.json(
        { success: false, error: "Source not found" },
        { status: 502 },
      );
    }

    const upstreamPath = new URL(`${SCREENIFY}${srcPath}`).pathname;

    return NextResponse.json({
      success: true,
      links: [
        {
          type: "hls",
          link: `https://daedalus.zxcprime371.workers.dev${upstreamPath}`,
        },
      ],
      subtitles: [],
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
