/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Permite compilar en otra carpeta (ej. verificar un build sin detener `next dev`).
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
