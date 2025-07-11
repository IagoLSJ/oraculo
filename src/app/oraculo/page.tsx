// src/app/page.tsx
"use client"; // Esta diretiva é FUNDAMENTAL para usar hooks de React e manipulação de DOM.

import React, { useRef, useState } from 'react'; // Importação única e correta de React hooks
import { useRouter } from 'next/navigation'; // Importamos useRouter para navegação

// Importação dos componentes usando alias @ (assumindo que está configurado)
import Header from '@/components/Header';
import CardAnalise from '@/components/CardAnalise';
import FeatureBlock from '@/components/FeatureBlock';
import UploadIcon from '@/components/UploadIcon'; // Garantimos que UploadIcon é importado de um arquivo separado
import AjustesModal from '@/components/AjustesModal'; // Importamos o AjustesModal

const OraculoHomePage: React.FC = () => {
  // Estado para o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Estado para controlar a visibilidade do modal de ajustes
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook do Next.js para navegação programática
  const router = useRouter();

  // Função principal para lidar com o clique no botão
  const handleMainButtonClick = () => {
    if (!selectedFile) {
      // Se nenhum arquivo foi selecionado, abre o seletor de arquivos
      fileInputRef.current?.click();
    } else {
      // Se um arquivo já foi selecionado, abre o modal de ajustes
      setIsModalOpen(true);
    }
  };

  // Função para lidar com a seleção de um arquivo no input oculto
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file); // Armazena o arquivo selecionado no estado
      console.log('Arquivo selecionado:', file.name, file.type, file.size);
      // Aqui você pode adicionar lógica inicial de validação ou pré-processamento do arquivo
    } else {
        // Se o usuário cancelou a seleção, reseta o estado do arquivo
        setSelectedFile(null);
    }
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Opcional: Você pode querer resetar o selectedFile aqui se quiser que o botão
    // volte a ser "Importar arquivo" depois que o modal é fechado.
    // setSelectedFile(null);
  };

  // Função chamada quando o botão "Confirmar" dentro do modal é clicado
  // Agora ela recebe os dados processados do modal
  const handleAnalyzeClick = async (csvContent: string, filters: string[], maxSemester: string) => {
    setIsModalOpen(false); // Fecha o modal imediatamente para feedback

    if (!csvContent) {
      alert("Nenhum dado CSV para análise.");
      return;
    }

    // Codifica o conteúdo CSV para Base64 antes de enviar para o backend
    // `btoa` não lida bem com caracteres Unicode diretamente.
    // `unescape(encodeURIComponent())` é uma forma comum de contornar isso.
    const base64CsvContent = btoa(unescape(encodeURIComponent(csvContent)));

    try {
      const API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';
      const ANALYZE_ENDPOINT = `${API_URL}/analyze`;

      const response = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: base64CsvContent, // Envia o conteúdo CSV codificado
          filters: filters,
          maxSemester: maxSemester,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na análise do backend.');
      }

      const resultData = await response.json(); // Recebe as URLs das imagens
      console.log('Dados da análise recebidos do Flask:', resultData);

      // --- Armazenamento das URLs dos gráficos ---
      // A melhor forma de passar os dados (URLs dos gráficos) para a
      // página `/analises-graficos` é através de um estado global (Context API, Zustand, Recoil).
      // Para este exemplo, vou usar localStorage temporariamente, mas NÃO é o ideal
      // para dados grandes ou para produção sem considerar segurança.
      localStorage.setItem('chartImageUrls', JSON.stringify(resultData.image_urls));
      localStorage.setItem('analysisMessage', resultData.message || 'Análise concluída.');

      // Redireciona para a página de resultados
      router.push('oraculo/analises-graficos');

    } catch (error: any) {
      console.error('Erro ao enviar dados para o Flask:', error.message);
      alert(`Erro na análise: ${error.message}`);
      // Lógica para mostrar erro na UI da página principal
    }
  };


  // Lógica para o texto e visibilidade do ícone do botão
  const buttonText = selectedFile ? 'Começar' : 'Importar arquivo';
  const showUploadIcon = !selectedFile; // Ícone visível apenas quando o texto é "Importar arquivo"

  return (
    <>
      <Header />

      <main className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        {/* Seção Principal (Introdução) */}
        <section className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Oráculo</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Análise preditiva da evasão universitária.</h2>
          <p className="text-gray-600 leading-relaxed">
            A ferramenta Oráculo analisa o impacto da pandemia na evasão universitária. Com isso, compara o comportamento de evasão de alunos em períodos anteriores e durante a pandemia, monitorando seus resultados, buscando identificar mudanças significativas, tendências e fornecer insights valiosos sobre o clima dinâmica.
          </p>
        </section>

        {/* Seção dos Cards de Análise (Gráficos em Grade) */}
        <section className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <CardAnalise
            imageSrc="/images/chart-series-temporais.svg"
            imageAlt="Gráfico de análise de séries temporais"
            title="Séries temporais"
            description="Visualização da série temporal dos dados."
          />
          <CardAnalise
            imageSrc="/images/chart-tendencia-sazonalidade.svg"
            imageAlt="Gráfico de tendências e sazonalidade"
            title="Tendência e sazonalidade"
            description="Identificação de padrões recorrentes."
          />
          <CardAnalise
            imageSrc="/images/chart-previsao.svg"
            imageAlt="Gráfico de previsão de evasão"
            title="Previsão de evasão"
            description="Estimar a evasão durante a pandemia com intervalo de confiança robustos."
          />
        </section>

        {/* Seção de Blocos de Imagem/Texto (Features) */}
        <section className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto mb-16">
          <FeatureBlock
            imageSrc="/images/chart-comparacao-pandemia.svg"
            imageAlt="Gráfico de comparação pré e durante pandemia"
            title="Comparação pré e durante pandemia"
            description="Entender o impacto da pandemia nas taxas de evasão, com comparativos entre períodos."
            reverse={false}
          />
          <FeatureBlock
            imageSrc="/images/chart-analise-campus.svg"
            imageAlt="Gráfico de análise por campus"
            title="Análise por campus"
            description="Visualizar métricas segmentadas por campus e identificar características locais."
            reverse={true}
          />
          <FeatureBlock
            imageSrc="/images/chart-predicao-valores.svg"
            imageAlt="Gráfico de predição de valores"
            title="Predição dos valores"
            description="Estimar dados futuros com base em padrões passados, usando modelos estatísticos ou algoritmos."
            reverse={false}
          />
        </section>

        {/* Seção: Importação de Dataset - Com a nova funcionalidade */}
        <section className="w-full px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto mb-16 bg-white p-8 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-3/5 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 border-b-2 border-indigo-600 pb-1 inline-block">
              Importe seus dataset
            </h2>
            <p className="text-gray-600 leading-relaxed text-base">
              Carregue seu arquivo de dados (CSV ou SQL) para que o Oráculo
              processe as informações, execute as análises comparativas da
              evasão (contrastando períodos pré e durante a pandemia) e revele
              os principais resultados e tendências.
            </p>
          </div>
          <div className="md:w-2/5 flex justify-center md:justify-end">
            {/* Input de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" // Oculta o input
              accept=".csv, .sql" // Tipos de arquivo sugeridos
            />
            {/* Botão visível que aciona a lógica */}
            <button
              onClick={handleMainButtonClick} // Chama a nova função principal do botão
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-4 px-8 rounded-lg flex items-center justify-center transition-colors duration-300 w-full md:w-auto"
            >
              {showUploadIcon && <UploadIcon className="mr-2" />} {/* Ícone condicional */}
              {buttonText} {/* Texto dinâmico */}
            </button>
          </div>
        </section>
      </main>

      {/* Renderização condicional do Modal de Ajustes */}
      {isModalOpen && (
        <AjustesModal
          onClose={handleCloseModal}
          onAnalyze={handleAnalyzeClick} // Passa a função handleAnalyzeClick com os novos parâmetros
          file={selectedFile} // Passa o objeto File completo para o modal
        />
      )}
    </>
  );
};

export default OraculoHomePage;

