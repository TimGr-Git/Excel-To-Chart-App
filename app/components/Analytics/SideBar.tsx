"use client";
import React from "react";
import Image from "next/image";

type MenuOption = "Dashboard" | "Table" | "Analytics";

type ChartType = "line" | "bar";

interface Props {
  activeMenu: MenuOption;
  activeChart?: ChartType;
}

export default function Sidebar(props: Props) {
  const activeChart = props.activeChart;
  const [isOpen, setIsOpen] = React.useState(true);
  const [icons, setIcons] = React.useState<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    // Attempt to load an index manifest first. Place a file at /public/SideBarIcons/index.json
    // containing an array of filenames (e.g. ["logo.png","chart.png"]). This avoids any probing
    // and is the recommended approach for production use.
    const loadIcons = async () => {
      try {
        const manifestRes = await fetch(`/SideBarIcons/index.json`, {
          cache: "no-store",
        });
        if (manifestRes.ok) {
          const list = (await manifestRes.json()) as string[];
          if (Array.isArray(list)) {
            const urls = list.map((n) =>
              n.startsWith("/") ? n : `/SideBarIcons/${n}`,
            );
            if (!cancelled) setIcons(urls);
            return;
          }
        }
      } catch (e) {
        void e; // manifest missing or invalid — fall back to probing
      }

      // Fallback: controlled probe using a small range to avoid many 404s.
      // This is not ideal for arbitrary filenames but keeps noise low in dev.
      const found: string[] = [];
      let consecutiveMisses = 0;
      const maxProbe = 20; // keep small to avoid many missing requests
      for (
        let i = 1;
        i <= maxProbe && consecutiveMisses < 5 && !cancelled;
        i++
      ) {
        const url = `/SideBarIcons/image_${String(i).padStart(2, "0")}.png`;
        try {
          const res = await fetch(url, { method: "GET", cache: "no-store" });
          if (res.ok) {
            found.push(url);
            consecutiveMisses = 0;
          } else {
            consecutiveMisses++;
          }
        } catch (e) {
          void e; // ignore network errors to avoid spamming console
          consecutiveMisses++;
        }
      }
      if (!cancelled) setIcons(found);
    };

    loadIcons();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300 ${
        isOpen ? "w-80" : "w-16"
      }`}
    >
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-4 text-sm bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
        >
          {isOpen ? "Collapse" : ">"}
        </button>

        {isOpen && (
          <div className="grid grid-cols-2 gap-3">
            {icons.map((src, idx) => {
              const type: ChartType = idx === 1 ? "bar" : "line";
              const active = activeChart === type ? "ring-2 ring-blue-400" : ""; // placeholder
              return (
                <button
                  key={src}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("chartTypeSelected", {
                        detail: { type },
                      }),
                    );
                  }}
                  className={`bg-gray-700 rounded-lg overflow-hidden aspect-square relative p-0 border-0 ${active}`}
                  title={`Select ${type === "bar" ? "Bar" : "Line"} chart`}
                >
                  <Image
                    src={src}
                    alt="Sidebar image"
                    fill
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
