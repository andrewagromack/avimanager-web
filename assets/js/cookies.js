// Banner de cookies — flotante. Guarda la decisión en localStorage ('avimanager-cookies': 'accepted' | 'rejected').
(function () {
  var KEY = 'avimanager-cookies';

  // Activa GA4, Meta Pixel y Clarity (scripts marcados con data-consent / data-consent-src) solo tras aceptar
  var done = false;
  function activate() {
    if (done) return; done = true;
    document.querySelectorAll('script[data-consent],script[data-consent-src]').forEach(function (o) {
      var n = document.createElement('script');
      if (o.dataset.consentSrc) { n.src = o.dataset.consentSrc; n.async = true; } else { n.text = o.textContent; }
      o.parentNode.replaceChild(n, o);
    });
  }
  document.addEventListener('cookies-consent', function (e) { if (e.detail === 'accepted') activate(); });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'accepted') activate();
  if (saved) return;

  var css = '' +
  '.ck{position:fixed;left:20px;bottom:20px;z-index:1000;width:min(420px,calc(100vw - 40px));box-sizing:border-box;' +
  'background:var(--color-surface,#fff);color:var(--color-text,#101A38);border:1px solid var(--color-divider,rgba(15,27,64,.18));' +
  'box-shadow:var(--shadow-lg,0 12px 32px rgba(0,0,0,.22));padding:18px 20px;font-family:var(--font-body,system-ui,sans-serif);' +
  'font-size:14px;line-height:1.5;animation:ck-in .3s ease both}' +
  '.ck h2{margin:0 0 6px;font-size:16px;font-family:var(--font-heading,inherit)}' +
  '.ck p{margin:0 0 14px}' +
  '.ck a{color:var(--color-accent,#1A2A5C);text-decoration:underline}' +
  '.ck-actions{display:flex;gap:10px;flex-wrap:wrap}' +
  '.ck-btn{flex:1 1 140px;min-height:44px;padding:10px 16px;font:600 14px var(--font-body,system-ui,sans-serif);cursor:pointer;' +
  'border:1px solid var(--color-accent,#1A2A5C);background:transparent;color:var(--color-accent,#1A2A5C);transition:background .15s,color .15s}' +
  '.ck-btn:hover{background:color-mix(in srgb,var(--color-accent,#1A2A5C) 10%,transparent)}' +
  '.ck-btn.ck-ok{background:var(--color-accent,#1A2A5C);color:#fff}' +
  '.ck-btn.ck-ok:hover{background:var(--color-accent-600,#2a3f80)}' +
  '.ck-btn:focus-visible{outline:2px solid var(--color-accent-2,#1FBCBD);outline-offset:2px}' +
  '@keyframes ck-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
  '@media (max-width:560px){.ck{left:0;right:0;bottom:0;width:100%;border-width:1px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom))}' +
  '.ck-btn{flex:1 1 100%}.ck-ok{order:-1}}' +
  '@media (prefers-reduced-motion:reduce){.ck{animation:none}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var box = document.createElement('div');
  box.className = 'ck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite'); box.setAttribute('aria-label', 'Aviso de cookies');
  box.innerHTML =
    '<h2>Usamos cookies</h2>' +
    '<p>Usamos cookies propias y de terceros para medir el uso del sitio y mejorar tu experiencia. Más información en la <a href="privacidad.html">Política de privacidad</a>.</p>' +
    '<div class="ck-actions"><button type="button" class="ck-btn ck-ok" data-v="accepted">Aceptar</button>' +
    '<button type="button" class="ck-btn" data-v="rejected">Rechazar</button></div>';

  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-v]'); if (!b) return;
    try { localStorage.setItem(KEY, b.dataset.v); } catch (err) {}
    document.dispatchEvent(new CustomEvent('cookies-consent', { detail: b.dataset.v }));
    box.remove();
  });

  function mount() { document.body.appendChild(box); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
