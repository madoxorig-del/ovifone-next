'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function PlataContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const statusText = document.querySelector('p');
    const spinner = document.querySelector('.spinner');
    const title = document.querySelector('h2');

    if (!orderId) { afiseazaEroareClient(); return; }

    async function init() {
      try {
        const { data: comanda, error } = await supabase.from('comenzi').select('*').eq('id', orderId).single();
        if (error || !comanda) throw new Error('Nu am putut găsi comanda.');

        const { data, error: functionError } = await supabase.functions.invoke('plata-stripe', {
          body: { orderId: comanda.id, total: comanda.total }
        });

        if (functionError || data?.error) throw new Error('Eroare conexiune');
        if (data?.url) { window.location.href = data.url; }
        else throw new Error('Lipsă link');

      } catch (err) {
        console.error('Eroare:', err);
        afiseazaEroareClient();
      }
    }

    function afiseazaEroareClient() {
      if (spinner) spinner.style.display = 'none';
      if (title) { title.textContent = 'Oops! Ceva nu a mers bine.'; title.style.color = '#ef4444'; }
      const numarWhatsApp = '40738700777';
      if (statusText) statusText.innerHTML = `
        Ne pare rău, conexiunea cu procesatorul de plăți a fost întreruptă. <strong>Nu ți-au fost retrași bani din cont.</strong><br><br>
        Te rugăm să te întorci la magazin și să reîncerci, sau contactează-ne:<br>
        <a href="https://wa.me/${numarWhatsApp}" target="_blank" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:20px;background:#25D366;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
          💬 Contactează-ne pe WhatsApp
        </a><br><br>
        <a href="/checkout" style="color:#635bff;text-decoration:none;font-weight:600;font-size:14px;">← Înapoi la finalizare comandă</a>
      `;
    }

    init();
  }, []);

  return (
    <div className="payment-loader-card">
      <div className="logos">
        <span className="logo-ovifone">OVIFONE</span>
        <span className="plus-icon">✕</span>
        <span className="logo-stripe">Stripe</span>
      </div>
      <h2>Pregătim conexiunea...</h2>
      <p>Așteaptă câteva momente. Te transferăm către portalul de plată securizat.</p>
      <div className="spinner"></div>
      <div className="secure-badge">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        256-bit SSL Criptat
      </div>
    </div>
  );
}

export default function Plata() {
  return (
    <div className="plata-wrapper">
      <Suspense fallback={<div className="payment-loader-card"><div className="spinner"></div></div>}>
        <PlataContent />
      </Suspense>
    </div>
  );
}