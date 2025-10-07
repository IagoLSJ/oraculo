"use client";

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <RefreshCw className="w-8 h-8 animate-spin" /> }) as any;

interface ACFData {
    lags: number[];
    acf: number[];
    acf_confidence_upper: number[];
}

const ACFChart = memo(({ data }: { data?: ACFData }) => {
    if (!data) return null;

    const plotData = [
        {
            x: data.lags, y: data.acf_confidence_upper.map(val => -val),
            type: 'scatter', mode: 'lines', line: { width: 0 },
            hoverinfo: 'none', showlegend: false
        },
        {
            x: data.lags, y: data.acf_confidence_upper,
            type: 'scatter', mode: 'lines', fill: 'tonexty',
            fillcolor: 'rgba(59, 130, 246, 0.15)', line: { width: 0 },
            hoverinfo: 'none', name: 'Intervalo de Confiança'
        },
        {
            x: data.lags, y: data.acf,
            type: 'bar', width: 0.05, name: 'ACF',
            marker: { color: '#2563eb' }
        }
    ];

    const plotLayout = {
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        yaxis: { title: 'Correlação', range: [-1, 1], gridcolor: '#f3f4f6' },
        xaxis: { title: 'Lags (Semestres)', gridcolor: '#f3f4f6' },
        showlegend: true,
        legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' },
        margin: { t: 20, r: 20, b: 60, l: 60 }
    };
    
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Função de Autocorrelação (ACF)</CardTitle>
            </CardHeader>
            <CardContent className="h-[450px]">
                <Plot
                    data={plotData}
                    layout={plotLayout}
                    useResizeHandler={true}
                    className="w-full h-full"
                    config={{ displayModeBar: false, responsive: true }}
                />
            </CardContent>
        </Card>
    );
});

ACFChart.displayName = 'ACFChart';
export default ACFChart;