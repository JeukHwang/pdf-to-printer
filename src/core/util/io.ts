import fs from "fs";
import path from "path";

export async function loadPDF(source: string): Promise<ArrayBuffer> {
  const isUrl = source.startsWith("http://") || source.startsWith("https://");
  let buffer: ArrayBuffer;
  if (isUrl) {
    const response = await fetch(source);
    buffer = await response.arrayBuffer();
  } else {
    const {
      buffer: bufferRaw,
      byteOffset,
      byteLength,
    } = fs.readFileSync(source);
    buffer = bufferRaw.slice(byteOffset, byteOffset + byteLength);
  }
  return buffer;
}

export async function savePDF(content: Uint8Array): Promise<string> {
  if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");
  const filePath = path.resolve(`./dist/${Date.now()}.pdf`);
  fs.writeFileSync(filePath, content);
  return filePath;
}
