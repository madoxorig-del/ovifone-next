'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVindeAnim, setIsVindeAnim] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [popularSearches, setPopularSearches] = useState([]);
  const searchInputRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const isVinde = pathname?.includes('vinde');
  const showToggle = pathname === '/' || pathname === '/vinde';

  const handleChevronClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.innerWidth > 1024) return;
    const li = e.currentTarget.closest('.has-mega-dropdown');
    if (li) {
      const wasOpen = li.classList.contains('mob-open');
      document.querySelectorAll('.has-mega-dropdown').forEach(el => el.classList.remove('mob-open'));
      if (!wasOpen) li.classList.add('mob-open');
    }
  };

  const handleChevronTouch = (e) => {
    e.preventDefault();
    handleChevronClick(e);
  };

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

  const getPopularSearches = useCallback(() => {
    try {
      const trends = JSON.parse(localStorage.getItem('ovi_search_trends') || '{}');
      const sorted = Object.entries(trends).sort((a, b) => b[1] - a[1]);
      const top3 = sorted.slice(0, 3).map(item => item[0]);
      return top3.length > 0 ? top3 : ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Căști Wireless'];
    } catch { return ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Căști Wireless']; }
  }, []);

  const openSearch = useCallback(() => {
    setPopularSearches(getPopularSearches());
    setSearchOpen(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [getPopularSearches]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    document.body.style.overflow = '';
  }, []);

  const executeSearch = useCallback((queryOverride) => {
    const query = (queryOverride || searchQuery).trim();
    if (query) {
      try {
        const trends = JSON.parse(localStorage.getItem('ovi_search_trends') || '{}');
        trends[query.toLowerCase()] = (trends[query.toLowerCase()] || 0) + 1;
        localStorage.setItem('ovi_search_trends', JSON.stringify(trends));
      } catch {}
      router.push('/cautare?search=' + encodeURIComponent(query));
      closeSearch();
    }
  }, [searchQuery, router, closeSearch]);

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
              <li className={`nav-item ${pathname === '/toate' ? 'is-active' : ''}`}>
                <Link href="/toate" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span>Toate Produsele</span>
                </Link>
              </li>
              <li className={`nav-item has-dropdown has-mega-dropdown ${pathname?.startsWith('/telefoane') ? 'is-active' : ''}`}>
                <div className="nav-link-row">
                  <Link href="/telefoane" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="5" y="2" width="14" height="20" rx="1"></rect><path d="M10 18h4"></path></svg>
                    <span>Telefoane</span>
                  </Link>
                  <button className="chevron-toggle" onClick={handleChevronClick} onTouchEnd={handleChevronTouch} aria-label="Deschide submeniu">
                    <svg className="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
                <div className="acc-dropdown">
                  <Link href="/telefoane?stare=Nou" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Telefoane Noi</span>
                  </Link>
                  <Link href="/telefoane?stare=SH" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    <span>Telefoane SH</span>
                  </Link>
                </div>
              </li>
              <li className={`nav-item has-dropdown has-mega-dropdown ${pathname?.startsWith('/tablete') ? 'is-active' : ''}`}>
                <div className="nav-link-row">
                  <Link href="/tablete" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><rect x="3" y="3" width="18" height="18" rx="1"></rect><path d="M10 19h4"></path></svg>
                    <span>Tablete</span>
                  </Link>
                  <button className="chevron-toggle" onClick={handleChevronClick} onTouchEnd={handleChevronTouch} aria-label="Deschide submeniu">
                    <svg className="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
                <div className="acc-dropdown">
                  <Link href="/tablete?stare=Nou" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Tablete Noi</span>
                  </Link>
                  <Link href="/tablete?stare=SH" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    <span>Tablete SH</span>
                  </Link>
                </div>
              </li>
              <li className={`nav-item has-dropdown has-mega-dropdown ${pathname?.startsWith('/casti') ? 'is-active' : ''}`}>
                <div className="nav-link-row">
                  <Link href="/casti" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M4 12v-2a8 8 0 0 1 16 0v2"></path><rect x="2" y="12" width="5" height="7"></rect><rect x="17" y="12" width="5" height="7"></rect></svg>
                    <span>Căști</span>
                  </Link>
                  <button className="chevron-toggle" onClick={handleChevronClick} onTouchEnd={handleChevronTouch} aria-label="Deschide submeniu">
                    <svg className="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
                <div className="acc-dropdown">
                  <Link href="/casti?conectivitate=wireless" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1"/></svg>
                    <span>Căști Wireless</span>
                  </Link>
                  <Link href="/casti?conectivitate=cu fir" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="2" y="15" width="5" height="6" rx="1"/><rect x="17" y="15" width="5" height="6" rx="1"/><path d="M12 21v-3"/></svg>
                    <span>Căști Cu fir</span>
                  </Link>
                </div>
              </li>
              <li className={`nav-item has-dropdown has-mega-dropdown ${pathname?.startsWith('/accesorii') ? 'is-active' : ''}`}>
                <div className="nav-link-row">
                  <Link href="/accesorii" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1v4"/><path d="M15 1v4"/><rect x="6" y="5" width="12" height="8" rx="2.5"/><path d="M12 13v7"/><rect x="10" y="20" width="4" height="3" rx="1"/></svg>
                    <span>Accesorii</span>
                  </Link>
                  <button className="chevron-toggle" onClick={handleChevronClick} onTouchEnd={handleChevronTouch} aria-label="Deschide submeniu">
                    <svg className="chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                </div>
                <div className="acc-dropdown">
                  <Link href="/accesorii?tip=adaptor" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M8 6h8"/><rect x="7" y="8" width="10" height="6" rx="2"/><path d="M9 14v4"/><path d="M15 14v4"/></svg>
                    <span>Adaptoare</span>
                  </Link>
                  <Link href="/accesorii?tip=incarcator" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3a2 2 0 01-2-2V8a2 2 0 012-2h3.19M15 6h2a2 2 0 012 2v8a2 2 0 01-2 2h-3.19"/><line x1="23" y1="13" x2="23" y2="11"/><polyline points="11 6 7 12 13 12 9 18"/></svg>
                    <span>Încărcătoare</span>
                  </Link>
                  <Link href="/accesorii?tip=cablu" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M8 6a4 4 0 004 4h0a4 4 0 004-4"/><path d="M12 10v8"/><circle cx="12" cy="20" r="2"/></svg>
                    <span>Cabluri</span>
                  </Link>
                  <Link href="/accesorii?tip=suport" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><rect x="4" y="15" width="16" height="6" rx="2"/></svg>
                    <span>Suporturi</span>
                  </Link>
                  <Link href="/accesorii?tip=powerbank" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="18" height="12" rx="2"/><line x1="22" y1="10" x2="22" y2="14"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="10" y1="10" x2="10" y2="14"/></svg>
                    <span>Baterii externe</span>
                  </Link>
                  <Link href="/cautare?search=card+memorie" className="acc-dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/></svg>
                    <span>Carduri Memorie</span>
                  </Link>
                </div>
              </li>
              <li className={`nav-item ${pathname?.startsWith('/huse') ? 'is-active' : ''}`}>
                <Link href="/huse" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="1" width="14" height="22" rx="3.5"/><rect x="12" y="3" width="5" height="5" rx="2"/></svg>
                  <span>Huse</span>
                </Link>
              </li>
              <li className={`nav-item ${pathname?.startsWith('/folii') ? 'is-active' : ''}`}>
                <Link href="/folii" className="nav-link btn-effect" onClick={() => setMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M6 4h8l-5 6H6V4z"/><path d="M14 4l-5 6"/></svg>
                  <span>Folii</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="trade-toggle-container">
            <div className={`trade-toggle-wrapper ${isVindeAnim ? 'is-vinde' : ''}`}>
              <div className="trade-slider-bg"></div>
              <a href="/" className={`trade-option ${!isVinde ? 'active' : ''}`} onClick={(e) => handleTradeClick(e, '/', false)}>
                <svg className="trade-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h2l3.6 10.6A2 2 0 0 0 10.5 15h8a2 2 0 0 0 1.9-1.4l2-6H6"></path><circle cx="10" cy="20" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none"></circle></svg>
                <span className="trade-text">Cumpără</span>
              </a>
              <a href="/vinde" className={`trade-option ${isVinde ? 'active' : ''}`} onClick={(e) => handleTradeClick(e, '/vinde', true)}>
                <svg className="trade-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
                <span className="trade-text">Vinde</span>
              </a>
            </div>
            <form className="mobile-search-inline" onSubmit={(e) => { e.preventDefault(); const q = e.target.querySelector('input').value.trim(); if(q) router.push(`/cautare?search=${encodeURIComponent(q)}`); }}>
              <input type="text" className="mobile-search-input" placeholder="Ce te interesează?" autoComplete="off" />
              <button type="submit" className="mobile-search-btn" aria-label="Caută">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><circle cx="10" cy="10" r="7"></circle><path d="M21 21l-6-6"></path></svg>
              </button>
            </form>
          </div>

          <div className="nav-actions">
            <button className="action-btn search-btn" aria-label="Cautare" onClick={openSearch}>
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

      <div className={`overlay-modal ${searchOpen ? 'is-active' : ''}`} id="search-modal" onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
        <div className="modal-content">
          <button className="close-btn" aria-label="Inchide" onClick={closeSearch}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="search-form-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Caută produse, categorii..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeSearch();
                if (e.key === 'Escape') closeSearch();
              }}
            />
            <button className="search-submit" onClick={() => executeSearch()}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
          <div className="search-suggestions" id="dynamic-search-suggestions">
            {searchOpen && (
              <>
                <span className="suggestion-title">Căutări populare:</span>
                {popularSearches.map((term) => (
                  <button
                    type="button"
                    className="suggestion-tag"
                    key={term}
                    onClick={() => executeSearch(term)}
                  >
                    {term.charAt(0).toUpperCase() + term.slice(1)}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}