import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita otimizações de imagem
  images: {
    domains: ['localhost'],
    // Adicione outros domínios conforme necessário
  },
  // Otimizações de produção
  swcMinify: true,
  // Compressão de assets
  compress: true,
  // Otimizações de performance
  reactStrictMode: true,
  poweredByHeader: false,
  // Cache de build
  experimental: {
    turbotrace: {
      logLevel: "error"
    }
  }
};

export default nextConfig;
