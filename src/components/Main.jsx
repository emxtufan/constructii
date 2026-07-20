import Hero from './Hero.jsx';
import FlowSection from './FlowSection.jsx';
import FeaturesSection from './FeaturesSection.jsx';
import StandardsSection from './StandardsSection.jsx';
import FaqSection from './FaqSection.jsx';
import CtaSection from './CtaSection.jsx';

// data-taxi / data-taxi-view / #app are required by the compiled engine (page-transition
// container and the WebGPU canvas mount point). Preserved exactly.
export default function Main() {
  return (
    <main data-taxi>
      <div data-taxi-view="home">
        <div className="top">
          <Hero />
          <div className="hero-spacer"></div>
          <FlowSection />
          <FeaturesSection />
          <StandardsSection />
          <FaqSection />
          <CtaSection />
        </div>
        <div id="app"></div>
      </div>
    </main>
  );
}
