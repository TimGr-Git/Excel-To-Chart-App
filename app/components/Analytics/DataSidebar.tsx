"use client";

import React from "react";
import { LineControls, BarControls } from "./DataSidebarParts";

type Column = {
  label: string;
  values: Array<number | string | null>;
  valueType: "number" | "string" | "date" | "empty" | "mixed";
};

type SortOrder = "none" | "asc" | "desc";

interface Props {
  columns: Column[];
  selectedValueIndex: number | null;
  selectedLabelIndex: number | null;
  onSelect: (valueIndex: number | null, labelIndex: number | null) => void;
  valueSort: SortOrder;
  labelSort: SortOrder;
  onSortChange: (kind: "value" | "label", order: SortOrder) => void;
  fileName?: string | null;
  plotTitle: string;
  setPlotTitle: (s: string) => void;
  xLabel: string;
  setXLabel: (s: string) => void;
  yLabel: string;
  setYLabel: (s: string) => void;
  chartType?: "line" | "bar";
  titleFont: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  setTitleFont: (f: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  }) => void;
  yAxisFont: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  setYAxisFont: (f: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  }) => void;
  xAxisFont: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  setXAxisFont: (f: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  }) => void;
  seriesColor: string;
  setSeriesColor: (c: string) => void;
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;
  titleColor: string;
  setTitleColor: (c: string) => void;
  xAxisColor: string;
  setXAxisColor: (c: string) => void;
  yAxisColor: string;
  setYAxisColor: (c: string) => void;
  circlesColor: string;
  setCirclesColor: (c: string) => void;
  axisStrokeColor: string;
  setAxisStrokeColor: (c: string) => void;
  // optional circle fill color (only relevant to Line plot)
  circlesFillColor?: string;
  setCirclesFillColor?: (c: string) => void;
}

export default function DataSidebar({
  columns = [], // default to empty array
  selectedValueIndex,
  selectedLabelIndex,
  onSelect,
  valueSort,
  labelSort,
  onSortChange,
  fileName,
  plotTitle,
  setPlotTitle,
  xLabel,
  setXLabel,
  yLabel,
  setYLabel,
  chartType = "line",
  titleFont,
  setTitleFont,
  yAxisFont,
  setYAxisFont,
  xAxisFont,
  setXAxisFont,
  seriesColor,
  setSeriesColor,
  backgroundColor,
  setBackgroundColor,
  titleColor,
  setTitleColor,
  xAxisColor,
  setXAxisColor,
  yAxisColor,
  setYAxisColor,
  circlesColor,
  setCirclesColor,
  axisStrokeColor,
  setAxisStrokeColor,
  circlesFillColor,
  setCirclesFillColor,
}: Props) {
  // Panel open state is managed inside each Panel component now.

  // when chart type changes, update default plot title if user hasn't customized
  const LINE_DEFAULT = "Line Plot";
  const LINE_DEFAULT_LEGACY = "Lineplot"; // tolerate prior variant
  const BAR_DEFAULT = "Bar Chart";
  const BAR_DEFAULT_LEGACY = "Bar chart"; // tolerate prior variant
  React.useEffect(() => {
    // only override the title when it's empty or still the previous chart default
    const isLineDefault =
      !plotTitle ||
      plotTitle === LINE_DEFAULT ||
      plotTitle === LINE_DEFAULT_LEGACY;
    const isBarDefault =
      !plotTitle ||
      plotTitle === BAR_DEFAULT ||
      plotTitle === BAR_DEFAULT_LEGACY;
    if (chartType === "bar") {
      if (isLineDefault) setPlotTitle(BAR_DEFAULT);
    } else {
      if (isBarDefault) setPlotTitle(LINE_DEFAULT);
    }
  }, [chartType, plotTitle, setPlotTitle]);

  // sidebar should span from under the nav to bottom and be flush with edges
  return (
    <aside
      className="w-64 bg-gray-100 border-r border-gray-200 p-4 shrink-0 flex flex-col"
      style={{ position: "sticky", top: "56px", height: "calc(100vh - 56px)" }}
    >
      <h2 className="text-lg font-semibold mb-4">
        {fileName ?? "Uploaded Data"}
      </h2>

      {/* Make the main menu area scrollable when content is long. */}
      <div
        className="flex-1 overflow-auto data-sidebar-scroll"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {/* Render only the sidebar grouping relevant to the selected chart type. */}
        {chartType === "line" ? (
          <LineControls
            {...{
              columns,
              selectedValueIndex,
              selectedLabelIndex,
              onSelect,
              valueSort,
              labelSort,
              onSortChange,
              plotTitle,
              setPlotTitle,
              xLabel,
              setXLabel,
              yLabel,
              setYLabel,
              titleFont,
              setTitleFont,
              yAxisFont,
              setYAxisFont,
              xAxisFont,
              setXAxisFont,
              seriesColor,
              setSeriesColor,
              backgroundColor,
              setBackgroundColor,
              titleColor,
              setTitleColor,
              xAxisColor,
              setXAxisColor,
              yAxisColor,
              setYAxisColor,
              circlesColor,
              setCirclesColor,
              axisStrokeColor,
              setAxisStrokeColor,
              // pass circles fill controls only to the Line sidebar
              circlesFillColor,
              setCirclesFillColor,
              chartType,
            }}
          />
        ) : (
          <BarControls
            {...{
              columns,
              selectedValueIndex,
              selectedLabelIndex,
              onSelect,
              valueSort,
              labelSort,
              onSortChange,
              plotTitle,
              setPlotTitle,
              xLabel,
              setXLabel,
              yLabel,
              setYLabel,
              titleFont,
              setTitleFont,
              yAxisFont,
              setYAxisFont,
              xAxisFont,
              setXAxisFont,
              seriesColor,
              setSeriesColor,
              backgroundColor,
              setBackgroundColor,
              titleColor,
              setTitleColor,
              xAxisColor,
              setXAxisColor,
              yAxisColor,
              setYAxisColor,
              // circlesColor and setCirclesColor intentionally omitted for BarControls
              axisStrokeColor,
              setAxisStrokeColor,
              chartType,
            }}
          />
        )}
      </div>
    </aside>
  );
}
