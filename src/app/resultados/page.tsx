"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Download, TrendingUp, Target, CheckCircle, Clock } from "lucide-react";
import dynamic from 'next/dynamic';

// Importa o Plotly de forma dinâmica para otimizar o carregamento
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <p className="text-center p-4">A carregar gráfico...</p> }) as any;

export default function ResultadosPage() {
    const router = useRouter();
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedResults = localStorage.getItem('analysisResults');
            if (savedResults) {
                const parsedResults = JSON.parse(savedResults);
                setResults(parsedResults);
            } else {
                throw new Error("Nenhum resultado de análise encontrado.");
            }
        } catch (e: any) {
            setError(e.message || "Erro ao carregar resultados.");
        }
    }, []);

    // Função auxiliar para formatar a data da previsão para 'AAAA.S'
    const formatSemesterDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const semester = month === 1 ? 1 : 2;
        return `${year}.${semester}`;
    };

    if (error) {
        // Ecrã de erro
        return (
             <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Erro ao Carregar Resultados</h1>
                <p className="text-red-600 bg-red-100 p-4 rounded-md">{error}</p>
                <Button onClick={() => router.back()} className="mt-4">Voltar</Button>
            </div>
        );
    }
    
    if (!results) {
        // Ecrã de carregamento
        return (
            <div className="flex items-center justify-center min-h-screen text-lg">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                A carregar resultados...
            </div>
        );
    }

    // A renderização principal do dashboard
    return (
        <main className="min-h-screen w-full bg-gray-50 p-4 sm:p-6">
            <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800">Dashboard de Análise Preditiva</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button>
                        <Download className="w-4 h-4 mr-2" /> Baixar Relatório
                    </Button>
                </div>
            </header>
            
            <div className="space-y-6">
                {/* Linha de KPIs (Key Performance Indicators) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {results.forecast?.mape && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Acurácia da Previsão</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{(100 - results.forecast.mape).toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Erro (MAPE) de {results.forecast.mape.toFixed(2)}%</p>
                            </CardContent>
                        </Card>
                    )}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Evasão Média</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{results.statistics?.mean.toFixed(2)}%</div>
                            <p className="text-xs text-muted-foreground">No período de treino</p>
                        </CardContent>
                    </Card>
                    {results.forecast?.forecast_y?.length > 0 && (
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Próxima Previsão</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{results.forecast.forecast_y[0].toFixed(2)}%</div>
                                <p className="text-xs text-muted-foreground">Para o semestre {formatSemesterDate(results.forecast.forecast_x[0])}</p>
                            </CardContent>
                        </Card>
                    )}
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tendência Geral</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold flex items-center ${results.statistics?.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {results.statistics?.trend > 0 ? '↑' : '↓'} {Math.abs(results.statistics?.trend).toFixed(2)}%
                            </div>
                            <p className="text-xs text-muted-foreground">Variação no período de treino</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Linha do Gráfico Principal */}
                <div className="grid grid-cols-1 gap-6">
                    <Card className="col-span-1">
                        <CardHeader><CardTitle>Predição vs. Dados Reais</CardTitle></CardHeader>
                        <CardContent className="h-[450px]">
                            <Plot
                                data={[
                                    { x: results.forecast.original_x, y: results.forecast.original_y, type: 'scatter', mode: 'lines+markers', name: 'Dados de Treino', line: { color: '#1e40af' } },
                                    ...(results.forecast.test_y?.length > 0 ? [{ 
                                        x: results.forecast.test_x, 
                                        y: results.forecast.test_y, 
                                        type: 'scatter', 
                                        mode: 'lines+markers', 
                                        name: 'Dados Reais (Teste)',
                                        line: { color: '#16a34a' }
                                    }] : []),
                                    { x: results.forecast.forecast_x, y: results.forecast.forecast_y, type: 'scatter', mode: 'lines+markers', name: 'Previsão', line: { color: '#dc2626', dash: 'dash' } },
                                ]}
                                layout={{ autosize: true, yaxis: { title: 'Taxa de Evasão (%)' }, legend: { x: 0.01, y: 0.98 } }}
                                useResizeHandler={true}
                                className="w-full h-full"
                            />
                        </CardContent>
                    </Card>
                </div>
                
                {/* Linha dos Gráficos Secundários */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {results.decomposition?.trend && (
                        <Card className="col-span-1">
                            <CardHeader><CardTitle>Decomposição da Série (Tendência)</CardTitle></CardHeader>
                            <CardContent className="h-[400px]">
                                <Plot
                                    data={[ { x: results.decomposition.trend.x, y: results.decomposition.trend.y, type: 'scatter', mode: 'lines', name: 'Tendência', line: { color: '#059669' } } ]}
                                    layout={{ title: 'Tendência da Taxa de Evasão', autosize: true, yaxis: { title: 'Taxa de Evasão (%)' } }}
                                    useResizeHandler={true}
                                    className="w-full h-full"
                                />
                            </CardContent>
                        </Card>
                    )}
                    {results.autocorrelation && (
                         <Card className="col-span-1">
                            <CardHeader><CardTitle>Função de Autocorrelação (ACF)</CardTitle></CardHeader>
                            <CardContent className="h-[400px]">
                                 <Plot
                                    data={[
                                        { x: results.autocorrelation.lags, y: results.autocorrelation.acf, type: 'bar', name: 'ACF' },
                                        { x: results.autocorrelation.lags, y: results.autocorrelation.acf_confidence_upper, type: 'scatter', mode: 'lines', line: { color: 'rgba(0,0,0,0.3)', dash: 'dash' }, hoverinfo: 'none', showlegend: false },
                                        { x: results.autocorrelation.lags, y: results.autocorrelation.acf_confidence_upper.map((val: number) => -val), type: 'scatter', mode: 'lines', line: { color: 'rgba(0,0,0,0.3)', dash: 'dash' }, hoverinfo: 'none', showlegend: false },
                                    ]}
                                    layout={{ autosize: true, yaxis: { title: 'Correlação' }, xaxis: { title: 'Lags (Semestres)' } }}
                                    useResizeHandler={true}
                                    className="w-full h-full"
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}