// Initial transforms come straight from the original markup; the scene script
// animates them in on load. Kept verbatim so the intro is identical.
import BlurText from "./effects/BlurText";



const introTransform = {
  opacity: 0,
  transform: 'perspective(1000px) translateX(50%) translate3d(-222.2px, 88px, 0) rotateY(60deg) rotateX(35deg)',
};

export default function Hero() {
  return (
    <section className="hero" id="acasa">
      <div className="hero__content">
        <h1 className="hero__title" style={introTransform}>
          <BlurText
            text="Ridicăm construcții. Construim încredere."
            delay={200}
            animateBy="words"
            direction="top"
            triggerSelector=".hero"
            className="hero-blur-text"
          />
        </h1>
        <p className="hero__subtitle" style={introTransform}>
          <span>De la idee la cheie.<br className="sp" /></span>{' '}
          <span>GreenTech Real Estate creeaza locuinte si spatii moderne, eficiente energetic, construite responsabil pentru oameni si comunitati.</span>
        </p>
      </div>
      <div className="hero__scroll-btn">
        <span>
          <span className="hsbtn-in" style={{ transform: 'translate3d(0, calc(100% + 7px), 0)' }}>Scroll </span>
        </span>
      </div>
    </section>
  );
}
