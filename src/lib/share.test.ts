import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlob } from "./share";

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
