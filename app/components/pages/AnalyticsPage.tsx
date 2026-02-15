"use client";

import React from "react";
import LinePlot from "../Analytics/Chart types/LinePlot/LinePlot";
import BarChart from "../Analytics/Chart types/BarChart/BarChart";
import DataSidebar from "../Analytics/DataSidebar";

// Column type reused from main page
export type Column = {
  label: string;
  values: Array<number | string | null>;
  valueType: "number" | "string" | "date" | "empty" | "mixed";
};

type FontSettings = {
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  family: string;
};

export default function AnalyticsPage({
  columns,
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
  circlesColor,
  setCirclesColor,
  xAxisColor,
  setXAxisColor,
  yAxisColor,
  setYAxisColor,
  axisStrokeColor,
  setAxisStrokeColor,
  circlesFillColor,
  setCirclesFillColor,
}: {
  columns: Column[];
  selectedValueIndex: number | null;
  selectedLabelIndex: number | null;
  onSelect: (valueIndex: number | null, labelIndex: number | null) => void;
  valueSort: "none" | "asc" | "desc";
  labelSort: "none" | "asc" | "desc";
  onSortChange: (
    kind: "value" | "label",
    order: "none" | "asc" | "desc",
  ) => void;
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
  setTitleFont: React.Dispatch<React.SetStateAction<FontSettings>>;
  yAxisFont: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  setYAxisFont: React.Dispatch<React.SetStateAction<FontSettings>>;
  xAxisFont: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  setXAxisFont: React.Dispatch<React.SetStateAction<FontSettings>>;
  seriesColor: string;
  setSeriesColor: React.Dispatch<React.SetStateAction<string>>;
  backgroundColor: string;
  setBackgroundColor: React.Dispatch<React.SetStateAction<string>>;
  titleColor: string;
  setTitleColor: React.Dispatch<React.SetStateAction<string>>;
  circlesColor: string;
  setCirclesColor: React.Dispatch<React.SetStateAction<string>>;
  xAxisColor: string;
  setXAxisColor: React.Dispatch<React.SetStateAction<string>>;
  yAxisColor: string;
  setYAxisColor: React.Dispatch<React.SetStateAction<string>>;
  axisStrokeColor: string;
  setAxisStrokeColor: React.Dispatch<React.SetStateAction<string>>;
  circlesFillColor: string;
  setCirclesFillColor: React.Dispatch<React.SetStateAction<string>>;
}) {
  // Derive numericData and labeledData as in main page
  let numericData: number[] =
    selectedValueIndex !== null &&
    Array.isArray(columns) &&
    columns[selectedValueIndex] !== undefined &&
    Array.isArray(columns[selectedValueIndex].values)
      ? (columns[selectedValueIndex].values as number[]).map((v) =>
          v === null ? 0 : Number(v),
        )
      : [];

  let labeledData: { label: string; value: number }[] =
    selectedLabelIndex !== null &&
    Array.isArray(columns) &&
    columns[selectedLabelIndex] !== undefined &&
    Array.isArray(columns[selectedLabelIndex].values)
      ? (columns[selectedLabelIndex].values as Array<string | null>).map(
          (v, i: number) => ({
            label: v === null ? `Row ${i + 1}` : String(v),
            value:
              selectedValueIndex !== null &&
              columns[selectedValueIndex] !== undefined &&
              Array.isArray(columns[selectedValueIndex].values)
                ? Number(columns[selectedValueIndex].values[i] ?? 0)
                : 0,
          }),
        )
      : [];

  // Sorting logic can be added here if needed

  const applySort = () => {
    if (valueSort !== "none" && numericData.length > 0) {
      const paired = numericData.map((v, i) => ({ v, i }));
      paired.sort((a, b) => (valueSort === "asc" ? a.v - b.v : b.v - a.v));
      numericData = paired.map((p) => p.v);
      if (labeledData && labeledData.length === paired.length) {
        labeledData = paired.map((p) => labeledData[p.i]);
      }
    }

    if (labelSort !== "none" && labeledData.length > 0) {
      const paired = labeledData.map((item, i) => ({ item, i }));
      paired.sort((a, b) => {
        const av = a.item.label;
        const bv = b.item.label;
        const ad = Date.parse(av);
        const bd = Date.parse(bv);
        const bothDates = !isNaN(ad) && !isNaN(bd);
        if (bothDates) return labelSort === "asc" ? ad - bd : bd - ad;
        return labelSort === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
      labeledData = paired.map((p) => p.item);
      if (numericData && numericData.length === paired.length) {
        numericData = paired.map((p) => numericData[p.i]);
      }
    }
  };

  applySort();

  // Reference to the chart container so we can capture SVG/canvas inside it
  const chartRef = React.useRef<HTMLDivElement | null>(null);

  const captureChartAsDataUrl = async (): Promise<string | null> => {
    const el = chartRef.current;
    if (!el) return null;

    // Prefer SVG if present
    const svg = el.querySelector("svg") as SVGElement | null;
    if (svg) {
      try {
        const serializer = new XMLSerializer();
        let svgStr = serializer.serializeToString(svg);
        if (!svgStr.includes("xmlns=")) {
          svgStr = svgStr.replace(
            /^<svg/,
            '<svg xmlns="http://www.w3.org/2000/svg"',
          );
        }
        // Return URI-encoded SVG (simple and reliable for in-memory use)
        const encoded = encodeURIComponent(svgStr);
        return "data:image/svg+xml;utf8," + encoded;
      } catch (e) {
        console.error("SVG serialization failed", e);
      }
    }

    // Fallback: canvas
    const canvas = el.querySelector("canvas") as HTMLCanvasElement | null;
    if (canvas) {
      try {
        return canvas.toDataURL("image/png");
      } catch (e) {
        console.error("Canvas toDataURL failed", e);
      }
    }

    return null;
  };

  const handleSaveToLibrary = async () => {
    const dataUrl = await captureChartAsDataUrl();
    if (!dataUrl) {
      // best-effort user feedback
      window.alert("Unable to capture chart image: no SVG or canvas found.");
      return;
    }

    const id = `img-${Date.now()}`;
    const title = plotTitle || `${chartType} chart`;

    // Persist to localStorage immediately so the image is available after navigation
    try {
      const raw = localStorage.getItem("dashboardLibraryImages");
      const existing = raw
        ? (JSON.parse(raw) as Array<{
            id: string;
            src: string;
            title?: string;
          }>)
        : [];
      const next = [
        { id, src: dataUrl, title },
        ...existing.filter((i) => i.id !== id),
      ];
      localStorage.setItem("dashboardLibraryImages", JSON.stringify(next));
    } catch (e) {
      console.warn(
        "Failed to persist dashboard library image to localStorage",
        e,
      );
    }

    const ev = new CustomEvent("dashboardLibraryAddImage", {
      detail: { id, src: dataUrl, title },
    });
    window.dispatchEvent(ev);

    // Optional light feedback
    // small visual confirmation
    console.log("Saved chart to library:", id);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden">
      <DataSidebar
        columns={columns}
        selectedValueIndex={selectedValueIndex}
        selectedLabelIndex={selectedLabelIndex}
        onSelect={onSelect}
        valueSort={valueSort}
        labelSort={labelSort}
        onSortChange={onSortChange}
        fileName={fileName ?? null}
        plotTitle={plotTitle}
        setPlotTitle={setPlotTitle}
        xLabel={xLabel}
        setXLabel={setXLabel}
        yLabel={yLabel}
        setYLabel={setYLabel}
        chartType={chartType}
        titleFont={titleFont}
        setTitleFont={setTitleFont}
        yAxisFont={yAxisFont}
        setYAxisFont={setYAxisFont}
        xAxisFont={xAxisFont}
        setXAxisFont={setXAxisFont}
        seriesColor={seriesColor}
        setSeriesColor={setSeriesColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        titleColor={titleColor}
        setTitleColor={setTitleColor}
        xAxisColor={xAxisColor}
        setXAxisColor={setXAxisColor}
        yAxisColor={yAxisColor}
        setYAxisColor={setYAxisColor}
        circlesColor={circlesColor}
        setCirclesColor={setCirclesColor}
        axisStrokeColor={axisStrokeColor}
        setAxisStrokeColor={setAxisStrokeColor}
        circlesFillColor={circlesFillColor}
        setCirclesFillColor={setCirclesFillColor}
      />

      <div className="flex-1 flex items-start justify-center p-8 overflow-auto">
        <div className="w-full max-w-5xl h-full bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Analytics</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToLibrary}
                className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none"
              >
                Save to library
              </button>
            </div>
          </div>

          <div className="h-[calc(100vh-18rem)]">
            {/* inner plot area - allow scrolling if tall */}
            <div
              ref={chartRef}
              className="h-full flex items-center justify-center"
            >
              {chartType === "bar" ? (
                <BarChart
                  labeledData={labeledData}
                  useLabeled
                  plotTitle={plotTitle}
                  xLabel={xLabel}
                  yLabel={yLabel}
                  titleFont={titleFont}
                  yAxisFont={yAxisFont}
                  xAxisFont={xAxisFont}
                  seriesColor={seriesColor}
                  backgroundColor={backgroundColor}
                  titleColor={titleColor}
                  axisStrokeColor={axisStrokeColor}
                  xAxisColor={xAxisColor}
                  yAxisColor={yAxisColor}
                />
              ) : (
                <LinePlot
                  numericData={numericData}
                  labeledData={labeledData}
                  useLabeled={selectedLabelIndex !== null}
                  plotTitle={plotTitle}
                  xLabel={xLabel}
                  yLabel={yLabel}
                  titleFont={titleFont}
                  yAxisFont={yAxisFont}
                  xAxisFont={xAxisFont}
                  seriesColor={seriesColor}
                  backgroundColor={backgroundColor}
                  titleColor={titleColor}
                  circlesColor={circlesColor}
                  axisStrokeColor={axisStrokeColor}
                  circlesFillColor={circlesFillColor}
                  xAxisColor={xAxisColor}
                  yAxisColor={yAxisColor}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
