export type Column = {
  label: string;
  values: Array<number | string | null>;
  valueType: "number" | "string" | "date" | "empty" | "mixed";
};

export type SortOrder = "none" | "asc" | "desc";

export type FontSettings = {
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  family: string;
};

export type ColorSettings = {
  seriesColor: string;
  backgroundColor: string;
  titleColor: string;
  xAxisColor: string;
  yAxisColor: string;
  circlesColor: string;
  axisStrokeColor: string;
};
