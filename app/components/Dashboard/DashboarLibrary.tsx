"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { DeleteIcon, EditIcon, DownloadIcon } from "../icons";

type LibraryImage = {
  id: string;
  src: string;
  title?: string;
  alt?: string;
};

export default function DashboarLibrary() {
  // Initialize images from localStorage synchronously (lazy initializer)
  const [images, setImages] = useState<LibraryImage[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem("dashboardLibraryImages");
      if (raw) {
        const parsed = JSON.parse(raw) as LibraryImage[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeImage, setActiveImage] = useState<LibraryImage | null>(null);
  // UI state for editing the active image title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  // confirmation state for deletion
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Ensure next/image can accept data: and blob: URLs by returning the src as-is.
  // Using a passthrough loader with `unoptimized` lets us keep Image while
  // supporting inline data URLs produced by the analytics capture code.
  const passthroughLoader = (props: { src: string }) => props.src;

  // Persist images to localStorage whenever they change, but skip initial mount
  const _didMount = useRef(false);
  React.useEffect(() => {
    if (!_didMount.current) {
      _didMount.current = true;
      return;
    }
    try {
      localStorage.setItem("dashboardLibraryImages", JSON.stringify(images));
      console.debug("DashboarLibrary: persisted images count=", images.length);
    } catch (e) {
      console.warn("Failed to persist dashboard library to localStorage", e);
    }
  }, [images]);

  // Subscribe to events that add images to the library
  useEffect(() => {
    function onAdd(e: Event) {
      const custom = e as CustomEvent<LibraryImage>;
      const payload = custom.detail;
      console.debug(
        "DashboarLibrary: event dashboardLibraryAddImage payload=",
        payload && (payload.id ?? "(no id)"),
      );
      if (payload && payload.id && payload.src) {
        try {
          const raw = localStorage.getItem("dashboardLibraryImages");
          const existing = raw ? (JSON.parse(raw) as LibraryImage[]) : [];
          const next = [
            payload,
            ...existing.filter((p) => p.id !== payload.id),
          ];
          localStorage.setItem("dashboardLibraryImages", JSON.stringify(next));
          setImages(next);
        } catch (err) {
          console.warn(
            "DashboarLibrary: failed to persist incoming image, falling back to state update",
            err,
          );
          setImages((prev) => [
            payload,
            ...prev.filter((p) => p.id !== payload.id),
          ]);
        }
      }
    }
    window.addEventListener("dashboardLibraryAddImage", onAdd as EventListener);
    return () =>
      window.removeEventListener(
        "dashboardLibraryAddImage",
        onAdd as EventListener,
      );
  }, []);

  // Keyboard shortcut to close modal with Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveImage(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Helper to safely persist an updated images array to localStorage and state
  function persistImages(next: LibraryImage[]) {
    try {
      localStorage.setItem("dashboardLibraryImages", JSON.stringify(next));
    } catch (err) {
      console.warn("DashboarLibrary: failed to persist images", err);
    }
    setImages(next);
  }

  // Save edited title for the active image
  function handleSaveTitle() {
    if (!activeImage) return;
    const next = images.map((img) =>
      img.id === activeImage.id ? { ...img, title: editingTitle } : img,
    );
    persistImages(next);
    const updated = next.find((i) => i.id === activeImage.id) ?? null;
    setActiveImage(updated);
    setIsEditingTitle(false);
  }

  // Download the active image and name the file according to title (sanitized)
  function handleDownload() {
    if (!activeImage) return;
    const src = activeImage.src;
    const nameBase =
      activeImage.title && activeImage.title.trim()
        ? activeImage.title.trim()
        : activeImage.id;
    const safeBase = nameBase.replace(/[^a-z0-9_\-\.]/gi, "_");

    try {
      // If the src is a data URL, convert to Blob for reliable download
      if (src.startsWith("data:")) {
        const firstComma = src.indexOf(",");
        const meta = src.substring(5, firstComma); // after 'data:' up to comma
        const data = src.substring(firstComma + 1);
        const isBase64 = meta.indexOf("base64") !== -1;
        const mime = meta.split(";")[0] || "application/octet-stream";
        let blob: Blob;
        if (isBase64) {
          const binary = atob(data);
          const len = binary.length;
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
          blob = new Blob([arr], { type: mime });
        } else {
          // percent-encoded UTF8
          const decoded = decodeURIComponent(data);
          blob = new Blob([decoded], { type: mime });
        }

        // If the data is SVG, rasterize it to PNG for a working .png file
        if (mime === "image/svg+xml") {
          const svgUrl = URL.createObjectURL(blob);
          const img = new window.Image();
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width || 800;
              canvas.height = img.height || 600;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                // optional: fill white background to avoid transparent background issues
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              }
              canvas.toBlob(
                (pngBlob) => {
                  if (!pngBlob) {
                    console.warn(
                      "DashboarLibrary: canvas.toBlob returned null",
                    );
                    // fallback to downloading original svg
                    const filename = safeBase + ".svg";
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    URL.revokeObjectURL(svgUrl);
                    return;
                  }
                  const pngUrl = URL.createObjectURL(pngBlob);
                  const filename = safeBase + ".png";
                  const a = document.createElement("a");
                  a.href = pngUrl;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(pngUrl);
                  URL.revokeObjectURL(svgUrl);
                },
                "image/png",
                0.95,
              );
            } catch (err) {
              console.warn("DashboarLibrary: failed to rasterize SVG", err);
              // fallback to downloading original svg
              const filename = safeBase + ".svg";
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              URL.revokeObjectURL(svgUrl);
            }
          };
          img.onerror = () => {
            // fallback to downloading original svg
            const filename = safeBase + ".svg";
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
          };
          // Use blob URL to avoid charset/encoding issues
          img.src = svgUrl;
          return;
        }

        const ext =
          mime === "image/png"
            ? ".png"
            : mime === "image/jpeg"
              ? ".jpg"
              : ".bin";
        const filename = safeBase + ext;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }

      // If it's already a blob: or http(s) URL, use anchor download (browser may respect download attr)
      if (
        src.startsWith("blob:") ||
        src.startsWith("http:") ||
        src.startsWith("https:")
      ) {
        // try to infer extension from URL
        const match = src.match(/\.([a-zA-Z0-9]{2,8})(?:[?#]|$)/);
        const ext = match ? `.${match[1]}` : ".png";
        const filename = safeBase + ext;
        const a = document.createElement("a");
        a.href = src;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      // Fallback: create anchor and attempt download as png
      const a = document.createElement("a");
      a.href = src;
      a.download = safeBase + ".png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.warn("DashboarLibrary: failed to download image", err);
    }
  }

  // Delete flow: open confirmation, confirm or cancel
  function handleDeleteClick() {
    setConfirmDelete(true);
  }

  function handleDeleteConfirm() {
    if (!activeImage) return;
    const next = images.filter((img) => img.id !== activeImage.id);
    persistImages(next);
    setConfirmDelete(false);
    setActiveImage(null);
  }

  function handleDeleteCancel() {
    // user requested not to delete; close modal
    setConfirmDelete(false);
    setActiveImage(null);
  }

  return (
    <div className="w-full max-w-5xl h-auto bg-white rounded-2xl shadow-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Library</h2>
        <p className="text-sm text-gray-500">Saved images</p>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m0 8l3-3 2 2 4-4 4 4"
            />
          </svg>
          <div className="text-sm">
            No images saved yet. Use the dashboard to save images and they will
            appear here.
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 overflow-x-auto py-2 px-2">
          {images.map((img) => (
            <div key={img.id} className="relative shrink-0 w-28 h-28 mr-3">
              <button
                type="button"
                onClick={() => {
                  setActiveImage(img);
                  setEditingTitle(img.title ?? "");
                  setIsEditingTitle(false);
                }}
                className="w-full h-full border-2 border-dashed border-gray-300 bg-white rounded-lg flex items-center justify-center text-sm text-gray-700 overflow-hidden"
                title={img.title}
              >
                <div className="w-full h-full relative">
                  <Image
                    src={img.src}
                    alt={img.alt ?? img.title ?? "library image"}
                    fill
                    unoptimized
                    loader={passthroughLoader}
                    className="object-cover"
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveImage(null)}
          />

          <div className="relative max-w-4xl w-[90%] max-h-[90%] bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="border px-2 py-1 rounded text-sm"
                      aria-label="Edit image title"
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTitle(false);
                        setEditingTitle(activeImage?.title ?? "");
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium">
                      {activeImage.title ?? "Image"}
                    </div>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded"
                      aria-label="Edit image title"
                      title="Edit title"
                    >
                      <EditIcon className="w-4 h-4" title="Edit" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-1 text-gray-600 hover:text-blue-600 rounded"
                  aria-label="Download image"
                  title="Download"
                >
                  <DownloadIcon className="w-4 h-4" title="Download" />
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="p-1 text-red-600 rounded hover:bg-red-50"
                  aria-label="Delete image"
                  title="Delete"
                >
                  <DeleteIcon className="w-4 h-4" title="Delete" />
                </button>

                <button
                  onClick={() => setActiveImage(null)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
                  aria-label="Close image preview"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center bg-gray-50">
              {/* give the parent a concrete height so Image with `fill` can size itself */}
              <div className="w-full h-[70vh] relative">
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt ?? activeImage.title ?? "preview"}
                  fill
                  unoptimized
                  loader={passthroughLoader}
                  className="object-contain"
                />
              </div>
            </div>

            {confirmDelete && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white border rounded-md shadow-lg p-4 w-[320px] text-center">
                  <div className="mb-3 text-sm">
                    Are you sure you want to delete this image?
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={handleDeleteCancel}
                      className="px-3 py-1 border rounded"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
