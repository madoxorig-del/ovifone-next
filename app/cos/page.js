'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Cos() {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // ── TOAST ──
    function showNotification(message, isError = true) {
      const existing = document.getElementById('ovifone-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'ovifone-toast';
      toast.style.cssText = `position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(150px);background-color:${isError ? '#fee2e2' : '#2b2b2b'};color:${isError ? '#dc2626' : '#fff'};padding:14px 24px;border-radius:12px;box-shadow:0 15px 35px rgba(0,0,0,0.15);font-weight:600;font-size:14px;z-index:99999;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);display:flex;align-items:center;gap:12px;`;
      const icon = isError
        ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      toast.innerHTML = `${icon} <span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
      setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(150px)'; setTimeout(() => toast.remove(), 400); }, 3500);
    }

    const elements = {
      container: document.getElementById('cart-items-wrapper'),
      emptyState: document.getElementById('empty-cart-state'),
      gridLayout: document.getElementById('cart-grid-layout'),
      subtotalText: document.getElementById('summary-subtotal'),
      totalText: document.getElementById('summary-total'),
      badgesArray: document.querySelectorAll('.cart-badge'),
    };

    // ── CART MANAGER ──
    const CartManager = {
      init() {
        this.syncCartBadge();
        if (elements.container) this.buildCartUI();
        window.addEventListener('cartUpdated', () => { this.syncCartBadge(); if (elements.container) this.buildCartUI(); });
        window.addEventListener('storage', () => { this.syncCartBadge(); if (elements.container) this.buildCartUI(); });
      },

      fetchCartFromStorage() {
        const raw = localStorage.getItem('ovifone_cart');
        if (raw) { try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed; } catch (e) {} }
        return [];
      },

      saveCartToStorage(newData) {
        localStorage.setItem('ovifone_cart', JSON.stringify(newData));
        window.dispatchEvent(new Event('cartUpdated'));
      },

      syncCartBadge() {
        const cart = this.fetchCartFromStorage();
        let total = 0; cart.forEach(i => { total += i.qty; });
        elements.badgesArray.forEach(b => {
          b.textContent = total.toString();
          if (total > 0) { b.style.display = 'flex'; b.classList.remove('badge-bump'); void b.offsetWidth; b.classList.add('badge-bump'); }
          else b.style.display = 'none';
        });
      },

      buildCartUI() {
        const cartItems = this.fetchCartFromStorage();
        if (cartItems.length === 0) {
          if (elements.gridLayout) elements.gridLayout.style.display = 'none';
          if (elements.emptyState) elements.emptyState.style.display = 'flex';
          const crossSell = document.getElementById('cross-sell-container');
          if (crossSell) crossSell.style.display = 'none';
          return;
        }

        if (elements.gridLayout) elements.gridLayout.style.display = 'grid';
        if (elements.emptyState) elements.emptyState.style.display = 'none';
        if (elements.container) elements.container.innerHTML = '';

        let runningTotal = 0;

        cartItems.forEach((item, i) => {
          const itemTotal = item.price * item.qty;
          runningTotal += itemTotal;

          const div = document.createElement('div');
          div.className = 'cart-item';
          div.innerHTML = `
            <div class="ci-img-wrapper"><img src="${item.img}" alt="${item.title}"></div>
            <div class="ci-details">
              <h3 class="ci-title">${item.title}</h3>
              <span class="ci-variant">${item.variant}</span>
            </div>
            <div class="ci-qty-selector">
              <button class="ci-qty-btn minus" data-target-index="${i}">-</button>
              <input type="text" value="${item.qty}" class="ci-qty-input" readOnly>
              <button class="ci-qty-btn plus" data-target-index="${i}">+</button>
            </div>
            <div class="ci-price-display">${itemTotal.toLocaleString('ro-RO')},00 lei</div>
            <button class="ci-remove-btn" data-target-index="${i}">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          `;
          elements.container.appendChild(div);
        });

        if (elements.subtotalText) elements.subtotalText.textContent = runningTotal.toLocaleString('ro-RO') + ',00 lei';
        const shippingFee = runningTotal >= 300 ? 0 : 30;
        const coletFee = 30;
        const totalCuLivrare = runningTotal > 0 ? runningTotal + shippingFee + coletFee : 0;
        if (elements.totalText) elements.totalText.textContent = totalCuLivrare.toLocaleString('ro-RO') + ',00 lei';
        const shippingLabel = document.getElementById('shipping-cost');
        if (shippingLabel) shippingLabel.textContent = shippingFee === 0 ? 'Gratuit' : '30 lei';

        [elements.subtotalText, elements.totalText].forEach(el => {
          if (el) { el.classList.remove('total-updated'); void el.offsetWidth; el.classList.add('total-updated'); }
        });

        // Qty buttons
        document.querySelectorAll('.ci-qty-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const curBtn = e.currentTarget;
            curBtn.style.opacity = '0.5'; curBtn.style.pointerEvents = 'none';
            try {
              const idx = parseInt(curBtn.getAttribute('data-target-index'));
              const cart = this.fetchCartFromStorage();
              const item = cart[idx];
              if (!item) return;
              if (curBtn.classList.contains('plus')) {
                const { data: prod } = await supabase.from('produse').select('stoc').eq('nume', item.title).single();
                const stocMax = prod?.stoc || 99;
                if (item.qty + 1 > stocMax) { showNotification(`Stoc maxim: ${stocMax} bucăți.`, true); return; }
                item.qty++;
              } else {
                if (item.qty > 1) item.qty--;
                else { cart.splice(idx, 1); this.saveCartToStorage(cart); return; }
              }
              this.saveCartToStorage(cart);
            } catch (err) { console.error(err); }
            finally { curBtn.style.opacity = '1'; curBtn.style.pointerEvents = 'auto'; }
          });
        });

        // Remove buttons
        document.querySelectorAll('.ci-remove-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-target-index'));
            const cart = this.fetchCartFromStorage();
            const cardEl = e.currentTarget.closest('.cart-item');
            if (cardEl) {
              cardEl.style.transition = 'all 0.38s cubic-bezier(0.4,0,0.2,1)';
              cardEl.style.opacity = '0'; cardEl.style.transform = 'translateX(60px) scale(0.95)';
              cardEl.style.maxHeight = cardEl.offsetHeight + 'px';
              setTimeout(() => { cardEl.style.maxHeight = '0'; cardEl.style.marginBottom = '0'; cardEl.style.paddingTop = '0'; cardEl.style.paddingBottom = '0'; }, 200);
              setTimeout(() => { cart.splice(idx, 1); this.saveCartToStorage(cart); }, 420);
            } else {
              cart.splice(idx, 1); this.saveCartToStorage(cart);
            }
          });
        });
      }
    };

    // ── CROSS SELL ──
    const CrossSellManager = {
      produse: [],
      async init() {
        try {
          const { data, error } = await supabase.from('produse').select('*').gt('stoc', 0);
          if (error) throw error;
          this.produse = data || [];
          this.renderRecommendations();
          window.addEventListener('cartUpdated', () => this.renderRecommendations());
        } catch (e) { console.error('Eroare cross-sell:', e); }
      },

      renderRecommendations() {
        const grid = document.getElementById('dynamic-cross-sell-grid');
        const container = document.getElementById('cross-sell-container');
        if (!grid || !container) return;

        const cart = CartManager.fetchCartFromStorage();
        if (cart.length === 0) { container.style.display = 'none'; return; }

        const cartTitles = cart.map(i => i.title);
        let cartCategories = [];
        cartTitles.forEach(title => {
          const p = this.produse.find(pr => pr.nume === title);
          if (p?.categorie) cartCategories.push(p.categorie.toLowerCase());
        });
        if (cartCategories.includes('telefoane') || cartCategories.includes('tablete')) cartCategories.push('telefoane', 'tablete');
        if (cartCategories.includes('huse') || cartCategories.includes('folii')) cartCategories.push('huse', 'folii');

        let available = this.produse.filter(p => {
          const cat = (p.categorie || '').toLowerCase();
          return !cartTitles.includes(p.nume) && !cartCategories.includes(cat);
        }).slice(0, 4);

        if (available.length === 0) { container.style.display = 'none'; return; }
        container.style.display = 'block';

        grid.innerHTML = available.map(prod => {
          const cat = (prod.categorie || '').toLowerCase();
          let variant = 'Standard';
          if (cat === 'telefoane' || cat === 'tablete') variant = `${prod.stocare ? prod.stocare.split(',')[0].trim() : '128GB'} • Bat: ${prod.baterie || '100%'}`;
          else if (cat === 'casti') variant = prod.conectivitate || 'Audio';
          else if (cat === 'huse' || cat === 'folii') variant = prod.material || 'Protecție';
          else if (cat === 'accesorii') variant = prod.conector || 'Accesoriu';
          if (prod.culori) variant += ` • ${prod.culori.split(',')[0].trim()}`;

          return `
            <div class="recommendation-card">
              <div class="rec-img"><img src="${prod.imagine_url}" alt="${prod.nume}"></div>
              <h4 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;display:block;" title="${prod.nume}">${prod.nume}</h4>
              <span class="rec-price">${prod.pret} lei</span>
              <button class="btn-add-rec" data-nume="${prod.nume}" data-pret="${prod.pret}" data-img="${prod.imagine_url}" data-variant="${variant}" data-stoc="${prod.stoc}">Adaugă</button>
            </div>`;
        }).join('');

        grid.querySelectorAll('.btn-add-rec').forEach(btn => {
          btn.addEventListener('click', () => {
            const title = btn.getAttribute('data-nume'), price = parseInt(btn.getAttribute('data-pret'));
            const variant = btn.getAttribute('data-variant'), img = btn.getAttribute('data-img');
            const stocMax = parseInt(btn.getAttribute('data-stoc'));
            let cart = CartManager.fetchCartFromStorage();
            let existing = cart.find(i => i.title === title && i.variant === variant);
            if ((existing ? existing.qty : 0) + 1 > stocMax) { showNotification(`Stoc maxim: ${stocMax} bucăți.`, true); return; }
            if (existing) existing.qty++;
            else cart.push({ title, price, variant, img, qty: 1 });
            CartManager.saveCartToStorage(cart);
            showNotification(`Adăugat în coș: ${title}`, false);
            btn.textContent = 'Adăugat!'; btn.style.background = '#10b981'; btn.style.color = 'white';
          });
        });
      }
    };

    CartManager.init();
    CrossSellManager.init();
  }, []);

  return (
    <main className="main-content cart-page-main">
      <div className="cart-container-main">
        <h1 className="cart-page-title">Coșul tău de cumpărături</h1>

        {/* EMPTY STATE */}
        <div className="empty-cart-state" id="empty-cart-state">
          <div className="empty-icon-wrapper">
            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <h2>Coșul tău este gol momentan</h2>
          <p>Pare că nu ai adăugat încă niciun dispozitiv premium în coș. Explorează gama noastră de telefoane și accesorii.</p>
          <div className="empty-actions">
            <Link href="/" className="btn-outline-premium">Pagina Principală</Link>
          </div>
        </div>

        {/* CART GRID */}
        <div className="cart-grid-layout" id="cart-grid-layout">
          <div className="cart-items-column">
            <div className="cart-items-header">
              <span className="h-prod">Detalii Produs</span>
              <span className="h-qty">Cantitate</span>
              <span className="h-total">Subtotal</span>
            </div>
            <div className="cart-items-wrapper" id="cart-items-wrapper"></div>

            <div className="cart-extra-info">
              <div className="extra-card">
                <div className="extra-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                <div className="extra-text"><strong>Livrare 24-72h</strong><p>Toate comenzile sunt procesate și livrate în siguranță maximă.</p></div>
              </div>
              <div className="extra-card">
                <div className="extra-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                <div className="extra-text"><strong>Garanție extinsă</strong><p>Fiecare dispozitiv achiziționat beneficiază de garanție și suport tehnic dedicat.</p></div>
              </div>
            </div>
          </div>

          <div className="cart-summary-column">
            <div className="summary-card-premium">
              <h2 className="summary-card-title">Sumar Comandă</h2>
              <div className="summary-details">
                <div className="summary-row-item">
                  <span className="row-label">Valoare produse</span>
                  <span className="row-value" id="summary-subtotal">0,00 lei</span>
                </div>
                <div className="summary-row-item">
                  <span className="row-label">Livrare</span>
                  <span className="row-value" id="shipping-cost" style={{ color: '#10b981', fontWeight: 700 }}>30 lei</span>
                </div>
                <div className="summary-row-item">
                  <span className="row-label">Deschidere colet</span>
                  <span className="row-value">+30 lei</span>
                </div>
                <div className="summary-separator"></div>
                <div className="summary-row-item total-final">
                  <span className="row-label">Total de plată</span>
                  <span className="row-value" id="summary-total">0,00 lei</span>
                </div>
                <Link href="/checkout" className="btn-checkout-final" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Finalizează Comanda
                </Link>
                <p className="secure-notice">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Checkout securizat SSL pe 256-biți
                </p>
                <div className="payment-badges-row">
                  <img src="/img/Visa.png" alt="Visa" width="40" />
                  <img src="/img/mastercard.png" alt="Mastercard" width="40" />
                  <img src="/img/Appel-logo.png" alt="Apple Pay" width="50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CROSS SELL */}
        <section className="cross-sell-section" id="cross-sell-container" style={{ display: 'none' }}>
          <h3 className="cross-sell-title">Completați experiența</h3>
          <div className="cross-sell-grid" id="dynamic-cross-sell-grid"></div>
        </section>

      </div>
    </main>
  );
}