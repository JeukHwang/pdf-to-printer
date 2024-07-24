import { LprOptions } from "./api/lpr";
import generate from "./gen/embed";
import { loadPDF, savePDF } from "./util/io";

export type PrintOptions = {
  paperSize: "A4" | "Letter" | "Legal"; // keyof typeof PageSizes;
  orientation: "portrait" | "landscape";
  scale: number;
  margin: number;
  copies: number;
  copiesOrder: "group-a-copy" | "group-pages";
  pageRange?: string;
};

export const defaultOptions: PrintOptions = {
  paperSize:
    "A4" /** @todo Letter & Legal should be default based on timezone */,
  orientation: "portrait",
  scale: 1,
  margin: 0,
  copies: 1,
  copiesOrder: "group-a-copy",
};

/** @description Mac and Linux */
function convert(options: PrintOptions): LprOptions {
  const isWin = process.platform === "win32";

  if (isWin) {
    return {};
  } else {
    const lprOptions: LprOptions = {
      jobOptions: {
        media: options.paperSize.toLowerCase() as Lowercase<
          PrintOptions["paperSize"]
        >,
        collate: options.copiesOrder === "group-a-copy",
      },
      copies: options.copies,
    };
    return lprOptions;
  }
}

export async function transform(
  source: string,
  options: Partial<PrintOptions>
): Promise<string> {
  const userOptions : PrintOptions = { ...defaultOptions, ...options };
  const buffer = await loadPDF(source);
  const lprOptions: LprOptions = convert(userOptions);
  const pdfBytes = await generate(buffer, userOptions);
  return await savePDF(pdfBytes);
}
