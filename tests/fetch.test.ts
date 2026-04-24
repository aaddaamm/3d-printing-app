import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry, HttpError } from "../lib/fetch.js";

describe("fetchWithRetry", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retries a thrown network error and returns the later successful response", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const ok = new Response("ok", { status: 200 });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error("connection reset"))
      .mockResolvedValueOnce(ok);
    vi.stubGlobal("fetch", fetchMock);

    const result = fetchWithRetry("https://example.com", {}, { retries: 1, timeoutMs: 100 });
    await vi.advanceTimersByTimeAsync(500);

    await expect(result).resolves.toBe(ok);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws the final network error after retries are exhausted", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
    const err = new Error("still down");
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(err);
    vi.stubGlobal("fetch", fetchMock);

    const result = fetchWithRetry("https://example.com", {}, { retries: 1, timeoutMs: 100 });
    const expectation = expect(result).rejects.toBe(err);
    await vi.advanceTimersByTimeAsync(500);

    await expectation;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-retryable HTTP statuses", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("nope", {
        status: 403,
        statusText: "Forbidden",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchWithRetry("https://example.com", {}, { retries: 2 })).rejects.toMatchObject({
      status: 403,
      statusText: "Forbidden",
      body: "nope",
    } satisfies Partial<HttpError>);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
