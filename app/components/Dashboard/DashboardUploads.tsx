"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { DeleteIcon, AddIcon } from "../icons";

// Define a shape for the upload API response to avoid `any`.
// Keep labeledData as unknown (or more specific if you can provide it).
type UploadResponse = {
  labeledData: unknown;
  [key: string]: unknown;
};

type StoredUpload = {
  id: string;
  name: string;
  uploadedAt: string;
  data: UploadResponse; // replaced `any` with UploadResponse
};

export default function DashboardUploads() {
  const [history, setHistory] = useState<StoredUpload[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // hide active overlay when user clicks anywhere outside
  React.useEffect(() => {
    const onDocClick = () => setActiveId(null);
    window.addEventListener("click", onDocClick);
    return () => window.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("excelUploads");
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }

    const handler = (e: Event) => {
      const custom = e as CustomEvent<StoredUpload[]>;
      if (custom.detail) setHistory(custom.detail);
    };
    window.addEventListener("excelHistoryUpdated", handler as EventListener);
    return () =>
      window.removeEventListener(
        "excelHistoryUpdated",
        handler as EventListener,
      );
  }, []);

  const saveHistory = (next: StoredUpload[]) => {
    try {
      localStorage.setItem("excelUploads", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
    setHistory(next);
    window.dispatchEvent(
      new CustomEvent("excelHistoryUpdated", { detail: next }),
    );
  };

  const triggerUpload = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result?.error || "Upload failed");
        return;
      }

      // store in history
      const item: StoredUpload = {
        id: String(Date.now()),
        name: file.name,
        uploadedAt: new Date().toISOString(),
        data: result,
      };

      const next = [item, ...history].slice(0, 20);
      saveHistory(next);

      // broadcast parsed data so other components update
      window.dispatchEvent(
        new CustomEvent("excelUploaded", {
          detail: { labeledData: result.labeledData, fileName: file.name },
        }),
      );
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSelectHistory = (item: StoredUpload) => {
    // dispatch stored data
    window.dispatchEvent(
      new CustomEvent("excelUploaded", {
        detail: { labeledData: item.data.labeledData, fileName: item.name },
      }),
    );
    // request navigation to Data Table so user sees the uploaded data
    window.dispatchEvent(new CustomEvent("navigateToDataTable"));
  };

  // track which history item is showing action icons
  const removeFromHistory = (id: string) => {
    const next = history.filter((it) => it.id !== id);
    saveHistory(next);
    // if deleted item was currently selected in the analytics, broadcast a clear
    // (optional) - for now just update history. If UI elsewhere needs to clear
    // selected data, we could dispatch an event here.
    window.dispatchEvent(
      new CustomEvent("excelHistoryUpdated", { detail: next }),
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-3 overflow-x-auto py-4 px-2">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />

        {/* Upload box */}
        <button
          onClick={triggerUpload}
          className="shrink-0 w-28 h-28 border-2 border-dashed border-gray-300 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
        >
          <AddIcon className="w-5 h-5" />
        </button>

        {/* History boxes (click a box to reveal actions: Open / Delete) */}
        {/** activeId holds the id of the history item whose actions are visible */}
        {/* spacer for history boxes (no inline IIFE needed) */}
        {history.map((h) => (
          <div key={h.id} className="relative shrink-0 w-28 h-28 mr-3">
            {/* preview box; clicking toggles the action overlay */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveId((prev) => (prev === h.id ? null : h.id));
              }}
              className="w-full h-full bg-white rounded-lg shadow-sm border flex flex-col items-center justify-center text-sm text-gray-700"
              title={h.name}
            >
              <Image
                src="/file.svg"
                alt="excel"
                width={32}
                height={32}
                className="mb-2"
                unoptimized
              />
              <div className="px-2 text-center truncate w-full">{h.name}</div>
            </button>

            {/* Action overlay: Open (green) and Delete (red) */}
            {activeId === h.id && (
              <div
                className="absolute inset-0 rounded-lg flex items-center justify-center gap-2 z-10"
                // use rgba directly so child elements remain unaffected and opacity works reliably
                style={{ backgroundColor: "rgba(107,114,128,0.4)" }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectHistory(h);
                    setActiveId(null);
                  }}
                  className="w-9 h-9 bg-gray-700 text-green-500 rounded-full flex items-center justify-center hover:bg-gray-600 shadow-sm z-20"
                  title="Open"
                >
                  {/* simple open/arrow SVG colored via currentColor */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(h.id);
                    setActiveId(null);
                  }}
                  className="w-9 h-9 bg-gray-700 text-red-500 rounded-full flex items-center justify-center hover:bg-gray-600 shadow-sm z-20"
                  title="Delete"
                >
                  <DeleteIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
