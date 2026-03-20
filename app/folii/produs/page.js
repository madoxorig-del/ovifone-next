'use client';
import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function ProdusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const produsId = searchParams.get('id');
    if (!produsId) { router.push('/telefoane'); return; }

    function showNotification(message, isError = true) {
      const existing = document.getElementById('ovifone-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'ovifone-toast';
      toast.style.cssText = `
        position:fixed;bottom:40px;left:50%;
        transform:translateX(-50%) translateY(150px);
        background-color:${isError ? '#fee2e2' : '#2b2b2b'};
        color:${isError ? '#dc2626' : '#fff'};
        padding:14px 24px;border-radius:12px;
        box-shadow:0 15px 35px rgba(0,0,0,0.15);
        font-weight:600;font-size:14px;z-index:99999;
        transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        display:flex;align-items:center;gap:12px;
      `;
      const icon = isError
        ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      toast.innerHTML = `${icon} <span>${message}</span>`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
      setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(150px)'; setTimeout(() => toast.remove(), 400); }, 3500);
    }

    async function init() {
      let pData = null;
      try {
        const { data: p, error } = await supabase.from('produse').select('*').eq('id', produsId).single();
        if (error || !p) throw error;
        pData = p;
      } catch (err) {
        console.error('Eroare la extragerea produsului:', err);
        return;
      }

      let basePrice = pData.pret || 0;
      let currentStorageMod = 0;
      let selectedStorageText = '';
      let selectedColorText = '';
      const stocDisponibil = pData.stoc || 0;

      document.title = pData.nume + ' - Ovifone';
      document.querySelectorAll('.p-title, .s-title, .current').forEach(el => { if (el) el.textContent = pData.nume; });

      const stockStatus = document.querySelector('.stock-status');
      if (stockStatus) {
        if (stocDisponibil > 0) {
          stockStatus.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> În stoc`;
          stockStatus.className = 'stock-status in-stock';
        } else {
          stockStatus.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Stoc Epuizat`;
          stockStatus.className = 'stock-status out-of-stock';
          stockStatus.style.color = '#dc2626';
          stockStatus.style.background = '#fee2e2';
        }
      }

      const mainImgEl = document.getElementById('main-product-image');
      if (mainImgEl && pData.imagine_url) { mainImgEl.src = pData.imagine_url; mainImgEl.alt = pData.nume; }
      const stickyThumbEl = document.querySelector('.sticky-thumb');
      if (stickyThumbEl && pData.imagine_url) stickyThumbEl.src = pData.imagine_url;

      const thumbnailsContainer = document.getElementById('gallery-thumbnails');
      if (thumbnailsContainer) {
        let toatePozele = pData.imagine_url ? [pData.imagine_url] : [];
        if (pData.galerie) toatePozele = toatePozele.concat(pData.galerie.split(',').filter(u => u.trim() !== ''));
        thumbnailsContainer.innerHTML = toatePozele.map((url, i) => `
          <div class="thumbnail ${i === 0 ? 'active' : ''}" data-src="${url}">
            <img src="${url}" alt="Thumbnail ${i + 1}">
          </div>`).join('');
      }

      const colorContainer = document.getElementById('color-selector');
      if (colorContainer && pData.culori) {
        const arr = pData.culori.split(',').map(c => c.trim());
        colorContainer.innerHTML = arr.map((c, i) => {
          let colorName = c, cssColor = '#333';
          if (c.includes('|')) { const parts = c.split('|'); colorName = parts[0].trim(); cssColor = parts[1].trim(); }
          else {
            const cLow = c.toLowerCase();
            if (cLow.includes('gold') || cLow.includes('auriu')) cssColor = '#fcebd4';
            else if (cLow.includes('silver') || cLow.includes('alb')) cssColor = '#e3e4e5';
            else if (cLow.includes('black') || cLow.includes('negru')) cssColor = '#2b2b2b';
            else if (cLow.includes('titanium') || cLow.includes('titan')) cssColor = '#878681';
          }
          if (i === 0) selectedColorText = colorName;
          return `<button class="color-btn ${i === 0 ? 'active' : ''}" data-color="${colorName}" title="${colorName}" style="background-color:${cssColor};border:1px solid rgba(0,0,0,0.15);"></button>`;
        }).join('');
        const selName = document.getElementById('selected-color-name');
        if (selName) selName.textContent = selectedColorText;
      }

      const storageContainer = document.getElementById('storage-selector');
      if (storageContainer && pData.stocare) {
        const arr = pData.stocare.split(',').map(s => s.trim());
        selectedStorageText = arr[0];
        storageContainer.innerHTML = arr.map((s, i) => `<button class="box-btn ${i === 0 ? 'active' : ''}" data-price-mod="${i * 400}">${s}</button>`).join('');
      }

      let baterieText = pData.baterie ? pData.baterie.trim() : '100%';
      if (!baterieText.includes('%') && baterieText.match(/^[0-9]+$/)) baterieText += '%';
      const batElement = document.getElementById('produs-baterie-valoare');
      if (batElement) batElement.textContent = baterieText;

      const tabDescriere = document.getElementById('tab-descriere');
      if (tabDescriere) tabDescriere.innerHTML = pData.descriere ? `<div class="rich-text">${pData.descriere}</div>` : '<p>Fără descriere.</p>';
      const tabSpecs = document.getElementById('tab-specificatii');
      if (tabSpecs) tabSpecs.innerHTML = pData.specificatii || '<p style="padding:20px;">Fără specificații.</p>';

      const relGrid = document.getElementById('dynamic-related-grid');
      if (relGrid) {
        try {
          const { data: rel, error: relError } = await supabase.from('produse').select('id, nume, pret, imagine_url').neq('id', produsId).order('created_at', { ascending: false }).limit(6);
          if (!relError && rel && rel.length > 0) {
            relGrid.innerHTML = rel.map((rp, i) => `
              <div class="rel-card" data-reveal-delay="${i * 65}" onclick="window.location.href='/telefoane/produs?id=${rp.id}'">
                <img src="${rp.imagine_url}" alt="${rp.nume}">
                <h4>${rp.nume}</h4>
                <span>De la ${rp.pret} lei</span>
              </div>`).join('');
          } else {
            const relSection = document.querySelector('.related-section');
            if (relSection) relSection.style.display = 'none';
          }
        } catch (e) { console.error('Eroare produse similare', e); }
      }

      const elements = {
        mainImage: document.getElementById('main-product-image'),
        thumbnails: Array.from(document.querySelectorAll('.thumbnail')),
        prevThumbBtn: document.getElementById('gallery-prev-btn'),
        nextThumbBtn: document.getElementById('gallery-next-btn'),
        colorBtns: document.querySelectorAll('.color-btn'),
        colorName: document.getElementById('selected-color-name'),
        storageBtns: document.querySelectorAll('#storage-selector .box-btn'),
        priceDisplay: document.getElementById('dynamic-price'),
        oldPriceDisplay: document.getElementById('dynamic-old-price'),
        stickyPrice: document.getElementById('sticky-price'),
        stickyOldPrice: document.getElementById('sticky-old-price'),
        stickyVariant: document.getElementById('sticky-variant'),
        qtyInput: document.getElementById('qty-input'),
        qtyMinus: document.querySelector('.qty-btn.minus'),
        qtyPlus: document.querySelector('.qty-btn.plus'),
        mainAddBtn: document.getElementById('main-add-cart'),
        stickyAddBtn: document.getElementById('sticky-add-cart'),
        stickyBar: document.getElementById('sticky-bar'),
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabPanels: document.querySelectorAll('.tab-panel'),
        galleryContainer: document.getElementById('gallery-thumbnails'),
        badges: document.querySelectorAll('.cart-badge'),
        qtySelectorWrap: document.querySelector('.qty-selector'),
      };

      if (stocDisponibil <= 0) {
        [elements.mainAddBtn, elements.stickyAddBtn].forEach(btn => { if (btn) { btn.disabled = true; btn.innerHTML = 'STOC EPUIZAT'; btn.style.cssText += ';background-color:#ccc;cursor:not-allowed;'; } });
        if (elements.qtySelectorWrap) elements.qtySelectorWrap.style.display = 'none';
      }

      const BadgeEngine = {
        init() { this.update(); window.addEventListener('cartUpdated', () => this.update()); },
        update() {
          let total = 0;
          try { JSON.parse(localStorage.getItem('ovifone_cart') || '[]').forEach(i => { total += i.qty; }); } catch (e) {}
          elements.badges.forEach(b => { b.textContent = total; b.style.display = total > 0 ? 'flex' : 'none'; });
        }
      };

      const GalleryEngine = {
        currentIndex: 0, autoPlayInterval: null, autoPlayDelay: 3000, isIdle: true,
        init() {
          if (elements.thumbnails.length === 0) return;
          this.bindThumbnails(); this.bindArrows(); this.startAutoPlay(); this.bindHoverEvents(); this.initParallax();
          setTimeout(() => { if (elements.mainImage) elements.mainImage.classList.add('is-idle'); }, 1400);
        },
        changeImage(idx) {
          elements.thumbnails.forEach(t => t.classList.remove('active'));
          this.currentIndex = idx;
          const target = elements.thumbnails[idx];
          target.classList.add('active');
          elements.mainImage.classList.remove('is-idle');
          elements.mainImage.classList.add('fade-out');
          setTimeout(() => {
            elements.mainImage.src = target.getAttribute('data-src');
            elements.mainImage.classList.remove('fade-out');
            setTimeout(() => { if (this.isIdle) elements.mainImage.classList.add('is-idle'); }, 600);
          }, 280);
          if (elements.galleryContainer) elements.galleryContainer.scrollTo({ left: target.offsetLeft - elements.galleryContainer.clientWidth / 2 + target.clientWidth / 2, behavior: 'smooth' });
        },
        nextImage() { this.changeImage((this.currentIndex + 1) % elements.thumbnails.length); },
        prevImage() { this.changeImage((this.currentIndex - 1 + elements.thumbnails.length) % elements.thumbnails.length); },
        bindThumbnails() { elements.thumbnails.forEach((t, i) => t.addEventListener('click', () => { this.changeImage(i); this.resetAutoPlay(); })); },
        bindArrows() {
          elements.prevThumbBtn?.addEventListener('click', () => { this.prevImage(); this.resetAutoPlay(); });
          elements.nextThumbBtn?.addEventListener('click', () => { this.nextImage(); this.resetAutoPlay(); });
        },
        startAutoPlay() { if (this.autoPlayInterval) clearInterval(this.autoPlayInterval); this.autoPlayInterval = setInterval(() => this.nextImage(), this.autoPlayDelay); },
        stopAutoPlay() { if (this.autoPlayInterval) { clearInterval(this.autoPlayInterval); this.autoPlayInterval = null; } },
        resetAutoPlay() { this.stopAutoPlay(); this.startAutoPlay(); },
        bindHoverEvents() {
          const area = document.querySelector('.product-gallery-area');
          if (!area) return;
          area.addEventListener('mouseenter', () => { this.isIdle = false; elements.mainImage?.classList.remove('is-idle'); this.stopAutoPlay(); });
          area.addEventListener('mouseleave', () => { this.isIdle = true; elements.mainImage?.classList.add('is-idle'); this.startAutoPlay(); });
        },
        initParallax() {
          const wrapper = document.querySelector('.main-image-wrapper');
          if (!wrapper || window.innerWidth < 769) return;
          wrapper.addEventListener('mousemove', e => {
            if (!elements.mainImage || elements.mainImage.classList.contains('fade-out')) return;
            const rect = wrapper.getBoundingClientRect();
            elements.mainImage.style.transform = `rotateX(${((e.clientY - (rect.top + rect.height / 2)) / rect.height) * -8}deg) rotateY(${((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 10}deg) scale(1.04)`;
            elements.mainImage.classList.remove('is-idle');
          });
          wrapper.addEventListener('mouseleave', () => { if (!elements.mainImage) return; elements.mainImage.style.transform = ''; if (this.isIdle) elements.mainImage.classList.add('is-idle'); });
        }
      };

      function createRipple(btn, e) {
        const old = btn.querySelector('.btn-ripple'); if (old) old.remove();
        const ripple = document.createElement('span'); ripple.className = 'btn-ripple';
        const rect = btn.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      }

      const PricingEngine = {
        init() {
          elements.colorBtns.forEach(btn => btn.addEventListener('click', e => {
            createRipple(btn, e);
            elements.colorBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
            selectedColorText = btn.getAttribute('data-color');
            if (elements.colorName) elements.colorName.textContent = selectedColorText;
            this.updateStickyVariantText();
          }));
          elements.storageBtns.forEach(btn => btn.addEventListener('click', e => {
            createRipple(btn, e);
            elements.storageBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
            currentStorageMod = parseInt(btn.getAttribute('data-price-mod')) || 0;
            selectedStorageText = btn.textContent.trim();
            this.calculateAndRenderPrice(true); this.updateStickyVariantText();
          }));
        },
        calculateAndRenderPrice(animate) {
          const finalPrice = basePrice + currentStorageMod;
          if (elements.priceDisplay) {
            elements.priceDisplay.innerHTML = finalPrice.toLocaleString('ro-RO') + '<span> lei</span>';
            if (animate) { elements.priceDisplay.classList.remove('is-popping'); void elements.priceDisplay.offsetWidth; elements.priceDisplay.classList.add('is-popping'); setTimeout(() => elements.priceDisplay.classList.remove('is-popping'), 500); }
          }
          const saveBadge = document.querySelector('.price-save');
          if (pData.pret_vechi && pData.pret_vechi > basePrice) {
            const oldPrice = pData.pret_vechi + currentStorageMod;
            if (elements.oldPriceDisplay) { elements.oldPriceDisplay.innerHTML = oldPrice.toLocaleString('ro-RO') + ' lei'; elements.oldPriceDisplay.style.display = 'block'; }
            if (elements.stickyOldPrice) { elements.stickyOldPrice.innerHTML = oldPrice.toLocaleString('ro-RO') + ' lei'; elements.stickyOldPrice.style.display = 'inline-block'; }
            if (saveBadge) { saveBadge.textContent = `Economisești ${oldPrice - finalPrice} lei`; saveBadge.style.display = 'inline-block'; }
          } else {
            if (elements.oldPriceDisplay) elements.oldPriceDisplay.style.display = 'none';
            if (elements.stickyOldPrice) elements.stickyOldPrice.style.display = 'none';
            if (saveBadge) saveBadge.style.display = 'none';
          }
          if (elements.stickyPrice) elements.stickyPrice.innerHTML = finalPrice.toLocaleString('ro-RO') + ' lei';
        },
        updateStickyVariantText() { if (elements.stickyVariant) elements.stickyVariant.textContent = selectedStorageText + ' • ' + selectedColorText; }
      };

      const QtyEngine = {
        init() {
          const bounce = btn => { btn.classList.remove('is-bouncing'); void btn.offsetWidth; btn.classList.add('is-bouncing'); btn.addEventListener('animationend', () => btn.classList.remove('is-bouncing'), { once: true }); };
          const limitaComanda = stocDisponibil > 5 ? 5 : stocDisponibil;
          elements.qtyMinus?.addEventListener('click', () => { const v = parseInt(elements.qtyInput.value); if (v > 1) { elements.qtyInput.value = v - 1; this.animateQtyInput(); } bounce(elements.qtyMinus); });
          elements.qtyPlus?.addEventListener('click', () => { const v = parseInt(elements.qtyInput.value); if (v < limitaComanda) { elements.qtyInput.value = v + 1; this.animateQtyInput(); } else { showNotification(`Avem doar ${stocDisponibil} bucăți în stoc!`, true); } bounce(elements.qtyPlus); });
        },
        animateQtyInput() { elements.qtyInput.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)'; elements.qtyInput.style.transform = 'scale(1.3)'; setTimeout(() => { elements.qtyInput.style.transform = ''; }, 200); }
      };

      const TabsEngine = {
        indicator: null,
        init() {
          const header = document.querySelector('.tabs-header');
          if (header) { this.indicator = document.createElement('div'); this.indicator.className = 'tab-indicator'; header.appendChild(this.indicator); this.moveIndicator(document.querySelector('.tab-btn.active')); }
          elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              elements.tabBtns.forEach(b => b.classList.remove('active'));
              elements.tabPanels.forEach(p => p.classList.remove('active', 'tab-enter'));
              btn.classList.add('active'); this.moveIndicator(btn);
              const panel = document.getElementById('tab-' + btn.getAttribute('data-tab'));
              if (panel) { panel.classList.add('active'); void panel.offsetWidth; panel.classList.add('tab-enter'); panel.addEventListener('animationend', () => panel.classList.remove('tab-enter'), { once: true }); }
            });
          });
        },
        moveIndicator(btn) { if (!this.indicator || !btn) return; const rect = btn.getBoundingClientRect(); const headerRect = btn.closest('.tabs-header').getBoundingClientRect(); this.indicator.style.left = (rect.left - headerRect.left) + 'px'; this.indicator.style.width = rect.width + 'px'; }
      };

      const CartEngine = {
        init() {
          const btns = [elements.mainAddBtn, elements.stickyAddBtn].filter(Boolean);
          const addToCart = () => {
            if (stocDisponibil <= 0) return;
            if (btns[0]?.classList.contains('is-added')) { router.push('/cos'); return; }
            let cart = [];
            try { cart = JSON.parse(localStorage.getItem('ovifone_cart') || '[]'); } catch (e) {}
            const title = pData.nume;
            const variant = selectedStorageText + ' • ' + selectedColorText;
            const qtyDorita = parseInt(elements.qtyInput?.value) || 1;
            let qtyInCosDeja = 0;
            cart.forEach(item => { if (item.title === title && item.variant === variant) qtyInCosDeja = item.qty; });
            if (qtyInCosDeja + qtyDorita > stocDisponibil) { showNotification(`Nu poți adăuga. Ai deja ${qtyInCosDeja} în coș, iar stocul maxim este ${stocDisponibil}.`, true); return; }
            const price = basePrice + currentStorageMod;
            let found = false;
            cart.forEach(item => { if (item.title === title && item.variant === variant) { item.qty += qtyDorita; found = true; } });
            if (!found) cart.push({ title, price, variant, img: pData.imagine_url, qty: qtyDorita });
            localStorage.setItem('ovifone_cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            showNotification(`${qtyDorita} x ${title} adăugat în coș!`, false);
            btns.forEach(btn => btn.classList.add('is-adding'));
            setTimeout(() => { btns.forEach(btn => { btn.classList.remove('is-adding'); btn.classList.add('is-added'); btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" style="margin-right:8px;"><polyline points="20 6 9 17 4 12"/></svg>VEZI COȘUL`; }); }, 800);
          };
          btns.forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); createRipple(btn, e); addToCart(); }));
        }
      };

      const StickyBarEngine = {
        init() {
          if (!elements.mainAddBtn || !elements.stickyBar) return;
          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (!entry.isIntersecting && entry.boundingClientRect.top < 0) elements.stickyBar.classList.add('visible');
              else elements.stickyBar.classList.remove('visible');
            });
          }, { threshold: 0 });
          observer.observe(elements.mainAddBtn);
        }
      };

      const ScrollReveal = {
        init() {
          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (!entry.isIntersecting) return;
              const el = entry.target;
              if (el.classList.contains('rel-card')) setTimeout(() => { el.style.animationDelay = '0s'; el.classList.add('is-visible'); }, el.dataset.revealDelay || 0);
              else if (el.classList.contains('section-title') || el.classList.contains('tabs-section')) el.classList.add('is-visible');
              observer.unobserve(el);
            });
          }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
          document.querySelectorAll('.rel-card').forEach((card, i) => { card.dataset.revealDelay = i * 65; observer.observe(card); });
          const st = document.querySelector('.section-title'); if (st) observer.observe(st);
          const ts = document.querySelector('.tabs-section'); if (ts) observer.observe(ts);
        }
      };

      function initRelatedCards() {
        document.querySelectorAll('.rel-card').forEach(card => {
          const img = card.querySelector('img'); if (!img) return;
          card.addEventListener('mouseenter', () => { img.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)'; img.style.transform = 'scale(1.08) translateY(-4px)'; });
          card.addEventListener('mouseleave', () => { img.style.transform = ''; });
        });
      }

      function initFeatureHover() {
        document.querySelectorAll('.f-item').forEach(item => {
          const icon = item.querySelector('svg'); if (!icon) return;
          item.addEventListener('mouseenter', () => { icon.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)'; icon.style.transform = 'scale(1.3) rotate(-5deg)'; });
          item.addEventListener('mouseleave', () => { icon.style.transform = ''; });
        });
      }

      BadgeEngine.init(); GalleryEngine.init(); PricingEngine.init();
      PricingEngine.calculateAndRenderPrice(false); PricingEngine.updateStickyVariantText();
      QtyEngine.init(); TabsEngine.init(); CartEngine.init(); StickyBarEngine.init();
      setTimeout(() => { initRelatedCards(); initFeatureHover(); ScrollReveal.init(); }, 100);
    }

    init();
  }, []);

  return (
    <main className="main-content product-page-main">

      <div className="breadcrumb-container">
        <ul className="breadcrumbs">
          <li><a href="/">Acasă</a></li>
          <li><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6" /></svg></li>
          <li><a href="/telefoane">Telefoane</a></li>
          <li><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6" /></svg></li>
          <li className="current">Se încarcă...</li>
        </ul>
      </div>

      <section className="product-hero-section">
        <div className="product-grid-layout">
          <div className="product-gallery-area">
            <div className="main-image-wrapper">
              <img src="" alt="Se încarcă..." id="main-product-image" />
            </div>
            <div className="thumbnail-slider" id="thumbnail-slider-container">
              <button className="thumb-nav prev-thumb" id="gallery-prev-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="thumbnails-container" id="gallery-thumbnails"></div>
              <button className="thumb-nav next-thumb" id="gallery-next-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          <div className="product-info-area">
            <h1 className="p-title">Se încarcă...</h1>
            <div className="p-rating-row">
              <span className="stock-status in-stock">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="20 6 9 17 4 12" /></svg> În stoc
              </span>
            </div>
            <div className="p-pricing">
              <div className="price-main" id="dynamic-price"><span></span></div>
              <div className="price-old" id="dynamic-old-price" style={{ display: 'none' }}></div>
              <div className="price-save" style={{ display: 'none' }}></div>
            </div>
            <div className="p-options">
              <div className="options-top-row">
                <div className="option-group">
                  <div className="option-header"><span>Culoare: <strong id="selected-color-name">...</strong></span></div>
                  <div className="color-swatches" id="color-selector"></div>
                </div>
                <div className="option-group battery-group">
                  <div className="option-header" style={{ justifyContent: 'flex-end' }}><span>Sănătate baterie</span></div>
                  <div className="battery-pill">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
                      <line x1="22" y1="11" x2="22" y2="13" />
                      <rect x="4" y="9" width="12" height="6" fill="#34c759" stroke="none" />
                    </svg>
                    <span id="produs-baterie-valoare">...</span>
                  </div>
                </div>
              </div>
              <div className="option-group">
                <div className="option-header"><span>Capacitate stocare</span></div>
                <div className="boxes-selector" id="storage-selector"></div>
              </div>
            </div>
            <div className="p-action-area">
              <div className="qty-selector">
                <button className="qty-btn minus">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <input type="number" defaultValue="1" min="1" max="5" className="qty-input" id="qty-input" readOnly />
                <button className="qty-btn plus">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              </div>
              <button className="main-add-btn" id="main-add-cart">
                <svg className="cart-icon" fill="currentColor" viewBox="0 0 576 512" width="20" height="20"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>
                ADAUGĂ ÎN COȘ
              </button>
            </div>
            <div className="p-features-list">
              <div className="f-item">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>Garanție premium 12 luni inclusă</span>
              </div>
              <div className="f-item">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                <span>Livrare gratuită în 24-48 ore</span>
              </div>
              <div className="f-item">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.5" fill="none"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                <span>Retur gratuit în 14 zile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tabs-section">
        <div className="tabs-header">
          <button className="tab-btn active" data-tab="descriere">Descriere</button>
          <button className="tab-btn" data-tab="specificatii">Specificații Tehnice</button>
        </div>
        <div className="tabs-content-area">
          <div className="tab-panel active" id="tab-descriere"></div>
          <div className="tab-panel" id="tab-specificatii"></div>
        </div>
      </section>

      <section className="related-section">
        <div className="section-container">
          <h2 className="section-title">Produse Similare</h2>
          <div className="related-grid" id="dynamic-related-grid"></div>
        </div>
      </section>

      <div className="sticky-cart-bar" id="sticky-bar">
        <div className="sticky-container">
          <div className="sticky-info">
            <img src="" alt="" className="sticky-thumb" />
            <div className="s-text">
              <span className="s-title p-title">Se încarcă...</span>
              <span className="s-variant" id="sticky-variant">...</span>
            </div>
          </div>
          <div className="sticky-actions">
            <div className="s-price-wrap">
              <span className="s-price" id="sticky-price">...</span>
              <span className="s-old-price" id="sticky-old-price" style={{ display: 'none' }}></span>
            </div>
            <button className="main-add-btn small-btn" id="sticky-add-cart">
              <svg className="cart-icon" fill="currentColor" viewBox="0 0 576 512" width="16" height="16"><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" /></svg>
              ADAUGĂ ÎN COȘ
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}

export default function Produs() {
  return (
    <Suspense fallback={
      <main className="main-content product-page-main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
        <div style={{textAlign:'center'}}>
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" style={{animation:'spin 1s linear infinite',margin:'0 auto 16px'}}>
            <circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,.15)" strokeWidth="3"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="#f49201" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p style={{color:'#86868b',fontWeight:600}}>Se încarcă produsul...</p>
        </div>
      </main>
    }>
      <ProdusContent />
    </Suspense>
  );
}