export const initialFolders = (lang, t) => {
  const today = getDateFolder(new Date());
  return {
    'indbox': { id: 'indbox', name: t.inbox, type: 'system', color: '#0066FF', files: ['file1'], parent: null },
    [today.year]: { id: today.year, name: today.year, type: 'date', color: '#8E8E93', files: [], parent: null, children: [today.month] },
    [today.month]: { id: today.month, name: today.monthName, type: 'date', color: '#8E8E93', files: [], parent: today.year, children: [today.day] },
    [today.day]: { id: today.day, name: today.day, type: 'date', color: '#8E8E93', files: ['file2'], parent: today.month },
    'kunder': { id: 'kunder', name: 'Kunder', type: 'user', color: '#0066FF', files: [], parent: null },
    'meets': { id: 'meets', name: t.meets, type: 'system', color: '#0066FF', files: ['meet1'], parent: null },
  };
};

export const initialFiles = (lang, t) => {
  const today = getDateFolder(new Date());
  return {
    'file1': { id: 'file1', name: '08-12 Kunde-opkald.m4a', folder_id: 'indbox', duration: 754, type: 'audio', transcription: [{ time: 0, text: 'Hej, det er Michael fra Zepto.ai. Jeg ringer angående jeres tilbud.' },{ time: 8, text: 'Ja hej Michael. Vi har kigget på det. 15. maj lyder perfekt.' },{ time: 15, text: 'Super. Kan I sende fakturaen til økonomi@jensen.dk?' }], tags: ['kunde', 'tilbud'], notes: [{ time: 15, text: '@michael Husk at følge op på faktura' }], summary: '• Kunden accepterer 15. maj\n• Send faktura til økonomi@jensen.dk\n\nAction points:\n☐ Send faktura', lang: 'DA', status: 'ready', created_at: new Date().toISOString(), audioUrl: '' },
    'file2': { id: 'file2', name: '14-30 Intern sync.m4a', folder_id: today.day, duration: 1200, type: 'audio', transcription: [{ time: 0, text: 'Okay team, lad os gennemgå sprint-planen for næste uge.' }], tags: ['intern'], notes: [], summary: '• Sprint plan gennemgået', lang: 'DA', status: 'ready', created_at: new Date().toISOString(), audioUrl: '' },
    'meet1': { id: 'meet1', name: 'Q2 Salgsmøde', folder_id: 'meets', duration: 2400, type: 'meet', participants: ['Michael', 'Sarah', 'Jonas'], meetDate: new Date().toISOString(), transcription: [{ time: 0, text: 'Velkommen til Q2 salgsmøde.' }], tags: ['salg'], notes: [], summary: '• 12 varme leads\n\nAction points:\n☐ Sarah: Follow-up', lang: 'DA', status: 'ready', created_at: new Date().toISOString(), audioUrl: '' }
  };
};

const getDateFolder = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekday = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][d.getDay()];
  return { year: `${year}`, month: `${year}-${month}`, monthName: `${month}-${d.toLocaleDateString('da-DK', { month: 'long' })}`, day: `${year}-${month}-${day} ${weekday}` };
};
