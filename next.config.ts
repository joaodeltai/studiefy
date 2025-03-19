/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilita otimizações de imagem
  images: {
    domains: ['localhost', 'uwemjaqphbytkkhalqge.supabase.co', 'studiefy.pro'],
  },
  // Desabilitar verificações do ESLint durante o build
  eslint: {
    // Não tratar warnings como erros
    ignoreDuringBuilds: true,
  },
  // Não tratar erros de tipo como erros fatais
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
