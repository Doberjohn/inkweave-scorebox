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
  // Scale that fits the 1080x1080 recap into the modal's fluid stage. JS-driven
  // because pure CSS can't divide a length by a length to produce a unitless
  // <number> for transform: scale(). 0.46 (≈500/1080) is a sane initial guess
  // until ResizeObserver fires on first paint.
  const [stageScale, setStageScale] = useState(0.46);
  const canWebShare = isWebShareSupported();
  const filename = `scorebox-${isoDate(recap.date)}.png`;

  useBodyScrollLock(true);

  // On open, move focus into the dialog so AT and keyboard users land in it.
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setStageScale(width / 1080);
    });
    observer.observe(stage);
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
            ×
          </button>
        </header>

        <div className="share-modal__stage" ref={stageRef}>
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
  if (!recap.champion) return "Box opening complete";
  return `${recap.champion.name} won with ${recap.champion.score} points`;
}
