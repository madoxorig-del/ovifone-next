'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVindeAnim, setIsVindeAnim] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isVinde = pathname?.includes('vinde');
  const showToggle = pathname === '/' || pathname === '/vinde';

  useEffect(() => {
    setIsVindeAnim(window.location.pathname.includes('vinde'));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  useEffect(() => {
    const searchBtn = document.querySelector('.search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeBtn = document.querySelector('.close-btn');
    const searchInput = document.querySelector('.search-input');
    const searchSubmitBtn = document.querySelector('.search-submit');
    const suggestionsContainer = document.getElementById('dynamic-search-suggestions');

    if (!searchBtn || !searchModal) return;

    const updatePopularSearches = () => {
      if (!suggestionsContainer) return;
      let trends = JSON.parse(localStorage.getItem('ovi_search_trends') || '{}');
      let sortedTrends = Object.entries(trends).sort((a, b) => b[1] - a[1]);
      let top3 = sortedTrends.slice(0, 3).map(item => item[0]);
      if (top3.length === 0) top3 = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Căști Wireless'];
      let html = '<span class="suggestion-title">Căutări populare:</span>';
      top3.forEach(term => {
        const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);
        html += `<button type="button" class="suggestion-tag">${displayTerm}</button>`;
      });
      suggestionsContainer.innerHTML = html;
    };

    const openSearch = () => {
      updatePopularSearches();
      searchModal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput?.focus(), 100);
    };

    const closeSearch = () => {
      searchModal.classList.remove('is-active');
      document.body.style.overflow = '';
      if (searchInput) searchInput.value = '';
    };

    const executeSearch = () => {
      const query = searchInput?.value.trim();
      if (query) {
        let trends = JSON.parse(localStorage.getItem('ovi_search_trends') || '{}');
        trends[query.toLowerCase()] = (trends[query.toLowerCase()] || 0) + 1;
        localStorage.setItem('ovi_search_trends', JSON.stringify(trends));
        router.push('/cautare?search=' + encodeURIComponent(query));
        closeSearch();
      }
    };

    searchBtn.addEventListener('click', openSearch);
    closeBtn?.addEventListener('click', closeSearch);
    searchSubmitBtn?.addEventListener('click', executeSearch);
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
      if (e.key === 'Escape') closeSearch();
    });
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
      const tag = e.target.closest('.suggestion-tag');
      if (tag) { searchInput.value = tag.textContent.trim(); executeSearch(); }
    });

    return () => searchBtn.removeEventListener('click', openSearch);
  }, []);

  const handleTradeClick = (e, href, goingToVinde) => {
    e.preventDefault();
    if (goingToVinde === isVinde) return;
    setIsVindeAnim(goingToVinde);
    setTimeout(() => router.push(href), 520);
  };

  return (
    <>
      <nav
        id="global-nav"
        className={`global-nav ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}
        data-show-toggle={showToggle ? '1' : '0'}
      >
        <div className="nav-container">

          <div className="nav-brand" style={{display:'flex',alignItems:'center',height:'100%'}}>
            <Link href="/" style={{display:'flex',alignItems:'center',textDecoration:'none'}}>
              <img src="/img/logo3.png" alt="Ovifone Logo" style={{height:'48px',width:'auto',maxWidth:'200px',objectFit:'contain'}} />
            </Link>
          </div>

          <div className="nav-menu-wrapper" id="nav-menu-wrapper">
            <ul className="nav-menu">
              <li className="nav-item">
                <Link href="/toate" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span>Toate Produsele</span>
                </Link>
              </li>
              <li className="nav-item has-dropdown">
                <Link href="/telefoane" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="5" y="2" width="14" height="20" rx="1"></rect><path d="M10 18h4"></path></svg>
                  <span>Telefoane</span>
                  <svg className="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </Link>
              </li>
              <li className="nav-item has-dropdown">
                <Link href="/tablete" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="18" height="18" rx="1"></rect><path d="M10 19h4"></path></svg>
                  <span>Tablete</span>
                  <svg className="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </Link>
              </li>
              <li className="nav-item has-dropdown">
                <Link href="/casti" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M4 12v-2a8 8 0 0 1 16 0v2"></path><rect x="2" y="12" width="5" height="7"></rect><rect x="17" y="12" width="5" height="7"></rect></svg>
                  <span>Căști</span>
                  <svg className="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </Link>
              </li>
              <li className="nav-item has-dropdown">
                <Link href="/accesorii" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M8 10V3h8v7"></path><path d="M12 10v11"></path><path d="M8 21h8"></path></svg>
                  <span>Accesorii</span>
                  <svg className="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/huse" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z"></path></svg>
                  <span>Huse</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/folii" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="4" y="4" width="16" height="16"></rect><path d="M4 8h16"></path></svg>
                  <span>Folii</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="trade-toggle-container">
            <div className={`trade-toggle-wrapper ${isVindeAnim ? 'is-vinde' : ''}`}>
              <div className="trade-slider-bg"></div>
              <a href="/" className={`trade-option ${!isVinde ? 'active' : ''}`} onClick={(e) => handleTradeClick(e, '/', false)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l3.6 10.6A2 2 0 0 0 10.5 15h8a2 2 0 0 0 1.9-1.4l2-6H6"></path><circle cx="10" cy="20" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none"></circle></svg>
                <span className="trade-text">Cumpără</span>
              </a>
              <a href="/vinde" className={`trade-option ${isVinde ? 'active' : ''}`} onClick={(e) => handleTradeClick(e, '/vinde', true)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
                <span className="trade-text">Vinde</span>
              </a>
            </div>
          </div>

          <div className="nav-actions">
            <button className="action-btn search-btn" aria-label="Cautare">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="10" cy="10" r="7"></circle><path d="M21 21l-6-6"></path></svg>
            </button>
            <Link href="/cont" className="action-btn profile-btn" aria-label="Cont utilizator">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-7 8-7s8 3 8 7"></path></svg>
            </Link>
            <Link href="/cos" className="action-btn cart-btn" aria-label="Cos de cumparaturi" style={{textDecoration:'none',position:'relative'}}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M3 3h2l3.6 10.6A2 2 0 0 0 10.5 15h8a2 2 0 0 0 1.9-1.4l2-6H6"></path><circle cx="10" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle></svg>
              <span className="cart-badge" style={{display:'none'}}>0</span>
            </Link>
            <button className="action-btn menu-toggle" aria-label="Meniu" onClick={() => setMenuOpen(!menuOpen)} style={{border:'none',background:'transparent',boxShadow:'none'}}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
          </div>

        </div>
      </nav>

      <div className="overlay-modal" id="search-modal">
        <div className="modal-content">
          <button className="close-btn" aria-label="Inchide">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="search-form-wrapper">
            <input type="text" className="search-input" placeholder="Caută produse, categorii..." />
            <button className="search-submit">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
          <div className="search-suggestions" id="dynamic-search-suggestions"></div>
        </div>
      </div>
    </>
  );
}