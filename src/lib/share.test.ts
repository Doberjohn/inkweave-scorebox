import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyImageToClipboard, downloadBlob, isWebShareSupported, shareViaWebShare } from "./share";

describe("downloadBlob", () => {
  let revokeSpy: ReturnType<typeof vi.spyOn>;
  let createUrlSpy: ReturnType<typeof vi.spyOn>;
  let clickedAnchor: HTMLAnchorElement | null = null;

  beforeEach(() => {
    clickedAnchor = null;
    createUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const real = Object.getPrototypeOf(document).createElement.call(document, tag);
      if (tag === "a") {
        real.click = vi.fn(() => {
          clickedAnchor = real;
        });
      }
      return real;
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("creates an anchor with the filename, clicks it, and revokes the URL", () => {
    const blob = new Blob(["x"], { type: "image/png" });
    downloadBlob(blob, "scorebox-test.png");
    expect(createUrlSpy).toHaveBeenCalledWith(blob);
    expect(clickedAnchor?.download).toBe("scorebox-test.png");
    expect(clickedAnchor?.href).toContain("blob:mock");
    expect(revokeSpy).toHaveBeenCalledWith("blob:mock");
  });
});

describe("copyImageToClipboard", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls navigator.clipboard.write with a ClipboardItem wrapping the PNG", async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write: writeMock } });
    // jsdom does not ship ClipboardItem; provide a minimal stub.
    vi.stubGlobal("ClipboardItem", class { constructor(public items: Record<string, Blob>) {} });

    const blob = new Blob(["x"], { type: "image/png" });
    await copyImageToClipboard(blob);

    expect(writeMock).toHaveBeenCalledTimes(1);
    const call = writeMock.mock.calls[0]!;
    const [items] = call;
    expect(items).toHaveLength(1);
    expect(items[0].items["image/png"]).toBe(blob);
  });

  it("rejects when navigator.clipboard.write rejects", async () => {
    const writeMock = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { write: writeMock } });
    vi.stubGlobal("ClipboardItem", class { constructor(public items: Record<string, Blob>) {} });

    await expect(
      copyImageToClipboard(new Blob([], { type: "image/png" })),
    ).rejects.toThrow("denied");
  });
});

describe("isWebShareSupported", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns false when navigator.share is missing", () => {
    vi.stubGlobal("navigator", {});
    expect(isWebShareSupported()).toBe(false);
  });

  it("returns false when canShare rejects file payloads", () => {
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare: vi.fn().mockReturnValue(false),
    });
    expect(isWebShareSupported()).toBe(false);
  });

  it("returns true when canShare accepts a file payload", () => {
    vi.stubGlobal("navigator", {
      share: vi.fn(),
      canShare: vi.fn().mockReturnValue(true),
    });
    expect(isWebShareSupported()).toBe(true);
  });
});

describe("shareViaWebShare", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("calls navigator.share with a File built from the blob", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share: shareMock });
    const blob = new Blob(["x"], { type: "image/png" });

    await shareViaWebShare(blob, "scorebox-recap.png", "Scorebox", "Box opening recap");

    expect(shareMock).toHaveBeenCalledTimes(1);
    const arg = shareMock.mock.calls[0]![0];
    expect(arg.title).toBe("Scorebox");
    expect(arg.text).toBe("Box opening recap");
    expect(arg.files).toHaveLength(1);
    expect(arg.files[0].name).toBe("scorebox-recap.png");
    expect(arg.files[0].type).toBe("image/png");
  });
});
