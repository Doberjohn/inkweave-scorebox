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
  // that, then dispose.
  //
  // Hiding the clone is fussy:
  //  - position off-screen (left: -10000px) → html-to-image emits a blank canvas
  //  - opacity:0 / visibility:hidden → same problem
  //  - on-screen but behind the modal backdrop → visible through the
  //    semi-transparent backdrop, causing a brief "huge image flash"
  //
  // The reliable trick: wrap the clone in a 0×0 overflow:hidden container.
  // The clone is still rendered (so html-to-image captures it correctly),
  // but the container clips it down to nothing visually.
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.top = "0";
  wrapper.style.left = "0";
  wrapper.style.width = "0";
  wrapper.style.height = "0";
  wrapper.style.overflow = "hidden";
  wrapper.style.pointerEvents = "none";

  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // html-to-image renders <img> tags by inlining them as data URLs; if an
  // image hasn't finished decoding by the time toBlob fires, it bakes a
  // blank/placeholder pixel into the PNG. Wait for every image in the
  // cloned subtree to be fully decoded first.
  const imgs = Array.from(clone.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => img.decode().catch(() => undefined)),
  );

  // Capture at the clone's actual rendered size. Width is locked to 1080
  // by CSS; height is content-driven (varies with player count).
  const width = clone.offsetWidth;
  const height = clone.offsetHeight;

  try {
    const blob = await toBlob(clone, {
      width,
      height,
      pixelRatio: 1,
      backgroundColor: "#0d0d14",
    });
    if (!blob) throw new Error("Failed to generate PNG from recap node");
    return blob;
  } finally {
    wrapper.remove();
  }
}
