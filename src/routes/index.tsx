import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useRapidApiQr } from "@/hooks/use-rapidapi-qr";
import { toast } from "sonner";
import {
  Globe, Wifi, Contact, CalendarDays, MapPin, Phone, MessageSquare, Mail,
  Download, Copy, Code2, Bot, ExternalLink, Zap, Check, Key, Loader2, RefreshCw, AlertCircle
} from "lucide-react";
import { buildPayload, type Category, type FieldKey, type Fields } from "@/lib/qr-payload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QRUNIVERSE Studio — Vector QR Code Engine" },
      { name: "description", content: "Developer client for the QRUNIVERSE Cloud API on RapidAPI. Generate crisp vector SVG QR codes with ultra-low latency." },
      { property: "og:title", content: "QRUNIVERSE Studio — Vector QR Code Engine" },
      { property: "og:description", content: "Production-ready vector SVG QR code client with RapidAPI integration and Claude / Cursor MCP support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

const RAPIDAPI = "https://rapidapi.com/apexcorelabs-apexcorelabs-default/api/qruniverse-vector-qr-code-generator2";
const PLAYGROUND_URL = "https://qr-universe-workshop.lovable.app/";
const RAPIDAPI_HOST = "qruniverse-vector-qr-code-generator2.p.rapidapi.com";

const CATS: { id: Category; label: string; icon: typeof Globe }[] = [
  { id: "url", label: "URL", icon: Globe },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "vcard", label: "vCard", icon: Contact },
  { id: "event", label: "Event", icon: CalendarDays },
  { id: "geo", label: "Location", icon: MapPin },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
];

const DEFAULTS: Record<Category, Fields> = {
  url: { url: RAPIDAPI },
  wifi: { ssid: "Studio-5G", password: "", security: "WPA", hidden: "false" },
  vcard: { name: "Ada Lovelace", title: "Engineer", org: "Analytical Co." },
  event: { title: "Launch Day", start: "", end: "", location: "", description: "", url: "" },
  geo: { lat: "40.4168", lng: "-3.7038" },
  phone: { phone: "+34 600 000 000" },
  sms: { phone: "+34 600 000 000", message: "Hello!" },
  email: { to: "contact@example.com", subject: "Hi", body: "" },
};

const CITIES = [
  { n: "Madrid", lat: "40.4168", lng: "-3.7038" },
  { n: "New York", lat: "40.7128", lng: "-74.0060" },
  { n: "London", lat: "51.5074", lng: "-0.1278" },
  { n: "Tokyo", lat: "35.6762", lng: "139.6503" },
  { n: "San Francisco", lat: "37.7749", lng: "-122.4194" },
];

