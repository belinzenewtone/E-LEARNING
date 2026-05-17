import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  // Block clickjacking — no iframing this app
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin on same-origin requests; strip on cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // HSTS: force HTTPS for 1 year
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs unsafe-inline for styles; Tailwind injects inline
      "style-src 'self' 'unsafe-inline'",
      // Next.js runtime requires unsafe-eval; remove in a future hardening pass
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Allow images from self, data URIs, and GitHub/Google avatars
      "img-src 'self' data: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
      // Fonts served locally (next/font bundles them)
      "font-src 'self'",
      // API calls only to self
      "connect-src 'self'",
      // No plugins
      "object-src 'none'",
      // No embedding other sites
      "frame-src 'none'",
      // Block mixed content
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
