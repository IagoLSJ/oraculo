// src/components/Header.tsx (ou components/Header.tsx)
import Link from 'next/link';
import React from 'react';

// Se este componente precisar de qualquer tipo de interatividade do cliente (ex: useState, useEffect, onClick),
// você precisaria adicionar: "use client"; no topo do arquivo.
// Para um simples cabeçalho com links, ele pode ser um Server Component.

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-sm py-4 px-8 border-b border-gray-200">
      <nav className="flex justify-start items-center space-x-6">
        {/* CORREÇÃO AQUI: REMOVEMOS O <a> ANINHADO */}
        <Link href="/oraculo" className="text-gray-600 hover:text-gray-900 cursor-pointer text-sm">
          Início
        </Link>
        <Link href="oraculo/analises-graficos" className="text-gray-600 hover:text-gray-900 cursor-pointer text-sm">
          Análises
        </Link>
        <Link href="/oraculo" className="font-semibold text-indigo-700 cursor-pointer text-sm">
          Oráculo
        </Link>
      </nav>
    </header>
  );
};

export default Header;