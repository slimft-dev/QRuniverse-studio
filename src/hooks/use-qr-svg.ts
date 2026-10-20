import { useMemo } from "react";
import QRCode from "qrcode";

export type Ecc = "L" | "M" | "Q" | "H";

const MARGIN = 2;

/**
 * 100% client-side generation: the local SVG engine renders the QR matrix
 * synchronously in the browser with zero network calls, so no data ever
 * leaves the user's device.
 */
export function generateQrSvg(data: string, ecc: Ecc): string {
  if (!data) return "";
  try {
    const qr = QRCode.create(data, { errorCorrectionLevel: ecc });
    const size = qr.modules.size;
    const total = size + 2 * MARGIN;
    const cells: string[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.data[r * size + c]) {
          // The viewBox already starts at -MARGIN, so modules stay at grid
          // coordinates: drawing them at c + MARGIN would shift the whole
          // code toward the bottom-right instead of centring it.
          cells.push(`<rect x="${c}" y="${r}" width="1" height="1"/>`);
        }
      }
    }
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-MARGIN} ${-MARGIN} ${total} ${total}" shape-rendering="crispEdges">` +
      `<rect x="${-MARGIN}" y="${-MARGIN}" width="${total}" height="${total}" fill="#ffffff"/>` +
      `<g fill="#000000">${cells.join("")}</g>` +
      `</svg>`
    );
  } catch {
    return "";
  }
}

export function useQrSvg(payload: string, ecc: Ecc) {
  return useMemo(() => generateQrSvg(payload, ecc), [payload, ecc]);
}
