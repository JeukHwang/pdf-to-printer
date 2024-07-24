export const mm2inch = (mm: number) => mm / 25.4;

/** @description ratio = width/height */
export function maxSizeWithFixedRatio(
  container: { width: number; height: number },
  ratio: number
): { width: number; height: number } {
  const { width, height } = container;
  const isLimitedByWidth = height * ratio > width;
  return isLimitedByWidth
    ? { width, height: width / ratio }
    : { width: height * ratio, height };
}
