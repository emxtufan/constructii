import nodemailer from 'nodemailer';

export function createMailer(config) {
  const transport = nodemailer.createTransport(config.smtp);
  return {
    verify: () => transport.verify(),
    close: () => transport.close(),
    async sendQuote(quote) {
      const info = await transport.sendMail({
        from: config.from,
        to: config.to,
        replyTo: { name: quote.name, address: quote.email },
        subject: 'Cerere ofertă — Green Tech Real Estate',
        text: [
          'Cerere trimisă prin formularul Green Tech Real Estate.',
          '',
          `Nume: ${quote.name}`,
          `Email de răspuns: ${quote.email}`,
          `Telefon: ${quote.phone || 'Nespecificat'}`,
          `Tip proiect: ${quote.projectType}`,
          `Locație: ${quote.location}`,
          `Suprafață: ${quote.surface ? `${quote.surface} m²` : 'De stabilit'}`,
          `Stadiu: ${quote.stage}`,
          `Servicii: ${quote.services.join(', ') || 'De clarificat împreună'}`,
          `Buget: ${quote.budget || 'De stabilit'}`,
          '',
          'Detalii din formular:',
          quote.message || 'De discutat.',
          '',
          'Rezumatul cererii:',
          quote.summary,
        ].join('\n'),
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      if (!info.accepted?.some(address => String(address).toLowerCase() === config.to.toLowerCase())) {
        throw Object.assign(new Error('Destinatarul nu a fost acceptat de SMTP.'), { code: 'ERECIPIENT' });
      }
      return { messageId: info.messageId };
    },
  };
}
