import React from 'react';
import Image from 'next/image';

interface FeatureBlockProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  reverse?: boolean; // Prop opcional para inverter a ordem (imagem à direita)
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({ imageSrc, imageAlt, title, description, reverse = false }) => {
  return (
    <div className={` flex flex-col md:flex-row items-center p-8 gap-8 mb-8 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      {/* Imagem */}
      <div className="w-full md:w-1/2 relative h-64 md:h-80 flex-shrink-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          layout="fill"
          objectFit="contain" // Ou 'cover' dependendo de como você quer que a imagem se comporte
          className="rounded-md"
        />
      </div>

      {/* Conteúdo de Texto */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed text-base">{description}</p>
      </div>
    </div>
  );
};

export default FeatureBlock;