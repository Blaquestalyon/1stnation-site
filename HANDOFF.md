# 1st Nation Foundation — Site Handoff

**Last updated:** June 13, 2026
**Status:** Production. Live at [https://www.1stnation.us](https://www.1stnation.us) (Railway) and the Railway preview [https://1stnation-site-production.up.railway.app](https://1stnation-site-production.up.railway.app).
**Owner:** Jay Davis (admin@power-in-numbers.net)

---

## 1. Quick orientation for a new session

Paste this into a new thread to get the agent fully oriented:

> I'm continuing work on the 1st Nation Foundation site.
> - Repo: https://github.com/Blaquestalyon/1stnation-site (default branch `main`)
> - Live: https://www.1stnation.us (Railway) — preview at https://1stnation-site-production.up.railway.app
> - Workspace path: `/home/user/workspace/1stnation/`
> - The handoff doc is at `/home/user/workspace/1stnation/HANDOFF.md` — please read it first.
> - For GitHub operations, use the GitHub connector via `gh`/`git` CLI with `api_credentials=["github"]`, not browser_task.

If the workspace is empty in a fresh session, the agent should re-clone:

```bash
cd /home/user/workspace && git clone https://github.com/Blaquestalyon/1stnation-site.git 1stnation
cd 1stnation && git config user.email "admin@power-in-numbers.net" && git config user.name "Jay Davis"
```

---

## 2. Stack & hosting

| Layer | Choice | Notes |
|---|---|---|
| Source control | GitHub — `Blaquestalyon/1stnation-site`, branch `main` | Public repo |
| Hosting | Railway (auto-deploys on every push to `main`) | Project: `1stnation-site-production` |
| Custom domain | `1stnation.us` + `www.1stnation.us` | DNS points at Railway |
| Server | Node.js (zero deps) — `server.js` | Railway runs `npm start` |
| Frontend | Static HTML + CSS + a small JS file | No build step, no framework |
| Form backend | `/api/contact` proxy → Airtable REST API | Configured via Railway env vars |

Railway rebuilds take **~80–260 seconds** from push to live. To trigger a redeploy without code changes, push an empty commit: `git commit --allow-empty -m "chore: trigger Railway redeploy"`.

---

## 3. Project structure

```
/home/user/workspace/1stnation/
├── index.html              Home — hero, the three doors pillar, ledger erasure ribbon
├── history.html            Five-entry editorial timeline + page timeline ribbon
├── sovereignty.html        Real Count + Why the True Number Is Much Larger + Victories
├── reclaim.html            Five-step lineage reclamation workflow
├── resources.html          Linked archives, books, organizations
├── contact.html            Request form (posts to /api/contact)
├── 404.html                Fallback page
├── server.js               Node HTTP server: static files + pretty URLs + Airtable proxy
├── package.json            "start": "node server.js"
├── README.md               Public-facing repo readme
├── css/styles.css          All site styling — single file
├── js/main.js              Contact form submit handler, reveal-on-scroll, nav
└── images/                 Logo, hero family photo, generated illustrations
```

### Routing (server.js)

- `/` → `index.html`
- `/history` → `history.html` (and same pretty-URL pattern for `/sovereignty`, `/reclaim`, `/resources`, `/contact`)
- `/api/contact` (POST) → forwards `{ fields: { ... } }` payload to Airtable with `typecast: true`
- Anything else → `404.html`

---

## 4. Design system (preserve these — do not let an agent overwrite them)

### Color palette (CSS custom properties in `css/styles.css`)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0e0a0c` | Primary dark — backgrounds, body text on light |
| `--brass` | `#c99b3f` | Primary accent, brass buttons, medallion ring |
| `--brass-light` | `#e2c277` | Highlights, link hover on dark bands |
| `--oxblood` | `#5e1a24` | Secondary accent, oxblood buttons, thin outlines |
| `--parchment` | `#f1e8d8` | Soft warm surface |
| `--bone` | `#fbf7ee` | Lightest surface, body background |

### Critical CSS rules that MUST be preserved

These were added on top of the original zip and are essential to the polished look. If you ever apply a fresh zip dump, you must re-apply these:

1. **`.brand .logo-plate`** (~lines 143–169) — circular header medallion: 72×72, brass ring + thin oxblood outline + ink interior + brightness/contrast filter on the inner `<img>`.
2. **`.hero-right`, `.hero-medallion`, `.hero-medallion-plate`** (~lines 266–318) — the large feature medallion above the family photo on `index.html`. Sized `clamp(180px, 22vw, 240px)`.
3. **`.band.dark a:not(.btn) { color: var(--brass-light); }`** (~line 250–251) — the `:not(.btn)` is critical. Without it, `.btn-brass` text turns wash-light on brass and becomes unreadable.
4. **`.site-header .wrap { min-height: 92px; }`** — raised from the original 76px to fit the medallion.

### Critical HTML wrappers that MUST be preserved

1. **All 6 pages** wrap the header logo in `<span class="logo-plate"><img src="images/logo.png" .../></span>`. Bare `<img>` will look broken — black logo on near-black header.
2. **`index.html` hero** uses `<div class="hero-right reveal">` wrapping the `.hero-medallion` plus the family-porch `<figure>`. Replacing this with a bare figure removes the feature medallion.

---

## 5. Voice & editorial principles

The site's voice was hard-won. Future copy edits should respect it:

- **Reframing, not advocacy.** The site doesn't argue — it shows the receipts and lets the reader draw the line.
- **Numbers are floors, not ceilings.** When citing Dawes counts (23,599 / 395,400), always frame them as the floor of a much larger truth.
- **Three doors to one truth.** The home-page pillar: (1) intermarriage erasure, (2) by-blood-but-classified-colored, (3) aboriginal Black nations that were never in the count.
- **Aboriginal Black nations** are a load-bearing concept on `history.html` (Entry 02) and `sovereignty.html`. Keep Yamasee, Washitaw, Jamassee, Garifuna, and Du Bois references intact.
- **"Mulatto"** appears in the struck-out ledger rows on the home page — it's a deliberate historical-record artifact, not a slur to scrub.

---

## 6. Workflow for content edits

The pattern that's been working:

1. User pastes new copy or uploads a zip with edits.
2. Agent makes edits **locally** in `/home/user/workspace/1stnation/`.
3. Agent runs `pplx-tool deploy_website` for a preview (asset_id chains to the same app preview card).
4. User reviews preview in-thread.
5. User says "push to GitHub."
6. Agent: `git add -A && git commit -m "..." && git push origin main` with `api_credentials=["github"]`.
7. Wait ~120 seconds, then curl-verify a few unique strings against the Railway URL.

### Important agent rules

- **Never overwrite `css/styles.css` blindly** with a zip dump. Diff first; the critical rules in section 4 are likely missing from any clean export.
- **Never strip the `.logo-plate` span** from the header on any page.
- **Never strip the `.hero-right` wrapper** from `index.html`.
- **For GitHub URLs, always use `api_credentials=["github"]` with `gh`/`git`**, not `browser_task`.
- **Railway redeploys are automatic on push to `main`** — no manual trigger needed.

---

## 7. Contact form & Airtable

The contact form posts to `/api/contact`, which forwards to Airtable.

### Required Railway environment variables

| Variable | Value |
|---|---|
| `AIRTABLE_TOKEN` | Personal Access Token starting with `pat...` — scope `data.records:write`, granted access to your base |
| `AIRTABLE_BASE` | Base ID, e.g. `appXXXXXXXXXXXXXX` |
| `AIRTABLE_TABLE` | Table name, e.g. `Contacts` (case-sensitive) |

Set these in Railway → service → **Variables** tab. Railway auto-redeploys.

### Airtable field map (exact field names — case and punctuation matter)

| Airtable field | Type | Notes |
|---|---|---|
| `Name` | Single line text | Required |
| `Email` | Email | Required |
| `Phone` | Phone number | Optional |
| `State` | Single line text | Optional |
| `Ancestral Tribe (if known)` | Single line text *(or Single select)* | Cherokee, Choctaw, Creek (Muscogee), Chickasaw, Seminole, Other / Not sure |
| `Searched Dawes Rolls` | Single line text *(or Single select)* | Yes — found an ancestor / Yes — no match yet / No — not yet |
| `Message` | Long text | Required |
| `Consent` | Single line text *(or Single select)* | `Yes` or `No` |
| `Submitted` | Date (include time) | ISO 8601 timestamp from the client |

The server uses `typecast: true`, so Single-select options will auto-create. To change Airtable field names, edit `js/main.js` (the `payload.fields` object around line 95) and push.

---

## 8. Local development

```bash
cd /home/user/workspace/1stnation
node server.js   # serves on http://localhost:3000
```

`node server.js` blocks the shell. For agent sessions, run it via `pplx-tool start_server` or `bash(background=true)`. Railway uses `process.env.PORT`; locally it defaults to 3000.

---

## 9. Known to-dos / nice-to-haves

- [ ] Confirm Airtable env vars are set in Railway (user task — agent can't see Railway dashboard).
- [ ] Verify a real form submission lands in Airtable end-to-end.
- [ ] (Optional) Add `Created Time` field in Airtable as automatic backup timestamp.
- [ ] (Optional) Add a robots.txt + sitemap.xml for SEO.
- [ ] (Optional) Add Open Graph + Twitter card meta tags page-by-page (currently has `<meta description>` only).
- [ ] (Optional) Plausible / GA analytics snippet if you want traffic data.

---

## 10. Commit history snapshot (most recent first)

```
f806f0a  Site-wide copy edits: aboriginal Black nations framing, three doors to one truth, expanded reclaim leads
24b15ae  Sovereignty: reframe the count, add 'Why the True Number Is Much Larger'
6abe986  Fix .btn-brass text wash on dark bands
dba970d  chore: trigger Railway redeploy
b7dc26d  Hero: add feature logo medallion above family photo
699de27  Header logo: brass/oxblood medallion treatment
c7605e7  1st Nation Foundation — initial site
```

---

## 11. Emergency rollback

If a push breaks the live site:

```bash
cd /home/user/workspace/1stnation
git log --oneline -10                       # find the last-known-good commit
git revert <bad-sha> --no-edit              # safer than reset for shared history
git push origin main                        # Railway redeploys in ~120s
```

Or, to roll back to a specific commit without rewriting history:

```bash
git reset --hard <good-sha>
git push --force-with-lease origin main
```

Use `--force-with-lease`, never plain `--force`.
