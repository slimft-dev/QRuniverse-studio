import { describe, it, expect } from "vitest";
import { buildPayload, normalizeUrl } from "@/lib/qr-payload";

describe("qr payloads", () => {
  it("adds https to bare URLs", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("http://a.io")).toBe("http://a.io");
  });
  it("maps WPA3 to SAE and escapes SSID", () => {
    expect(buildPayload("wifi", { ssid: "My;Net", password: "p", security: "WPA3", hidden: "true" })).toBe(
      "WIFI:T:SAE;S:My\\;Net;P:p;H:true;;",
    );
  });
  it("omits password for open networks", () => {
    expect(buildPayload("wifi", { ssid: "Open", security: "None" })).toBe("WIFI:T:nopass;S:Open;;");
  });
  it("uses vCard 3.0", () => {
    expect(buildPayload("vcard", { name: "Ada Lovelace" })).toContain("VERSION:3.0\nN:Lovelace;Ada;;;");
  });
});
