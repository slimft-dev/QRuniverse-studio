import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { generateQrSvg, useQrSvg } from "@/hooks/use-qr-svg";

describe("Client-side QR generation", () => {
  it("generates a local SVG without any network requests", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const svg = generateQrSvg("https://example.com", "H");
    expect(svg).toContain("<svg");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("regenerates instantly when the payload or ECC changes", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    type Props = { payload: string; ecc: "L" | "M" | "Q" | "H" };
    const { result, rerender } = renderHook((props: Props) => useQrSvg(props.payload, props.ecc), {
      initialProps: { payload: "https://first.com", ecc: "L" } as Props,
    });
    expect(result.current).toContain("<svg");
    rerender({ payload: "https://first.com", ecc: "H" });
    const high = result.current;
    expect(high).toContain("<svg");
    rerender({ payload: "https://second.com", ecc: "H" });
    expect(result.current).toContain("<svg");
    expect(result.current).not.toBe(high);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("returns an empty canvas for an empty payload", () => {
    expect(generateQrSvg("", "M")).toBe("");
  });

  it("keeps the quiet zone equal on all sides so the code sits centered", () => {
    const svg = generateQrSvg("https://example.com", "M");
    const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/)!;
    const vx = Number(vb[1]);
    const vy = Number(vb[2]);
    const vw = Number(vb[3]);
    const vh = Number(vb[4]);
    const xs: number[] = [];
    const ys: number[] = [];
    for (const m of svg.matchAll(/<rect x="([-\d.]+)" y="([-\d.]+)" width="1" height="1"\/>/g)) {
      xs.push(Number(m[1]));
      ys.push(Number(m[2]));
    }
    expect(xs.length).toBeGreaterThan(0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + 1;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + 1;
    expect(minX - vx).toBe(vx + vw - maxX);
    expect(minY - vy).toBe(vy + vh - maxY);
  });
});
