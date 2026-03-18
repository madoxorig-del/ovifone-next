import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="footer-container">

        <div className="footer-directory">

          {/* Coloana Brand */}
          <div className="footer-column brand-column">
            <img src="/img/logo2.PNG" alt="Ovifone Logo" style={{ height: '110px', width: '170px' }} />
            <p className="brand-desc">
              Vindem, cumpărăm și facem buy back pentru iPhone-uri și nu numai!<br />
              Oferte speciale te așteaptă!
            </p>
            <div className="social-links">
              <a href="https://www.tiktok.com/@ovifone.ro" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/ovifone.ro/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://www.facebook.com/p/OviFone-61570584362315/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Coloana Despre */}
          <div className="footer-column">
            <h4 className="footer-col-title">DESPRE OVIFONE</h4>
            <ul className="footer-links">
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/#cine-suntem">Cine suntem</Link></li>
            </ul>
          </div>

          {/* Coloana Link-uri utile */}
          <div className="footer-column">
            <h4 className="footer-col-title">LINK-URI UTILE</h4>
            <ul className="footer-links">
              <li><Link href="/cont">Contul meu</Link></li>
              <li><Link href="/termeni-si-conditii">Termeni și condiții</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/contact">Suport</Link></li>
              <li><Link href="/cookies">Politica Cookies</Link></li>
              <li><Link href="/politica">Prelucrarea datelor cu caracter personal</Link></li>
              <li><a href="https://anpc.ro/" target="_blank" rel="noopener noreferrer">SOL</a></li>
            </ul>
          </div>

          {/* Coloana Plăți & Legal */}
          <div className="footer-column payments-column">
            <div className="payment-methods">
              <span className="pay-icon visa">VISA</span>
              <svg viewBox="0 0 36 24" width="36" height="24" className="pay-icon mastercard">
                <circle cx="12" cy="12" r="10" fill="#eb001b" opacity="0.9" />
                <circle cx="24" cy="12" r="10" fill="#f79e1b" opacity="0.9" />
              </svg>
            </div>
            <div className="legal-badges">
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="badge-link">
                SOLUȚIONAREA ONLINE A LITIGIILOR
              </a>
              <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer" className="badge-link">
                ANPC - SOLUȚIONAREA ALTERNATIVĂ A LITIGIILOR
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© 2026 Ovifone.ro – All rights reserved</p>
          </div>
          <div className="footer-developer">
            <p>Developed by AS</p>
          </div>
        </div>

      </div>
    </footer>
  );
}