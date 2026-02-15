"use client";

import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

type NumericData = number[];
type LabeledData = { label: string; value: number }[];

type Props = {
  numericData: NumericData;
  labeledData: LabeledData;
  useLabeled?: boolean;
  plotTitle?: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  titleFont?: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  xAxisFont?: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  yAxisFont?: {
    size: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    family: string;
  };
  seriesColor?: string;
  backgroundColor?: string;
  titleColor?: string;
  xAxisColor?: string;
  yAxisColor?: string;
  circlesColor?: string;
  circlesFillColor?: string; // new optional fill color for circle interiors
  axisStrokeColor?: string;
};

export default function LinePlot({
  numericData,
  labeledData,
  useLabeled = false,
  plotTitle = "",
  xLabel = "",
  yLabel = "",
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40,
  titleFont,
  xAxisFont,
  yAxisFont,
  seriesColor = "#111827",
  backgroundColor = "#ffffff",
  titleColor = "#111827",
  xAxisColor = "#374151",
  yAxisColor = "#374151",
  circlesColor = "#111827",
  circlesFillColor = "#ffffff", // default fill for circles is white unless provided
  axisStrokeColor = "#374151",
}: Props) {
  const isNumeric = !useLabeled;

  // responsive size
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({
    w: width,
    h: height,
  });

  // axis group refs (needed by d3 to render axes)
  const gx = useRef<SVGGElement | null>(null);
  const gy = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(100, Math.floor(rect.width));
      const h = Math.max(80, Math.floor(rect.height));
      setSize({ w, h });
    });
    ro.observe(el);
    // initial
    const rect = el.getBoundingClientRect();
    setSize({
      w: Math.max(100, Math.floor(rect.width)),
      h: Math.max(80, Math.floor(rect.height)),
    });
    return () => ro.disconnect();
  }, []);

  // use measured size for scales
  const vizWidth = size.w;
  const vizHeight = size.h;

  // extra padding to ensure whitespace for titles and axis labels
  // Increase top padding so title has room above it consistent with axis paddings
  const extraPadding = { top: 48, right: 16, bottom: 36, left: 48 };
  const mTop = marginTop + extraPadding.top;
  const mRight = marginRight + extraPadding.right;
  const mBottom = marginBottom + extraPadding.bottom;
  const mLeft = marginLeft + extraPadding.left;

  // ------------------------
  // X scale
  // ------------------------
  const x = isNumeric
    ? d3
        .scaleLinear()
        .domain([0, numericData.length - 1])
        .range([mLeft, vizWidth - mRight])
    : d3
        .scalePoint()
        .domain(Array.from(new Set(labeledData.map((d) => d.label))))
        .padding(0.5)
        .range([mLeft, vizWidth - mRight]);

  // create a render key so React remounts the line+points when data/mode changes
  const renderKey = isNumeric
    ? `numeric-${numericData.length}-${numericData.join("|")}`
    : `labeled-${labeledData.length}-${labeledData.map((d) => d.label).join("|")}-${labeledData.map((d) => d.value).join("|")}`;

  // ------------------------
  // Y scale
  // ------------------------
  const y = isNumeric
    ? d3
        .scaleLinear()
        .domain(d3.extent(numericData) as [number, number])
        .range([vizHeight - mBottom, mTop])
    : d3
        .scaleLinear()
        .domain(d3.extent(labeledData, (d) => d.value) as [number, number])
        .range([vizHeight - mBottom, mTop]);

  // ------------------------
  // Helper to generate line
  // ------------------------
  const getLinePath = () => {
    if (isNumeric) {
      return d3
        .line<number>()
        .x((_, i) => (x as d3.ScaleLinear<number, number>)(i))
        .y((d) => y(d))(numericData);
    } else {
      return d3
        .line<{ label: string; value: number }>()
        .x((d) => (x as d3.ScalePoint<string>)(d.label)!)
        .y((d) => y(d.value))(labeledData);
    }
  };

  // ------------------------
  // Draw axes
  // ------------------------
  useEffect(() => {
    if (!gx.current || !gy.current) return;

    d3.select(gx.current).call(
      isNumeric
        ? d3.axisBottom(x as d3.ScaleLinear<number, number>)
        : d3.axisBottom(x as d3.ScalePoint<string>),
    );
    // recolor axis lines, tick marks and tick label text using axisStrokeColor
    d3.select(gx.current)
      .selectAll("path, line, .tick line")
      .attr("stroke", axisStrokeColor);
    d3.select(gx.current).selectAll(".tick text").attr("fill", axisStrokeColor);

    d3.select(gy.current).call(d3.axisLeft(y));
    d3.select(gy.current)
      .selectAll("path, line, .tick line")
      .attr("stroke", axisStrokeColor);
    d3.select(gy.current).selectAll(".tick text").attr("fill", axisStrokeColor);
  }, [
    x,
    y,
    isNumeric,
    vizWidth,
    vizHeight,
    xAxisColor,
    yAxisColor,
    axisStrokeColor,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full p-4">
      {/* ------------------------ */}
      {/* SVG Chart */}
      {/* ------------------------ */}
      <svg
        width={vizWidth}
        height={vizHeight}
        viewBox={`0 0 ${vizWidth} ${vizHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={plotTitle || "line chart"}
      >
        {/* background */}
        <rect
          x={0}
          y={0}
          width={vizWidth}
          height={vizHeight}
          fill={backgroundColor}
        />
        {/* Title */}
        {plotTitle ? (
          <text
            x={vizWidth / 2}
            y={Math.max(16, mTop / 2)}
            textAnchor="middle"
            fill={titleColor ?? "#111827"}
            style={{
              fontSize: titleFont?.size ?? 24,
              fontWeight: titleFont?.bold ? 700 : 600,
              fontStyle: titleFont?.italic ? "italic" : "normal",
              textDecoration: titleFont?.underline ? "underline" : "none",
              fontFamily: titleFont?.family ?? undefined,
            }}
          >
            {plotTitle}
          </text>
        ) : null}

        {/* X Axis */}
        <g ref={gx} transform={`translate(0,${vizHeight - mBottom})`} />

        {/* Y Axis */}
        <g ref={gy} transform={`translate(${mLeft},0)`} />

        {/* X Axis Label */}
        {xLabel ? (
          <text
            x={(marginLeft + (vizWidth - marginRight)) / 2}
            y={vizHeight - Math.max(12, mBottom / 2) + 12}
            textAnchor="middle"
            fill={xAxisColor}
            style={{
              fontSize: xAxisFont?.size ?? 16,
              fontWeight: xAxisFont?.bold ? 700 : 400,
              fontStyle: xAxisFont?.italic ? "italic" : "normal",
              textDecoration: xAxisFont?.underline ? "underline" : "none",
              fontFamily: xAxisFont?.family ?? undefined,
            }}
          >
            {xLabel}
          </text>
        ) : null}

        {/* Y Axis Label */}
        {yLabel ? (
          <text
            transform={`translate(${mLeft - 56}, ${vizHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            fill={yAxisColor}
            style={{
              fontSize: yAxisFont?.size ?? 18,
              fontWeight: yAxisFont?.bold ? 700 : 400,
              fontStyle: yAxisFont?.italic ? "italic" : "normal",
              textDecoration: yAxisFont?.underline ? "underline" : "none",
              fontFamily: yAxisFont?.family ?? undefined,
            }}
          >
            {yLabel}
          </text>
        ) : null}

        {/* Line */}
        <path
          key={`line-${renderKey}`}
          fill="none"
          stroke={seriesColor}
          strokeWidth={1.5}
          d={getLinePath() ?? ""}
        />

        {/* Circles */}
        <g key={`points-${renderKey}`} stroke="currentColor" strokeWidth={1.5}>
          {isNumeric
            ? numericData.map((d, i) => (
                <circle
                  key={i}
                  cx={(x as d3.ScaleLinear<number, number>)(i)}
                  cy={y(d)}
                  r={3}
                  stroke={circlesColor}
                  fill={circlesFillColor}
                />
              ))
            : labeledData.map((d, i) => (
                <circle
                  key={`${d.label}-${i}`}
                  cx={(x as d3.ScalePoint<string>)(d.label)!}
                  cy={y(d.value)}
                  r={3}
                  stroke={circlesColor}
                  fill={circlesFillColor}
                />
              ))}
        </g>
      </svg>
    </div>
  );
}
