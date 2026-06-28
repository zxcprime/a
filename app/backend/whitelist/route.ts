// app/api/whitelist/route.ts
export const revalidate = 0;

export async function GET() {
  const domains = [
    { origin: "https://zxcstream.xyz", referer: "https://zxcstream.xyz/" },
    {
      origin: "localhost:3000",
      referer: "localhost:3000/",
    },
  ];

  return Response.json(domains);
}
