"use client";

import React from "react";
import { ColorSettings } from "./types";

interface Props extends ColorSettings {
  setSeriesColor: (c: string) => void;
  setBackgroundColor: (c: string) => void;
  // optional: only provided for Line controls
  setCirclesColor?: (c: string) => void;
  setAxisStrokeColor: (c: string) => void;
  // optional fill color for circles specifically for line charts
  circlesFillColor?: string;
  setCirclesFillColor?: (c: string) => void;
}

export default function DesignPanel({
  seriesColor,
  backgroundColor,
  circlesColor,
  axisStrokeColor,
  setSeriesColor,
  setBackgroundColor,
  setCirclesColor,
  setAxisStrokeColor,
  circlesFillColor,
  setCirclesFillColor,
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
          <div className="text-sm font-bold">Design</div>
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
        <div className="space-y-3">
          {/* Plot Background */}
          <div>
            <div className="text-sm font-medium mb-1">Plot Background</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-10 h-8 p-0 border rounded"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
          </div>

          {/* Plot Line */}
          <div>
            <div className="text-sm font-medium mb-1">Plot Line</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-10 h-8 p-0 border rounded"
                value={seriesColor}
                onChange={(e) => setSeriesColor(e.target.value)}
              />
            </div>
          </div>

          {/* Plot Circles */}
          {typeof setCirclesColor === "function" && (
            <div>
              <div className="text-sm font-medium mb-1">Plot Circles</div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-10 h-8 p-0 border rounded"
                  value={circlesColor ?? "#111827"}
                  onChange={(e) => setCirclesColor(e.target.value)}
                />
                {/* optional fill color control for circles (line chart only) */}
                {typeof setCirclesFillColor === "function" && (
                  <input
                    type="color"
                    className="w-10 h-8 p-0 border rounded"
                    value={circlesFillColor ?? "#ffffff"}
                    onChange={(e) => setCirclesFillColor(e.target.value)}
                    title="Plot circles fill"
                  />
                )}
              </div>
            </div>
          )}

          {/* Plot Axis - affects axis stroke only (not labels) */}
          <div>
            <div className="text-sm font-medium mb-1">Plot Axis</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-10 h-8 p-0 border rounded"
                value={axisStrokeColor}
                onChange={(e) => setAxisStrokeColor(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
