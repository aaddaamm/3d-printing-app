import { describe, expect, it } from "vitest";
import { formatJobForClipboard, formatProjectForClipboard } from "../frontend/lib/copy-format.js";

describe("clipboard copy formatters", () => {
  it("formats a print job as paste-ready Markdown", () => {
    const text = formatJobForClipboard({
      id: 42,
      designTitle: "Dragon Egg",
      customer: "Adam",
      status: "finish",
      deviceModel: "P1S",
      startTime: "2026-07-10T12:30:00.000Z",
      total_weight_g: 125.25,
      total_time_s: 7320,
      final_price: 18.5,
      plate_count: 2,
      print_run: 1,
    });

    expect(text).toContain("## Dragon Egg");
    expect(text).toContain("- Job ID: 42");
    expect(text).toContain("- Customer: Adam");
    expect(text).toContain("- Printer: P1S");
    expect(text).toContain("- Plates: 2");
    expect(text).toContain("- Filament: 125.3 g");
    expect(text).toContain("- Print time: 2h 2m");
    expect(text).toContain("- Estimated price: $18.50");
  });

  it("formats a project with a concise print list", () => {
    const text = formatProjectForClipboard(
      {
        id: 7,
        name: "Mecha cobra",
        customer: null,
        job_count: 3,
        total_plates: 3,
        total_weight_g: 484.17,
        total_time_s: 120138,
      },
      [
        {
          id: 1,
          designTitle: "Mecha cobra body",
          total_weight_g: 238.02,
          total_time_s: 57803,
          final_price: 45,
        },
      ],
    );

    expect(text).toContain("## Mecha cobra");
    expect(text).toContain("- Project ID: 7");
    expect(text).toContain("- Jobs: 3");
    expect(text).toContain("- Filament: 484.2 g");
    expect(text).toContain("- Print time: 33h 22m");
    expect(text).toContain("### Prints");
    expect(text).toContain("- Mecha cobra body — 238.0 g, 16h 3m, $45.00");
  });
});
