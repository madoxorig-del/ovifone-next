'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Cont() {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // ── CART BADGE ──
    function updateBadge() {
      let t = 0;
      try { JSON.parse(localStorage.getItem('ovifone_cart') || '[]').forEach(i => t += i.qty); } catch (e) {}
      document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = t; b.style.display = t > 0 ? 'flex' : 'none'; });
    }
    updateBadge();
    window.addEventListener('cartUpdated', updateBadge);

    const authScreen = document.getElementById('auth-screen');
    const profileScreen = document.getElementById('profile-screen');
    let currentUser = null;

    // ── SESIUNE SUPABASE ──
    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { currentUser = session.user; showProfile(currentUser); }
      else showAuth();
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') { currentUser = session.user; showProfile(currentUser); }
      else if (event === 'SIGNED_OUT') { currentUser = null; showAuth(); }
    });

    checkUserSession();

    // ── UI HELPERS ──
    function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    function setVal(id, val)  { const el = document.getElementById(id); if (el) el.value = val; }
    function showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
    function clearErr(id)     { showErr(id, ''); }
    function shakeInput(id) {
      const el = document.getElementById(id); if (!el) return;
      el.style.animation = 'none'; void el.offsetWidth;
      el.style.borderColor = '#ff3b30';
      el.style.animation = 'shake .4s ease';
      el.addEventListener('animationend', () => { el.style.animation = ''; el.style.borderColor = ''; }, { once: true });
    }
    function setLoading(btnId, on) {
      const btn = document.getElementById(btnId); if (!btn) return;
      btn.querySelector('.af-submit-txt').style.display = on ? 'none' : '';
      btn.querySelector('.af-spin').style.display = on ? '' : 'none';
      btn.disabled = on;
    }
    function btnSuccess(id) {
      const btn = document.getElementById(id); if (!btn) return;
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg>Salvat!`;
      btn.classList.add('success');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('success'); }, 2200);
    }

    const sk = document.createElement('style');
    sk.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
    document.head.appendChild(sk);

    // ── SHOW PROFILE / AUTH ──
    function showProfile(user) {
      if (authScreen) authScreen.style.display = 'none';
      if (profileScreen) profileScreen.style.display = 'block';
      fillProfileData(user);
      startCounters();
      initNavigation();
      // Asiguram ca butonul add address e vizibil
      setTimeout(() => {
        const addBtnEl = document.getElementById('open-addr-modal');
        if (addBtnEl) addBtnEl.classList.add('visible');
      }, 300);
    }

    function showAuth() {
      if (profileScreen) profileScreen.style.display = 'none';
      if (authScreen) authScreen.style.display = '';
      initAuthTabLine();
    }

    // ── AUTH TABS ──
    function initAuthTabLine() {
      const tabs = document.querySelectorAll('.a-tab');
      const line = document.getElementById('a-tab-line');
      const forms = document.querySelectorAll('.a-form');

      function moveLine(btn) {
        if (!line || !btn) return;
        const tr = btn.closest('.auth-tabs-row').getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        line.style.left = (br.left - tr.left) + 'px';
        line.style.width = br.width + 'px';
      }

      function switchForm(name) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.form === name));
        forms.forEach(f => f.classList.toggle('active', f.id === 'form-' + name));
        moveLine(document.querySelector(`.a-tab[data-form="${name}"]`));
      }

      const firstActive = document.querySelector('.a-tab.active');
      if (firstActive) setTimeout(() => moveLine(firstActive), 50);
      tabs.forEach(tab => tab.addEventListener('click', () => switchForm(tab.dataset.form)));
      document.querySelectorAll('.af-switch-btn').forEach(btn => btn.addEventListener('click', () => switchForm(btn.dataset.to)));
    }

    // ── EYE TOGGLE ──
    document.querySelectorAll('.af-eye, .pi-eye').forEach(btn => {
      btn.addEventListener('click', () => {
        const inp = document.getElementById(btn.dataset.t); if (!inp) return;
        const isP = inp.type === 'password';
        inp.type = isP ? 'text' : 'password';
        btn.querySelector('.eye-open').style.display = isP ? 'none' : '';
        btn.querySelector('.eye-shut').style.display = isP ? '' : 'none';
      });
    });

    // ── PASSWORD STRENGTH ──
    const levels = [
      { w: '0%', color: '#e5e5ea', label: '' },
      { w: '25%', color: '#ff3b30', label: 'Slabă' },
      { w: '50%', color: '#ff9500', label: 'Medie' },
      { w: '75%', color: '#34c759', label: 'Bună' },
      { w: '100%', color: '#007aff', label: 'Puternică' },
    ];
    function scorePass(p) {
      if (!p) return 0; let s = 1;
      if (p.length >= 8) s++;
      if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
      if (/[^A-Za-z0-9]/.test(p) && p.length >= 12) s++;
      return Math.min(4, s);
    }

    const rgPass = document.getElementById('rg-pass');
    const pwBarFill = document.getElementById('pw-bar-fill');
    rgPass?.addEventListener('input', () => {
      const lv = levels[scorePass(rgPass.value)];
      if (pwBarFill) { pwBarFill.style.width = lv.w; pwBarFill.style.background = lv.color; }
    });

    // ── LOGIN ──
    document.getElementById('form-login')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErr('e-li-email'); clearErr('e-li-pass');
      const email = document.getElementById('li-email')?.value.trim();
      const pass = document.getElementById('li-pass')?.value;
      let valid = true;
      if (!email || !email.includes('@')) { showErr('e-li-email', 'Email invalid'); shakeInput('li-email'); valid = false; }
      if (!pass) { showErr('e-li-pass', 'Introduceți parola'); shakeInput('li-pass'); valid = false; }
      if (!valid) return;
      setLoading('btn-login', true);
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      setLoading('btn-login', false);
      if (error) { showErr('e-li-pass', 'Email sau parolă incorectă!'); shakeInput('li-email'); shakeInput('li-pass'); }
      else toast('Te-ai autentificat cu succes!', 'ok');
    });

    // ── REGISTER ──
    document.getElementById('form-register')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErr('e-rg-fname'); clearErr('e-rg-email'); clearErr('e-rg-pass'); clearErr('e-rg-terms');
      const fname = document.getElementById('rg-fname')?.value.trim();
      const lname = document.getElementById('rg-lname')?.value.trim() || '';
      const email = document.getElementById('rg-email')?.value.trim();
      const pass = document.getElementById('rg-pass')?.value;
      const terms = document.getElementById('rg-terms')?.checked;
      let valid = true;
      if (!fname) { showErr('e-rg-fname', 'Câmp obligatoriu'); shakeInput('rg-fname'); valid = false; }
      if (!email || !email.includes('@')) { showErr('e-rg-email', 'Email invalid'); shakeInput('rg-email'); valid = false; }
      if (!pass || pass.length < 8) { showErr('e-rg-pass', 'Min. 8 caractere'); shakeInput('rg-pass'); valid = false; }
      if (!terms) { showErr('e-rg-terms', 'Acceptă termenii'); valid = false; }
      if (!valid) return;
      setLoading('btn-register', true);
      const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { first_name: fname, last_name: lname, full_name: `${fname} ${lname}`, avatar_url: '' } } });
      setLoading('btn-register', false);
      if (error) {
        if (error.message.includes('already registered')) { showErr('e-rg-email', 'Există deja un cont cu acest email!'); shakeInput('rg-email'); }
        else toast('Eroare: ' + error.message, 'err');
      } else {
        toast('Cont creat! Verifică email-ul pentru confirmare.', 'ok');
        document.getElementById('form-register').reset();
        document.querySelector('.a-tab[data-form="login"]')?.click();
      }
    });

    // ── GOOGLE LOGIN ──
    document.querySelectorAll('.af-soc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/cont' } });
        if (error) toast('Eroare: ' + error.message, 'err');
      });
    });

    // ── FILL PROFILE ──
    function fillProfileData(user) {
      if (!user) return;
      const meta = user.user_metadata || {};
      const fname = meta.first_name || '';
      const lname = meta.last_name || '';
      const fullName = meta.full_name || [fname, lname].filter(Boolean).join(' ');
      const initials = (fname[0] || user.email[0] || '').toUpperCase() + (lname[0] || '').toUpperCase();
      const d = new Date(user.created_at);
      const sinceText = d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });

      setText('ph-name', fullName || 'Utilizator');
      setText('ph-email', user.email || '');
      setText('ph-initials', initials || 'U');
      setText('ph-since', `Membru din ${sinceText}`);
      setVal('pf-fname', fname); setVal('pf-lname', lname);
      setVal('pf-email', user.email); setVal('pf-phone', meta.phone || '');

      const av = document.getElementById('ph-avatar');
      const initEl = document.getElementById('ph-initials');
      if (meta.avatar_url && av && initEl) {
        av.style.backgroundImage = `url(${meta.avatar_url})`; av.style.backgroundSize = 'cover'; av.style.backgroundPosition = 'center'; initEl.style.display = 'none';
      }
    }

    // ── SAVE PROFILE ──
    document.getElementById('save-profile')?.addEventListener('click', async () => {
      const fn = document.getElementById('pf-fname')?.value.trim() || '';
      const ln = document.getElementById('pf-lname')?.value.trim() || '';
      const ph = document.getElementById('pf-phone')?.value.trim() || '';
      const { data, error } = await supabase.auth.updateUser({ data: { first_name: fn, last_name: ln, full_name: `${fn} ${ln}`, phone: ph } });
      if (error) { toast('Eroare: ' + error.message, 'err'); }
      else { currentUser = data.user; fillProfileData(currentUser); btnSuccess('save-profile'); toast('Profilul a fost salvat!', 'ok'); }
    });

    // Live update initiale
    ['pf-fname', 'pf-lname'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        const fn = document.getElementById('pf-fname')?.value.trim() || '';
        const ln = document.getElementById('pf-lname')?.value.trim() || '';
        setText('ph-name', [fn, ln].filter(Boolean).join(' ') || 'Utilizator');
        setText('ph-initials', (fn[0] || '').toUpperCase() + (ln[0] || '').toUpperCase() || 'U');
      });
    });

    // ── SAVE PASSWORD ──
    const pfNewpw = document.getElementById('pf-newpw');
    const pwFill = document.getElementById('pw-fill');
    const pwLbl = document.getElementById('pw-lbl');
    pfNewpw?.addEventListener('input', () => {
      const lv = levels[scorePass(pfNewpw.value)];
      if (pwFill) { pwFill.style.width = lv.w; pwFill.style.background = lv.color; }
      if (pwLbl) { pwLbl.textContent = lv.label; pwLbl.style.color = lv.color; }
      const conf = document.getElementById('pf-confpw');
      if (conf?.value) conf.style.borderColor = conf.value === pfNewpw.value ? '#28a745' : '#ff3b30';
    });
    document.getElementById('pf-confpw')?.addEventListener('input', () => {
      const conf = document.getElementById('pf-confpw');
      const newp = document.getElementById('pf-newpw');
      if (conf && newp) conf.style.borderColor = conf.value === newp.value ? '#28a745' : '#ff3b30';
    });
    document.getElementById('save-password')?.addEventListener('click', async () => {
      const newp = document.getElementById('pf-newpw')?.value;
      const conf = document.getElementById('pf-confpw')?.value;
      if (!newp || newp.length < 8) { toast('Parola trebuie să aibă min. 8 caractere!', 'err'); shakeInput('pf-newpw'); return; }
      if (newp !== conf) { toast('Parolele nu coincid!', 'err'); shakeInput('pf-confpw'); return; }
      const { error } = await supabase.auth.updateUser({ password: newp });
      if (error) { toast('Eroare: ' + error.message, 'err'); }
      else {
        toast('Parola a fost actualizată!', 'ok');
        ['pf-oldpw', 'pf-newpw', 'pf-confpw'].forEach(id => { const el = document.getElementById(id); if (el) { el.value = ''; el.style.borderColor = ''; } });
        if (pwFill) pwFill.style.width = '0';
        if (pwLbl) pwLbl.textContent = '';
      }
    });

    // ── LOGOUT ──
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      toast('Te deconectezi...', 'ok');
      await supabase.auth.signOut();
    });

    // ── NAVIGATION ──
    function initNavigation() {
      const pnItems = document.querySelectorAll('.pn-item[data-section]');
      const mnItems = document.querySelectorAll('.mn-item[data-section]');
      const psecs = document.querySelectorAll('.psec');
      let curSec = 'profil';

      function switchSec(name) {
        if (name === curSec) return; curSec = name;
        pnItems.forEach(b => b.classList.toggle('active', b.dataset.section === name));
        mnItems.forEach(b => b.classList.toggle('active', b.dataset.section === name));
        psecs.forEach(s => { s.classList.toggle('active', s.id === 'sec-' + name); });
        if (name === 'comenzi') loadUserOrders();
        if (name === 'adrese') loadUserAddresses();
        if (window.innerWidth < 768) document.querySelector('.pb-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      pnItems.forEach(b => b.addEventListener('click', () => switchSec(b.dataset.section)));
      mnItems.forEach(b => b.addEventListener('click', () => switchSec(b.dataset.section)));
    }

    // ── COMENZI ──
    function updateAddressCount(count) {
      const val = count !== undefined ? count : document.querySelectorAll('.acard:not(.acard-add)').length;
      const statAdrese = document.querySelectorAll('.ph-stat-n')[1];
      if (statAdrese) statAdrese.textContent = val;
    }

    async function loadUserOrders() {
      if (!currentUser) return;
      const { data: comenzi, error } = await supabase.from('comenzi').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (error) { console.error('Eroare comenzi:', error); return; }
      const ordersContainer = document.querySelector('.orders-list');
      const badgeComenzi = document.getElementById('bdg-comenzi');
      const statComenzi = document.querySelectorAll('.ph-stat-n')[0];
      const numarComenzi = comenzi ? comenzi.length : 0;
      if (statComenzi) statComenzi.textContent = numarComenzi;
      if (badgeComenzi) { badgeComenzi.textContent = numarComenzi; badgeComenzi.style.display = numarComenzi > 0 ? 'inline-flex' : 'none'; }
      if (numarComenzi === 0 || !ordersContainer) return;
      ordersContainer.innerHTML = '';
      comenzi.forEach((comanda, index) => {
        const shortId = String(comanda.id).split('-')[0].toUpperCase();
        const dataComanda = new Date(comanda.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
        let badgeColor = 'rgba(227,91,0,.1)', textColor = 'var(--accent)';
        if (comanda.status?.includes('Anulata')) { badgeColor = '#fee2e2'; textColor = '#ef4444'; }
        if (comanda.status?.includes('Expediata') || comanda.status?.includes('Finalizata')) { badgeColor = '#d1fae5'; textColor = '#10b981'; }
        const card = document.createElement('div');
        card.className = 'acard';
        card.style.cssText = `margin-bottom:16px;opacity:0;transform:translateY(14px);transition:all 0.5s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.1}s;cursor:default;`;
        card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:14px;">
            <div><strong style="font-size:15px;font-weight:800;color:var(--txt);display:block;font-family:'Montserrat',sans-serif;">Comanda #${shortId}</strong><span style="font-size:12px;color:var(--txt2);font-weight:500;">Plasată pe ${dataComanda}</span></div>
            <span style="background:${badgeColor};color:${textColor};font-size:11px;font-weight:700;padding:5px 10px;border-radius:8px;letter-spacing:0.03em;text-transform:uppercase;">${comanda.status}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-size:13px;color:var(--txt2);line-height:1.6;"><p style="margin:0;">Plată: <strong>${comanda.metoda_plata?.toUpperCase()}</strong></p><p style="margin:0;">Destinație: <strong>${comanda.localitate}, ${comanda.tara || 'România'}</strong></p></div>
            <div style="text-align:right;"><span style="font-size:11px;color:var(--txt2);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;display:block;margin-bottom:2px;">Total</span><strong style="font-size:18px;font-weight:800;color:var(--txt);font-family:'Montserrat',sans-serif;">${comanda.total} lei</strong></div>
          </div>`;
        ordersContainer.appendChild(card);
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }

    function startCounters() { loadUserOrders(); loadUserAddresses(); }

    // ── MODAL ADRESE ──
    const addrModal = document.getElementById('addr-modal');
    function openAddrModal(title) {
      if (!addrModal) return;
      document.getElementById('addr-modal-title').textContent = title || 'Adresă nouă';
      addrModal.classList.add('open'); document.body.style.overflow = 'hidden';
    }
    function closeAddrModal() {
      if (!addrModal) return;
      addrModal.classList.remove('open'); document.body.style.overflow = '';
      ['am-fname', 'am-lname', 'am-street', 'am-city', 'am-zip', 'am-phone'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    }
    document.getElementById('open-addr-modal')?.addEventListener('click', () => openAddrModal('Adresă nouă'));
    document.getElementById('close-addr-modal')?.addEventListener('click', closeAddrModal);
    document.getElementById('cancel-addr')?.addEventListener('click', closeAddrModal);
    addrModal?.addEventListener('click', e => { if (e.target === addrModal) closeAddrModal(); });

    // ── LOAD ADDRESSES FROM SUPABASE ──
    async function loadUserAddresses() {
      if (!currentUser) return;
      const { data: adrese, error } = await supabase.from('adrese').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (error) { console.error('Eroare adrese:', error); return; }
      const grid = document.getElementById('addr-grid');
      const addBtn = document.getElementById('open-addr-modal');
      if (!grid || !addBtn) return;
      // Stergem cardurile vechi dar pastram butonul de adaugare
      grid.querySelectorAll('.acard:not(.acard-add)').forEach(c => c.remove());
      if (adrese && adrese.length > 0) {
        adrese.forEach(addr => renderAddressCard(addr, grid, addBtn));
      }
      updateAddressCount(adrese ? adrese.length : 0);
      // Butonul devine vizibil
      const addBtnEl = document.getElementById('open-addr-modal');
      if (addBtnEl) addBtnEl.classList.add('visible');
    }

    function renderAddressCard(addr, grid, addBtn) {
      const card = document.createElement('div');
      card.className = 'acard';
      card.dataset.addrId = addr.id;
      card.style.cssText = 'opacity:0;transform:scale(.88) translateY(14px);transition:all .5s cubic-bezier(.34,1.56,.64,1)';
      card.innerHTML = `
        <div class="acard-ico"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="1.8" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
        <strong class="acard-type">${addr.prenume} ${addr.nume || ''}</strong>
        <div class="acard-txt"><p>${addr.strada}</p><p>${addr.oras}${addr.cod_postal ? ', ' + addr.cod_postal : ''}</p>${addr.telefon ? '<p>' + addr.telefon + '</p>' : ''}</div>
        <div class="acard-acts">
          <button class="acard-btn del-addr-btn" title="Șterge"><svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg></button>
        </div>`;
      grid.insertBefore(card, addBtn);
      requestAnimationFrame(() => { requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'scale(1) translateY(0)'; }); });
      card.querySelector('.del-addr-btn')?.addEventListener('click', async () => {
        card.style.transition = 'all .4s ease'; card.style.transform = 'scale(.86) translateY(10px)'; card.style.opacity = '0';
        setTimeout(async () => {
          const { error } = await supabase.from('adrese').delete().eq('id', addr.id);
          if (error) { toast('Eroare la ștergere!', 'err'); card.style.opacity = '1'; card.style.transform = ''; return; }
          card.remove();
          const newCount = document.querySelectorAll('.acard:not(.acard-add)').length;
          updateAddressCount(newCount);
          toast('Adresa a fost ștearsă.', 'err');
        }, 400);
      });
    }

    document.getElementById('save-addr')?.addEventListener('click', async () => {
      const fname = document.getElementById('am-fname')?.value.trim();
      const lname = document.getElementById('am-lname')?.value.trim() || '';
      const street = document.getElementById('am-street')?.value.trim();
      const city = document.getElementById('am-city')?.value.trim() || '';
      const zip = document.getElementById('am-zip')?.value.trim() || '';
      const phone = document.getElementById('am-phone')?.value.trim() || '';
      if (!fname || !street) { toast('Completați câmpurile obligatorii!', 'err'); return; }
      if (!currentUser) { toast('Trebuie să fii autentificat!', 'err'); return; }

      const { data, error } = await supabase.from('adrese').insert([{
        user_id: currentUser.id,
        prenume: fname, nume: lname,
        strada: street, oras: city,
        cod_postal: zip, telefon: phone
      }]).select().single();

      if (error) { toast('Eroare la salvare: ' + error.message, 'err'); return; }

      const grid = document.getElementById('addr-grid');
      const addBtn = document.getElementById('open-addr-modal');
      if (grid && addBtn) renderAddressCard(data, grid, addBtn);
      const newCount = document.querySelectorAll('.acard:not(.acard-add)').length;
      updateAddressCount(newCount);
      closeAddrModal();
      toast('Adresa a fost adăugată!', 'ok');
    });

    // ── SETARI ──
    document.querySelectorAll('.tog-sw input').forEach(chk => {
      chk.addEventListener('change', () => {
        const label = chk.closest('.tog-row')?.querySelector('.tinfo strong')?.textContent || '';
        toast(chk.checked ? `"${label}" activat.` : `"${label}" dezactivat.`, chk.checked ? 'ok' : 'err');
      });
    });
    document.querySelector('.pbtn-danger')?.addEventListener('click', async () => {
      if (confirm('Ești sigur că vrei să ștergi contul definitiv?')) toast('Cerere înregistrată.', 'err');
    });

    // ── AVATAR UPLOAD ──
    const camBtn = document.getElementById('ph-cam');
    const fileInput = document.getElementById('avatar-upload');
    const avatarEl = document.getElementById('ph-avatar');
    const initialsEl = document.getElementById('ph-initials');
    if (camBtn && fileInput) {
      camBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
      fileInput.addEventListener('change', async function () {
        const file = this.files[0]; if (!file) return;
        toast('Se încarcă poza...', 'ok');
        const reader = new FileReader();
        reader.onload = async function (e) {
          const imgUrl = e.target.result;
          const { data, error } = await supabase.auth.updateUser({ data: { avatar_url: imgUrl } });
          if (error) { toast('Eroare: ' + error.message, 'err'); }
          else { if (avatarEl) { avatarEl.style.backgroundImage = `url(${imgUrl})`; avatarEl.style.backgroundSize = 'cover'; avatarEl.style.backgroundPosition = 'center'; } if (initialsEl) initialsEl.style.display = 'none'; toast('Poza actualizată!', 'ok'); }
        };
        reader.readAsDataURL(file);
      });
    }

    // ── TOAST ──
    let toastTimer;
    function toast(msg, type = 'ok') {
      const el = document.getElementById('p-toast'); const ic = document.getElementById('p-toast-ic'); const ms = document.getElementById('p-toast-msg');
      if (!el || !ic || !ms) return;
      clearTimeout(toastTimer); el.classList.remove('show', 'hide'); ms.textContent = msg; ic.className = 'p-toast-ic ' + type;
      ic.innerHTML = type === 'ok' ? `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>` : `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      void el.offsetWidth; el.classList.add('show');
      toastTimer = setTimeout(() => { el.classList.replace('show', 'hide'); setTimeout(() => el.classList.remove('hide'), 400); }, 3000);
    }

  }, []);

  return (
    <>
      {/* AUTH SCREEN */}
      <div className="auth-screen" id="auth-screen">
        <div className="auth-split">
          <div className="auth-left">
            <div className="auth-left-inner">
              <div className="auth-brand-tag">
                <div className="css-logo-icon abt-icon"><div className="css-logo-speaker"></div><div className="css-logo-button"></div></div>
                <span className="css-logo-text">OVIFONE</span>
              </div>
              <h1 className="auth-left-h1">Telefoane<br /><em>premium</em>,<br />prețuri corecte.</h1>
              <p className="auth-left-sub">Contul tău — comenzi, garanții, livrare expresă, toate într-un loc.</p>
              <ul className="auth-perks">
                <li><div className="ap-dot"></div>Garanție 12 luni pe orice produs</li>
                <li><div className="ap-dot"></div>Livrare gratuită în 24–48 ore</li>
                <li><div className="ap-dot"></div>Retur gratuit 14 zile</li>
                <li><div className="ap-dot"></div>Plata in rate fara dobanda</li>
              </ul>
            </div>
            <div className="auth-left-deco">
              <div className="ald-phone"><div className="ald-notch"></div><div className="ald-screen"></div></div>
              <div className="ald-circle c1"></div><div className="ald-circle c2"></div><div className="ald-circle c3"></div>
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-right-inner">
              <div className="auth-tabs-row">
                <button className="a-tab active" data-form="login">Autentificare</button>
                <button className="a-tab" data-form="register">Cont nou</button>
                <div className="a-tab-line" id="a-tab-line"></div>
              </div>

              {/* LOGIN FORM */}
              <form className="a-form active" id="form-login" noValidate>
                <div className="a-form-head"><h2>Bun venit!</h2><p>Intră în contul tău Ovifone</p></div>
                <div className="af-field">
                  <label>Email</label>
                  <div className="af-input-wrap">
                    <svg className="af-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input type="email" className="af-input" id="li-email" placeholder="nume@email.com" autoComplete="email" />
                  </div>
                  <span className="af-err" id="e-li-email"></span>
                </div>
                <div className="af-field">
                  <label>Parolă</label>
                  <div className="af-input-wrap">
                    <svg className="af-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input type="password" className="af-input" id="li-pass" placeholder="••••••••" autoComplete="current-password" />
                    <button type="button" className="af-eye" data-t="li-pass">
                      <svg className="eye-open" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <svg className="eye-shut" style={{ display: 'none' }} viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    </button>
                  </div>
                  <span className="af-err" id="e-li-pass"></span>
                </div>
                <div className="af-row">
                  <label className="af-check"><input type="checkbox" id="li-remember" /><span className="af-check-box"></span><span>Ține-mă minte</span></label>
                  <a href="#" className="af-forgot">Ai uitat parola?</a>
                </div>
                <button type="submit" className="af-submit" id="btn-login">
                  <span className="af-submit-txt">Autentifică-te</span>
                  <span className="af-spin" style={{ display: 'none' }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="spin-anim"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg></span>
                </button>
                <div className="af-or"><span>sau autentifică-te cu</span></div>
                <div className="af-social">
                  <button type="button" className="af-soc-btn"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google</button>
                </div>
                <div className="af-switch-wrap"><p className="af-switch">Client nou? <button type="button" className="af-switch-btn" data-to="register">Creează un cont</button></p></div>
              </form>

              {/* REGISTER FORM */}
              <form className="a-form" id="form-register" noValidate>
                <div className="a-form-head"><h2>Creează cont</h2><p>Simplu, rapid și securizat</p></div>
                <div className="af-field-row">
                  <div className="af-field"><label>Prenume</label><div className="af-input-wrap"><input type="text" className="af-input" id="rg-fname" placeholder="Prenumele tău" /></div><span className="af-err" id="e-rg-fname"></span></div>
                  <div className="af-field"><label>Nume</label><div className="af-input-wrap"><input type="text" className="af-input" id="rg-lname" placeholder="Numele tău" /></div></div>
                </div>
                <div className="af-field">
                  <label>Email</label>
                  <div className="af-input-wrap">
                    <svg className="af-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input type="email" className="af-input" id="rg-email" placeholder="nume@email.com" />
                  </div>
                  <span className="af-err" id="e-rg-email"></span>
                </div>
                <div className="af-field">
                  <label>Parolă</label>
                  <div className="af-input-wrap">
                    <svg className="af-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input type="password" className="af-input" id="rg-pass" placeholder="Min. 8 caractere" />
                    <button type="button" className="af-eye" data-t="rg-pass">
                      <svg className="eye-open" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <svg className="eye-shut" style={{ display: 'none' }} viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    </button>
                  </div>
                  <div className="pw-bar"><div className="pw-bar-fill" id="pw-bar-fill"></div></div>
                  <span className="af-err" id="e-rg-pass"></span>
                </div>
                <label className="af-check terms-chk"><input type="checkbox" id="rg-terms" /><span className="af-check-box"></span><span>Sunt de acord cu <a href="/termeni-si-conditii" className="af-lnk">Termenii și Condițiile</a></span></label>
                <span className="af-err" id="e-rg-terms"></span>
                <button type="submit" className="af-submit" id="btn-register">
                  <span className="af-submit-txt">Creează cont</span>
                  <span className="af-spin" style={{ display: 'none' }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="spin-anim"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg></span>
                </button>
                <div className="af-or"><span>sau înscrie-te cu</span></div>
                <div className="af-social">
                  <button type="button" className="af-soc-btn"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google</button>
                </div>
                <div className="af-switch-wrap"><p className="af-switch">Ai deja un cont? <button type="button" className="af-switch-btn" data-to="login">Autentifică-te</button></p></div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE SCREEN */}
      <main className="profile-screen" id="profile-screen" style={{ display: 'none' }}>
        <div className="ph-wrap">
          <div className="ph-card">
            <div className="ph-avatar-col">
              <div className="ph-avatar" id="ph-avatar">
                <span id="ph-initials">U</span>
                <button className="ph-cam" id="ph-cam" title="Schimbă poza"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg></button>
              </div>
              <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} />
            </div>
            <div className="ph-info-col">
              <div className="ph-name-row">
                <h1 id="ph-name">Utilizator Nou</h1>
                <span className="ph-verified"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> Verificat</span>
              </div>
              <p className="ph-email" id="ph-email"></p>
              <p className="ph-since">Membru nou</p>
            </div>
            <div className="ph-stats-col">
              <div className="ph-stat"><span className="ph-stat-n" data-count="0">0</span><span className="ph-stat-l">Comenzi</span></div>
              <div className="ph-stat-sep"></div>
              <div className="ph-stat"><span className="ph-stat-n" data-count="0">0</span><span className="ph-stat-l">Adrese</span></div>
              <div className="ph-stat-sep"></div>
              <div className="ph-stat"><span className="ph-stat-n" data-count="0">0</span><span className="ph-stat-l">Favorite</span></div>
            </div>
            <button className="ph-logout" id="logout-btn"><svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Deconectare</button>
          </div>
        </div>

        <div className="pb-layout">
          <aside className="pb-sidebar">
            <nav className="pnav">
              <button className="pn-item active" data-section="profil"><svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><span>Profilul Meu</span></button>
              <button className="pn-item" data-section="comenzi"><svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg><span>Comenzi</span><span className="pn-badge" id="bdg-comenzi" style={{ display: 'none' }}>0</span></button>
              <button className="pn-item" data-section="adrese"><svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>Adrese</span></button>
              <button className="pn-item" data-section="favorite"><svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span>Favorite</span><span className="pn-badge" id="bdg-favorite" style={{ display: 'none' }}>0</span></button>
              <button className="pn-item" data-section="setari"><svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg><span>Setări</span></button>
            </nav>
          </aside>

          <div className="pb-content">
            {/* PROFIL */}
            <section className="psec active" id="sec-profil">
              <div className="sec-hd"><h2>Profilul Meu</h2><p>Actualizează datele personale</p></div>
              <div className="pcard">
                <div className="pcard-lbl">Date personale</div>
                <div className="pgrid">
                  <div className="pf"><label>Prenume</label><input type="text" className="pi" id="pf-fname" /></div>
                  <div className="pf"><label>Nume</label><input type="text" className="pi" id="pf-lname" /></div>
                  <div className="pf full"><label>Email</label><div className="pi-wrap"><input type="email" className="pi" id="pf-email" readOnly style={{ background: '#f5f5f7', color: '#86868b', cursor: 'not-allowed' }} /><span className="pi-ok"><svg viewBox="0 0 24 24" width="14" height="14" stroke="#28a745" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg></span></div></div>
                  <div className="pf"><label>Telefon</label><input type="tel" className="pi" id="pf-phone" placeholder="+40 7xx xxx xxx" /></div>
                  <div className="pf"><label>Data nașterii</label><input type="date" className="pi" id="pf-dob" /></div>
                </div>
                <div className="pcard-foot"><button className="pbtn-p" id="save-profile">Salvează Datele</button></div>
              </div>
              <div className="pcard mt20">
                <div className="pcard-lbl">Schimbă parola</div>
                <div className="pgrid">
                  <div className="pf full"><label>Parola curentă</label><div className="pi-pw"><input type="password" className="pi" id="pf-oldpw" placeholder="••••••••" /><button type="button" className="pi-eye" data-t="pf-oldpw"><svg className="eye-open" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg className="eye-shut" style={{ display: 'none' }} viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></button></div></div>
                  <div className="pf"><label>Parolă nouă</label><div className="pi-pw"><input type="password" className="pi" id="pf-newpw" placeholder="Min. 8 caractere" /><button type="button" className="pi-eye" data-t="pf-newpw"><svg className="eye-open" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg className="eye-shut" style={{ display: 'none' }} viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></button></div></div>
                  <div className="pf"><label>Confirmă parola</label><div className="pi-pw"><input type="password" className="pi" id="pf-confpw" placeholder="Repetă parola" /><button type="button" className="pi-eye" data-t="pf-confpw"><svg className="eye-open" viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg className="eye-shut" style={{ display: 'none' }} viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></button></div></div>
                  <div className="pf full"><div className="pw-bar"><div className="pw-fill" id="pw-fill"></div></div><span className="pw-lbl" id="pw-lbl"></span></div>
                </div>
                <div className="pcard-foot"><button className="pbtn-g" id="save-password">Actualizează parola</button></div>
              </div>
            </section>

            {/* COMENZI */}
            <section className="psec" id="sec-comenzi">
              <div className="sec-hd"><h2>Comenzile Mele</h2><p>Istoricul achizițiilor tale</p></div>
              <div className="orders-list">
                <div className="empty-state">
                  <div className="es-icon"><svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>
                  <h3>Nu ai nicio comandă</h3>
                  <p>Când vei plasa o comandă, aceasta va fi afișată aici.</p>
                  <a href="/" className="pbtn-p" style={{ textDecoration: 'none' }}>Descoperă oferte</a>
                </div>
              </div>
            </section>

            {/* ADRESE */}
            <section className="psec" id="sec-adrese">
              <div className="sec-hd"><h2>Adresele Mele</h2><p>Gestionează adresele de livrare</p></div>
              <div className="agrid" id="addr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                <button className="acard-add" id="open-addr-modal" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', padding: '32px 20px', border: '2px dashed #e5e7eb', borderRadius: '16px',
                  background: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: '14px',
                  fontWeight: 600, width: '100%', minHeight: '140px', transition: 'all 0.2s ease'
                }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.8" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                  <span>Adaugă o adresă nouă</span>
                </button>
              </div>
            </section>

            {/* FAVORITE */}
            <section className="psec" id="sec-favorite">
              <div className="sec-hd"><h2>Favorite</h2><p>Produse salvate</p></div>
              <div className="wgrid" id="wish-grid">
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="es-icon"><svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>
                  <h3>Nu ai produse favorite</h3>
                  <p>Salvează produsele pe care ți le dorești.</p>
                </div>
              </div>
            </section>

            {/* SETARI */}
            <section className="psec" id="sec-setari">
              <div className="sec-hd"><h2>Setări</h2><p>Preferințe și notificări</p></div>
              <div className="pcard">
                <div className="pcard-lbl">Notificări email</div>
                <div className="tog-list">
                  <div className="tog-row"><div className="tinfo"><strong>Confirmare comenzi</strong><span>Email la fiecare comandă</span></div><label className="tog-sw"><input type="checkbox" defaultChecked /><span className="tsw-track"><span className="tsw-th"></span></span></label></div>
                  <div className="tog-row"><div className="tinfo"><strong>Status livrare</strong><span>Actualizări despre colet</span></div><label className="tog-sw"><input type="checkbox" defaultChecked /><span className="tsw-track"><span className="tsw-th"></span></span></label></div>
                  <div className="tog-row"><div className="tinfo"><strong>Oferte & Promoții</strong><span>Cele mai bune deals</span></div><label className="tog-sw"><input type="checkbox" /><span className="tsw-track"><span className="tsw-th"></span></span></label></div>
                  <div className="tog-row"><div className="tinfo"><strong>Newsletter</strong><span>Noutăți săptămânale</span></div><label className="tog-sw"><input type="checkbox" /><span className="tsw-track"><span className="tsw-th"></span></span></label></div>
                </div>
              </div>
              <div className="pcard mt20 danger-card">
                <div className="pcard-lbl danger-lbl">Zonă de pericol</div>
                <div className="danger-row"><div className="tinfo"><strong>Șterge contul</strong><span>Acțiune ireversibilă. Toate datele vor fi șterse.</span></div><button className="pbtn-danger">Șterge contul</button></div>
              </div>
            </section>
          </div>
        </div>

        {/* MOBILE NAV */}
        <div className="mob-nav" id="mob-nav">
          <button className="mn-item active" data-section="profil"><svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><span>Profil</span></button>
          <button className="mn-item" data-section="comenzi"><svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="2" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg><span>Comenzi</span></button>
          <button className="mn-item" data-section="adrese"><svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>Adrese</span></button>
          <button className="mn-item" data-section="favorite"><svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="2" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span>Favorite</span></button>
          <button className="mn-item" data-section="setari"><svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg><span>Setări</span></button>
        </div>
      </main>

      {/* MODAL ADRESE */}
      <div className="pmodal-bg" id="addr-modal">
        <div className="pmodal">
          <div className="pmodal-hd"><h3 id="addr-modal-title">Adresă nouă</h3><button className="pmodal-x" id="close-addr-modal"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>
          <div className="pmodal-bd">
            <div className="pgrid">
              <div className="pf"><label>Prenume</label><input type="text" className="pi" id="am-fname" placeholder="Prenume" /></div>
              <div className="pf"><label>Nume</label><input type="text" className="pi" id="am-lname" placeholder="Nume" /></div>
              <div className="pf full"><label>Stradă și număr</label><input type="text" className="pi" id="am-street" placeholder="Str. Exemplu nr. 1, ap. 2" /></div>
              <div className="pf"><label>Oraș</label><input type="text" className="pi" id="am-city" placeholder="București" /></div>
              <div className="pf"><label>Cod poștal</label><input type="text" className="pi" id="am-zip" placeholder="000000" /></div>
              <div className="pf full"><label>Telefon</label><input type="tel" className="pi" id="am-phone" placeholder="+40 7xx xxx xxx" /></div>
            </div>
          </div>
          <div className="pmodal-ft"><button className="pbtn-g" id="cancel-addr">Anulează</button><button className="pbtn-p" id="save-addr">Salvează adresa</button></div>
        </div>
      </div>

      {/* TOAST */}
      <div className="p-toast" id="p-toast"><div className="p-toast-ic" id="p-toast-ic"></div><span id="p-toast-msg"></span></div>
    </>
  );
}