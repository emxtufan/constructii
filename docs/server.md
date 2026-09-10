# Serverul website-ului și formularul SMTP

## Pornire pe acest calculator

Este necesar Node.js 22 sau mai nou. Din folderul proiectului:

```powershell
npm.cmd start
```

Alternativ, deschide `start-server.cmd` prin dublu clic. Website-ul și formularul sunt disponibile împreună la **http://127.0.0.1:3001**. Oprire: `Ctrl+C` în terminal. Serverul servește build-ul existent din `dist`; nu reconstruiește automat pagina la pornire.

După modificări în React/CSS, rulează `npm.cmd run build` și reîncarcă pagina. După schimbări în server sau `.env`, repornește serverul. Pe o instalare nouă: `npm.cmd ci`, creează `.env` după `.env.example`, apoi `npm.cmd run build` și `npm.cmd start`.

## Configurare

Configurația cerută este salvată local în `.env`, exclus din Git. Parola SMTP nu intră în sursele React, în `public` sau în `dist`. `.env.example` conține doar modelul fără credențiale.

- `HOST=127.0.0.1`: acces local. Pentru acces în rețea configurează interfața de ascultare corespunzătoare, de exemplu `0.0.0.0`.
- `PORT=3001`: portul serverului.
- `PUBLIC_ORIGIN`: la publicare prin reverse proxy, setează originea HTTPS a website-ului, fără slash final.
- `SMTP_*`: conexiunea, expeditorul și destinatarul sunt controlate doar de server. Expeditorul configurat este `GREENTECH Charity`, conform cererii. Destinatarul este `contact@greentechrealestate.ro`. Răspunsul la mesaj folosește emailul completat în formular.

Conexiunea folosește portul 587 cu STARTTLS obligatoriu, verificarea certificatului și timeout de conectare de 12 secunde. Vezi [documentația SMTP Nodemailer](https://nodemailer.com/smtp). Servirea fișierelor este limitată la `dist`, prin [Express static](https://expressjs.com/en/starter/static-files/).

## Comenzi și rute

```powershell
npm.cmd run smtp:verify
npm.cmd run test:server
```

`smtp:verify` verifică TLS și autentificarea; **nu trimite email**. `/api/health` arată că serverul funcționează și că trimiterea este configurată, fără să testeze conectivitatea SMTP la fiecare acces. `POST /api/quote` trimite cererea completată în formular; răspunsul reușit înseamnă că SMTP a acceptat mesajul pentru destinatar, nu că putem confirma citirea sau poziția în Inbox.

Formularul trimite direct datele completate când utilizatorul apasă „Trimite cererea”; rezumatul este generat automat din câmpuri. Erorile păstrează datele în pagina deschisă. După succes, o trimitere nouă necesită resetare explicită. Nu există upload de fișiere; planurile și fotografiile se trimit separat prin email.

Validarea și limitele sunt aplicate pe server: maxim 64 KB JSON, lungimi pe câmp, honeypot, origine verificată pentru cereri din browser, maxim 5 încercări/IP în 15 minute și 30 pe întregul proces. Maxim 2 trimiteri SMTP simultane. Destinatarul nu poate fi schimbat din browser. Nu se păstrează cereri într-o bază de date și nu se scriu mesajele sau credențialele în loguri.

Limitarea folosește memorie temporară și IP-ul conexiunii; se resetează la restart. În spatele unui proxy, limita per IP se aplică IP-ului proxy-ului până la configurarea explicită a unei politici pentru proxy de încredere. Mai multe instanțe necesită limitare comună la proxy sau într-un serviciu partajat. Configurează HTTPS la găzduire.

Pentru editare cu Vite, pornește serverul și `npm.cmd run dev` separat. Proxy-ul Vite trimite `/api` la portul 3001; dacă schimbi portul backendului, actualizează și ținta din `vite.config.js`. Vechiul `npm.cmd run preview` servește doar fișiere statice; pentru formularul SMTP folosește `npm.cmd start`.
