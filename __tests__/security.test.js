/** @jest-environment node */
import { hashPassword, verifyPassword, createSession, validSession } from "../src/lib/session";
import { productInput } from "../src/lib/validation";

beforeEach(() => { process.env.SESSION_SECRET = "a".repeat(64); });
test("passwords are salted and verified without plaintext storage", () => {
  const hash = hashPassword("a long password");
  expect(verifyPassword("a long password", hash)).toBe(true);
  expect(verifyPassword("wrong", hash)).toBe(false);
  expect(verifyPassword("wrong", "plaintext")).toBe(false);
  expect(hashPassword("a long password")).not.toBe(hash);
});
test("sessions reject tampering, expiration and a different signing key", () => {
  const token = createSession();
  expect(validSession(token)).toBe(true);
  expect(validSession(token + "x")).toBe(false);
  const now = Date.now();
  jest.spyOn(Date, "now").mockReturnValue(now + 3600001);
  expect(validSession(token)).toBe(false);
  jest.restoreAllMocks();
  process.env.SESSION_SECRET = "b".repeat(64);
  expect(validSession(token)).toBe(false);
});
function input(price = "2.50", img = "https://images.pexels.com/photos/test.jpg") {
  return new Map(Object.entries({ title: "Cake", desc: "Chocolate cake", price, img }));
}
test("server-side product validation rejects invalid prices and image hosts", () => {
  expect(productInput(input()).price).toBe(2.5);
  for (const price of ["", "-1", "NaN", "1.234", "Infinity"]) expect(() => productInput(input(price))).toThrow();
  expect(() => productInput(input("1", "https://evil.example/image.jpg"))).toThrow();
});
