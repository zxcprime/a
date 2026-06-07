"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";

export default function DevToolGuard() {
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug");

  // skip devtool blocker if ?debug=false
  if (debug === "false") return null;

  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/disable-devtool@latest"
      strategy="afterInteractive"
      disable-devtool-auto=""
    />
  );
}
