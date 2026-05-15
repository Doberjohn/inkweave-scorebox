import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface QrCodeProps {
  data: string;
  size?: number;
}

/**
 * Themed QR code matching the Inkweave gold-on-dark palette. Rounded
 * dots, extra-rounded position squares, gold-gradient module fill,
 * transparent background so the recap canvas shows through. High
 * error-correction so the styled corners stay scannable.
 */
export function QrCode({ data, size = 160 }: QrCodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.replaceChildren();
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data,
      qrOptions: { errorCorrectionLevel: "H" },
      backgroundOptions: { color: "transparent" },
      dotsOptions: {
        type: "rounded",
        gradient: {
          type: "linear",
          rotation: Math.PI / 4,
          colorStops: [
            { offset: 0, color: "#faf1d3" },
            { offset: 0.5, color: "#d4af37" },
            { offset: 1, color: "#b29861" },
          ],
        },
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#ffb900",
      },
      cornersDotOptions: {
        type: "dot",
        color: "#faf1d3",
      },
    });
    qr.append(node);
    return () => {
      node.replaceChildren();
    };
  }, [data, size]);

  return <div ref={ref} className="qr-code" aria-hidden="true" />;
}
