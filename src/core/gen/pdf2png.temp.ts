import { createCanvas } from "canvas";
import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { RenderParameters } from "pdfjs-dist/types/src/display/api";

// PDF 파일 경로
const pdfPath = "./data/sample.pdf";
// 출력할 PNG 파일 경로
const outputDir = "./output/";

// 디렉토리가 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function convertPdfToPng(pdfPath: string, outputDir: string) {
  // PDF 파일을 읽어옵니다.
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  // PDF.js를 사용하여 PDF를 로드합니다.
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  console.log(`PDF loaded with ${pdf.numPages} pages`);

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 5 });

    // dpi -> manual calculation of scale
    
    console.log("view", page.view)
    console.log("viewport", viewport)

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
}

export default function convert() {
  convertPdfToPng(pdfPath, outputDir)
    .then(() => console.log("PDF conversion completed"))
    .catch((err) => console.error(err));
}
