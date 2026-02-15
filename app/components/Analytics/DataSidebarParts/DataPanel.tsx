"use client";

import React from "react";
import { Column, SortOrder } from "./types";

interface Props {
  columns: Column[];
  selectedValueIndex: number | null;
  selectedLabelIndex: number | null;
  onSelect: (valueIndex: number | null, labelIndex: number | null) => void;
  valueSort: SortOrder;
  labelSort: SortOrder;
  onSortChange: (kind: "value" | "label", order: SortOrder) => void;
}

export default function DataPanel({
  columns = [],
  selectedValueIndex,
  selectedLabelIndex,
  onSelect,
  valueSort,
  labelSort,
  onSortChange,
}: Props) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const numericOptions = safeColumns
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.valueType === "number");

  const labelOptions = safeColumns
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.valueType === "string" || c.valueType === "date");

  const [open, setOpen] = React.useState(false);

  const handleValueSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SortOrder;
    onSortChange("value", val);
  };

  const handleLabelSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SortOrder;
    onSortChange("label", val);
  };

  return (
    <div className="mb-4">
      <div className="mb-2 border-t border-gray-300 pt-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="w-full text-left flex items-center justify-between"
        >
          <div className="text-sm font-bold">Data</div>
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
          <label className="block text-sm text-gray-600 mb-1">Values</label>
          <select
            className="w-full border rounded px-2 py-1 mb-2"
            value={selectedValueIndex ?? ""}
            onChange={(e) =>
              onSelect(
                e.target.value === "" ? null : Number(e.target.value),
                selectedLabelIndex,
              )
            }
          >
            <option value="">Select option</option>
            {numericOptions.map(({ c, i }) => (
              <option key={i} value={i}>
                {c.label}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-600 mb-1">Sort values:</div>
          <select
            className="w-full border rounded px-2 py-1 mb-3"
            value={valueSort}
            onChange={handleValueSortChange}
          >
            <option value="none">None</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <label className="block text-sm text-gray-600 mb-1">Labels</label>
          <select
            className="w-full border rounded px-2 py-1 mb-2"
            value={selectedLabelIndex ?? ""}
            onChange={(e) =>
              onSelect(
                selectedValueIndex,
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          >
            <option value="">Select option</option>
            {labelOptions.map(({ c, i }) => (
              <option key={i} value={i}>
                {c.label}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-600 mb-1">Sort labels:</div>
          <select
            className="w-full border rounded px-2 py-1"
            value={labelSort}
            onChange={handleLabelSortChange}
          >
            <option value="none">None</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </>
      )}
    </div>
  );
}
