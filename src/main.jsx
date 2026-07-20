import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// No StrictMode: it double-invokes effects in dev, which would boot the 3D scene twice.
createRoot(document.getElementById('root')).render(<App />);
