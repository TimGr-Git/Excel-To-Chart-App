import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

// Ensure this API route runs in the Node.js runtime so ExcelJS and Buffer are available
export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const buffer = Buffer.from(uint8);

    // Load workbook with ExcelJS (requires Node runtime)
    const workbook = new ExcelJS.Workbook();
    try {
      // @ts-expect-error Buffer typing differs between DOM and Node typings; runtime is Node
      await workbook.xlsx.load(buffer as unknown as Buffer);
    } catch (err) {
      console.error("ExcelJS failed to load workbook:", err);
      return NextResponse.json(
        { error: "Failed to parse uploaded Excel file" },
        { status: 400 },
      );
    }

    const worksheet = workbook.worksheets[0]; // first sheet
    if (!worksheet) {
      return NextResponse.json({ error: "No sheet found" }, { status: 400 });
    }

    // Read columns: header in row 1, data rows from row 2..end
    const lastRow = worksheet.rowCount;
    const colCount = worksheet.columnCount;

    const labeledData: Array<{
      label: string;
      values: Array<number | string | null>;
      valueType: "number" | "string" | "date" | "empty" | "mixed";
    }> = [];

    for (let col = 1; col <= colCount; col++) {
      const headerCell = worksheet.getRow(1).getCell(col);
      const label =
        headerCell && headerCell.text ? headerCell.text : `Column ${col}`;

      const cells = [] as Array<{
        raw: unknown;
        text: string;
        isEmpty: boolean;
      }>;
      for (let r = 2; r <= lastRow; r++) {
        const cell = worksheet.getRow(r).getCell(col);
        const raw = cell.value;
        const text =
          cell && typeof cell.text === "string" ? cell.text : String(raw ?? "");
        const isEmpty =
          raw === null || raw === undefined || String(text).trim() === "";
        cells.push({ raw, text, isEmpty });
      }

      const nonEmpty = cells.filter((c) => !c.isEmpty);

      let valueType: "number" | "string" | "date" | "empty" | "mixed" = "empty";
      if (nonEmpty.length === 0) {
        valueType = "empty";
      } else if (
        nonEmpty.every(
          (c) =>
            typeof c.raw === "number" ||
            (typeof c.raw === "string" &&
              c.text.trim() !== "" &&
              !Number.isNaN(Number(c.text))),
        )
      ) {
        valueType = "number";
      } else if (nonEmpty.every((c) => c.raw instanceof Date)) {
        valueType = "date";
      } else {
        valueType = "string";
      }

      const values = cells.map((c) => {
        if (c.isEmpty) return null;
        try {
          if (valueType === "number") {
            // Prefer raw numbers, otherwise coerce from text
            return typeof c.raw === "number" ? c.raw : Number(c.text);
          }
          if (valueType === "date") {
            if (c.raw instanceof Date) return c.raw.toISOString();
            const parsed = new Date(c.text);
            return isNaN(parsed.getTime()) ? c.text : parsed.toISOString();
          }
          // string or mixed -> use text representation
          return c.text;
        } catch {
          return c.text;
        }
      });

      labeledData.push({ label, values, valueType });
    }

    return NextResponse.json({ labeledData });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Failed to parse Excel" },
      { status: 500 },
    );
  }
};
