"use client";

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Frown, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false, 
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
            <span className="text-lg">Carregando gráfico...</span>
        </div>
    ) 
}) as any;

interface ForecastData {
    forecast_y: number[];
    forecast_x: string[];
    original_x: string[];
    original_y: number[];
    test_x?: string[];
    test_y?: number[];
    forecast_ci_lower: number[];
    forecast_ci_upper: number[];
}

const ForecastChart = memo(({ data }: { data?: ForecastData }) => {
    if (!data) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Predição vs. Dados Reais
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg">
                        <Frown className="w-16 h-16 mb-4" />
                        <p className="font-medium text-lg mb-2">Previsão Indisponível</p>
                        <p className="text-sm text-center max-w-md">
                            Não foi possível gerar a previsão. Isso pode ocorrer com poucos dados históricos.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const plotData = [
        // Dados de Treino
        {
            x: data.original_x,
            y: data.original_y,
            type: 'scatter', mode: 'lines+markers', name: 'Dados de Treino',
            line: { color: '#2563eb', width: 2 }, marker: { size: 4 }
        },
        // Dados de Teste (se existirem)
        ...(data.test_y?.length > 0 ? [{
            x: data.test_x, y: data.test_y,
            type: 'scatter', mode: 'lines+markers', name: 'Dados de Teste',
            line: { color: '#059669', width: 2 }, marker: { size: 4 }
        }] : []),
        // Previsão
        {
            x: data.forecast_x, y: data.forecast_y,
            type: 'scatter', mode: 'lines+markers', name: 'Previsão',
            line: { color: '#dc2626', width: 2, dash: 'dot' }, marker: { size: 6 }
        },
        // Intervalo de Confiança (banda inferior invisível)
        {
            x: data.forecast_x, y: data.forecast_ci_lower,
            type: 'scatter', mode: 'lines', line: { width: 0 },
            hoverinfo: 'none', showlegend: false
        },
        // Intervalo de Confiança (banda superior preenchida)
        {
            x: data.forecast_x, y: data.forecast_ci_upper,
            type: 'scatter', mode: 'lines', fill: 'tonexty',
            fillcolor: 'rgba(220, 38, 38, 0.1)', line: { width: 0 },
            hoverinfo: 'none', name: 'Intervalo de Confiança (95%)'
        }
    ];

    const plotLayout = {
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        yaxis: { title: 'Taxa de Evasão (%)', gridcolor: '#f3f4f6' },
        xaxis: { title: 'Período (Semestres)', gridcolor: '#f3f4f6' },
        legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
        hovermode: 'x unified',
        margin: { t: 20, r: 20, b: 60, l: 60 }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Predição vs. Dados Reais
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
                <Plot
                    data={plotData}
                    layout={plotLayout}
                    useResizeHandler={true}
                    className="w-full h-full"
                    config={{ displayModeBar: true, responsive: true }}
                />
            </CardContent>
        </Card>
    );
});

ForecastChart.displayName = 'ForecastChart';
export default ForecastChart;