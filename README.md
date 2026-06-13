# 1st Nation Foundation — 1stnation.us

**Reclaim Your Indigenous Status.** A multi-page educational and advocacy site for Afro-Indigenous descendants: the history of racial reclassification (the Dawes Rolls, paper genocide), the modern fight for sovereignty, a step-by-step reclamation guide, and a contact form for requesting guidance.

## Stack

- **Pure static HTML/CSS/JS** — no frameworks, no build step
- **Zero-dependency Node server** (`server.js`) for Railway hosting, with:
  - Static file serving with pretty URLs (`/history` → `history.html`)
  - Custom 404 page
  - **`POST /api/contact`** — a secure server-side proxy to Airtable (your token never touches the browser)

## Site Map

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Ledger hero, mission, pillars, CTAs |
| The Paper Trail | `history.html` | Dawes Rolls, Plecker / paper genocide, timeline |
| The Modern Fight | `sovereignty.html` | Court victories, GAO numbers, advocacy |
| Reclaim Your Status | `reclaim.html` | 7-step Dawes search & reclamation guide |
| Resources | `resources.html` | Archives, institutions, journalism, books, orgs |
| Contact | `contact.html` | Airtable-connected inquiry form |

## Deploy: GitHub → Railway

1. Create a GitHub repo (e.g. `1stnation-us`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "1st Nation Foundation — initial site"
   git branch -M main
   git remote add origin git@github.com:YOUR_USERNAME/1stnation-us.git
   git push -u origin main
   ```
2. In Railway: **New Project → Deploy from GitHub repo** → select the repo. Railway auto-detects Node and runs `npm start`.
3. In the Railway service → **Settings → Networking → Custom Domain**, add `1stnation.us` (and `www.1stnation.us`) and create the CNAME records Railway gives you at your DNS provider.

## Connect the Contact Form to Airtable

The form posts to `/api/contact` on this same service; `server.js` forwards it to Airtable using environment variables, keeping your token server-side.

### 1. Create the Airtable table
In your base, create a table (e.g. **Inquiries**) with these fields (single-line text unless noted):

- `Name`
- `Email` (Email)
- `Phone` (Phone)
- `State`
- `Ancestral Tribe (if known)` (Single select: Unknown, Cherokee, Choctaw, Chickasaw, Muscogee (Creek), Seminole, Other Nation (recognized or unrecognized))
- `Searched Dawes Rolls` (Single select: Not yet, Yes — found an ancestor, Yes — still searching)
- `Message` (Long text)
- `Consent` (Single select: Yes, No)
- `Submitted` (Date, include time)

> The server sends `typecast: true`, so Airtable will create select options automatically on first submission if they don't exist.

### 2. Create a Personal Access Token
Airtable → Developer Hub → **Personal access tokens** → Create token with scope `data.records:write` and access to your base.

### 3. Set Railway environment variables
In the Railway service → **Variables**:

| Variable | Value |
|---|---|
| `AIRTABLE_TOKEN` | your PAT (`pat...`) |
| `AIRTABLE_BASE` | your base ID (`app...` — find it in the base's API docs URL) |
| `AIRTABLE_TABLE` | `Inquiries` (or your table name) |

Redeploy. Submissions now flow: **site form → /api/contact → Airtable**.

### Field name changes
If you rename Airtable fields, update the matching keys in `js/main.js` (the `payload.fields` object).

## Local Development

```bash
node server.js
# → http://localhost:3000
```

The form will return a friendly error locally unless you export the three Airtable env vars first.

## Design System

Derived from the 1st Nation Foundation logo:

| Token | Hex | Use |
|---|---|---|
| INK | `#0e0a0c` | Dark bands, header, footer |
| OXBLOOD | `#5e1a24` | Primary accent, rules, buttons |
| BRASS | `#c99b3f` | Highlights, reclaimed identity, CTAs |
| PARCHMENT | `#f1e8d8` | Light content bands |
| BONE | `#fbf7ee` | Cards, body background |

Type: Georgia (display, italic emphasis) + Helvetica Neue (body). Signature motif: **The Ledger** — ruled record lines and struck-through reclassifications resolving to "Indigenous" in brass.

## Accessibility & Performance

- Semantic HTML, skip-friendly structure, `aria-current` nav states
- Visible focus styles; `prefers-reduced-motion` respected
- System fonts only — zero external requests; images cached 24h
- Fully responsive to mobile

---

*Reclassified no more.*
