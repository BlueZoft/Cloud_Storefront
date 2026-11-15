export const PAGE_SIZE = 20;
export function pageNumber(value = "1") {
  if (typeof value !== "string" || !/^[1-9]\d{0,3}$/.test(value)) return 1;
  return Number(value);
}
