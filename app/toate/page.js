'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Toate() {
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    function showNotification(message, isError = true) {
      const existing = document.getElementById('ovifone-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'ovifone-toast';
      toast.style.cssText = `position:fixed;bottom:40px;left:50%;transform:translateX(-50%) translateY(150px);background-color:${isError ? '#fee2e2' : '#2b2b2b'};color:${isError ? '#dc2626' : '#fff'};padding:14px 28px;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,0.15);font-weight:700;font-size:14px;z-index:100000;transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1);display:flex;align-items:center;gap:12px;backdrop-filter:blur(8px);`;
      const icon = isError ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>` : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      toast.innerHTML = `${icon} <span>${message}</span>`;
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
      setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(150px)'; setTimeout(() => toast.remove(), 500); }, 3500);
    }

    // Link dinamic per categorie
    function getLinkForProduct(produs) {
      const cat = (produs.categorie || '').toLowerCase();
      const catMap = { 'telefoane': '/telefoane/produs', 'tablete': '/tablete/produs', 'casti': '/casti/produs', 'accesorii': '/accesorii/produs', 'huse': '/huse/produs', 'folii': '/folii/produs' };
      return `${catMap[cat] || '/telefoane/produs'}?id=${produs.id}`;
    }

    const DOM = {
      gridContainer: document.getElementById('product-grid'),
      filterCheckboxes: document.querySelectorAll('.shop-sidebar-ultra input[type="checkbox"]'),
      resultsCounterNode: document.querySelector('.results-counter-ultra strong'),
      activeTagsContainer: document.querySelector('.active-filters-tags'),
      mobileFilterTrigger: document.querySelector('.mobile-filter-trigger-ultra'),
      sidebarElement: document.querySelector('.shop-sidebar-ultra'),
      closeSidebarButton: document.querySelector('.close-filters-btn'),
      emptyStateMessage: document.getElementById('no-results'),
      resetBtn: document.getElementById('st-reset-btn'),
      pageTitle: document.querySelector('.page-title-ultra'),
    };

    if (DOM.resultsCounterNode) DOM.resultsCounterNode.textContent = '';

    const GlobalCartSync = {
      init() { this.updateBadge(); window.addEventListener('cartUpdated', () => this.updateBadge()); },
      updateBadge() {
        try {
          const total = JSON.parse(localStorage.getItem('ovifone_cart') || '[]').reduce((s, i) => s + i.qty, 0);
          document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = total; b.style.display = total > 0 ? 'flex' : 'none'; });
        } catch (e) {}
      }
    };

    const SidebarControl = {
      init() {
        DOM.mobileFilterTrigger?.addEventListener('click', () => { DOM.sidebarElement?.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
        DOM.closeSidebarButton?.addEventListener('click', () => { DOM.sidebarElement?.classList.remove('is-open'); document.body.style.overflow = ''; });
      }
    };

    const ProductEngine = {
      allProducts: [], currentPage: 1, itemsPerPage: 12, currentSort: 'popular',

      async init() {
        await this.fetchProducts();
        this.bindFilters(); this.bindSort();
        DOM.resetBtn?.addEventListener('click', () => this.clearAllActiveFilters());
      },

      async fetchProducts() {
        try {
          const { data: produse, error } = await supabase.from('produse').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (produse && produse.length > 0) { this.allProducts = produse; this.executeFilteringAndSorting(); }
          else { if (DOM.emptyStateMessage) { DOM.emptyStateMessage.style.display = 'flex'; DOM.emptyStateMessage.classList.remove('hidden'); } if (DOM.resultsCounterNode) DOM.resultsCounterNode.textContent = '0'; }
        } catch (err) { console.error('Eroare Supabase:', err); showNotification('Eroare la încărcarea produselor.', true); }
      },

      buildCard(produs) {
        const brandAttr = (produs.brand || '').toLowerCase();
        const categoryAttr = (produs.categorie || 'altele').toLowerCase();
        const conditionAttr = produs.stare || 'SH';
        const stocDisponibil = produs.stoc || 0;
        const linkProdus = getLinkForProduct(produs);

        // displayVariant dinamic per categorie
        let displayVariant = '';
        if (categoryAttr === 'telefoane' || categoryAttr === 'tablete') {
          const storageScurt = produs.stocare ? produs.stocare.split(',')[0].trim() : '128GB';
          let baterieText = produs.baterie ? produs.baterie.trim() : '100%';
          if (!baterieText.includes('%') && baterieText.match(/^[0-9]+$/)) baterieText += '%';
          displayVariant = `${storageScurt} • ${conditionAttr} • Bat: ${baterieText}`;
        } else {
          if (categoryAttr === 'casti') displayVariant = produs.conectivitate || 'Audio';
          else if (categoryAttr === 'huse' || categoryAttr === 'folii') displayVariant = produs.material || 'Protecție';
          else if (categoryAttr === 'accesorii') displayVariant = produs.tip_accesoriu ? produs.tip_accesoriu.replace('-', ' ') : 'Accesoriu';
          else displayVariant = categoryAttr;
        }

        const isOnSale = produs.pret_vechi && produs.pret_vechi > produs.pret;
        const reducere = isOnSale ? Math.round(produs.pret_vechi - produs.pret).toLocaleString('ro-RO') : 0;
        let badges = '';
        if (isOnSale) badges += `<span class="pc-badge pc-badge-sale">SALE</span><span class="pc-badge pc-badge-reducere">-${reducere} Lei</span>`;
        if (produs.buyback) badges += `<span class="pc-badge pc-badge-bb">BUYBACK</span>`;

        const inStoc = stocDisponibil > 0;
        const pretFormatat = produs.pret ? Number(produs.pret).toLocaleString('ro-RO') : '';
        const pretVechiFormatat = produs.pret_vechi ? Number(produs.pret_vechi).toLocaleString('ro-RO') : '';
        const brandDisplay = (produs.brand || '').toUpperCase();

        const card = document.createElement('div');
        card.className = 'dark-product-card product-item';
        card.setAttribute('data-brand', brandAttr);
        card.setAttribute('data-category', categoryAttr);
        card.setAttribute('data-condition', conditionAttr);
        card.setAttribute('data-price', produs.pret);
        card.setAttribute('data-stoc', stocDisponibil);
        card.setAttribute('data-date', new Date(produs.created_at).getTime());

        card.innerHTML = `
          <a href="${linkProdus}" class="pc-link-overlay" aria-label="${produs.nume}"></a>
          <div class="pc-badges">${badges}</div>
          <div class="pc-img-wrap">
            <img src="${produs.imagine_url}" alt="${produs.nume}" decoding="async" loading="lazy">
          </div>
          <div class="pc-body">
            <span class="pc-brand">${brandDisplay}</span>
            <h2 class="pc-name">${produs.nume}</h2>
            <p class="pc-meta">${displayVariant}</p>
            <div class="pc-stock ${inStoc ? 'pc-in-stock' : 'pc-out-stock'}">
              <span class="pc-stock-dot"></span>
              <span>${inStoc ? 'În stoc' : 'Stoc epuizat'}</span>
            </div>
            <div class="pc-footer">
              <div class="pc-prices">
                ${isOnSale ? `<span class="pc-price-old">${pretVechiFormatat} lei</span>` : ''}
                <span class="pc-price-new">${pretFormatat} lei</span>
                ${isOnSale ? `<span class="pc-discount">-${reducere} lei</span>` : ''}
              </div>
              <button class="pc-cart-btn ${!inStoc ? 'pc-cart-disabled' : ''}"
                data-nume="${produs.nume}"
                data-pret="${produs.pret}"
                data-img="${produs.imagine_url}"
                data-variant="${displayVariant}"
                data-stoc="${stocDisponibil}"
                ${!inStoc ? 'disabled' : ''}
                aria-label="Adaugă în coș">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              </button>
            </div>
          </div>`;
        return card;
      },

      getActiveFilters() {
        const filters = { category: [], brand: [] };
        DOM.filterCheckboxes.forEach(cb => {
          if (cb.checked) {
            const group = cb.closest('[data-filter-group]')?.getAttribute('data-filter-group');
            if (group && filters[group] !== undefined) filters[group].push(cb.value.toLowerCase());
          }
        });
        return filters;
      },

      applyFilters(products) {
        const f = this.getActiveFilters();
        return products.filter(p => {
          const brand = (p.brand || '').toLowerCase();
          const category = (p.categorie || '').toLowerCase();
          if (f.category.length && !f.category.includes(category)) return false;
          if (f.brand.length && !f.brand.includes(brand)) return false;
          return true;
        });
      },

      applySort(products) {
        const sorted = [...products];
        if (this.currentSort === 'price-asc') sorted.sort((a, b) => a.pret - b.pret);
        else if (this.currentSort === 'price-desc') sorted.sort((a, b) => b.pret - a.pret);
        else if (this.currentSort === 'newest') sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return sorted;
      },

      executeFilteringAndSorting() {
        this.currentPage = 1;
        this.renderPage(this.applySort(this.applyFilters(this.allProducts)));
        this.renderActiveTags();
      },

      renderPage(products) {
        const totalPages = Math.ceil(products.length / this.itemsPerPage);
        const pageItems = products.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        if (DOM.resultsCounterNode) DOM.resultsCounterNode.textContent = products.length;
        if (!DOM.gridContainer) return;
        DOM.gridContainer.innerHTML = '';
        if (pageItems.length === 0) {
          if (DOM.emptyStateMessage) { DOM.emptyStateMessage.style.display = 'flex'; DOM.emptyStateMessage.classList.remove('hidden'); }
        } else {
          if (DOM.emptyStateMessage) { DOM.emptyStateMessage.style.display = 'none'; DOM.emptyStateMessage.classList.add('hidden'); }
          pageItems.forEach((produs, i) => {
            const card = this.buildCard(produs);
            card.style.opacity = '0'; card.style.transform = 'translateY(24px)';
            DOM.gridContainer.appendChild(card);
            requestAnimationFrame(() => { requestAnimationFrame(() => { card.style.transition = `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms`; card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }); });
          });
          this.rebindAddToCartButtons();
        }
        this.renderPaginationUI(totalPages);
      },

      renderActiveTags() {
        if (!DOM.activeTagsContainer) return;
        DOM.activeTagsContainer.innerHTML = '';
        const f = this.getActiveFilters();
        const allActive = [...f.category, ...f.brand];
        if (allActive.length === 0) return;
        const isMobile = window.innerWidth <= 768;
        const maxVisible = isMobile ? 2 : allActive.length;
        allActive.slice(0, maxVisible).forEach(val => {
          const tag = document.createElement('div'); tag.className = 'filter-tag';
          tag.innerHTML = `<span>${val}</span><button class="remove-tag"><svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
          tag.querySelector('.remove-tag').addEventListener('click', () => { DOM.filterCheckboxes.forEach(cb => { if (cb.value.toLowerCase() === val) cb.checked = false; }); this.executeFilteringAndSorting(); });
          DOM.activeTagsContainer.appendChild(tag);
        });
        const hidden = allActive.slice(maxVisible);
        if (hidden.length > 0) {
          const moreBtn = document.createElement('div'); moreBtn.className = 'filter-tag';
          moreBtn.style.cssText = 'background:linear-gradient(135deg,#f49201,#c97a00);cursor:pointer;';
          moreBtn.innerHTML = `<span>+${hidden.length} mai multe</span>`;
          moreBtn.addEventListener('click', () => { DOM.mobileFilterTrigger?.click(); });
          DOM.activeTagsContainer.appendChild(moreBtn);
        }
        const clearBtn = document.createElement('button'); clearBtn.className = 'clear-all-tags';
        clearBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Șterge toate`;
        clearBtn.addEventListener('click', () => this.clearAllActiveFilters());
        DOM.activeTagsContainer.appendChild(clearBtn);
      },

      renderPaginationUI(totalPages) {
        let container = document.getElementById('dynamic-pagination-wrap');
        if (!container) { container = document.createElement('div'); container.id = 'dynamic-pagination-wrap'; container.className = 'pagination-ultra'; DOM.gridContainer.parentNode.insertBefore(container, DOM.gridContainer.nextSibling); }
        container.innerHTML = '';
        if (totalPages <= 1) return;
        const prevBtn = document.createElement('button'); prevBtn.className = 'page-btn page-btn-arrow' + (this.currentPage === 1 ? ' disabled' : ''); prevBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"/></svg>'; prevBtn.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.renderPage(this.applySort(this.applyFilters(this.allProducts))); window.scrollTo({ top: 0, behavior: 'smooth' }); } }); container.appendChild(prevBtn);
        this.getPaginationRange(this.currentPage, totalPages).forEach(item => {
          if (item === '...') { const dots = document.createElement('span'); dots.className = 'page-dots'; dots.textContent = '…'; container.appendChild(dots); }
          else { const btn = document.createElement('button'); btn.className = 'page-btn' + (this.currentPage === item ? ' active' : ''); btn.textContent = item; btn.addEventListener('click', () => { this.currentPage = item; this.renderPage(this.applySort(this.applyFilters(this.allProducts))); window.scrollTo({ top: 0, behavior: 'smooth' }); }); container.appendChild(btn); }
        });
        const nextBtn = document.createElement('button'); nextBtn.className = 'page-btn page-btn-arrow' + (this.currentPage === totalPages ? ' disabled' : ''); nextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"/></svg>'; nextBtn.addEventListener('click', () => { if (this.currentPage < totalPages) { this.currentPage++; this.renderPage(this.applySort(this.applyFilters(this.allProducts))); window.scrollTo({ top: 0, behavior: 'smooth' }); } }); container.appendChild(nextBtn);
      },

      getPaginationRange(current, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
      },

      rebindAddToCartButtons() {
        DOM.gridContainer.querySelectorAll('.pc-cart-btn:not(.pc-cart-disabled)').forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            if (btn.classList.contains('is-added')) { router.push('/cos'); return; }
            const title = btn.getAttribute('data-nume');
            const price = parseInt(btn.getAttribute('data-pret'));
            const variant = btn.getAttribute('data-variant');
            const img = btn.getAttribute('data-img');
            const stocMax = parseInt(btn.getAttribute('data-stoc')) || 0;
            let cart = []; try { cart = JSON.parse(localStorage.getItem('ovifone_cart') || '[]'); } catch (err) { cart = []; }
            const existentItem = cart.find(i => i.title === title && i.variant === variant);
            if ((existentItem ? existentItem.qty : 0) + 1 > stocMax) { showNotification(`Nu poți adăuga. Stoc maxim: ${stocMax} bucăți.`, true); return; }
            if (existentItem) { existentItem.qty++; } else { cart.push({ title, price, variant, img, qty: 1 }); }
            localStorage.setItem('ovifone_cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            window.dispatchEvent(new CustomEvent('cartItemAdded', { detail: { name: title, price, img, variant } }));

            // Ripple
            const ripple = document.createElement('span');
            ripple.className = 'pc-cart-ripple';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            // Particule
            const rect = btn.getBoundingClientRect();
            for (let i = 0; i < 6; i++) {
              const p = document.createElement('span');
              p.className = 'pc-cart-particle';
              p.style.cssText = `left:${rect.left + rect.width/2}px;top:${rect.top + rect.height/2}px;--dx:${(Math.random()-0.5)*80}px;--dy:${(Math.random()-0.5)*80}px;--delay:${i*0.05}s`;
              document.body.appendChild(p);
              setTimeout(() => p.remove(), 800);
            }

            btn.classList.add('is-adding');
            setTimeout(() => {
              btn.classList.remove('is-adding'); btn.classList.add('is-added');
              btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="#fff" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"/></svg>';
              setTimeout(() => {
                btn.classList.remove('is-added');
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
              }, 2500);
            }, 600);
          });
        });
      },

      bindFilters() { DOM.filterCheckboxes.forEach(cb => { cb.addEventListener('change', () => this.executeFilteringAndSorting()); }); },

      bindSort() {
        const trigger = document.querySelector('.custom-sort-trigger'), options = document.querySelectorAll('.custom-option'), dropdown = document.getElementById('custom-sort');
        trigger?.addEventListener('click', () => dropdown?.classList.toggle('is-open'));
        document.addEventListener('click', e => { if (!dropdown?.contains(e.target)) dropdown?.classList.remove('is-open'); });
        options.forEach(opt => { opt.addEventListener('click', () => { options.forEach(o => o.classList.remove('selected')); opt.classList.add('selected'); this.currentSort = opt.getAttribute('data-value'); const st = document.querySelector('.sort-selected-text'); if (st) st.textContent = opt.textContent; dropdown?.classList.remove('is-open'); this.executeFilteringAndSorting(); }); });
      },

      clearAllActiveFilters() {
        DOM.filterCheckboxes.forEach(cb => { cb.checked = false; });
        if (DOM.pageTitle) DOM.pageTitle.textContent = 'Toate Produsele';
        this.executeFilteringAndSorting();
      }
    };

    GlobalCartSync.init(); SidebarControl.init(); ProductEngine.init();
  }, []);

  return (
    <main className="main-content">
      <header className="category-hero-ultra">
        <div className="section-container">
          <div className="hero-content-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="page-title-ultra">Toate Produsele</h1>
            <p className="page-subtitle-ultra">Explorează întregul nostru catalog: telefoane, accesorii și protecții.</p>
          </div>
        </div>
      </header>

      <section className="shop-section-ultra">
        <div className="section-container shop-layout-ultra">

          <aside className="shop-sidebar-ultra">
            <div className="filter-header-mobile">
              <h3>Filtre</h3>
              <button className="close-filters-btn"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            </div>
            <div className="filter-scroll-area">
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Categorie</h4>
                <div className="filter-options-ultra" data-filter-group="category">
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="telefoane" /><span className="box-ultra"></span> <span className="lbl-text">Telefoane</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="tablete" /><span className="box-ultra"></span> <span className="lbl-text">Tablete</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="casti" /><span className="box-ultra"></span> <span className="lbl-text">Căști & Audio</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="accesorii" /><span className="box-ultra"></span> <span className="lbl-text">Încărcătoare & Cabluri</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="huse" /><span className="box-ultra"></span> <span className="lbl-text">Huse Protecție</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="folii" /><span className="box-ultra"></span> <span className="lbl-text">Folii Ecran</span></label>
                </div>
              </div>
              <hr className="filter-divider" />
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Brand</h4>
                <div className="filter-options-ultra" data-filter-group="brand">
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="apple" /><span className="box-ultra"></span> <span className="lbl-text">Apple</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="samsung" /><span className="box-ultra"></span> <span className="lbl-text">Samsung</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="google" /><span className="box-ultra"></span> <span className="lbl-text">Google</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="anker" /><span className="box-ultra"></span> <span className="lbl-text">Anker</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="baseus" /><span className="box-ultra"></span> <span className="lbl-text">Baseus</span></label>
                </div>
              </div>
            </div>
          </aside>

          <div className="shop-main-ultra">
            <div className="shop-toolbar-ultra">
              <div className="toolbar-left-ultra">
                <button className="mobile-filter-trigger-ultra">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /></svg>
                  <span>Filtre</span>
                </button>
                <div className="active-filters-tags"></div>
              </div>
              <div className="toolbar-right-ultra">
                <span className="results-counter-ultra"><strong></strong> produse</span>
                <div className="sort-wrapper-ultra">
                  <div className="custom-sort-dropdown" id="custom-sort">
                    <div className="custom-sort-trigger">
                      <span className="sort-selected-text">Cele mai populare</span>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="custom-sort-options">
                      <div className="custom-option selected" data-value="popular">Cele mai populare</div>
                      <div className="custom-option" data-value="price-asc">Preț: crescător</div>
                      <div className="custom-option" data-value="price-desc">Preț: descrescător</div>
                      <div className="custom-option" data-value="newest">Cele mai noi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="no-results" className="empty-state-premium hidden" style={{ display: 'none' }}>
              <div className="empty-content-glass">
                <div className="empty-icon-glow"><svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg></div>
                <h2>Niciun produs găsit</h2>
                <p className="empty-dynamic-text">Nu avem stoc pentru combinația de filtre aleasă.</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  <button id="st-reset-btn" className="premium-action-btn" style={{ background: '#1d1d1f', color: '#fff' }}><span>RESETEAZĂ FILTRELE</span></button>
                </div>
              </div>
            </div>

            <div className="products-grid-ultra" id="product-grid"></div>
          </div>

        </div>
      </section>
    </main>
  );
}