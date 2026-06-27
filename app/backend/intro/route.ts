import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const imdbId = searchParams.get("imdbId");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!imdbId || !season || !episode) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.introdb.app/segments?imdb_id=${imdbId}&season=${season}&episode=${episode}&segment_type=intro`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://introdb.app",
          Origin: "https://introdb.app",
        },
      },
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch segments" },
      { status: 500 },
    );
  }
}
