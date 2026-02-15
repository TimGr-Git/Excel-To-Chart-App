"use client";

import React from "react";

interface Props {
  showPoints?: boolean;
  smoothLines?: boolean;
}

export default function OptionsPanel({
  showPoints = false,
  smoothLines = false,
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
          <div className="text-sm font-bold">Options</div>
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
          <label className="inline-flex items-center gap-2 text-sm mb-2">
            <input type="checkbox" defaultChecked={showPoints} />{" "}
            <span>Show points</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm mb-2">
            <input type="checkbox" defaultChecked={smoothLines} />{" "}
            <span>Smooth lines</span>
          </label>
        </div>
      )}
    </div>
  );
}
