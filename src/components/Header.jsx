import BrandLogo from './BrandLogo.jsx';

export default function Header() {
  return (
    <header>
      <nav className="header__nav-left">
        <a href="#servicii">Servicii</a>
        <a href="#proiecte">Proiecte</a>
      </nav>
      <div className="header__logo">
        <a href="/" className="header__logo_link" aria-label="Green Tech Real Estate">
          <BrandLogo fill="#0B0B0A" />
          <strong style={{ marginLeft: '10px', whiteSpace: 'nowrap', fontSize: '14px' }}>GREEN TECH REAL ESTATE</strong>
        </a>
      </div>
      <nav className="header__nav-right">
        <div className="header__ctas">
          <a href="#proiecte" className="pill-btn pill-btn--glass">
            <span className="pill-btn-span">Proiecte</span>
          </a>
          <a href="#contact" className="pill-btn pill-btn--dark">
            <span className="pill-btn-span">Cere oferta</span>
          </a>
        </div>
        <button className="menu-btn" type="button" aria-label="Toggle menu" aria-expanded="false">
          <span className="menu-btn__icon">
            <span className="menu-btn__line menu-btn__line--1"></span>
            <span className="menu-btn__line menu-btn__line--2"></span>
            <span className="menu-btn__line menu-btn__line--3"></span>
          </span>
        </button>
      </nav>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <div className="mobile-nav__panel-bg"></div>
        <div className="mobile-nav__panel">
          <div className="mobile-nav__header">
            <a href="/" className="mobile-nav__logo">
              <BrandLogo fill="#0B0B0A" />
              <strong className="brand-name">GREEN TECH REAL ESTATE</strong>
            </a>
            <button className="mobile-nav__close" type="button" aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect y="14.1421" width="20" height="2" transform="rotate(-45 0 14.1421)" fill="#0B0B0A"></rect>
                <rect x="1.41406" y="0.000610352" width="20" height="2" transform="rotate(45 1.41406 0.000610352)" fill="#0B0B0A"></rect>
              </svg>
            </button>
          </div>
          <ul className="mobile-nav__list">
            <li className="mobile-nav__item">
              <a href="#servicii">Servicii</a>
            </li>
            <li className="mobile-nav__item">
              <a href="#proiecte">Proiecte</a>
            </li>
          </ul>
          <div className="mobile-nav__ctas">
            <div className="mncta">
              <a href="#proiecte" className="pill-btn pill-btn--glass mobile-nav__cta">
                <span className="pill-btn-span">Proiecte</span>
              </a>
            </div>
            <div className="mncta">
              <a href="#contact" className="pill-btn pill-btn--dark mobile-nav__cta">
                <span className="pill-btn-span">Cere oferta</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
