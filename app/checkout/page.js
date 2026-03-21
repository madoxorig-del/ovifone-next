'use client';
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Verificam daca e plata anulata
    const plataParam = searchParams.get('plata');
    const orderIdParam = searchParams.get('order_id');
    if (plataParam === 'anulata' && orderIdParam) {
      supabase.from('comenzi').update({ status: 'Anulata' }).eq('id', orderIdParam).then(() => {
        const cancelModal = document.getElementById('cancel-modal');
        if (cancelModal) {
          cancelModal.classList.add('active');
          document.getElementById('btn-close-cancel')?.addEventListener('click', () => cancelModal.classList.remove('active'));
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    const DOM = {
      form: document.getElementById('checkout-form'),
      productsList: document.getElementById('cart-products-list'),
      summSubtotal: document.getElementById('summ-subtotal'),
      summShipping: document.getElementById('summ-shipping'),
      summTotal: document.getElementById('summ-total'),
      btnTotal: document.getElementById('btn-total-price'),
      submitBtn: document.getElementById('main-submit-btn'),
      successModal: document.getElementById('success-modal'),
      toastContainer: document.getElementById('toast-container'),
      addressWrapper: document.getElementById('address-fields-wrapper'),
      inputs: {
        nume: document.getElementById('nume_complet'),
        telefon: document.getElementById('telefon'),
        email: document.getElementById('email'),
        tara: document.getElementById('tara'),
        judet: document.getElementById('judet'),
        localitate: document.getElementById('localitate'),
        adresa: document.getElementById('adresa'),
      },
      deliveryRadios: document.querySelectorAll('.delivery-card'),
      paymentRadios: document.querySelectorAll('.payment-card'),
      promoInput: document.getElementById('promo-input'),
      applyPromoBtn: document.getElementById('apply-promo-btn'),
      promoWrap: document.getElementById('promo-wrap'),
      promoMessage: document.getElementById('promo-message'),
      discountRow: document.getElementById('discount-row'),
      summDiscount: document.getElementById('summ-discount'),
    };

    const CODURI_VALIDE = {
      'OVI10': { type: 'percent', val: 10 },
      'REDUCERE50': { type: 'fixed', val: 50 },
    };

    const state = {
      cart: JSON.parse(localStorage.getItem('ovifone_cart') || '[]'),
      subtotal: 0, shipping: 30, coletFee: 30, discount: 0, total: 0,
      isSubmitting: false, deliveryType: 'curier', currentUser: null,
    };

    async function init() {
      if (state.cart.length === 0) { router.push('/'); return; }
      renderCart();
      bindEvents();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { state.currentUser = session.user; autoFillUserData(session.user); }
    }

    function autoFillUserData(user) {
      const meta = user.user_metadata || {};
      if (meta.full_name && DOM.inputs.nume) DOM.inputs.nume.value = meta.full_name;
      if (user.email && DOM.inputs.email) DOM.inputs.email.value = user.email;
      if (meta.phone && DOM.inputs.telefon) DOM.inputs.telefon.value = meta.phone;
      if (meta.tara && DOM.inputs.tara) DOM.inputs.tara.value = meta.tara;
      if (meta.judet && DOM.inputs.judet) DOM.inputs.judet.value = meta.judet;
      if (meta.localitate && DOM.inputs.localitate) DOM.inputs.localitate.value = meta.localitate;
      if (meta.adresa && DOM.inputs.adresa) DOM.inputs.adresa.value = meta.adresa;
      handleCountryChange();
    }

    function renderCart() {
      if (!DOM.productsList) return;
      DOM.productsList.innerHTML = '';
      state.subtotal = 0;
      state.cart.forEach(item => {
        state.subtotal += item.price * item.qty;
        const el = document.createElement('div');
        el.className = 'prod-item';
        el.innerHTML = `
          <div class="prod-img-box"><img src="${item.img}" alt="Product"><div class="prod-qty">${item.qty}</div></div>
          <div class="prod-details"><div class="prod-title">${item.title}</div><div class="prod-var">${item.variant || ''}</div></div>
          <div class="prod-price">${item.price * item.qty} lei</div>`;
        DOM.productsList.appendChild(el);
      });
      updateTotalsDOM();
    }

    function updateTotalsDOM() {
      if (state.discount > state.subtotal) state.discount = state.subtotal;
      state.shipping = state.subtotal >= 300 ? 0 : (state.deliveryType === 'magazin' ? 0 : (DOM.inputs.tara?.value === 'România' || !DOM.inputs.tara?.value ? 30 : 90));
      state.total = state.subtotal + state.shipping + state.coletFee - state.discount;
      if (DOM.summSubtotal) DOM.summSubtotal.textContent = `${state.subtotal} lei`;
      if (DOM.summShipping) DOM.summShipping.textContent = state.shipping === 0 ? 'Gratuit' : `${state.shipping} lei`;
      if (state.discount > 0) {
        if (DOM.discountRow) DOM.discountRow.style.display = 'flex';
        if (DOM.summDiscount) DOM.summDiscount.textContent = `-${state.discount} lei`;
      } else {
        if (DOM.discountRow) DOM.discountRow.style.display = 'none';
      }
      if (DOM.summTotal) DOM.summTotal.textContent = `${state.total} lei`;
      if (DOM.btnTotal) DOM.btnTotal.textContent = `${state.total} lei`;
    }

    function handleCountryChange() {
      if (state.deliveryType === 'magazin') return;
      updateTotalsDOM();
    }

    function arataMesajPromo(text, type) {
      if (!DOM.promoMessage) return;
      DOM.promoMessage.textContent = text;
      DOM.promoMessage.style.display = 'block';
      DOM.promoMessage.style.color = type === 'error' ? '#ef4444' : '#10b981';
    }

    function validateField(input) {
      if (!input.required && input.value.trim() === '') { removeError(input); return true; }
      let isValid = true;
      const val = input.value.trim();
      if (val === '') isValid = false;
      else if (input.id === 'email') isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      else if (input.id === 'telefon') isValid = /^[0-9+ ]{10,15}$/.test(val);
      if (!isValid) input.parentElement.classList.add('error');
      else removeError(input);
      return isValid;
    }

    function removeError(input) { input.parentElement.classList.remove('error'); }

    function showToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>${msg}</span>`;
      DOM.toastContainer?.appendChild(toast);
      setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, 4000);
    }

    function setLoadingState(isLoading) {
      state.isSubmitting = isLoading;
      if (isLoading) { DOM.submitBtn?.classList.add('loading'); if (DOM.submitBtn) DOM.submitBtn.disabled = true; Object.values(DOM.inputs).forEach(i => { if (i) i.disabled = true; }); }
      else { DOM.submitBtn?.classList.remove('loading'); if (DOM.submitBtn) DOM.submitBtn.disabled = false; Object.values(DOM.inputs).forEach(i => { if (i) i.disabled = false; }); }
    }

    function handleSuccess() {
      localStorage.removeItem('ovifone_cart');
      window.dispatchEvent(new Event('cartUpdated'));
      const modal = document.getElementById('success-modal');
      if (modal) modal.classList.add('active');
      setTimeout(() => router.push('/'), 3500);
    }

    async function handleFormSubmit(e) {
      e.preventDefault();
      if (state.isSubmitting) return;
      let formValid = true;
      Object.values(DOM.inputs).forEach(input => { if (input && !validateField(input)) formValid = false; });
      if (!formValid) {
        showToast('Te rugăm să corectezi câmpurile marcate cu roșu.');
        document.querySelector('.input-wrapper.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'ramburs';
      setLoadingState(true);

      let finalTara = DOM.inputs.tara?.value || 'România';
      let finalJudet = DOM.inputs.judet?.value.trim() || '';
      let finalLocalitate = DOM.inputs.localitate?.value.trim() || '';
      let finalAdresa = DOM.inputs.adresa?.value.trim() || '';

      if (state.deliveryType === 'magazin') { finalTara = 'România'; finalJudet = 'Magazin'; finalLocalitate = 'Magazin'; finalAdresa = 'Ridicare personală din magazin'; }

      const orderData = {
        user_id: state.currentUser?.id || null,
        nume_complet: DOM.inputs.nume?.value.trim() || '',
        telefon: DOM.inputs.telefon?.value.trim() || '',
        email: DOM.inputs.email?.value.trim() || '',
        tara: finalTara, judet: finalJudet, localitate: finalLocalitate, adresa: finalAdresa,
        metoda_plata: paymentMethod, total: state.total,
        detalii_cos: state.cart,
        status: paymentMethod === 'card' ? 'In asteptare (Neplatita)' : 'Noua',
      };

      try {
        if (state.currentUser && state.deliveryType !== 'magazin') {
          await supabase.auth.updateUser({ data: { phone: DOM.inputs.telefon?.value.trim(), tara: finalTara, judet: finalJudet, localitate: finalLocalitate, adresa: finalAdresa } });
        }
        const { data, error } = await supabase.from('comenzi').insert([orderData]).select();
        if (error) { showToast('Eroare: ' + error.message); setLoadingState(false); return; }
        const comandaPlasata = data[0];
        if (paymentMethod === 'card') { router.push(`/plata?order_id=${comandaPlasata.id}`); }
        else { handleSuccess(); }
      } catch (err) {
        console.error(err); showToast('A apărut o problemă. Te rugăm să reîncerci.'); setLoadingState(false);
      }
    }

    function bindEvents() {
      DOM.inputs.tara?.addEventListener('change', handleCountryChange);

      DOM.deliveryRadios.forEach(card => {
        card.addEventListener('click', () => {
          DOM.deliveryRadios.forEach(c => c.classList.remove('active')); card.classList.add('active');
          const input = card.querySelector('input'); input.checked = true; state.deliveryType = input.value;
          if (state.deliveryType === 'magazin') {
            state.shipping = 0; DOM.addressWrapper?.classList.add('hidden');
            ['tara', 'judet', 'localitate', 'adresa'].forEach(k => { if (DOM.inputs[k]) DOM.inputs[k].required = false; });
          } else {
            DOM.addressWrapper?.classList.remove('hidden');
            ['tara', 'judet', 'localitate', 'adresa'].forEach(k => { if (DOM.inputs[k]) DOM.inputs[k].required = true; });
            handleCountryChange();
          }
          updateTotalsDOM();
        });
      });

      DOM.paymentRadios.forEach(card => {
        if (card.classList.contains('disabled')) return;
        card.addEventListener('click', () => { DOM.paymentRadios.forEach(c => c.classList.remove('active')); card.classList.add('active'); card.querySelector('input').checked = true; });
      });

      Object.values(DOM.inputs).forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => removeError(input));
        input.addEventListener('blur', () => validateField(input));
      });

      DOM.form?.addEventListener('submit', handleFormSubmit);

      DOM.applyPromoBtn?.addEventListener('click', () => {
        const code = DOM.promoInput?.value.trim().toUpperCase() || '';
        if (code === '') { if (DOM.promoWrap) DOM.promoWrap.style.borderColor = '#ef4444'; arataMesajPromo('Te rugăm să introduci un cod.', 'error'); return; }
        if (CODURI_VALIDE[code]) {
          if (DOM.promoInput) { DOM.promoInput.disabled = true; DOM.promoInput.style.color = '#10b981'; }
          if (DOM.promoWrap) DOM.promoWrap.style.borderColor = '#10b981';
          if (DOM.applyPromoBtn) { DOM.applyPromoBtn.textContent = 'Aplicat'; DOM.applyPromoBtn.style.background = '#10b981'; DOM.applyPromoBtn.disabled = true; }
          state.discount = CODURI_VALIDE[code].type === 'percent' ? Math.round((state.subtotal * CODURI_VALIDE[code].val) / 100) : CODURI_VALIDE[code].val;
          updateTotalsDOM(); arataMesajPromo(`Cod aplicat! Ai economisit ${state.discount} lei.`, 'success');
        } else {
          if (DOM.promoInput) DOM.promoInput.value = '';
          if (DOM.promoWrap) DOM.promoWrap.style.borderColor = '#ef4444';
          arataMesajPromo('Acest cod nu există sau a expirat.', 'error');
          setTimeout(() => { if (!DOM.promoInput?.disabled) { if (DOM.promoWrap) DOM.promoWrap.style.borderColor = 'var(--border-soft)'; if (DOM.promoMessage) DOM.promoMessage.style.display = 'none'; } }, 3500);
        }
      });
    }

    init();
  }, []);

  return (
    <>
      <div className="checkout-ambient-bg">
        <div className="ambient-blob blob-1"></div>
        <div className="ambient-blob blob-2"></div>
      </div>

      <main className="checkout-main">
        <div className="checkout-glass-container">

          <div className="checkout-form-area">
            {/* PROGRESS */}
            <div className="step-progress-wrapper">
              <div className="progress-bar-bg"><div className="progress-bar-fill"></div></div>
              <div className="steps-nodes">
                <div className="step-node completed">
                  <div className="node-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  <span className="node-label">Coș</span>
                </div>
                <div className="step-node active">
                  <div className="node-circle">2</div>
                  <span className="node-label">Livrare</span>
                </div>
                <div className="step-node">
                  <div className="node-circle">3</div>
                  <span className="node-label">Plată</span>
                </div>
              </div>
            </div>

            <div className="header-titles">
              <h1>Finalizare comandă</h1>
              <p>Securizat prin criptare SSL pe 256-biți</p>
            </div>

            <form id="checkout-form" noValidate>

              {/* DATE CONTACT */}
              <div className="premium-form-section">
                <div className="section-glow"></div>
                <div className="section-header">
                  <div className="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                  <h2>Date Contact</h2>
                </div>
                <div className="input-grid">
                  <div className="input-wrapper full-width">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input type="text" id="nume_complet" className="float-input" placeholder=" " required autoComplete="name" />
                    <label className="float-label">Nume și Prenume</label>
                    <span className="error-msg">Numele este obligatoriu</span>
                  </div>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <input type="tel" id="telefon" className="float-input" placeholder=" " required autoComplete="tel" />
                    <label className="float-label">Număr telefon</label>
                    <span className="error-msg">Număr invalid</span>
                  </div>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input type="email" id="email" className="float-input" placeholder=" " required autoComplete="email" />
                    <label className="float-label">Adresă Email</label>
                    <span className="error-msg">Email invalid</span>
                  </div>
                </div>
              </div>

              {/* LIVRARE */}
              <div className="premium-form-section">
                <div className="section-glow"></div>
                <div className="section-header">
                  <div className="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
                  <h2>Metodă Livrare</h2>
                </div>
                <div className="method-group">
                  <label className="method-card delivery-card active">
                    <input type="radio" name="delivery_method" value="curier" defaultChecked />
                    <div className="method-content">
                      <div className="radio-btn"></div>
                      <div className="method-details"><span className="method-title">Livrare prin curier</span><span className="method-desc">Livrare rapidă la domiciliu</span></div>
                      <div className="method-visuals"><div className="icon-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div></div>
                    </div>
                    <div className="active-border"></div>
                  </label>
                  <label className="method-card delivery-card">
                    <input type="radio" name="delivery_method" value="magazin" />
                    <div className="method-content">
                      <div className="radio-btn"></div>
                      <div className="method-details"><span className="method-title">Ridicare din magazin</span><span className="method-desc">Gratuit - Ridici personal comanda din locația noastră</span></div>
                      <div className="method-visuals"><div className="icon-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div></div>
                    </div>
                    <div className="active-border"></div>
                  </label>
                </div>

                <div id="address-fields-wrapper" className="address-wrapper">
                  <div className="input-grid mt-4">
                    <div className="input-wrapper full-width">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                      <select id="tara" className="float-input" required style={{ paddingTop: '18px', appearance: 'none', cursor: 'pointer' }}>
                        <option value="România">România</option>
                        <option value="Germania">Germania</option>
                        <option value="Italia">Italia</option>
                        <option value="Spania">Spania</option>
                        <option value="Franța">Franța</option>
                        <option value="Marea Britanie">Marea Britanie</option>
                        <option value="Ungaria">Ungaria</option>
                        <option value="Austria">Austria</option>
                      </select>
                      <label className="float-label" style={{ transform: 'translateY(-10px) scale(0.75)', fontWeight: 700, color: 'var(--accent)' }}>Țară Livrare</label>
                    </div>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                      <input type="text" id="judet" className="float-input" placeholder=" " required />
                      <label className="float-label">Județ / Regiune</label>
                      <span className="error-msg">Câmp obligatoriu</span>
                    </div>
                    <div className="input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                      <input type="text" id="localitate" className="float-input" placeholder=" " required />
                      <label className="float-label">Oraș / Localitate</label>
                      <span className="error-msg">Câmp obligatoriu</span>
                    </div>
                    <div className="input-wrapper full-width">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <input type="text" id="adresa" className="float-input" placeholder=" " required />
                      <label className="float-label">Stradă, număr, bloc, scara, cod poștal</label>
                      <span className="error-msg">Adresa este obligatorie</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PLATA */}
              <div className="premium-form-section">
                <div className="section-glow"></div>
                <div className="section-header">
                  <div className="icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></div>
                  <h2>Metodă Plată</h2>
                </div>
                <div className="method-group">
                  <label className="method-card payment-card active">
                    <input type="radio" name="payment_method" value="ramburs" defaultChecked />
                    <div className="method-content">
                      <div className="radio-btn"></div>
                      <div className="method-details"><span className="method-title">La livrare / Ridicare</span><span className="method-desc">Plătești cash sau cu cardul la primirea comenzii</span></div>
                      <div className="method-visuals"><div className="icon-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg></div></div>
                    </div>
                    <div className="active-border"></div>
                  </label>
                  <label className="method-card payment-card">
                    <input type="radio" name="payment_method" value="card" />
                    <div className="method-content">
                      <div className="radio-btn"></div>
                      <div className="method-details"><span className="method-title">Card Online</span><span className="method-desc">Plată securizată 100% cu cardul bancar</span></div>
                      <div className="method-visuals"><div className="icon-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></div></div>
                    </div>
                    <div className="active-border"></div>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* SIDEBAR */}
          <aside className="checkout-sidebar">
            <div className="summary-wrapper">
              <div className="summary-backdrop"></div>
              <div className="summary-content">
                <h2>Sumar comandă</h2>
                <div className="products-container" id="cart-products-list"></div>
                <div className="promo-code-box">
                  <div className="promo-input-wrap" id="promo-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    <input type="text" id="promo-input" placeholder="Cod reducere" style={{ textTransform: 'uppercase' }} />
                    <button type="button" id="apply-promo-btn">Aplică</button>
                  </div>
                  <div id="promo-message" style={{ fontSize: '13px', marginTop: '8px', fontWeight: 600, display: 'none', paddingLeft: '10px' }}></div>
                </div>
                <div className="summary-calculations">
                  <div className="calc-row"><span>Subtotal Produse</span><span id="summ-subtotal">0 lei</span></div>
                  <div className="calc-row"><span>Livrare</span><span id="summ-shipping">30 lei</span></div>
                  <div className="calc-row"><span>Deschidere colet</span><span>+30 lei</span></div>
                  <div className="calc-row discount-row" id="discount-row" style={{ display: 'none', color: '#10b981', fontWeight: 700 }}>
                    <span>Reducere Cod</span><span id="summ-discount">-0 lei</span>
                  </div>
                  <div className="calc-row divider"></div>
                  <div className="calc-row total-row"><span>Total</span><span id="summ-total">0 lei</span></div>
                </div>
                <button type="submit" form="checkout-form" id="main-submit-btn" className="cta-button-ultra">
                  <div className="btn-glow"></div>
                  <span className="btn-text">Confirmă Comanda</span>
                  <span className="btn-price" id="btn-total-price">0 lei</span>
                  <div className="loader-ring"></div>
                </button>
                <div className="trust-indicators-mini">
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Date Criptate</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Suport 24/7</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* SUCCESS MODAL */}
      <div className="success-modal" id="success-modal">
        <div className="modal-content">
          <div className="success-bg-glow"></div>
          <div className="check-animation">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h2>Comandă Confirmată!</h2>
          <p>Îți mulțumim! Comanda ta a fost preluată și urmează să fie procesată. Vei fi redirecționat imediat.</p>
          <div className="redirect-loader">Se încarcă magazinul...</div>
        </div>
      </div>

      {/* TOAST */}
      <div className="toast-container" id="toast-container"></div>

      {/* CANCEL MODAL */}
      <div className="cancel-modal" id="cancel-modal">
        <div className="modal-content">
          <div className="cancel-bg-glow"></div>
          <div className="error-animation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2>Plată Anulată</h2>
          <p>Procesul de plată a fost întrerupt, iar comanda ta nu a fost finalizată. Te rugăm să reîncerci.</p>
          <button id="btn-close-cancel" className="close-modal-btn">Am înțeles</button>
        </div>
      </div>
    </>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,.15)" strokeWidth="3"/>
          <path d="M12 3a9 9 0 0 1 9 9" stroke="#f49201" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}