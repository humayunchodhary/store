/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    // On Vercel, vercel.json sends /api to the FastAPI service. This proxy is only for local `next dev`.
    if (process.env.VERCEL) return [];
    return [{ source: "/api/:path*", destination: "http://127.0.0.1:8000/api/:path*" }];
  },
};

export default nextConfig;
