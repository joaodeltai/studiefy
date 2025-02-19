import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita otimizações de imagem
  images: {
    domains: ['localhost'],
    // Adicione outros domínios conforme necessário
  },
  // Otimizações de produção
  compress: true,
  // Otimizações de performance
  reactStrictMode: true,
  poweredByHeader: false
};

export default nextConfig;
