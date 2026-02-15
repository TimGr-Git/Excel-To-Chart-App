"use client";

import React, { useEffect, useMemo, useState } from "react";

type Column = {
  label: string;
  values: Array<number | string | null>;
  valueType: "number" | "string" | "date" | "empty" | "mixed";
};

export default function DataTable() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    // Try to read the currently selected Excel data exposed by the main page
    const win = window as unknown as {
      __latestExcelData?: Column[];
      __latestExcelFileName?: string | null;
    };
    if (
      Array.isArray(win.__latestExcelData) &&
      win.__latestExcelData.length > 0
    ) {
      // defer to avoid synchronous state updates inside effect
      setTimeout(() => {
        setColumns(win.__latestExcelData ?? []);
        setFileName(win.__latestExcelFileName ?? null);
      }, 0);
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent<{
        labeledData: Column[];
        fileName?: string;
      }>;
      const data = custom.detail;
      setColumns(data.labeledData || []);
      setFileName(data.fileName ?? null);
    };

    window.addEventListener("excelUploaded", handler as EventListener);
    return () =>
      window.removeEventListener("excelUploaded", handler as EventListener);
  }, []);

  const rowCount = useMemo(() => {
    if (!columns || columns.length === 0) return 0;
    return Math.max(...columns.map((c) => (c.values ? c.values.length : 0)), 0);
  }, [columns]);

  // UI state for global search and column sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState<{
    colIndex: number | null;
    direction: "asc" | "desc" | null;
  }>({ colIndex: null, direction: null });

  // helper to normalize cell value for comparison/search
  const cellToComparable = (col: Column, raw: unknown) => {
    if (raw === null || raw === undefined) return "";
    if (col.valueType === "number") {
      const n = Number(String(raw ?? ""));
      return isNaN(n) ? 0 : n;
    }
    if (col.valueType === "date") {
      const d = typeof raw === "number" ? new Date(raw) : new Date(String(raw));
      return isNaN(d.getTime()) ? "" : d.getTime();
    }
    return String(raw as unknown).toLowerCase();
  };

  // compute filtered row indices based on search query
  const filteredRowIndices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const total = rowCount;
    if (!q) return Array.from({ length: total }, (_, i) => i);
    const result: number[] = [];
    for (let i = 0; i < total; i++) {
      let matched = false;
      for (let ci = 0; ci < columns.length; ci++) {
        const val = columns[ci].values?.[i];
        const s = String(val ?? "").toLowerCase();
        if (s.includes(q)) {
          matched = true;
          break;
        }
      }
      if (matched) result.push(i);
    }
    return result;
  }, [searchQuery, columns, rowCount]);

  // compute visible (sorted) row indices
  const visibleRowIndices = useMemo(() => {
    const indices = filteredRowIndices.slice();
    if (sortState.colIndex === null || sortState.direction === null)
      return indices;
    const ci = sortState.colIndex;
    const dir = sortState.direction === "asc" ? 1 : -1;
    const col = columns[ci];
    indices.sort((a, b) => {
      const va = cellToComparable(col, col.values?.[a]);
      const vb = cellToComparable(col, col.values?.[b]);
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * dir;
      if (va === vb) return 0;
      return va > vb ? dir : -dir;
    });
    return indices;
  }, [filteredRowIndices, sortState, columns]);

  const formatCell = (col: Column, raw: unknown) => {
    if (raw === null || raw === undefined) return "";
    if (col.valueType === "date") {
      // try to parse as date
      const d = typeof raw === "number" ? new Date(raw) : new Date(String(raw));
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    return String(raw as unknown);
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {fileName ? fileName : "Data Table"}
          </h2>
          <div>
            {columns.length === 0 ? (
              <p className="text-sm text-gray-500">
                Upload an Excel file to view its data here.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {columns.length} columns • {filteredRowIndices.length} /{" "}
                {rowCount} rows
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="search"
            placeholder="Search table"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm px-2 py-1 border rounded bg-white"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setSortState({ colIndex: null, direction: null });
            }}
            className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border"
            aria-label="Reset search and sorting"
          >
            Reset
          </button>
        </div>
      </div>

      {columns.length === 0 ? (
        <div className="w-full h-64 flex items-center justify-center rounded border border-dashed border-gray-300">
          <p className="text-gray-500">
            No data — please upload an .xlsx/.xls file
          </p>
        </div>
      ) : (
        <div className="border rounded shadow-sm">
          <div className="overflow-auto max-h-[67vh]">
            <table className="min-w-full border-collapse table-auto w-full">
              <thead>
                <tr>
                  {columns.map((col, ci) => (
                    <th
                      key={ci}
                      className="sticky top-0 bg-white border-b px-2 py-2 text-left text-sm font-bold text-gray-700"
                      style={{ zIndex: 10 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {col.label}
                        </div>
                        <div className="flex flex-col ml-2">
                          <button
                            onClick={() =>
                              setSortState({ colIndex: ci, direction: "asc" })
                            }
                            className={`text-xs leading-3 ${sortState.colIndex === ci && sortState.direction === "asc" ? "text-blue-600" : "text-gray-400"}`}
                            aria-label={`Sort ${col.label} ascending`}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() =>
                              setSortState({ colIndex: ci, direction: "desc" })
                            }
                            className={`text-xs leading-3 ${sortState.colIndex === ci && sortState.direction === "desc" ? "text-blue-600" : "text-gray-400"}`}
                            aria-label={`Sort ${col.label} descending`}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRowIndices.map((rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {columns.map((col, ci) => (
                      <td
                        key={ci}
                        className="border-b px-2 py-2 align-top text-sm text-gray-800"
                      >
                        {formatCell(col, col.values?.[rowIndex])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
