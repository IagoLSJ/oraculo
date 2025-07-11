// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuração para otimização de imagens externas
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Use 'https' para produção
        hostname: 'localhost', // O hostname do seu backend Flask (em dev)
        port: '5000', // A porta do seu backend Flask (em dev)
        pathname: '/images/**', // CORRIGIDO: deve ser '/images/**' conforme o endpoint Flask
      },
      // Para produção, adicione também:
      // {
      //   protocol: 'https',
      //   hostname: 'your-production-domain.com',
      //   pathname: '/images/**',
      // },
    ],
  },
  // Outras configurações do Next.js podem vir aqui
  // Por exemplo:
  // experimental: {
  //   serverActions: true,
  // },
  // compiler: {
  //   styledComponents: true,
  // },
};

export default nextConfig;