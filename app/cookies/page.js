'use client';
import './cookies.css';

export default function Cookies() {
  return (
    <main className="legal-main">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Politică de utilizare a Cookie-urilor</h1>
          <p className="last-updated">Ultima actualizare: 27 februarie 2026</p>
        </div>
        <div className="legal-content">
          <p>Această politică explică modul în care Ovifone folosește cookie-urile și tehnologiile similare pentru a te recunoaște atunci când vizitezi site-ul nostru web (<a href="https://www.ovifone.ro">https://www.ovifone.ro</a>). Explică ce sunt aceste tehnologii și de ce le folosim, precum și drepturile tale de a controla utilizarea lor.</p>

          <h2>Ce sunt cookie-urile?</h2>
          <p>Cookie-urile sunt fișiere text mici care sunt descărcate pe computerul sau dispozitivul tău mobil atunci când vizitezi un site web. Ele sunt utilizate pe scară largă pentru a face site-urile să funcționeze sau să funcționeze mai eficient, precum și pentru a oferi informații proprietarilor site-ului.</p>
          <p>Pe lângă cookie-urile tradiționale, folosim și tehnologii similare, cum ar fi <strong>Local Storage</strong> (Stocare Locală), care ne permite să salvăm informații (precum produsele din coșul tău) direct în browser-ul tău pentru a face experiența de cumpărare mult mai rapidă.</p>

          <h2>De ce folosim cookie-uri?</h2>
          <p>Folosim cookie-uri și stocare locală pentru mai multe motive. Unele sunt necesare din motive tehnice pentru ca site-ul nostru să funcționeze, iar pe acestea le numim „esențiale" sau „strict necesare". Alte cookie-uri ne permit să urmărim și să vizăm interesele utilizatorilor noștri pentru a le îmbunătăți experiența pe site.</p>

          <h2>Tipurile de tehnologii pe care le folosim:</h2>

          <h3>1. Cookie-uri strict necesare (Esențiale)</h3>
          <p>Acestea sunt vitale pentru ca site-ul nostru să funcționeze și nu pot fi oprite în sistemele noastre. Ele sunt setate doar ca răspuns la acțiunile tale, cum ar fi setarea preferințelor de confidențialitate, logarea în cont sau adăugarea produselor în coș.</p>
          <ul>
            <li><strong>Sesiunea de autentificare (Supabase):</strong> Păstrează starea ta de logare activă, astfel încât să nu fii nevoit să introduci parola pe fiecare pagină.</li>
            <li><strong>Coșul de cumpărături (ovifone_cart):</strong> Folosim memoria locală a browser-ului pentru a reține ce telefoane sau accesorii ai adăugat în coș, chiar dacă închizi pagina și revii mai târziu.</li>
          </ul>

          <h3>2. Cookie-uri de Performanță și Analiză</h3>
          <p>Aceste cookie-uri ne permit să numărăm vizitele și sursele de trafic, astfel încât să putem măsura și îmbunătăți performanța site-ului nostru. Ne ajută să știm ce pagini sunt cele mai populare (ex: pagina unui anumit iPhone) și să vedem cum se mișcă vizitatorii pe site.</p>

          <h3>3. Cookie-uri de Marketing (Publicitate)</h3>
          <p>Aceste cookie-uri pot fi setate prin intermediul site-ului nostru de către partenerii noștri de publicitate (cum ar fi Facebook Pixel sau Google Ads). Ele pot fi folosite de acele companii pentru a crea un profil al intereselor tale și pentru a-ți afișa reclame relevante pe alte site-uri.</p>

          <h2>Cookie-uri ale terțelor părți</h2>
          <p>În unele cazuri speciale, folosim și cookie-uri furnizate de terțe părți de încredere:</p>
          <ul>
            <li><strong>Procesatorii de plăți:</strong> Când ajungi la finalizarea comenzii, procesatorul nostru securizat de plăți (ex: Stripe, Netopia) poate plasa cookie-uri pentru a procesa și valida tranzacția în siguranță.</li>
            <li><strong>Google Analytics:</strong> Una dintre cele mai răspândite soluții de analiză de pe web, pentru a ne ajuta să înțelegem cum folosești site-ul.</li>
          </ul>

          <h2>Cum poți controla cookie-urile?</h2>
          <p>Ai dreptul să decizi dacă accepți sau respingi cookie-urile. Poți seta sau modifica setările browser-ului tău web pentru a accepta sau refuza cookie-urile. Dacă alegi să refuzi cookie-urile, poți utiliza în continuare site-ul nostru, deși accesul la unele funcționalități (cum ar fi salvarea coșului de cumpărături sau contul de client) poate fi restricționat.</p>
          <p>Pentru a afla cum poți gestiona cookie-urile din browser-ul tău, poți accesa paginile de ajutor oficiale ale acestora:</p>
          <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.apple.com/ro-ro/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
            <li><a href="https://support.mozilla.org/ro/kb/protec%C8%9Bia-%C3%AEmbun%C4%83t%C4%83%C8%9Bit%C4%83-%C3%AEmpotriva-urm%C4%83ririi-%C3%AEn-firefox-pentru-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.microsoft.com/ro-ro/windows/%C8%99tergerea-%C8%99i-gestionarea-modulelor-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
          </ul>

          <h2>Actualizări ale acestei politici</h2>
          <p>Este posibil să actualizăm această Politică de Cookies din când în când, pentru a reflecta, de exemplu, schimbările aduse cookie-urilor pe care le folosim sau din alte motive operaționale, legale sau de reglementare. Te rugăm să revizitezi regulat această pagină.</p>

          <h2>Contact</h2>
          <p>Dacă ai întrebări despre modul în care folosim cookie-urile, ne poți contacta la adresa de email: <a href="mailto:contact@ovifone.ro">contact@ovifone.ro</a>.</p>
        </div>
      </div>
    </main>
  );
}
