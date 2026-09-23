import type { NextConfig } from "next";

// Proxy API calls through the Next.js server so the browser only ever makes
// same-origin requests (no CORS, works behind any preview proxy). The rewrite
// runs on the Next server, which can reach the FastAPI backend on localhost.
// Note: port 8000 is used by another local project (CodeGraph). We default to
// 8001 so `npm run dev` works without needing an env var. Override with
// BACKEND_URL if your backend lives elsewhere.
const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
