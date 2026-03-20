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
    const sortSelect   = document.getElementById('sort-select');
    const heroInput    = document.getElementById('search-hero-input');
    const heroForm     = document.getElementById('search-hero-form');

    if (heroInput && query) heroInput.value = query;

    let activeFilter = 'all';
    let allRezultate = [];

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
        allRezultate = produse.filter(p =>
          (p.nume      && p.nume.toLowerCase().includes(q)) ||
          (p.brand     && p.brand.toLowerCase().includes(q)) ||
          (p.categorie && p.categorie.toLowerCase().includes(q)) ||
          (p.culori    && p.culori.toLowerCase().includes(q))
        );

        if (allRezultate.length > 0 && controlsBar) controlsBar.style.display = 'block';
        if (allRezultate.length === 0 && controlsBar) controlsBar.style.display = 'none';
        renderResults(allRezultate);

        document.querySelectorAll('.filter-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.dataset.filter;
            renderResults(getSorted(getFiltered(allRezultate)));
          });
        });

        sortSelect?.addEventListener('change', () => {
          renderResults(getSorted(getFiltered(allRezultate)));
        });

      } catch (err) {
        console.error(err);
        if (grid) grid.innerHTML = `<div style="grid-column:1/-1;color:red;text-align:center;padding:60px;">Eroare la conectarea cu baza de date.</div>`;
      }
    }

    function getFiltered(arr) {
      if (activeFilter === 'all') return arr;
      return arr.filter(p => p.categorie && p.categorie.toLowerCase().includes(activeFilter));
    }

    function getSorted(arr) {
      const val = sortSelect?.value || 'relevanta';
      const copy = [...arr];
      if (val === 'pret-asc')  return copy.sort((a, b) => (a.pret || 0) - (b.pret || 0));
      if (val === 'pret-desc') return copy.sort((a, b) => (b.pret || 0) - (a.pret || 0));
      if (val === 'nume')      return copy.sort((a, b) => (a.nume || '').localeCompare(b.nume || '', 'ro'));
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

      if (countDisplay) countDisplay.textContent = sorted.length === 1 ? '1 produs găsit' : `${sorted.length} produse găsite`;

      if (sorted.length === 0) {
        if (grid) grid.innerHTML = buildEmptyState('Nu am găsit niciun produs', `Nu există rezultate pentru "${query}"${activeFilter !== 'all' ? ' în categoria selectată' : ''}. Încearcă alți termeni.`);
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

      {/* CONTROLS */}
      <div className="search-controls-bar" id="search-controls-bar" style={{ display: 'none' }}>
        <div className="section-container search-controls-inner">
          <div className="search-filters">
            <button className="filter-chip active" data-filter="all">Toate</button>
            <button className="filter-chip" data-filter="telefoane">Telefoane</button>
            <button className="filter-chip" data-filter="tablete">Tablete</button>
            <button className="filter-chip" data-filter="casti">Căști</button>
            <button className="filter-chip" data-filter="accesorii">Accesorii</button>
          </div>
          <div className="search-sort">
            <label className="sort-label">Sortează:</label>
            <select className="sort-select" id="sort-select">
              <option value="relevanta">Relevanță</option>
              <option value="pret-asc">Preț ↑</option>
              <option value="pret-desc">Preț ↓</option>
              <option value="nume">Nume A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="section-container search-results-section">
        <div className="products-grid search-grid" id="search-results-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>

      {/* CTA BAND */}
      <section className="search-cta-band">
        <div className="search-cta-inner">
          <div className="search-cta-text">
            <p className="search-cta-eyebrow">Ovifone Marketplace</p>
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