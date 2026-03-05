import fs from "node:fs";
import path from "node:path";
import mammoth from "mammoth";


// pdf-parse for TS
const pdfParse = require("pdf-parse");



export async function extractTextFromFile(
  filePath: string,
  originalName?: string,
) {
  const ext = (path.extname(originalName || filePath) || "").toLowerCase();

  // TXT
  if (ext === ".txt") return fs.readFileSync(filePath, "utf-8");

  // DOCX
  if (ext === ".docx") {
    const buf = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value || "";
  }

  // PDF
  if (ext === ".pdf") {
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data?.text || "";
  }

  // fallback
  return fs.readFileSync(filePath, "utf-8");
}