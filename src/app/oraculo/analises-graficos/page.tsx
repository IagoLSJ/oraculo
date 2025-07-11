// src/app/analises-graficos/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AjustesModal from '@/components/AjustesModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import html2pdf from "html2pdf.js";

interface ChartImageUrls {
  decomposicao: string;
  acf_pacf: string;
  predicao: string;
}

const AnalisesGraficosPage: React.FC = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartImageUrls, setChartImageUrls] = useState<ChartImageUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchChartImages = async (analysisParams?: { fileContent?: string; filters?: string[]; maxSemester?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';
      const ANALYZE_ENDPOINT = `${API_URL}/analyze`;

      const mockCsvContent = "Semestre,Unidade,Taxa de Evasao\n2018.1,QUIXADA,10\n2018.2,QUIXADA,12\n2019.1,QUIXADA,11\n2019.2,QUIXADA,15\n2020.1,QUIXADA,20\n2020.2,QUIXADA,18\n2021.1,QUIXADA,22\n2021.2,QUIXADA,25\n2022.1,QUIXADA,23\n2022.2,QUIXADA,28\n2023.1,QUIXADA,30\n2023.2,QUIXADA,29\n";
      const base64FileContent = btoa(unescape(encodeURIComponent(mockCsvContent)));

      const response = await fetch(ANALYZE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: analysisParams?.fileContent || base64FileContent,
          filters: analysisParams?.filters || ['QUIXADA'],
          maxSemester: analysisParams?.maxSemester || '2023.2',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar gráficos no backend.');
      }

      const data = await response.json();
      const prefixedUrls: ChartImageUrls = {
        decomposicao: `${API_URL}${data.image_urls.decomposicao}`,
        acf_pacf: `${API_URL}${data.image_urls.acf_pacf}`,
        predicao: `${API_URL}${data.image_urls.predicao}`,
      };
      setChartImageUrls(prefixedUrls);
    } catch (err: any) {
      setError(`Erro ao carregar gráficos: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartImages();
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById("report-content");
      if (!element) {
        alert("Seção de relatório não encontrada para exportar.");
        return;
      }

      // Cria um clone do elemento para não afetar o original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Remove todas as classes que podem conter cores oklch
      const removeProblematicClasses = (el: HTMLElement) => {
        // Remove classes específicas do Tailwind que podem causar problemas
        const problematicClasses = [
          'bg-indigo-700', 'bg-indigo-800', 'text-indigo-600', 'text-indigo-700',
          'border-indigo-500', 'hover:bg-indigo-800', 'focus:ring-indigo-500'
        ];
        
        problematicClasses.forEach(className => {
          el.classList.remove(className);
        });

        // Aplica estilos inline seguros
        if (el.classList.contains('bg-white')) {
          el.style.backgroundColor = '#ffffff';
        }
        if (el.classList.contains('bg-gray-50')) {
          el.style.backgroundColor = '#f9fafb';
        }
        if (el.classList.contains('bg-gray-100')) {
          el.style.backgroundColor = '#f3f4f6';
        }
        if (el.classList.contains('text-gray-900')) {
          el.style.color = '#111827';
        }
        if (el.classList.contains('text-gray-700')) {
          el.style.color = '#374151';
        }
        if (el.classList.contains('text-gray-600')) {
          el.style.color = '#4b5563';
        }
        if (el.classList.contains('border-gray-200')) {
          el.style.borderColor = '#e5e7eb';
        }
        
        // Recursivamente aplica para todos os filhos
        Array.from(el.children).forEach(child => {
          removeProblematicClasses(child as HTMLElement);
        });
      };

      removeProblematicClasses(clonedElement);

      // Aguarda carregamento de TODAS as imagens antes de gerar o PDF
      const images = clonedElement.getElementsByTagName("img");
      const imagePromises = Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      );

      await Promise.all(imagePromises);

      // Configurações otimizadas para o PDF
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `analise-evasao-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.95 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff',
          foreignObjectRendering: false, // Desabilita renderização de objetos estranhos
          ignoreElements: (element: HTMLElement) => {
            // Ignora elementos que podem causar problemas
            return element.tagName === 'SCRIPT' || 
                   element.tagName === 'NOSCRIPT' ||
                   element.classList.contains('no-pdf');
          }
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'] 
        }
      };

      await html2pdf().set(options).from(clonedElement).save();

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAdjustmentsClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleReAnalyze = async (csvContent: string, filters: string[], maxSemester: string) => {
    setIsModalOpen(false);

    if (!csvContent) {
      alert("Nenhum dado CSV para análise.");
      return;
    }

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
          fileContent: base64CsvContent,
          filters: filters,
          maxSemester: maxSemester,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na análise do backend.');
      }

      const resultData = await response.json();
      console.log('Dados da análise recebidos do Flask:', resultData);

      localStorage.setItem('chartImageUrls', JSON.stringify(resultData.image_urls));
      localStorage.setItem('analysisMessage', resultData.message || 'Análise concluída.');

      router.push('/analises-graficos');

    } catch (error: any) {
      console.error('Erro ao enviar dados para o Flask:', error.message);
      alert(`Erro na análise: ${error.message}`);
    }
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Header />
        <div className="text-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
          <p className="text-xl text-gray-700 mt-4">Carregando gráficos de análise...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Header />
        <div className="text-center mt-10">
          <p className="text-xl text-red-600 mb-4">Erro: {error}</p>
          <button
            onClick={() => fetchChartImages()}
            className="px-6 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </main>
    );
  }

  if (!chartImageUrls) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Header />
        <p className="text-xl text-red-600 mt-10">Nenhum URL de gráfico disponível após o carregamento.</p>
      </main>
    );
  }

  return (
    <>
      <Header />

      <main className="flex flex-col items-center bg-gray-50 pb-16">
        {/* Cabeçalho da Página de Resultados */}
        <section className="w-full bg-indigo-700 text-white py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center shadow-lg">
          <h1 className="text-4xl font-bold">Resultados das análises</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                isExporting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  📄 Exportar como PDF
                </>
              )}
            </button>
            <button
              onClick={handleAdjustmentsClick}
              className="bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-gray-100"
            >
              ⚙️ Ajustes
            </button>
          </div>
        </section>

        {/* Conteúdo do Relatório - Este é o elemento que será exportado como PDF */}
        <div id="report-content" className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-10" style={{ backgroundColor: '#ffffff' }}>
          {/* Cabeçalho do Relatório */}
          <div className="p-8 mb-6 border-b-2" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>Relatório de Análise de Evasão</h1>
            <p className="mb-1" style={{ color: '#4b5563' }}>Gerado em: {getCurrentDateTime()}</p>
            <p style={{ color: '#4b5563' }}>Sistema de Análise Preditiva de Evasão Acadêmica</p>
          </div>

          {/* Resumo Executivo */}
          <section className="rounded-lg shadow-md p-8 mb-10" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Resumo Executivo</h2>
            <p className="mb-4" style={{ color: '#374151' }}>
              Este relatório apresenta uma análise detalhada da série temporal de evasão acadêmica, 
              incluindo decomposição da série, análise de autocorrelação e previsões futuras.
            </p>
            <p style={{ color: '#374151' }}>
              Os gráficos a seguir fornecem insights sobre padrões sazonais, tendências e 
              comportamentos preditivos dos dados de evasão.
            </p>
          </section>

          {/* Gráfico de Decomposição da Série Temporal */}
          <section className="rounded-lg shadow-md p-8 mb-10 page-break-inside-avoid" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>1. Decomposição da Série Temporal</h2>
            <p className="mb-4" style={{ color: '#374151' }}>
              A decomposição da série temporal permite identificar componentes de tendência, 
              sazonalidade e ruído nos dados de evasão.
            </p>
            {chartImageUrls.decomposicao && (
              <div className="w-full text-center">
                <Image
                  src={chartImageUrls.decomposicao}
                  alt="Gráfico de decomposição da série temporal"
                  width={800}
                  height={600}
                  className="mx-auto max-w-full h-auto"
                />
              </div>
            )}
          </section>

          {/* Gráfico de Autocorrelação (ACF) e Autocorrelação Parcial (PACF) */}
          <section className="rounded-lg shadow-md p-8 mb-10 page-break-inside-avoid" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>2. Análise de Autocorrelação</h2>
            <p className="mb-4" style={{ color: '#374151' }}>
              Os gráficos de autocorrelação (ACF) e autocorrelação parcial (PACF) ajudam a 
              identificar padrões temporais e dependências nos dados.
            </p>
            {chartImageUrls.acf_pacf && (
              <div className="w-full text-center">
                <Image
                  src={chartImageUrls.acf_pacf}
                  alt="Gráficos de autocorrelação e autocorrelação parcial"
                  width={800}
                  height={400}
                  className="mx-auto max-w-full h-auto"
                />
              </div>
            )}
          </section>

          {/* Gráfico de Predição */}
          <section className="rounded-lg shadow-md p-8 mb-10 page-break-inside-avoid" style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>3. Previsão de Evasão</h2>
            <p className="mb-4" style={{ color: '#374151' }}>
              O gráfico de previsão mostra as projeções futuras da taxa de evasão com base 
              no modelo estatístico aplicado aos dados históricos.
            </p>
            {chartImageUrls.predicao && (
              <div className="w-full text-center">
                <Image
                  src={chartImageUrls.predicao}
                  alt="Gráfico de previsão"
                  width={800}
                  height={400}
                  className="mx-auto max-w-full h-auto"
                />
              </div>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <AjustesModal
          onClose={handleCloseModal}
          onAnalyze={handleReAnalyze}
          file={null}
        />
      )}

      {/* Estilos CSS para quebra de página no PDF */}
      <style jsx>{`
        @media print {
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
};

export default AnalisesGraficosPage;