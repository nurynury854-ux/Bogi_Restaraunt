import type { NextConfig } from "next";

// Baseline security headers applied to every response. These blunt whole
// classes of client-side attacks (clickjacking, MIME-sniffing, referrer
// leakage) and force HTTPS. A full Content-Security-Policy is intentionally
// left out for now — it needs per-app tuning against Next's inline scripts and
// framer-motion, and a wrong CSP silently breaks the page.
const securityHeaders = [
  // Stop the browser from guessing a response's content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow the site being framed elsewhere (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't leak full URLs (which can carry slugs/ids) to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop powerful browser features this app never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for two years (Vercel serves over TLS). Safe to preload.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
