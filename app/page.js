'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {

  useEffect(() => {
    // REVEAL ANIMATIONS
    const revealElements = document.querySelectorAll('[data-reveal="true"]');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-delay') || 0;
          setTimeout(() => el.classList.add('is-revealed'), parseInt(delay));
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // NAVBAR SCROLL
    const globalNav = document.getElementById('global-nav');
    const onScroll = () => {
      globalNav?.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // CAROUSEL
    const track = document.getElementById('phones-track');
    const btnPrev = document.querySelector('.prev-btn');
    const btnNext = document.querySelector('.next-btn');

    const loadPhones = async () => {
      if (!track) return;
      try {
        const { data: telefoane, error } = await supabase
          .from('produse')
          .select('*')
          .eq('categorie', 'telefoane')
          .limit(8);

        if (error) throw error;

        if (telefoane && telefoane.length > 0) {
          track.innerHTML = telefoane.map((tel, index) => {
            let badgeHtml = '';
            if (tel.pret_vechi && tel.pret_vechi > tel.pret) {
              const reducere = Math.round(tel.pret_vechi - tel.pret).toLocaleString('ro-RO');
              badgeHtml = `<div class="discount-badge">-${reducere} Lei</div>`;
            } else if (index === 0 || index === 2) {
              badgeHtml = `<div class="corner-ribbon nou">Nou!</div>`;
            }
            const pretFormatat = tel.pret ? tel.pret.toLocaleString('ro-RO') + ' lei' : '';
            const pretVechiFormatat = tel.pret_vechi ? tel.pret_vechi.toLocaleString('ro-RO') + ' lei' : '';
            return `
              <div class="premium-card">
                <a href="/telefoane/produs?id=${tel.id}" class="premium-card-inner" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%;">
                  ${badgeHtml}
                  <div class="premium-media"><img src="${tel.imagine_url}" alt="${tel.nume}" loading="lazy"></div>
                  <div class="premium-info">
                    <h3 class="premium-name">${tel.nume}</h3>
                    <div class="premium-pricing">
                      <span class="price-current">${pretFormatat}</span>
                      ${tel.pret_vechi && tel.pret_vechi > tel.pret ? `<span class="price-old">${pretVechiFormatat}</span>` : ''}
                    </div>
                  </div>
                </a>
              </div>`;
          }).join('');
        } else {
          track.innerHTML = `<p style="padding:20px;color:#86868b;text-align:center;width:100%;">Nu există telefoane în stoc momentan.</p>`;
        }
      } catch (err) {
        track.innerHTML = `<p style="padding:20px;color:red;">Eroare la încărcarea produselor.</p>`;
      }

      if (btnPrev && btnNext) {
        let scrollAmount = 320;
        let autoPlayTimer;
        const moveNext = () => {
          const maxScrollLeft = track.scrollWidth - track.clientWidth;
          if (track.scrollLeft >= maxScrollLeft - 10) track.scrollTo({ left: 0, behavior: 'smooth' });
          else track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };
        const startPlay = () => { autoPlayTimer = setInterval(moveNext, 2500); };
        const stopPlay = () => clearInterval(autoPlayTimer);

        btnNext.addEventListener('click', () => { stopPlay(); moveNext(); startPlay(); });
        btnPrev.addEventListener('click', () => { stopPlay(); track.scrollBy({ left: -scrollAmount, behavior: 'smooth' }); startPlay(); });
        track.addEventListener('mouseenter', stopPlay);
        track.addEventListener('mouseleave', startPlay);
        startPlay();
      }
    };

    loadPhones();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="main-content">

      {/* HERO */}
      <section className="hero-tech-original" id="hero">
        <div className="hero-bg-accents">
          <div className="accent-glow orange-glow"></div>
          <div className="grid-pattern"></div>
        </div>
        <div className="hero-tech-container">
          <div className="hero-tech-content" data-reveal="true">
            <div className="tech-badge">
              <span className="tech-dot"></span>
              <span className="tech-badge-text">Telefoane Verificate</span>
            </div>
            <h1 className="tech-title">
              Telefoane de top. <br/>
              Prețuri <span className="text-orange-solid">inteligente.</span>
            </h1>
            <p className="tech-subtitle">Descoperă selecția noastră de iPhone-uri și telefoane de ultimă generație, testate riguros. Fără riscuri, cu garanție 12 luni și prețuri mult mai accesibile.</p>
            <div className="tech-actions">
              <a href="#best-sellers" className="btn-tech-primary">
                <span>Vezi Ofertele</span>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
              <a href="#informatii" className="btn-tech-secondary">Află detalii</a>
            </div>
            <div className="tech-mini-trust">
              <span><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> 12 Luni Garanție</span>
              <span><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg> Verificare IMEI</span>
            </div>
          </div>

          <div className="hero-tech-visual" data-reveal="true" data-delay="150">
            <div className="css-detailed-phone">
              <div className="phone-frame">
                <div className="phone-notch"><div className="camera-lens"></div></div>
                <div className="phone-screen-ui">
                  <div className="ui-top-bar">
                    <span className="time">09:41</span>
                    <div className="battery-icon"></div>
                  </div>
                  <div className="ui-header-text">
                    <div className="ui-line long"></div>
                    <div className="ui-line short"></div>
                  </div>
                  <div className="ui-feature-card">
                    <div className="card-img-placeholder"><div className="img-circle"></div></div>
                    <div className="card-text-area">
                      <div className="ui-line thick"></div>
                      <div className="ui-line thin"></div>
                    </div>
                    <div className="card-btn"></div>
                  </div>
                  <div className="ui-grid">
                    <div className="grid-item"></div>
                    <div className="grid-item"></div>
                    <div className="grid-item"></div>
                    <div className="grid-item"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="tech-panel-glass">
              <div className="glass-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="#e35b00" strokeWidth="2.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div className="glass-info">
                <span className="glass-title">Testat 100%</span>
                <span className="glass-desc">Fără defecte ascunse</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar" id="trust">
        <div className="trust-container">
          <div className="trust-grid">
            <div className="trust-item" data-reveal="true" data-delay="100">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
              <div className="trust-text"><span className="trust-title">Garanție</span><span className="trust-desc">12 luni</span></div>
            </div>
            <div className="trust-item" data-reveal="true" data-delay="200">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><circle cx="9" cy="9" r="0.5"></circle><circle cx="15" cy="15" r="0.5"></circle></svg></div>
              <div className="trust-text"><span className="trust-title">Cu până la 50%</span><span className="trust-desc">mai ieftin</span></div>
            </div>
            <div className="trust-item" data-reveal="true" data-delay="300">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
              <div className="trust-text"><span className="trust-title">Produse testate</span><span className="trust-desc">și verificate</span></div>
            </div>
            <div className="trust-item" data-reveal="true" data-delay="400">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></div>
              <div className="trust-text"><span className="trust-title">Telefoane</span><span className="trust-desc">Ne-recondiționate</span></div>
            </div>
          </div>
          {/* Duplicate pentru carousel infinit pe mobil */}
          <div className="trust-grid trust-grid-clone" aria-hidden="true">
            <div className="trust-item">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
              <div className="trust-text"><span className="trust-title">Garanție</span><span className="trust-desc">12 luni</span></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><circle cx="9" cy="9" r="0.5"></circle><circle cx="15" cy="15" r="0.5"></circle></svg></div>
              <div className="trust-text"><span className="trust-title">Cu până la 50%</span><span className="trust-desc">mai ieftin</span></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
              <div className="trust-text"><span className="trust-title">Produse testate</span><span className="trust-desc">și verificate</span></div>
            </div>
            <div className="trust-item">
              <div className="trust-icon"><svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></div>
              <div className="trust-text"><span className="trust-title">Telefoane</span><span className="trust-desc">Ne-recondiționate</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="product-section" id="best-sellers">
        <div className="section-container">
          <div className="section-header" data-reveal="true">
            <h2 className="section-heading">Cele mai vândute telefoane</h2>
            <span className="section-heading-line"></span>
          </div>
          <div className="carousel-container">
            <button className="carousel-btn prev-btn" aria-label="Inapoi">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div className="product-track" id="phones-track">
              <p style={{padding:'20px',color:'#86868b',textAlign:'center',width:'100%'}}>Se încarcă cele mai noi oferte...</p>
            </div>
            <button className="carousel-btn next-btn" aria-label="Inainte">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          {/* MAI MULTE PRODUSE */}
          <div className="see-more-wrap">
            <a href="/telefoane" className="btn-descopera">
              <span>Toate telefoanele</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORII */}
      <section className="category-section on-dark" id="phone-brands">
        <div className="section-container">
          <div className="section-header" data-reveal="true">
            <h2 className="section-heading">Categoriile noastre</h2>
            <span className="section-heading-line"></span>
          </div>
          <div className="bento-grid-3">
            <a href="/cautare?search=Apple" className="bento-card bento-dark" data-reveal="true" data-delay="100">
              <div className="bento-content"><h3 className="bento-title">Apple</h3><span className="bento-link">Descoperă <span>→</span></span></div>
              <div className="bento-img-wrap right-bottom"><img src="/img/iphone3.webp" alt="Apple" loading="lazy" /></div>
            </a>
            <a href="/cautare?search=Samsung" className="bento-card bento-light" data-reveal="true" data-delay="200">
              <div className="bento-content"><h3 className="bento-title">Samsung</h3><span className="bento-link">Descoperă <span>→</span></span></div>
              <div className="bento-img-wrap right-bottom"><img src="/img/telefon2.webp" alt="Samsung" loading="lazy" /></div>
            </a>
            <a href="/cautare?search=Altele" className="bento-card bento-light" data-reveal="true" data-delay="300">
              <div className="bento-content"><h3 className="bento-title">Altele</h3><span className="bento-link">Descoperă <span>→</span></span></div>
              <div className="bento-img-wrap right-bottom"><img src="/img/pixel.PNG" alt="Altele" loading="lazy" /></div>
            </a>
          </div>
        </div>
      </section>

      {/* ACCESORII */}
      <section className="category-section accessories-area on-dark" id="accessories-cats">
        <div className="section-container">
          <div className="section-header" data-reveal="true">
            <h2 className="section-heading">Accesorii esențiale</h2>
            <span className="section-heading-line"></span>
          </div>
          <div className="bento-grid-5">
            <a href="/cautare?search=Incarcatoare" className="bento-card bento-light span-3" data-reveal="true" data-delay="100">
              <div className="bento-content"><h3 className="bento-title">Încărcătoare</h3><span className="bento-link">Vezi oferte <span>→</span></span></div>
              <div className="bento-img-wrap right-center"><img src="/img/incarcator.webp" alt="Incarcatoare" loading="lazy" /></div>
            </a>
            <a href="/cautare?search=Huse" className="bento-card bento-light span-3" data-reveal="true" data-delay="150">
              <div className="bento-content"><h3 className="bento-title">Huse</h3><span className="bento-link">Vezi oferte <span>→</span></span></div>
              <div className="bento-img-wrap right-center"><img src="https://cdn-ultra.esempla.com/storage/webp/dcc8157f-74e3-4d47-9618-27925fab04bb.webp" alt="Huse" loading="lazy" /></div>
            </a>
            <a href="/cautare?search=Casti" className="bento-card bento-light span-2" data-reveal="true" data-delay="200">
              <div className="bento-content"><h3 className="bento-title">Căști</h3></div>
              <div className="bento-img-wrap center-bottom"><img src="https://istore.md/media/3467/conversions/1_1695736110293-preview-webp.webp" alt="Casti" loading="lazy" /></div>
            </a>
            <a href="/cautare?search=Baterii" className="bento-card bento-light span-2" data-reveal="true" data-delay="250">
              <div className="bento-content"><h3 className="bento-title">Baterii externe</h3></div>
              <div className="bento-img-wrap center-bottom"><img src="https://cdn-ultra.esempla.com/storage/webp/fd655029-3e2e-4b0a-85f3-9f11894b92fb.webp" alt="Baterii" loading="lazy" /></div>
            </a>
            <a href="/cautare?search=Suport" className="bento-card bento-light span-2" data-reveal="true" data-delay="300">
              <div className="bento-content"><h3 className="bento-title">Suporturi</h3></div>
              <div className="bento-img-wrap center-bottom"><img src="/img/suport.PNG" alt="Suport" loading="lazy" /></div>
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT BANNERS */}
      {/* PROCES */}
      <section className="process-section" id="cine-suntem">
        <div className="process-inner">
          <div className="process-header" data-reveal="true">
            <span className="process-eyebrow">Cum funcționează</span>
            <h2 className="process-title">De la evaluare<br/>până la <em>garanție</em></h2>
            <p className="process-subtitle">Fiecare telefon trece printr-un proces riguros înainte să ajungă la tine.</p>
          </div>
          <div className="process-steps">
            <div className="process-step" data-reveal="true" data-delay="100">
              <div className="ps-number">01</div>
              <div className="ps-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <div className="ps-content">
                <h3 className="ps-title">Evaluare</h3>
                <p className="ps-desc">Inspecție completă fizică și funcțională — baterie, ecran, cameră, senzori.</p>
              </div>
              <div className="ps-connector"><svg viewBox="0 0 40 16" width="40" height="16" fill="none"><path d="M0 8 Q20 2 40 8" stroke="rgba(227,91,0,0.3)" strokeWidth="1.5" strokeDasharray="4 3"/></svg></div>
            </div>
            <div className="process-step" data-reveal="true" data-delay="200">
              <div className="ps-number">02</div>
              <div className="ps-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
              </div>
              <div className="ps-content">
                <h3 className="ps-title">Verificare IMEI</h3>
                <p className="ps-desc">Controlăm istoricul complet — nicio blocaj, nicio problemă ascunsă, origine confirmată.</p>
              </div>
              <div className="ps-connector"><svg viewBox="0 0 40 16" width="40" height="16" fill="none"><path d="M0 8 Q20 2 40 8" stroke="rgba(227,91,0,0.3)" strokeWidth="1.5" strokeDasharray="4 3"/></svg></div>
            </div>
            <div className="process-step" data-reveal="true" data-delay="300">
              <div className="ps-number">03</div>
              <div className="ps-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div className="ps-content">
                <h3 className="ps-title">Recondiționare</h3>
                <p className="ps-desc">Curățat, resetat și configurat la setări fabrică. Arată și funcționează ca nou.</p>
              </div>
              <div className="ps-connector"><svg viewBox="0 0 40 16" width="40" height="16" fill="none"><path d="M0 8 Q20 2 40 8" stroke="rgba(227,91,0,0.3)" strokeWidth="1.5" strokeDasharray="4 3"/></svg></div>
            </div>
            <div className="process-step ps-last" data-reveal="true" data-delay="400">
              <div className="ps-number">04</div>
              <div className="ps-icon-wrap ps-icon-accent">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div className="ps-content">
                <h3 className="ps-title">Livrare + Garanție</h3>
                <p className="ps-desc">Primit rapid, cu 12 luni garanție inclusă și suport dedicat post-vânzare.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFO */}
      <section className="info-section" id="informatii">
        <div className="section-container">
          <div className="section-header" data-reveal="true">
            <h2 className="section-heading">Informații</h2>
            <span className="section-heading-line"></span>
          </div>
          <div className="info-grid">
            <div className="info-card" data-reveal="true" data-delay="100">
              <div className="info-media"><img src="https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&q=80&w=600&h=400" alt="Provenienta" loading="lazy" /></div>
              <div className="info-content">
                <h3 className="info-title">Proveniența telefoanelor</h3>
                <p className="info-desc">Toate iPhone-urile noastre provin exclusiv din surse verificate: buy-back propriu, furnizori autorizați și parteneri de încredere. Fiecare telefon este testat riguros și verificat IMEI.</p>
              </div>
            </div>
            <div className="info-card" data-reveal="true" data-delay="200">
              <div className="info-media"><img src="https://www.digimap.co.id/cdn/shop/files/2026_DG_Digitrade_Landing-01.jpg?v=1761186242&width=600" alt="BuyBack" loading="lazy" /></div>
              <div className="info-content">
                <h3 className="info-title">Cum funcționează sistemul de BuyBack</h3>
                <p className="info-desc">Adu iPhone-ul vechi, îl evaluăm pe loc, iar tu plătești doar diferența pentru un model nou. Proces rapid, transparent și fără bătăi de cap.</p>
              </div>
            </div>
            <div className="info-card" data-reveal="true" data-delay="300">
              <div className="info-media"><img src="https://wisetekstore.com/cdn/shop/articles/Refurbished_iPhone_c3f25026-472d-4934-8da7-50537e067d80.png?v=1753960873&width=600" alt="Telefon utilizat" loading="lazy" /></div>
              <div className="info-content">
                <h3 className="info-title">De ce merită să alegi un telefon utilizat</h3>
                <p className="info-desc">Primești un iPhone verificat, la un preț mult mai bun cu până la 50% reducere, fără compromisuri în performanță.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner-section">
        <div className="cta-banner-inner">
          <div className="cta-banner-text" data-reveal="true">
            <span className="cta-tag">Consultanță gratuită</span>
            <h2 className="cta-banner-title">Ai întrebări despre un telefon?</h2>
            <p className="cta-banner-sub">Suntem la un apel distanță. Îți explicăm tot, fără presiune.</p>
          </div>
          <div className="cta-banner-actions" data-reveal="true" data-delay="150">
            <a href="tel:+40738700777" className="cta-btn-call">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 11.91 19.79 19.79 0 0 1 1.04 3.24 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>+40 738 700 777</span>
            </a>
            <a href="#best-sellers" className="cta-btn-browse">Vezi toate telefoanele →</a>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="location-section" id="contact">
        <div className="section-container">
          <div className="location-grid">
            <div className="location-map" data-reveal="true">
              <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d45583.58052778867!2d26.010925!3d44.4337!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b2010eb9efce81%3A0x68b1a8e1ff36f835!2sOviFone!5e0!3m2!1sen!2sus!4v1771696506103!5m2!1sen!2sus" width="600" height="450" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div className="location-details" data-reveal="true" data-delay="200">
              <h2 className="location-title">Vino să ne vizitezi în magazinul OviFone, pe Bulevardul Iuliu Maniu 73, București!</h2>
              <p className="location-desc">Vindem, cumpărăm și facem buy back pentru iPhone-uri și nu numai. Oferte speciale te așteaptă, cu produse testate și prețuri avantajoase.</p>
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <span className="contact-text"><strong>Bucuresti, Bulevardul Iuliu Maniu 73</strong></span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <span className="contact-text"><strong>+40 738 700 777</strong></span>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <span className="contact-text"><strong>contact@ovifone.ro</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}