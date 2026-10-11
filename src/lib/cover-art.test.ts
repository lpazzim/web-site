import { describe, expect, it } from "vitest";
import { COVER_SIZE, createRandom, generateCover, hashSeed, variantFor, type CoverVariant } from "./cover-art";

const VARIANTS: CoverVariant[] = ["mesh", "circuits", "waves", "nodes"];

describe("cover art", () => {
  it("is deterministic: the same seed yields identical art", () => {
    expect(generateCover("treeunfe")).toEqual(generateCover("treeunfe"));
  });

  it("differs between seeds", () => {
    expect(generateCover("treeunfe", COVER_SIZE, "mesh")).not.toEqual(generateCover("upx", COVER_SIZE, "mesh"));
  });

  it("hashes and random streams are stable", () => {
    expect(hashSeed("lpazzim")).toBe(hashSeed("lpazzim"));
    const first = createRandom(42);
    const second = createRandom(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
    expect(first()).toBeGreaterThanOrEqual(0);
    expect(first()).toBeLessThan(1);
  });

  it("picks the variant from the seed", () => {
    expect(variantFor("webmotors")).toBe(variantFor("webmotors"));
    expect(generateCover("webmotors").variant).toBe(variantFor("webmotors"));
  });

  it.each(VARIANTS)("%s draws visible, finite geometry inside the canvas", (variant) => {
    const { paths, dots } = generateCover("jestor", COVER_SIZE, variant);

    expect(paths.length).toBeGreaterThan(5);
    for (const path of paths) {
      expect(path.d).toMatch(/^M-?[\d.]+ -?[\d.]+(L-?[\d.]+ -?[\d.]+)+$/);
      expect(path.opacity).toBeGreaterThan(0);
      expect(path.opacity).toBeLessThanOrEqual(1);
    }
    for (const dot of dots) {
      expect(Number.isFinite(dot.x) && Number.isFinite(dot.y) && dot.r > 0).toBe(true);
      expect(dot.x).toBeGreaterThanOrEqual(0);
      expect(dot.x).toBeLessThanOrEqual(COVER_SIZE.width);
      expect(dot.y).toBeGreaterThanOrEqual(0);
      expect(dot.y).toBeLessThanOrEqual(COVER_SIZE.height);
    }
  });
});
