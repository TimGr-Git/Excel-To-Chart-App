"use client";

import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

type LabeledData = { label: string; value: number }[];

type Props = {
  labeledData: LabeledData;
  numericData?: number[];
  useLabeled?: boolean;
  plotTitle?: string;
  xLabel?: string;
  yLabel?: string;
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
  axisStrokeColor?: string;
};

export default function BarChart({
  labeledData,
  numericData = [],
  useLabeled = true,
  plotTitle = "",
  xLabel = "",
  yLabel = "",
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
  axisStrokeColor = "#374151",
  xAxisColor = "#374151",
  yAxisColor = "#374151",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 640, h: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({
        w: Math.max(100, Math.floor(rect.width)),
        h: Math.max(80, Math.floor(rect.height)),
      });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setSize({
      w: Math.max(100, Math.floor(rect.width)),
      h: Math.max(80, Math.floor(rect.height)),
    });
    return () => ro.disconnect();
  }, []);

  const vizWidth = size.w;
  const vizHeight = size.h;

  const extraPadding = { top: 24, right: 16, bottom: 36, left: 48 };
  const mTop = marginTop + extraPadding.top;
  const mRight = marginRight + extraPadding.right;
  const mBottom = marginBottom + extraPadding.bottom;
  const mLeft = marginLeft + extraPadding.left;

  const data = useLabeled
    ? labeledData
    : numericData.map((v, i) => ({ label: String(i + 1), value: v }));

  const x: d3.ScaleBand<string> = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([mLeft, vizWidth - mRight])
    .padding(0.1);

  const y: d3.ScaleLinear<number, number> = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value) ?? 0])
    .nice()
    .range([vizHeight - mBottom, mTop]);

  useEffect(() => {
    if (!containerRef.current) return;
    const svg = d3.select(containerRef.current).select("svg");
    svg.selectAll("g.axis").remove();

    svg
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vizHeight - mBottom})`)
      .call(d3.axisBottom(x));
    // color axis stroke lines, tick marks and tick label text
    svg
      .selectAll(".x-axis path, .x-axis line, .x-axis .tick line")
      .attr("stroke", axisStrokeColor);
    svg.selectAll(".x-axis .tick text").attr("fill", axisStrokeColor);
    // axis label title text remains controlled by xAxisColor elsewhere

    svg
      .append("g")
      .attr("class", "axis y-axis")
      .attr("transform", `translate(${mLeft},0)`)
      .call(d3.axisLeft(y));
    svg
      .selectAll(".y-axis path, .y-axis line, .y-axis .tick line")
      .attr("stroke", axisStrokeColor);
    svg.selectAll(".y-axis .tick text").attr("fill", axisStrokeColor);
    // axis label title text remains controlled by yAxisColor elsewhere

    const bars = svg
      .selectAll<SVGRectElement, { label: string; value: number }>("rect.bar")
      .data(data, (d) => d.label);

    bars.join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "bar")
          .attr("fill", seriesColor)
          .attr("x", (d) => x(d.label) ?? 0)
          .attr("y", (d) => y(d.value))
          .attr("width", () => x.bandwidth())
          .attr("height", (d) => vizHeight - mBottom - y(d.value)),
      (update) =>
        update
          .attr("x", (d) => x(d.label) ?? 0)
          .attr("y", (d) => y(d.value))
          .attr("width", () => x.bandwidth())
          .attr("height", (d) => vizHeight - mBottom - y(d.value))
          .attr("fill", seriesColor),
      (exit) => exit.remove(),
    );
  }, [
    data,
    vizWidth,
    vizHeight,
    marginBottom,
    marginLeft,
    x,
    y,
    mBottom,
    mLeft,
    seriesColor,
    xAxisColor,
    yAxisColor,
    backgroundColor,
    axisStrokeColor,
    titleFont,
    yAxisFont,
    xAxisFont,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full p-4">
      <svg
        width={vizWidth}
        height={vizHeight}
        viewBox={`0 0 ${vizWidth} ${vizHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={0}
          y={0}
          width={vizWidth}
          height={vizHeight}
          fill={backgroundColor}
        />
        {plotTitle ? (
          <text
            x={vizWidth / 2}
            y={Math.max(16, mTop / 2)}
            textAnchor="middle"
            fill={titleColor}
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
        {xLabel ? (
          <text
            x={(mLeft + (vizWidth - mRight)) / 2}
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
      </svg>
    </div>
  );
}
