"use client";

import DataTable from "../DataTable/DataTable";

export default function DataTablePage() {
  return (
    <div className="w-full max-w-5xl h-full bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold mb-4">Data Table</h1>
      <div className="mt-4">
        <DataTable />
      </div>
    </div>
  );
}
