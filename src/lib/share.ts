import { toBlob } from "html-to-image";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyImageToClipboard(blob: Blob): Promise<void> {
  const item = new ClipboardItem({ "image/png": blob });
  await navigator.clipboard.write([item]);
}

export function isWebShareSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function") return false;
  if (typeof navigator.canShare !== "function") return false;
  const probe = new File([], "probe.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
}

export async function shareViaWebShare(
  blob: Blob,
  filename: string,
  title: string,
  text: string,
): Promise<void> {
  const file = new File([blob], filename, { type: "image/png" });
  await navigator.share({ files: [file], title, text });
}

export async function generateRecapPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;

  // The visible recap is scaled down (transform: scale(<1>)) to fit the modal
  // preview, but html-to-image captures whatever transform is applied. Clone
  // into a fresh container at native 1080x1080 with no transform, snapshot
  // that, then dispose. The clone is positioned on-screen behind the modal
  // backdrop so the browser actually paints it (off-screen positioning makes
  // html-to-image emit a blank canvas).
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.zIndex = "105"; // above page content (z-index ~1), below modal backdrop (110)
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);

  try {
    const blob = await toBlob(clone, {
      width: 1080,
      height: 1080,
      pixelRatio: 1,
      backgroundColor: "#0d0d14",
    });
    if (!blob) throw new Error("Failed to generate PNG from recap node");
    return blob;
  } finally {
    clone.remove();
  }
}
