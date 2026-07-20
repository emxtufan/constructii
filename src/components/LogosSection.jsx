import { SiNextdotjs, SiReact, SiTailwindcss, SiTypescript } from 'react-icons/si';
import LogoLoop from './effects/LogoLoop';

const techLogos = [
  { node: <SiReact />, title: 'React', href: 'https://react.dev' },
  { node: <SiNextdotjs />, title: 'Next.js', href: 'https://nextjs.org' },
  { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com' },
];

export default function LogosSection() {
  return (
    <section className="logos-section" aria-labelledby="logos-section-title">
      <div className="logos-section__container">
        <h2 className="logos-section__title" id="logos-section-title">
          Tehnologii folosite in proiect.
        </h2>
        <div className="logos-section__loop">
          <LogoLoop
            logos={techLogos}
            speed={90}
            direction="left"
            logoHeight={56}
            gap={64}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#fcfcfc"
            ariaLabel="Tehnologii folosite in proiect"
          />
        </div>
      </div>
    </section>
  );
}
