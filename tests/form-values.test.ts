import { describe, expect, it } from "vitest";
import {
  nonNegativeIntegerOrNull,
  numberOrNull,
  positiveIntegerOrNull,
  secondsFromHours,
} from "../frontend/lib/form-values.js";

describe("form value parsing", () => {
  it("parses finite numbers and treats blank or invalid values as null", () => {
    expect(numberOrNull(" 12.5 ")).toBe(12.5);
    expect(numberOrNull(" ")).toBeNull();
    expect(numberOrNull("Infinity")).toBeNull();
    expect(numberOrNull("not-a-number")).toBeNull();
  });

  it("converts hours to rounded seconds", () => {
    expect(secondsFromHours("1.5")).toBe(5400);
    expect(secondsFromHours("0.0002")).toBe(1);
    expect(secondsFromHours("")).toBeNull();
  });

  it("parses positive integers", () => {
    expect(positiveIntegerOrNull(" 3 ")).toBe(3);
    expect(positiveIntegerOrNull("0")).toBeNull();
    expect(positiveIntegerOrNull("1.5")).toBeNull();
    expect(positiveIntegerOrNull("")).toBeNull();
  });

  it("preserves zero as a valid non-negative integer", () => {
    expect(nonNegativeIntegerOrNull("0")).toBe(0);
    expect(nonNegativeIntegerOrNull(" 4 ")).toBe(4);
    expect(nonNegativeIntegerOrNull("-1")).toBeNull();
    expect(nonNegativeIntegerOrNull("2.5")).toBeNull();
  });
});
