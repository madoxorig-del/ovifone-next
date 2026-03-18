class OvifoneFooter extends HTMLElement {
  connectedCallback() {
    // Preia calea de baza (ex: "../" sau "./")
    const b = this.getAttribute('base') || './';

    this.innerHTML = `
      <footer class="global-footer">
        <div class="footer-container">
            <div class="footer-directory">
                <div class="footer-column brand-column">
                    <img src="${b}img/logo2.PNG" alt="Ovifone Logo" style="height: 110px; width: 170px;">
                    <p class="brand-desc">Vindem, cumpărăm și facem buy back pentru iPhone-uri și nu numai!<br>Oferte speciale te așteaptă!</p>
                    <div class="social-links">
    <a href="https://www.tiktok.com/@ovifone.ro" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
    </a>
    <a href="https://www.instagram.com/ovifone.ro/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    </a>
    <a href="https://www.facebook.com/p/OviFone-61570584362315/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
    </a>
</div>
                </div>
                
                <div class="footer-column">
                    <h4 class="footer-col-title">DESPRE OVIFONE</h4>
                    <ul class="footer-links">
                        <li><a href="${b}contact/contact.html">Contact</a></li>
                        <li><a href="${b}index.html#cine-suntem">Cine suntem</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4 class="footer-col-title">LINK-URI UTILE</h4>
                    <ul class="footer-links">
                        <li><a href="${b}cont/cont.html">Contul meu</a></li>
                        <li><a href="${b}termeni-si-conditii/termeni.html">Termeni și condiții</a></li>
                        <li><a href="${b}contact/contact.html">Contact</a></li>
                        <li><a href="${b}contact/contact.html">Suport</a></li>
                        <li><a href="${b}cookies/cookies.html">Politica Cookies</a></li>
                        <li><a href="${b}politica/politica.html">Prelucrarea datelor cu caracter personal</a></li>
                        <li><a href="https://anpc.ro/" target="_blank">SOL</a></li>
                    </ul>
                </div>

                <div class="footer-column payments-column">
                    <div class="payment-methods">
                        <span class="pay-icon visa">VISA</span>
                        <svg viewBox="0 0 36 24" width="36" height="24" class="pay-icon mastercard"><circle cx="12" cy="12" r="10" fill="#eb001b" opacity="0.9"></circle><circle cx="24" cy="12" r="10" fill="#f79e1b" opacity="0.9"></circle></svg>
                    </div>
                    <div class="legal-badges">
                        <a href="https://ec.europa.eu/consumers/odr" target="_blank" class="badge-link">SOLUȚIONAREA ONLINE A LITIGIILOR</a>
                        <a href="https://anpc.ro/ce-este-sal/" target="_blank" class="badge-link">ANPC - SOLUȚIONAREA ALTERNATIVĂ A LITIGIILOR</a>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-copyright">
                    <p>© 2026 Ovifone.ro – All rights reserved</p>
                </div>
                <div class="footer-developer">
                    <p>Developed by AS</p>
                </div>
            </div>
        </div>
      </footer>
    `;
  }
}

// Inregistram componenta HTML personalizata!
customElements.define('ovifone-footer', OvifoneFooter);