export interface Datum {
  label: string;
  x: number;
  y: number;
  fill?: string;
  radius?: number;
  onClick?: () => void;
  highlighted?: boolean;
}

export interface Dimensions {
  width: number;
  height: number;
}
