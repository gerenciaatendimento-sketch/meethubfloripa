:root {
  --bg: #f4f5f7;
  --surface: #ffffff;
  --surface2: #f0f1f3;
  --surface3: #e8eaed;
  --border: #e2e4e9;
  --border2: #d0d3db;
  --text: #1a1d23;
  --muted: #6b7280;
  --muted2: #9ca3af;
  --accent: #3b6ef0;
  --green: #16a34a;
  --red: #dc2626;
  --amber: #d97706;
  --purple: #7c3aed;
  --radius: 10px;
  --radius-lg: 16px;
  --shadow: 0 1px 4px rgba(0,0,0,.07);
  --shadow-md: 0 4px 16px rgba(0,0,0,.1);
  --font: 'Sora', sans-serif;
  --mono: 'DM Mono', monospace;
}

body.dark {
  --bg: #0e0f11;
  --surface: #16181c;
  --surface2: #1e2026;
  --surface3: #252830;
  --border: #2a2d35;
  --border2: #353840;
  --text: #e8eaf0;
  --muted: #6b7280;
  --muted2: #4b5563;
  --accent: #4f7fff;
  --green: #22c55e;
  --red: #ef4444;
  --amber: #f59e0b;
  --shadow: 0 1px 4px rgba(0,0,0,.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,.4);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: background .3s, color .3s;
}

button { cursor: pointer; font-family: var(--font); }
input, select, textarea { font-family: var(--font); }

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

/* BUTTONS */
.btn {
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--radius);
  border: none;
  transition: all .15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { opacity: .9; }
.btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
.btn-ghost:hover { border-color: var(--muted); }
.btn-danger { background: rgba(220,38,38,.1); color: var(--red); border: 1px solid rgba(220,38,38,.2); }
.btn-danger:hover { background: rgba(220,38,38,.18); }
.btn-success { background: rgba(22,163,74,.1); color: var(--green); border: 1px solid rgba(22,163,74,.2); }
.btn-sm { padding: 5px 12px; font-size: 12px; }
.btn-lg { padding: 12px 28px; font-size: 15px; }

/* BADGES */
.badge { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; white-space: nowrap; font-family: var(--mono); }
.badge-green { background: rgba(22,163,74,.12); color: var(--green); }
.badge-red { background: rgba(220,38,38,.12); color: var(--red); }
.badge-amber { background: rgba(217,119,6,.12); color: var(--amber); }
.badge-blue { background: rgba(59,110,240,.12); color: var(--accent); }
.badge-gray { background: var(--surface2); color: var(--muted); }

/* FORM */
.form-field { margin-bottom: 18px; }
.form-field label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: var(--muted); font-weight: 500; margin-bottom: 7px; }
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 13px;
  padding: 10px 12px;
  border-radius: var(--radius);
  outline: none;
  transition: border-color .15s;
}
.form-field textarea { resize: vertical; min-height: 90px; display: block; }
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus { border-color: var(--accent); }
.form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error { font-size: 12px; color: var(--red); margin-top: 6px; }

/* PANEL (drawer) */
.panel-overlay { position: fixed; inset: 0; z-index: 80; pointer-events: none; }
.panel-overlay.open { pointer-events: all; }
.panel-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.22); opacity: 0; transition: opacity .25s; }
.panel-overlay.open .panel-backdrop { opacity: 1; }
.panel-drawer {
  position: absolute; top: 0; right: 0; bottom: 0; width: 60%;
  background: var(--surface); border-left: 1px solid var(--border);
  box-shadow: -8px 0 32px rgba(0,0,0,.12);
  transform: translateX(100%); transition: transform .28s ease;
  overflow-y: auto; display: flex; flex-direction: column;
}
.panel-overlay.open .panel-drawer { transform: translateX(0); }
.panel-header {
  padding: 20px 24px; border-bottom: 1px solid var(--border);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  position: sticky; top: 0; background: var(--surface); z-index: 1;
}
.panel-title { font-size: 16px; font-weight: 600; color: var(--text); flex: 1; }
.panel-body { padding: 22px 24px; flex: 1; }
.panel-footer {
  padding: 16px 24px; border-top: 1px solid var(--border);
  display: flex; gap: 10px; justify-content: flex-end;
  position: sticky; bottom: 0; background: var(--surface);
}

/* TOAST */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--surface); border: 1px solid var(--border2);
  color: var(--text); font-size: 13px; padding: 12px 18px;
  border-radius: var(--radius); z-index: 9999;
  box-shadow: var(--shadow-md); animation: fadeUp .2s ease;
}
@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

/* CARD */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); }

/* LIST ITEM */
.list-item {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  margin-bottom: 8px; display: flex; align-items: center; gap: 12px; padding: 13px 16px;
  cursor: pointer; transition: border-color .15s, box-shadow .15s; box-shadow: var(--shadow);
  user-select: none;
}
.list-item:hover { border-color: var(--border2); box-shadow: var(--shadow-md); }

/* PROGRESS */
.progress-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 2px; transition: width .3s; }

/* AVATAR */
.av { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #fff; flex-shrink: 0; }
.av-wrap { position: relative; display: inline-flex; align-items: center; }
.av-tooltip {
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: var(--surface3); border: 1px solid var(--border2); color: var(--text);
  font-size: 11px; padding: 4px 8px; border-radius: 6px; white-space: nowrap;
  pointer-events: none; opacity: 0; transition: opacity .15s; z-index: 50;
}
.av-wrap:hover .av-tooltip { opacity: 1; }

/* RESPONSIVE */
@media (max-width: 900px) { .panel-drawer { width: 90%; } }
@media (max-width: 600px) { .form-2col { grid-template-columns: 1fr; } }
