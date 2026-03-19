'use client';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    let toateProdusele = [];
    let toateComenzile = [];
    let toateCererileBB = [];
    let currentColors = [];
    let _sessionValid = false;

    // ── SECURITATE ──
    setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) forceLogout();
    }, 60000);

    const _dashObserver = new MutationObserver(() => {
      if (!_sessionValid && dashboardScreen.style.display !== 'none') forceLogout();
    });
    _dashObserver.observe(dashboardScreen, { attributes: true, attributeFilter: ['style', 'class'] });

    function forceLogout() {
      _sessionValid = false;
      ['admin-product-list','admin-orders-list','admin-bb-list'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
      toateProdusele = []; toateComenzile = []; toateCererileBB = [];
      dashboardScreen.style.display = 'none';
      loginScreen.style.display = 'flex';
      supabase.auth.signOut();
    }

    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        _sessionValid = true;
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        incarcaProduseInTabel(); incarcaComenzi(); incarcaBuyBack();
        initDashboardData();
      } else {
        _sessionValid = false;
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
      }
    }
    checkUser();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) forceLogout();
      else if (event === 'SIGNED_IN' && session) { _sessionValid = true; }
    });

    // ── LOGIN ──
    document.getElementById('btn-login')?.addEventListener('click', async () => {
      const email = document.getElementById('auth-email')?.value;
      const pass = document.getElementById('auth-pass')?.value;
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) { const el = document.getElementById('login-error'); if (el) el.textContent = 'Email sau parolă greșită!'; }
      else checkUser();
    });

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
      await supabase.auth.signOut(); checkUser();
    });

    // ── THEME ──
    const html = document.documentElement;
    const btnL = document.getElementById('btn-theme-light');
    const btnD = document.getElementById('btn-theme-dark');
    function setTheme(t) {
      html.setAttribute('data-theme', t); localStorage.setItem('ovi-theme', t);
      btnL?.classList.toggle('t-active', t === 'light');
      btnD?.classList.toggle('t-active', t === 'dark');
    }
    setTheme(localStorage.getItem('ovi-theme') || 'light');
    btnL?.addEventListener('click', () => setTheme('light'));
    btnD?.addEventListener('click', () => setTheme('dark'));

    // ── NAVIGATION ──
    function navTo(targetId) {
      if (!targetId) return;
      document.querySelectorAll('.nav-btn[data-target]').forEach(b => b.classList.toggle('active', b.getAttribute('data-target') === targetId));
      document.querySelectorAll('.float-item[data-target]').forEach(b => b.classList.toggle('active', b.getAttribute('data-target') === targetId));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    }

    document.querySelectorAll('.nav-btn[data-target]').forEach(btn => btn.addEventListener('click', () => navTo(btn.getAttribute('data-target'))));
    document.querySelectorAll('.float-item[data-target]').forEach(btn => btn.addEventListener('click', () => navTo(btn.getAttribute('data-target'))));

    const produseItem = document.getElementById('nav-produse-item');
    const produseTrigger = document.getElementById('nav-produse-trigger');
    produseTrigger?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); produseItem?.classList.toggle('submenu-open'); });
    document.addEventListener('click', (e) => { if (window.innerWidth > 900 && produseItem && !produseItem.contains(e.target)) produseItem.classList.remove('submenu-open'); });

    // Quick actions
    document.querySelectorAll('.qa-btn[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => navTo(btn.getAttribute('data-goto')));
    });

    // ── DASHBOARD DATA ──
    async function initDashboardData() {
      const ora = new Date().getHours();
      const salut = ora < 12 ? 'Bună dimineața' : ora < 18 ? 'Bună ziua' : 'Bună seara';
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email?.split('@')[0] || 'Admin';
      const greet = document.getElementById('dash-greeting');
      if (greet) greet.textContent = `${salut}, ${email} 👋`;
      const now = new Date();
      const ziua = now.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const dateEl = document.getElementById('dash-date');
      if (dateEl) dateEl.textContent = ziua.charAt(0).toUpperCase() + ziua.slice(1);
      populateDashboard();
    }

    async function populateDashboard() {
      const { data: produse, count: nr } = await supabase.from('produse').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5);
      animateCount('stat-produse', nr ?? 0);
      const heroP = document.getElementById('hero-produse'); if (heroP) heroP.textContent = (nr ?? 0).toLocaleString('ro-RO');
      const prodEl = document.getElementById('dash-produse-list');
      const ps = produse || [];
      if (prodEl) prodEl.innerHTML = ps.length === 0 ? '<div class="empty-dash">Nu există produse în catalog.</div>' : ps.map(p => {
        const img = p.imagine_url ? `<img class="prod-img" src="${p.imagine_url}" alt="">` : `<div class="prod-img-ph">📱</div>`;
        const stoc = (p.stoc || 0) > 0 ? `<span class="prod-stock ps-ok">${p.stoc} buc</span>` : `<span class="prod-stock ps-no">Stoc 0</span>`;
        const cat = p.categorie ? p.categorie.charAt(0).toUpperCase() + p.categorie.slice(1) : '';
        return `<div class="prod-row">${img}<div style="flex:1;min-width:0;"><div class="prod-name">${p.nume}</div><div class="prod-cat">${cat}</div></div><div class="prod-right"><div class="prod-price">${p.pret} lei</div>${stoc}</div></div>`;
      }).join('');

      const { data: c0 } = await supabase.from('comenzi').select('id,status,total,created_at,nume_complet').order('created_at', { ascending: false });
      const c = c0 || [];
      animateCount('stat-comenzi', c.length);
      const heroC = document.getElementById('hero-comenzi'); if (heroC) heroC.textContent = c.length.toLocaleString('ro-RO');
      const active = c.filter(x => x.status !== 'Anulata' && x.status !== 'Finalizata');
      const elCNoi = document.getElementById('stat-comenzi-noi'); if (elCNoi) elCNoi.textContent = `${active.length} active`;
      const elBadgeC = document.getElementById('badge-comenzi-active'); if (elBadgeC) elBadgeC.textContent = `${active.length} active`;
      const actEl = document.getElementById('stat-active'); if (actEl) animateCount('stat-active', active.length);
      const venit = c.filter(x => x.status !== 'Anulata').reduce((s, x) => s + (Number(x.total) || 0), 0);
      const elVenit = document.getElementById('stat-venit'); if (elVenit) elVenit.innerHTML = `${venit.toLocaleString('ro-RO')}<small>lei</small>`;
      const heroV = document.getElementById('hero-venit'); if (heroV) heroV.textContent = venit.toLocaleString('ro-RO');
      const recente = c.filter(x => x.status !== 'Anulata').slice(0, 6);
      const ordEl = document.getElementById('dash-recent-orders');
      if (ordEl) ordEl.innerHTML = recente.length === 0 ? '<div class="empty-dash">Nu există comenzi momentan.</div>' : recente.map(o => `<div class="ord-row"><div><div class="ord-name">${o.nume_complet}</div><div class="ord-meta">#${String(o.id).split('-')[0].toUpperCase()} · ${new Date(o.created_at).toLocaleDateString('ro-RO')}</div></div><div class="ord-r"><span class="spill" style="${stClr(o.status)}">${o.status}</span><span class="ord-price">${o.total} lei</span></div></div>`).join('');

      const { data: b0 } = await supabase.from('cereri_buyback').select('id,status,created_at,nume,brand,model,pret_estimat').order('created_at', { ascending: false });
      const bb = b0 || [];
      animateCount('stat-bb', bb.length);
      const noi = bb.filter(x => !x.status || x.status === 'Nou').length;
      const elBBNoi = document.getElementById('stat-bb-noi'); if (elBBNoi) elBBNoi.textContent = `${noi} neconsultate`;
      const elBadgeBB = document.getElementById('badge-bb-noi'); if (elBadgeBB) elBadgeBB.textContent = `${noi} noi`;
      const bbEl = document.getElementById('dash-recent-bb');
      if (bbEl) bbEl.innerHTML = bb.length === 0 ? '<div class="empty-dash">Nu există cereri BuyBack momentan.</div>' : bb.slice(0, 6).map(b => `<div class="bb-row"><div><div class="bb-dev">${b.brand} ${b.model}</div><div class="bb-cli">${(b.nume || '').toUpperCase()} · #${b.id}</div></div><span class="bb-price">${b.pret_estimat}</span></div>`).join('');
    }

    function stClr(s) {
      const v = (s || '').toLowerCase();
      if (v.includes('platita') || v.includes('finalizat')) return 'background:#DCFCE7;color:#166534;';
      if (v.includes('anulat') || v.includes('eroare')) return 'background:#FEE2E2;color:#DC2626;';
      if (v.includes('expediat') || v.includes('curier')) return 'background:#E0E7FF;color:#3730A3;';
      return 'background:#FEF08A;color:#854D0E;';
    }

    function animateCount(id, target) {
      const el = document.getElementById(id); if (!el) return;
      const duration = 900; const startTime = performance.now();
      function update(now) {
        const elapsed = Math.min(now - startTime, duration);
        const progress = 1 - Math.pow(1 - elapsed / duration, 3);
        el.textContent = Math.round(target * progress).toLocaleString('ro-RO');
        if (elapsed < duration) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    // ── COMENZI ──
    function getStatusColor(status) {
      const s = (status || '').toLowerCase();
      if (s.includes('platita') || s.includes('finalizat') || s.includes('succes')) return 'status-verde';
      if (s.includes('anulat') || s.includes('eroare')) return 'status-rosu';
      if (s.includes('expediat') || s.includes('curier')) return 'status-albastru';
      return 'status-galben';
    }

    window.schimbaStatusComanda = async function(id, selectElement) {
      const newStatus = selectElement.value;
      selectElement.className = `status-select ${getStatusColor(newStatus)}`;
      const { error } = await supabase.from('comenzi').update({ status: newStatus }).eq('id', id);
      if (error) { alert('Eroare: ' + error.message); incarcaComenzi(); }
      else { const index = toateComenzile.findIndex(c => c.id == id); if (index !== -1) toateComenzile[index].status = newStatus; afiseazaComenzi(); }
    };

    async function incarcaComenzi() {
      const tableBody = document.getElementById('admin-orders-list');
      const { data: comenzi, error } = await supabase.from('comenzi').select('*').order('created_at', { ascending: false });
      if (error) { if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Eroare: ${error.message}</td></tr>`; return; }
      const now = new Date();
      toateComenzile = (comenzi || []).filter(c => {
        if (c.status === 'Anulata') { const diff = (now - new Date(c.created_at)) / (1000 * 60); if (diff > 10) return false; }
        return true;
      });
      afiseazaComenzi();
    }

    function afiseazaComenzi() {
      const tableBody = document.getElementById('admin-orders-list');
      if (!tableBody) return;
      if (toateComenzile.length === 0) { tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;">Nu există nicio comandă.</td></tr>`; return; }
      tableBody.innerHTML = '';
      toateComenzile.forEach(c => {
        const d = new Date(c.created_at);
        const dataF = d.toLocaleDateString('ro-RO') + ' - ' + d.toLocaleTimeString('ro-RO').slice(0, 5);
        const isAnulata = c.status === 'Anulata';
        const blocatStr = isAnulata ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>#${String(c.id).split('-')[0].toUpperCase()}</strong><br><small style="color:var(--txt2);">${dataF}</small></td>
          <td><strong>${c.nume_complet}</strong><br><small>${c.telefon}</small></td>
          <td><strong>${c.total} lei</strong><br><small style="text-transform:uppercase;">${c.metoda_plata}</small></td>
          <td>
            <select class="status-select ${getStatusColor(c.status)}" onchange="schimbaStatusComanda('${c.id}', this)" ${blocatStr}>
              <option value="Noua" ${c.status === 'Noua' ? 'selected' : ''}>⏳ Nouă (Ramburs)</option>
              <option value="In asteptare (Neplatita)" ${c.status === 'In asteptare (Neplatita)' ? 'selected' : ''}>⚠️ În așteptare (Neplătită)</option>
              <option value="Platita" ${c.status === 'Platita' ? 'selected' : ''}>✅ Plătită (Card)</option>
              <option value="Expediata" ${c.status === 'Expediata' ? 'selected' : ''}>🚚 Expediată</option>
              <option value="Anulata" ${c.status === 'Anulata' ? 'selected' : ''}>❌ Anulată</option>
            </select>
            ${isAnulata ? '<br><small style="color:#ef4444;font-weight:bold;">Se va ascunde automat.</small>' : ''}
          </td>
          <td><button class="action-btn btn-edit" onclick="deschideFactura('${c.id}')" ${blocatStr}>${isAnulata ? '🔒 Blocată' : '📄 Vezi Factura'}</button></td>`;
        tableBody.appendChild(tr);
      });
    }

    window.deschideFactura = function(id) {
      const comanda = toateComenzile.find(c => c.id == id);
      if (!comanda || comanda.status === 'Anulata') return;
      const dataF = new Date(comanda.created_at).toLocaleDateString('ro-RO');
      let prodHtml = '';
      let taxaLivrare = 19;
      if (comanda.detalii_cos && Array.isArray(comanda.detalii_cos)) {
        prodHtml = comanda.detalii_cos.map(p => `<tr><td><div class="prod-info"><img src="${p.img}" alt="produs"><div><div class="prod-name">${p.title}</div><div class="prod-meta">${p.variant || 'Standard'}</div></div></div></td><td class="text-center">${p.price} lei</td><td class="text-center">x${p.qty}</td><td class="text-right"><strong>${p.price * p.qty} lei</strong></td></tr>`).join('');
      }
      if ((comanda.metoda_plata || '').toLowerCase() === 'magazin' || (comanda.adresa || '').toLowerCase().includes('magazin')) taxaLivrare = 0;
      const subtotal = comanda.total - taxaLivrare;
      const statusCuloare = getStatusColor(comanda.status);
      const invoiceContainer = document.getElementById('invoice-content');
      if (invoiceContainer) invoiceContainer.innerHTML = `
        <div class="invoice-actions no-print">
          <button class="btn-print" onclick="window.print()">🖨️ Printează Factura</button>
          <button class="btn-close-inv" onclick="window.inchideFactura()">❌ Închide</button>
        </div>
        <div class="invoice-header"><div class="invoice-logo">OVI<span>FONE</span></div><div class="invoice-title"><h2>Comanda #${String(comanda.id).split('-')[0].toUpperCase()}</h2><p>Data emiterii: ${dataF}</p></div></div>
        <div class="invoice-addresses">
          <div class="address-box"><h3>Facturat către / Livrare</h3><p><strong>${comanda.nume_complet}</strong></p><p>${comanda.telefon}</p><p>${comanda.email}</p><p>${comanda.adresa}</p><p>${comanda.localitate}, ${comanda.judet}</p><p><strong>${comanda.tara || 'România'}</strong></p></div>
          <div class="address-box" style="text-align:right;"><h3>Vânzător</h3><p><strong>Ovifone Electronics S.R.L.</strong></p><p>Strada Tehnologiei, Nr. 1</p><p>București, România</p><div class="invoice-status-badge ${statusCuloare}">${comanda.status.toUpperCase()}</div><div style="margin-top:5px;font-size:13px;color:var(--txt2);">Metodă plată: <strong>${comanda.metoda_plata.toUpperCase()}</strong></div></div>
        </div>
        <table class="invoice-products"><thead><tr><th>Produs</th><th class="text-center">Preț</th><th class="text-center">Cantitate</th><th class="text-right">Total</th></tr></thead><tbody>${prodHtml}</tbody></table>
        <div class="invoice-summary"><div class="summary-box"><div class="summary-row"><span>Subtotal Produse</span><span>${subtotal} lei</span></div><div class="summary-row"><span>Taxă Livrare</span><span>${taxaLivrare === 0 ? 'Gratuit' : taxaLivrare + ' lei'}</span></div><div class="summary-row total"><span>TOTAL PLATĂ</span><span>${comanda.total} LEI</span></div></div></div>
        <div class="invoice-footer">Mulțumim pentru comandă! Ovifone Electronics S.R.L.</div>`;
      const modal = document.getElementById('invoice-modal');
      if (modal) modal.classList.add('active');
    };

    window.inchideFactura = function() { document.getElementById('invoice-modal')?.classList.remove('active'); };

    // ── PRODUSE ──
    async function incarcaProduseInTabel() {
      const tableBody = document.getElementById('admin-product-list');
      const { data: produse, error } = await supabase.from('produse').select('*').order('created_at', { ascending: false });
      if (error) { if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Eroare: ${error.message}</td></tr>`; return; }
      toateProdusele = produse || [];
      afiseazaProduse(toateProdusele);
    }

    function afiseazaProduse(lista) {
      const tableBody = document.getElementById('admin-product-list');
      if (!tableBody) return;
      if (lista.length === 0) { tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;">Niciun produs găsit.</td></tr>`; return; }
      tableBody.innerHTML = '';
      lista.forEach(p => {
        const stocClass = (p.stoc || 0) > 0 ? 'stoc-ok' : 'stoc-zero';
        const stocText = (p.stoc || 0) > 0 ? `${p.stoc} buc` : 'Stoc 0';
        const cat = p.categorie ? p.categorie.charAt(0).toUpperCase() + p.categorie.slice(1) : '';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><img src="${p.imagine_url}" alt="${p.nume}" style="width:52px;height:52px;object-fit:contain;border-radius:10px;border:1px solid var(--border2);background:var(--bg);padding:3px;"></td>
          <td><strong>${p.nume}</strong><br><small style="color:var(--txt2);">${p.brand || ''}</small></td>
          <td>${cat}</td>
          <td><strong>${p.pret} lei</strong>${p.pret_vechi ? `<br><small style="text-decoration:line-through;color:var(--txt2);">${p.pret_vechi} lei</small>` : ''}</td>
          <td><span class="prod-stock ${stocClass}">${stocText}</span></td>
          <td>
            <button class="action-btn btn-edit" onclick="window.editeazaProdus('${p.id}')">✏️ Editează</button>
            <button class="action-btn" style="background:#fee2e2;color:#dc2626;border:none;" onclick="window.stergeProdus('${p.id}')">🗑️ Șterge</button>
          </td>`;
        tableBody.appendChild(tr);
      });
    }

    // Search & filter
    document.getElementById('search-table')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const cat = document.getElementById('filter-table-cat')?.value || 'toate';
      const filtered = toateProdusele.filter(p => {
        const matchQ = !q || (p.nume || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
        const matchCat = cat === 'toate' || (p.categorie || '').toLowerCase() === cat;
        return matchQ && matchCat;
      });
      afiseazaProduse(filtered);
    });
    document.getElementById('filter-table-cat')?.addEventListener('change', (e) => {
      const cat = e.target.value;
      const q = (document.getElementById('search-table')?.value || '').toLowerCase();
      const filtered = toateProdusele.filter(p => {
        const matchQ = !q || (p.nume || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
        const matchCat = cat === 'toate' || (p.categorie || '').toLowerCase() === cat;
        return matchQ && matchCat;
      });
      afiseazaProduse(filtered);
    });

    // ── CULORI ──
    function renderColors() {
      const container = document.getElementById('colors-container');
      if (!container) return;
      container.innerHTML = '';
      currentColors.forEach((c, index) => {
        const tag = document.createElement('div');
        tag.style.cssText = 'display:flex;align-items:center;gap:8px;background:#e5e5ea;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;';
        tag.innerHTML = `<div style="width:16px;height:16px;border-radius:50%;background-color:${c.hex};border:1px solid rgba(0,0,0,0.1);"></div>${c.name}<span style="cursor:pointer;color:#ff3b30;margin-left:6px;font-size:18px;line-height:1;" onclick="window.removeColor(${index})">×</span>`;
        container.appendChild(tag);
      });
      const colorInput = document.getElementById('p-colors');
      if (colorInput) colorInput.value = currentColors.map(c => `${c.name}|${c.hex}`).join(',');
    }

    window.removeColor = function(index) { currentColors.splice(index, 1); renderColors(); };

    document.getElementById('btn-add-color')?.addEventListener('click', () => {
      const name = document.getElementById('color-name')?.value.trim();
      const hex = document.getElementById('color-picker')?.value;
      if (name) { currentColors.push({ name, hex }); const inp = document.getElementById('color-name'); if (inp) inp.value = ''; renderColors(); }
      else alert('Te rog să introduci un nume pentru culoare (ex: Alb, Titan, etc.)');
    });

    // ── CATEGORIE FIELDS ──
    const catSelector = document.getElementById('p-cat');
    function actualizeazaCampuri() {
      const cat = catSelector?.value || 'telefoane';
      const grupTech = document.getElementById('grup-specific-tech');
      const grupCasti = document.getElementById('grup-specific-casti');
      const grupProtectie = document.getElementById('grup-specific-protectie');
      const grupAccesorii = document.getElementById('grup-specific-accesorii');
      [grupTech, grupCasti, grupProtectie, grupAccesorii].forEach(g => { if (g) g.style.display = 'none'; });
      if (cat === 'telefoane' || cat === 'telefoane altele' || cat === 'tablete') { if (grupTech) grupTech.style.display = 'block'; }
      else if (cat === 'casti') { if (grupCasti) grupCasti.style.display = 'block'; }
      else if (cat === 'huse' || cat === 'folii') { if (grupProtectie) grupProtectie.style.display = 'block'; }
      else if (cat === 'accesorii') { if (grupAccesorii) grupAccesorii.style.display = 'block'; }
    }
    catSelector?.addEventListener('change', actualizeazaCampuri);
    actualizeazaCampuri();

    window.stergeProdus = async function(id) {
      if (confirm('Ești sigur că vrei să ștergi definitiv acest produs?')) {
        const { error } = await supabase.from('produse').delete().eq('id', id);
        if (error) alert('Eroare la ștergere: ' + error.message);
        else incarcaProduseInTabel();
      }
    };

    window.editeazaProdus = async function(id) {
      const { data: p, error } = await supabase.from('produse').select('*').eq('id', id).single();
      if (error) { alert('Eroare la găsire produs'); return; }
      document.getElementById('edit-id').value = p.id;
      document.getElementById('edit-image-url').value = p.imagine_url;
      document.getElementById('p-name').value = p.nume || '';
      document.getElementById('p-brand').value = p.brand || '';
      document.getElementById('p-price').value = p.pret || '';
      document.getElementById('p-old-price').value = p.pret_vechi || '';
      document.getElementById('p-stoc').value = p.stoc || 0;
      currentColors = [];
      if (p.culori) { p.culori.split(',').forEach(part => { if (part.includes('|')) { const [n, h] = part.split('|'); currentColors.push({ name: n.trim(), hex: h.trim() }); } else if (part.trim()) currentColors.push({ name: part.trim(), hex: '#cccccc' }); }); }
      renderColors();
      if (document.getElementById('p-cat')) document.getElementById('p-cat').value = p.categorie || 'telefoane';
      if (document.getElementById('p-storage')) document.getElementById('p-storage').value = p.stocare || '';
      if (document.getElementById('p-baterie')) document.getElementById('p-baterie').value = p.baterie || '100%';
      if (document.getElementById('p-stare')) document.getElementById('p-stare').value = p.stare || 'Nou';
      if (document.getElementById('p-conectivitate')) document.getElementById('p-conectivitate').value = p.conectivitate || 'Wireless';
      if (document.getElementById('p-compat')) document.getElementById('p-compat').value = p.compatibilitate || '';
      if (document.getElementById('p-material')) document.getElementById('p-material').value = p.material || '';
      if (document.getElementById('p-caracteristici-prot')) document.getElementById('p-caracteristici-prot').value = p.caracteristici || '';
      if (document.getElementById('p-conector')) document.getElementById('p-conector').value = p.conector || '';
      if (document.getElementById('p-caracteristici-acc')) document.getElementById('p-caracteristici-acc').value = p.caracteristici || '';
      if (document.getElementById('p-desc')) document.getElementById('p-desc').value = p.descriere || '';
      if (document.getElementById('p-specs')) document.getElementById('p-specs').value = p.specificatii || '';
      const ft = document.getElementById('form-title'); if (ft) ft.textContent = 'Editează Produsul';
      const bu = document.getElementById('btn-upload'); if (bu) bu.textContent = 'Actualizează Produsul';
      const bc = document.getElementById('btn-cancel-edit'); if (bc) bc.style.display = 'block';
      const ph = document.getElementById('poza-help'); if (ph) ph.style.display = 'block';
      actualizeazaCampuri();
      navTo('panel-adaugare');
    };

    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => { resetForm(); navTo('panel-gestiune'); });

    function resetForm() {
      const editId = document.getElementById('edit-id'); if (editId) editId.value = '';
      const editImg = document.getElementById('edit-image-url'); if (editImg) editImg.value = '';
      document.querySelectorAll('#panel-adaugare input:not([type="hidden"]):not([type="color"]):not([type="file"]), #panel-adaugare textarea').forEach(i => i.value = '');
      if (document.getElementById('p-stoc')) document.getElementById('p-stoc').value = '0';
      if (document.getElementById('p-baterie')) document.getElementById('p-baterie').value = '100%';
      if (document.getElementById('p-stare')) document.getElementById('p-stare').value = 'Nou';
      if (document.getElementById('p-conectivitate')) document.getElementById('p-conectivitate').value = 'Wireless';
      if (document.getElementById('p-cat')) document.getElementById('p-cat').value = 'telefoane';
      currentColors = []; renderColors();
      if (document.getElementById('color-picker')) document.getElementById('color-picker').value = '#000000';
      const ft = document.getElementById('form-title'); if (ft) ft.textContent = 'Adaugă Produs Nou';
      const bu = document.getElementById('btn-upload'); if (bu) bu.textContent = 'Salvează Produsul';
      const bc = document.getElementById('btn-cancel-edit'); if (bc) bc.style.display = 'none';
      const ph = document.getElementById('poza-help'); if (ph) ph.style.display = 'none';
      const us = document.getElementById('upload-status'); if (us) us.textContent = '';
      actualizeazaCampuri();
    }

    document.getElementById('btn-upload')?.addEventListener('click', async () => {
      const statusDiv = document.getElementById('upload-status');
      const btn = document.getElementById('btn-upload');
      const fileInput = document.getElementById('p-image');
      const galleryInput = document.getElementById('p-gallery');
      const editId = document.getElementById('edit-id')?.value;
      const name = document.getElementById('p-name')?.value;
      const price = document.getElementById('p-price')?.value;
      if (!name || !price) { if (statusDiv) { statusDiv.style.color = 'red'; statusDiv.textContent = 'Numele și Prețul sunt obligatorii!'; } return; }
      if (!editId && !fileInput?.files[0]) { if (statusDiv) { statusDiv.style.color = 'red'; statusDiv.textContent = 'Trebuie să urci o poză principală!'; } return; }
      if (btn) { btn.textContent = 'Se salvează... Te rugăm așteaptă!'; btn.disabled = true; }
      try {
        let imageUrl = document.getElementById('edit-image-url')?.value || '';
        if (fileInput?.files[0]) {
          const file = fileInput.files[0];
          const fileName = `main_${Date.now()}_${file.name}`;
          const { error: imgError } = await supabase.storage.from('imagini_produse').upload(fileName, file);
          if (imgError) throw imgError;
          const { data: publicUrlData } = supabase.storage.from('imagini_produse').getPublicUrl(fileName);
          imageUrl = publicUrlData.publicUrl;
        }
        let galerieUrls = [];
        if (galleryInput?.files.length > 0) {
          for (let i = 0; i < galleryInput.files.length; i++) {
            const gFile = galleryInput.files[i];
            const gName = `gal_${Date.now()}_${i}_${gFile.name}`;
            const { error: gErr } = await supabase.storage.from('imagini_produse').upload(gName, gFile);
            if (!gErr) { const { data: gData } = supabase.storage.from('imagini_produse').getPublicUrl(gName); galerieUrls.push(gData.publicUrl); }
          }
        }
        const cat = document.getElementById('p-cat')?.value || 'telefoane';
        const productData = {
          nume: name, brand: document.getElementById('p-brand')?.value || null,
          pret: price, pret_vechi: document.getElementById('p-old-price')?.value || null,
          stoc: parseInt(document.getElementById('p-stoc')?.value) || 0,
          culori: document.getElementById('p-colors')?.value || null,
          descriere: document.getElementById('p-desc')?.value || null,
          specificatii: document.getElementById('p-specs')?.value || null,
          categorie: cat, imagine_url: imageUrl,
          galerie: galerieUrls.join(',')
        };
        if (cat === 'telefoane' || cat === 'telefoane altele' || cat === 'tablete') { productData.stocare = document.getElementById('p-storage')?.value || null; productData.baterie = document.getElementById('p-baterie')?.value || null; productData.stare = document.getElementById('p-stare')?.value || null; }
        else if (cat === 'casti') { productData.conectivitate = document.getElementById('p-conectivitate')?.value || null; }
        else if (cat === 'huse' || cat === 'folii') { productData.compatibilitate = document.getElementById('p-compat')?.value || null; productData.material = document.getElementById('p-material')?.value || null; productData.caracteristici = document.getElementById('p-caracteristici-prot')?.value || null; }
        else if (cat === 'accesorii') { productData.conector = document.getElementById('p-conector')?.value || null; productData.caracteristici = document.getElementById('p-caracteristici-acc')?.value || null; }
        if (editId) {
          if (galerieUrls.length === 0) delete productData.galerie;
          const { error } = await supabase.from('produse').update(productData).eq('id', editId);
          if (error) throw error;
          if (statusDiv) statusDiv.textContent = 'Produs actualizat cu succes!';
        } else {
          const { error } = await supabase.from('produse').insert([productData]);
          if (error) throw error;
          if (statusDiv) statusDiv.textContent = 'Produs nou adăugat cu succes!';
        }
        if (statusDiv) statusDiv.style.color = 'green';
        resetForm(); incarcaProduseInTabel();
        setTimeout(() => { navTo('panel-gestiune'); if (statusDiv) statusDiv.textContent = ''; }, 1500);
      } catch (error) {
        if (statusDiv) { statusDiv.style.color = 'red'; statusDiv.textContent = 'Eroare: ' + error.message; }
      } finally {
        if (btn) { btn.textContent = editId ? 'Actualizează Produsul' : 'Salvează Produsul'; btn.disabled = false; }
      }
    });

    // ── BUYBACK ──
    async function incarcaBuyBack() {
      const tableBody = document.getElementById('admin-bb-list');
      const { data: cereri, error } = await supabase.from('cereri_buyback').select('*').order('created_at', { ascending: false });
      if (error) { if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Eroare: ${error.message}</td></tr>`; return; }
      toateCererileBB = cereri || [];
      afiseazaBuyBack();
    }

    function getStatusColorBB(status) {
      if (!status) return 'status-galben';
      const s = status.toLowerCase();
      if (s.includes('acceptat') || s.includes('finalizat')) return 'status-verde';
      if (s.includes('respins') || s.includes('anulat')) return 'status-rosu';
      if (s.includes('discutie') || s.includes('contactat')) return 'status-albastru';
      return 'status-galben';
    }

    window.schimbaStatusBB = async function(id, selectElement) {
      const newStatus = selectElement.value;
      selectElement.className = `status-select ${getStatusColorBB(newStatus)}`;
      const { error } = await supabase.from('cereri_buyback').update({ status: newStatus }).eq('id', id);
      if (error) { alert('Eroare: ' + error.message); incarcaBuyBack(); }
      else { const index = toateCererileBB.findIndex(c => c.id == id); if (index !== -1) toateCererileBB[index].status = newStatus; }
    };

    function afiseazaBuyBack() {
      const tableBody = document.getElementById('admin-bb-list');
      if (!tableBody) return;
      if (toateCererileBB.length === 0) { tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;">Nu există cereri BuyBack.</td></tr>`; return; }
      tableBody.innerHTML = '';
      toateCererileBB.forEach(c => {
        const dataF = new Date(c.created_at).toLocaleDateString('ro-RO') + ' - ' + new Date(c.created_at).toLocaleTimeString('ro-RO').slice(0, 5);
        const statusActual = c.status || 'Nou';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>#${c.id}</strong><br><small style="color:var(--txt2);">${dataF}</small></td>
          <td><strong>${c.nume}</strong><br><small>${c.telefon}</small></td>
          <td><strong>${c.brand} ${c.model}</strong><br><small>${c.stocare} | Baterie: ${c.baterie}</small></td>
          <td><strong style="color:var(--accent);font-size:16px;">${c.pret_estimat}</strong></td>
          <td><select class="status-select ${getStatusColorBB(statusActual)}" onchange="schimbaStatusBB('${c.id}', this)">
            <option value="Nou" ${statusActual === 'Nou' ? 'selected' : ''}>🌟 Nou (Necontactat)</option>
            <option value="In discutie" ${statusActual === 'In discutie' ? 'selected' : ''}>📞 În discuție</option>
            <option value="Acceptat" ${statusActual === 'Acceptat' ? 'selected' : ''}>✅ Acceptat</option>
            <option value="Respins" ${statusActual === 'Respins' ? 'selected' : ''}>❌ Respins</option>
          </select></td>
          <td><button class="action-btn" style="background:#f3f4f6;border:1px solid #d1d5db;color:#111827;" onclick="window.deschideDetaliiBB('${c.id}')">🔍 Fișă Evaluare</button></td>`;
        tableBody.appendChild(tr);
      });
    }

    window.deschideDetaliiBB = function(id) {
      const c = toateCererileBB.find(x => x.id == id); if (!c) return;
      const dataF = new Date(c.created_at).toLocaleDateString('ro-RO') + ' ' + new Date(c.created_at).toLocaleTimeString('ro-RO');
      const container = document.getElementById('bb-content');
      if (container) container.innerHTML = `
        <div class="invoice-actions no-print">
          <button class="btn-print" onclick="window.print()">🖨️ Printează Fișa</button>
          <button class="btn-close-inv" onclick="window.inchideDetaliiBB()">❌ Închide</button>
        </div>
        <div style="border-bottom:2px solid var(--border);padding-bottom:20px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:center;">
          <div><h2 style="margin:0;font-size:24px;font-weight:800;text-transform:uppercase;">Fișă Evaluare Device</h2><p style="margin:5px 0 0 0;color:var(--txt2);font-size:14px;">ID Cerere: #${c.id} | Data: ${dataF}</p></div>
          <div class="invoice-status-badge ${getStatusColorBB(c.status || 'Nou')}">${(c.status || 'Nou').toUpperCase()}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px;">
          <div style="background:#f9fafb;padding:20px;border-radius:12px;border:1px solid var(--border);">
            <h3 style="margin:0 0 15px 0;font-size:13px;text-transform:uppercase;color:var(--txt2);">👤 Date Client</h3>
            <div style="margin-bottom:8px;"><strong>Nume:</strong> ${c.nume}</div>
            <div style="margin-bottom:8px;"><strong>Telefon:</strong> <a href="tel:${c.telefon}" style="color:var(--txt);font-weight:600;">${c.telefon}</a></div>
            <div><strong>Email:</strong> ${c.email !== '-' ? `<a href="mailto:${c.email}" style="color:var(--txt);">${c.email}</a>` : 'Nespecificat'}</div>
          </div>
          <div style="background:rgba(227,91,0,0.04);padding:20px;border-radius:12px;border:1px solid rgba(227,91,0,0.2);">
            <h3 style="margin:0 0 15px 0;font-size:13px;text-transform:uppercase;color:var(--accent);">💰 Ofertă Sistem</h3>
            <div style="font-size:34px;font-weight:900;color:var(--txt);">${c.pret_estimat}</div>
            <p style="margin:5px 0 0 0;font-size:12px;color:var(--txt2);">*Prețul final se negociază la testarea fizică.</p>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          <tbody>
            <tr><td style="padding:14px 0;border-bottom:1px solid var(--border);color:var(--txt2);width:40%;">Tip Dispozitiv</td><td style="padding:14px 0;border-bottom:1px solid var(--border);font-weight:600;">${c.tip_device}</td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid var(--border);color:var(--txt2);">Producător</td><td style="padding:14px 0;border-bottom:1px solid var(--border);font-weight:600;">${c.brand}</td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid var(--border);color:var(--txt2);">Model</td><td style="padding:14px 0;border-bottom:1px solid var(--border);font-weight:700;font-size:16px;">${c.model}</td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid var(--border);color:var(--txt2);">Stocare</td><td style="padding:14px 0;border-bottom:1px solid var(--border);font-weight:600;">${c.stocare}</td></tr>
            <tr><td style="padding:14px 0;border-bottom:1px solid var(--border);color:var(--txt2);">Baterie</td><td style="padding:14px 0;border-bottom:1px solid var(--border);font-weight:600;">${c.baterie}</td></tr>
            <tr><td style="padding:14px 0;color:var(--txt2);">Stare</td><td style="padding:14px 0;font-weight:700;color:var(--accent);">${c.stare}</td></tr>
          </tbody>
        </table>`;
      document.getElementById('bb-modal')?.classList.add('active');
    };

    window.inchideDetaliiBB = function() { document.getElementById('bb-modal')?.classList.remove('active'); };

    // ── MOBILE SIDEBAR ──
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.getElementById('mob-hamburger');
    const backdrop = document.getElementById('sidebar-backdrop');
    function openSidebar() { sidebar?.classList.add('open'); hamburger?.classList.add('open'); backdrop?.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    function closeSidebar() { sidebar?.classList.remove('open'); hamburger?.classList.remove('open'); backdrop?.classList.remove('visible'); document.body.style.overflow = ''; document.getElementById('nav-produse-item')?.classList.remove('submenu-open'); }
    hamburger?.addEventListener('click', (e) => { e.stopPropagation(); sidebar?.classList.contains('open') ? closeSidebar() : openSidebar(); });
    backdrop?.addEventListener('click', closeSidebar);
    sidebar?.addEventListener('click', (e) => e.stopPropagation());
    document.querySelectorAll('.nav-btn[data-target], .float-item[data-target]').forEach(btn => {
      btn.addEventListener('click', () => { if (window.innerWidth <= 900) setTimeout(closeSidebar, 100); });
    });

    // Mobile topbar sync
    const mobTopbar = document.getElementById('mob-topbar');
    function syncTopbar() { const isVisible = dashboardScreen.style.display === 'flex'; if (mobTopbar) mobTopbar.classList.toggle('visible', isVisible); }
    new MutationObserver(syncTopbar).observe(dashboardScreen, { attributes: true, attributeFilter: ['style'] });
    syncTopbar();

  }, []);

  return (
    <>
      <style>{`
        :root{--bg:#EDEAE4;--white:#FFF;--accent:#E35B00;--accent-soft:rgba(227,91,0,.10);--txt:#2B2E27;--txt2:#8A8A8F;--txt3:#C8C8C8;--border:#E2E2E2;--border2:#F0F0F0;--green:#16A34A;--green-soft:#DCFCE7;--red:#DC2626;--red-soft:#FEE2E2;--yellow:#854D0E;--yellow-soft:#FEF08A;--blue:#3730A3;--blue-soft:#E0E7FF;--radius:20px;--radius-sm:13px;--shadow:0 2px 24px rgba(43,46,39,.07);--shadow-md:0 8px 36px rgba(43,46,39,.11);--shadow-lg:0 24px 64px rgba(43,46,39,.16);--tr:.22s cubic-bezier(.4,0,.2,1);--glass-bg:rgba(255,255,255,.72);--glass-border:rgba(255,255,255,.6);--glass-blur:blur(28px) saturate(200%);--glass-shadow:0 4px 32px rgba(43,46,39,.10),0 1px 0 rgba(255,255,255,.8) inset;}
        [data-theme="dark"]{--bg:#18181B;--white:#1C1C1F;--txt:#F2F2F5;--txt2:#707075;--txt3:#3A3A3F;--border:#2A2A2D;--border2:#222225;--shadow:0 2px 18px rgba(0,0,0,.35);--shadow-md:0 8px 32px rgba(0,0,0,.45);--shadow-lg:0 22px 60px rgba(0,0,0,.65);--glass-bg:rgba(30,30,34,.78);--glass-border:rgba(255,255,255,.08);--glass-blur:blur(28px) saturate(180%);--glass-shadow:0 4px 32px rgba(0,0,0,.35),0 1px 0 rgba(255,255,255,.04) inset;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;}
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;display:flex;transition:background var(--tr),color var(--tr);position:relative;overflow-x:hidden;}
        body::before,body::after{content:'';position:fixed;pointer-events:none;z-index:0;border-radius:50%;filter:blur(80px);opacity:.35;}
        body::before{width:520px;height:520px;background:radial-gradient(circle,rgba(227,91,0,.22) 0%,transparent 70%);top:-140px;right:-100px;}
        body::after{width:420px;height:420px;background:radial-gradient(circle,rgba(43,46,39,.08) 0%,transparent 70%);bottom:-80px;left:-80px;}
        #login-screen{display:flex;justify-content:center;align-items:center;width:100%;min-height:100vh;position:relative;z-index:1;}
        .login-card{background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border:1.5px solid var(--glass-border);border-radius:30px;padding:54px 48px;width:100%;max-width:400px;box-shadow:var(--glass-shadow);text-align:center;}
        .login-logo{font-size:28px;font-weight:900;letter-spacing:-.5px;margin-bottom:6px;color:var(--txt);}
        .login-logo span{color:var(--accent);}
        .login-sub{font-size:14px;color:var(--txt2);margin-bottom:34px;}
        .login-card .field{margin-bottom:11px;}
        .login-card input{width:100%;padding:14px 18px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:15px;font-family:inherit;background:rgba(255,255,255,.6);color:var(--txt);outline:none;transition:border-color var(--tr);}
        .login-card input:focus{border-color:var(--accent);}
        .btn-login-main{width:100%;padding:15px;background:var(--txt);color:#FFF;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:8px;transition:background var(--tr);}
        .btn-login-main:hover{background:var(--accent);}
        #dashboard-screen{display:none;width:100%;min-height:100vh;position:relative;z-index:1;}
        #dashboard-screen[style*="display: none"],#dashboard-screen:not([style*="display: flex"]){display:none!important;}
        .sidebar{width:260px;flex-shrink:0;padding:28px 14px 20px;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;background:var(--glass-bg);backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);border-right:1px solid var(--glass-border);z-index:100;}
        .sidebar::-webkit-scrollbar{display:none;}
        .sidebar-brand{display:flex;align-items:center;gap:13px;padding:4px 10px 30px;}
        .brand-icon{width:44px;height:44px;background:var(--txt);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background var(--tr),transform .35s;}
        .sidebar-brand:hover .brand-icon{transform:rotate(90deg) scale(1.06);}
        .brand-name{font-size:20px;font-weight:900;letter-spacing:-.5px;color:var(--txt);}
        .brand-name span{color:var(--accent);}
        .nav-section{font-size:10px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:1px;padding:18px 12px 6px;}
        .nav-item{position:relative;}
        .nav-btn{display:flex;align-items:center;gap:14px;padding:13px 12px;border-radius:16px;border:none;background:transparent;color:var(--txt2);font-family:inherit;font-size:15px;font-weight:500;cursor:pointer;width:100%;text-align:left;transition:background var(--tr),color var(--tr);margin-bottom:2px;}
        .nav-btn:hover{background:rgba(0,0,0,.055);color:var(--txt);}
        .nav-btn.active{background:rgba(255,255,255,.88);backdrop-filter:blur(12px);color:var(--txt);font-weight:700;box-shadow:0 2px 14px rgba(43,46,39,.10);}
        .nav-ic{width:22px;height:22px;flex-shrink:0;opacity:.38;transition:opacity var(--tr);}
        .nav-btn:hover .nav-ic{opacity:.75;}
        .nav-btn.active .nav-ic{opacity:1;color:var(--accent);}
        .nav-arrow{margin-left:auto;width:15px;height:15px;opacity:.3;flex-shrink:0;transition:transform .28s,opacity var(--tr);}
        .nav-item:hover .nav-arrow,.nav-item.submenu-open .nav-arrow{transform:rotate(180deg);opacity:.65;}
        .nav-float-menu{position:static;overflow:hidden;max-height:0;opacity:0;pointer-events:none;transition:max-height .35s,opacity .25s;width:100%;}
        .nav-item:hover .nav-float-menu,.nav-item.submenu-open .nav-float-menu{max-height:300px;opacity:1;pointer-events:all;}
        @media(max-width:900px){.nav-item:hover .nav-float-menu{max-height:0;opacity:0;pointer-events:none;}.nav-item.submenu-open .nav-float-menu{max-height:300px;opacity:1;pointer-events:all;}}
        .float-inner{position:relative;padding:4px 0 6px;margin-left:22px;}
        .float-inner::before{content:'';position:absolute;left:0;top:0;bottom:0;width:1.5px;background:var(--border);border-radius:2px;}
        .float-item{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0;margin:3px 0;border:none;background:transparent;cursor:pointer;font-family:inherit;position:relative;}
        .float-item::before{content:'';position:absolute;left:0;top:50%;width:16px;height:12px;border-left:1.5px solid var(--border);border-bottom:1.5px solid var(--border);border-bottom-left-radius:6px;transform:translateY(-100%);background:transparent;pointer-events:none;}
        .float-item-inner{display:flex;align-items:center;justify-content:space-between;width:100%;margin-left:18px;padding:10px 12px;border-radius:13px;font-size:14px;font-weight:500;color:var(--txt2);transition:background var(--tr),color var(--tr);}
        .float-item:hover .float-item-inner{background:rgba(0,0,0,.04);color:var(--txt);}
        .float-item.active .float-item-inner{background:rgba(255,255,255,.92);color:var(--txt);font-weight:700;}
        .float-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;background:var(--accent);color:#fff;}
        .nav-spacer{flex:1;min-height:20px;}
        .theme-row{display:flex;gap:6px;padding:6px 8px 8px;}
        .theme-btn{flex:1;display:flex;align-items:center;justify-content:center;padding:10px 0;border-radius:12px;border:1.5px solid var(--border);background:transparent;cursor:pointer;color:var(--txt2);transition:background var(--tr);}
        .theme-btn:hover{background:rgba(0,0,0,.06);}
        .theme-btn.t-active{background:var(--txt);border-color:var(--txt);color:var(--bg);}
        .theme-btn svg{width:16px;height:16px;}
        .nav-btn.logout{color:var(--red);margin-top:2px;}
        .nav-btn.logout:hover{background:var(--red-soft);}
        .nav-btn.logout .nav-ic{opacity:.6;color:var(--red);}
        .main-content{flex:1;padding:36px 40px;overflow-y:auto;min-width:0;background:transparent;scrollbar-width:thin;}
        .panel{display:none;}
        .panel.active{display:block;animation:panelIn .3s cubic-bezier(.4,0,.2,1);}
        @keyframes panelIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .page-header{margin-bottom:28px;}
        .page-title{font-size:34px;font-weight:900;letter-spacing:-1.5px;color:var(--txt);line-height:1;}
        .page-sub{font-size:14px;color:var(--txt2);margin-top:5px;font-weight:500;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px;}
        .stat-card{background:var(--glass-bg);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--radius);padding:26px 24px 22px;box-shadow:var(--glass-shadow);display:flex;flex-direction:column;gap:12px;transition:transform var(--tr),box-shadow var(--tr);}
        .stat-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);}
        .stat-lbl{display:flex;align-items:center;gap:9px;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.6px;}
        .stat-val{font-size:42px;font-weight:900;letter-spacing:-2.5px;color:var(--txt);line-height:1;}
        .stat-val small{font-size:16px;font-weight:600;opacity:.5;}
        .stat-sub{font-size:12px;color:var(--txt2);font-weight:500;}
        .dash-bottom{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .dash-card{background:var(--glass-bg);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--radius);box-shadow:var(--glass-shadow);overflow:hidden;transition:background var(--tr);}
        .dch{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:1px solid var(--border2);}
        .dct{font-size:16px;font-weight:700;color:var(--txt);}
        .pill{font-size:11.5px;font-weight:700;padding:4px 11px;border-radius:20px;}
        .pill-o{background:var(--accent-soft);color:var(--accent);}
        .pill-g{background:var(--green-soft);color:var(--green);}
        .ord-row{display:flex;align-items:center;justify-content:space-between;padding:13px 24px;border-bottom:1px solid var(--border2);transition:background var(--tr);cursor:pointer;}
        .ord-row:last-child{border-bottom:none;}
        .ord-row:hover{background:var(--bg);}
        .ord-name{font-size:14px;font-weight:600;color:var(--txt);}
        .ord-meta{font-size:12px;color:var(--txt2);}
        .ord-r{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
        .ord-price{font-size:13px;font-weight:700;color:var(--txt);}
        .spill{font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;}
        .bb-row{display:flex;align-items:center;justify-content:space-between;padding:13px 24px;border-bottom:1px solid var(--border2);}
        .bb-row:last-child{border-bottom:none;}
        .bb-dev{font-size:14px;font-weight:600;color:var(--txt);}
        .bb-cli{font-size:12px;color:var(--txt2);}
        .bb-price{font-size:15px;font-weight:800;color:var(--accent);}
        .empty-dash{padding:24px;text-align:center;color:var(--txt2);font-size:13px;font-weight:500;}
        .table-wrap{background:var(--glass-bg);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:var(--radius);box-shadow:var(--glass-shadow);overflow-x:auto;}
        .admin-table{width:100%;min-width:600px;border-collapse:collapse;}
        .admin-table thead{background:rgba(255,255,255,.4);border-bottom:1px solid var(--border2);}
        .admin-table th{padding:14px 20px;text-align:left;font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;}
        .admin-table td{padding:14px 20px;border-bottom:1px solid var(--border2);font-size:14px;vertical-align:middle;}
        .admin-table tr:last-child td{border-bottom:none;}
        .admin-table tbody tr:hover td{background:var(--bg);}
        .action-btn{padding:8px 14px;border-radius:9px;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-right:6px;transition:opacity .2s;}
        .btn-edit{background:var(--blue-soft);color:var(--blue);}
        .stoc-ok{background:var(--green-soft);color:var(--green);font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;}
        .stoc-zero{background:var(--red-soft);color:var(--red);font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;}
        .status-select{padding:8px 12px;border-radius:10px;border:none;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;outline:none;}
        .status-verde{background:var(--green-soft);color:var(--green);}
        .status-rosu{background:var(--red-soft);color:var(--red);}
        .status-galben{background:var(--yellow-soft);color:var(--yellow);}
        .status-albastru{background:var(--blue-soft);color:var(--blue);}
        .toolbar{display:flex;gap:12px;margin-bottom:18px;align-items:center;flex-wrap:wrap;}
        .toolbar input,.toolbar select{padding:11px 16px;border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-family:inherit;background:var(--white);color:var(--txt);outline:none;flex:1;}
        .field{margin-bottom:14px;}
        .field label{display:block;font-size:12px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
        .field input,.field select,.field textarea{width:100%;padding:12px 16px;border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-family:inherit;background:var(--white);color:var(--txt);outline:none;transition:border-color var(--tr);}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--accent);}
        .field textarea{resize:vertical;min-height:80px;}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:0;}
        .primary-btn{padding:14px 28px;background:var(--txt);color:#fff;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:14px;margin-right:10px;transition:background var(--tr);}
        .primary-btn:hover{background:var(--accent);}
        .primary-btn.secondary{background:transparent;color:var(--txt2);border:1.5px solid var(--border);}
        .section-box{background:rgba(255,255,255,.4);border:1px solid var(--border);border-radius:var(--radius-sm);padding:20px;margin-bottom:14px;}
        .section-box-title{font-size:13px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;}
        .dash-hero{background:linear-gradient(135deg,rgba(43,46,39,.96) 0%,rgba(35,37,30,.98) 55%,rgba(50,30,10,.95) 100%);border-radius:var(--radius);padding:32px 36px;margin-bottom:18px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.07);box-shadow:0 12px 48px rgba(43,46,39,.25);}
        .dash-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(227,91,0,.28) 0%,transparent 65%);pointer-events:none;}
        .hero-greeting{font-size:13px;font-weight:600;color:rgba(255,255,255,.5);margin-bottom:6px;}
        .hero-title{font-size:26px;font-weight:900;color:#fff;margin-bottom:4px;}
        .hero-sub{font-size:13.5px;color:rgba(255,255,255,.4);}
        .hero-date{font-size:12px;color:rgba(255,255,255,.35);margin-top:2px;}
        .hero-stats{display:flex;gap:24px;margin-top:22px;padding-top:18px;border-top:1px solid rgba(255,255,255,.09);}
        .hero-stat-val{font-size:22px;font-weight:900;color:#fff;}
        .hero-stat-val span{color:var(--accent);}
        .hero-stat-lbl{font-size:11px;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px;}
        .hero-sep{width:1px;background:rgba(255,255,255,.09);}
        .quick-actions{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
        .qa-btn{display:flex;align-items:center;gap:8px;padding:10px 18px;border-radius:50px;border:1px solid var(--glass-border);background:var(--glass-bg);backdrop-filter:blur(16px);color:var(--txt);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background var(--tr),transform .15s;}
        .qa-btn:hover{background:rgba(255,255,255,.92);transform:translateY(-2px);}
        .qa-btn.qa-accent{background:var(--accent);color:#fff;border-color:transparent;}
        .qa-btn.qa-accent:hover{background:#d05200;}
        .qa-btn svg{width:15px;height:15px;color:var(--accent);}
        .qa-btn.qa-accent svg{color:#fff;}
        .dash-layout{display:grid;grid-template-columns:1fr 370px;gap:14px;align-items:start;}
        .dash-left,.dash-right{display:flex;flex-direction:column;}
        .ov-grid{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:6px 24px 22px;gap:0;}
        .ov-sep{width:1.5px;height:76px;background:var(--border2);margin:0 26px;}
        .ov-num{font-size:50px;font-weight:900;letter-spacing:-3px;color:var(--txt);line-height:1;margin-bottom:5px;}
        .ov-lbl{font-size:13px;font-weight:600;color:var(--txt2);}
        .ov-hint{font-size:12px;color:var(--txt2);}
        .ov-top{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
        .ov-chips{display:flex;gap:8px;padding:16px 20px 20px;border-top:1px solid var(--border2);}
        .ov-chip{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.6);border-radius:11px;padding:9px 12px;flex:1;transition:background var(--tr);}
        .ov-chip:hover{background:rgba(255,255,255,.8);}
        .ov-chip-ic{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
        .ov-chip-val{font-size:16px;font-weight:800;color:var(--txt);}
        .ov-chip-lbl{font-size:11px;color:var(--txt2);font-weight:600;}
        .prod-row{display:flex;align-items:center;gap:12px;padding:11px 20px;border-bottom:1px solid var(--border2);cursor:pointer;transition:background var(--tr);}
        .prod-row:hover{background:var(--bg);}
        .prod-img{width:44px;height:44px;border-radius:10px;object-fit:contain;background:var(--bg);padding:3px;border:1px solid var(--border2);}
        .prod-img-ph{width:44px;height:44px;border-radius:10px;background:var(--bg);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:18px;}
        .prod-name{font-size:13px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .prod-cat{font-size:11px;color:var(--txt2);}
        .prod-right{text-align:right;flex-shrink:0;}
        .prod-price{font-size:13.5px;font-weight:700;color:var(--txt);}
        .prod-stock{font-size:11px;font-weight:700;padding:2px 7px;border-radius:5px;display:inline-block;margin-top:3px;}
        .ps-ok{background:var(--green-soft);color:var(--green);}
        .ps-no{background:var(--red-soft);color:var(--red);}
        .all-btn{width:100%;padding:11px;border-radius:50px;border:1.5px solid var(--border);background:rgba(255,255,255,.5);color:var(--txt2);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background var(--tr);}
        .all-btn:hover{background:rgba(255,255,255,.85);color:var(--txt);}
        .invoice-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;padding:20px;}
        .invoice-modal-overlay.active{display:flex;}
        .invoice-paper{background:#fff;border-radius:20px;padding:44px;max-width:820px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.25);}
        .invoice-actions{display:flex;gap:12px;margin-bottom:28px;}
        .btn-print{padding:10px 20px;background:var(--txt);color:#fff;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;}
        .btn-close-inv{padding:10px 20px;background:var(--red-soft);color:var(--red);border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:inherit;}
        .invoice-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e5e5ea;}
        .invoice-logo{font-size:28px;font-weight:900;color:#1d1d1f;}
        .invoice-logo span{color:var(--accent);}
        .invoice-addresses{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:32px;}
        .address-box h3{font-size:13px;font-weight:700;color:#9a9a9a;text-transform:uppercase;margin-bottom:12px;}
        .address-box p{margin:4px 0;font-size:14px;}
        .invoice-status-badge{display:inline-flex;align-items:center;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:700;margin-top:10px;border:1px solid;}
        .invoice-products{width:100%;border-collapse:collapse;margin-bottom:28px;}
        .invoice-products th{background:#f9fafb;padding:12px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#9a9a9a;border-bottom:2px solid #e5e5ea;font-weight:700;}
        .invoice-products td{padding:14px 16px;border-bottom:1px solid #e5e5ea;vertical-align:middle;}
        .prod-info{display:flex;align-items:center;gap:14px;}
        .invoice-products img{width:56px;height:56px;object-fit:contain;border-radius:8px;border:1px solid #e5e5ea;padding:4px;background:#fff;}
        .invoice-summary{display:flex;justify-content:flex-end;}
        .summary-box{width:340px;background:#f9fafb;padding:24px;border-radius:12px;border:1px solid #e5e5ea;}
        .summary-row{display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;color:#9a9a9a;}
        .summary-row.total{border-top:2px solid #e5e5ea;padding-top:14px;margin-top:4px;margin-bottom:0;font-size:20px;font-weight:800;color:#141414;}
        .summary-row.total span:last-child{color:var(--accent);}
        .invoice-footer{margin-top:44px;text-align:center;color:#9a9a9a;font-size:12px;border-top:1px solid #e5e5ea;padding-top:18px;}
        .text-right{text-align:right!important;}
        .text-center{text-align:center!important;}
        .mob-topbar{display:none;position:fixed;top:0;left:0;right:0;height:56px;background:var(--glass-bg);backdrop-filter:var(--glass-blur);border-bottom:1px solid var(--glass-border);z-index:998;align-items:center;justify-content:space-between;padding:0 18px;}
        .mob-brand{font-size:18px;font-weight:900;color:var(--txt);}
        .mob-brand span{color:var(--accent);}
        .mob-hamburger{width:38px;height:38px;border-radius:11px;border:1.5px solid var(--border);background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;}
        .mob-hamburger span{display:block;width:18px;height:2px;background:var(--txt);border-radius:2px;transition:transform .28s,opacity .2s;}
        .mob-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .mob-hamburger.open span:nth-child(2){opacity:0;}
        .mob-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
        .sidebar-backdrop{display:none;position:fixed;top:0;left:280px;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:999;opacity:0;transition:opacity .25s;}
        .sidebar-backdrop.visible{opacity:1;}
        @media(max-width:900px){
          .mob-topbar.visible{display:flex;}
          .sidebar .sidebar-brand{display:none;}
          .sidebar-backdrop{display:block;pointer-events:none;}
          .sidebar-backdrop.visible{pointer-events:all;}
          .sidebar{position:fixed!important;left:0;top:0;bottom:0;z-index:1000;width:280px!important;transform:translateX(-100%);transition:transform .3s;overflow-y:auto;background:var(--white)!important;backdrop-filter:none!important;box-shadow:8px 0 32px rgba(0,0,0,.2)!important;}
          .sidebar.open{transform:translateX(0)!important;}
          .main-content{width:100%;padding:76px 18px 32px;}
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .dash-layout{grid-template-columns:1fr;}
          .dash-hero{padding:24px 22px;}
          .hero-title{font-size:22px;}
        }
        @media(max-width:700px){
          .table-wrap{overflow:visible!important;background:transparent!important;border:none!important;box-shadow:none!important;border-radius:0!important;}
          .admin-table{min-width:0!important;width:100%!important;display:block!important;}
          .admin-table thead{display:none!important;}
          .admin-table,.admin-table tbody{display:block!important;width:100%!important;}
          .admin-table tr{display:block!important;width:100%!important;background:var(--white);border-radius:16px;margin-bottom:10px;padding:14px 14px 0;border:1px solid var(--border2);box-shadow:var(--shadow);}
          .admin-table td{display:block!important;border:none!important;padding:0!important;}
          .form-grid{grid-template-columns:1fr;}
          .dash-layout{grid-template-columns:1fr;}
          .ov-grid{grid-template-columns:1fr;gap:12px;}
          .ov-sep{display:none;}
        }
        @media print{body *{visibility:hidden;}#invoice-modal,#invoice-modal *,#bb-modal,#bb-modal *{visibility:visible;}#invoice-modal,#bb-modal{position:absolute;left:0;top:0;right:0;background:none;padding:0;display:block!important;}.invoice-paper{box-shadow:none;padding:0;max-width:100%;border-radius:0;}.no-print{display:none!important;}@page{margin:1cm;}}
        [data-theme="dark"] .dash-card,[data-theme="dark"] .table-wrap{background:rgba(28,28,31,.82);border-color:rgba(255,255,255,.07);}
        [data-theme="dark"] .ov-chip{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.07);}
        [data-theme="dark"] .all-btn{background:rgba(255,255,255,.05);}
        [data-theme="dark"] .qa-btn{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.09);}
        [data-theme="dark"] input:not([type="color"]):not([type="file"]),[data-theme="dark"] textarea,[data-theme="dark"] select{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.1);color:var(--txt);}
        [data-theme="dark"] .section-box{background:rgba(255,255,255,.04);}
        [data-theme="dark"] .status-verde{background:rgba(22,163,74,.2)!important;color:#4ade80!important;}
        [data-theme="dark"] .status-rosu{background:rgba(220,38,38,.2)!important;color:#f87171!important;}
        [data-theme="dark"] .status-galben{background:rgba(234,179,8,.2)!important;color:#facc15!important;}
        [data-theme="dark"] .status-albastru{background:rgba(99,102,241,.2)!important;color:#a5b4fc!important;}
        [data-theme="dark"] .admin-table thead{background:rgba(255,255,255,.04);}
        [data-theme="dark"] .login-card input{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.1);}
        [data-theme="dark"] .nav-btn.active{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.13);}
        [data-theme="dark"] .float-item.active .float-item-inner{background:rgba(255,255,255,.11);}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* LOGIN */}
      <div id="login-screen">
        <div className="login-card" style={{ animation: 'slideUp .5s cubic-bezier(.34,1.5,.64,1)' }}>
          <div className="login-logo">OVI<span>FONE</span></div>
          <p className="login-sub">Panou de control administrativ</p>
          <div className="field"><input type="email" id="auth-email" placeholder="Email admin" /></div>
          <div className="field"><input type="password" id="auth-pass" placeholder="Parolă" /></div>
          <button className="btn-login-main" id="btn-login">Conectare</button>
          <div id="login-error" style={{ color: 'var(--red)', marginTop: '14px', fontSize: '13px', fontWeight: 600 }}></div>
        </div>
      </div>

      {/* MOBILE TOPBAR */}
      <div className="mob-topbar" id="mob-topbar">
        <span className="mob-brand">OVI<span>FONE</span></span>
        <button className="mob-hamburger" id="mob-hamburger" aria-label="Meniu">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div className="sidebar-backdrop" id="sidebar-backdrop"></div>

      {/* DASHBOARD */}
      <div id="dashboard-screen">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="2.2" fill="white"/>
                <rect x="12" y="2" width="8" height="8" rx="2.2" fill="white" opacity=".6"/>
                <rect x="2" y="12" width="8" height="8" rx="2.2" fill="white" opacity=".6"/>
                <rect x="12" y="12" width="8" height="8" rx="2.2" fill="white" opacity=".3"/>
              </svg>
            </div>
            <span className="brand-name">OVI<span>FONE</span></span>
          </div>

          <div className="nav-section">General</div>
          <div className="nav-item">
            <button className="nav-btn active" data-target="panel-dashboard">
              <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
              Dashboard
            </button>
          </div>

          <div className="nav-section">Catalog</div>
          <div className="nav-item" id="nav-produse-item">
            <button className="nav-btn" id="nav-produse-trigger">
              <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Produse
              <svg className="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="nav-float-menu" id="nav-float-produse">
              <div className="float-inner">
                <button className="float-item" data-target="panel-gestiune"><div className="float-item-inner"><span>Listă Produse</span></div></button>
                <button className="float-item" data-target="panel-adaugare" id="btn-nav-adauga"><div className="float-item-inner"><span>Adaugă Produs</span><span className="float-badge">Nou</span></div></button>
              </div>
            </div>
          </div>

          <div className="nav-section">Vânzări</div>
          <div className="nav-item">
            <button className="nav-btn" data-target="panel-comenzi">
              <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              Comenzi
            </button>
          </div>
          <div className="nav-item">
            <button className="nav-btn" data-target="panel-buyback">
              <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10M23 14l-4.6 4.4A9 9 0 0 1 3.5 15"/></svg>
              BuyBack
            </button>
          </div>

          <div className="nav-spacer"></div>
          <div className="theme-row">
            <button className="theme-btn t-active" id="btn-theme-light" title="Mod Luminos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
            </button>
            <button className="theme-btn" id="btn-theme-dark" title="Mod Întunecat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>
          <button className="nav-btn logout" id="btn-logout">
            <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Deconectare
          </button>
        </div>

        {/* MAIN */}
        <div className="main-content">

          {/* PANEL DASHBOARD */}
          <div id="panel-dashboard" className="panel active">
            <div className="dash-hero">
              <div className="hero-greeting" id="dash-greeting">Bun venit înapoi 👋</div>
              <div className="hero-title">Dashboard <span style={{ color: 'var(--accent)' }}>Ovifone</span></div>
              <div className="hero-sub">Panou de control · Gestiune magazin</div>
              <div className="hero-date" id="dash-date"></div>
              <div className="hero-stats">
                <div className="hero-stat"><div className="hero-stat-val"><span id="hero-comenzi">—</span></div><div className="hero-stat-lbl">Comenzi</div></div>
                <div className="hero-sep"></div>
                <div className="hero-stat"><div className="hero-stat-val"><span id="hero-venit">—</span></div><div className="hero-stat-lbl">Venit lei</div></div>
                <div className="hero-sep"></div>
                <div className="hero-stat"><div className="hero-stat-val"><span id="hero-produse">—</span></div><div className="hero-stat-lbl">Produse</div></div>
              </div>
            </div>

            <div className="quick-actions">
              <button className="qa-btn qa-accent" data-goto="panel-adaugare"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Adaugă Produs</button>
              <button className="qa-btn" data-goto="panel-comenzi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>Comenzi</button>
              <button className="qa-btn" data-goto="panel-gestiune"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>Catalog</button>
              <button className="qa-btn" data-goto="panel-buyback"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10M23 14l-4.6 4.4A9 9 0 0 1 3.5 15"/></svg>BuyBack</button>
            </div>

            <div className="dash-layout">
              <div className="dash-left">
                <div className="dash-card" style={{ marginBottom: '14px' }}>
                  <div className="dch"><span className="dct">Overview</span></div>
                  <div className="ov-grid">
                    <div className="ov-block">
                      <div className="ov-top"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--txt2)' }}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><span className="ov-lbl">Comenzi</span></div>
                      <div className="ov-num" id="stat-comenzi">—</div>
                      <div className="ov-hint" id="stat-comenzi-noi">se încarcă...</div>
                    </div>
                    <div className="ov-sep"></div>
                    <div className="ov-block">
                      <div className="ov-top"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--txt2)' }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span className="ov-lbl">Venit Total</span></div>
                      <div className="ov-num" id="stat-venit">—<span style={{ fontSize: '18px', opacity: '.5' }}>lei</span></div>
                      <div className="ov-hint">din comenzi plasate</div>
                    </div>
                  </div>
                  <div className="ov-chips">
                    <div className="ov-chip"><div className="ov-chip-ic" style={{ background: 'var(--bg)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--txt2)" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg></div><div><div className="ov-chip-val" id="stat-produse">—</div><div className="ov-chip-lbl">Produse</div></div></div>
                    <div className="ov-chip"><div className="ov-chip-ic" style={{ background: 'var(--accent-soft)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10"/></svg></div><div><div className="ov-chip-val" id="stat-bb">—</div><div className="ov-chip-lbl">BuyBack</div></div></div>
                    <div className="ov-chip"><div className="ov-chip-ic" style={{ background: 'var(--green-soft)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div><div><div className="ov-chip-val" id="stat-active">—</div><div className="ov-chip-lbl">Active</div></div></div>
                  </div>
                </div>
                <div className="dash-card">
                  <div className="dch"><span className="dct">Comenzi Recente</span><span className="pill pill-o" id="badge-comenzi-active">0 active</span></div>
                  <div id="dash-recent-orders"><div className="empty-dash">Se încarcă...</div></div>
                </div>
              </div>
              <div className="dash-right">
                <div className="dash-card" style={{ marginBottom: '14px' }}>
                  <div className="dch"><span className="dct">Produse în Catalog</span></div>
                  <div id="dash-produse-list"><div className="empty-dash">Se încarcă...</div></div>
                  <div style={{ padding: '12px 20px 16px' }}><button className="all-btn" data-goto="panel-gestiune">Toate produsele</button></div>
                </div>
                <div className="dash-card">
                  <div className="dch"><span className="dct">Cereri BuyBack</span><span className="pill pill-o" id="badge-bb-noi">0 noi</span></div>
                  <div id="dash-recent-bb"><div className="empty-dash">Se încarcă...</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL GESTIUNE */}
          <div id="panel-gestiune" className="panel">
            <div className="page-header"><h1 className="page-title">Listă Produse</h1></div>
            <div className="toolbar">
              <input type="text" id="search-table" placeholder="🔍  Caută produs sau brand..." />
              <select id="filter-table-cat" style={{ width: '210px', flex: 'none' }}>
                <option value="toate">Toate Categoriile</option>
                <option value="telefoane">📱 Telefoane</option>
                <option value="telefoane altele">📱 Telefoane (Altele)</option>
                <option value="tablete">📱 Tablete</option>
                <option value="casti">🎧 Căști</option>
                <option value="accesorii">🔌 Accesorii</option>
                <option value="huse">🛡️ Huse</option>
                <option value="folii">✨ Folii</option>
              </select>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Poză</th><th>Produs</th><th>Categorie</th><th>Preț</th><th>Stoc</th><th>Acțiuni</th></tr></thead>
                <tbody id="admin-product-list"><tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--txt2)' }}>Se încarcă produsele...</td></tr></tbody>
              </table>
            </div>
          </div>

          {/* PANEL COMENZI */}
          <div id="panel-comenzi" className="panel">
            <div className="page-header"><h1 className="page-title">Comenzi</h1></div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID & Dată</th><th>Client</th><th>Total & Metodă</th><th>Status</th><th>Acțiuni</th></tr></thead>
                <tbody id="admin-orders-list"><tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--txt2)' }}>Se încarcă comenzile...</td></tr></tbody>
              </table>
            </div>
          </div>

          {/* PANEL BUYBACK */}
          <div id="panel-buyback" className="panel">
            <div className="page-header"><h1 className="page-title">BuyBack</h1></div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>ID & Dată</th><th>Client</th><th>Dispozitiv Oferit</th><th>Preț Estimat</th><th>Status</th><th>Acțiuni</th></tr></thead>
                <tbody id="admin-bb-list"><tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--txt2)' }}>Se încarcă cererile...</td></tr></tbody>
              </table>
            </div>
          </div>

          {/* PANEL ADAUGARE */}
          <div id="panel-adaugare" className="panel">
            <div className="page-header"><h1 className="page-title" id="form-title">Adaugă Produs Nou</h1></div>
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', boxShadow: 'var(--glass-shadow)', padding: '32px' }}>
              <input type="hidden" id="edit-id" />
              <input type="hidden" id="edit-image-url" />
              <div className="form-grid">
                <div className="field"><label>Nume Produs</label><input type="text" id="p-name" placeholder="Ex: iPhone 17 Pro Max" /></div>
                <div className="field"><label>Brand</label><input type="text" id="p-brand" placeholder="Ex: Apple" /></div>
              </div>
              <div className="form-grid">
                <div className="field"><label>Preț Nou (Lei)</label><input type="number" id="p-price" placeholder="7499" /></div>
                <div className="field"><label>Preț Vechi (Lei)</label><input type="number" id="p-old-price" placeholder="7999" /></div>
              </div>
              <div className="form-grid">
                <div className="field"><label>Stoc (Bucăți)</label><input type="number" id="p-stoc" placeholder="Ex: 10" defaultValue="0" /></div>
                <div className="field"><label>Categorie</label>
                  <select id="p-cat">
                    <option value="telefoane">Telefoane</option><option value="telefoane altele">Telefoane (Alte Branduri)</option>
                    <option value="tablete">Tablete</option><option value="casti">Căști</option>
                    <option value="accesorii">Accesorii</option><option value="huse">Huse</option><option value="folii">Folii</option>
                  </select>
                </div>
              </div>
              <div className="section-box">
                <div className="section-box-title">🎨 Culori Produs (Opțional)</div>
                <p style={{ fontSize: '12px', color: 'var(--txt2)', marginBottom: '14px' }}>Alege nuanța și scrie numele culorii, apoi apasă Adaugă.</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
                  <input type="color" id="color-picker" defaultValue="#000000" />
                  <input type="text" id="color-name" placeholder="Nume (ex: Titan)" style={{ flex: 1, margin: 0 }} />
                  <button type="button" id="btn-add-color" style={{ padding: '12px 18px', background: 'var(--txt)', color: 'var(--white)', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Adaugă</button>
                </div>
                <div id="colors-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}></div>
                <input type="hidden" id="p-colors" />
              </div>
              <div id="grup-specific-tech">
                <div className="form-grid">
                  <div className="field"><label>Stocare (virgulă)</label><input type="text" id="p-storage" placeholder="256GB, 512GB" /></div>
                  <div className="field"><label>Sănătate Baterie</label><input type="text" id="p-baterie" placeholder="Ex: 95% sau 100%" defaultValue="100%" /></div>
                </div>
                <div className="form-grid">
                  <div className="field"><label>Stare Produs</label><select id="p-stare"><option value="Nou">Nou</option><option value="SH">Second Hand (SH)</option></select></div>
                  <div className="field"></div>
                </div>
              </div>
              <div id="grup-specific-casti" style={{ display: 'none' }}>
                <div className="form-grid">
                  <div className="field"><label>Conectivitate</label><select id="p-conectivitate"><option value="Wireless">Wireless (Fără fir / Bluetooth)</option><option value="Cu fir">Cu fir (Cablu)</option></select></div>
                  <div className="field"></div>
                </div>
              </div>
              <div id="grup-specific-protectie" style={{ display: 'none' }}>
                <div className="section-box">
                  <div className="section-box-title">Detalii Protecție</div>
                  <div className="form-grid">
                    <div className="field"><label>Compatibilitate</label><input type="text" id="p-compat" placeholder="Ex: Apple, Samsung" /></div>
                    <div className="field"><label>Material / Tip</label><input type="text" id="p-material" placeholder="Ex: Silicon, Piele, Sticlă" /></div>
                  </div>
                  <div className="field"><label>Caracteristici speciale</label><input type="text" id="p-caracteristici-prot" placeholder="Ex: MagSafe, Anti-șoc, Privacy" /></div>
                </div>
              </div>
              <div id="grup-specific-accesorii" style={{ display: 'none' }}>
                <div className="section-box">
                  <div className="section-box-title">Detalii Accesorii</div>
                  <div className="form-grid">
                    <div className="field"><label>Interfață / Conector</label><input type="text" id="p-conector" placeholder="Ex: USB-C, Lightning" /></div>
                    <div className="field"><label>Caracteristici speciale</label><input type="text" id="p-caracteristici-acc" placeholder="Ex: Fast Charge" /></div>
                  </div>
                </div>
              </div>
              <div className="field"><label>Descriere (Scurtă)</label><textarea id="p-desc" rows={3}></textarea></div>
              <div className="field"><label>Specificații (HTML Tabel)</label><textarea id="p-specs" rows={3}></textarea></div>
              <div className="form-grid">
                <div className="field">
                  <label>Poză Principală (1 fișier)</label>
                  <input type="file" id="p-image" accept="image/*" />
                  <small id="poza-help" style={{ color: 'var(--txt2)', display: 'none', fontSize: '12px' }}>Lasă gol dacă nu vrei să schimbi poza existentă.</small>
                </div>
                <div className="field"><label>Galerie (Mai multe poze)</label><input type="file" id="p-gallery" multiple accept="image/*" /></div>
              </div>
              <button className="primary-btn" id="btn-upload">Salvează Produsul</button>
              <button className="primary-btn secondary" id="btn-cancel-edit" style={{ display: 'none' }}>Anulează Editarea</button>
              <div id="upload-status" style={{ marginTop: '14px', textAlign: 'center', fontWeight: 700, fontSize: '14px' }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <div id="invoice-modal" className="invoice-modal-overlay"><div className="invoice-paper" id="invoice-content"></div></div>
      <div id="bb-modal" className="invoice-modal-overlay"><div className="invoice-paper" id="bb-content" style={{ maxWidth: '750px' }}></div></div>
    </>
  );
}