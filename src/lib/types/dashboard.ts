export interface DashboardStat {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
  note?: string;
}

export interface SalesSeriesPoint {
  label: string;
  value: number;
}

export interface CategoryShare {
  label: string;
  share: number;
}

export interface RecentOrderRow {
  id: string;
  customer: string;
  detail?: string;
  items: number;
  total: number;
  status: string;
  date: string;
}
