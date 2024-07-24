import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { PDFDocument } from "pdf-lib";

// PDF 파일 경로
const outputPdfPath = "./output/document.pdf";
// PNG 파일 경로
const pngFilePath = "./output/page-1.png";

async function createPdfWithImage(pngPath: string, outputPdfPath: string) {
  // 새로운 PDF 문서 생성
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  // PNG 이미지 로드
  const img = await loadImage(pngPath);

  // 캔버스에 이미지를 그린 다음, 이미지를 PDF에 추가
  const canvas = createCanvas(img.width, img.height);
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0, img.width, img.height);
  const imgData = canvas.toDataURL("image/png").split(",")[1];
  const pngImage = await pdfDoc.embedPng(Buffer.from(imgData, "base64"));

  // 이미지 크기 및 위치 설정
  const { width, height } = pngImage.scale(0.5);
  page.drawImage(pngImage, {
    x: 10,
    y: page.getHeight() - height - 10,
    width: width,
    height: height,
  });

  // PDF 파일 저장
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);

  console.log("PDF created with image");
}

export default function reconvert() {
  createPdfWithImage(pngFilePath, outputPdfPath);
  createPdfWithImage(pngFilePath, outputPdfPath)
    .then(() => console.log("PDF creation completed"))
    .catch((err) => console.error(err));
}
