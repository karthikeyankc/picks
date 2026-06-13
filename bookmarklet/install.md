# Bookmarklet install

## 1. Create a GitHub fine-grained PAT

Go to: GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token

- Repository access: **Only `picks`**
- Permissions → Contents: **Read and write**

Copy the token (starts with `ghp_`).

## 2. Edit the bookmarklet source

Open `bookmarklet.js`, replace:
```
const GITHUB_TOKEN = 'ghp_YOUR_TOKEN_HERE';
```
with your actual token.

## 3. Minify + install

Paste the full content of `bookmarklet.js` into https://minify-js.com (or `npx terser`), then:

1. Wrap the output: `javascript:(function(){MINIFIED_CODE_HERE})();`
2. In Chrome/Safari/Firefox: **Bookmarks → Add bookmark**
3. Set the Name to `+ Pick`
4. Paste the `javascript:(...)` string as the URL
5. Save it to your bookmarks bar

## 4. Use it

Navigate to any page → click `+ Pick` in your bar → fill in theme + tags → Save.

The GitHub Action runs within ~15s and rebuilds `index.json`.
Your site reads `index.json` directly — no Lucid rebuild needed.
