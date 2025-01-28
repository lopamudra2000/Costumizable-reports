export type ExhibitType = 'table' | 'pie' | 'bar' | 'image';

export interface Exhibit {
  id: string;
  type: ExhibitType;
  title: string;
  icon: string;
}

export interface TableData {
  columns: Column[];
  rows: Record<string, any>[];
}

export interface Column {
  id: string;
  title: string;
  field: string;
  visible: boolean;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface GridPosition {
  row: number;
  column: number;
  width: number; // in grid columns (1-12)
}

export interface CanvasItem {
  id: string;
  exhibitId: string;
  type: ExhibitType;
  position: GridPosition;
  size: { width: number; height: number };
  data: TableData | ChartData;
  title?: string;
}