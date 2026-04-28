export const ZEPTO_BLUE = '#0066FF';
export const DATE_GRAY = '#8E8E93';

export const translations = {
  DA: { appName: 'Zepto.ai', myFolders: 'Mine mapper', inbox: 'Indbox', newFolder: 'Ny mappe', search: 'Søg i alle filer', record: 'Optag ny', recording: 'Optager...', stop: 'Stop', transcription: 'Transskription', summary: 'Resumé', chat: 'Chat', addTag: 'Tilføj tag', addNote: 'Tilføj note', move: 'Flyt', delete: 'Slet', settings: 'Indstillinger', language: 'Sprog', fileReady: 'Fil klar', movedTo: 'Flyttet til', cancel: 'Annuller', create: 'Opret', moveFiles: 'Flyt filer', dragDropTip: 'Træk filer mellem mapper for at flytte dem', filesSelected: 'valgt', meets: 'Meets', newMeet: 'Nyt Meet', copyTranscript: 'Kopiér transskription', linkCopied: 'Link kopieret', askAnything: 'Spørg om hvad som helst...', send: 'Send', noResults: 'Ingen resultater', askFile: 'Spørg til filen...' },
  EN: { appName: 'Zepto.ai', myFolders: 'My folders', inbox: 'Inbox', newFolder: 'New folder', search: 'Search all files', record: 'Record new', recording: 'Recording...', stop: 'Stop', transcription: 'Transcription', summary: 'Summary', chat: 'Chat', addTag: 'Add tag', addNote: 'Add note', move: 'Move', delete: 'Delete', settings: 'Settings', language: 'Language', fileReady: 'File ready', movedTo: 'Moved to', cancel: 'Cancel', create: 'Create', moveFiles: 'Move files', dragDropTip: 'Drag files between folders to move them', filesSelected: 'selected', meets: 'Meets', newMeet: 'New Meet', copyTranscript: 'Copy transcript', linkCopied: 'Link copied', askAnything: 'Ask anything...', send: 'Send', noResults: 'No results', askFile: 'Ask about the file...' },
  SV: { appName: 'Zepto.ai', myFolders: 'Mina mappar', inbox: 'Inkorg', newFolder: 'Ny mapp', search: 'Sök i alla filer', record: 'Spela in ny', settings: 'Inställningar', language: 'Språk', move: 'Flytta', meets: 'Möten', dragDropTip: 'Dra filer mellan mappar', transcription: 'Transkription', summary: 'Sammanfattning', chat: 'Chat' },
  NO: { appName: 'Zepto.ai', myFolders: 'Mine mapper', inbox: 'Innboks', newFolder: 'Ny mappe', search: 'Søk i alle filer', record: 'Ta opp ny', settings: 'Innstillinger', language: 'Språk', move: 'Flytt', meets: 'Møter', dragDropTip: 'Dra filer mellom mapper', transcription: 'Transkripsjon', summary: 'Sammendrag', chat: 'Chat' },
  DE: { appName: 'Zepto.ai', myFolders: 'Meine Ordner', inbox: 'Posteingang', newFolder: 'Neuer Ordner', search: 'Alle Dateien durchsuchen', record: 'Neu aufnehmen', settings: 'Einstellungen', language: 'Sprache', move: 'Verschieben', meets: 'Meetings', dragDropTip: 'Dateien zwischen Ordnern ziehen', transcription: 'Transkription', summary: 'Zusammenfassung', chat: 'Chat' },
  PL: { appName: 'Zepto.ai', myFolders: 'Moje foldery', inbox: 'Odebrane', newFolder: 'Nowy folder', search: 'Szukaj we wszystkich plikach', record: 'Nagraj nowy', settings: 'Ustawienia', language: 'Język', move: 'Przenieś', meets: 'Spotkania', dragDropTip: 'Przeciągnij pliki między folderami', transcription: 'Transkrypcja', summary: 'Podsumowanie', chat: 'Czat' }
};

export const getDateFolder = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekday = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][d.getDay()];
  return { year: `${year}`, month: `${year}-${month}`, monthName: `${month}-${d.toLocaleDateString('da-DK', { month: 'long' })}`, day: `${year}-${month}-${day} ${weekday}` };
};
