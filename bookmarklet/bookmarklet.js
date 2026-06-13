// ─── Picks Bookmarklet — unminified source ───────────────────────────────────
// Minify and wrap in: javascript:(function(){MINIFIED})();
// Paste the result as a bookmark URL — token stays in your browser only, never in git.
//
// CONFIGURATION — fill in before minifying:
const GITHUB_TOKEN = 'ghp_YOUR_TOKEN_HERE';   // fine-grained PAT: contents:write on picks repo only
const GITHUB_OWNER = 'karthikeyankc';
const GITHUB_REPO  = 'picks';
const THEMES = ['design','philosophy','consciousness','writing','tech','science','life'];

(function () {
  if (document.getElementById('__picks-overlay')) return;

  function og(prop) {
    const el = document.querySelector(`meta[property="og:${prop}"], meta[name="${prop}"]`);
    return el ? el.getAttribute('content') || '' : '';
  }
  const pageUrl   = location.href;
  const pageTitle = og('title') || document.title || '';
  const pageDesc  = og('description') || '';
  const pageImage = og('image') || '';

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  }

  const today = new Date().toISOString().slice(0, 10);

  const style = document.createElement('style');
  style.textContent = `
    #__picks-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #__picks-box{background:#fff;border-radius:12px;padding:24px;width:420px;max-width:calc(100vw - 32px);box-shadow:0 8px 40px rgba(0,0,0,.22);display:flex;flex-direction:column;gap:12px}
    #__picks-box h2{margin:0;font-size:14px;font-weight:700;color:#111;letter-spacing:-.01em}
    #__picks-box label{font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:3px}
    #__picks-box input,#__picks-box select,#__picks-box textarea{width:100%;box-sizing:border-box;padding:7px 10px;border:1px solid #ddd;border-radius:7px;font-size:13px;color:#111;background:#fafafa;outline:none}
    #__picks-box input:focus,#__picks-box select:focus,#__picks-box textarea:focus{border-color:#6366f1;background:#fff}
    #__picks-box textarea{resize:vertical;min-height:56px}
    #__picks-box .__picks-row{display:flex;gap:8px}
    #__picks-box .__picks-row>div{flex:1}
    #__picks-box .__picks-actions{display:flex;gap:8px;margin-top:4px}
    #__picks-btn-save{flex:1;padding:9px;background:#111;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
    #__picks-btn-save:hover{background:#333}
    #__picks-btn-save:disabled{background:#999;cursor:not-allowed}
    #__picks-btn-cancel{padding:9px 16px;background:#f3f4f6;color:#555;border:none;border-radius:8px;font-size:13px;cursor:pointer}
    #__picks-status{font-size:12px;color:#555;text-align:center;min-height:16px}
    #__picks-archive{font-size:11px;color:#aaa;word-break:break-all}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = '__picks-overlay';
  overlay.innerHTML = `
    <div id="__picks-box">
      <h2>+ Pick</h2>
      <div>
        <label>Title</label>
        <input id="__p-title" value="${pageTitle.replace(/"/g,'&quot;')}" />
      </div>
      <div>
        <label>URL</label>
        <input id="__p-url" value="${pageUrl.replace(/"/g,'&quot;')}" />
      </div>
      <div>
        <label>Description</label>
        <textarea id="__p-desc">${pageDesc}</textarea>
      </div>
      <div class="__picks-row">
        <div>
          <label>Theme</label>
          <select id="__p-theme">
            ${THEMES.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Tags (comma separated)</label>
          <input id="__p-tags" placeholder="e.g. typography, tools" />
        </div>
      </div>
      <div>
        <label>Note <span style="font-weight:400;color:#aaa">(optional)</span></label>
        <textarea id="__p-note" style="min-height:42px" placeholder="Why this stuck."></textarea>
      </div>
      <div id="__picks-archive">Checking Wayback Machine…</div>
      <div class="__picks-actions">
        <button id="__picks-btn-cancel">Cancel</button>
        <button id="__picks-btn-save">Save pick</button>
      </div>
      <div id="__picks-status"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── Fetch closest Wayback snapshot ──
  let archiveUrl = '';
  fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(pageUrl)}`)
    .then(r => r.json())
    .then(data => {
      const snap = data.archived_snapshots && data.archived_snapshots.closest;
      if (snap && snap.available) {
        archiveUrl = snap.url;
        document.getElementById('__picks-archive').textContent = `Archive: ${archiveUrl}`;
      } else {
        // No snapshot — trigger one silently, store the save URL
        archiveUrl = `https://web.archive.org/save/${pageUrl}`;
        fetch(archiveUrl).catch(() => {});
        document.getElementById('__picks-archive').textContent = `No snapshot found — archiving now.`;
      }
    })
    .catch(() => {
      document.getElementById('__picks-archive').textContent = 'Could not reach Wayback Machine.';
    });

  document.getElementById('__picks-btn-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('__picks-btn-save').onclick = async function () {
    const btn    = this;
    const status = document.getElementById('__picks-status');
    const title  = document.getElementById('__p-title').value.trim();
    const url    = document.getElementById('__p-url').value.trim();
    const desc   = document.getElementById('__p-desc').value.trim();
    const theme  = document.getElementById('__p-theme').value;
    const tags   = document.getElementById('__p-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
    const note   = document.getElementById('__p-note').value.trim();

    if (!title || !url) { status.textContent = 'Title and URL are required.'; return; }

    const id   = `${today}-${slugify(title)}`;
    const pick = { id, url, title, description: desc, theme, tags, date: today, note, image: pageImage, archive_url: archiveUrl };
    if (!pick.note) delete pick.note;
    if (!pick.image) delete pick.image;
    if (!pick.archive_url) delete pick.archive_url;

    const filePath = `picks/${id}.json`;
    const content  = btoa(unescape(encodeURIComponent(JSON.stringify(pick, null, 2))));

    btn.disabled = true;
    status.textContent = 'Saving…';

    try {
      let sha;
      const check = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' } }
      );
      if (check.ok) { const j = await check.json(); sha = j.sha; }

      const body = { message: `pick: ${title}`, content };
      if (sha) body.sha = sha;

      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (res.ok) {
        status.textContent = '✓ Saved.';
        btn.textContent = 'Saved ✓';
        setTimeout(() => overlay.remove(), 1600);
      } else {
        const err = await res.json();
        status.textContent = `Error: ${err.message}`;
        btn.disabled = false;
      }
    } catch (e) {
      status.textContent = `Network error: ${e.message}`;
      btn.disabled = false;
    }
  };
})();
