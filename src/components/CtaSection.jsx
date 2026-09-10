import { useRef, useState } from 'react';
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
  const [sendState, setSendState] = useState('idle');
  const [sendMessage, setSendMessage] = useState('');
  const formRef = useRef(null);
  const sendLock = useRef(false);
  const isSending = sendState === 'sending';
  const isSent = sendState === 'success';

  const sendRequest = async event => {
    event.preventDefault();
    if (sendLock.current || isSent) return;
    const data = new FormData(event.currentTarget);
    const value = name => String(data.get(name) ?? '').trim();
    const selectedServices = data.getAll('services').map(String);
    const requestData = {
      projectType: value('projectType'),
      location: value('location'),
      surface: value('surface'),
      stage: value('stage'),
      services: selectedServices,
      budget: value('budget'),
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      message: value('message'),
      website: value('website'),
    };
    const summary = [
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
    ].join('\n');
    sendLock.current = true;
    setSendState('sending');
    setSendMessage('Se trimite cererea. Te rugăm să păstrezi pagina deschisă.');
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...requestData, summary: summary.trim() }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        const message = result?.ok === false && typeof result.message === 'string'
          ? result.message
          : 'Nu am putut confirma trimiterea. Cererea a rămas în pagină; poți reveni mai târziu sau ne poți contacta prin email.';
        throw new Error(message);
      }
      setSendState('success');
      setSendMessage(typeof result.message === 'string' ? result.message : 'Cererea a fost trimisă. Îți mulțumim!');
    } catch (error) {
      setSendState('error');
      setSendMessage(error instanceof TypeError
        ? 'Conexiunea s-a întrerupt și nu am putut confirma trimiterea. Cererea a rămas în pagină. Pentru a verifica primirea ei, ne poți contacta prin email.'
        : error.message);
    } finally {
      sendLock.current = false;
    }
  };

  const startNewRequest = () => {
    if (sendLock.current) return;
    formRef.current?.reset();
    setSendState('idle');
    setSendMessage('');
    requestAnimationFrame(() => formRef.current?.querySelector('select')?.focus());
  };

  return (
    <section className="build-quote" id="contact" aria-labelledby="build-quote-title">
      <div className="build-quote__container">
        <div className="build-quote__intro">
          <h2 id="build-quote-title">Your project.<br /><span>Our next conversation.</span></h2>
          <p className="build-quote__lead">O idee, un teren sau o lucrare începută. Spune-ne unde te afli și ce vrei să construiești.</p>
          
        </div>

        <div className="build-quote__workspace">
          <form ref={formRef} className="build-quote__form" onSubmit={sendRequest} aria-busy={isSending} aria-describedby="build-quote-status">
            <p className="build-quote__form-note">Câmpurile marcate cu * sunt obligatorii.</p>
            <fieldset className="build-quote__inputs" disabled={isSending || isSent}>
            <label className="build-quote__honeypot" aria-hidden="true">
              Website
              <input name="website" autoComplete="off" tabIndex={-1} />
            </label>
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
            </fieldset>
            <p className="build-quote__attachment-note">Ai planuri sau fotografii? Le poți trimite separat prin email la {recipient}, menționând numele și proiectul tău.</p>
            <button className="build-quote__button build-quote__button--primary" type="submit" disabled={isSending || isSent}>{isSending ? 'Se trimite…' : isSent ? 'Cerere trimisă' : 'Trimite cererea'} <Arrow /></button>
            <p id="build-quote-status" className={`build-quote__send-status build-quote__send-status--${sendState}`} role={sendState === 'error' ? 'alert' : 'status'} aria-live={sendState === 'error' ? 'assertive' : 'polite'} aria-atomic="true">{sendMessage}</p>
            {isSent && <button className="build-quote__back" type="button" onClick={startNewRequest}>Începe o cerere nouă</button>}
          </form>
        </div>
      </div>
    </section>
  );
}
