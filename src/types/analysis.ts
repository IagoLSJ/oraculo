export interface DecompositionData {
  trend?: { x: string[]; y: number[] };
  original: { x: string[]; y: number[] };
  seasonal: { x: string[]; y: number[] };
  residual: { x: string[]; y: number[] };
}

export interface ForecastData {
  forecast_y: number[];
  forecast_x: string[];
  original_x: string[];
  original_y: number[];
  test_x?: string[];
  test_y?: number[];
  forecast_ci_lower: number[];
  forecast_ci_upper: number[];
  mape?: number;
}

export interface AutocorrelationData {
  lags: number[];
  acf: number[];
  acf_confidence_upper: number[];
  pacf: number[];
  pacf_confidence_upper: number[];
}

export interface AnalysisResults {
  analysis_id: string;
  forecast?: ForecastData;
  statistics?: {
    mean: number;
    std: number;
    min: number;
    max: number;
    trend: number;
  };
  decomposition?: DecompositionData;
  autocorrelation?: AutocorrelationData;
}
