export type Category = "url" | "wifi" | "vcard" | "event" | "geo" | "phone" | "sms" | "email";
export type FieldKey =
  | "url" | "ssid" | "password" | "security" | "hidden" | "name" | "title" | "org" | "mobile" | "work"
  | "email" | "address" | "linkedin" | "twitter" | "github" | "start" | "end" | "location" | "description"
  | "lat" | "lng" | "phone" | "message" | "to" | "subject" | "body";
export type Fields = Partial<Record<FieldKey, string>>;

const esc = (s = "") => s.replace(/([\\;,:"])/g, "\\$1");
const vesc = (s = "") => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([;,])/g, "\\$1");

export function normalizeUrl(u: string) {
  const t = u.trim();
  if (!t) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
}

function icsDate(v = "") {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildPayload(cat: Category, f: Fields): string {
  switch (cat) {
    case "url":
      return normalizeUrl(f.url ?? "");
    case "wifi": {
      const sec = f.security === "None" ? "nopass" : f.security === "WPA3" ? "SAE" : f.security || "WPA";
      return `WIFI:T:${sec};S:${esc(f.ssid)};${sec === "nopass" ? "" : `P:${esc(f.password)};`}${f.hidden === "true" ? "H:true;" : ""};`;
    }
    case "vcard": {
      const name = (f.name ?? "").trim();
      const parts = name.split(/\s+/);
      const last = parts.length > 1 ? parts.pop()! : "";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${vesc(last)};${vesc(parts.join(" "))};;;`,
        `FN:${vesc(name)}`,
        f.org && `ORG:${vesc(f.org)}`,
        f.title && `TITLE:${vesc(f.title)}`,
        f.mobile && `TEL;TYPE=CELL:${f.mobile}`,
        f.work && `TEL;TYPE=WORK:${f.work}`,
        f.email && `EMAIL:${f.email}`,
        f.address && `ADR;TYPE=WORK:;;${vesc(f.address)};;;;`,
        f.linkedin && `URL;TYPE=LinkedIn:${normalizeUrl(f.linkedin)}`,
        f.twitter && `URL;TYPE=Twitter:${normalizeUrl(f.twitter)}`,
        f.github && `URL;TYPE=GitHub:${normalizeUrl(f.github)}`,
        "END:VCARD",
      ];
      return lines.filter(Boolean).join("\n");
    }
    case "event": {
      const lines = [
        "BEGIN:VEVENT",
        `SUMMARY:${vesc(f.title)}`,
        icsDate(f.start) && `DTSTART:${icsDate(f.start)}`,
        icsDate(f.end) && `DTEND:${icsDate(f.end)}`,
        f.location && `LOCATION:${vesc(f.location)}`,
        f.description && `DESCRIPTION:${vesc(f.description)}`,
        f.url && `URL:${normalizeUrl(f.url)}`,
        "END:VEVENT",
      ];
      return lines.filter(Boolean).join("\n");
    }
    case "geo":
      return `geo:${f.lat || 0},${f.lng || 0}`;
    case "phone":
      return `tel:${(f.phone ?? "").replace(/[^\d+]/g, "")}`;
    case "sms":
      return `SMSTO:${(f.phone ?? "").replace(/[^\d+]/g, "")}:${f.message ?? ""}`;
    case "email": {
      const q = new URLSearchParams();
      if (f.subject) q.set("subject", f.subject);
      if (f.body) q.set("body", f.body);
      const qs = q.toString().replace(/\+/g, "%20");
      return `mailto:${f.to ?? ""}${qs ? `?${qs}` : ""}`;
    }
  }
}
