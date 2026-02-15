"use client";

import React from "react";

export default function FilterPanel() {
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
          <div className="text-sm font-bold">Filter</div>
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
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Filter expression
          </label>
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            placeholder="e.g. Price > 10"
          />
          <label className="block text-sm text-gray-600 mb-1">
            Quick filter
          </label>
          <select className="w-full border rounded px-2 py-1">
            <option value="">None</option>
            <option value="top10">Top 10</option>
            <option value="nonzero">Non-zero</option>
          </select>
        </div>
      )}
    </div>
  );
}
