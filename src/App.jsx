import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Main from './components/Main.jsx';
import Footer from './components/Footer.jsx';
import Loader from './components/Loader.jsx';
import SmoothScroll from './components/effects/SmoothScroll.jsx';
import { startSiteLoading, sceneLoadingError } from './lib/site-loading';
import { project } from './data/project';

// The 3D scene, smooth-scroll, page transitions, FAQ accordion and loader
// animation all live in the original compiled engine (CommonScripts -> renderer + vendor).
// We render the real DOM structure it expects (same classes/ids) and boot that engine
// with a scoped floor-AO correction for logo_G. Header owns its navigation and
// mobile menu independently in React.
const SCENE_SRC = '/_astro/CommonScripts.astro_astro_type_script_index_0_lang.CZTi642d.js';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export default function App() {
  useEffect(() => {
    if (window.__vectrSceneBooted) return; // guard against HMR / double-mount
    window.__vectrSceneBooted = true;

    const canBootWebGpuScene = window.isSecureContext || LOCAL_HOSTS.has(window.location.hostname);
    startSiteLoading({ sceneEnabled: canBootWebGpuScene, extraImages: project.phases.map(phase => phase.image?.src) });
    if (!canBootWebGpuScene) {
      return;
    }

    const s = document.createElement('script');
    s.type = 'module';
    s.src = SCENE_SRC;
    s.onerror = sceneLoadingError;
    document.body.appendChild(s);
  }, []);

  return (
    <>
      <SmoothScroll />
      <div className="transition-pages"></div>
      <Header  />
      <Main />
      <Footer />
      <Loader />
    </>
  );
}
