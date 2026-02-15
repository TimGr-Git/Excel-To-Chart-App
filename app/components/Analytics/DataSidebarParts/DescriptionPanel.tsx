"use client";

import React from "react";
import { FontSettings } from "./types";

interface Props {
  chartType?: "line" | "bar";
  plotTitle: string;
  setPlotTitle: (s: string) => void;
  titleFont: FontSettings;
  setTitleFont: (f: FontSettings) => void;
  yLabel: string;
  setYLabel: (s: string) => void;
  xLabel: string;
  setXLabel: (s: string) => void;
  yAxisFont: FontSettings;
  setYAxisFont: (f: FontSettings) => void;
  xAxisFont: FontSettings;
  setXAxisFont: (f: FontSettings) => void;
  titleColor: string;
  setTitleColor: (c: string) => void;
  xAxisColor: string;
  setXAxisColor: (c: string) => void;
  yAxisColor: string;
  setYAxisColor: (c: string) => void;
}

export default function DescriptionPanel({
  chartType = "line",
  plotTitle,
  setPlotTitle,
  titleFont,
  setTitleFont,
  yLabel,
  setYLabel,
  xLabel,
  setXLabel,
  yAxisFont,
  setYAxisFont,
  xAxisFont,
  setXAxisFont,
  titleColor,
  setTitleColor,
  xAxisColor,
  setXAxisColor,
  yAxisColor,
  setYAxisColor,
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="mb-4">
      <div className="mb-2 border-t border-gray-300 pt-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="w-full text-left flex items-center justify-between"
        >
          <div className="text-sm font-bold">Description</div>
          <svg
            className={`w-4 h-4 transform ${open ? "rotate-90" : "rotate-0"}`}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 4L14 10L6 16V4Z" fill="#374151" />
          </svg>
        </button>
      </div>
      {open && (
        <>
          <label className="block text-sm text-gray-600 mb-1">
            {chartType === "bar" ? "Bar Chart Title" : "Line Plot Title"}
          </label>
          <input
            className="w-full border rounded px-2 py-1 mb-3"
            value={plotTitle}
            onChange={(e) => setPlotTitle(e.target.value)}
            onBlur={(e) => setPlotTitle(e.target.value)}
            placeholder={chartType === "bar" ? "Bar Chart" : "Line Plot"}
          />

          {/* Title font customization controls */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select
              className="border rounded px-2 py-1"
              value={titleFont.family}
              onChange={(e) =>
                setTitleFont({ ...titleFont, family: e.target.value })
              }
            >
              <option value="system-ui">System</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Courier New, monospace">Monospace</option>
              <option value="cursive">Cursive</option>
            </select>

            <select
              className="border rounded px-2 py-1"
              value={titleFont.size}
              onChange={(e) =>
                setTitleFont({ ...titleFont, size: Number(e.target.value) })
              }
            >
              {[12, 14, 16, 18, 20, 24, 28].map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`px-2 py-1 border rounded ${titleFont.bold ? "bg-gray-800 text-white" : ""}`}
              title="Bold"
              onClick={() =>
                setTitleFont({ ...titleFont, bold: !titleFont.bold })
              }
            >
              B
            </button>
            <button
              type="button"
              className={`px-2 py-1 border rounded ${titleFont.italic ? "bg-gray-800 text-white italic" : ""}`}
              title="Italic"
              onClick={() =>
                setTitleFont({ ...titleFont, italic: !titleFont.italic })
              }
            >
              I
            </button>
            <button
              type="button"
              className={`px-2 py-1 border rounded ${titleFont.underline ? "bg-gray-800 text-white" : ""}`}
              title="Underline"
              onClick={() =>
                setTitleFont({ ...titleFont, underline: !titleFont.underline })
              }
            >
              U
            </button>
            {/* Title color picker (swatch only) */}
            <input
              type="color"
              className="w-10 h-8 p-0 border rounded"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              title="Title color"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">
              {chartType === "bar"
                ? "Bar Chart Y-Axis Label"
                : "Line Plot Y-Axis Label"}
            </label>
            <input
              className="w-full border rounded px-2 py-1 mb-2"
              value={yLabel}
              onChange={(e) => setYLabel(e.target.value)}
              onBlur={(e) => setYLabel(e.target.value)}
              placeholder="Y axis label"
            />

            {/* Y axis font customization */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <select
                className="border rounded px-2 py-1"
                value={yAxisFont.family}
                onChange={(e) =>
                  setYAxisFont({ ...yAxisFont, family: e.target.value })
                }
              >
                <option value="system-ui">System</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Courier New, monospace">Monospace</option>
              </select>
              <select
                className="border rounded px-2 py-1"
                value={yAxisFont.size}
                onChange={(e) =>
                  setYAxisFont({ ...yAxisFont, size: Number(e.target.value) })
                }
              >
                {[10, 12, 14, 16, 18].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`px-2 py-1 border rounded ${yAxisFont.bold ? "bg-gray-800 text-white" : ""}`}
                title="Bold"
                onClick={() =>
                  setYAxisFont({ ...yAxisFont, bold: !yAxisFont.bold })
                }
              >
                B
              </button>
              <button
                type="button"
                className={`px-2 py-1 border rounded ${yAxisFont.italic ? "bg-gray-800 text-white italic" : ""}`}
                title="Italic"
                onClick={() =>
                  setYAxisFont({ ...yAxisFont, italic: !yAxisFont.italic })
                }
              >
                I
              </button>
              <button
                type="button"
                className={`px-2 py-1 border rounded ${yAxisFont.underline ? "bg-gray-800 text-white" : ""}`}
                title="Underline"
                onClick={() =>
                  setYAxisFont({
                    ...yAxisFont,
                    underline: !yAxisFont.underline,
                  })
                }
              >
                U
              </button>
            </div>

            {/* Y axis color picker (swatch only) */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="color"
                className="w-10 h-8 p-0 border rounded"
                value={yAxisColor}
                onChange={(e) => setYAxisColor(e.target.value)}
              />
            </div>

            <label className="block text-sm text-gray-600 mb-1">
              {chartType === "bar"
                ? "Bar Chart X-Axis Label"
                : "Line Plot X-Axis Label"}
            </label>
            <input
              className="w-full border rounded px-2 py-1 mb-2"
              value={xLabel}
              onChange={(e) => setXLabel(e.target.value)}
              onBlur={(e) => setXLabel(e.target.value)}
              placeholder="X axis label"
            />

            {/* X axis font customization */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="border rounded px-2 py-1"
                value={xAxisFont.family}
                onChange={(e) =>
                  setXAxisFont({ ...xAxisFont, family: e.target.value })
                }
              >
                <option value="system-ui">System</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Courier New, monospace">Monospace</option>
              </select>
              <select
                className="border rounded px-2 py-1"
                value={xAxisFont.size}
                onChange={(e) =>
                  setXAxisFont({ ...xAxisFont, size: Number(e.target.value) })
                }
              >
                {[10, 12, 14, 16, 18].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`px-2 py-1 border rounded ${xAxisFont.bold ? "bg-gray-800 text-white" : ""}`}
                title="Bold"
                onClick={() =>
                  setXAxisFont({ ...xAxisFont, bold: !xAxisFont.bold })
                }
              >
                B
              </button>
              <button
                type="button"
                className={`px-2 py-1 border rounded ${xAxisFont.italic ? "bg-gray-800 text-white italic" : ""}`}
                title="Italic"
                onClick={() =>
                  setXAxisFont({ ...xAxisFont, italic: !xAxisFont.italic })
                }
              >
                I
              </button>
              <button
                type="button"
                className={`px-2 py-1 border rounded ${xAxisFont.underline ? "bg-gray-800 text-white" : ""}`}
                title="Underline"
                onClick={() =>
                  setXAxisFont({
                    ...xAxisFont,
                    underline: !xAxisFont.underline,
                  })
                }
              >
                U
              </button>
            </div>

            {/* X axis color picker (swatch only) */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                className="w-10 h-8 p-0 border rounded"
                value={xAxisColor}
                onChange={(e) => setXAxisColor(e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