const ECC = [
  { v: "L", pct: "7%", tip: "Low — smallest code, best for clean digital screens." },
  { v: "M", pct: "15%", tip: "Medium — balanced default for most uses." },
  { v: "Q", pct: "25%", tip: "Quartile — good for print with minor wear." },
  { v: "H", pct: "30%", tip: "High / Durable — survives damage or a centered logo." },
] as const;
type Ecc = (typeof ECC)[number]["v"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Studio() {
  const [cat, setCat] = useState<Category>("url");
  const [fields, setFields] = useState(DEFAULTS);
  const [ecc, setEcc] = useState<Ecc>("M");
  const [manualKey, setManualKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("qruniverse_rapidapi_key") || "";
    }
    return "";
  });
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(manualKey);

  const envKey = (import.meta.env.VITE_RAPIDAPI_KEY || "").trim();
  const effectiveKey = (manualKey || envKey).trim();

  const f = fields[cat];
  const set = (k: FieldKey, v: string) => setFields((p) => ({ ...p, [cat]: { ...p[cat], [k]: v } }));
  const inp = (k: FieldKey, ph = "", type = "text") => (
    <Input type={type} value={f[k] ?? ""} placeholder={ph} onChange={(e) => set(k, e.target.value)} className="bg-background/60" />
  );

  const payload = useMemo(() => buildPayload(cat, f), [cat, f]);

  const { svg, loading, error, missingKey } = useRapidApiQr(payload, ecc, effectiveKey);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    setManualKey(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem("qruniverse_rapidapi_key", trimmed);
        toast.success("RapidAPI key saved locally");
      } else {
        localStorage.removeItem("qruniverse_rapidapi_key");
        toast.info("RapidAPI key removed");
      }
    }
    setKeyDialogOpen(false);
  };

  const download = () => {
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `qruniverse-${cat}.svg` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async (text: string, msg = "Copied to clipboard") => {
    await navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-grid">
        <header className="sticky top-0 z-20 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="grid size-7 place-items-center rounded-md bg-gradient-glow">
                <div className="grid grid-cols-2 gap-0.5">
                  {[0, 1, 2, 3].map((i) => <span key={i} className={`size-1.5 rounded-[1px] ${i === 2 ? "bg-transparent" : "bg-background"}`} />)}
                </div>
              </div>
              <span className="font-semibold tracking-tight">QRUNIVERSE</span>
              <span className="hidden rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
                <span className="text-gradient">●</span> Cloud API Studio
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a href={PLAYGROUND_URL} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground md:flex">
                <Globe className="size-3.5 text-glow" /> Web Playground <ExternalLink className="size-3 opacity-60" />
              </a>
              <a href={RAPIDAPI} target="_blank" rel="noreferrer" className="hidden items-center gap-1 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground lg:flex">
                RapidAPI Hub <ExternalLink className="size-3.5" />
              </a>
              <Button
                size="sm"
                variant={effectiveKey ? "secondary" : "outline"}
                className={`text-xs border ${effectiveKey ? "border-glow/30 text-foreground" : "border-amber-500/40 text-amber-300"}`}
                onClick={() => {
                  setKeyInput(effectiveKey);
                  setKeyDialogOpen(true);
                }}
              >
                <Key className="size-3.5" />
                <span className="hidden sm:inline">
                  {effectiveKey ? "API Key Connected" : "Connect API Key"}
                </span>
                {effectiveKey && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
              </Button>
              <McpDialog onCopy={copy} />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Pixel-perfect QR codes, <span className="text-gradient">as pure vectors.</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Production-ready developer client for the QRUNIVERSE Cloud API. Ingest sensitive data via zero-log POST endpoints.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-glow/20 bg-glow/5 px-3 py-1.5">
                ⚡ <span className="text-glow font-medium">High-Performance Cloud Execution</span> · 100% Service Level
              </span>
              <a href={PLAYGROUND_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-glow hover:underline">
                Looking for the zero-config client-side demo? Open Web Playground <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* LEFT COLUMN: Input Forms */}
            <section className="min-w-0 rounded-xl border border-border bg-card/80 p-5 backdrop-blur">
              <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border bg-background/50 p-1.5">
                {CATS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCat(id)}
                    className={`flex flex-col items-center gap-1 rounded-md px-2 py-2.5 text-xs transition-all ${
                      cat === id ? "bg-accent text-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {cat === "url" && (
                  <Field label="URL">
                    {inp("url", "https://example.com")}
                    <p className="font-mono text-[11px] text-muted-foreground">https:// is added automatically</p>
                  </Field>
                )}
                {cat === "wifi" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Network name (SSID)">{inp("ssid", "OfficeHQ_5G")}</Field>
                      <Field label="Password">{inp("password", "SecretPassword2026", "password")}</Field>
                    </div>
                    <Field label="Security">
                      <div className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-background/50 p-1">
                        {["WPA3", "WPA", "WEP", "None"].map((s) => (
                          <button
                            key={s}
                            onClick={() => set("security", s)}
                            className={`rounded-md py-1.5 text-xs font-medium transition-colors ${f.security === s ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5">
                      <Label className="text-sm">Hidden SSID</Label>
                      <Switch checked={f.hidden === "true"} onCheckedChange={(v) => set("hidden", String(v))} />
                    </div>
                  </>
                )}
                {cat === "vcard" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name">{inp("name", "Ada Lovelace")}</Field>
                    <Field label="Job title">{inp("title", "Chief Architect")}</Field>
                    <Field label="Company">{inp("org", "Analytical Co.")}</Field>
                    <Field label="Email">{inp("email", "ada@example.com", "email")}</Field>
                    <Field label="Mobile phone">{inp("mobile", "+1 555 0100", "tel")}</Field>
                    <Field label="Work phone">{inp("work", "+1 555 0199", "tel")}</Field>
                    <div className="sm:col-span-2"><Field label="Address">{inp("address", "123 Innovation Way, Tech City")}</Field></div>
                    <Field label="LinkedIn">{inp("linkedin", "linkedin.com/in/ada")}</Field>
                    <Field label="Twitter / X">{inp("twitter", "x.com/ada")}</Field>
                    <Field label="GitHub">{inp("github", "github.com/ada")}</Field>
                  </div>
                )}
                {cat === "event" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Field label="Event title">{inp("title", "Product Launch Keynote")}</Field></div>
                    <Field label="Start">{inp("start", "", "datetime-local")}</Field>
                    <Field label="End">{inp("end", "", "datetime-local")}</Field>
                    <Field label="Location">{inp("location", "Convention Center Hall A")}</Field>
                    <Field label="Event URL">{inp("url", "https://example.com/event")}</Field>
                    <div className="sm:col-span-2">
                      <Field label="Description">
                        <Textarea value={f.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Live demo and Q&A session..." className="bg-background/60" />
                      </Field>
                    </div>
                  </div>
                )}
                {cat === "geo" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Latitude">{inp("lat", "40.4168", "number")}</Field>
                      <Field label="Longitude">{inp("lng", "-3.7038", "number")}</Field>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map((c) => (
                        <button
                          key={c.n}
                          onClick={() => setFields((p) => ({ ...p, geo: { lat: c.lat, lng: c.lng } }))}
                          className={`rounded-full border border-border px-3 py-1 text-xs transition-colors hover:bg-secondary ${f.lat === c.lat ? "bg-accent text-foreground" : "text-muted-foreground"}`}
                        >
                          {c.n}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {cat === "phone" && <Field label="International phone number">{inp("phone", "+1 555 0100", "tel")}</Field>}
                {cat === "sms" && (
                  <>
                    <Field label="Phone number">{inp("phone", "+1 555 0100", "tel")}</Field>
                    <Field label="Message">
                      <Textarea value={f.message ?? ""} onChange={(e) => set("message", e.target.value)} placeholder="Hello from QRUNIVERSE!" className="bg-background/60" />
                    </Field>
                  </>
                )}
                {cat === "email" && (
                  <>
                    <Field label="To">{inp("to", "contact@example.com", "email")}</Field>
                    <Field label="Subject">{inp("subject", "Partnership Inquiry")}</Field>
                    <Field label="Body">
                      <Textarea value={f.body ?? ""} onChange={(e) => set("body", e.target.value)} placeholder="Hi there, I would like to learn more..." className="bg-background/60" />
                    </Field>
                  </>
                )}
              </div>

              <div className="mt-8 border-t border-border pt-5">
                <Label className="text-xs font-medium text-muted-foreground">Error correction level (ISO/IEC 18004)</Label>
                <div className="mt-2 grid grid-cols-4 gap-1 rounded-lg border border-border bg-background/50 p-1">
                  {ECC.map((e) => (
                    <Tooltip key={e.v}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setEcc(e.v)}
                          className={`rounded-md py-2 text-sm transition-all ${ecc === e.v ? "bg-accent text-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <span className="font-semibold">{e.v}</span>{" "}
                          <span className="font-mono text-[11px] opacity-70">{e.pct}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{e.tip}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: Live Canvas & Cloud Connection */}
            <section className="min-w-0 space-y-4">
              <div className="rounded-xl border border-border bg-card/80 p-5 backdrop-blur">
                <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${effectiveKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    {effectiveKey ? "RapidAPI Live Engine" : "Awaiting API Key"}
                  </span>
                  <span>ECC · {ecc}</span>
                </div>

                <div className="relative mx-auto aspect-square w-full max-w-sm">
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-glow opacity-20 blur-2xl" />

                  {missingKey ? (
                    <div className="relative flex size-full flex-col items-center justify-center rounded-2xl border border-border bg-card/90 p-6 text-center shadow-glow">
                      <div className="grid size-12 place-items-center rounded-xl bg-gradient-glow text-primary-foreground shadow-glow mb-3">
                        <Key className="size-6 text-background" />
                      </div>
                      <h3 className="text-base font-semibold tracking-tight">RapidAPI Key Required</h3>
                      <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                        This studio connects to the QRUNIVERSE Cloud API. Get your free API key (1,000 req/mo included) or enter it below.
                      </p>
                      <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
                        <Button asChild size="sm" className="bg-gradient-glow text-primary-foreground text-xs">
                          <a href={RAPIDAPI} target="_blank" rel="noreferrer">
                            Get Free Key on RapidAPI <ExternalLink className="size-3 ml-1" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs border border-border"
                          onClick={() => {
                            setKeyInput(manualKey);
                            setKeyDialogOpen(true);
                          }}
                        >
                          Enter API Key Manually
                        </Button>
                      </div>
                      <p className="mt-3 text-[11px] text-muted-foreground">
                        Or explore the zero-config{" "}
                        <a href={PLAYGROUND_URL} target="_blank" rel="noreferrer" className="text-glow underline">
                          Web Playground
                        </a>
                      </p>
                    </div>
                  ) : error ? (
                    <div className="relative flex size-full flex-col items-center justify-center rounded-2xl border border-destructive/40 bg-card/90 p-6 text-center shadow-glow">
                      <AlertCircle className="size-10 text-destructive mb-2" />
                      <h4 className="text-sm font-semibold text-foreground">Cloud API Error</h4>
                      <p className="mt-1 text-xs text-muted-foreground max-w-xs">{error}</p>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => setKeyDialogOpen(true)}>
                          Update Key
                        </Button>
                        <Button size="sm" asChild className="text-xs bg-gradient-glow text-primary-foreground">
                          <a href={RAPIDAPI} target="_blank" rel="noreferrer">
                            Check Plan on RapidAPI <ExternalLink className="size-3 ml-1" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="relative grid size-full place-items-center rounded-2xl bg-canvas p-4 text-canvas-foreground shadow-glow">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-8 animate-spin text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">Rendering Vector SVG...</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative grid size-full place-items-center rounded-2xl bg-canvas p-4 text-canvas-foreground shadow-glow [&_svg]:size-full"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  )}
                </div>

                <p className="mt-4 truncate text-center font-mono text-[11px] text-muted-foreground" title={payload}>
                  {payload.split("\n")[0]}
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Button onClick={download} disabled={!svg || loading} className="text-xs">
                    <Download className="size-3.5" /> Download SVG
                  </Button>
                  <Button variant="secondary" onClick={() => copy(svg, "SVG code copied")} disabled={!svg || loading} className="text-xs">
                    <Copy className="size-3.5" /> Copy SVG Code
                  </Button>
                </div>
              </div>

              {/* Expandable Code Drawer */}
              <CodeDrawer payload={payload} ecc={ecc} apiKey={effectiveKey} onCopy={copy} />

              <a
                href={RAPIDAPI}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card/80 px-4 py-3.5 backdrop-blur transition-colors hover:border-glow/40"
              >
                <span className="flex min-w-0 items-center gap-3 text-sm">
                  <Code2 className="size-4 shrink-0 text-glow" />
                  <span className="text-muted-foreground">
                    Looking for the Developer API? <span className="text-foreground">Explore all endpoints &amp; code recipes on RapidAPI</span>
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-glow transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </section>
          </div>

          {/* Bottom Conversion Banners */}
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card/80 p-5 shadow-glow md:flex-row md:items-center">
            <p className="flex items-start gap-3 text-sm">
              <Zap className="mt-0.5 size-4 shrink-0 text-glow" />
              <span>
                <strong className="font-semibold">Production-ready Cloud API:</strong>{" "}
                <span className="text-muted-foreground">Ingest sensitive data via zero-log POST endpoints.</span>
              </span>
            </p>
            <Button asChild className="h-auto max-w-full whitespace-normal bg-gradient-glow py-2 text-primary-foreground hover:opacity-90">
              <a href={RAPIDAPI} target="_blank" rel="noreferrer">
                Get Free API Key on RapidAPI · 1,000 req/mo free <ExternalLink className="size-3.5 ml-1" />
              </a>
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-3 border-l-2 border-glow pl-4 text-sm leading-relaxed">
            <Zap className="mt-0.5 size-4 shrink-0 text-glow" />
            <p className="min-w-0 text-muted-foreground">
              Need high-volume automated generation for your backend or AI agents?{" "}
              <Button asChild variant="link" className="inline h-auto whitespace-normal p-0 text-left text-glow">
                <a href={RAPIDAPI} target="_blank" rel="noreferrer">
                  Get an API Key on RapidAPI (1,000 free requests/mo).
                </a>
              </Button>
            </p>
          </div>
        </main>

        {/* RapidAPI Key Modal */}
        <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="size-4 text-glow" /> RapidAPI Key Configuration
              </DialogTitle>
              <DialogDescription>
                Configure your API key to activate live vector generation through the Cloud API.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">RapidAPI Key</Label>
                <Input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Paste your RapidAPI key here..."
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Saved only in your local browser storage. Alternatively, define <code className="text-glow">VITE_RAPIDAPI_KEY</code> in <code className="text-glow">.env</code>.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Don't have an API key yet?</p>
                <p>Subscribe to the Free Plan on RapidAPI to get 1,000 requests/month with zero cost:</p>
                <Button asChild size="sm" variant="outline" className="w-full text-xs mt-1">
                  <a href={RAPIDAPI} target="_blank" rel="noreferrer">
                    Get Free Key on RapidAPI <ExternalLink className="size-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              {manualKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setKeyInput("");
                    setManualKey("");
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("qruniverse_rapidapi_key");
                    }
                    setKeyDialogOpen(false);
                    toast.info("Key removed");
                  }}
                >
                  Clear Key
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setKeyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="bg-gradient-glow text-primary-foreground" onClick={handleSaveKey}>
                  Save &amp; Connect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function CodeDrawer({
  payload,
  ecc,
  apiKey,
  onCopy,
}: {
  payload: string;
  ecc: string;
  apiKey: string;
  onCopy: (t: string) => void;
}) {
  const displayKey = apiKey || "$RAPIDAPI_KEY";
  const body = JSON.stringify({ text: payload, level: ecc });

  const snippets = {
    curl: `curl -X POST "https://${RAPIDAPI_HOST}/qr" \\
  -H "Content-Type: application/json" \\
  -H "x-rapidapi-host: ${RAPIDAPI_HOST}" \\
  -H "x-rapidapi-key: ${displayKey}" \\
  -d '${body.replace(/'/g, "'\\''")}'`,
    js: `const res = await fetch("https://${RAPIDAPI_HOST}/qr", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-host": "${RAPIDAPI_HOST}",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY || "${displayKey}",
  },
  body: JSON.stringify(${JSON.stringify({ text: payload, level: ecc }, null, 2).replace(/\n/g, "\n  ")}),
});
const svg = await res.text();`,
    python: `import os, requests

res = requests.post(
    "https://${RAPIDAPI_HOST}/qr",
    headers={
        "Content-Type": "application/json",
        "x-rapidapi-host": "${RAPIDAPI_HOST}",
        "x-rapidapi-key": os.environ.get("RAPIDAPI_KEY", "${displayKey}"),
    },
    json=${JSON.stringify({ text: payload, level: ecc })},
)
svg = res.text`,
  };

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur">
      <Tabs defaultValue="curl">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Code2 className="size-4 text-glow" /> API Code
          </span>
          <TabsList className="h-8">
            <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
            <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
            <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
          </TabsList>
        </div>
        {(Object.keys(snippets) as (keyof typeof snippets)[]).map((k) => (
          <TabsContent key={k} value={k} className="relative m-0">
            <pre className="max-h-64 overflow-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              <code>{snippets[k]}</code>
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 size-7"
              onClick={() => onCopy(snippets[k])}
            >
              <Copy className="size-3.5" />
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

const MCP_JSON = JSON.stringify(
  {
    mcpServers: {
      qruniverse: {
        command: "npx",
        args: [
          "-y",
          "mcp-remote",
          "https://mcp.rapidapi.com/apexcorelabs-apexcorelabs-default/qruniverse-vector-qr-code-generator2",
        ],
        env: {
          RAPIDAPI_KEY: "<your-rapidapi-key>",
        },
      },
    },
  },
  null,
  2
);

const VSCODE_JSON = JSON.stringify(
  {
    servers: {
      qruniverse: {
        type: "stdio",
        command: "npx",
        args: [
          "-y",
          "mcp-remote",
          "https://mcp.rapidapi.com/apexcorelabs-apexcorelabs-default/qruniverse-vector-qr-code-generator2",
        ],
        env: {
          RAPIDAPI_KEY: "<your-rapidapi-key>",
        },
      },
    },
  },
  null,
  2
);

const CLIENTS = [
  { id: "claude", name: "Claude Desktop", path: "~/Library/Application Support/Claude/claude_desktop_config.json", json: MCP_JSON },
  { id: "cursor", name: "Cursor", path: "~/.cursor/mcp.json", json: MCP_JSON },
  { id: "vscode", name: "VS Code", path: ".vscode/mcp.json", json: VSCODE_JSON },
];

function McpDialog({ onCopy }: { onCopy: (t: string, m?: string) => void }) {
  const [copied, setCopied] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="border border-border text-xs">
          <Bot className="size-3.5" /> <span className="hidden sm:inline">Claude / Cursor</span> MCP Setup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] min-w-0 max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add QRUNIVERSE as an MCP tool</DialogTitle>
          <DialogDescription>
            Let your AI assistant generate vector QR codes directly. Paste the config, add your RapidAPI key, and restart the client.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="claude" className="min-w-0">
          <TabsList>
            {CLIENTS.map((c) => <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>)}
          </TabsList>
          {CLIENTS.map((c) => (
            <TabsContent key={c.id} value={c.id} className="min-w-0 space-y-2">
              <p className="break-all font-mono text-[11px] text-muted-foreground">{c.path}</p>
              <div className="relative min-w-0 rounded-lg border border-border bg-background">
                <pre className="max-w-full overflow-auto p-4 pt-12 font-mono text-xs leading-relaxed">{c.json}</pre>
                <Button
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => {
                    onCopy(c.json, `${c.name} config copied`);
                    setCopied(c.id);
                    setTimeout(() => setCopied(""), 1500);
                  }}
                >
                  {copied === c.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Copy JSON
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
