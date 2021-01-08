import assert from "assert";
import reviewsAreAvailable from "../index.mjs";

describe("reviewsAreAvailable", () => {
  describe("previous = current", () => {
    it("previous = current = {}", () =>
      assert.strictEqual(reviewsAreAvailable([], []), false));
    it("otherwise", () =>
      assert.strictEqual(reviewsAreAvailable([1], [1]), false));
  });
  describe("previous < current", () => {
    it("previous = {}", () =>
      assert.strictEqual(reviewsAreAvailable([], [1]), true));
    it("otherwise", () =>
      assert.strictEqual(reviewsAreAvailable([1], [1, 2]), false));
  });
  describe("previous > current", () => {
    it("current = {}", () =>
      assert.strictEqual(reviewsAreAvailable([1], []), false));
    it("otherwise", () =>
      assert.strictEqual(reviewsAreAvailable([1, 2], [1]), false));
  });
  describe("otherwise", () =>
    it("", () => assert.strictEqual(reviewsAreAvailable([1], [2]), true)));
});
