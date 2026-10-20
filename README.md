# QRUNIVERSE Studio — Vector QR Code Engine

[![RapidAPI](https://img.shields.io/badge/RapidAPI-QRUNIVERSE%20Hub-0052cc?style=for-the-badge&logo=rapidapi)](https://rapidapi.com/apexcorelabs-apexcorelabs-default/api/qruniverse-vector-qr-code-generator2)
[![Live Playground](https://img.shields.io/badge/Live%20Playground-Try%20it%20now-brightgreen?style=for-the-badge&logo=google-chrome)](https://qr-universe-workshop.lovable.app/)
[![Service Level](https://img.shields.io/badge/Service%20Level-100%25-brightgreen?style=for-the-badge)](https://rapidapi.com/apexcorelabs-apexcorelabs-default/api/qruniverse-vector-qr-code-generator2)
[![Performance](https://img.shields.io/badge/Performance-Ultra--Low%20Latency-blue?style=for-the-badge)](https://rapidapi.com/apexcorelabs-apexcorelabs-default/api/qruniverse-vector-qr-code-generator2)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

An open-source developer client and interactive studio powered by the **[QRUNIVERSE Cloud API](https://rapidapi.com/apexcorelabs-apexcorelabs-default/api/qruniverse-vector-qr-code-generator2)** on RapidAPI. 

Generates mathematically sharp, sub-pixel SVG vector QR codes with custom error correction (L, M, Q, H), GDPR Article 25 zero-log privacy, and native integration for **Claude Desktop**, **Cursor**, **VS Code**, and production backends.

---

## 🌐 Instant Online Playground

Looking for a zero-setup browser demo?  
👉 **[Open the Live Web Playground (qr-universe-workshop.lovable.app)](https://qr-universe-workshop.lovable.app/)**

---

## 📐 Architecture Overview

```
                          ┌──────────────────────────────────────────────┐
                          │     Live Online Playground (Lovable.app)     │
                          │   (Zero-setup, instant client-side demo)     │
                          └──────────────────────┬───────────────────────┘
                                                 │
                                                 │ References Cloud API
                                                 ▼
┌────────────────────────┐        ┌──────────────────────────────┐        ┌──────────────────────────────┐
│  Developer Studio App  │        │   RapidAPI Global Gateway    │        │  QRUNIVERSE Core Cloud Engine│
│  (This Repository)     │───────►│  (Authentication, Rate-Limit │───────►│  (High-Performance Stateless│
│  Reads from .env       │        │   & Metering: 1,000 req/mo)  │        │   Execution, Zero-Log)       │
└────────────────────────┘        └──────────────────────────────┘        └──────────────────────────────┘
            ▲                                    ▲
            │                                    │
┌───────────┴────────────┐        ┌──────────────┴───────────────┐
│ AI Agents & MCP Tools  │        │   cURL, Python, Node.js      │
│ (Claude Code, Cursor)  │        │   Backend Pipelines & Micro. │
└────────────────────────┘        └──────────────────────────────┘
```

---

## ✨ Features

- ⚡ **8 Structured Payloads**:
  - **URL**: Web links and deep-links with automatic scheme normalization
  - **Wi-Fi**: WPA, WPA2, WPA3 (SAE), and open guest networks with hidden SSID toggle
  - **vCard 3.0**: Rich digital contact cards (Name, Org, Title, Cell, Work, Email, Address, Socials)
  - **Event**: RFC 5545 iCalendar (`VEVENT`) appointments with start/end timestamps and location
  - **Geo**: RFC 5870 `geo:` coordinates with city quick-presets (Madrid, New York, London, Tokyo, SF)
  - **Phone / SMS / Email**: Direct action triggers
- 🛡️ **Error Correction**: Toggle L (7%), M (15%), Q (25%), or H (30%) for print wear resistance.
- 📐 **Vector SVG Output**: Clean `<svg>` downloads with no raster scaling artifacts.
- 🔒 **GDPR Article 25 Privacy by Design**: Sensitive credentials (passwords, contacts) are ingested strictly via POST bodies to prevent edge log leaks.
- 🤖 **Native Model Context Protocol (MCP)**: AI agents generate vector QR codes autonomously.

---

## 🚀 Quickstart & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/slimft-dev/QRuniverse-studio.git
cd QRuniverse-studio
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and insert your free RapidAPI key (1,000 requests/month included on the Free Tier):
```env
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_RAPIDAPI_HOST=qruniverse-vector-qr-code-generator2.p.rapidapi.com
```

> **Need an API key?** Get one in 30 seconds on **[RapidAPI Marketplace](https://rapidapi.com/apexcorelabs-apexcorelabs-default/api/qruniverse-vector-qr-code-generator2)**.

### 3. Install & Start Development Server
```bash
# Install dependencies
npm install

# Start local dev server (default: http://localhost:3000)
npm run dev

# Run automated test suite
npm test

# Build for production
npm run build
```

---

## 📋 Complete API Endpoints Directory

All endpoints connect via RapidAPI Gateway (`qruniverse-vector-qr-code-generator2.p.rapidapi.com`):

### 🔒 Privacy Tier (Strictly POST JSON — Zero Log Retention)

| Endpoint | Method | Required Fields | Optional Fields | Description |
| :--- | :---: | :--- | :--- | :--- |
| `/qr/wifi` | `POST` | `ssid` | `password`, `encryption` (WPA/WPA3/nopass), `is_hidden` | Ingests Wi-Fi credentials with zero password leakage in proxy logs |
| `/qr/vcard` | `POST` | `fn` or `name` | `org`, `title`, `phone`, `email`, `address`, `socials` | Rich Enterprise vCard 3.0 contact cards |
| `/qr/event` | `POST` | `summary`, `dtstart` | `dtend`, `location`, `description`, `url` | RFC 5545 iCalendar (`VEVENT`) calendar appointments |
| `/qr/phone` | `POST` | `phone` | `format`, `level` | Direct E.164 phone call trigger |
| `/qr/sms` | `POST` | `phone` | `body`, `message` | Pre-composed SMS message trigger |
| `/qr/email` | `POST` | `to` | `subject`, `body` | Pre-addressed email draft |
| `/qr/location`| `POST` | `lat`, `lng` | `format`, `level` | RFC 5870 maps navigation coordinates |

### 🌐 Public Embeds Tier (GET & POST Supported)

| Endpoint | Method | Parameters | Description |
| :--- | :---: | :--- | :--- |
| `/qr` | `POST` | `text`, `level` (L/M/Q/H), `format` (svg/json) | Enterprise payload ingest up to 2,953 bytes |
| `/qr/url` | `GET`/`POST` | `text` (URL) | Hyperlink encoder with automatic protocol normalization |
| `/qr/text` | `GET`/`POST` | `text` (String) | Raw text string encoder |
| `/health` | `GET` | *None* | Operational health check & Core engine status |

---

## 💻 Code Examples

### cURL
```bash
curl -X POST "https://qruniverse-vector-qr-code-generator2.p.rapidapi.com/qr" \
  -H "Content-Type: application/json" \
  -H "x-rapidapi-host: qruniverse-vector-qr-code-generator2.p.rapidapi.com" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY" \
  -d '{"text":"https://example.com","level":"M"}'
```

### Python (Requests)
```python
import os, requests

res = requests.post(
    "https://qruniverse-vector-qr-code-generator2.p.rapidapi.com/qr",
    headers={
        "Content-Type": "application/json",
        "x-rapidapi-host": "qruniverse-vector-qr-code-generator2.p.rapidapi.com",
        "x-rapidapi-key": os.environ["RAPIDAPI_KEY"],
    },
    json={"text": "https://example.com", "level": "M"},
)
svg_markup = res.text
```

### JavaScript / TypeScript (Fetch)
```typescript
const res = await fetch("https://qruniverse-vector-qr-code-generator2.p.rapidapi.com/qr", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-host": "qruniverse-vector-qr-code-generator2.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
  },
  body: JSON.stringify({ text: "https://example.com", level: "M" }),
});
const svgMarkup = await res.text();
```

---

## 🤖 Model Context Protocol (MCP) Setup

Connect QRUNIVERSE natively to **Claude Desktop**, **Claude Code**, or **Cursor** without installing any local server packages:

### Claude Desktop (`claude_desktop_config.json`) / Cursor (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "qruniverse": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.rapidapi.com/apexcorelabs-apexcorelabs-default/qruniverse-vector-qr-code-generator2"
      ],
      "env": {
        "RAPIDAPI_KEY": "YOUR_RAPIDAPI_KEY"
      }
    }
  }
}
```

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) + [Vite](https://vitejs.dev/)
- **UI Primitives**: [React 19](https://react.dev/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Testing**: [Vitest](https://vitest.dev/) + React Testing Library
- **Cloud Backend**: QRUNIVERSE High-Performance Cloud API (Stateless & Zero-Log)

---

## 📄 License

MIT © [ApexCore Labs](https://rapidapi.com/apexcorelabs-apexcorelabs-default)
