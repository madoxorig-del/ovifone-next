'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Tablete() {
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
      toast.style.cssText = `
        position: fixed; bottom: 40px; left: 50%;
        transform: translateX(-50%) translateY(150px);
        background-color: ${isError ? '#fee2e2' : '#2b2b2b'};
        color: ${isError ? '#dc2626' : '#fff'};
        padding: 14px 28px; border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        font-weight: 700; font-size: 14px; z-index: 100000;
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex; align-items: center; gap: 12px;
        backdrop-filter: blur(8px);
      `;
      const icon = isError
        ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      toast.innerHTML = `${icon} <span>${message}</span>`;
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
      setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(150px)'; setTimeout(() => toast.remove(), 500); }, 3500);
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
          const cart = JSON.parse(localStorage.getItem('ovifone_cart') || '[]');
          const total = cart.reduce((s, i) => s + i.qty, 0);
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
      allProducts: [],
      currentPage: 1,
      itemsPerPage: 12,
      currentSort: 'popular',

      async init() {
        await this.fetchProducts();
        this.bindFilters();
        this.bindSort();
        DOM.resetBtn?.addEventListener('click', () => this.clearAllActiveFilters());
      },

      async fetchProducts() {
        try {
          // ✅ Filtru pe categorie tablete
          const { data: produse, error } = await supabase
            .from('produse')
            .select('*')
            .eq('categorie', 'tablete')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (produse && produse.length > 0) {
            this.allProducts = produse;
            this.executeFilteringAndSorting();
          } else {
            if (DOM.emptyStateMessage) { DOM.emptyStateMessage.style.display = 'flex'; DOM.emptyStateMessage.classList.remove('hidden'); }
            if (DOM.resultsCounterNode) DOM.resultsCounterNode.textContent = '0';
          }
        } catch (err) {
          console.error('Eroare Supabase:', err);
          showNotification('Eroare la încărcarea produselor.', true);
        }
      },

      buildCard(produs) {
        const brandAttr = (produs.brand || '').toLowerCase();
        const storageScurt = produs.stocare ? produs.stocare.split(',')[0].trim() : '128GB';
        const storageAttr = storageScurt.replace(/[^0-9]/g, '');
        const conditionAttr = produs.stare || 'SH';
        const stocDisponibil = produs.stoc || 0;

        let baterieText = produs.baterie ? produs.baterie.trim() : '100%';
        if (!baterieText.includes('%') && baterieText.match(/^[0-9]+$/)) baterieText += '%';

        const linkProdus = `/tablete/produs?id=${produs.id}`;

        // ✅ bgText specific tablete
        const bgText = brandAttr === 'apple' ? 'iPad' : (brandAttr === 'samsung' ? 'Galaxy Tab' : produs.brand || 'Tabletă');

        const card = document.createElement('div');
        card.className = 'dark-product-card product-item';
        card.setAttribute('data-brand', brandAttr);
        card.setAttribute('data-condition', conditionAttr);
        card.setAttribute('data-storage', storageAttr);
        card.setAttribute('data-price', produs.pret);
        card.setAttribute('data-stoc', stocDisponibil);
        card.setAttribute('data-date', new Date(produs.created_at).getTime());

        card.innerHTML = `
          <div class="bg-text">${bgText}</div>
          <div class="img-container">
            <a href="${linkProdus}" style="display:contents;">
              <img src="${produs.imagine_url}" alt="${produs.nume}" decoding="async" loading="lazy">
            </a>
          </div>
          <div class="container-info">
            <h2>${produs.nume}</h2>
            <p class="variant-text">${storageScurt} • Bat: ${baterieText}</p>
            <div class="price-wrapper">
              ${produs.pret_vechi ? `<span class="old-price">${produs.pret_vechi} lei</span>` : ''}
              <h3 class="price">${produs.pret}.<small>00</small> lei</h3>
            </div>
            <div class="cartBtn-wrap">
              <button class="cartBtn ${stocDisponibil <= 0 ? 'disabled' : ''}"
                ${stocDisponibil <= 0 ? 'style="background-color:#ccc;cursor:not-allowed;color:#666;"' : ''}
                data-nume="${produs.nume}" data-pret="${produs.pret}"
                data-img="${produs.imagine_url}"
                data-variant="${storageScurt} • ${produs.culori ? produs.culori.split(',')[0].trim() : 'Standard'}"
                data-stoc="${stocDisponibil}">
                <svg class="cart" fill="currentColor" viewBox="0 0 576 512" height="1em"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
                ${stocDisponibil <= 0 ? 'STOC EPUIZAT' : 'ADAUGĂ ÎN COȘ'}
              </button>
            </div>
          </div>
        `;
        return card;
      },

      getActiveFilters() {
        const filters = { brand: [], condition: [], storage: [] };
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
          const condition = p.stare || 'SH';
          const storageNum = (p.stocare ? p.stocare.split(',')[0].trim() : '128GB').replace(/[^0-9]/g, '');
          if (f.brand.length && !f.brand.includes(brand)) return false;
          if (f.condition.length && !f.condition.includes(condition)) return false;
          if (f.storage.length && !f.storage.includes(storageNum)) return false;
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
        const filtered = this.applyFilters(this.allProducts);
        const sorted = this.applySort(filtered);
        this.renderPage(sorted);
        this.renderActiveTags();
      },

      renderPage(products) {
        const totalPages = Math.ceil(products.length / this.itemsPerPage);
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const pageItems = products.slice(start, start + this.itemsPerPage);

        if (DOM.resultsCounterNode) DOM.resultsCounterNode.textContent = products.length;
        if (!DOM.gridContainer) return;
        DOM.gridContainer.innerHTML = '';

        if (pageItems.length === 0) {
          if (DOM.emptyStateMessage) { DOM.emptyStateMessage.style.display = 'flex'; DOM.emptyStateMessage.classList.remove('hidden'); }
        } else {
          if (DOM.emptyStateMessage) { DOM.emptyStateMessage.style.display = 'none'; DOM.emptyStateMessage.classList.add('hidden'); }
          pageItems.forEach((produs, i) => {
            const card = this.buildCard(produs);
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            DOM.gridContainer.appendChild(card);
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                card.style.transition = `opacity 0.45s ease ${i * 80}ms, transform 0.45s ease ${i * 80}ms`;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              });
            });
          });
          this.rebindAddToCartButtons();
        }
        this.renderPaginationUI(totalPages);
      },

      renderActiveTags() {
        if (!DOM.activeTagsContainer) return;
        DOM.activeTagsContainer.innerHTML = '';
        const f = this.getActiveFilters();
        const allActive = [...f.brand, ...f.condition, ...f.storage];
        if (allActive.length === 0) return;

        const isMobile = window.innerWidth <= 768;
        const maxVisible = isMobile ? 2 : allActive.length;
        const visible = allActive.slice(0, maxVisible);
        const hidden = allActive.slice(maxVisible);

        visible.forEach(val => {
          const tag = document.createElement('div');
          tag.className = 'filter-tag';
          tag.innerHTML = `
            <span>${val}</span>
            <button class="remove-tag" aria-label="Elimină ${val}">
              <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          `;
          tag.querySelector('.remove-tag').addEventListener('click', () => {
            DOM.filterCheckboxes.forEach(cb => { if (cb.value.toLowerCase() === val) cb.checked = false; });
            this.executeFilteringAndSorting();
          });
          DOM.activeTagsContainer.appendChild(tag);
        });

        if (hidden.length > 0) {
          const moreBtn = document.createElement('div');
          moreBtn.className = 'filter-tag';
          moreBtn.style.cssText = 'background: linear-gradient(135deg, #D4941C, #B07810); cursor: pointer;';
          moreBtn.innerHTML = `<span>+${hidden.length} mai multe</span>`;
          moreBtn.addEventListener('click', () => { DOM.mobileFilterTrigger?.click(); });
          DOM.activeTagsContainer.appendChild(moreBtn);
        }

        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-all-tags';
        clearBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Șterge toate
        `;
        clearBtn.addEventListener('click', () => this.clearAllActiveFilters());
        DOM.activeTagsContainer.appendChild(clearBtn);
      },

      renderPaginationUI(totalPages) {
        let container = document.getElementById('dynamic-pagination-wrap');
        if (!container) { container = document.createElement('div'); container.id = 'dynamic-pagination-wrap'; container.className = 'pagination-ultra'; DOM.gridContainer.parentNode.insertBefore(container, DOM.gridContainer.nextSibling); }
        container.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn page-btn-arrow' + (this.currentPage === 1 ? ' disabled' : '');
        prevBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"/></svg>';
        prevBtn.addEventListener('click', () => { if (this.currentPage > 1) { this.currentPage--; this.renderPage(this.applySort(this.applyFilters(this.allProducts))); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
        container.appendChild(prevBtn);

        this.getPaginationRange(this.currentPage, totalPages).forEach(item => {
          if (item === '...') { const dots = document.createElement('span'); dots.className = 'page-dots'; dots.textContent = '…'; container.appendChild(dots); }
          else { const btn = document.createElement('button'); btn.className = 'page-btn' + (this.currentPage === item ? ' active' : ''); btn.textContent = item; btn.addEventListener('click', () => { this.currentPage = item; this.renderPage(this.applySort(this.applyFilters(this.allProducts))); window.scrollTo({ top: 0, behavior: 'smooth' }); }); container.appendChild(btn); }
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn page-btn-arrow' + (this.currentPage === totalPages ? ' disabled' : '');
        nextBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"/></svg>';
        nextBtn.addEventListener('click', () => { if (this.currentPage < totalPages) { this.currentPage++; this.renderPage(this.applySort(this.applyFilters(this.allProducts))); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
        container.appendChild(nextBtn);
      },

      getPaginationRange(current, total) {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
      },

      rebindAddToCartButtons() {
        DOM.gridContainer.querySelectorAll('.cartBtn:not(.disabled)').forEach(btn => {
          btn.addEventListener('click', e => {
            e.preventDefault();
            if (btn.classList.contains('is-added')) { router.push('/cos'); return; }
            const title = btn.getAttribute('data-nume');
            const price = parseInt(btn.getAttribute('data-pret'));
            const variant = btn.getAttribute('data-variant');
            const img = btn.getAttribute('data-img');
            const stocMax = parseInt(btn.getAttribute('data-stoc')) || 0;
            let cart = [];
            try { cart = JSON.parse(localStorage.getItem('ovifone_cart') || '[]'); } catch (err) { cart = []; }
            const existentItem = cart.find(i => i.title === title && i.variant === variant);
            const qtyInCosDeja = existentItem ? existentItem.qty : 0;
            if (qtyInCosDeja + 1 > stocMax) { showNotification(`Nu poți adăuga. Stoc maxim: ${stocMax} bucăți.`, true); return; }
            if (existentItem) { existentItem.qty++; } else { cart.push({ title, price, variant, img, qty: 1 }); }
            localStorage.setItem('ovifone_cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            showNotification(`Adăugat în coș: ${title}`, false);
            btn.classList.add('is-adding');
            setTimeout(() => { btn.classList.remove('is-adding'); btn.classList.add('is-added'); btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right:8px;"><polyline points="20 6 9 17 4 12"/></svg>VEZI COȘUL'; }, 800);
          });
        });
      },

      bindFilters() {
        DOM.filterCheckboxes.forEach(cb => { cb.addEventListener('change', () => this.executeFilteringAndSorting()); });
      },

      bindSort() {
        const trigger = document.querySelector('.custom-sort-trigger');
        const options = document.querySelectorAll('.custom-option');
        const dropdown = document.getElementById('custom-sort');
        trigger?.addEventListener('click', () => dropdown?.classList.toggle('is-open'));
        document.addEventListener('click', e => { if (!dropdown?.contains(e.target)) dropdown?.classList.remove('is-open'); });
        options.forEach(opt => {
          opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected')); opt.classList.add('selected');
            this.currentSort = opt.getAttribute('data-value');
            const selectedText = document.querySelector('.sort-selected-text');
            if (selectedText) selectedText.textContent = opt.textContent;
            dropdown?.classList.remove('is-open');
            this.executeFilteringAndSorting();
          });
        });
      },

      clearAllActiveFilters() {
        DOM.filterCheckboxes.forEach(cb => { cb.checked = false; });
        if (DOM.pageTitle) DOM.pageTitle.textContent = 'Tablete & eReadere';
        this.executeFilteringAndSorting();
      }
    };

    GlobalCartSync.init();
    SidebarControl.init();
    ProductEngine.init();

  }, []);

  return (
    <main className="main-content">
      <header className="category-hero-ultra">
        <div className="section-container">
          <div className="hero-content-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="page-title-ultra">Tablete & eReadere</h1>
            <p className="page-subtitle-ultra">Performanță portabilă pentru muncă, școală și divertisment.</p>
          </div>
        </div>
      </header>

      <section className="shop-section-ultra">
        <div className="section-container shop-layout-ultra">

          <aside className="shop-sidebar-ultra">
            <div className="filter-header-mobile">
              <h3>Filtre</h3>
              <button className="close-filters-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="filter-scroll-area">
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Brand</h4>
                <div className="filter-options-ultra" data-filter-group="brand">
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="apple" /><span className="box-ultra"></span> <span className="lbl-text">Apple (iPad)</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="samsung" /><span className="box-ultra"></span> <span className="lbl-text">Samsung</span></label>
                </div>
              </div>
              <hr className="filter-divider" />
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Stare Produs</h4>
                <div className="filter-options-ultra" data-filter-group="condition">
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="Nou" /><span className="box-ultra"></span> <span className="lbl-text">Nou</span></label>
                  <label className="cyber-checkbox-ultra"><input type="checkbox" value="SH" /><span className="box-ultra"></span> <span className="lbl-text">Second Hand (SH)</span></label>
                </div>
              </div>
              <hr className="filter-divider" />
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Capacitate Stocare</h4>
                <div className="filter-options-grid-ultra" data-filter-group="storage">
                  <label className="chip-checkbox-ultra"><input type="checkbox" value="64" /><span className="chip-ultra">64GB</span></label>
                  <label className="chip-checkbox-ultra"><input type="checkbox" value="128" /><span className="chip-ultra">128GB</span></label>
                  <label className="chip-checkbox-ultra"><input type="checkbox" value="256" /><span className="chip-ultra">256GB</span></label>
                  <label className="chip-checkbox-ultra"><input type="checkbox" value="512" /><span className="chip-ultra">512GB</span></label>
                  <label className="chip-checkbox-ultra"><input type="checkbox" value="1024" /><span className="chip-ultra">1TB</span></label>
                </div>
              </div>
            </div>
          </aside>

          <div className="shop-main-ultra">
            <div className="shop-toolbar-ultra">
              <div className="toolbar-left-ultra">
                <button className="mobile-filter-trigger-ultra">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                  </svg>
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
                <div className="empty-icon-glow">
                  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </div>
                <h2>Niciun produs găsit</h2>
                <p className="empty-dynamic-text">Nu avem stoc pentru combinația de filtre aleasă.</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  <button id="trigger-search-btn" className="premium-action-btn" style={{ background: '#1d1d1f', color: '#fff' }}>
                    <span>RESETEAZĂ FILTRELE</span>
                  </button>
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