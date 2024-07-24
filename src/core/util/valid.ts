export const pageRangeRegex =
  /^([1-9][0-9]*(-[1-9][0-9]*)?)(,([1-9][0-9]*(-[1-9][0-9]*)?))*$/;

export function parsePageRange(range: string): number[] {
  const result: number[] = [];
  if (pageRangeRegex.test(range)) {
    for (const part of range.split(",")) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
      } else {
        result.push(Number(part));
      }
    }
  }
  const uniqueResult = [...new Set(result)];
  uniqueResult.sort((a, b) => a - b);
  return uniqueResult;
}
