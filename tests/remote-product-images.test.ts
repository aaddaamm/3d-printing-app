import type { LookupAddress } from "node:dns";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import {
  extractOpenGraphImage,
  fetchSupportedSourceImage,
  type RemoteImageDependencies,
} from "../lib/remote-product-images.js";

const publicAddress: LookupAddress[] = [{ address: "93.184.216.34", family: 4 }];

function dependencies(
  fetchImpl: RemoteImageDependencies["fetch"],
  addresses: LookupAddress[] = publicAddress,
): RemoteImageDependencies {
  return {
    fetch: fetchImpl,
    lookup: vi.fn(async () => addresses) as unknown as RemoteImageDependencies["lookup"],
  };
}

function responseWithChunks(chunks: Uint8Array[], init: ResponseInit = {}): Response {
  const remaining = [...chunks];
  return new Response(
    new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = remaining.shift();
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
    }),
    init,
  );
}

function htmlResponse(html: string, init: ResponseInit = {}): Response {
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    ...init,
  });
}

describe("extractOpenGraphImage", () => {
  it("accepts either attribute order, relative URLs, and basic entities", () => {
    const page = new URL("https://makerworld.com/en/models/1/");
    expect(
      extractOpenGraphImage(
        '<meta content="/images/hero.jpg?size=large&amp;crop=1" property="og:image">',
        page,
      )?.href,
    ).toBe("https://makerworld.com/images/hero.jpg?size=large&crop=1");
    expect(
      extractOpenGraphImage(
        "<META PROPERTY='og:image' CONTENT='https://makerworld.bblmw.com/a.webp'>",
        page,
      )?.href,
    ).toBe("https://makerworld.bblmw.com/a.webp");
  });

  it("returns null for missing, invalid, and malformed metadata without executing scripts", () => {
    expect(
      extractOpenGraphImage(
        "<meta property='description' content='no image'>",
        new URL("https://makerworld.com/"),
      ),
    ).toBeNull();
    expect(
      extractOpenGraphImage(
        "<meta property='og:image' content='http://[bad'>",
        new URL("https://makerworld.com/"),
      ),
    ).toBeNull();
    expect(
      extractOpenGraphImage(
        "<script>throw new Error('must not run')</script><meta property=og:image content>",
        new URL("https://makerworld.com/"),
      ),
    ).toBeNull();
  });
});

