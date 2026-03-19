'use client';
import './contact.css';

export default function Contact() {
  return (
    <main className="contact-main">
      <div className="contact-card">
        <h1 className="contact-title">Ai o<br /><span>întrebare?</span></h1>

        <p className="contact-desc">
          Pentru orice întrebare sau nelămurire nu ezita să ne<br />
          contactezi la numărul de mai jos sau direct in locație.
        </p>

        <div className="contact-grid">
          <div className="c-item">
            <h3>Locație</h3>
            <p>București,<br />Bulevardul Iuliu Maniu 73</p>
          </div>
          <div className="c-item">
            <h3>Mail</h3>
            <p><a href="mailto:contact@ovifone.ro">contact@ovifone.ro</a></p>
          </div>
          <div className="c-item">
            <h3>Telefon</h3>
            <p><a href="tel:+40738700777">+40 738 700 777</a></p>
          </div>
        </div>

        <div className="social-row">
          <a href="https://www.tiktok.com/@ovifone.ro" target="_blank" rel="noopener noreferrer" className="soc-btn" aria-label="TikTok">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
          </a>
          <a href="https://www.instagram.com/ovifone.ro/" target="_blank" rel="noopener noreferrer" className="soc-btn" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://www.facebook.com/p/OviFone-61570584362315/" target="_blank" rel="noopener noreferrer" className="soc-btn" aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </div>
      </div>
    </main>
  );
}
