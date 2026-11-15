export function productInput(formData) {
  const title = String(formData.get("title") || "").trim();
  const desc = String(formData.get("desc") || "").trim();
  const rawPrice = String(formData.get("price") || "");
  const img = String(formData.get("img") || "").trim();
  if (title.length < 3 || title.length > 50 || !desc || desc.length > 500 || !/^\d+(\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(Number(rawPrice))) {
    throw new Error("Provide a title (3–50 characters), description (1–500), and nonnegative price with at most two decimals.");
  }
  let url;
  try { url = new URL(img); } catch { throw new Error("Provide a valid image URL."); }
  if (url.protocol !== "https:" || url.hostname !== "images.pexels.com" || url.username || url.password || url.port) throw new Error("Images must use https://images.pexels.com/.");
  return { title, desc, price: Number(rawPrice), img };
}
