import { describe, expect, it } from "vitest";
import { parseId } from "../lib/util.js";

function ctxWithId(id: string): Parameters<typeof parseId>[0] {
  return {
    req: {
      param: (name: string) => (name === "id" ? id : ""),
    },
  } as unknown as Parameters<typeof parseId>[0];
}

describe("parseId", () => {
  it("accepts positive integers", () => {
    expect(parseId(ctxWithId("1"))).toBe(1);
    expect(parseId(ctxWithId("42"))).toBe(42);
  });

  it("rejects zero, negatives, and decimals", () => {
    expect(parseId(ctxWithId("0"))).toBeNull();
    expect(parseId(ctxWithId("-1"))).toBeNull();
    expect(parseId(ctxWithId("1.5"))).toBeNull();
  });

  it("rejects non-numeric values", () => {
    expect(parseId(ctxWithId("abc"))).toBeNull();
    expect(parseId(ctxWithId(""))).toBeNull();
  });
});
