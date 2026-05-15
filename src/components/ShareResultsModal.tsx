import { useEffect, useId, useRef, useState } from "react";
import type { Recap } from "@/lib/recap";
import {
  copyImageToClipboard,
  downloadBlob,
  generateRecapPng,
  isWebShareSupported,
  shareViaWebShare,
} from "@/lib/share";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ShareableRecap } from "./ShareableRecap";
import { XIcon } from "./XIcon";

interface ShareResultsModalProps {
  recap: Recap;
  onClose: () => void;
}

type ActionStatus = "idle" | "working" | "ok" | "error";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ShareResultsModal({ recap, onClose }: ShareResultsModalProps) {
  const titleId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<ActionStatus>("idle");
  const [copyStatus, setCopyStatus] = useState<ActionStatus>("idle");
  const [downloadStatus, setDownloadStatus] = useState<ActionStatus>("idle");
  // Scale that fits the 1080-wide recap into the modal's fluid stage, plus
  // the resulting stage height (scale × inner.offsetHeight). Both are
  // JS-driven because (a) pure CSS can't divide a length by a length to
  // produce a unitless <number> for transform: scale(), and (b) the recap
  // is now content-tall so the stage height changes with player count.
  const [stageScale, setStageScale] = useState(0.46);
  const [stageHeight, setStageHeight] = useState(500);
  const canWebShare = isWebShareSupported();
  const filename = `scorebox-${isoDate(recap.date)}.png`;

  useBodyScrollLock(true);

  // On open, move focus into the dialog so AT and keyboard users land in it.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const inner = recapRef.current;
    if (!stage || !inner) return;
    function recompute() {
      const stageWidth = stage?.clientWidth ?? 0;
      const innerHeight = inner?.offsetHeight ?? 0;
      if (stageWidth <= 0 || innerHeight <= 0) return;
      const scale = stageWidth / 1080;
      setStageScale(scale);
      setStageHeight(innerHeight * scale);
    }
    const observer = new ResizeObserver(recompute);
    observer.observe(stage);
    observer.observe(inner);
    recompute();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const node = recapRef.current;
    if (!node) return;
    let cancelled = false;
    generateRecapPng(node)
      .then((b) => {
        if (!cancelled) setBlob(b);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setGenerateError(err instanceof Error ? err.message : "Unable to render image");
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onShare() {
    if (!blob) return;
    setShareStatus("working");
    try {
      await shareViaWebShare(blob, filename, "Scorebox — Box Opening Recap", recapText(recap));
      setShareStatus("ok");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("idle"); // user cancelling the share sheet is a normal no-op
    }
  }

  async function onCopy() {
    if (!blob) return;
    setCopyStatus("working");
    try {
      await copyImageToClipboard(blob);
      setCopyStatus("ok");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      // Fall back to download so the user still gets the image
      downloadBlob(blob, filename);
      setTimeout(() => setCopyStatus("idle"), 2500);
    }
  }

  function onDownload() {
    if (!blob) return;
    setDownloadStatus("working");
    try {
      downloadBlob(blob, filename);
      setDownloadStatus("ok");
      setTimeout(() => setDownloadStatus("idle"), 2000);
    } catch {
      setDownloadStatus("error");
      setTimeout(() => setDownloadStatus("idle"), 2500);
    }
  }

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="share-modal__header">
          <h2 id={titleId} className="share-modal__title">Share results</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="share-modal__close"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            <XIcon size={16} />
          </button>
        </header>

        <div
          className="share-modal__stage"
          ref={stageRef}
          style={{ height: stageHeight }}
        >
          <div
            className="share-modal__stage-inner"
            ref={recapRef}
            style={{ transform: `scale(${stageScale})` }}
          >
            <ShareableRecap recap={recap} />
          </div>
        </div>

        {generateError && (
          <div className="share-modal__error" role="alert">
            Couldn't build the image: {generateError}
          </div>
        )}

        <footer className="share-modal__actions">
          {canWebShare && (
            <button
              type="button"
              className="share-action share-action--primary"
              onClick={onShare}
              disabled={!blob || shareStatus === "working"}
              aria-label="Share recap image via the system share sheet"
            >
              {shareStatus === "ok" ? "Shared" : "Share"}
            </button>
          )}
          <button
            type="button"
            className={canWebShare ? "share-action" : "share-action share-action--primary"}
            onClick={onCopy}
            disabled={!blob || copyStatus === "working"}
            aria-label="Copy recap image to clipboard"
          >
            {copyStatus === "ok" ? "Copied" : copyStatus === "error" ? "Saved instead" : "Copy image"}
          </button>
          <button
            type="button"
            className="share-action"
            onClick={onDownload}
            disabled={!blob || downloadStatus === "working"}
            aria-label="Download recap image as a PNG file"
          >
            {downloadStatus === "ok" ? "Saved" : "Download"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function recapText(recap: Recap): string {
  if (recap.champions.length === 0) return "Box opening complete";
  if (recap.champions.length === 1) {
    const c = recap.champions[0]!;
    return `${c.name} won with ${c.score} points`;
  }
  const names = recap.champions.map((c) => c.name).join(" & ");
  const score = recap.champions[0]!.score;
  return `${names} tied at ${score} points`;
}
