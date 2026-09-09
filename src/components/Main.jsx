import Hero from './Hero.jsx';
import FlowSection from './FlowSection.jsx';
import FeaturesSection from './FeaturesSection.jsx';
import LogosSection from './LogosSection.jsx';
import ScrollStackSection from './ScrollStackSection.jsx';
import WhyUsSection from './WhyUsSection.jsx';
import StandardsSection from './StandardsSection.jsx';
import FaqSection from './FaqSection.jsx';
import CtaSection from './CtaSection.jsx';
import { GroundToHome, CurrentProgress, BeforeCurrent } from './ProjectStory.jsx';
import { MaterialsCraft, BehindBuild, EngineeringPrecision } from './CraftSections.jsx';
import { WhatComesNext, ProjectJournal } from './ProjectUpdates.jsx';
import FinalStatement from './FinalStatement.jsx';
import { project } from '../data/project.js';

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
          <StandardsSection project={project} />
          <GroundToHome project={project} />
          {/* <CurrentProgress project={project} /> */}
          {/* <MaterialsCraft project={project} /> */}
          {/* <BehindBuild project={project} /> */}
          <EngineeringPrecision project={project} />
          <BeforeCurrent project={project} />
          <WhyUsSection />
          {/* <WhatComesNext project={project} /> */}
          {/* <ProjectJournal project={project} /> */}
          <FaqSection />
          <CtaSection />
          <FinalStatement />
        </div>
        <div id="app"></div>
      </div>
    </main>
  );
}
