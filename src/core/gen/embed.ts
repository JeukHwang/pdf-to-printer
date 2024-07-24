/** @see https://pdf-lib.js.org/#embed-pdf-pages */

import { PDFDocument, PageSizes } from "pdf-lib";
import { PrintOptions } from "..";
import { maxSizeWithFixedRatio, mm2inch } from "../util/math";

export default async function generate(
  input: ArrayBuffer,
  options: Partial<PrintOptions>
): Promise<Uint8Array> {
  /** Input */
  const pdfDoc = await PDFDocument.create();
  const inputPdfDoc = await PDFDocument.load(input);
  const inputPages = inputPdfDoc.getPages();

  /** Layout */
  const paperSize =
    PageSizes[options.paperSize!]; /** @description unit: inch */
  const pageSize =
    options.orientation === "portrait"
      ? { width: paperSize[0], height: paperSize[1] }
      : { width: paperSize[1], height: paperSize[0] };
  const contentAreaSize = {
    width: pageSize.width - 2 * mm2inch(options.margin!),
    height: pageSize.height - 2 * mm2inch(options.margin!),
  };

  /** Output */
  const embeddedPages = await pdfDoc.embedPages(inputPages);
  for (let i = 0; i < embeddedPages.length; i++) {
    const embeddedPage = embeddedPages[i];
    const page = pdfDoc.addPage([pageSize.width, pageSize.height]);
    const contentSize = maxSizeWithFixedRatio(
      contentAreaSize,
      embeddedPage.width / embeddedPage.height
    );
    const width = contentSize.width * options.scale!;
    const height = contentSize.height * options.scale!;
    const x = (pageSize.width - width) / 2;
    const y = (pageSize.height - height) / 2;
    page.drawPage(embeddedPage, { width, height, x, y });
  }
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
