import { useMemo, useState } from 'react';

const projectTypes = [
  'Casa individuala',
  'Ansamblu rezidential',
  'Renovare / modernizare',
  'Spatiu comercial',
  'Alta lucrare',
];

const budgetRanges = [
  'Sub 50.000 EUR',
  '50.000 - 100.000 EUR',
  '100.000 - 250.000 EUR',
  'Peste 250.000 EUR',
  'De stabilit',
];

export default function CtaSection() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const fileSummary = useMemo(() => {
    if (!selectedFiles.length) return 'PDF, DWG, JPG sau PNG';
    return selectedFiles.map(file => file.name).join(', ');
  }, [selectedFiles]);

  const handleFilesChange = event => {
    setSelectedFiles(Array.from(event.target.files ?? []));
  };

  const handleSubmit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const lines = [
      `Nume: ${formData.get('name')}`,
      `Telefon: ${formData.get('phone')}`,
      `Email: ${formData.get('email')}`,
      `Tip proiect: ${formData.get('projectType')}`,
      `Locatie: ${formData.get('location')}`,
      `Buget estimativ: ${formData.get('budget')}`,
      `Termen dorit: ${formData.get('timeline')}`,
      '',
      'Detalii proiect:',
      formData.get('message'),
      '',
      selectedFiles.length
        ? `Planuri atasate in formular: ${selectedFiles.map(file => file.name).join(', ')}`
        : 'Planuri atasate in formular: nu au fost selectate fisiere',
    ];

    const subject = encodeURIComponent('Cerere oferta Green Tech Real Estate');
    const body = encodeURIComponent(lines.join('\n'));
    setSubmitted(true);
    window.location.href = `mailto:contact@greentechrealestate.ro?subject=${subject}&body=${body}`;
  };

  return (
    <section className="quote-section" id="contact">
      <div className="quote-section__container">
        <div className="quote-section__intro">
          <h2 className="quote-section__title">
            <span>Cere o oferta pentru proiectul tau.</span>
            <span>Trimite-ne planurile si revenim cu o estimare clara.</span>
          </h2>
          <p className="quote-section__text">
            Completeaza detaliile esentiale, incarca planurile disponibile si iti raspundem cu urmatorii pasi.
          </p>
        </div>

        <form className="quote-form" onSubmit={handleSubmit}>
          <div className="quote-form__grid">
            <label className="quote-field">
              <span>Nume complet</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>

            <label className="quote-field">
              <span>Telefon</span>
              <input name="phone" type="tel" autoComplete="tel" required />
            </label>

            <label className="quote-field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>

            <label className="quote-field">
              <span>Tip proiect</span>
              <select name="projectType" defaultValue="" required>
                <option value="" disabled>
                  Alege tipul proiectului
                </option>
                {projectTypes.map(type => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="quote-field">
              <span>Locatie proiect</span>
              <input name="location" type="text" placeholder="Oras / localitate" required />
            </label>

            <label className="quote-field">
              <span>Buget estimativ</span>
              <select name="budget" defaultValue="" required>
                <option value="" disabled>
                  Alege intervalul
                </option>
                {budgetRanges.map(range => (
                  <option value={range} key={range}>
                    {range}
                  </option>
                ))}
              </select>
            </label>

            <label className="quote-field quote-field--full">
              <span>Termen dorit</span>
              <input name="timeline" type="text" placeholder="Ex: primavara 2027, cat mai curand, dupa autorizare" />
            </label>

            <label className="quote-field quote-field--full">
              <span>Detalii proiect</span>
              <textarea
                name="message"
                rows="5"
                placeholder="Suprafata, regim de inaltime, stadiul proiectului, autorizatii, finisaje dorite..."
                required
              />
            </label>
          </div>

          <label className="quote-upload">
            <input
              name="plans"
              type="file"
              accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleFilesChange}
            />
            <span className="quote-upload__content">
              <strong>Incarca planurile</strong>
              <small>{fileSummary}</small>
            </span>
          </label>

          <div className="quote-form__footer">
            <p>Vom reveni cu urmatorii pasi dupa analiza detaliilor transmise.</p>
            <button className="pill-btn pill-btn--light quote-form__submit" type="submit">
              <span className="pill-btn-span">Trimite cererea</span>
            </button>
          </div>

          {submitted && <p className="quote-form__status">Se deschide aplicatia de email pentru trimiterea cererii.</p>}
        </form>
      </div>
    </section>
  );
}
