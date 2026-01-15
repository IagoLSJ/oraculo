"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  Info,
  RefreshCw,
  Target,
  TrendingUp,
} from "lucide-react";
import KPICard from "./components/KPICard";
import ForecastChart from "./components/ForecastChart";
import ACFChart from "./components/ACFChart";
import PACFChart from "./components/PACFChart";
import DecompositionChart from "./components/DecompositionChart";
import { useAnalysisContext } from "@/contexts/AnalysisContext";

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

const ErrorDisplay = memo(
  ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-screen max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Erro ao Carregar Resultados
        </h1>
        <Alert className="mb-4 !border-red-400 !bg-red-50 !text-red-800">
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

const useAnalysisData = () => {
  const { results, loadFromStorage } = useAnalysisContext();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = results ?? loadFromStorage();
      if (!stored) {
        throw new Error("Nenhum resultado de análise encontrado.");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Falha ao carregar dados. Tente novamente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [results, loadFromStorage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { results, error, isLoading, retryLoad: loadData };
};

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

  const handleDownloadReport = useCallback(() => {
    if (!results) return;
    window.print();
  }, [results]);

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
        subtitle: "Em todo o período",
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
        subtitle: "Variação em todo o período",
        icon: TrendingUp,
        trend: (isIncreasing ? "negative" : "positive") as
          | "positive"
          | "negative"
          | "neutral",
      });
    }

    return kpis;
  }, [results, formatSemesterDate, isValidNumber]);

  const splitDate = useMemo(() => {
    if (
      results?.forecast?.original_x &&
      results.forecast.original_x.length > 0 &&
      results.forecast.test_x &&
      results.forecast.test_x.length > 0
    ) {
      return results.forecast.original_x[
        results.forecast.original_x.length - 1
      ];
    }
    return null;
  }, [results]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={retryLoad} />;
  if (!results) return <LoadingSpinner />;

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
            <Button onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório
            </Button>
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

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Análise Temporal
          </h2>
          <ForecastChart data={results.forecast} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Análise Avançada
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="xl:col-span-2">
              <DecompositionChart
                data={results.decomposition}
                isLoading={isLoading}
                error={error}
                splitDate={splitDate}
              />
            </div>
            <div className="xl:col-span-2">
              {results.autocorrelation && (
                <ACFChart data={results.autocorrelation} />
              )}
            </div>
            <div className="xl:col-span-2">
              {results.autocorrelation && (
                <PACFChart data={results.autocorrelation} />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResultadosPage;
