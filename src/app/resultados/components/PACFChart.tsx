"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AutocorrelationData } from "@/types/analysis";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <RefreshCw className="w-8 h-8 animate-spin" />,
}) as any;

const PACFChart = memo(({ data }: { data?: AutocorrelationData }) => {
  if (!data) return null;

  const plotData = [
    {
      x: data.lags,
      y: data.pacf_confidence_upper.map((val) => -val),
      type: "scatter" as const,
      mode: "lines" as const,
      line: { width: 0 },
      hoverinfo: "none",
      showlegend: false,
    },
    {
      x: data.lags,
      y: data.pacf_confidence_upper,
      type: "scatter" as const,
      mode: "lines" as const,
      fill: "tonexty",
      fillcolor: "rgba(59, 130, 246, 0.15)",
      line: { width: 0 },
      hoverinfo: "none",
      name: "Intervalo de Confiança",
    },
    {
      x: data.lags,
      y: data.pacf,
      type: "bar" as const,
      width: 0.05,
      name: "PACF",
      marker: { color: "#2563eb" },
    },
  ];

  const plotLayout = {
    autosize: true,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    yaxis: { title: "Correlação", range: [-1, 1], gridcolor: "#f3f4f6" },
    xaxis: { title: "Lags (Semestres)", gridcolor: "#f3f4f6" },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: "rgba(255,255,255,0.8)" },
    margin: { t: 20, r: 20, b: 60, l: 60 },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Função de Autocorrelação (PACF)</CardTitle>
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

PACFChart.displayName = "PACFChart";
export default PACFChart;
