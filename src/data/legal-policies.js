export const legalContact = 'contact@greentechrealestate.ro';

export const legalPolicies = [
  {
    id: 'cookies',
    label: 'Politica de cookie-uri',
    title: 'Politica de cookie-uri',
    intro: 'Această informare descrie tehnologiile de stocare și resursele externe identificate în configurația actuală a website-ului Green Tech Real Estate. Ea privește funcționarea paginii și opțiunile disponibile în browser.',
    sections: [
      {
        title: 'Stocare tehnică de sesiune',
        paragraphs: [
          'Pagina folosește un marcaj tehnic de sesiune. În cazul unei probleme de încărcare, acesta reține dacă a fost încercată deja o reîncărcare automată, pentru a evita repetarea ei continuă. Marcajul poate fi eliminat după încărcarea reușită.',
          'Această valoare tehnică nu conține câmpurile formularului de ofertă. Este gestionată în sesiunea browserului și nu reprezintă un profil de publicitate. Stocarea de sesiune este diferită de cookie-urile transmise odată cu solicitările către un server.',
        ],
      },
      {
        title: 'Formular și instrumente de analiză',
        paragraphs: [
          'Formularul actual păstrează câmpurile în pagina deschisă; aplicația nu le salvează în stocarea persistentă sau de sesiune a browserului.',
          'În configurația aplicației examinată nu au fost identificate integrări active de analiză a traficului, remarketing sau publicitate. Eventualele cookie-uri ori servicii adăugate de platforma de găzduire trebuie verificate la publicare.',
        ],
      },
      {
        title: 'Fonturi și servicii externe',
        paragraphs: [
          'Foaia de stil include un import Google Fonts pentru Roboto. Browserul poate solicita resurse de la fonts.googleapis.com și fonts.gstatic.com. Alte fonturi ale paginii sunt găzduite local. Solicitarea unei resurse externe nu dovedește, singură, instalarea unui cookie de publicitate.',
        ],
      },
      {
        title: 'Control și actualizări',
        paragraphs: [
          'Poți gestiona sau șterge datele site-ului din setările browserului. Dacă sunt introduse tehnologii opționale care necesită consimțământ, acestea trebuie blocate până la alegerea ta, explicate pe scopuri și însoțite de o retragere la fel de simplă ca acceptarea. Continuarea navigării nu înlocuiește această alegere.',
          `Pentru întrebări despre stocarea descrisă aici, scrie la ${legalContact}. Informarea trebuie actualizată atunci când se schimbă serviciile sau configurația publicată.`,
        ],
      },
    ],
    sources: [
      { label: 'Your Europe — cookies și consimțământ', href: 'https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm' },
    ],
  },
  {
    id: 'privacy',
    label: 'Politica de confidențialitate',
    title: 'Politica de confidențialitate',
    intro: 'Pagina permite explorarea proiectului, pregătirea și trimiterea unei cereri de ofertă. Mai jos sunt descrise datele cerute și traseul lor în implementarea actuală, pentru a putea decide ce informații dorești să comunici.',
    sections: [
      {
        title: 'Versiune în lucru',
        paragraphs: [
          'Înainte de publicare se completează și se verifică denumirea juridică și adresa operatorului, temeiurile prelucrării, furnizorii de hosting și email, destinatarii, eventualele transferuri internaționale și duratele de păstrare. Mențiunea de copyright „Esa Coder Solutions” nu stabilește identitatea operatorului.',
        ],
      },
      {
        title: 'Ce informații poți introduce',
        paragraphs: [
          'Formularul solicită numele, adresa de email, tipul proiectului, locația și stadiul acestuia. Poți adăuga telefonul, suprafața aproximativă, serviciile dorite, bugetul orientativ și detalii despre lucrare. Câmpurile obligatorii sunt marcate în formular.',
          'Aceste informații ajută la formularea unei solicitări despre proiectul tău. Include numai detaliile relevante; nu este necesar să introduci documente de identitate sau informații personale despre alte persoane pentru a trimite cererea.',
        ],
      },
      {
        title: 'Cum funcționează cererea de ofertă',
        paragraphs: [
          'Completezi formularul și alegi „Trimite cererea”. Până la trimitere, datele rămân în memoria paginii și nu sunt salvate în stocarea persistentă sau de sesiune a browserului.',
          `Când alegi „Trimite cererea”, câmpurile formularului și un rezumat generat automat din acestea sunt transmise serverului website-ului. Serverul le expediază prin serviciul de email configurat, folosind SMTP, către ${legalContact}. Aplicația nu salvează cererile într-o bază de date. Mesajul trimis este prelucrat și păstrat de serviciile de email folosite.`,
          'Formularul nu transmite atașamente. Poți trimite separat planuri sau fotografii prin aplicația ta de email.',
        ],
      },
      {
        title: 'Resurse externe și păstrarea datelor',
        paragraphs: [
          'Pagina include Google Fonts și un marcaj tehnic de sesiune pentru încărcare, descrise în informarea Cookies. Aplicația de email și funcțiile de completare automată ale browserului sunt gestionate separat de formular.',
          'Durata păstrării mesajelor trimise, accesul furnizorilor și existența jurnalelor tehnice ale găzduirii nu pot fi stabilite din această pagină. Aceste aspecte trebuie confirmate și incluse în versiunea finală a informării.',
        ],
      },
      {
        title: 'Contact și drepturi',
        paragraphs: [
          `Pentru clarificări sau cereri privind datele tale, poți scrie la ${legalContact}. Secțiunea GDPR explică drepturile aplicabile, modul de solicitare și posibilitatea de a te adresa autorității de supraveghere.`,
        ],
      },
    ],
    sources: [
      { label: 'ANSPDCP — drepturile persoanelor vizate', href: 'https://dataprotection.ro/?lang=ro&page=Obiective_RGPD' },
    ],
  },
  {
    id: 'gdpr',
    label: 'GDPR',
    title: 'Drepturile tale privind datele personale',
    intro: 'Regulamentul general privind protecția datelor (RGPD/GDPR) oferă drepturi asupra datelor personale care te privesc. Aplicarea lor depinde de natura prelucrării, de temeiul acesteia și de condițiile prevăzute de lege.',
    sections: [
      {
        title: 'Ce poți solicita',
        paragraphs: ['În funcție de situație, poți cere:'],
        items: [
          'Informare și acces: confirmarea prelucrării, informații despre aceasta și o copie a datelor tale.',
          'Rectificare: corectarea datelor inexacte și completarea celor incomplete.',
          'Ștergere sau restricționare, atunci când sunt îndeplinite condițiile legale; pot exista obligații de păstrare.',
          'Portabilitate, pentru datele furnizate de tine, când prelucrarea automatizată se bazează pe consimțământ sau contract.',
          'Opoziție, în cazurile prevăzute de RGPD, inclusiv față de marketingul direct.',
          'Retragerea consimțământului, dacă acesta este temeiul prelucrării, fără afectarea legalității operațiunilor anterioare.',
        ],
      },
      {
        title: 'Cum trimiți o cerere',
        paragraphs: [
          `Scrie la ${legalContact} și precizează ce dorești să afli sau să modifici. Menționează, dacă este relevant, adresa folosită în corespondență și perioada aproximativă a discuției, pentru identificarea solicitării. Nu trebuie să folosești un formular special.`,
          'Dacă există îndoieli rezonabile privind identitatea solicitantului, pot fi cerute informații suplimentare necesare confirmării. Verificarea trebuie să fie proporțională. Nu trimite din proprie inițiativă o copie a actului de identitate sau alte date care nu sunt necesare cererii.',
        ],
      },
      {
        title: 'Termene și răspuns',
        paragraphs: [
          'Răspunsul trebuie comunicat fără întârzieri nejustificate, în principiu în cel mult o lună de la primirea cererii. Pentru cereri complexe sau numeroase, termenul poate fi prelungit cu încă două luni; prelungirea și motivele trebuie comunicate în prima lună.',
          'Exercitarea drepturilor este, în principiu, gratuită. Un refuz ori o limitare trebuie motivate și evaluate potrivit situației și prevederilor aplicabile.',
        ],
      },
      {
        title: 'Dacă nu primești o soluție',
        paragraphs: [
          'Poți depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP). Pagina oficială de mai jos explică procedura și documentele necesare. Păstrează cererea transmisă și răspunsul primit, pentru a putea prezenta corespondența relevantă.',
        ],
      },
    ],
    sources: [
      { label: 'ANSPDCP — prezentarea drepturilor RGPD', href: 'https://dataprotection.ro/?lang=ro&page=Obiective_RGPD' },
      { label: 'ANSPDCP — depunerea unei plângeri', href: 'https://www.dataprotection.ro/?page=Plangeri_pagina_principala' },
      { label: 'EDPB — exercitarea drepturilor și termene', href: 'https://www.edpb.europa.eu/sme/be-compliant/respect-individuals-rights_en' },
      { label: 'EDPB — verificarea proporțională a identității', href: 'https://www.edpb.europa.eu/system/files/2023-04/edpb_guidelines_202201_data_subject_rights_access_v2_en.pdf' },
    ],
  },
];
