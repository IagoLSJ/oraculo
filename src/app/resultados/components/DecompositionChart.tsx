"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false, 
  loading: () => <RefreshCw className="w-8 h-8 animate-spin" />
}) as any;

const TimeSeriesDecomposition = () => {
  const [data, setData] = useState(null);
  
  // Função para gerar dados de exemplo
  const generateSampleData = () => {
    const n = 365; // 1 ano de dados diários
    const dates = [];
    const original = [];
    const trend = [];
    const seasonal = [];
    const residual = [];
    
    const startDate = new Date('2023-01-01');
    
    for (let i = 0; i < n; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
      
      // Componente de tendência (crescimento linear)
      const trendValue = 100 + (i * 0.5) + Math.sin(i * 0.01) * 20;
      trend.push(trendValue);
      
      // Componente sazonal (padrão semanal + anual)
      const seasonalWeekly = 10 * Math.sin(2 * Math.PI * i / 7); // Semanal
      const seasonalYearly = 15 * Math.sin(2 * Math.PI * i / 365.25); // Anual
      const seasonalValue = seasonalWeekly + seasonalYearly;
      seasonal.push(seasonalValue);
      
      // Componente de ruído
      const noiseValue = (Math.random() - 0.5) * 10;
      residual.push(noiseValue);
      
      // Série original (soma de todos os componentes)
      const originalValue = trendValue + seasonalValue + noiseValue;
      original.push(originalValue);
    }
    
    return { dates, original, trend, seasonal, residual };
  };
  
  useEffect(() => {
    setData(generateSampleData());
  }, []);
  
  const regenerateData = () => {
    setData(generateSampleData());
  };
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  const { dates, original, trend, seasonal, residual } = data;
  
  // Configuração dos subplots
  const traces = [
    {
      x: dates,
      y: original,
      type: 'scatter',
      mode: 'lines',
      name: 'Série Original',
      line: { color: '#1f77b4', width: 2 },
      xaxis: 'x',
      yaxis: 'y'
    },
    {
      x: dates,
      y: trend,
      type: 'scatter',
      mode: 'lines',
      name: 'Tendência',
      line: { color: '#ff7f0e', width: 2 },
      xaxis: 'x2',
      yaxis: 'y2'
    },
    {
      x: dates,
      y: seasonal,
      type: 'scatter',
      mode: 'lines',
      name: 'Sazonalidade',
      line: { color: '#2ca02c', width: 2 },
      xaxis: 'x3',
      yaxis: 'y3'
    },
    {
      x: dates,
      y: residual,
      type: 'scatter',
      mode: 'lines',
      name: 'Resíduo',
      line: { color: '#d62728', width: 2 },
      xaxis: 'x4',
      yaxis: 'y4'
    }
  ];
  
  const layout = {
    title: {
      text: 'Decomposição de Série Temporal',
      font: { size: 20, color: '#2c3e50' }
    },
    showlegend: true,
    legend: {
      x: 1.02,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#ccc',
      borderwidth: 1
    },
    grid: {
      rows: 4,
      columns: 1,
      subplots: [['xy'], ['x2y2'], ['x3y3'], ['x4y4']],
      roworder: 'top to bottom'
    },
    height: 800,
    margin: { l: 60, r: 120, t: 80, b: 60 },
    
    // Configurações do primeiro subplot (Série Original)
    xaxis: {
      title: '',
      showticklabels: false,
      gridcolor: '#e0e0e0'
    },
    yaxis: {
      title: 'Série Original',
      titlefont: { size: 12 },
      gridcolor: '#e0e0e0'
    },
    
    // Configurações do segundo subplot (Tendência)
    xaxis2: {
      title: '',
      showticklabels: false,
      gridcolor: '#e0e0e0'
    },
    yaxis2: {
      title: 'Tendência',
      titlefont: { size: 12 },
      gridcolor: '#e0e0e0'
    },
    
    // Configurações do terceiro subplot (Sazonalidade)
    xaxis3: {
      title: '',
      showticklabels: false,
      gridcolor: '#e0e0e0'
    },
    yaxis3: {
      title: 'Sazonalidade',
      titlefont: { size: 12 },
      gridcolor: '#e0e0e0'
    },
    
    // Configurações do quarto subplot (Resíduo)
    xaxis4: {
      title: 'Data',
      titlefont: { size: 12 },
      gridcolor: '#e0e0e0'
    },
    yaxis4: {
      title: 'Resíduo',
      titlefont: { size: 12 },
      gridcolor: '#e0e0e0'
    }
  };
  
  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    displaylogo: false
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Decomposição de Série Temporal
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">Sobre a Decomposição:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li><strong>Série Original:</strong> Dados observados ao longo do tempo</li>
            <li><strong>Tendência:</strong> Movimento de longo prazo dos dados</li>
            <li><strong>Sazonalidade:</strong> Padrões que se repetem em intervalos regulares</li>
            <li><strong>Resíduo:</strong> Variações aleatórias não explicadas pelos outros componentes</li>
          </ul>
        </div>
        
        <button
          onClick={regenerateData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          Gerar Novos Dados
        </button>
      </div>
      
      <div className="w-full border border-gray-200 rounded-lg shadow-sm" style={{ minHeight: '800px' }}>
        <Plot
          data={traces}
          layout={layout}
          config={config}
          useResizeHandler={true}
          className="w-full h-full"
        />
      </div>
      
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Funcionalidades:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-700">Interações:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Zoom e pan em cada subplot</li>
              <li>Hover para ver valores exatos</li>
              <li>Toggle de legendas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">Análise:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Identificação de tendências</li>
              <li>Padrões sazonais claros</li>
              <li>Variabilidade dos resíduos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesDecomposition;