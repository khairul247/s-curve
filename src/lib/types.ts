export interface DataRow {
  date: string; // "YYYY-MM-DD"
  actual: number; // per-period value
  plan: number; // per-period value
}

export interface ProjectConfig {
  projectName: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  todayDate: string; // "YYYY-MM-DD"
  totalItems: number; // e.g. 200 findings — denominator for % calculation
}

export interface SCurveDataPoint {
  date: string;
  planned?: number;
  actual?: number | null;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  visible: boolean;
}

export interface ChartSettings {
  title: string;
  xLabel: string;
  yLabel: string;
  xRange?: {
    start?: string;
    end?: string;
  };
  colors: {
    planned: string;
    actual: string;
  };
}
