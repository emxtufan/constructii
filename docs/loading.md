# Loader GreenTech

Ecranul inițial este livrat în `index.html`, înainte de pornirea React. Componenta `src/components/Loader.jsx` îl înlocuiește cu progresul resurselor, păstrând logo-ul și o bară subțire în culorile site-ului.

## Progres și finalizare

`src/lib/site-loading.js` urmărește documentul, fonturile, imaginile din pagină și toate fotografiile etapelor proiectului. Imaginile sunt preîncărcate și decodate. Pentru scena activă, progresul include descărcarea GLB-ului desktop sau mobil, `workers.glb` și textura smoke, apoi primele randări reușite.

Procentul reprezintă o ponderare a acestor operațiuni, nu procentul exact din totalul octeților întregului website. Descărcările scenei folosesc octeții primiți efectiv. Nu există un timer care crește artificial procentul. Valoarea 100 este rezervată resurselor pregătite și scenei randate, când aceasta este activă.

Bridge-ul `public/_astro/greentech-loading.js` conectează motorul original și interfața React prin evenimentele `greentech:scene-loading`, `greentech:loading-continue` și `greentech:loading-finished`. Intro-ul original așteaptă și promisiunea `window.__greenTechPageReady`. Se păstrează `#loader` și semnalul intern `.arrow-mask-line`, folosite de motor.

## Încărcare lentă și erori

După 15 secunde apare opțiunea de continuare; o eroare sau depășirea a 60 de secunde oferă și reîncărcarea paginii. Continuarea dezactivează scena, deblochează pagina și arată hero-ul și procesul într-o compoziție statică. Un răspuns întârziat nu repornește intro-ul. Reduced motion elimină tranziția de închidere.

Pe HTTP în afara localhost se păstrează verificarea existentă de secure context: scena nu pornește, iar loaderul așteaptă documentul, imaginile și fonturile. Acest loader nu rezolvă cerința HTTPS a motorului 3D.

## Build și livrare

- Verificare logică: `npm.cmd run test:loading`.
- Build: `npm.cmd run build`.
- Copiază întregul `dist` actualizat pe server, inclusiv `_astro/greentech-loading.js` și bundle-urile actualizate ale motorului. Publicarea doar a bundle-ului React nu este suficientă.
- Dacă Windows blochează ștergerea unui director static în timpul build-ului, `npm.cmd run build -- --emptyOutDir false` poate recompila fără curățarea prealabilă. Nu șterge fișierele sursă pentru a remedia un lock.

