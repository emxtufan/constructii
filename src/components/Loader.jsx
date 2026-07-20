// The intro loader keeps an invisible arrow-mask-line because the compiled engine
// uses its animationend event to advanc e loader timing.
export default function Loader() {
  return (
    <div id="loader" className="flx-center">
      <svg width="585" height="360" viewBox="0 0 585 360" fill="none" className="loader__logo loader__brand-logo" overflow="visible">
        <image href="/img/greentech-logo.svg" width="585" height="360" preserveAspectRatio="xMidYMid meet" />
        <path className="arrow-mask-line" d="M0 0H60" stroke="transparent" strokeWidth="1"></path>
      </svg>
      <svg className="loader__ellipse loader__ellipse--outer" viewBox="0 0 1500 800">
        <defs>
          <mask id="mask-outer">
            <path d="M 750 1 A 749 399 0 0 1 750 799 A 749 399 0 0 1 750 1" fill="none" stroke="white" strokeWidth="4" pathLength="3700" className="loader__draw loader__draw--outer"></path>
          </mask>
        </defs>
        <ellipse cx="750" cy="400" rx="749" ry="399" mask="url(#mask-outer)"></ellipse>
      </svg>
      <svg className="loader__ellipse loader__ellipse--inner" viewBox="0 0 800 800">
        <defs>
          <mask id="mask-inner">
            <path d="M 400 1 A 399 399 0 0 1 400 799 A 399 399 0 0 1 400 1" fill="none" stroke="white" strokeWidth="4" pathLength="2520" className="loader__draw loader__draw--inner"></path>
          </mask>
        </defs>
        <ellipse cx="400" cy="400" rx="399" ry="399" mask="url(#mask-inner)"></ellipse>
      </svg>
    </div>
  );
}
