# picks

A GitHub repo as a personal bookmarks database. Every pick is a JSON file. A GitHub Action rebuilds a flat `index.json` on every push. Your site fetches that and renders it — no backend, no database, no CMS.

See it live: [karthikeyankc.com/library/picks](https://karthikeyankc.com/library/picks)

---

## How it works

```
bookmarklet / n8n form
        ↓
  picks/YYYY-MM-DD-slug.json   ← one file per pick, committed via GitHub API
        ↓
  GitHub Action                ← triggers on push, rebuilds index + updates config
        ↓
  index.json                   ← flat sorted array, fetched by your frontend
  config.json                  ← categories + auto-extracted tags
```

The source of truth is always the individual files in `picks/`. `index.json` and `config.json` are generated — never edit them by hand.

---

## Fork and set up

### 1. Fork this repo

Fork it, keep it public (or private — your call, but the bookmarklet uses `raw.githubusercontent.com` which requires public for unauthenticated reads).

### 2. Create a GitHub fine-grained PAT

Go to **Settings → Developer settings → Fine-grained tokens** and create a token with:
- **Repository access**: only this repo
- **Permissions**: Contents → Read and Write

Copy the token — you'll need it in the bookmarklet.

### 3. Install the bookmarklet

Open `bookmarklet/bookmarklet.min.js`. Replace `ghp_YOUR_TOKEN_HERE` with your token. Replace `karthikeyankc` in `GITHUB_OWNER` with your GitHub username. Copy the entire line and paste it as a bookmark URL in your browser.

That's it — click the bookmark on any page to save it as a pick.

### 4. Update config.json

Edit `config.json` to set your own categories:

```json
{
  "categories": ["design", "tech", "writing", "life", "other"],
  "tags": []
}
```

The `tags` array is auto-populated by the GitHub Action from your picks — don't edit it by hand.

---

## Pick schema

```json
{
  "id": "2025-06-15-some-readable-slug",
  "url": "https://example.com/article",
  "title": "Article title",
  "description": "One-liner from og:description or your own.",
  "category": "tech",
  "tags": ["ai", "creativity"],
  "date": "2025-06-15",
  "note": "Why this stuck — optional, shows as a personal annotation.",
  "image": "https://example.com/og.jpg",
  "archive_url": "https://web.archive.org/web/2025/https://example.com/article"
}
```

`note`, `image`, and `archive_url` are optional. Everything else is required.

---

## File structure

```
picks/
  YYYY-MM-DD-slug.json   ← one per pick, created by bookmarklet
index.json               ← auto-generated, sorted newest first
config.json              ← categories + extracted tags
bookmarklet/
  bookmarklet.js         ← unminified source
  bookmarklet.min.js     ← install this (replace token + owner)
n8n-workflow.json        ← optional mobile workflow (see below)
.github/workflows/
  build-index.yml        ← rebuilds index.json and config.json on push
```

---

## Saving from mobile (optional)

The bookmarklet doesn't work well on mobile browsers. `n8n-workflow.json` is an n8n workflow that gives you a form you can save to your phone's home screen. It scrapes og: tags, checks the Wayback Machine, and commits to GitHub.

Import `n8n-workflow.json` into your n8n instance and update the GitHub credentials and repo details inside the workflow nodes.

---

## Frontend

Fetch `index.json` from your site and render however you like. The shape is a plain array of pick objects sorted newest first.

```js
const picks = await fetch(
  'https://raw.githubusercontent.com/YOUR_USERNAME/picks/main/index.json'
).then(r => r.json());
```

For tags and categories (e.g. to build a filter UI), fetch `config.json`:

```js
const { categories, tags } = await fetch(
  'https://raw.githubusercontent.com/YOUR_USERNAME/picks/main/config.json'
).then(r => r.json());
```

`raw.githubusercontent.com` is CDN-cached — expect up to a few minutes of lag after the Action runs before changes appear on your site.

---

## Customising

**Add a category** — edit `config.json` directly and commit. The bookmarklet fetches it live.

**Add a tag** — just type it in the bookmarklet. After the Action runs, it'll appear in `config.json` and show up as a suggestion chip next time.

**Change the Action trigger** — `build-index.yml` runs on every push to `main`. You can add a schedule if you want a periodic rebuild.
