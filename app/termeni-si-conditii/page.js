'use client';
import { useEffect, useRef } from 'react';
import './termeni.css';

export default function TermeniSiConditii() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Fix sticky: override overflow-x hidden on body
    document.body.classList.add('termeni-page');

    // 1. Reveal animations
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
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Scroll spy
    const sections = document.querySelectorAll('.l-section');
    const navLinks = document.querySelectorAll('.ls-nav a');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const id = entry.target.getAttribute('id');
          const activeLink = document.querySelector(`.ls-nav a[href="#${id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-120px 0px -60% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    // 3. Smooth scroll on sidebar click
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
      });
    });

    return () => {
      document.body.classList.remove('termeni-page');
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <main className="legal-main">
      <header className="legal-header" data-reveal="true">
        <div className="lh-container">
          <div className="lh-badge">Legal</div>
          <h1 className="lh-title">Termeni și Condiții</h1>
          <p className="lh-subtitle">Ultima actualizare: <strong>30 noiembrie 2025</strong></p>
        </div>
      </header>

      <div className="legal-layout">
        <aside className="legal-sidebar" data-reveal="true" data-delay="100">
          <div className="ls-sticky">
            <h4 className="ls-title">Cuprins</h4>
            <nav className="ls-nav">
              <a href="#intro" className="active">Introducere</a>
              <a href="#sec-1">1. Informații generale</a>
              <a href="#sec-2">2. Utilizarea site-ului</a>
              <a href="#sec-3">3. Produse și prețuri</a>
              <a href="#sec-4">4. Comenzi și plăți</a>
              <a href="#sec-5">5. Livrare</a>
              <a href="#sec-6">6. Returnări și rambursări</a>
              <a href="#sec-7">7. Garanție și responsabilitate</a>
              <a href="#sec-8">8. Politica de confidențialitate</a>
              <a href="#sec-9">9. Drepturi și obligații</a>
              <a href="#sec-10">10. Modificarea Termenilor</a>
              <a href="#sec-11">11. Legea aplicabilă</a>
            </nav>
          </div>
        </aside>

        <article className="legal-content">
          <section id="intro" className="l-section" data-reveal="true" data-delay="150">
            <p className="lead-text">Bine ați venit pe site-ul Ovifone (https://www.ovifone.ro). Prin accesarea și utilizarea acestui site, sunteți de acord să respectați următorii termeni și condiții. Vă rugăm să citiți cu atenție înainte de a folosi site-ul nostru.</p>
          </section>

          <section id="sec-1" className="l-section" data-reveal="true">
            <h2>1. Informații generale</h2>
            <ul className="l-list">
              <li>Ovifone este operatorul site-ului și magazinului online.</li>
              <li>Adresa noastră web: <a href="https://www.ovifone.ro" className="l-link">https://www.ovifone.ro</a></li>
              <li>Contact: <a href="mailto:contact@ovifone.ro" className="l-link">contact@ovifone.ro</a></li>
            </ul>
          </section>

          <section id="sec-2" className="l-section" data-reveal="true">
            <h2>2. Utilizarea site-ului</h2>
            <ul className="l-list">
              <li>Site-ul este destinat persoanelor fizice și juridice care doresc să achiziționeze telefoane noi sau folosite.</li>
              <li>Nu aveți voie să utilizați site-ul în scopuri ilegale sau pentru a încălca drepturile altor persoane.</li>
              <li>Toate informațiile și materialele de pe site sunt protejate prin drepturi de autor și nu pot fi copiate sau distribuite fără acordul nostru.</li>
            </ul>
          </section>

          <section id="sec-3" className="l-section" data-reveal="true">
            <h2>3. Produse și prețuri</h2>
            <ul className="l-list">
              <li>Toate produsele afișate pe site sunt reale și disponibile, dar stocul poate varia.</li>
              <li>Prețurile includ TVA, dar nu includ eventualele taxe de livrare, care vor fi afișate la finalizarea comenzii.</li>
              <li>Ne rezervăm dreptul de a modifica prețurile sau descrierile produselor fără notificare prealabilă.</li>
            </ul>
          </section>

          <section id="sec-4" className="l-section" data-reveal="true">
            <h2>4. Comenzi și plăți</h2>
            <ul className="l-list">
              <li>Comenzile sunt procesate după confirmarea plății.</li>
              <li>Acceptăm plăți prin procesatori terți (PayPal, card, transfer bancar).</li>
              <li>Datele dvs. de plată sunt procesate de terți securizați și nu sunt stocate pe serverul nostru.</li>
            </ul>
          </section>

          <section id="sec-5" className="l-section" data-reveal="true">
            <h2>5. Livrare</h2>
            <ul className="l-list">
              <li>Produsele vor fi livrate la adresa indicată de client.</li>
              <li>Termenele de livrare sunt orientative și pot varia în funcție de disponibilitatea produsului și de curier.</li>
              <li>Costurile de livrare vor fi afișate la finalizarea comenzii.</li>
            </ul>
          </section>

          <section id="sec-6" className="l-section" data-reveal="true">
            <h2>6. Returnări și rambursări</h2>
            <ul className="l-list">
              <li>Aveți dreptul de a returna produsele în termen de 14 zile calendaristice de la primire, conform legislației în vigoare.</li>
              <li>Produsele returnate trebuie să fie în stare originală, cu ambalajul intact.</li>
              <li>Rambursarea se va face în termen de 14 zile de la primirea produsului returnat, folosind aceeași metodă de plată utilizată la comandă.</li>
            </ul>
          </section>

          <section id="sec-7" className="l-section" data-reveal="true">
            <h2>7. Garanție și responsabilitate</h2>
            <ul className="l-list">
              <li>Telefoanele noi și folosite beneficiază de garanția oferită de producător sau de Ovifone, după caz.</li>
              <li>Ovifone nu răspunde pentru daune cauzate de utilizarea necorespunzătoare a produselor.</li>
            </ul>
          </section>

          <section id="sec-8" className="l-section" data-reveal="true">
            <h2>8. Politica de confidențialitate și cookie-uri</h2>
            <ul className="l-list">
              <li>Datele dvs. personale sunt protejate conform Politicii de Confidențialitate și Politicii de Cookie-uri publicate pe site.</li>
              <li>Folosirea site-ului implică acceptul dvs. pentru colectarea și procesarea datelor conform acestor politici.</li>
            </ul>
          </section>

          <section id="sec-9" className="l-section" data-reveal="true">
            <h2>9. Drepturi și obligații</h2>
            <ul className="l-list">
              <li>Ovifone are dreptul de a refuza comenzi în cazuri de suspiciune de fraudă sau neconcordanțe în date.</li>
              <li>Clienții trebuie să furnizeze informații corecte și complete la plasarea comenzii.</li>
            </ul>
          </section>

          <section id="sec-10" className="l-section" data-reveal="true">
            <h2>10. Modificarea Termenilor și Condițiilor</h2>
            <ul className="l-list">
              <li>Ne rezervăm dreptul de a modifica acești Termeni și Condiții oricând.</li>
              <li>Orice modificare va fi publicată pe această pagină, iar continuarea utilizării site-ului constituie acceptul dvs. pentru noii termeni.</li>
            </ul>
          </section>

          <section id="sec-11" className="l-section" data-reveal="true">
            <h2>11. Legea aplicabilă</h2>
            <ul className="l-list">
              <li>Acești termeni și condiții sunt guvernați de legea română.</li>
              <li>Orice dispută va fi soluționată de instanțele competente din România.</li>
            </ul>
          </section>

          <div className="legal-contact" data-reveal="true">
            <h3>Ai întrebări?</h3>
            <p>Pentru întrebări legate de Termeni și Condiții, ne poți contacta la adresa de email: <br />
              <a href="mailto:contact@ovifone.ro" className="l-link-bold">contact@ovifone.ro</a></p>
          </div>
        </article>
      </div>
    </main>
  );
}
