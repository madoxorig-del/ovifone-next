'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Vinde() {

  useEffect(() => {
    // REVEAL ANIMATIONS
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // STORAGE MODIFIERS
    const storageModifiers = { '64GB': 0.80, '128GB': 0.90, '256GB': 1.00, '512GB': 1.15, '1TB': 1.30 };

    // STATE
    let currentStep = 1;
    const totalSteps = 4;
    const state = { deviceType: '', brand: '', modelName: '', storage: '', battery: null, batteryUnknown: false, condition: '', condModifier: 1 };

    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const errorMsg = document.getElementById('v-error');
    const sumBrand = document.getElementById('sum-brand');
    const sumModel = document.getElementById('sum-model');
    const sumStorage = document.getElementById('sum-storage');
    const sumBattery = document.getElementById('sum-battery');
    const sumCond = document.getElementById('sum-cond');

    function updateLiveSummary() {
      state.brand = document.getElementById('v-brand').value.trim();
      state.modelName = document.getElementById('v-model').value.trim();
      sumBrand.textContent = state.brand || '-';
      sumModel.textContent = state.modelName || '-';
      sumStorage.textContent = state.storage || '-';
      if (state.batteryUnknown) sumBattery.textContent = 'Necunoscut';
      else if (state.battery !== null) sumBattery.textContent = `${state.battery}%`;
      else sumBattery.textContent = '-';
      sumCond.textContent = state.condition || '-';
    }

    document.querySelectorAll('input[name="deviceType"]').forEach(radio => {
      radio.addEventListener('change', (e) => { state.deviceType = e.target.value; updateLiveSummary(); });
    });

    document.getElementById('v-brand')?.addEventListener('input', updateLiveSummary);
    document.getElementById('v-model')?.addEventListener('input', updateLiveSummary);

    document.querySelectorAll('input[name="storage"]').forEach(radio => {
      radio.addEventListener('change', (e) => { state.storage = e.target.value; updateLiveSummary(); });
    });

    const battSlider = document.getElementById('v-battery');
    const battValText = document.getElementById('batt-val');
    battSlider?.addEventListener('input', (e) => {
      state.battery = parseInt(e.target.value);
      battValText.textContent = `${state.battery}%`;
      const percent = ((state.battery - 50) / 50) * 100;
      battValText.style.left = `calc(${percent}% + (${8 - percent * 0.15}px))`;
      updateLiveSummary();
    });

    const battUnknownCheck = document.getElementById('battery-unknown');
    const battRangeWrap = document.getElementById('battery-range-wrap');
    battUnknownCheck?.addEventListener('change', (e) => {
      state.batteryUnknown = e.target.checked;
      if (state.batteryUnknown) { battRangeWrap.style.opacity = '0.4'; battRangeWrap.style.pointerEvents = 'none'; state.battery = null; }
      else { battRangeWrap.style.opacity = '1'; battRangeWrap.style.pointerEvents = 'auto'; state.battery = parseInt(battSlider.value); }
      updateLiveSummary();
    });

    document.querySelectorAll('input[name="condition"]').forEach(radio => {
      radio.addEventListener('change', (e) => { state.condition = e.target.value; state.condModifier = parseFloat(e.target.dataset.mod); updateLiveSummary(); });
    });

    function calculateSimulatedOffer() {
      let base = 2000 + (state.brand.length * 50) + (state.modelName.length * 100);
      if (state.deviceType === 'Tabletă') base += 500;
      if (state.deviceType === 'Laptop') base += 1500;
      let price = base;
      const storeMod = storageModifiers[state.storage] || 1;
      price = price * storeMod;
      let currentBatt = state.battery || 85;
      if (!state.batteryUnknown && currentBatt < 80) price -= 250;
      price = price * state.condModifier;
      return Math.max(Math.round(price / 10) * 10, 150);
    }

    function animatePriceCounter(targetValue) {
      const display = document.getElementById('price-counter');
      const loader = document.querySelector('.calc-loader');
      const resultDiv = document.querySelector('.calc-result');
      if (!loader || !resultDiv || !display) return;
      loader.style.display = 'flex';
      resultDiv.style.display = 'none';
      setTimeout(() => {
        loader.style.display = 'none';
        resultDiv.style.display = 'block';
        const crLabel = document.querySelector('.cr-label');
        const crNote = document.querySelector('.cr-note');
        if (crLabel) crLabel.textContent = 'Până la:';
        if (crNote) crNote.textContent = '*Prețul este estimativ. Suma finală se stabilește la testare.';
        display.innerHTML = '0';
        let cur = 0;
        const step = targetValue / 40;
        const tick = () => {
          cur += step;
          if (cur >= targetValue) { display.textContent = targetValue.toLocaleString('ro-RO') + ' lei'; }
          else { display.textContent = Math.floor(cur).toLocaleString('ro-RO'); requestAnimationFrame(tick); }
        };
        requestAnimationFrame(tick);
      }, 1500);
    }

    function updateStepperUI() {
      errorMsg.textContent = '';
      document.querySelectorAll('.step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'done');
        if (stepNum === currentStep) stepEl.classList.add('active');
        else if (stepNum < currentStep) stepEl.classList.add('done');
      });
      document.querySelectorAll('.step-line').forEach((line, index) => {
        if (index < currentStep - 1) line.classList.add('done');
        else line.classList.remove('done');
      });
      document.querySelectorAll('.form-step').forEach(form => form.classList.remove('active'));
      document.getElementById(`step-${currentStep}`)?.classList.add('active');
      btnPrev.style.display = currentStep > 1 ? 'inline-flex' : 'none';
      if (currentStep === totalSteps) {
        btnNext.style.display = 'none';
        btnSubmit.style.display = 'inline-flex';
        animatePriceCounter(calculateSimulatedOffer());
      } else {
        btnNext.style.display = 'inline-flex';
        btnSubmit.style.display = 'none';
      }
    }

    function shakeError(msg) {
      errorMsg.textContent = msg;
      errorMsg.style.animation = 'none';
      void errorMsg.offsetWidth;
      errorMsg.style.animation = 'shake .4s ease';
    }

    function validateStep(step) {
      if (step === 1) {
        if (!state.deviceType) { shakeError('Alege tipul dispozitivului!'); return false; }
        if (state.brand.length < 2) { shakeError('Introdu numele producătorului!'); return false; }
        if (state.modelName.length < 2) { shakeError('Introdu modelul exact al dispozitivului!'); return false; }
      }
      if (step === 2) {
        if (!state.storage) { shakeError('Selectează capacitatea de stocare!'); return false; }
        if (state.battery === null && !state.batteryUnknown) { state.battery = parseInt(battSlider.value); updateLiveSummary(); }
      }
      if (step === 3) {
        if (!state.condition) { shakeError('Bifează starea fizică a dispozitivului!'); return false; }
      }
      if (step === 4) {
        const name = document.getElementById('v-name')?.value.trim();
        const phone = document.getElementById('v-phone')?.value.trim();
        if (!name || name.length < 3) { shakeError('Introdu un nume valid!'); return false; }
        if (!phone || phone.length < 10) { shakeError('Introdu un număr de telefon valid!'); return false; }
      }
      return true;
    }

    btnNext?.addEventListener('click', () => { if (validateStep(currentStep)) { currentStep++; updateStepperUI(); } });
    btnPrev?.addEventListener('click', () => { currentStep--; updateStepperUI(); });

    document.getElementById('top-reset-btn')?.addEventListener('click', () => location.reload());
    document.getElementById('btn-reset-final')?.addEventListener('click', () => location.reload());

    btnSubmit?.addEventListener('click', async () => {
      if (validateStep(4)) {
        const origText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,.3)" stroke-width="3"/><path d="M12 3a9 9 0 0 1 9 9" stroke="white" stroke-width="3" stroke-linecap="round"/></svg> Se trimite...`;
        btnSubmit.disabled = true;
        const finalName = document.getElementById('v-name')?.value.trim();
        const finalPhone = document.getElementById('v-phone')?.value.trim();
        const finalEmail = document.getElementById('v-email')?.value.trim();
        const estimatedPrice = calculateSimulatedOffer();
        try {
          const { error } = await supabase.from('cereri_buyback').insert([{
            nume: finalName, telefon: finalPhone, email: finalEmail || '-',
            tip_device: state.deviceType, brand: state.brand, model: state.modelName,
            stocare: state.storage, baterie: state.batteryUnknown ? 'Necunoscut' : state.battery + '%',
            stare: state.condition, pret_estimat: estimatedPrice.toString(), status: 'Nou'
          }]);
          if (error) throw error;
          document.getElementById('vf-actions').style.display = 'none';
          document.getElementById('step-4')?.classList.remove('active');
          document.getElementById('step-success')?.classList.add('active');
          document.querySelector('.vf-stepper-wrap').style.display = 'none';
          document.querySelector('.vf-header').style.display = 'none';
          toast('Cerere înregistrată cu succes!', 'ok');
        } catch (err) {
          toast('A apărut o eroare. Încearcă din nou!', 'error');
          btnSubmit.innerHTML = origText;
          btnSubmit.disabled = false;
        }
      }
    });

    // FAQ ACORDEON
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const answer = item.querySelector('.faq-answer');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('active'); i.querySelector('.faq-answer').style.maxHeight = null; });
        if (!isActive) { item.classList.add('active'); answer.style.maxHeight = answer.scrollHeight + 'px'; }
      });
    });

    // TOAST
    let toastTimer;
    function toast(msg, type = 'ok') {
      const el = document.getElementById('v-toast');
      const ic = document.getElementById('v-toast-ic');
      const ms = document.getElementById('v-toast-msg');
      if (!el || !ic || !ms) return;
      clearTimeout(toastTimer);
      el.classList.remove('show', 'hide');
      ms.textContent = msg;
      ic.className = 'p-toast-ic ' + type;
      ic.innerHTML = type === 'ok'
        ? `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      void el.offsetWidth;
      el.classList.add('show');
      toastTimer = setTimeout(() => { el.classList.replace('show', 'hide'); setTimeout(() => el.classList.remove('hide'), 400); }, 3000);
    }

  }, []);

  return (
    <main className="vinde-main">
      <div className="v-bg-decorations">
        <div className="v-blob v-blob-1"></div>
        <div className="v-blob v-blob-2"></div>
      </div>

      <div className="vinde-container">
        <div className="vinde-split">

          {/* FORM PANEL */}
          <div className="vf-panel" data-reveal="true">
            <div className="vf-header">
              <div className="vf-badge-row">
                <div className="vf-badge">Trade-In</div>
                <button className="vbtn-reset" id="top-reset-btn" title="Resetează formularul">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                  Reset
                </button>
              </div>
              <h1 className="vf-title">Transformă vechiul device în bani.</h1>
              <p className="vf-subtitle">Evaluează-ți telefonul în 4 pași simpli și primește banii pe loc sau reducere la un device nou.</p>
            </div>

            <div className="vf-stepper-wrap">
              <div className="vf-stepper">
                <div className="step active" data-step="1"><div className="step-ring"><span className="step-num">1</span></div><span className="step-lbl">Device</span></div>
                <div className="step-line"><div className="step-line-fill"></div></div>
                <div className="step" data-step="2"><div className="step-ring"><span className="step-num">2</span></div><span className="step-lbl">Specificații</span></div>
                <div className="step-line"><div className="step-line-fill"></div></div>
                <div className="step" data-step="3"><div className="step-ring"><span className="step-num">3</span></div><span className="step-lbl">Stare</span></div>
                <div className="step-line"><div className="step-line-fill"></div></div>
                <div className="step" data-step="4"><div className="step-ring"><span className="step-num">4</span></div><span className="step-lbl">Ofertă</span></div>
              </div>
            </div>

            <div className="vf-body" id="wizard-body">

              {/* STEP 1 */}
              <div className="form-step active" id="step-1">
                <h3 className="step-title">Ce dispozitiv vinzi?</h3>
                <div className="vf-field mt-20">
                  <label>Tip Dispozitiv</label>
                  <div className="vf-chips" id="type-chips">
                    <label className="v-chip"><input type="radio" name="deviceType" value="Telefon" /><span>Telefon</span></label>
                    <label className="v-chip"><input type="radio" name="deviceType" value="Tabletă" /><span>Tabletă / iPad</span></label>
                    <label className="v-chip"><input type="radio" name="deviceType" value="Laptop" /><span>Laptop / Mac</span></label>
                  </div>
                </div>
                <div className="vf-row-2 mt-20">
                  <div className="vf-field">
                    <label>Producător</label>
                    <input type="text" className="vf-input" id="v-brand" placeholder="Ex: Apple, Samsung, Xiaomi" />
                  </div>
                  <div className="vf-field">
                    <label>Model Exact</label>
                    <input type="text" className="vf-input" id="v-model" placeholder="Ex: iPhone 14 Pro, iPad Air 5" />
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="form-step" id="step-2">
                <h3 className="step-title">Specifică detalii tehnice</h3>
                <div className="vf-field mt-20">
                  <label>Capacitate de stocare</label>
                  <div className="vf-chips" id="storage-chips">
                    <label className="v-chip"><input type="radio" name="storage" value="64GB" /><span>64 GB</span></label>
                    <label className="v-chip"><input type="radio" name="storage" value="128GB" /><span>128 GB</span></label>
                    <label className="v-chip"><input type="radio" name="storage" value="256GB" /><span>256 GB</span></label>
                    <label className="v-chip"><input type="radio" name="storage" value="512GB" /><span>512 GB</span></label>
                    <label className="v-chip"><input type="radio" name="storage" value="1TB" /><span>1 TB+</span></label>
                  </div>
                </div>
                <div className="vf-field mt-25">
                  <label>Sănătatea Bateriei (Battery Health)</label>
                  <div className="range-wrap" id="battery-range-wrap">
                    <div className="range-val" id="batt-val">85%</div>
                    <input type="range" className="vf-range" id="v-battery" min="50" max="100" defaultValue="85" step="1" />
                    <div className="range-labels"><span>50% (Slabă)</span><span>100% (Nouă)</span></div>
                  </div>
                  <label className="af-check mt-15">
                    <input type="checkbox" id="battery-unknown" />
                    <span className="af-check-box"></span>
                    <span>Nu pot verifica / Dispozitiv Android</span>
                  </label>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="form-step" id="step-3">
                <h3 className="step-title">Evaluarea stării fizice</h3>
                <div className="vf-field mt-20">
                  <label>Cum arată ecranul și carcasa?</label>
                  <div className="vf-cards-col">
                    <label className="vc-card-row">
                      <input type="radio" name="condition" value="Impecabil" data-mod="1" />
                      <div className="vcc-inner-row">
                        <div className="vcc-ico"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
                        <div className="vcc-text"><strong>Impecabil (Ca Nou)</strong><span>Fără absolut nicio zgârietură. Purtat doar cu husă și folie.</span></div>
                        <div className="vcc-check"><div className="dot"></div></div>
                      </div>
                    </label>
                    <label className="vc-card-row">
                      <input type="radio" name="condition" value="Foarte Bun" data-mod="0.85" />
                      <div className="vcc-inner-row">
                        <div className="vcc-ico"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
                        <div className="vcc-text"><strong>Urme Normale</strong><span>Zgârieturi fine pe ramă sau ecran, vizibile doar în lumină.</span></div>
                        <div className="vcc-check"><div className="dot"></div></div>
                      </div>
                    </label>
                    <label className="vc-card-row">
                      <input type="radio" name="condition" value="Deteriorat" data-mod="0.5" />
                      <div className="vcc-inner-row">
                        <div className="vcc-ico"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><circle cx="12" cy="12" r="10"></circle><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></div>
                        <div className="vcc-text"><strong>Deteriorat / Spart</strong><span>Ecran crăpat, carcasă deformată sau urme vizibile de impact.</span></div>
                        <div className="vcc-check"><div className="dot"></div></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="form-step" id="step-4">
                <h3 className="step-title">Oferta ta estimată</h3>
                <div className="calc-loader" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',gap:'12px'}}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" style={{animation:'spin 1s linear infinite'}}><circle cx="12" cy="12" r="9" stroke="rgba(0,0,0,.15)" strokeWidth="3"/><path d="M12 3a9 9 0 0 1 9 9" stroke="#f49201" strokeWidth="3" strokeLinecap="round"/></svg>
                  <span style={{color:'#86868b',fontWeight:600}}>Se calculează oferta...</span>
                </div>
                <div className="calc-result" style={{display:'none',textAlign:'center',padding:'20px 0'}}>
                  <span className="cr-label" style={{display:'block',fontSize:'14px',color:'#86868b',fontWeight:600,marginBottom:'8px'}}>Până la:</span>
                  <div id="price-counter" style={{fontSize:'56px',fontWeight:900,color:'#f49201',fontFamily:'Montserrat,sans-serif',letterSpacing:'-0.03em',lineHeight:1}}></div>
                  <span className="cr-note" style={{display:'block',fontSize:'12px',color:'#86868b',marginTop:'8px'}}></span>
                </div>
                <div className="vf-field mt-25">
                  <label>Numele tău complet</label>
                  <input type="text" className="vf-input" id="v-name" placeholder="Ex: Ion Popescu" />
                </div>
                <div className="vf-row-2">
                  <div className="vf-field">
                    <label>Număr de telefon</label>
                    <input type="tel" className="vf-input" id="v-phone" placeholder="07XX XXX XXX" />
                  </div>
                  <div className="vf-field">
                    <label>Email (opțional)</label>
                    <input type="email" className="vf-input" id="v-email" placeholder="email@exemplu.com" />
                  </div>
                </div>
              </div>

              {/* SUCCESS */}
              <div className="form-step success-step" id="step-success">
                <div className="succ-anim-box">
                  <svg viewBox="0 0 52 52" style={{width:'100px',height:'100px'}}>
                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
                <h2 className="succ-title">Cerere trimisă!</h2>
                <p className="succ-desc">Te vom contacta în cel mai scurt timp cu o ofertă fermă pentru dispozitivul tău.</p>
                <div className="succ-actions">
                  <Link href="/" className="vbtn-secondary">Înapoi Acasă</Link>
                  <button className="vbtn-primary" id="btn-reset-final">Vinde alt device</button>
                </div>
              </div>

            </div>

            <div className="vf-actions" id="vf-actions">
              <button className="vbtn-nav btn-back" id="btn-prev" style={{display:'none'}}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Înapoi
              </button>
              <div className="err-msg-wrap"><span className="v-error-msg" id="v-error"></span></div>
              <button className="vbtn-nav btn-fwd" id="btn-next">
                Continuă <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
              <button className="vbtn-nav btn-submit" id="btn-submit" style={{display:'none'}}>
                Trimite Cererea <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>

          {/* IMAGE PANEL */}
          <div className="vi-panel" data-reveal="true" data-delay="200">
            <div className="vi-image-wrap">
              <img src="https://images.unsplash.com/photo-1592890288564-76628a30a657?auto=format&fit=crop&q=80&w=800&h=900" alt="Ovifone BuyBack" />
              <div className="vi-live-summary">
                <div className="vils-header">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                  <span>Sumar Dispozitiv</span>
                </div>
                <div className="vils-body">
                  <div className="vils-row"><span className="vils-lbl">Brand:</span><span className="vils-val" id="sum-brand">-</span></div>
                  <div className="vils-row"><span className="vils-lbl">Model:</span><span className="vils-val" id="sum-model">-</span></div>
                  <div className="vils-row"><span className="vils-lbl">Stocare:</span><span className="vils-val" id="sum-storage">-</span></div>
                  <div className="vils-row"><span className="vils-lbl">Baterie:</span><span className="vils-val" id="sum-battery">-</span></div>
                  <div className="vils-row"><span className="vils-lbl">Stare:</span><span className="vils-val" id="sum-cond">-</span></div>
                </div>
                <div className="vils-footer">
                  <div className="vig-icon"><svg viewBox="0 0 24 24" width="20" height="20" stroke="var(--accent)" strokeWidth="2.5" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                  <div className="vils-trust"><strong>Evaluare corectă</strong><span>Garantăm cel mai bun preț pe loc</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TIMELINE */}
      <section className="v-timeline-section">
        <div className="v-info-container">
          <div className="vi-head" data-reveal="true">
            <h2>Cum funcționează procesul?</h2>
            <p>Bani gheață sau discount pentru un telefon nou, în 3 pași banali.</p>
          </div>
          <div className="timeline-grid">
            <div className="tl-item" data-reveal="true" data-delay="100">
              <div className="tl-icon">1</div>
              <div className="tl-content"><h3>Completezi formularul</h3><p>Durează mai puțin de 2 minute să scrii modelul și să ne spui în ce stare se află dispozitivul tău.</p></div>
            </div>
            <div className="tl-item" data-reveal="true" data-delay="200">
              <div className="tl-icon">2</div>
              <div className="tl-content"><h3>Primești oferta</h3><p>Te contactăm cu o ofertă fermă și corectă. Dacă ești de acord, poți veni în magazin sau trimitem curierul.</p></div>
            </div>
            <div className="tl-item" data-reveal="true" data-delay="300">
              <div className="tl-icon">3</div>
              <div className="tl-content"><h3>Banii pe loc</h3><p>După o scurtă verificare tehnică, îți virăm banii instant sau facem reducerea pentru device-ul nou.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="v-faq-section">
        <div className="v-info-container">
          <div className="vi-head" data-reveal="true"><h2>Întrebări Frecvente</h2></div>
          <div className="faq-list" data-reveal="true">
            <div className="faq-item">
              <button className="faq-question"><span>Cumpărați și telefoane blocate în iCloud sau defecte total?</span><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
              <div className="faq-answer"><p>Cumpărăm telefoane cu ecran spart sau defecte hardware minore, însă NU cumpărăm dispozitive blocate în iCloud, cu cont de Google blocat sau raportate ca furate.</p></div>
            </div>
            <div className="faq-item">
              <button className="faq-question"><span>Trebuie să aduc și cutia sau încărcătorul?</span><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
              <div className="faq-answer"><p>Nu este obligatoriu, dar prezența accesoriilor originale poate crește ușor valoarea ofertei noastre.</p></div>
            </div>
            <div className="faq-item">
              <button className="faq-question"><span>Datele mele sunt în siguranță?</span><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
              <div className="faq-answer"><p>100%. Te vom asista în procesul de back-up și vom efectua o resetare completă din fabrică în fața ta.</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="p-toast" id="v-toast"><div className="p-toast-ic" id="v-toast-ic"></div><span id="v-toast-msg"></span></div>

    </main>
  );
}