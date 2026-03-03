import fs from "fs";
import path from "path";
import mammoth from "mammoth";

// ✅ Fix: use require to avoid TS “no call signatures”
const pdfParse = require("pdf-parse");

export async function extractTextFromFile(filePath: string, originalName?: string) {
  const ext = (path.extname(originalName || filePath) || "").toLowerCase();

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (ext === ".docx") {
    const buf = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value || "";
  }

  if (ext === ".pdf") {
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data?.text || "";
  }

  return fs.readFileSync(filePath, "utf-8");
}