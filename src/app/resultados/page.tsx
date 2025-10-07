"use client";

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  Suspense,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  Frown,
  RefreshCw,
  Info,
} from "lucide-react";
import dynamic from "next/dynamic";

// Corrigindo a importação dinâmica do Plot com tipagem adequada
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <RefreshCw className="w-8 h-8 animate-spin" />,
});

// --- Início do Componente DecompositionChart ---

// Define a interface para os dados de decomposição
interface DecompositionData {
  trend?: { x: string[]; y: number[] };
  original: { x: string[]; y: number[] };
  seasonal: { x: string[]; y: number[] };
  residual: { x: string[]; y: number[] };
}

// Componente memoizado para o gráfico de decomposição
const DecompositionChart = memo(
  ({
    data,
    isLoading,
    error,
  }: {
    data?: DecompositionData;
    isLoading?: boolean;
    error?: string | null;
  }) => {
    // Estado de loading
    if (isLoading) {
      return (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Decomposição da Série Temporal</CardTitle>
          </CardHeader>
          <CardContent className="h-[450px] w-full flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">
                Carregando decomposição...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Estado de erro
    if (error) {
      return (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Decomposição da Série Temporal</CardTitle>
          </CardHeader>
          <CardContent className="h-[450px] w-full flex items-center justify-center">
            <div className="text-center text-red-600">
              <Info className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Erro ao carregar dados</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Não renderiza se os dados de tendência não existirem
    if (!data?.trend) {
      return (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Decomposição da Série Temporal</CardTitle>
          </CardHeader>
          <CardContent className="h-[450px] w-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Dados de decomposição não disponíveis</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    const traces = [
      {
        x: data.original.x,
        y: data.original.y,
        type: "scatter" as const,
        mode: "lines" as const,
        name: "Série Original",
        line: { color: "#1f77b4", width: 2 },
        xaxis: "x",
        yaxis: "y",
      },
      {
        x: data.trend.x,
        y: data.trend.y,
        type: "scatter" as const,
        mode: "lines" as const,
        name: "Tendência",
        line: { color: "#ff7f0e", width: 2 },
        xaxis: "x2",
        yaxis: "y2",
      },
      {
        x: data.seasonal.x,
        y: data.seasonal.y,
        type: "scatter" as const,
        mode: "lines" as const,
        name: "Sazonalidade",
        line: { color: "#2ca02c", width: 2 },
        xaxis: "x3",
        yaxis: "y3",
      },
      {
        x: data.residual.x,
        y: data.residual.y,
        type: "scatter" as const,
        mode: "lines" as const,
        name: "Resíduo",
        line: { color: "#d62728", width: 2 },
        xaxis: "x4",
        yaxis: "y4",
      },
    ];

    const layout = {
      title: {
        text: "Decomposição da Série Temporal",
        font: { size: 18, color: "#2c3e50" },
      },
      showlegend: true,
      legend: {
        x: 1.02,
        y: 1,
        bgcolor: "rgba(255,255,255,0.8)",
        bordercolor: "#ccc",
        borderwidth: 1,
      },
      grid: {
        rows: 4,
        columns: 1,
        subplots: [["xy"], ["x2y2"], ["x3y3"], ["x4y4"]],
        roworder: "top to bottom",
      },
      height: 450,
      margin: { l: 60, r: 120, t: 60, b: 60 },

      // Configurações do primeiro subplot (Série Original)
      xaxis: {
        title: "",
        showticklabels: false,
        gridcolor: "#e0e0e0",
      },
      yaxis: {
        title: "Série Original",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },

      // Configurações do segundo subplot (Tendência)
      xaxis2: {
        title: "",
        showticklabels: false,
        gridcolor: "#e0e0e0",
      },
      yaxis2: {
        title: "Tendência",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },

      // Configurações do terceiro subplot (Sazonalidade)
      xaxis3: {
        title: "",
        showticklabels: false,
        gridcolor: "#e0e0e0",
      },
      yaxis3: {
        title: "Sazonalidade",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },

      // Configurações do quarto subplot (Resíduo)
      xaxis4: {
        title: "Data",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },
      yaxis4: {
        title: "Resíduo",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
      displaylogo: false,
    };

    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Decomposição da Série Temporal</CardTitle>
        </CardHeader>
        <CardContent className="h-[450px] w-full">
          <Plot
            data={traces}
            layout={layout as unknown as Partial<Plotly.Layout>}
            config={config as Partial<Plotly.Config>}
            useResizeHandler={true}
            className="w-full h-full"
          />
        </CardContent>
      </Card>
    );
  }
);

DecompositionChart.displayName = "DecompositionChart";

// --- Fim do Componente DecompositionChart ---

// Interface para tipagem dos dados da análise
interface AnalysisResults {
  forecast?: {
    mape?: number;
    forecast_y: number[];
    forecast_x: string[];
    original_x: string[];
    original_y: number[];
    test_x?: string[];
    test_y?: number[];
    forecast_ci_lower: number[];
    forecast_ci_upper: number[];
  };
  statistics?: {
    mean: number;
    trend: number;
  };
  decomposition?: DecompositionData;
  autocorrelation?: {
    lags: number[];
    acf: number[];
    acf_confidence_upper: number[];
    pacf: number[];
    pacf_confidence_upper: number[];
  };
}

// Interface para os ícones do Lucide React
interface IconProps {
  className?: string;
}

// Tipagem correta para o ícone
type IconComponent = React.ComponentType<IconProps>;

// Componente de carregamento para os gráficos Plotly
const PlotLoading = () => (
  <div className="flex items-center justify-center h-full">
    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
    <span className="text-lg">Carregando gráfico...</span>
  </div>
);

// Componente memoizado de Spinner de Carregamento para melhor desempenho
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-lg font-medium text-gray-700">
        Carregando resultados...
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Isso pode levar alguns instantes
      </p>
    </div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Componente memoizado de Exibição de Erro para melhor desempenho
const ErrorDisplay = memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Erro ao Carregar Resultados
        </h1>
        <Alert className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  )
);
ErrorDisplay.displayName = "ErrorDisplay";

// Componente memoizado de Cartão de KPI para melhor desempenho
const KPICard = memo(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: IconComponent;
    trend?: "positive" | "negative" | "neutral";
  }) => {
    const getTrendColor = () => {
      switch (trend) {
        case "positive":
          return "text-green-600";
        case "negative":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    };

    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <Icon className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getTrendColor()}`}>{value}</div>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    );
  }
);
KPICard.displayName = "KPICard";

// Hook personalizado para gerenciar a busca e o estado dos dados da análise
const useAnalysisData = () => {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResults(JSON.parse(localStorage.getItem("analysisResults") || "null"));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { results, error, isLoading, retryLoad: loadData };
};

// Componente principal da página
const ResultadosPage = () => {
  const { results, error, isLoading, retryLoad } = useAnalysisData();

  const isValidNumber = useCallback((value: unknown): value is number => {
    return typeof value === "number" && Number.isFinite(value);
  }, []);

  const formatSemesterDate = useCallback((dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;

      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const semester = month <= 6 ? 1 : 2;
      return `${year}.${semester}`;
    } catch {
      return dateString;
    }
  }, []);

  const handleDownloadReport = useCallback(async () => {
    if (!results) return;
    window.print();
  }, [results]);

  // Memoiza os dados do KPI para evitar recálculo a cada renderização
  const kpiData = useMemo(() => {
    if (!results) return [];
    const kpis = [];

    if (isValidNumber(results.forecast?.mape)) {
      const accuracy = 100 - results.forecast.mape;
      kpis.push({
        title: "Acurácia da Previsão",
        value: `${accuracy.toFixed(1)}%`,
        subtitle: `Erro (MAPE) de ${results.forecast.mape.toFixed(2)}%`,
        icon: CheckCircle,
        trend: (accuracy >= 80
          ? "positive"
          : accuracy >= 60
          ? "neutral"
          : "negative") as "positive" | "negative" | "neutral",
      });
    }

    if (isValidNumber(results.statistics?.mean)) {
      kpis.push({
        title: "Taxa de Evasão Média",
        value: `${results.statistics.mean.toFixed(2)}%`,
        subtitle: "No período de treino",
        icon: Target,
        trend: (results.statistics.mean <= 10
          ? "positive"
          : results.statistics.mean <= 20
          ? "neutral"
          : "negative") as "positive" | "negative" | "neutral",
      });
    }

    if (
      (results.forecast?.forecast_y?.length ?? 0) > 0 &&
      isValidNumber(results.forecast?.forecast_y?.[0])
    ) {
      kpis.push({
        title: "Próxima Previsão",
        value: `${results.forecast.forecast_y[0].toFixed(2)}%`,
        subtitle: `Para o semestre ${formatSemesterDate(
          results.forecast.forecast_x[0]
        )}`,
        icon: Clock,
        trend: "neutral" as "positive" | "negative" | "neutral",
      });
    }

    if (isValidNumber(results.statistics?.trend)) {
      const isIncreasing = results.statistics.trend > 0;
      kpis.push({
        title: "Tendência Geral",
        value: `${isIncreasing ? "↑" : "↓"} ${Math.abs(
          results.statistics.trend
        ).toFixed(2)}%`,
        subtitle: "Variação no período de treino",
        icon: TrendingUp,
        trend: (isIncreasing ? "negative" : "positive") as
          | "positive"
          | "negative"
          | "neutral",
      });
    }

    return kpis;
  }, [results, formatSemesterDate, isValidNumber]);

  // Lida com os estados de carregamento e erro
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={retryLoad} />;
  if (!results)
    return <ErrorDisplay error="Nenhum dado disponível" onRetry={retryLoad} />;

  return (
    <main
      className="min-h-screen w-full bg-gray-50 p-4 sm:p-6"
      id="main-content"
    >
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Dashboard de Análise Preditiva
            </h1>
            <p className="text-gray-600 mt-2">
              Análise completa de dados de evasão com previsões e insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={handleDownloadReport}>Baixar Relatório</Button>
          </div>
        </div>

        {!results.forecast && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Alguns gráficos podem não estar disponíveis devido à insuficiência
              de dados para gerar previsões confiáveis.
            </AlertDescription>
          </Alert>
        )}
      </header>

      <div className="space-y-8">
        {/* Seção de KPIs */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Indicadores Principais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>
        </section>

        {/* Seção do Gráfico Principal de Previsão */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Análise Temporal
          </h2>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Predição vs. Dados Reais
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              {results.forecast ? (
                <Suspense fallback={<PlotLoading />}>
                  <Plot
                    data={[
                      {
                        x: results.forecast.original_x,
                        y: results.forecast.original_y,
                        type: "scatter" as const,
                        mode: "lines+markers" as const,
                        name: "Dados de Treino",
                        line: { color: "#2563eb", width: 2 },
                        marker: { size: 4 },
                      },
                      ...(results.forecast.test_y &&
                      results.forecast.test_y.length > 0 &&
                      results.forecast.test_x
                        ? [
                            {
                              x: results.forecast.test_x,
                              y: results.forecast.test_y,
                              type: "scatter" as const,
                              mode: "lines+markers" as const,
                              name: "Dados de Teste",
                              line: { color: "#059669", width: 2 },
                              marker: { size: 4 },
                            },
                          ]
                        : []),
                      {
                        x: results.forecast.forecast_x,
                        y: results.forecast.forecast_y,
                        type: "scatter" as const,
                        mode: "lines+markers" as const,
                        name: "Previsão",
                        line: { color: "#dc2626", width: 2, dash: "dot" },
                        marker: { size: 6 },
                      },
                      {
                        x: results.forecast.forecast_x,
                        y: results.forecast.forecast_ci_lower,
                        type: "scatter" as const,
                        mode: "lines" as const,
                        line: { width: 0 },
                        hoverinfo: "none",
                        showlegend: false,
                      },
                      {
                        x: results.forecast.forecast_x,
                        y: results.forecast.forecast_ci_upper,
                        type: "scatter" as const,
                        mode: "lines" as const,
                        fill: "tonexty",
                        fillcolor: "rgba(220, 38, 38, 0.1)",
                        line: { width: 0 },
                        hoverinfo: "none",
                        name: "Intervalo de Confiança (95%)",
                      },
                    ]}
                    layout={{
                      autosize: true,
                      paper_bgcolor: "rgba(0,0,0,0)",
                      plot_bgcolor: "rgba(0,0,0,0)",
                      yaxis: {
                        title: "Taxa de Evasão (%)",
                        gridcolor: "#f3f4f6",
                      },
                      xaxis: {
                        title: "Período (Semestres)",
                        gridcolor: "#f3f4f6",
                      },
                      legend: {
                        x: 0.02,
                        y: 0.98,
                        bgcolor: "rgba(255,255,255,0.8)",
                      },
                      hovermode: "x unified",
                      margin: { t: 20, r: 20, b: 60, l: 60 },
                    }}
                    useResizeHandler={true}
                    className="w-full h-full"
                    config={{ displayModeBar: true, responsive: true }}
                  />
                </Suspense>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg">
                  <Frown className="w-16 h-16 mb-4" />
                  <p className="font-medium text-lg mb-2">
                    Previsão Indisponível
                  </p>
                  <p className="text-sm text-center max-w-md">
                    Não foi possível gerar a previsão. Isso pode ocorrer quando
                    há poucos dados históricos ou quando os dados não apresentam
                    padrões suficientes para modelagem.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Seção de Análise Avançada */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Análise Avançada
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Gráfico de Decomposição */}
            <div className="xl:col-span-2">
              <DecompositionChart
                data={results?.decomposition}
                isLoading={isLoading}
                error={error}
              />
            </div>

            <div className="xl:col-span-2">
              {/* Gráfico de Autocorrelação */}
              {results.autocorrelation && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Função de Autocorrelação (ACF)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[450px]">
                    <Suspense fallback={<PlotLoading />}>
                      <Plot
                        data={[
                          {
                            x: results.autocorrelation.lags,
                            y: results.autocorrelation.acf_confidence_upper.map(
                              (val: number) => -val
                            ),
                            type: "scatter" as const,
                            mode: "lines" as const,
                            line: { width: 0 },
                            hoverinfo: "none",
                            showlegend: false,
                          },
                          {
                            x: results.autocorrelation.lags,
                            y: results.autocorrelation.acf_confidence_upper,
                            type: "scatter" as const,
                            mode: "lines" as const,
                            fill: "tonexty",
                            fillcolor: "rgba(59, 130, 246, 0.15)",
                            line: { width: 0 },
                            hoverinfo: "none",
                            name: "Intervalo de Confiança",
                          },
                          {
                            x: results.autocorrelation.lags,
                            y: results.autocorrelation.acf,
                            type: "bar" as const,
                            width: 0.05,
                            name: "ACF",
                            marker: { color: "#2563eb" },
                          },
                        ]}
                        layout={{
                          autosize: true,
                          paper_bgcolor: "rgba(0,0,0,0)",
                          plot_bgcolor: "rgba(0,0,0,0)",
                          yaxis: {
                            title: "Correlação",
                            range: [-1, 1],
                            gridcolor: "#f3f4f6",
                          },
                          xaxis: {
                            title: "Lags (Semestres)",
                            gridcolor: "#f3f4f6",
                          },
                          showlegend: true,
                          legend: {
                            x: 0.02,
                            y: 0.98,
                            bgcolor: "rgba(255,255,255,0.8)",
                          },
                          margin: { t: 20, r: 20, b: 60, l: 60 },
                        }}
                        useResizeHandler={true}
                        className="w-full h-full"
                        config={{ displayModeBar: false, responsive: true }}
                      />
                    </Suspense>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="xl:col-span-2">
              {/* Função de Autocorrelação (PACF) */}
              {results.autocorrelation && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Função de Autocorrelação (PACF)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[450px]">
                    <Suspense fallback={<PlotLoading />}>
                      <Plot
                        data={[
                          {
                            x: results.autocorrelation.lags,
                            y: results.autocorrelation.pacf_confidence_upper.map(
                              (val: number) => -val
                            ),
                            type: "scatter" as const,
                            mode: "lines" as const,
                            line: { width: 0 },
                            hoverinfo: "none",
                            showlegend: false,
                          },
                          {
                            x: results.autocorrelation.lags,
                            y: results.autocorrelation.pacf_confidence_upper,
                            type: "scatter" as const,
                            mode: "lines" as const,
                            fill: "tonexty",
                            fillcolor: "rgba(59, 130, 246, 0.15)",
                            line: { width: 0 },
                            hoverinfo: "none",
                            name: "Intervalo de Confiança",
                          },
                          {
                            x: results.autocorrelation.lags,
                            y: results.autocorrelation.pacf,
                            type: "bar" as const,
                            width: 0.05,
                            name: "PACF",
                            marker: { color: "#2563eb" },
                          },
                        ]}
                        layout={{
                          autosize: true,
                          paper_bgcolor: "rgba(0,0,0,0)",
                          plot_bgcolor: "rgba(0,0,0,0)",
                          yaxis: {
                            title: "Correlação",
                            range: [-1, 1],
                            gridcolor: "#f3f4f6",
                          },
                          xaxis: {
                            title: "Lags (Semestres)",
                            gridcolor: "#f3f4f6",
                          },
                          showlegend: true,
                          legend: {
                            x: 0.02,
                            y: 0.98,
                            bgcolor: "rgba(255,255,255,0.8)",
                          },
                          margin: { t: 20, r: 20, b: 60, l: 60 },
                        }}
                        useResizeHandler={true}
                        className="w-full h-full"
                        config={{ displayModeBar: false, responsive: true }}
                      />
                    </Suspense>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResultadosPage;
