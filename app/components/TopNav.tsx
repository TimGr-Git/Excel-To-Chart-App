"use client";

import React, { useRef, useState } from "react";

type MenuOption = "Dashboard" | "Data Table" | "Analytics";

interface Props {
  activeMenu: MenuOption;
  setActiveMenu: (menu: MenuOption) => void;
}

export default function TopNav({ activeMenu, setActiveMenu }: Props) {
  const menuItems: MenuOption[] = ["Dashboard", "Data Table", "Analytics"];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert(data?.error || "Upload failed");
      } else {
        window.dispatchEvent(
          new CustomEvent("excelUploaded", { detail: data }),
        );
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <nav className="h-14 bg-gray-900 text-white flex items-center px-6 shadow-md">
      <div className="flex items-center justify-between w-full">
        <div className="flex space-x-6 text-sm font-medium">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`hover:text-gray-300 transition ${
                activeMenu === item ? "text-blue-400" : ""
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={handleUploadClick}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm px-3 py-1 rounded"
          >
            {loading ? "Uploading..." : "Upload Excel"}
          </button>
        </div>
      </div>
    </nav>
  );
}
