class OvifoneNav extends HTMLElement {
  connectedCallback() {
    const b = this.getAttribute('base') || './';
    
    // Citim automat in ce pagina se afla vizitatorul
    const currentPath = window.location.pathname.toLowerCase();
    const isVinde = currentPath.includes('vinde');
    const pageName = currentPath.split('/').pop() || '';
    const showToggle = (
        pageName === '' || 
        pageName === 'index.html' || 
        pageName === 'vinde.html' ||
        pageName === 'vinde' ||
        currentPath.endsWith('/vinde/') ||
        currentPath.endsWith('/vinde') ||
        isVinde
    );
    
    // Setam clasele active automat
    const buyActive = isVinde ? '' : 'active';
    const sellActive = isVinde ? 'active' : '';

    this.innerHTML = `
      <style>
        /* ═══════════════════════════════════════════════
           OVIFONE NAVBAR — PROFI DARK (OFF-BLACK)
           ═══════════════════════════════════════════════ */

        #global-nav {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            height: 70px !important; 
            background: rgba(18, 18, 20, 0.98) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
            z-index: 9999 !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            transition: all 0.3s ease !important;
        }

        #global-nav.is-scrolled {
            background: rgba(14, 14, 16, 0.98) !important; 
            box-shadow: 0 6px 25px rgba(0,0,0,0.6) !important;
        }

        .nav-container {
            max-width: 1400px !important;
            margin: 0 auto !important;
            height: 70px !important;
            padding: 0 28px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 16px !important;
        }

        .nav-link {
            color: rgba(255, 255, 255, 0.75) !important; 
            font-size: 14px !important;
            font-weight: 600 !important;
            padding: 8px 4px !important;
            margin: 0 10px !important;
            border-radius: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            position: relative !important;
            transition: color 0.3s ease !important;
            text-decoration: none !important;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px; left: 0;
            width: 100%; height: 2px;
            background: #D4941C;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .nav-link:hover { color: #ffffff !important; background: transparent !important; }
        .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }
        
        .nav-link svg { 
            stroke: rgba(255,255,255,0.6) !important; 
            transition: all 0.3s !important; 
        }
        .nav-link:hover svg { 
            stroke: #D4941C !important; 
            transform: translateY(-2px); 
        }
        .chevron { opacity: 0.5 !important; }

        .action-btn {
            width: 42px !important; height: 42px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 8px !important; 
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.3s ease !important;
            cursor: pointer !important;
        }
        .action-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: #D4941C !important;
            transform: translateY(-2px) !important;
        }
        .action-btn svg { stroke: #ffffff !important; transition: stroke 0.3s ease !important;}
        .action-btn:hover svg { stroke: #D4941C !important; }
        
        .cart-badge { background: #D4941C !important; border: 2px solid #121214 !important; color: #fff !important; }

        .menu-toggle { display: none !important; }
        .hamburger-inner, .hamburger-inner::before, .hamburger-inner::after {
            background-color: #ffffff !important; 
            border-radius: 0 !important; 
        }

        /* ─── TRADE TOGGLE DESKTOP ─── */
        .trade-toggle-container { 
            margin-left: auto !important; 
            margin-right: 24px !important; 
            display: flex !important; 
            align-items: center !important; 
        }
        .trade-toggle-wrapper {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 100px !important; 
            padding: 4px !important;
            width: 240px !important; 
            position: relative !important; 
            display: flex !important; 
            align-items: center !important; 
            overflow: hidden !important;
            box-sizing: border-box !important;
        }
        .trade-slider-bg {
            position: absolute !important; 
            left: 4px !important; 
            top: 4px !important; 
            width: calc(50% - 4px) !important; 
            height: calc(100% - 8px) !important;
            background: linear-gradient(135deg, #D4941C, #E8B340) !important; 
            border-radius: 100px !important;
            box-shadow: 0 2px 8px rgba(212,148,28,0.4) !important;
            transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 1 !important; 
            pointer-events: none !important;
            box-sizing: border-box !important;
        }
        /* Starea finală - pe vinde slider e la dreapta */
        .trade-toggle-wrapper.is-vinde .trade-slider-bg { transform: translateX(100%) !important; }
        /* Animatie la load: pe vinde porneste din stanga si se duce la dreapta */
        .trade-toggle-wrapper.is-vinde .trade-slider-bg.animate-in { 
            animation: slideToVinde 0.6s cubic-bezier(0.25,1,0.5,1) forwards !important;
        }
        /* Animatie la load: pe cumpara porneste din dreapta si se duce la stanga */
        .trade-toggle-wrapper:not(.is-vinde) .trade-slider-bg.animate-in {
            animation: slideToCumpara 0.6s cubic-bezier(0.25,1,0.5,1) forwards !important;
        }
        @keyframes slideToVinde {
            from { transform: translateX(0); }
            to   { transform: translateX(100%); }
        }
        @keyframes slideToCumpara {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
        }
        .trade-option {
            position: relative !important; 
            z-index: 2 !important; 
            padding: 8px 0 !important;
            font-size: 13px !important; 
            font-weight: 700 !important;
            color: rgba(255,255,255,0.5) !important; 
            border-radius: 100px !important;
            display: flex !important; 
            align-items: center !important; 
            justify-content: center !important; 
            flex: 1 1 0px !important; 
            width: 50% !important; 
            gap: 6px !important;
            transition: color 0.3s ease !important; 
            cursor: pointer !important; 
            text-decoration: none !important;
            box-sizing: border-box !important;
        }
        .trade-option:hover { color: #ffffff !important; }
        .trade-option.active { color: #fff !important; } 

        /* ═══ TABLET & MOBIL ═══ */
        @media (max-width: 1200px) {
            .menu-toggle { display: flex !important; }

            .trade-toggle-container {
                position: absolute !important; top: 70px !important; left: 0 !important;
                width: 100% !important; height: 60px !important;
                background: rgba(18, 18, 20, 0.98) !important;
                border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                margin: 0 !important; justify-content: center !important; z-index: 10001 !important;
            }
            #global-nav.is-scrolled .trade-toggle-container { /* rămâne vizibil și la scroll */ }

            .nav-menu-wrapper {
                position: fixed !important; top: 130px !important; left: 0 !important; width: 100% !important; height: calc(100vh - 130px) !important;
                background: #ffffff !important; 
                padding: 30px 24px 100px !important; overflow-y: auto !important;
                opacity: 0 !important; visibility: hidden !important; transition: opacity 0.3s ease, visibility 0.3s !important; z-index: 10000 !important;
            }
            #global-nav.is-scrolled .nav-menu-wrapper { top: 70px !important; height: calc(100vh - 70px) !important; }
            #global-nav.menu-open .nav-menu-wrapper { opacity: 1 !important; visibility: visible !important; }

            .nav-menu { flex-direction: column !important; align-items: flex-start !important; width: 100% !important; gap: 0 !important; }
            
            .nav-link {
                width: 100% !important; font-size: 20px !important; font-weight: 800 !important;
                padding: 20px 0 !important; margin: 0 !important;
                border-bottom: 1px solid rgba(0,0,0,0.08) !important;
                color: #111 !important; 
                background: transparent !important; transform: translateY(16px) !important; opacity: 0 !important;
                transition: transform 0.3s ease, opacity 0.3s ease, color 0.2s ease, padding 0.3s ease !important;
            }
            .nav-link::after { display: none !important; } 
            #global-nav.menu-open .nav-link { transform: translateY(0) !important; opacity: 1 !important; color: #111 !important; }
            .nav-link:hover { color: #D4941C !important; padding-left: 12px !important; } 
            
            .nav-link svg:not(.chevron) { width: 24px !important; height: 24px !important; stroke: #D4941C !important; opacity: 1 !important; }
            .chevron { margin-left: auto !important; stroke: #999 !important; }
            
            #global-nav.menu-open .nav-item:nth-child(1) .nav-link { transition-delay: 0.04s !important; }
            #global-nav.menu-open .nav-item:nth-child(2) .nav-link { transition-delay: 0.08s !important; }
            #global-nav.menu-open .nav-item:nth-child(3) .nav-link { transition-delay: 0.12s !important; }
            #global-nav.menu-open .nav-item:nth-child(4) .nav-link { transition-delay: 0.16s !important; }
            #global-nav.menu-open .nav-item:nth-child(5) .nav-link { transition-delay: 0.20s !important; }
            #global-nav.menu-open .nav-item:nth-child(6) .nav-link { transition-delay: 0.24s !important; }
            #global-nav.menu-open .nav-item:nth-child(7) .nav-link { transition-delay: 0.28s !important; }

            #global-nav.menu-open { 
                background: rgba(18, 18, 20, 1) !important; 
                border-bottom: 1px solid rgba(255,255,255,0.05) !important; 
            }
            #global-nav.menu-open .hamburger-inner,
            #global-nav.menu-open .hamburger-inner::before,
            #global-nav.menu-open .hamburger-inner::after { 
                background-color: #ffffff !important; 
            }
        }

        /* ═══ MOBIL (< 768px) FIX ABSOLUT SIMETRIE + SCROLL ═══ */
        @media (max-width: 768px) {
            .menu-toggle { display: flex !important; }

            #global-nav { 
                height: 64px !important; 
                transition: height 0.3s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s ease !important;
            }
            .nav-container { height: 64px !important; padding: 0 14px !important; }
            .nav-brand img { height: 40px !important; }
            .action-btn { width: 36px !important; height: 36px !important; border-radius: 8px !important; }
            .nav-actions { gap: 6px !important; }
            .action-btn svg { width: 17px !important; height: 17px !important; }

            .trade-toggle-container { display: none !important; }

            /* ─── DOAR pe index + vinde: navbar rămâne mărit mereu ─── */
            #global-nav[data-show-toggle="1"] {
                height: 118px !important;
            }
            #global-nav[data-show-toggle="1"].is-scrolled {
                height: 124px !important; /* Rămâne extins — userul poate comuta oricând */
            }

            #global-nav[data-show-toggle="1"] .nav-container {
                height: 100% !important;
                display: flex !important;
                align-items: flex-start !important; 
                position: relative !important;
                padding-top: 0 !important;
            }
            
            #global-nav[data-show-toggle="1"] .nav-brand,
            #global-nav[data-show-toggle="1"] .nav-actions {
                height: 64px !important; 
            }

            #global-nav[data-show-toggle="1"] .nav-actions {
                margin-left: auto !important; 
            }

            /* Cutia invizibilă care ține pastila */
            #global-nav[data-show-toggle="1"] .trade-toggle-container {
                display: flex !important;
                position: absolute !important;
                top: 64px !important; 
                left: 0 !important; 
                width: 100% !important;
                height: 54px !important; 
                background: rgba(18, 18, 20, 0.98) !important;
                border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                justify-content: center !important; 
                align-items: center !important; 
                padding: 0 16px !important; 
                z-index: 2 !important;
                transition: opacity 0.25s ease, transform 0.3s ease !important;
                transform: translateY(0) !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            /* Toggle se ascunde la scroll în jos, apare când vii sus */
            #global-nav[data-show-toggle="1"].is-scrolled .trade-toggle-container {
                opacity: 0 !important;
                transform: translateY(-10px) !important;
                pointer-events: none !important;
            }
            #global-nav[data-show-toggle="1"].is-scrolled {
                height: 64px !important;
            }
            /* PASTILA PROPRIU-ZISĂ */
            .trade-toggle-wrapper {
                background: rgba(255,255,255,0.06) !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                border-radius: 100px !important;
                width: 100% !important;
                max-width: 320px !important;
                height: 46px !important; 
                margin: 0 auto !important; 
                padding: 4px !important; 
                box-sizing: border-box !important;
            }
            .trade-slider-bg {
                width: calc(50% - 4px) !important; 
                height: calc(100% - 8px) !important;
                left: 4px !important;
                top: 4px !important;
                box-shadow: 0 1px 6px rgba(212,148,28,0.35) !important;
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
                box-sizing: border-box !important;
                border-radius: 100px !important;
                background: linear-gradient(135deg, #D4941C, #E8B340) !important;
            }
            .trade-option {
                flex: 1 1 0px !important; 
                width: 50% !important;
                height: 100% !important;
                justify-content: center !important;
                align-items: center !important;
                padding: 0 !important; 
                font-size: 14px !important; 
                box-sizing: border-box !important;
            }
            .trade-option svg { width: 16px !important; height: 16px !important; stroke: currentColor !important; }

            /* Meniu Overlay pe Mobil - Când se deschide */
            .nav-menu-wrapper {
                position: fixed !important; top: 64px !important; left: 0 !important;
                width: 100% !important; height: calc(100vh - 64px) !important;
                background: #ffffff !important; padding: 30px 24px 100px !important;
                overflow-y: auto !important; opacity: 0 !important; visibility: hidden !important;
                transition: opacity 0.3s ease, visibility 0.3s !important; z-index: 10000 !important;
            }
            
            #global-nav[data-show-toggle="1"] .nav-menu-wrapper { 
                top: 118px !important; 
                height: calc(100vh - 118px) !important; 
            }
            #global-nav[data-show-toggle="1"].is-scrolled .nav-menu-wrapper { 
                top: 64px !important; 
                height: calc(100vh - 64px) !important; 
            }

            #global-nav.menu-open .nav-menu-wrapper { opacity: 1 !important; visibility: visible !important; }

            .nav-menu { flex-direction: column !important; align-items: flex-start !important; width: 100% !important; gap: 0 !important; }
            .nav-link { width: 100% !important; font-size: 20px !important; font-weight: 800 !important; padding: 20px 0 !important; margin: 0 !important; border-bottom: 1px solid rgba(0,0,0,0.08) !important; color: #111 !important; background: transparent !important; transform: translateY(16px) !important; opacity: 0 !important; transition: transform 0.3s ease, opacity 0.3s ease, color 0.2s ease, padding 0.3s ease !important; }
            .nav-link::after { display: none !important; }
            #global-nav.menu-open .nav-link { transform: translateY(0) !important; opacity: 1 !important; color: #111 !important; }
            .nav-link:hover { color: #D4941C !important; padding-left: 12px !important; }
            .nav-link svg:not(.chevron) { width: 24px !important; height: 24px !important; stroke: #D4941C !important; opacity: 1 !important; }
            .chevron { margin-left: auto !important; stroke: #999 !important; }
            #global-nav.menu-open .nav-item:nth-child(1) .nav-link { transition-delay: 0.04s !important; }
            #global-nav.menu-open .nav-item:nth-child(2) .nav-link { transition-delay: 0.08s !important; }
            #global-nav.menu-open .nav-item:nth-child(3) .nav-link { transition-delay: 0.12s !important; }
            #global-nav.menu-open .nav-item:nth-child(4) .nav-link { transition-delay: 0.16s !important; }
            #global-nav.menu-open .nav-item:nth-child(5) .nav-link { transition-delay: 0.20s !important; }
            #global-nav.menu-open .nav-item:nth-child(6) .nav-link { transition-delay: 0.24s !important; }
            #global-nav.menu-open .nav-item:nth-child(7) .nav-link { transition-delay: 0.28s !important; }
            #global-nav.menu-open { background: rgba(18,18,20,1) !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
            #global-nav.menu-open .hamburger-inner, #global-nav.menu-open .hamburger-inner::before, #global-nav.menu-open .hamburger-inner::after { background-color: #ffffff !important; }
        }

        /* ─── PADDING SUB NAVBAR — TOATE PAGINILE, TOATE ECRANELE ─── */

        /* DESKTOP — navbar 70px, fără spațiu extra pe paginile normale */
        .main-content, .vinde-main, main {
            padding-top: 70px !important;
        }

        /* MOBIL fără toggle — navbar 64px */
        @media (max-width: 768px) {
            .main-content, .vinde-main, main {
                padding-top: 64px !important; 
            }
        }

        /* MOBIL cu toggle (index + vinde) — navbar 124px */
        ${showToggle ? `
        @media (max-width: 768px) {
            .main-content, .vinde-main, main {
                padding-top: 118px !important; 
            }
        }
        ` : ''}

        /* EXTRA SPATIU (+40px) doar pe paginile vinde și cos */
        ${(currentPath.includes('vinde') || currentPath.includes('cos') || currentPath.includes('checkout')) ? `
        .main-content, .vinde-main, main {
            padding-top: 110px !important;
        }
        @media (max-width: 768px) {
            .main-content, .vinde-main, main {
                padding-top: ${showToggle ? '152px' : '104px'} !important;
            }
        }
        ` : ''}
      </style>

      <nav class="global-nav" id="global-nav"${showToggle ? ' data-show-toggle="1"' : ''}>
        <div class="nav-container">
            <div class="nav-brand" style="display: flex; align-items: center; height: 100%;">
                <a href="${b}index.html" style="display: flex; align-items: center; text-decoration: none;">
                    <img src="${b}img/logo3.png" alt="Ovifone Logo" style="height: 48px; width: auto; max-width: 200px; object-fit: contain; margin: 0; padding: 0; image-rendering: high-quality; transform: translateZ(0); backface-visibility: hidden;">
                </a>
            </div>
            
            <div class="nav-menu-wrapper" id="nav-menu-wrapper">
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="${b}toate/toate.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            <span>Toate Produsele</span>
                        </a>
                    </li>
                    <li class="nav-item has-dropdown">
                        <a href="${b}telefoane/telefoane.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="5" y="2" width="14" height="20" rx="1"></rect><path d="M10 18h4"></path></svg>
                            <span>Telefoane</span>
                            <svg class="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </a>
                    </li>
                    <li class="nav-item has-dropdown">
                        <a href="${b}tablete/tablete.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="3" y="3" width="18" height="18" rx="1"></rect><path d="M10 19h4"></path></svg>
                            <span>Tablete</span>
                            <svg class="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </a>
                    </li>
                    <li class="nav-item has-dropdown">
                        <a href="${b}casti/casti.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M4 12v-2a8 8 0 0 1 16 0v2"></path><rect x="2" y="12" width="5" height="7"></rect><rect x="17" y="12" width="5" height="7"></rect></svg>
                            <span>Căști</span>
                            <svg class="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </a>
                    </li>
                    <li class="nav-item has-dropdown">
                        <a href="${b}accesorii/accesorii.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M8 10V3h8v7"></path><path d="M12 10v11"></path><path d="M8 21h8"></path></svg>
                            <span>Accesorii</span>
                            <svg class="chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="${b}huse/huse.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6l-9-4z"></path></svg>
                            <span>Huse</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="${b}folii/folii.html" class="nav-link btn-effect">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="4" y="4" width="16" height="16"></rect><path d="M4 8h16"></path></svg>
                            <span>Folii</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="trade-toggle-container">
                <div class="trade-toggle-wrapper ${isVinde ? 'is-vinde' : ''}">
                    <div class="trade-slider-bg"></div>
                    <a href="${b}index.html" class="trade-option ${buyActive}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l3.6 10.6A2 2 0 0 0 10.5 15h8a2 2 0 0 0 1.9-1.4l2-6H6"></path><circle cx="10" cy="20" r="1.5" fill="currentColor" stroke="none"></circle><circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none"></circle></svg>
                        <span class="trade-text">Cumpără</span>
                    </a>
                    <a href="${b}vinde/vinde.html" class="trade-option ${sellActive}">
                         <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>
                        <span class="trade-text">Vinde</span>
                    </a>
                </div>
            </div>

            <div class="nav-actions">
                <button class="action-btn search-btn" aria-label="Cautare">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><circle cx="10" cy="10" r="7"></circle><path d="M21 21l-6-6"></path></svg>
                </button>
                
                <a href="${b}cont/cont.html" class="action-btn profile-btn" aria-label="Cont utilizator">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 4-7 8-7s8 3 8 7"></path></svg>
                </a>

                <a href="${b}cos/cos.html" class="action-btn cart-btn" aria-label="Cos de cumparaturi" style="text-decoration: none; position: relative;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><path d="M3 3h2l3.6 10.6A2 2 0 0 0 10.5 15h8a2 2 0 0 0 1.9-1.4l2-6H6"></path><circle cx="10" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle></svg>
                    <span class="cart-badge" style="display: none;">0</span>
                </a>
                
                <button class="action-btn menu-toggle" aria-label="Meniu" style="border: none; background: transparent; box-shadow: none;">
                    <span class="hamburger-box">
                        <span class="hamburger-inner"></span>
                    </span>
                </button>
            </div>
        </div>
      </nav>

      <div class="overlay-modal" id="search-modal">
        <div class="modal-content">
            <button class="close-btn" aria-label="Inchide">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div class="search-form-wrapper">
                <input type="text" class="search-input" placeholder="Caută produse, categorii...">
                <button class="search-submit">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </div>
            
            <div class="search-suggestions" id="dynamic-search-suggestions">
                </div>
            
        </div>
      </div>
    `;

    // ─── ANIMATIE TOGGLE CUMPĂRĂ/VINDE ───
    const initToggle = () => {
      const slider = this.querySelector('.trade-slider-bg');
      const toggleWrapper = this.querySelector('.trade-toggle-wrapper');
      const tradeOptions = this.querySelectorAll('.trade-option');
      if (!slider || !toggleWrapper) return;

      // Click — animează și navighează
      tradeOptions.forEach((option) => {
        option.addEventListener('click', (e) => {
          if (option.classList.contains('active')) return;
          e.preventDefault();
          const dest = option.getAttribute('href');
          const goingToVinde = dest && dest.includes('vinde');
          if (goingToVinde) {
            toggleWrapper.classList.add('is-vinde');
          } else {
            toggleWrapper.classList.remove('is-vinde');
          }
          setTimeout(() => { window.location.href = dest; }, 520);
        });
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initToggle);
    } else {
      initToggle();
    }

    // Pe mobil, ascunde toggle-ul când dai scroll în jos și arată-l când vii sus
    if (showToggle && window.innerWidth <= 768) {
      const nav = this.querySelector('#global-nav');
      let lastScroll = 0;
      let raf = null;
      window.addEventListener('scroll', () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const current = window.scrollY;
          if (current > 50) {
            nav?.classList.add('is-scrolled');
          } else {
            nav?.classList.remove('is-scrolled');
          }
          lastScroll = current;
          raf = null;
        });
      }, { passive: true });
    }
  }
}

customElements.define('ovifone-nav', OvifoneNav);