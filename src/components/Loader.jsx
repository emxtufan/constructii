import { useSyncExternalStore } from 'react';
import { continueWithoutScene, getLoadingState, subscribeLoading } from '../lib/site-loading';
import './Loader.css';

export default function Loader() {
  const { progress, phase, label, slow } = useSyncExternalStore(subscribeLoading, getLoadingState);
  return (
    <div id="loader" className="gt-loader" data-loading-state={phase} aria-label="Încărcare Green Tech Real Estate">
      <div className="gt-loader__content">
        <img className="gt-loader__logo" src="/img/greentech-logo.svg" alt="Green Tech Real Estate" width="282" height="38" fetchPriority="high" />
        <div className="gt-loader__progress" role="progressbar" aria-label="Progresul încărcării website-ului" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}%`}>
          <div className="gt-loader__row" aria-hidden="true"><span>Pregătim experiența</span><strong>{String(progress).padStart(2, '0')}<small>%</small></strong></div>
          <div className="gt-loader__track"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
        </div>
        <p className="gt-loader__status" role="status" aria-live="polite">{label}</p>
        {(slow || phase === 'error') && phase !== 'ready' && phase !== 'dismissed' && (
          <div className="gt-loader__actions">
            {phase === 'error' && <button type="button" onClick={() => window.location.reload()}>Reîncearcă</button>}
            <button type="button" onClick={continueWithoutScene}>Continuă pe site <span aria-hidden="true">↗</span></button>
          </div>
        )}
      </div>
      {/* Compatibility signal for the original intro's arrowMaskReady gate. */}
      <svg className="gt-loader__signal" aria-hidden="true" width="1" height="1"><path className="arrow-mask-line" d="M0 0H1" /></svg>
    </div>
  );
}
