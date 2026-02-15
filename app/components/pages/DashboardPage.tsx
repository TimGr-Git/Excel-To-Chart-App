"use client";

import DashboardUploads from "../Dashboard/DashboardUploads";
import DashboarLibrary from "../Dashboard/DashboarLibrary";

export default function DashboardPage() {
  return (
    <div className="w-full max-w-5xl h-full bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <h2 className="text-xl font-semibold mb-2">Get Started</h2>
      <p className="text-sm text-gray-600 mb-4">
        Start with uploading an excel file or continue working on a previous
        sheet
      </p>
      <DashboardUploads />
      <DashboarLibrary />
    </div>
  );
}
