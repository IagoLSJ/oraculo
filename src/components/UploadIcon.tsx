import React from 'react';

// Definindo a interface para as props do componente UploadIcon
interface UploadIconProps {
  className?: string; // Para permitir classes adicionais do Tailwind ou outras para estilização
}

const UploadIcon: React.FC<UploadIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 ${className || ''}`} // Classes padrão e classes passadas via prop
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L6.293 6.707a1 1 0 01-1.414-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default UploadIcon;