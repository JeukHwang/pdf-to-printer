import { transform } from "./core";

// polyfill();
// pdf2png();
// png2pdf();

transform("https://bitcoin.org/bitcoin.pdf", {
  paperSize: "A4",
  orientation: "landscape",
  scale: 1,
  margin: 100,
  copies: 1,
  copiesOrder: "group-a-copy",
});
