import BrandLogo from './BrandLogo.jsx';

const navItems = [
  { href: '#servicii', label: 'Servicii' },
  { href: '#proiecte', label: 'Proiecte' },
  { href: '#contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <nav className="footer-nav">
        {navItems.map((item) => (
          <a href={item.href} className="footer-nav-btn" key={item.href}>
            <span className="footer-nav-btn__bg"></span>
            <span className="footer-nav-btn__label">{item.label}</span>
            <span className="footer-nav-btn__arrows">
              <img src="/_astro/arrow-right.BfejkNdO.svg" alt="" className="footer-nav-btn__arrow footer-nav-btn__arrow--current" width="23" height="32" loading="lazy" />
              <img src="/_astro/arrow-right.BfejkNdO.svg" alt="" className="footer-nav-btn__arrow footer-nav-btn__arrow--next" width="23" height="32" loading="lazy" />
            </span>
          </a>
        ))}
      </nav>
      <div className="footer__bottom">
        <BrandLogo fill="#FCFCFC" className="logo footer__logo" />
        <strong className="brand-name footer__brand">GREEN TECH REAL ESTATE</strong>
        <div className="footer__meta">
          <p className="footer__copyright">&copy; 2026 Green Tech Real Estate</p>
          <a href="/privacy" className="footer__privacy">Confidentialitate</a>
          <a href="/terms" className="footer__privacy">Termeni</a>
        </div>
      </div>
    </footer>
  );
}
