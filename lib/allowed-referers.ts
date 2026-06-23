const ALLOWED_REFERERS = [
  "http://localhost:3000/",
  "https://zxcprime.site/",
  "https://www.zxcprime.site/",
  "https://zxcstream.xyz/",
  "https://v.zxcstream.xyz/",
  "https://z.zxcstream.xyz/",
  "https://embed.zxcstream.xyz/",
  "https://cdn.zxcstream.xyz/",
  "https://www.zxcstream.xyz/",
];

export const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://zxcprime.site",
  "https://www.zxcprime.site",
  "https://zxcstream.xyz",
  "https://www.zxcstream.xyz",
  "https://v.zxcstream.xyz",
  "https://z.zxcstream.xyz",
  "https://embed.zxcstream.xyz",
  "https://cdn.zxcstream.xyz",
];
export function isValidReferer(referer: string): boolean {
  return ALLOWED_REFERERS.some((allowed) => referer.includes(allowed));
}