describe("fetchSupportedSourceImage", () => {
  it("rejects non-HTTPS, credentials, unsupported hosts, and private DNS answers", async () => {
    const deps = dependencies(vi.fn());
    await expect(
      fetchSupportedSourceImage("http://makerworld.com/en/models/1", deps),
    ).rejects.toThrow("HTTPS");
    await expect(
      fetchSupportedSourceImage("https://user:pass@makerworld.com/en/models/1", deps),
    ).rejects.toThrow(/credentials/i);
    await expect(fetchSupportedSourceImage("https://localhost/model", deps)).rejects.toThrow(
      /supported MakerWorld/i,
    );
    await expect(fetchSupportedSourceImage("https://cubee.com/model/1", deps)).rejects.toThrow(
      /supported MakerWorld/i,
    );
    expect(deps.fetch).not.toHaveBeenCalled();
    expect(deps.lookup).not.toHaveBeenCalled();

    for (const address of [
      "10.0.0.1",
      "100.64.0.1",
      "127.0.0.1",
      "169.254.1.1",
      "172.16.0.1",
      "192.0.2.1",
      "192.168.1.1",
      "198.51.100.1",
      "203.0.113.1",
      "224.0.0.1",
      "::1",
      "fe80::1",
      "fc00::1",
      "2001:db8::1",
      "ff02::1",
      "::ffff:192.168.1.1",
    ]) {
      const privateDeps = dependencies(vi.fn(), [
        { address, family: address.includes(":") ? 6 : 4 },
      ]);
      await expect(
        fetchSupportedSourceImage("https://makerworld.com/en/models/1", privateDeps),
      ).rejects.toThrow("public network");
    }
  });

  it("rejects a hostname when any returned address is non-public", async () => {
    const deps = dependencies(vi.fn(), [
      { address: "93.184.216.34", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ]);
    await expect(fetchSupportedSourceImage("https://makerworld.com/model", deps)).rejects.toThrow(
      "public network",
    );
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it("manually follows at most three redirects and revalidates every stage", async () => {
    const privateRedirect = dependencies(
      vi.fn(
        async () =>
          new Response(null, {
            status: 302,
            headers: { Location: "https://localhost/private" },
          }),
      ),
    );
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", privateRedirect),
    ).rejects.toThrow(/supported MakerWorld/i);

    const redirectFetch = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const step = Number(url.searchParams.get("step") ?? "0");
      return new Response(null, {
        status: 302,
        headers: { Location: `https://makerworld.com/model?step=${step + 1}` },
      });
    });
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", dependencies(redirectFetch)),
    ).rejects.toThrow(/redirect/i);
    expect(redirectFetch).toHaveBeenCalledTimes(4);
  });

  it("rejects oversized bodies, invalid statuses, and invalid content types before buffering", async () => {
    const oversizedHtml = dependencies(
      vi.fn(async () =>
        responseWithChunks([new Uint8Array(1024 * 1024), new Uint8Array([1])], {
          headers: { "Content-Type": "text/html" },
        }),
      ),
    );
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", oversizedHtml),
    ).rejects.toThrow(/1 MiB/i);

    const declaredOversize = dependencies(
      vi.fn(
        async () =>
          new Response("small", {
            headers: { "Content-Type": "text/html", "Content-Length": "1048577" },
          }),
      ),
    );
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", declaredOversize),
    ).rejects.toThrow(/1 MiB/i);

    const invalidHtmlType = dependencies(
      vi.fn(async () => new Response("x", { headers: { "Content-Type": "text/plain" } })),
    );
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", invalidHtmlType),
    ).rejects.toThrow(/HTML content type/i);

    const failedStatus = dependencies(vi.fn(async () => new Response("no", { status: 503 })));
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", failedStatus),
    ).rejects.toThrow(/status 503/i);
  });

  it("rejects invalid or oversized image responses", async () => {
    const unsupportedImageFetch = vi.fn(async () =>
      htmlResponse('<meta property="og:image" content="https://makerworld.com/hero.webp">'),
    );
    await expect(
      fetchSupportedSourceImage(
        "https://makerworld.com/model",
        dependencies(unsupportedImageFetch),
      ),
    ).rejects.toThrow(/supported MakerWorld image host/i);
    expect(unsupportedImageFetch).toHaveBeenCalledOnce();

    const page = htmlResponse(
      '<meta property="og:image" content="https://makerworld.bblmw.com/hero.webp">',
    );
    const invalidTypeFetch = vi
      .fn()
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce(
        new Response("not image", { headers: { "Content-Type": "text/html" } }),
      );
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", dependencies(invalidTypeFetch)),
    ).rejects.toThrow(/image content type/i);

    const oversizedImageFetch = vi
      .fn()
      .mockResolvedValueOnce(
        htmlResponse('<meta property="og:image" content="https://makerworld.bblmw.com/hero.webp">'),
      )
      .mockResolvedValueOnce(
        responseWithChunks([new Uint8Array(10 * 1024 * 1024), new Uint8Array([1])], {
          headers: { "Content-Type": "image/webp" },
        }),
      );
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", dependencies(oversizedImageFetch)),
    ).rejects.toThrow(/10 MiB/i);
  });

  it("passes a ten-second abort signal and reports timeout failures", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      expect(init?.redirect).toBe("manual");
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      throw new DOMException("The operation timed out", "TimeoutError");
    });
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", dependencies(fetchImpl)),
    ).rejects.toThrow(/timed out/i);
  });

  it("fetches a valid MakerWorld page and approved CDN image without live network", async () => {
    const image = new Uint8Array(
      await sharp({
        create: { width: 20, height: 10, channels: 3, background: "#123456" },
      })
        .png()
        .toBuffer(),
    );
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        htmlResponse(
          '<meta content="https://makerworld.bblmw.com/makerlab/hero.png" property="og:image">',
        ),
      )
      .mockResolvedValueOnce(new Response(image, { headers: { "Content-Type": "image/png" } }));
    const deps = dependencies(fetchImpl);

    await expect(
      fetchSupportedSourceImage("https://www.makerworld.com/en/models/123", deps),
    ).resolves.toEqual({
      bytes: image,
      sourceUrl: "https://makerworld.bblmw.com/makerlab/hero.png",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchImpl.mock.calls) {
      expect(init).toEqual(
        expect.objectContaining({
          credentials: "omit",
          redirect: "manual",
          signal: expect.anything(),
        }),
      );
      expect(new Headers(init?.headers).has("Authorization")).toBe(false);
    }
    expect(deps.lookup).toHaveBeenCalledTimes(2);
  });

  it("returns null when Open Graph metadata is absent", async () => {
    const deps = dependencies(vi.fn(async () => htmlResponse("<html><head></head></html>")));
    await expect(
      fetchSupportedSourceImage("https://makerworld.com/model", deps),
    ).resolves.toBeNull();
  });
});
