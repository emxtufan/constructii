import { useEffect, useRef, useState } from 'react';
import './CtaSection.css';

const recipient = 'contact@greentechrealestate.ro';
const projectTypes = ['Casă individuală', 'Ansamblu rezidențial', 'Renovare / modernizare', 'Spațiu comercial', 'Altă lucrare'];
const projectStages = ['Idee / evaluare teren', 'Proiectare', 'Autorizare', 'Pregătire de șantier', 'Lucrări în desfășurare', 'De clarificat'];
const services = ['Consultanță', 'Proiectare', 'Construcție', 'Renovare / modernizare', 'Management de proiect', 'De clarificat împreună'];
const budgets = ['Sub 50.000 EUR', '50.000 – 100.000 EUR', '100.000 – 250.000 EUR', 'Peste 250.000 EUR', 'De stabilit'];

function Arrow() {
  return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function CtaSection() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [summary, setSummary] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const formRef = useRef(null);
  const summaryRef = useRef(null);
  const reviewRef = useRef(null);
  const hasPrepared = useRef(false);

  useEffect(() => {
    if (!hasPrepared.current) return;
    const container = isReviewing ? reviewRef.current : formRef.current;
    container?.scrollIntoView({ block: 'start', behavior: 'instant' });
    const target = isReviewing ? container : container?.querySelector('select');
    target?.focus({ preventScroll: true });
  }, [isReviewing]);

  const prepareRequest = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = name => String(data.get(name) ?? '').trim();
    const selectedServices = data.getAll('services');
    setSummary([
      'Bună ziua,',
      'Aș dori să discutăm următorul proiect:',
      '',
      `Tip proiect: ${value('projectType')}`,
      `Locație: ${value('location')}`,
      `Suprafață aproximativă: ${value('surface') ? `${value('surface')} m²` : 'De stabilit'}`,
      `Stadiu curent: ${value('stage')}`,
      `Servicii necesare: ${selectedServices.length ? selectedServices.join(', ') : 'De clarificat împreună'}`,
      `Buget estimativ: ${value('budget') || 'De stabilit'}`,
      '',
      'Detalii proiect:',
      value('message') || 'De discutat.',
      '',
      `Nume: ${value('name')}`,
      `Email: ${value('email')}`,
      `Telefon: ${value('phone') || 'Nespecificat'}`,
    ].join('\n'));
    hasPrepared.current = true;
    setCopyStatus('');
    setIsReviewing(true);
  };

  const copyRequest = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(summary);
      setCopyStatus('Cererea a fost copiată. O poți lipi într-un email.');
    } catch {
      summaryRef.current?.focus();
      summaryRef.current?.select();
      setCopyStatus('Selectează și copiază textul de mai sus folosind comanda de copiere a dispozitivului.');
    }
  };

  const mailHref = `mailto:${recipient}?subject=${encodeURIComponent('Cerere ofertă Green Tech Real Estate')}&body=${encodeURIComponent(summary)}`;

  return (
    <section className="build-quote" id="contact" aria-labelledby="build-quote-title">
      <div className="build-quote__container">
        <div className="build-quote__intro">
          <h2 id="build-quote-title">Your project.<br /><span>Our next conversation.</span></h2>
          <p className="build-quote__lead">O idee, un teren sau o lucrare începută. Spune-ne unde te afli și ce vrei să construiești.</p>
          
        </div>

        <div className="build-quote__workspace">
          <form ref={formRef} className="build-quote__form" onSubmit={prepareRequest} hidden={isReviewing}>
            <p className="build-quote__form-note">Câmpurile marcate cu * sunt obligatorii.</p>
            <div className="build-quote__fields">
              <label className="build-quote__field">
                <span>Tip proiect *</span>
                <select name="projectType" defaultValue="" required>
                  <option value="" disabled>Alege tipul proiectului</option>
                  {projectTypes.map(type => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="build-quote__field">
                <span>Locație *</span>
                <input name="location" autoComplete="address-level2" placeholder="Oraș / localitate" maxLength={160} pattern=".*\S.*" required />
              </label>
              <label className="build-quote__field">
                <span>Suprafață aproximativă <small>(opțional)</small></span>
                <span className="build-quote__area"><input name="surface" type="number" min="1" step="any" inputMode="decimal" placeholder="De stabilit" aria-label="Suprafață aproximativă în metri pătrați" /><span aria-hidden="true">m²</span></span>
              </label>
              <label className="build-quote__field">
                <span>Stadiu curent *</span>
                <select name="stage" defaultValue="" required>
                  <option value="" disabled>Alege stadiul proiectului</option>
                  {projectStages.map(stage => <option key={stage}>{stage}</option>)}
                </select>
              </label>
              <fieldset className="build-quote__services build-quote__full">
                <legend>Servicii necesare <span>(poți selecta mai multe)</span></legend>
                <div>
                  {services.map(service => (
                    <label key={service}><input type="checkbox" name="services" value={service} /><span>{service}</span></label>
                  ))}
                </div>
              </fieldset>
              <label className="build-quote__field build-quote__full">
                <span>Buget estimativ</span>
                <select name="budget" defaultValue="De stabilit">
                  {budgets.map(budget => <option key={budget}>{budget}</option>)}
                </select>
              </label>
              <label className="build-quote__field build-quote__full">
                <span>Nume complet *</span>
                <input name="name" autoComplete="name" maxLength={120} pattern=".*\S.*" required />
              </label>
              <label className="build-quote__field">
                <span>Email *</span>
                <input name="email" type="email" autoComplete="email" maxLength={254} required />
              </label>
              <label className="build-quote__field">
                <span>Telefon <small>(opțional)</small></span>
                <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
              </label>
              <label className="build-quote__field build-quote__full">
                <span>Detalii proiect <small>(opțional)</small></span>
                <textarea name="message" rows={4} maxLength={4000} placeholder="Ce ai deja pregătit, ce servicii cauți și ce contează pentru tine?" />
              </label>
            </div>
            <p className="build-quote__attachment-note">Ai planuri sau fotografii? Le poți atașa direct în aplicația de email, după verificarea cererii.</p>
            <button className="build-quote__button build-quote__button--primary" type="submit">REQUEST A QUOTE <Arrow /></button>
            <p className="build-quote__step-note">Pasul următor: verifici rezumatul. Cererea nu este trimisă automat.</p>
          </form>

          {isReviewing && (
            <div className="build-quote__review" ref={reviewRef} tabIndex={-1} aria-labelledby="build-quote-review-title">
              <p className="build-quote__eyebrow">02 / REVIEW YOUR REQUEST</p>
              <h3 id="build-quote-review-title">Verifică cererea.</h3>
              <p>Poți edita textul de mai jos înainte să îl copiezi sau să îl deschizi în email.</p>
              <label className="build-quote__field build-quote__summary">
                <span>Rezumatul cererii</span>
                <textarea ref={summaryRef} value={summary} onChange={event => { setSummary(event.target.value); setCopyStatus(''); }} rows={18} maxLength={12000} />
              </label>
              <p className="build-quote__recipient">Destinatar: <a href={`mailto:${recipient}`}>{recipient}</a></p>
              <div className="build-quote__review-actions">
                {summary.trim() ? <a className="build-quote__button build-quote__button--primary" href={mailHref}>Deschide emailul <Arrow /></a> : <button className="build-quote__button build-quote__button--primary" disabled>Deschide emailul <Arrow /></button>}
                <button className="build-quote__button build-quote__button--secondary" type="button" onClick={copyRequest} disabled={!summary.trim()}>Copiază cererea</button>
              </div>
              <p className="build-quote__attachment-note">Atașează planurile în email și trimite mesajul de acolo. Dacă aplicația de email nu se deschide, copiază cererea și folosește adresa de mai sus.</p>
              <p className="build-quote__copy-status" role="status">{copyStatus}</p>
              <button className="build-quote__back" type="button" onClick={() => { setIsReviewing(false); setCopyStatus(''); }}>← Înapoi la formular</button>
              <p className="build-quote__step-note">Câmpurile sunt păstrate. La continuare, rezumatul se regenerează din formular.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
