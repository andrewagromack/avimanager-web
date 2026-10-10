// ── Eventos (Meta Pixel + GA4) ───────────────────────────────────────────
// Mapa de eventos de Avimanager: AddToCart = clic en un plan,
// Contact = clic en WhatsApp. El formulario de soporte NO dispara Lead:
// es soporte de clientes, no captación.
function track(fbEvent, fbParams, gaEvent, gaParams) {
  try { if (typeof fbq === 'function') fbq('track', fbEvent, fbParams); } catch (e) {}
  try { if (typeof gtag === 'function') gtag('event', gaEvent, gaParams); } catch (e) {}
}

// ── Selector de país / precios ───────────────────────────────────────────
(function () {
  const HOTMART = 'https://pay.hotmart.com/M104285732W?off=';
  const WA_PLAN = 'https://wa.me/56936796647?text=' +
    encodeURIComponent('Quisiera el plan mensual en USD de Avimanager');

  // Los precios son números: el equivalente mensual y el % de ahorro se calculan
  // desde ellos, así no pueden quedar descuadrados con lo que se cobra.
  // Un link en null = plan sin código de Hotmart todavía → deriva a WhatsApp.
  const PLANS = {
    cl:    { locale: 'es-CL', prefix: '$',  code: 'CLP', monthly: 9200,  annual: 54500,
             forceDec: false, link: { monthly: HOTMART + 'k5ai9vjz', annual: HOTMART + 'r7hzobfi' } },
    mx:    { locale: 'es-MX', prefix: '$',  code: 'MXN', monthly: 185.6, annual: 1006.8,
             forceDec: true,  link: { monthly: HOTMART + 'x5qv6il6', annual: HOTMART + 'j3synwpc' } },
    pe:    { locale: 'es-PE', prefix: 'S/', code: 'PEN', monthly: 31,    annual: 192.8,
             forceDec: false, link: { monthly: HOTMART + 'e8zucz15', annual: HOTMART + 'vhyluyrq' } },
    other: { locale: 'es-CL', prefix: '$',  code: 'USD', monthly: 8.99,  annual: 55,
             forceDec: false, link: { monthly: HOTMART + 'g03cegig&checkoutMode=6', annual: HOTMART + 'nf4hmr9h' } },
  };

  const $ = (id) => document.getElementById(id);
  const btns = document.querySelectorAll('.country-btn');
  const els = {
    amountM: $('price-monthly'), currencyM: $('currency-monthly'),
    amountA: $('price-annual'),  currencyA: $('currency-annual'),
    equiv: $('price-monthly-equiv'), badge: $('badge-annual'),
    btnM: $('btn-monthly'), btnA: $('btn-annual'),
  };
  if (!btns.length || !els.amountM) return;

  const LABEL_PLAN = 'Suscribirme al plan';
  let current = 'cl';

  function money(n, plan, decimals) {
    const d = decimals !== undefined ? decimals : (plan.forceDec || !Number.isInteger(n) ? 2 : 0);
    return plan.prefix + new Intl.NumberFormat(plan.locale, {
      minimumFractionDigits: d, maximumFractionDigits: d,
    }).format(n);
  }

  function setButton(btn, href, kind, planName) {
    if (href) {
      btn.href = href; btn.textContent = LABEL_PLAN;
      btn.setAttribute('aria-label', LABEL_PLAN + ' ' + planName);
      btn.dataset.kind = 'checkout';
    } else {
      btn.href = WA_PLAN; btn.textContent = 'Consultar plan ' + planName;
      btn.removeAttribute('aria-label');
      btn.dataset.kind = 'whatsapp';
    }
  }

  function render(country) {
    const p = PLANS[country];
    current = country;
    els.amountM.textContent   = money(p.monthly, p);
    els.currencyM.textContent = p.code;
    els.amountA.textContent   = money(p.annual, p);
    els.currencyA.textContent = p.code;
    els.equiv.textContent     = 'equiv. ' + money(p.annual / 12, p, p.code === 'CLP' ? 0 : 2) + '/mes';
    els.badge.textContent     = 'Ahorra ' + Math.round((1 - p.annual / (p.monthly * 12)) * 100) + '%';
    setButton(els.btnM, p.link.monthly, 'monthly', 'mensual');
    setButton(els.btnA, p.link.annual,  'annual',  'anual');
  }

  function update(country) {
    if (!PLANS[country]) return;
    const amounts = [els.amountM, els.amountA];
    amounts.forEach((el) => el.classList.add('is-updating'));
    setTimeout(() => {
      render(country);
      amounts.forEach((el) => el.classList.remove('is-updating'));
    }, 150);
  }

  btns.forEach((btn) => {
    btn.addEventListener('click', function () {
      btns.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      update(this.dataset.country);
    });
  });

  // Clic en un plan → AddToCart (o Contact si ese plan deriva a WhatsApp)
  document.querySelectorAll('.plan-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const p = PLANS[current];
      if (this.dataset.kind === 'whatsapp') {
        track('Contact', { content_name: 'whatsapp', content_category: 'plan_' + this.dataset.plan },
              'whatsapp_click', { location: 'plan_' + this.dataset.plan });
        return;
      }
      const value = this.dataset.plan === 'annual' ? p.annual : p.monthly;
      track('AddToCart', { value: value, currency: p.code, content_name: 'plan_' + this.dataset.plan, content_category: current },
            'begin_checkout', { value: value, currency: p.code, items: [{ item_name: 'plan_' + this.dataset.plan }] });
    });
  });

  render('cl'); // Chile es el país por defecto
})();

// ── WhatsApp: eventos + globo flotante ───────────────────────────────────
(function () {
  document.addEventListener('click', function (e) {
    const a = e.target.closest('[data-wa]');
    if (!a) return;
    track('Contact', { content_name: 'whatsapp', content_category: a.dataset.wa },
          'whatsapp_click', { location: a.dataset.wa });
  });

  const bubble = document.getElementById('waBubble');
  const close  = document.getElementById('waClose');
  if (!bubble || !close) return;

  let dismissed = false;
  try { dismissed = sessionStorage.getItem('waBubbleDismissed') === '1'; } catch (e) {}
  if (!dismissed) setTimeout(function () { bubble.hidden = false; }, 4000);

  close.addEventListener('click', function () {
    bubble.hidden = true;
    try { sessionStorage.setItem('waBubbleDismissed', '1'); } catch (e) {}
  });
})();
