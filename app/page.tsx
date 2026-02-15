"use client";

import { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import Sidebar from "./components/Analytics/SideBar";
import DashboardPage from "./components/pages/DashboardPage";
import DataTablePage from "./components/pages/DataTablePage";
import AnalyticsPage from "./components/pages/AnalyticsPage";

type ChartType = "line" | "bar";

export type MenuOption = "Dashboard" | "Data Table" | "Analytics";

type Column = {
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

declare global {
  interface Window {
    __latestExcelData?: Column[];
    __latestExcelFileName?: string | null;
  }
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>("Dashboard");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedValueIndex, setSelectedValueIndex] = useState<number | null>(
    null,
  );
  const [selectedLabelIndex, setSelectedLabelIndex] = useState<number | null>(
    null,
  );
  const [valueSort, setValueSort] = useState<"none" | "asc" | "desc">("none");
  const [labelSort, setLabelSort] = useState<"none" | "asc" | "desc">("none");
  const [plotTitle, setPlotTitle] = useState<string>("Line Plot");
  const [xLabel, setXLabel] = useState<string>("X");
  const [yLabel, setYLabel] = useState<string>("Y");
  const [activeFileName, setActiveFileName] = useState<string | null>(null);

  // persistent font style settings (persist for duration of app runtime)
  const [titleFont, setTitleFont] = useState<FontSettings>({
    size: 24,
    bold: true,
    italic: false,
    underline: false,
    family: "system-ui",
  });
  const [yAxisFont, setYAxisFont] = useState<FontSettings>({
    size: 16,
    bold: false,
    italic: false,
    underline: false,
    family: "system-ui",
  });
  const [xAxisFont, setXAxisFont] = useState<FontSettings>({
    size: 14,
    bold: false,
    italic: false,
    underline: false,
    family: "system-ui",
  });

  // persistent color settings
  const [seriesColor, setSeriesColor] = useState<string>("#111827");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [titleColor, setTitleColor] = useState<string>("#111827");
  const [xAxisColor, setXAxisColor] = useState<string>("#374151");
  const [yAxisColor, setYAxisColor] = useState<string>("#374151");
  // additional design controls
  const [circlesColor, setCirclesColor] = useState<string>("#111827");
  const [axisStrokeColor, setAxisStrokeColor] = useState<string>("#374151");
  const [circlesFillColor, setCirclesFillColor] = useState<string>("#ffffff");

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{
        labeledData?: Column[];
        fileName?: string;
      }>;
      const result = custom?.detail;
      if (!result) return;

      const labeledData: Column[] = Array.isArray(result.labeledData)
        ? (result.labeledData as Column[])
        : [];

      setColumns(labeledData || []);
      setSelectedValueIndex(null);
      setSelectedLabelIndex(null);
      // expose latest data globally so other pages (DataTable) can read it
      try {
        window.__latestExcelData = labeledData || [];
        window.__latestExcelFileName = result.fileName ?? null;
      } catch (e) {
        void e;
      }
      if (result.fileName) setActiveFileName(result.fileName);
    };
    window.addEventListener("excelUploaded", handler as EventListener);
    // navigate to Data Table when user selects a history item
    const navHandler = () => setActiveMenu("Data Table");
    window.addEventListener("navigateToDataTable", navHandler as EventListener);
    return () => {
      window.removeEventListener("excelUploaded", handler as EventListener);
      window.removeEventListener(
        "navigateToDataTable",
        navHandler as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ type: ChartType }>;
      if (custom.detail && custom.detail.type) setChartType(custom.detail.type);
    };
    window.addEventListener("chartTypeSelected", handler as EventListener);
    return () =>
      window.removeEventListener("chartTypeSelected", handler as EventListener);
  }, []);

  const handleSelect = (
    valueIndex: number | null,
    labelIndex: number | null,
  ) => {
    setSelectedValueIndex(valueIndex);
    setSelectedLabelIndex(labelIndex);
    if (valueIndex !== null && columns[valueIndex]) {
      if (yLabel === "Y" || yLabel === "") {
        setYLabel(columns[valueIndex].label);
      }
    }
    if (labelIndex !== null && columns[labelIndex]) {
      if (xLabel === "X" || xLabel === "") {
        setXLabel(columns[labelIndex].label);
      }
    }
  };

  const handleSortChange = (
    kind: "value" | "label",
    order: "none" | "asc" | "desc",
  ) => {
    if (kind === "value") setValueSort(order);
    else setLabelSort(order);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopNav
        activeMenu={activeMenu}
        setActiveMenu={(menu) => setActiveMenu(menu)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 flex ${activeMenu === "Analytics" ? "min-h-0" : "justify-center items-center p-8"}`}
        >
          {activeMenu === "Dashboard" && <DashboardPage />}
          {activeMenu === "Data Table" && <DataTablePage />}
          {activeMenu === "Analytics" && (
            <AnalyticsPage
              columns={columns}
              selectedValueIndex={selectedValueIndex}
              selectedLabelIndex={selectedLabelIndex}
              onSelect={handleSelect}
              valueSort={valueSort}
              labelSort={labelSort}
              onSortChange={handleSortChange}
              fileName={activeFileName ?? null}
              plotTitle={plotTitle}
              setPlotTitle={setPlotTitle}
              xLabel={xLabel}
              setXLabel={setXLabel}
              yLabel={yLabel}
              setYLabel={setYLabel}
              chartType={chartType}
              titleFont={titleFont}
              setTitleFont={(v) => setTitleFont(v)}
              yAxisFont={yAxisFont}
              setYAxisFont={(v) => setYAxisFont(v)}
              xAxisFont={xAxisFont}
              setXAxisFont={(v) => setXAxisFont(v)}
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
          )}
        </div>
        {/* Show Sidebar only on Analytics page */}
        {activeMenu === "Analytics" && (
          <Sidebar activeMenu={activeMenu} activeChart={chartType} />
        )}
      </div>
    </div>
  );
}
