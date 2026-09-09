// Single source of truth for ONE real project. Unknown facts stay null.
// Stage visuals were supplied by the owner; they do not confirm construction status.
// Add only owner-confirmed dates, statuses and specifications.
// See docs/project-content.md for the content format and publishing checklist.
export const project = {
  name: null,
  location: null,
  description: null,
  currentPhaseId: null,
  progress: null,
  updatedAt: null,
  cover: null,
  before: {
    src: '/img/a2e4a6fa-cc06-4205-a3c5-4a234d3b6713.png',
    alt: 'Teren liber între două clădiri, văzut dinspre stradă, în spatele gardului de șantier.',
    caption: '',
    width: 1672, height: 941,
  },
  current: {
    src: '/img/01ace805-8f36-44ba-a05b-b76f1fd5441e.png',
    alt: 'Construcție cu structură de beton și zidărie, văzută din același unghi, între aceleași clădiri.',
    caption: '',
    width: 1672, height: 941,
  },
  phases: [
    {
      id: 'site', title: 'Terenul', label: 'The beginning', status: null,
      image: { src: '/img/teren.png', alt: 'Echipă cu planuri pe un teren delimitat prin repere de trasare.', width: 1536, height: 1024 },
      note: 'Totul începe cu locul: înțelegerea terenului, măsurători și primele repere ale viitoarei construcții.',
    },
    {
      id: 'foundation', title: 'Fundația', label: 'Foundation', status: null,
      image: { src: '/img/fundatie.jpg', alt: 'Pregătirea fundației, cu săpături, armături și cofraje.', width: 1024, height: 682 },
      note: 'De la trasare la săpături, armare și cofrare. Baza construcției prinde contur, pas cu pas.',
    },
    {
      id: 'structure', title: 'Structura', label: 'Structure', status: null,
      image: { src: '/img/e58918db-5281-4261-b5ec-66bff22ea02b.png', alt: 'Elemente de beton la baza construcției, cofraje și verificarea nivelului.', width: 1536, height: 1024 },
      note: 'Primele elemente din beton definesc baza structurii. Planurile și verificările însoțesc fiecare etapă de execuție.',
    },
    {
      id: 'masonry', title: 'Zidăria', label: 'Masonry', status: null,
      image: { src: '/img/72a9befa-7b0f-4b87-86d5-dae5d437fc8b.png', alt: 'Vedere de ansamblu asupra unui șantier, cu structură de beton și pereți de zidărie.', width: 1408, height: 768 },
      note: 'Pereții conturează încăperile și relația dintre spații. Construcția capătă volum, proporții și o formă recognoscibilă.',
    },
    {
      id: 'installations', title: 'Instalațiile', label: 'Installations', status: null,
      image: { src: '/img/instalatie.png', alt: 'Lucrări la tubulatură, conducte și trasee de cabluri într-un interior nefinisat.', width: 1536, height: 1024 },
      note: 'Traseele tehnice sunt integrate în construcție. Instalațiile pregătesc spațiile pentru funcționarea de zi cu zi.',
    },
    {
      id: 'interiors', title: 'Interioare', label: 'Interior works', status: null,
      image: { src: '/img/instalatie.png', alt: 'Spațiu interior în lucru, cu materiale și instalații vizibile înaintea finisajelor.', width: 1536, height: 1024 },
      note: 'De la interiorul încă nefinisat la suprafețe, finisaje și detalii. Spațiile sunt pregătite pentru următoarea etapă a amenajării.',
    },
    {
      id: 'completion', title: 'Predarea', label: 'Completion', status: null,
      image: { src: '/img/ChatGPT Image Sep 9, 2026, 10_05_37 AM.png', alt: 'Scenă de predare a cheilor în fața unei clădiri rezidențiale.', width: 1536, height: 1024 },
      note: 'Verificările finale, documentele și predarea cheilor încheie parcursul construcției și deschid un nou început.',
    },
  ],
  materials: [],
  gallery: [],
  journal: [],
};

export function phaseStatus(phase) {
  return ({ completed: 'Completed', 'in-progress': 'In Progress', 'coming-soon': 'Coming Soon' })[phase?.status] ?? 'De confirmat';
}

export function currentPhase(projectData) {
  return projectData.phases?.find(phase => phase.id === projectData.currentPhaseId && ['in-progress', 'completed'].includes(phase.status)) ?? null;
}

export function projectProgress(projectData) {
  const value = projectData.progress;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

export function displayDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
