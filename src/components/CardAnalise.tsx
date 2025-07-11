import React from 'react';
import Image from 'next/image'; // Componente Image do Next.js para otimização de imagens

interface CardAnaliseProps {
  imageSrc: string;      // Caminho para a imagem
  imageAlt: string;      // Texto alternativo para a imagem (acessibilidade)
  title: string;         // Título do card
  description: string;   // Descrição do card
}

const CardAnalise: React.FC<CardAnaliseProps> = ({ imageSrc, imageAlt, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-6 text-center transition-transform transform hover:scale-105 duration-300">
      <div className="w-full h-48 mb-4 relative"> {/* Altura fixa para as imagens */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          layout="fill" // Permite que a imagem preencha o container
          objectFit="contain" // Garante que a imagem se ajuste dentro do container sem cortar
          className="rounded-md"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default CardAnalise;