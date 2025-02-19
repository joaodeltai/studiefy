import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita otimizações de imagem
  images: {
    domains: ['localhost'],
  },
  // Otimizações de produção
  compress: true,
  // Otimizações de performance
  reactStrictMode: true,
  poweredByHeader: false,
  // Desabilitar verificações do ESLint durante o build
  eslint: {
    // Não tratar warnings como erros
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Não tratar erros de tipo como erros fatais
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
