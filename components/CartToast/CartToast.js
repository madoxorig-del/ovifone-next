'use client';
import { useState, useEffect, useCallback } from 'react';

export default function CartToast() {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const showToast = useCallback((detail) => {
    if (timer) clearTimeout(timer);
    setToast(detail);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    setTimer(t);
  }, [timer]);

  useEffect(() => {
    const handler = (e) => showToast(e.detail);
    window.addEventListener('cartItemAdded', handler);
    return () => window.removeEventListener('cartItemAdded', handler);
  }, [showToast]);

  if (!toast) return null;

  return (
    <div className={`cart-toast ${visible ? 'cart-toast--in' : 'cart-toast--out'}`}>
      <div className="cart-toast__icon">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="#fff" strokeWidth="2.5" fill="none">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      {toast.img && (
        <img className="cart-toast__img" src={toast.img} alt={toast.name} />
      )}
      <div className="cart-toast__text">
        <span className="cart-toast__title">Adăugat în coș!</span>
        <span className="cart-toast__name">{toast.name}</span>
        {toast.price && (
          <span className="cart-toast__price">{Number(toast.price).toLocaleString('ro-RO')} lei</span>
        )}
      </div>
      <button className="cart-toast__close" onClick={() => setVisible(false)}>
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
