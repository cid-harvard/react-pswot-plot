export interface Datum {
  id: string;
  label: string;
  x: number;
  y: number;
  fill?: string;
  radius?: number;
  onClick?: (datum: Datum) => void;
  onMouseMove?: (datum: Datum, coords: {x: number, y: number}) => void;
  onMouseLeave?: (datum: Datum) => void;
  highlighted?: boolean;
  faded?: boolean;
}

export interface Dimensions {
  width: number;
  height: number;
}
