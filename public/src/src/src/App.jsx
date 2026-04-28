import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, FolderOpen, Folder, FileText, ChevronRight, ChevronDown, Settings, X, Move, CheckSquare, Square, Mic, Play, Pause, Globe, Sparkles, MessageSquare, StickyNote, Share2, Calendar, Copy, Users } from 'lucide-react';
import { ZEPTO_BLUE, DATE_GRAY, translations, getDateFolder } from './translations';
import { initialFolders, initialFiles } from './data';

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem('zepto_lang') || 'DA');
  const t = translations || translations.DA;
  const [view, setView] = useState('folders');
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('zepto_folders');
    return saved? JSON.parse(saved) : initialFolders(lang, t);
  });
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('zepto_files');
    return saved? JSON.parse(saved) : initialFiles(lang, t);
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(['indbox', 'meets']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedFile, setDraggedFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [activeTab, setActiveTab] = useState('transcription');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [newTag, setNewTag] = useState('');
  const audioRef = useRef(null);
  const recordInterval = useRef(null);

  useEffect(() => { localStorage.setItem('zepto_folders', JSON.stringify(folders)); }, [folders]);
  useEffect(() => { localStorage.setItem('zepto_files', JSON.stringify(files)); }, );
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(Math.floor(audio.currentTime));
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', updateTime); audio.removeEventListener('ended', onEnd); };
  }, [selectedFile]);

  const changeLang = (newLang) => {
    localStorage.setItem('zepto_lang', newLang);
    setLang(newLang);
    setFolders(prev => ({...prev, 'indbox': {...prev.indbox, name: translations[newLang].inbox }, 'meets': {...prev.meets, name: translations[newLang].meets }}));
    setShowSettings(false);
    showToast('Language changed');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const formatTime = (sec) => { const m = Math.floor(sec / 60); const s = sec % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
  const formatTimeStamp = (sec) => { const h = Math.floor(sec / 3600); const m = Math.floor((sec % 3600) / 60); const s = sec % 60; return h > 0? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; };

  const moveFile = (fileId, toFolderId) => {
    const fromFolderId = files[fileId].folder_id;
    if (fromFolderId === toFolderId) return;
    setFiles(prev => ({...prev, [fileId]: {...prev[fileId], folder_id: toFolderId }}));
    setFolders(prev => {
      const updated = {...prev };
      updated[fromFolderId].files = updated[fromFolderId].files.filter(f => f!== fileId);
      if (!updated[toFolderId].files.includes(fileId)) updated[toFolderId].files.push(fileId);
      return updated;
    });
    showToast(`${t.movedTo} ${folders[toFolderId].name}`);
  };

  const moveMultipleFiles = (toFolderId) => { selectedFiles.forEach(fid => moveFile(fid, toFolderId)); setSelectedFiles([]); setShowMoveModal(false); };
  const toggleFileSelect = (fileId) => { setSelectedFiles(prev => prev.includes(fileId)? prev.filter(id => id!== fileId) : [...prev, fileId]); };
  const handleDrop = (e, folderId) => { e.preventDefault(); if (draggedFile) { moveFile(draggedFile, folderId); setDraggedFile(null); } };

  const startRecording = () => {
    setIsRecording(true); setRecordTime(0);
    recordInterval.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false); clearInterval(recordInterval.current);
    const today = getDateFolder(new Date());
    const newId = `file_${Date.now()}`;
    const newFile = { id: newId, name: `${formatTimeStamp(recordTime)} ${t.newRecording || 'Ny optagelse'}.m4a`, folder_id: today.day, duration: recordTime, type: 'audio', transcription: [{ time: 0, text: t.noSpeech || 'Ingen tale' }], tags: [], notes: [], summary: '', lang: lang, status: 'ready', created_at: new Date().toISOString(), audioUrl: '' };
    setFiles(prev => ({...prev, [newId]: newFile }));
    setFolders(prev => ({...prev, [today.day]: {...prev[today.day], files: [...prev[today.day].files, newId] }}));
    showToast(t.fileReady); setRecordTime(0);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const id = `folder_${Date.now()}`;
    setFolders(prev => ({...prev, [id]: { id, name: newFolderName, type: 'user', color: ZEPTO_BLUE, files: [], parent: null }}));
    setNewFolderName(''); setShowNewFolder(false); showToast('Mappe oprettet');
  };

  const updateFile = (fileId, updates) => { setFiles(prev => ({...prev, [fileId]: {...prev[fileId],...updates }})); };
  const addTag = (fileId, tag) => { if (!tag.trim()) return; const cleanTag = tag.toLowerCase().replace(/\s+/g, '-'); updateFile(fileId, { tags: [...new Set([...files[fileId].tags, cleanTag])] }); setNewTag(''); };
  const addNote = (fileId) => { const note = prompt(`${t.addNote} ${formatTimeStamp(currentTime)}`); if (!note) return; updateFile(fileId, { notes: [...files[fileId].notes, { time: currentTime, text: note }] }); };
  const handleWordClick = (time) => { if (audioRef.current) { audioRef.current.currentTime = time; audioRef.current.play(); setIsPlaying(true); } };

  const handleChatSend = () => {
    if (!chatInput.trim() ||!selectedFile) return;
    const newMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]); setChatInput('');
    setTimeout(() => {
      const aiMsg = { role: 'ai', text: `Baseret på transskriptionen: ${files[selectedFile].summary.split('\n')[0]}` };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 500);
  };

  const copyTranscript = (fileId) => {
    const text = files[fileId].transcription.map(s => `[${formatTimeStamp(s.time)}] ${s.text}`).join('\n');
    navigator.clipboard.writeText(text); showToast(t.linkCopied);
  };

  const filteredFiles = Object.values(files).filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.transcription?.some(s => s.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
    f.tags.some(t => t.includes(searchQuery.toLowerCase()))
  );

  const renderFolders = (parentId = null, level = 0) => {
    return Object.values(folders).filter(f => f.parent === parentId).map(folder => {
      const isExpanded = expandedFolders.includes(folder.id);
      const childFolders = Object.values(folders).filter(f => f.parent === folder.id);
      const folderFiles = folder.files.map(id => files[id]).filter(Boolean);
      return (
        <div key={folder.id}>
          <div className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 cursor-pointer rounded group ${folder.type === 'date'? 'text-date-gray' : ''}`} style={{ paddingLeft: `${level * 20 + 12}px` }} onClick={() => childFolders.length > 0 && setExpandedFolders(prev => prev.includes(folder.id)? prev.filter(id => id!== folder.id) : [...prev, folder.id])} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, folder.id)}>
            {childFolders.length > 0 && (isExpanded? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            {folder.type === 'date'? <FolderOpen size={18} className="text-date-gray" /> : folder.id === 'meets'? <Calendar size={18} color={folder.color} /> : <Folder size={18} color={folder.color} />}
            <span className="flex-1 text-sm">{folder.name}</span>
            <span className="text-xs text-gray-400">{folder.files.length}</span>
          </div>
          {isExpanded && childFolders.map(f => renderFolders(f.id, level + 1))}
          {isExpanded && folderFiles.map(file => (
            <div key={file.id} draggable onDragStart={() => setDraggedFile(file.id)} className={`flex items-center gap-2 py-1.5 px-3 ml-6 hover:bg-blue-50 cursor-move rounded ${selectedFiles.includes(file.id)? 'bg-blue-100' : ''} ${selectedFile === file.id? 'bg-blue-50 border-l-2 border-zepto' : ''}`} onClick={(e) => { if (e.metaKey || e.ctrlKey) toggleFileSelect(file.id); else { setSelectedFile(file.id); setView('file'); setChatMessages([]); } }}>
              <button onClick={(e) => { e.stopPropagation(); toggleFileSelect(file.id); }}>{selectedFiles.includes(file.id)? <CheckSquare size={16} className="text-zepto" /> : <Square size={16} className="text-gray-300" />}</button>
              {file.type === 'meet'? <Calendar size={16} className="text-gray-400" /> : <FileText size={16} className="text-gray-400" />}
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-400">{formatTime(file.duration)}</span>
            </div>
          ))}
        </div>
      );
    });
  };

  if (view === 'file' && selectedFile) {
    const file = files[selectedFile];
    return (
      <div className="h-screen bg-white flex flex-col max-w-md mx-auto border-x">
        <audio ref={audioRef} src={file.audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
        <div className="border-b p-4">
          <button onClick={() => setView('folders')} className="mb-2"><X size={20} /></button>
          <h2 className="font-semibold mb-3 truncate">{file.name}</h2>
          {file.type === 'meet' && (<div className="flex items-center gap-2 text-xs text-gray-500 mb-3"><Users size={14} />{file.participants.join(', ')} • {new Date(file.meetDate).toLocaleDateString()}</div>)}
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => isPlaying? audioRef.current.pause() : audioRef.current.play()} className="w-10 h-10 rounded-full bg-zepto flex items-center justify-center text-white">{isPlaying? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}</button>
            <div className="flex-1"><div className="h-1 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-zepto transition-all" style={{ width: `${(currentTime / file.duration) * 100}%` }} /></div>
            <div className="text-xs text-gray-500 font-mono">{formatTime(currentTime)} / {formatTime(file.duration)}</div></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {file.tags.map(tag => (<span key={tag} className="px-2 py-1 bg-blue-50 text-zepto rounded text-xs">#{tag}</span>))}
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag(file.id, newTag)} placeholder={t.addTag} className="px-2 py-1 text-xs border rounded outline-none" />
          </div>
        </div>
        <div className="border-b flex">
          {['transcription', 'summary', 'chat'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium border-b-2 ${activeTab === tab? 'border-zepto text-zepto' : 'border-transparent text-gray-500'}`}>{tab === 'transcription' && <FileText size={16} className="inline mr-1" />}{tab === 'summary' && <Sparkles size={16} className="inline mr-1" />}{tab === 'chat' && <MessageSquare size={16} className="inline mr-1" />}{t[tab]}</button>))}
        </div>
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'transcription' && (<div className="space-y-2">{file.transcription?.map((seg, i) => {const isActive = currentTime >= seg.time && (i === file.transcription.length - 1 || currentTime < file.transcription[i + 1].time); return (<div key={i} className={`p-2 rounded ${isActive? 'bg-blue-50' : ''}`}><span className="text-xs text-gray-400 mr-2">[{formatTimeStamp(seg.time)}]</span><span className="cursor-pointer hover:text-zepto" onClick={() => handleWordClick(seg.time)}>{seg.text}</span></div>);})}{file.notes.map((note, i) => (<div key={i} className="p-2 rounded bg-yellow-50 border-yellow-200"><span className="text-xs text-gray-400 mr-2">[{formatTimeStamp(note.time)}]</span>📝 {note.text}</div>))}</div>)}
          {activeTab === 'summary' && (<div><div className="whitespace-pre-wrap text-sm mb-4">{file.summary || t.noResults}</div><button onClick={() => copyTranscript(file.id)} className="text-sm text-zepto flex items-center gap-1"><Copy size={16} />{t.copyTranscript}</button></div>)}
          {activeTab === 'chat' && (<div className="flex flex-col h-full"><div className="flex-1 space-y-3 mb-4">{chatMessages.length === 0? (<div className="text-sm text-gray-500 text-center py-8">{t.askFile}</div>) : chatMessages.map((msg, i) => (<div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user'? 'bg-blue-50 ml-8' : 'bg-gray-100 mr-8'}`}>{msg.text}</div>))}</div><div className="flex gap-2"><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} placeholder={t.askAnything} className="flex-1 p-2 border rounded-lg text-sm" /><button onClick={handleChatSend} className="px-4 py-2 bg-zepto text-white rounded-lg text-sm">{t.send}</button></div></div>)}
        </div>
        <div className="border-t p-3 flex gap-2">
          <button onClick={() => addNote(file.id)} className="flex-1 py-2 border rounded-lg text-sm flex items-center justify-center gap-1"><StickyNote size={16} />{t.addNote}</button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast(t.linkCopied); }} className="flex-1 py-2 border rounded-lg text-sm flex items-center justify-center gap-1"><Share2 size={16} />{t.share}</button>
        </div>
        <style jsx global>{`.text-zepto { color: ${ZEPTO_BLUE}; }.bg-zepto { background-color: ${ZEPTO_BLUE}; }.border-zepto { border-color: ${ZEPTO_BLUE}; }.text-date-gray { color: ${DATE_GRAY}; }`}</style>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col max-w-md mx-auto border-x">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">{t.myFolders}</h1>
          <div className="flex gap-2">
            {selectedFiles.length > 0 && (<button onClick={() => setShowMoveModal(true)} className="p-2 text-zepto"><Move size={20} /></button>)}
            <button onClick={() => setShowNewFolder(true)} className="p-2"><Plus size={20} /></button>
            <button onClick={() => setShowSettings(true)} className="p-2"><Settings size={20} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg mb-3">
          <Search size={18} className="text-gray-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search} className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <button onClick={isRecording? stopRecording : startRecording} className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${isRecording? 'bg-red-500' : 'bg-zepto'}`}>
          <Mic size={20} /> {isRecording? `${t.recording} ${formatTimeStamp(recordTime)}` : t.record}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {selectedFiles.length > 0 && (<div className="mb-2 px-3 py-2 bg-blue-50 rounded text-sm text-zepto flex items-center justify-between"><span>{selectedFiles.length} {t.filesSelected}</span><button onClick={() => setShowMoveModal(true)} className="font-medium">{t.move}</button></div>)}
        {searchQuery? (<div className="space-y-1">{filteredFiles.length === 0? <div className="text-center py-8 text-gray-400 text-sm">{t.noResults}</div> : filteredFiles.map(file => (<div key={file.id} onClick={() => { setSelectedFile(file.id); setView('file'); }} className="p-3 hover:bg-gray-50 rounded cursor-pointer"><div className="flex items-center gap-2 mb-1">{file.type === 'meet'? <Calendar size={16} className="text-gray-400" /> : <FileText size={16} className="text-gray-400" />}<span className="text-sm font-medium flex-1 truncate">{file.name}</span><span className="text-xs text-gray-400">{formatTime(file.duration)}</span></div><div className="text-xs text-gray-500 ml-6">{folders[file.folder_id]?.name}</div></div>))}</div>) : renderFolders()}
        <div className="mt-4 px-3 py-2 text-xs text-gray-400">{t.dragDropTip}</div>
      </div>
      {showNewFolder && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg w-full max-w-sm p-4"><h2 className="font-semibold mb-3">{t.newFolder}</h2><input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createFolder()} placeholder="Folder name" className="w-full p-2 border rounded-lg mb-3 text-sm" autoFocus /><div className="flex gap-2"><button onClick={() => setShowNewFolder(false)} className="flex-1 py-2 border rounded-lg text-sm">{t.cancel}</button><button onClick={createFolder} className="flex-1 py-2 bg-zepto text-white rounded-lg text-sm">{t.create}</button></div></div></div>)}
      {showSettings && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg w-full max-w-sm p-4"><div className="flex items-center justify-between mb-4"><h2 className="font-semibold">{t.settings}</h2><button onClick={() => setShowSettings(false)}><X size={20} /></button></div><div className="text-sm font-medium mb-2 flex items-center gap-2"><Globe size={16} />{t.language}</div>{['DA', 'EN', 'SV', 'NO', 'DE', 'PL'].map(l => (<button key={l} onClick={() => changeLang(l)} className={`w-full text-left p-3 rounded mb-1 ${lang === l? 'bg-blue-50 text-zepto font-medium' : 'hover:bg-gray-50'}`}>{l === 'DA' && 'Dansk'} {l === 'EN' && 'English'} {l === 'SV' && 'Svenska'}{l === 'NO' && 'Norsk'} {l === 'DE' && 'Deutsch'} {l === 'PL' && 'Polski'}</button>))}</div></div>)}
      {showMoveModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-lg w-full max-w-sm p-4 max-h-96 overflow-auto"><h2 className="font-semibold mb-3">{t.moveFiles}</h2>{Object.values(folders).map(folder => (<button key={folder.id} onClick={() => moveMultipleFiles(folder.id)} className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center gap-2 mb-1">{folder.type === 'date'? <FolderOpen size={16} className="text-date-gray" /> : folder.id === 'meets'? <Calendar size={16} color={folder.color} /> : <Folder size={16} color={folder.color} />}{folder.name}</button>))}<button onClick={() => setShowMoveModal(false)} className="w-full mt-2 py-2 border rounded">{t.cancel}</button></div></div>)}
      {toast && (<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50">{toast}</div>)}
      <style jsx global>{`.text-zepto { color: ${ZEPTO_BLUE}; }.bg-zepto { background-color: ${ZEPTO_BLUE}; }.border-zepto { border-color: ${ZEPTO_BLUE}; }.text-date-gray { color: ${DATE_GRAY
