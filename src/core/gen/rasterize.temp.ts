import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { PageSizes, PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { RenderParameters } from "pdfjs-dist/types/src/display/api";
import { defaultOptions, PrintOptions } from "..";
import { LprOptions } from "../api/lpr";
import { maxSizeWithFixedRatio, mm2inch, paperSizeMap } from "../util";

function convert(options: PrintOptions): LprOptions {
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

function printPDF(
  inputPath: string,
  outputPath: string,
  options: Partial<PrintOptions>
) {
  construct(inputPath, outputPath, options);
}

// orientation: "portrait" | "landscape";
// scale: number;
// margin: number;

async function construct(
  inputPath: string,
  outputPath: string,
  options: Partial<PrintOptions>
) {
  const userOptions = { ...defaultOptions, ...options };
  const pdfData = new Uint8Array(fs.readFileSync(inputPath));
  const pdf = await getDocument({ data: pdfData }).promise;

  const doc = await PDFDocument.create();
  doc.cop;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: userOptions.scale });

    sizes.push({ width: viewport.width, height: viewport.height });
    // dpi -> manual calculation of scale

    console.log("view", page.view);
    console.log("viewport", viewport);

    // Canvas 생성
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    // 페이지를 캔버스에 렌더링
    await page.render(renderContext as unknown as RenderParameters).promise;

    // PNG 파일로 저장
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`${outputDir}page-${pageNum}.png`, buffer);

    console.log(`Page ${pageNum} converted to PNG`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
}

export default async function createPdfWithImage(
  pngPath: string,
  outputPdfPath: string,
  options: Partial<PrintOptions>
) {
  const document = await PDFDocument.create();
  for (let i = 0; i < 2; i++) {
    /** @todo 2 is hardcoded; should be changed */
    const page = document.addPage(PageSizes[options.paperSize!]);

    const content = maxSizeWithFixedRatio(paperSizeMap[options.paperSize!]);

    const img = await loadImage(pngPath);

    // 캔버스에 이미지를 그린 다음, 이미지를 PDF에 추가
    const canvas = createCanvas(img.width, img.height);
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0, img.width, img.height);
    const imgData = canvas.toDataURL("image/png").split(",")[1];
    const pngImage = await document.embedPng(Buffer.from(imgData, "base64"));

    // 이미지 크기 및 위치 설정
    const { width, height } = pngImage.scale(0.5);
    page.drawImage(pngImage, {
      x: 10,
      y: page.getHeight() - height - 10,
      width,
      height,
    });
  }

  // PDF 파일 저장
  const pdfBytes = await document.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);

  console.log("PDF created with image");
}

/** @see https://pdf-lib.js.org/#embed-pdf-pages */
export async function constructPdf(
  inputUrl: string,
  options: Partial<PrintOptions>
) {
  /** Input */
  //   const inputUrl = "https://pdf-lib.js.org/assets/american_flag.pdf";
  const inputBytes = await fetch(inputUrl).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();

  const inputPdfDoc = await PDFDocument.load(inputBytes);
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
  fs.writeFileSync("output.pdf", pdfBytes);
}
