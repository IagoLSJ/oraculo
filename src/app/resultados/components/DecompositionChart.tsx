"use client";

import dynamic from "next/dynamic";
import { memo, Suspense } from "react";
import { Info, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecompositionData } from "@/types/analysis";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <RefreshCw className="w-8 h-8 animate-spin" />,
}) as any;

interface DecompositionChartProps {
  data?: DecompositionData;
  isLoading?: boolean;
  error?: string | null;
  splitDate?: string | null;
}

const DecompositionChart = memo(
  ({ data, isLoading, error, splitDate }: DecompositionChartProps) => {
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

    const verticalLineStyle = {
      type: "line" as const,
      yref: "paper" as const,
      y0: 0,
      y1: 1,
      line: {
        color: "red",
        width: 2,
        dash: "dot" as const,
      },
    };

    const shapes = splitDate
      ? [
          { ...verticalLineStyle, xref: "x", x0: splitDate, x1: splitDate },
          { ...verticalLineStyle, xref: "x2", x0: splitDate, x1: splitDate },
          { ...verticalLineStyle, xref: "x3", x0: splitDate, x1: splitDate },
          { ...verticalLineStyle, xref: "x4", x0: splitDate, x1: splitDate },
        ]
      : [];

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
        shared_xaxes: true,
      },
      height: 450,
      margin: { l: 60, r: 120, t: 60, b: 60 },
      shapes,
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
      xaxis2: {
        title: "",
        showticklabels: false,
        gridcolor: "#e0e0e0",
        matches: "x",
      },
      yaxis2: {
        title: "Tendência",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },
      xaxis3: {
        title: "",
        showticklabels: false,
        gridcolor: "#e0e0e0",
        matches: "x",
      },
      yaxis3: {
        title: "Sazonalidade",
        titlefont: { size: 12 },
        gridcolor: "#e0e0e0",
      },
      xaxis4: {
        title: "Data",
        titlefont: { size: 12 },
        showticklabels: true,
        gridcolor: "#e0e0e0",
        matches: "x",
        type: "date",
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
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
              </div>
            }
          >
            <Plot
              data={traces}
              layout={layout as any}
              config={config as any}
              useResizeHandler={true}
              className="w-full h-full"
            />
          </Suspense>
        </CardContent>
      </Card>
    );
  }
);

DecompositionChart.displayName = "DecompositionChart";
export default DecompositionChart;