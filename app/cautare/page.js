'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function CautareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('search');

  useEffect(() => {
    const termDisplay  = document.getElementById('search-term-display');
    const countDisplay = document.getElementById('search-count');
    const grid         = document.getElementById('search-results-grid');
    const controlsBar  = document.getElementById('search-controls-bar');
    const heroInput    = document.getElementById('search-hero-input');
    const heroForm     = document.getElementById('search-hero-form');

    if (heroInput && query) heroInput.value = query;

    let allRezultate = [];
    let currentSort = 'relevanta';

    function handleSubmit(e) {
      e.preventDefault();
      const val = heroInput?.value.trim();
      if (val) router.push('/cautare?search=' + encodeURIComponent(val));
    }
    heroForm?.addEventListener('submit', handleSubmit);

    if (!query) {
      if (termDisplay) termDisplay.textContent = 'nimic';
      if (grid) grid.innerHTML = buildEmptyState('Nu ai introdus un termen.', 'Încearcă să cauți un produs, brand sau categorie.');
      return () => { heroForm?.removeEventListener('submit', handleSubmit); };
    }

    if (termDisplay) termDisplay.textContent = query;

    async function init() {
      try {
        const { data: produse, error } = await supabase.from('produse').select('*');
        if (error) throw error;

        const q = query.toLowerCase();
        const qNoSpaces = q.replace(/\s+/g, '');
        allRezultate = produse.filter(p => {
          const nume = (p.nume || '').toLowerCase();
          const brand = (p.brand || '').toLowerCase();
          const categorie = (p.categorie || '').toLowerCase();
          const culori = (p.culori || '').toLowerCase();
          return nume.includes(q) || brand.includes(q) || categorie.includes(q) || culori.includes(q) ||
            nume.replace(/\s+/g, '').includes(qNoSpaces) || brand.replace(/\s+/g, '').includes(qNoSpaces);
        });

        if (allRezultate.length > 0 && controlsBar) controlsBar.style.display = '';
        if (allRezultate.length === 0 && controlsBar) controlsBar.style.display = 'none';
        renderResults(allRezultate);

        // Category radio → show/hide dynamic filters
        document.querySelectorAll('input[name="cat-select"]').forEach(radio => {
          radio.addEventListener('change', () => {
            const val = radio.value;
            document.querySelectorAll('.dyn-filter-group').forEach(g => {
              g.style.display = 'none';
              g.querySelectorAll('input').forEach(i => { i.checked = false; });
            });
            document.querySelectorAll('.dyn-filter-group').forEach(g => {
              const forCats = g.getAttribute('data-for').split(',');
              if (forCats.includes(val)) {
                g.style.display = 'block';
                g.style.animation = 'filterSlideIn 0.35s ease';
              }
            });
            renderResults(allRezultate);
          });
        });

        // Dynamic filter checkboxes - use event delegation
        document.getElementById('dynamic-filters')?.addEventListener('change', (e) => {
          if (e.target.matches('input[type="checkbox"]')) renderResults(allRezultate);
        });

        // Bind sort dropdown
        const sortTrigger = document.querySelector('.custom-sort-trigger');
        const sortDropdown = document.getElementById('custom-sort');
        const sortOptions = document.querySelectorAll('.custom-option');
        sortTrigger?.addEventListener('click', () => sortDropdown?.classList.toggle('is-open'));
        document.addEventListener('click', e => { if (!sortDropdown?.contains(e.target)) sortDropdown?.classList.remove('is-open'); });
        sortOptions.forEach(opt => {
          opt.addEventListener('click', () => {
            sortOptions.forEach(o => o.classList.remove('selected')); opt.classList.add('selected');
            currentSort = opt.getAttribute('data-value');
            const selectedText = document.querySelector('.sort-selected-text');
            if (selectedText) selectedText.textContent = opt.textContent;
            sortDropdown?.classList.remove('is-open');
            renderResults(allRezultate);
          });
        });

        // Bind price filter
        document.getElementById('price-apply-btn')?.addEventListener('click', () => renderResults(allRezultate));
        document.querySelectorAll('.price-input').forEach(input => {
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') renderResults(allRezultate); });
        });

        // Price slider
        const rangeMin = document.getElementById('price-range-min');
        const rangeMax = document.getElementById('price-range-max');
        const inputMin = document.getElementById('price-min');
        const inputMax = document.getElementById('price-max');
        const fill = document.getElementById('price-slider-fill');
        const maxVal = 10000;

        function updateSliderFill() {
          const min = parseInt(rangeMin?.value || 0);
          const max = parseInt(rangeMax?.value || maxVal);
          const leftPct = (min / maxVal) * 100;
          const rightPct = (max / maxVal) * 100;
          if (fill) { fill.style.left = leftPct + '%'; fill.style.width = (rightPct - leftPct) + '%'; }
        }

        function syncSliderToInputs() {
          if (inputMin) inputMin.value = rangeMin?.value || '';
          if (inputMax) inputMax.value = rangeMax?.value === String(maxVal) ? '' : rangeMax?.value;
          updateSliderFill();
        }

        rangeMin?.addEventListener('input', () => {
          if (parseInt(rangeMin.value) > parseInt(rangeMax.value) - 100) rangeMin.value = parseInt(rangeMax.value) - 100;
          syncSliderToInputs();
        });
        rangeMax?.addEventListener('input', () => {
          if (parseInt(rangeMax.value) < parseInt(rangeMin.value) + 100) rangeMax.value = parseInt(rangeMin.value) + 100;
          syncSliderToInputs();
        });
        rangeMin?.addEventListener('change', () => { renderResults(allRezultate); });
        rangeMax?.addEventListener('change', () => { renderResults(allRezultate); });
        updateSliderFill();

        // Bind mobile filter toggle
        const sidebar = document.querySelector('.shop-sidebar-ultra');
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay-ultra';
        document.body.appendChild(overlay);
        document.querySelector('.mobile-filter-trigger-ultra')?.addEventListener('click', () => { sidebar?.classList.add('is-open'); overlay.classList.add('is-visible'); });
        document.querySelector('.close-filters-btn')?.addEventListener('click', () => { sidebar?.classList.remove('is-open'); overlay.classList.remove('is-visible'); });
        overlay.addEventListener('click', () => { sidebar?.classList.remove('is-open'); overlay.classList.remove('is-visible'); });

      } catch (err) {
        console.error(err);
        if (grid) grid.innerHTML = `<div style="grid-column:1/-1;color:red;text-align:center;padding:60px;">Eroare la conectarea cu baza de date.</div>`;
      }
    }

    function getActiveFilters() {
      const filters = {};
      // Get category from radio
      const catRadio = document.querySelector('input[name="cat-select"]:checked');
      filters.category = catRadio ? [catRadio.value.toLowerCase()] : [];
      // Get all checked checkboxes from visible dynamic filters
      const visibleGroups = document.querySelectorAll('.dyn-filter-group[style*="block"] [data-filter-group]');
      visibleGroups.forEach(group => {
        const gName = group.getAttribute('data-filter-group');
        filters[gName] = [];
        group.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          filters[gName].push(cb.value.toLowerCase());
        });
      });
      return filters;
    }

    function getFiltered(arr) {
      let filtered = [...arr];
      const f = getActiveFilters();
      if (f.category.length) filtered = filtered.filter(p => p.categorie && f.category.includes(p.categorie.toLowerCase()));
      if (f.brand && f.brand.length) filtered = filtered.filter(p => p.brand && f.brand.includes(p.brand.toLowerCase()));
      if (f.condition && f.condition.length) filtered = filtered.filter(p => p.stare && f.condition.some(c => p.stare.toLowerCase().includes(c.toLowerCase())));
      if (f.storage && f.storage.length) filtered = filtered.filter(p => f.storage.includes(String(p.stocare || p.memorie || '')));
      if (f.connectivity && f.connectivity.length) filtered = filtered.filter(p => f.connectivity.some(c => (p.conectivitate || '').toLowerCase().includes(c)));
      if (f.type && f.type.length) filtered = filtered.filter(p => f.type.some(t => (p.tip || '').toLowerCase().includes(t)));
      if (f.connector && f.connector.length) filtered = filtered.filter(p => f.connector.some(c => (p.conector || '').toLowerCase().includes(c)));
      if (f.compatibility && f.compatibility.length) filtered = filtered.filter(p => f.compatibility.some(c => (p.brand || '').toLowerCase().includes(c)));
      if (f.material && f.material.length) filtered = filtered.filter(p => f.material.some(m => (p.material || '').toLowerCase().includes(m)));
      if (f.foiltype && f.foiltype.length) filtered = filtered.filter(p => f.foiltype.some(t => (p.tip || '').toLowerCase().includes(t)));
      // Price filter
      const minPrice = parseFloat(document.getElementById('price-min')?.value) || 0;
      const maxPrice = parseFloat(document.getElementById('price-max')?.value) || Infinity;
      filtered = filtered.filter(p => {
        const price = p.pret || 0;
        return price >= minPrice && (maxPrice === Infinity || price <= maxPrice);
      });
      return filtered;
    }

    function getSorted(arr) {
      const copy = [...arr];
      if (currentSort === 'pret-asc')  return copy.sort((a, b) => (a.pret || 0) - (b.pret || 0));
      if (currentSort === 'pret-desc') return copy.sort((a, b) => (b.pret || 0) - (a.pret || 0));
      if (currentSort === 'nume')      return copy.sort((a, b) => (a.nume || '').localeCompare(b.nume || '', 'ro'));
      return copy;
    }

    function parseCulori(raw) {
      if (!raw) return [];
      return raw.split(',').map(c => {
        const parts = c.trim().split('|');
        return { name: parts[0]?.trim() || '', hex: parts[1]?.trim() || null };
      }).filter(c => c.name);
    }

    function getLinkForProduct(p) {
      const catMap = { 'telefoane': '/telefoane/produs', 'tablete': '/tablete/produs', 'casti': '/casti/produs', 'accesorii': '/accesorii/produs', 'huse': '/huse/produs', 'folii': '/folii/produs' };
      const base = catMap[(p.categorie || '').toLowerCase()] || '/telefoane/produs';
      return `${base}?id=${p.id}`;
    }

    function renderResults(arr) {
      const sorted = getSorted(getFiltered(arr));

      if (countDisplay) countDisplay.innerHTML = `<strong>${sorted.length}</strong> ${sorted.length === 1 ? 'produs găsit' : 'produse găsite'}`;

      if (sorted.length === 0) {
        if (grid) grid.innerHTML = buildEmptyState('Nu am găsit niciun produs', `Nu există rezultate pentru "${query}". Încearcă alți termeni sau schimbă filtrele.`);
        return;
      }

      if (grid) grid.innerHTML = '';

      sorted.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'premium-card';
        card.style.animationDelay = `${index * 50}ms`;

        const hasSale  = p.pret_vechi && p.pret_vechi > p.pret;
        const discount = hasSale ? Math.round(((p.pret_vechi - p.pret) / p.pret_vechi) * 100) : 0;
        const pretFmt  = p.pret       ? p.pret.toLocaleString('ro-RO') + ' lei' : '';
        const pretVFmt = p.pret_vechi ? p.pret_vechi.toLocaleString('ro-RO') + ' lei' : '';
        const culori   = parseCulori(p.culori);
        const swatchesHtml = culori.length > 0 ? `
          <div class="card-color-swatches">
            ${culori.slice(0, 4).map(c => c.hex ? `<span class="color-swatch" style="background:${c.hex};" title="${c.name}"></span>` : `<span class="color-swatch" style="background:#ccc;" title="${c.name}"></span>`).join('')}
            ${culori.length > 4 ? `<span class="color-swatch-more">+${culori.length - 4}</span>` : ''}
          </div>` : '';

        const catMap = { 'telefoane':'Telefon','tablete':'Tabletă','casti':'Căști','accesorii':'Accesoriu','huse':'Husă','folii':'Folie' };
        const catLabel = p.categorie ? (catMap[p.categorie.toLowerCase()] || p.categorie) : '';

        card.innerHTML = `
          <a href="${getLinkForProduct(p)}" class="premium-card-inner" style="text-decoration:none;color:inherit;">
            ${hasSale ? '<div class="corner-ribbon">Sale!</div>' : ''}
            <div class="premium-media">
              <img src="${p.imagine_url}" alt="${p.nume}" loading="lazy">
            </div>
            <div class="premium-info">
              <div class="card-top-meta">
                ${p.brand ? `<span class="card-brand">${p.brand}</span>` : ''}
                ${catLabel ? `<span class="card-category-dot">${catLabel}</span>` : ''}
              </div>
              <h3 class="premium-name">${p.nume}</h3>
              ${swatchesHtml}
              <div class="premium-pricing">
                <div class="price-stack">
                  <span class="price-current">${pretFmt}</span>
                  ${hasSale ? `<span class="price-old">${pretVFmt}</span>` : ''}
                </div>
                ${hasSale
                  ? `<span class="price-discount-badge">-${discount}%</span>`
                  : `<div class="card-cta-arrow"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>`
                }
              </div>
            </div>
          </a>`;

        grid?.appendChild(card);
      });
    }

    function buildEmptyState(title, desc) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-5.2-5.2"/>
            </svg>
          </div>
          <h2>${title}</h2>
          <p>${desc}</p>
          <div class="empty-state-actions">
            <a href="/telefoane" class="btn-primary">Telefoane</a>
            <a href="/toate" class="btn-secondary">Toate produsele</a>
          </div>
        </div>`;
    }

    init();

    return () => {
      heroForm?.removeEventListener('submit', handleSubmit);
    };
  }, [query, router]);

  return (
    <main className="main-content">

      {/* HERO */}
      <section className="search-hero">
        <div className="search-hero-inner">
          <p className="search-hero-label">Rezultate pentru</p>
          <h1 className="search-hero-title">"<span id="search-term-display">...</span>"</h1>
          <p className="search-hero-count" id="search-count"></p>
          <form className="search-hero-form" id="search-hero-form">
            <div className="search-hero-input-wrap">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5.2-5.2"/></svg>
              <input type="text" id="search-hero-input" placeholder="Caută din nou..." autoComplete="off" />
              <button type="submit" className="search-hero-btn">
                <span>Caută</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </form>
        </div>
        <div className="search-hero-decoration" aria-hidden="true">
          <div className="deco-ring deco-ring-1"></div>
          <div className="deco-ring deco-ring-2"></div>
          <div className="deco-ring deco-ring-3"></div>
        </div>
      </section>

      {/* RESULTS WITH FILTERS */}
      <section className="shop-section-ultra" id="search-controls-bar" style={{ display: 'none' }}>
        <div className="section-container shop-layout-ultra">

          <aside className="shop-sidebar-ultra">
            <div className="filter-header-mobile">
              <h3>Filtre</h3>
              <button className="close-filters-btn"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            </div>
            <div className="filter-scroll-area">
              {/* PRICE WITH SLIDER */}
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Preț</h4>
                <div className="price-range-filter">
                  <div className="price-slider-wrap">
                    <div className="price-slider-track" id="price-slider-track">
                      <div className="price-slider-fill" id="price-slider-fill"></div>
                    </div>
                    <input type="range" className="price-range-thumb" id="price-range-min" min="0" max="10000" defaultValue="0" step="50" />
                    <input type="range" className="price-range-thumb" id="price-range-max" min="0" max="10000" defaultValue="10000" step="50" />
                  </div>
                  <div className="price-inputs">
                    <div className="price-input-wrap"><span className="price-currency">Lei</span><input type="number" className="price-input" id="price-min" placeholder="0" min="0" /></div>
                    <span className="price-separator">—</span>
                    <div className="price-input-wrap"><span className="price-currency">Lei</span><input type="number" className="price-input" id="price-max" placeholder="10000" min="0" /></div>
                  </div>
                  <button className="price-apply-btn" id="price-apply-btn">Aplică</button>
                </div>
              </div>
              <hr className="filter-divider" />

              {/* CATEGORY SELECTOR */}
              <div className="filter-widget-ultra">
                <h4 className="widget-title-ultra">Categorie</h4>
                <div className="filter-options-ultra" data-filter-group="category">
                  <label className="cyber-checkbox-ultra"><input type="radio" name="cat-select" value="telefoane" /><span className="box-ultra"></span> <span className="lbl-text">Telefoane</span></label>
                  <label className="cyber-checkbox-ultra"><input type="radio" name="cat-select" value="tablete" /><span className="box-ultra"></span> <span className="lbl-text">Tablete</span></label>
                  <label className="cyber-checkbox-ultra"><input type="radio" name="cat-select" value="casti" /><span className="box-ultra"></span> <span className="lbl-text">Căști & Audio</span></label>
                  <label className="cyber-checkbox-ultra"><input type="radio" name="cat-select" value="accesorii" /><span className="box-ultra"></span> <span className="lbl-text">Accesorii</span></label>
                  <label className="cyber-checkbox-ultra"><input type="radio" name="cat-select" value="huse" /><span className="box-ultra"></span> <span className="lbl-text">Huse</span></label>
                  <label className="cyber-checkbox-ultra"><input type="radio" name="cat-select" value="folii" /><span className="box-ultra"></span> <span className="lbl-text">Folii</span></label>
                </div>
              </div>

              {/* DYNAMIC FILTERS - shown/hidden based on category */}
              <div className="dynamic-filters" id="dynamic-filters">
                {/* Telefoane / Tablete filters */}
                <div className="dyn-filter-group" data-for="telefoane,tablete" style={{ display: 'none' }}>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Brand</h4>
                    <div className="filter-options-ultra" data-filter-group="brand">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="apple" /><span className="box-ultra"></span> <span className="lbl-text">Apple</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="samsung" /><span className="box-ultra"></span> <span className="lbl-text">Samsung</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="google" /><span className="box-ultra"></span> <span className="lbl-text">Google</span></label>
                    </div>
                  </div>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Stare</h4>
                    <div className="filter-options-ultra" data-filter-group="condition">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="Nou" /><span className="box-ultra"></span> <span className="lbl-text">Nou</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="SH" /><span className="box-ultra"></span> <span className="lbl-text">Second Hand</span></label>
                    </div>
                  </div>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Memorie</h4>
                    <div className="filter-options-grid-ultra" data-filter-group="storage">
                      <label className="chip-checkbox-ultra"><input type="checkbox" value="64" /><span className="chip-ultra">64GB</span></label>
                      <label className="chip-checkbox-ultra"><input type="checkbox" value="128" /><span className="chip-ultra">128GB</span></label>
                      <label className="chip-checkbox-ultra"><input type="checkbox" value="256" /><span className="chip-ultra">256GB</span></label>
                      <label className="chip-checkbox-ultra"><input type="checkbox" value="512" /><span className="chip-ultra">512GB</span></label>
                      <label className="chip-checkbox-ultra"><input type="checkbox" value="1024" /><span className="chip-ultra">1TB</span></label>
                    </div>
                  </div>
                </div>

                {/* Căști filters */}
                <div className="dyn-filter-group" data-for="casti" style={{ display: 'none' }}>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Brand</h4>
                    <div className="filter-options-ultra" data-filter-group="brand">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="apple" /><span className="box-ultra"></span> <span className="lbl-text">Apple</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="samsung" /><span className="box-ultra"></span> <span className="lbl-text">Samsung</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="sony" /><span className="box-ultra"></span> <span className="lbl-text">Sony</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="jbl" /><span className="box-ultra"></span> <span className="lbl-text">JBL</span></label>
                    </div>
                  </div>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Conectivitate</h4>
                    <div className="filter-options-ultra" data-filter-group="connectivity">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="wireless" /><span className="box-ultra"></span> <span className="lbl-text">Wireless</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="cu fir" /><span className="box-ultra"></span> <span className="lbl-text">Cu fir</span></label>
                    </div>
                  </div>
                </div>

                {/* Accesorii filters */}
                <div className="dyn-filter-group" data-for="accesorii" style={{ display: 'none' }}>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Tip Produs</h4>
                    <div className="filter-options-ultra" data-filter-group="type">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="incarcator" /><span className="box-ultra"></span> <span className="lbl-text">Încărcător</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="cablu" /><span className="box-ultra"></span> <span className="lbl-text">Cablu</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="adaptor" /><span className="box-ultra"></span> <span className="lbl-text">Adaptor</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="powerbank" /><span className="box-ultra"></span> <span className="lbl-text">Powerbank</span></label>
                    </div>
                  </div>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Conector</h4>
                    <div className="filter-options-ultra" data-filter-group="connector">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="usb-c" /><span className="box-ultra"></span> <span className="lbl-text">USB-C</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="lightning" /><span className="box-ultra"></span> <span className="lbl-text">Lightning</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="magsafe" /><span className="box-ultra"></span> <span className="lbl-text">MagSafe</span></label>
                    </div>
                  </div>
                </div>

                {/* Huse filters */}
                <div className="dyn-filter-group" data-for="huse" style={{ display: 'none' }}>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Compatibilitate</h4>
                    <div className="filter-options-ultra" data-filter-group="compatibility">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="apple" /><span className="box-ultra"></span> <span className="lbl-text">iPhone</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="samsung" /><span className="box-ultra"></span> <span className="lbl-text">Samsung</span></label>
                    </div>
                  </div>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Material</h4>
                    <div className="filter-options-ultra" data-filter-group="material">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="silicon" /><span className="box-ultra"></span> <span className="lbl-text">Silicon</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="piele" /><span className="box-ultra"></span> <span className="lbl-text">Piele</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="plastic" /><span className="box-ultra"></span> <span className="lbl-text">Plastic</span></label>
                    </div>
                  </div>
                </div>

                {/* Folii filters */}
                <div className="dyn-filter-group" data-for="folii" style={{ display: 'none' }}>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Compatibilitate</h4>
                    <div className="filter-options-ultra" data-filter-group="compatibility">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="apple" /><span className="box-ultra"></span> <span className="lbl-text">iPhone</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="samsung" /><span className="box-ultra"></span> <span className="lbl-text">Samsung</span></label>
                    </div>
                  </div>
                  <hr className="filter-divider" />
                  <div className="filter-widget-ultra">
                    <h4 className="widget-title-ultra">Tip Folie</h4>
                    <div className="filter-options-ultra" data-filter-group="foiltype">
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="sticla" /><span className="box-ultra"></span> <span className="lbl-text">Sticlă securizată</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="privacy" /><span className="box-ultra"></span> <span className="lbl-text">Privacy</span></label>
                      <label className="cyber-checkbox-ultra"><input type="checkbox" value="hidrogel" /><span className="box-ultra"></span> <span className="lbl-text">Hidrogel</span></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="shop-main-ultra">
            <div className="shop-toolbar-ultra">
              <div className="toolbar-right-ultra">
                <span className="results-counter-ultra"><strong></strong> produse</span>
                <button className="mobile-filter-trigger-ultra">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /></svg>
                  <span>Filtre</span>
                </button>
                <div className="sort-wrapper-ultra">
                  <div className="custom-sort-dropdown" id="custom-sort">
                    <div className="custom-sort-trigger">
                      <span className="sort-selected-text">Relevanță</span>
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="custom-sort-options">
                      <div className="custom-option selected" data-value="relevanta">Relevanță</div>
                      <div className="custom-option" data-value="pret-asc">Preț: crescător</div>
                      <div className="custom-option" data-value="pret-desc">Preț: descrescător</div>
                      <div className="custom-option" data-value="nume">Nume A–Z</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="products-grid-ultra search-grid" id="search-results-grid">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA BAND */}
      <section className="search-cta-band">
        <div className="search-cta-inner">
          <div className="search-cta-text">
            <p className="search-cta-eyebrow">Ovifone</p>
            <h2 className="search-cta-title">Nu ai găsit<br />ce căutai? <span>Explorează tot.</span></h2>
            <p className="search-cta-desc">Avem sute de produse — telefoane, tablete, căști și accesorii originale, toate testate și cu garanție 12 luni.</p>
            <div className="search-cta-cats">
              <Link href="/telefoane" className="cta-cat-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="5" y="2" width="14" height="20" rx="1"/><path d="M10 18h4"/></svg>
                Telefoane
              </Link>
              <Link href="/tablete" className="cta-cat-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M10 19h4"/></svg>
                Tablete
              </Link>
              <Link href="/casti" className="cta-cat-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M4 12v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="12" width="5" height="7"/><rect x="17" y="12" width="5" height="7"/></svg>
                Căști
              </Link>
              <Link href="/accesorii" className="cta-cat-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M8 10V3h8v7"/><path d="M12 10v11"/><path d="M8 21h8"/></svg>
                Accesorii
              </Link>
              <Link href="/huse" className="cta-cat-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z"/></svg>
                Huse
              </Link>
            </div>
          </div>
          <div className="search-cta-actions">
            <Link href="/toate" className="cta-btn-primary">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Toate produsele
            </Link>
            <Link href="/vinde" className="cta-btn-ghost">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>
              Vinde telefonul tău
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default function Cautare() {
  return (
    <Suspense fallback={
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}>
            <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,.15)" strokeWidth="3"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="#f49201" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p style={{ color: '#86868b', fontWeight: 600 }}>Se caută...</p>
        </div>
      </main>
    }>
      <CautareContent />
    </Suspense>
  );
}