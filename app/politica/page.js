'use client';
import './politica.css';

export default function Politica() {
  return (
    <main className="legal-main">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Politică de confidențialitate</h1>
          <p className="last-updated">Ultima actualizare: 30 noiembrie 2025</p>
        </div>
        <div className="legal-content">
          <p>Această Politică de Confidențialitate explică modul în care colectăm, utilizăm și protejăm informațiile personale ale vizitatorilor și clienților pe site-ul nostru Ovifone (<a href="https://www.ovifone.ro">https://www.ovifone.ro</a>).</p>

          <h2>Cine suntem</h2>
          <p>Site-ul nostru se numește Ovifone și adresa web este: <a href="https://www.ovifone.ro">https://www.ovifone.ro</a></p>

          <h2>Informațiile pe care le colectăm</h2>

          <h3>Comentarii</h3>
          <p>Când vizitatorii lasă comentarii pe site, colectăm datele afișate în formularul de comentarii, precum și adresa IP și informațiile despre browser pentru a preveni spamul.</p>
          <p>O versiune anonimă a adresei de email (hash) poate fi transmisă serviciului Gravatar pentru a verifica dacă folosiți Gravatar. Politica de confidențialitate Gravatar este disponibilă aici: <a href="https://automattic.com/privacy/" target="_blank" rel="noopener noreferrer">https://automattic.com/privacy/</a>.</p>
          <p>După aprobarea comentariului, poza de profil poate fi vizibilă public în contextul comentariului.</p>

          <h3>Media</h3>
          <p>Dacă încărcați imagini pe site, evitați să includeți date de localizare în EXIF GPS. Vizitatorii pot descărca și extrage datele din imaginile publicate.</p>

          <h3>Cookie-uri</h3>
          <ul>
            <li>Dacă lăsați un comentariu, puteți salva numele, adresa de email și website-ul în cookie-uri pentru comoditate. Aceste cookie-uri expiră după un an.</li>
            <li>Dacă accesați pagina de autentificare, setăm un cookie temporar pentru a verifica dacă browser-ul acceptă cookie-uri. Acest cookie nu conține date personale și este șters la închiderea browser-ului.</li>
            <li>La autentificare, mai setăm cookie-uri pentru păstrarea informațiilor de login și a preferințelor de afișare a ecranului. Cookie-urile de autentificare durează 2 zile, iar cookie-urile pentru opțiuni de ecran durează 1 an. Dacă bifați „Ține-mă minte", autentificarea persistă timp de 2 săptămâni.</li>
            <li>Dacă editați sau publicați un articol, se salvează un cookie suplimentar care indică ID-ul articolului editat. Expiră după 1 zi și nu conține date personale.</li>
            <li>WooCommerce (platforma de e-commerce) setează cookie-uri suplimentare pentru păstrarea coșului de cumpărături, autentificare și preferințe ale utilizatorului.</li>
          </ul>

          <h3>Conținut integrat de la alte site-uri</h3>
          <p>Articolele pot include conținut integrat (videoclipuri, imagini, articole etc.). Conținutul integrat se comportă ca și cum ați vizita direct site-ul respectiv, iar acestea pot colecta date despre dvs., folosi cookie-uri sau alte instrumente de urmărire.</p>

          <h3>Colectarea datelor în timpul cumpărăturilor</h3>
          <p>Când plasați o comandă pe site, colectăm următoarele informații:</p>
          <ul>
            <li>Nume, adresă, email, număr de telefon.</li>
            <li>Adresa de livrare și de facturare.</li>
            <li>Detalii despre produsele comandate și istoricul comenzilor.</li>
            <li>Informații despre metoda de plată (card, PayPal, transfer bancar). Nu stocăm detalii complete ale cardului, acestea sunt procesate prin servicii terțe securizate.</li>
          </ul>

          <h3>Procesarea plăților</h3>
          <p>Toate plățile sunt procesate prin procesatori terți (PayPal, Stripe, etc.). Politicile lor de confidențialitate se aplică și pot fi consultate direct pe site-urile lor.</p>

          <h3>Marketing și newslettere</h3>
          <ul>
            <li>Dacă vă abonați la newsletter, putem folosi adresa de email pentru a vă trimite informații despre produse, oferte sau promoții.</li>
            <li>Aveți oricând opțiunea de dezabonare prin link-ul inclus în email.</li>
          </ul>

          <h3>Conturi de utilizator</h3>
          <ul>
            <li>Datele din profilul contului (nume, email, adresa) pot fi vizualizate, modificate sau șterse de către utilizator.</li>
            <li>Administratorii site-ului pot accesa aceste date pentru gestionarea comenzilor și suport.</li>
          </ul>

          <h3>Returnări și rambursări</h3>
          <ul>
            <li>Pentru procesarea retururilor și rambursărilor putem colecta informații suplimentare, cum ar fi motivul returului și detalii bancare pentru rambursare.</li>
            <li>Toate datele sunt folosite exclusiv pentru gestionarea cererii de retur.</li>
          </ul>

          <h3>Securitatea datelor</h3>
          <ul>
            <li>Folosim SSL pentru criptarea datelor transmise.</li>
            <li>Accesul la bazele de date este limitat și securizat.</li>
            <li>Datele clienților sunt protejate pentru a preveni accesul neautorizat sau pierderea acestora.</li>
          </ul>

          <h3>Cu cine împărtășim datele dvs.</h3>
          <ul>
            <li>Livratori (curieri, Poșta Română) pentru livrarea comenzilor.</li>
            <li>Procesatori de plăți (PayPal, Stripe etc.).</li>
            <li>Platforme de marketing și analiză (Google Analytics, Facebook Pixel).</li>
            <li>Dacă solicitați resetarea parolei, adresa dvs. IP va fi inclusă în emailul de resetare.</li>
            <li>Comentariile vizitatorilor pot fi verificate automat prin servicii anti-spam.</li>
          </ul>

          <h3>Durata păstrării datelor</h3>
          <ul>
            <li>Comentariile și metadatele acestora sunt păstrate indefinit.</li>
            <li>Datele clienților și istoricul comenzilor sunt păstrate atât timp cât este necesar pentru gestiunea comenzilor și obligații legale.</li>
            <li>Utilizatorii înregistrați pot vizualiza, edita sau șterge informațiile personale din profilul lor.</li>
          </ul>

          <h3>Drepturile dvs. asupra datelor</h3>
          <p>Dacă aveți un cont sau ați lăsat comentarii, puteți solicita:</p>
          <ol>
            <li>Exportul unui fișier cu datele personale pe care le deținem despre dvs.</li>
            <li>Ștergerea datelor personale (cu excepția datelor necesare din motive administrative, legale sau de securitate).</li>
            <li>Opt-out din marketing și newslettere.</li>
            <li>Rectificarea oricăror informații incorecte din profilul dvs.</li>
          </ol>

          <h3>Unde sunt trimise datele</h3>
          <p>Comentariile vizitatorilor și datele clienților pot fi verificate sau procesate prin servicii automate de spam și securitate. Datele de plată sunt procesate prin platforme terțe securizate.</p>

          <h3>Contact</h3>
          <p>Pentru întrebări legate de confidențialitate, ne puteți contacta la: <a href="mailto:contact@ovifone.ro">contact@ovifone.ro</a></p>
        </div>
      </div>
    </main>
  );
}
