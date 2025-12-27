import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { categorizeTask } from './services/geminiService';
import { getCurrentWeekDays, formatDate, getWeekdayName, toISODate } from './utils/dateUtils';
import { Category, CATEGORY_THEMES, Task, Person, Habit, Workout } from './types';
import { TaskModal } from './components/TaskModal';

// --- Icons ---
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const SaveIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

// Mobile Icons
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const BookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

// --- View Mode Context ---
const ViewModeContext = createContext<{ isMobile: boolean; toggleViewMode: () => void }>({ isMobile: false, toggleViewMode: () => {} });
const useViewMode = () => useContext(ViewModeContext);

// --- Components ---

const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2025') {
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-100/95 backdrop-blur-xl">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center mx-4">
        <div className="mb-8 flex justify-center">
           <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
           </div>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 mb-8 text-base">Personal Planer Locked</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            ref={inputRef}
            type="tel" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className={`w-full text-center text-3xl tracking-[0.5em] p-4 border-2 rounded-2xl outline-none transition-all placeholder-gray-300 ${error ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-100 bg-gray-50 text-gray-900 focus:border-black focus:ring-4 focus:ring-black/10'}`}
            maxLength={4}
            placeholder="••••"
          />
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 py-2 rounded-lg">Falscher Code</p>}
          <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl text-lg font-bold hover:bg-gray-800 transition-transform active:scale-95 shadow-xl">
            Entsperren
          </button>
        </form>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Abbrechen</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">Bestätigen</button>
        </div>
      </div>
    </div>
  )
};

const ResumeModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { journal, people } = useApp();
    if (!isOpen) return null;

    let totalTasks = 0;
    const categoryCount: Record<string, number> = {};
    const peopleCount: Record<string, number> = {};

    journal.forEach(entry => {
        entry.tasks.forEach(t => {
            if (t.completed) {
                totalTasks++;
                categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
                t.peopleIds.forEach(pid => {
                    peopleCount[pid] = (peopleCount[pid] || 0) + 1;
                });
            }
        });
    });

    const topPeople = Object.entries(peopleCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id, count]) => ({ name: people.find(p => p.id === id)?.name || '?', count }));

    const maxCat = Math.max(...Object.values(categoryCount), 0);
    const maxPpl = Math.max(...Object.values(peopleCount), 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 print:absolute print:bg-white print:inset-0">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 print:shadow-none print:max-h-full print:p-0">
                <div className="flex justify-between items-center mb-6 no-print">
                    <h2 className="text-2xl font-bold">Jahresrückblick (Resume)</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">Schließen</button>
                </div>
                <h1 className="text-3xl font-bold mb-8 hidden print:block">Jahresrückblick</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl text-center print:border print:border-gray-200">
                        <div className="text-4xl font-bold text-black mb-2">{totalTasks}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide">Erledigte Aufgaben</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center print:border print:border-gray-200">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{journal.length}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide">Wochen Dokumentiert</div>
                    </div>
                     <div className="bg-gray-50 p-6 rounded-xl text-center print:border print:border-gray-200">
                        <div className="text-4xl font-bold text-green-600 mb-2">{topPeople[0]?.name || '-'}</div>
                        <div className="text-sm text-gray-500 uppercase tracking-wide">Bester Freund</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold mb-4">Top Kategorien</h3>
                        <div className="space-y-3">
                            {Object.entries(categoryCount).map(([cat, count]) => (
                                <div key={cat}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{cat}</span>
                                        <span className="font-bold">{count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden print:border print:border-gray-300">
                                        <div className="h-full bg-black rounded-full print:bg-black" style={{ width: `${(count / maxCat) * 100}%`, printColorAdjust: 'exact' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-4">Meiste Zeit verbracht mit</h3>
                        <div className="space-y-3">
                             {topPeople.map((p, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{p.name}</span>
                                        <span className="font-bold">{p.count}x</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden print:border print:border-gray-300">
                                        <div className="h-full bg-blue-500 rounded-full print:bg-blue-500" style={{ width: `${(p.count / maxPpl) * 100}%`, printColorAdjust: 'exact' }}></div>
                                    </div>
                                </div>
                            ))}
                            {topPeople.length === 0 && <p className="text-gray-400 text-sm">Keine Daten verfügbar.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DataManagement = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = localStorage.getItem('mindful_weekly_data');
        if (!data) return;
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `journal-backup.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);
                
                // Robust validation check
                if (!parsed || (typeof parsed !== 'object')) {
                     throw new Error("Ungültiges Dateiformat (Kein JSON Objekt).");
                }
                
                // Check if it looks like a backup of this app
                if (!Array.isArray(parsed.tasks) && !Array.isArray(parsed.journal)) {
                    throw new Error("Datenstruktur nicht erkannt. Fehlen 'tasks' oder 'journal'?");
                }

                if (window.confirm('Möchtest du deine aktuellen Daten wirklich mit dem Backup überschreiben?\nAlle ungesicherten Änderungen gehen verloren.')) {
                    localStorage.setItem('mindful_weekly_data', content);
                    window.location.reload();
                }
            } catch (err: any) {
                alert(`Fehler beim Laden: ${err.message || 'Unbekannter Fehler'}`);
            }
        };
        reader.readAsText(file);
        // Reset input to allow selecting same file again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-4 no-print bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div>
                 <h3 className="text-xl font-bold text-gray-900">Daten & Sync</h3>
                 <p className="text-sm text-gray-500 mt-1">Sichere deine gesamten Daten oder ziehe auf ein neues Gerät um.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center gap-2 p-6 bg-black text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform hover:bg-gray-800"
                >
                    <DownloadIcon width={32} height={32} />
                    <span className="text-lg">Backup speichern</span>
                    <span className="text-xs font-normal opacity-70">Exportieren</span>
                </button>
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 border-gray-200 text-gray-900 rounded-2xl font-bold shadow-sm active:scale-95 transition-transform hover:border-black hover:bg-gray-50"
                >
                    <UploadIcon width={32} height={32} />
                    <span className="text-lg">Backup laden</span>
                    <span className="text-xs font-normal opacity-70">Importieren</span>
                </button>
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleImport} 
                />
            </div>
            <p className="text-xs text-gray-400 text-center pt-2">
                Exportiert Aufgaben, Journal, Gewohnheiten, Ziele und Einstellungen in <code>journal-backup.json</code>.
            </p>
        </div>
    );
};

const Sidebar = () => {
  const location = useLocation();
  const linkClass = (path: string) => 
    `flex items-center gap-3 px-4 py-2 rounded-lg mb-1 transition-colors ${location.pathname === path ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen p-6 fixed left-0 top-0 flex flex-col no-print overflow-y-auto z-50">
      <h1 className="text-2xl font-bold mb-8 tracking-tight font-sans">Personal<span className="text-gray-400">Planer</span></h1>
      <nav className="flex-1 space-y-1">
        <Link to="/" className={linkClass('/')}><HomeIcon width={18} height={18}/> Wochenplan</Link>
        <Link to="/journal" className={linkClass('/journal')}><BookIcon width={18} height={18}/> Journal</Link>
        <Link to="/habits" className={linkClass('/habits')}><ActivityIcon width={18} height={18}/> Gewohnheiten</Link>
        <Link to="/training" className={linkClass('/training')}><ActivityIcon width={18} height={18}/> Training</Link>
        <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider pl-4">Planung</div>
        <Link to="/intention" className={linkClass('/intention')}><div className="w-[18px] text-center">I</div> Intentionen</Link>
        <Link to="/goals" className={linkClass('/goals')}><ChartIcon width={18} height={18}/> Ziele</Link>
        <Link to="/people" className={linkClass('/people')}><div className="w-[18px] text-center">P</div> Personen</Link>
        <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider pl-4">System</div>
        <Link to="/settings" className={linkClass('/settings')}><SettingsIcon width={18} height={18}/> Einstellungen</Link>
      </nav>
      <div className="text-xs text-gray-400 mt-8">
        &copy; 2025 Personal Planer
      </div>
    </div>
  );
};

const CategoryLegend = () => (
  <div className="flex gap-4 mb-6 flex-wrap text-sm no-print">
    {Object.entries(CATEGORY_THEMES).map(([cat, theme]) => (
      <div key={cat} className={`px-3 py-1 rounded-full border ${theme.badge}`}>
        {cat}
      </div>
    ))}
  </div>
);

const TaskItem = ({ task, onEdit, onDelete, onToggle, readOnly = false }: { task: Task, onEdit?: (t: Task) => void, onDelete?: (id: string) => void, onToggle?: (t: Task) => void, readOnly?: boolean }) => {
  const { people } = useApp();
  const peopleNames = task.peopleIds.map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ');
  const theme = CATEGORY_THEMES[task.category] || CATEGORY_THEMES[Category.UNASSIGNED];

  const handleDragStart = (e: React.DragEvent) => {
      if (readOnly) return;
      e.dataTransfer.setData('taskId', task.id);
      e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
        draggable={!readOnly}
        onDragStart={handleDragStart}
        className={`group flex items-start gap-3 p-3 rounded-2xl md:rounded-r-lg border-t border-b border-r border-l-[4px] mb-2 bg-white transition-all shadow-sm ${theme.border} border-gray-100 ${!readOnly ? 'cursor-move active:opacity-50' : ''} print:break-inside-avoid`}
    >
      <button 
        type="button"
        disabled={readOnly}
        onClick={() => onToggle && onToggle(task)}
        className={`mt-1 w-6 h-6 md:w-5 md:h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${task.completed ? 'bg-black border-black text-white' : 'border-gray-300 hover:border-black'} ${readOnly ? 'cursor-default' : ''} print:border-black`}
      >
        {task.completed && <CheckIcon />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-base md:text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 font-medium'} truncate`}>{task.text}</p>
        
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={`text-[10px] uppercase tracking-wider font-bold opacity-80 ${theme.text}`}>{task.category}</span>
          {peopleNames && <span className="text-[10px] text-gray-600 flex items-center gap-1">mit {peopleNames}</span>}
          {task.additionalInfo && <span className="text-[10px] text-gray-500 truncate max-w-full">• {task.additionalInfo}</span>}
        </div>
      </div>

      {!readOnly && (
      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity no-print">
         <button type="button" onClick={() => onDelete && onDelete(task.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon /></button>
      </div>
      )}
    </div>
  );
};

// Reusable Day Column for Weekly Plan AND Journal
const DayColumn = ({ 
    date, 
    tasks, 
    reflection, 
    onAddTask, 
    onToggleTask, 
    onEditTask, 
    onDeleteTask, 
    onUpdateReflection,
    habits,
    onToggleHabit,
    onTaskDrop,
    readOnly = false 
}: any) => {
    const isToday = toISODate(new Date()) === toISODate(date);
    
    const handleDragOver = (e: React.DragEvent) => {
        if (readOnly) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        if (readOnly || !onTaskDrop) return;
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) onTaskDrop(taskId, toISODate(date));
    };
    
    return (
        <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`bg-white rounded-xl border ${isToday && !readOnly ? 'border-black ring-1 ring-black' : 'border-gray-200'} overflow-hidden shadow-sm flex flex-col h-full min-h-[600px] print:min-h-0 print:border-gray-300 transition-colors ${!readOnly ? 'hover:bg-gray-50/50' : ''}`}
        >
            {/* Header */}
            <div className={`p-4 ${isToday && !readOnly ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} border-b border-gray-200 flex justify-between items-baseline print:bg-gray-100 print:text-black print:border-gray-300`}>
                <div>
                    <span className="text-sm font-bold uppercase mr-2">{getWeekdayName(date)}</span>
                    <span className={`font-mono ${isToday && !readOnly ? 'text-gray-300' : 'text-gray-400'} print:text-black`}>{formatDate(date)}</span>
                </div>
                {!readOnly && onAddTask && (
                    <button 
                        type="button"
                        onClick={onAddTask}
                        className={`text-xs font-medium hover:underline ${isToday && !readOnly ? 'text-white' : 'text-blue-600'} no-print`}
                    >
                        + Hinzufügen
                    </button>
                )}
            </div>

            {/* Habits Section - Now styled like regular tasks but pinned to top */}
            {habits && habits.length > 0 && !readOnly && (
                <div className="px-4 pt-4 pb-2">
                     {habits.map((habit: Habit) => {
                         const isDone = tasks.some((t: Task) => t.habitId === habit.id && t.completed);
                         const catTheme = CATEGORY_THEMES[habit.category] || CATEGORY_THEMES[Category.UNASSIGNED];
                         return (
                             <div 
                                key={habit.id} 
                                onClick={() => onToggleHabit(habit)} 
                                className={`flex items-center gap-2 mb-2 p-2 rounded border cursor-pointer group transition-all ${isDone ? 'bg-gray-50 border-gray-200' : 'bg-white border-dashed border-gray-300 hover:border-black'}`}
                             >
                                 <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isDone ? 'bg-black border-black text-white' : 'border-gray-300'}`}>
                                     {isDone && <CheckIcon />}
                                 </div>
                                 <span className={`text-xs font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{habit.title}</span>
                                 <span className={`text-[9px] uppercase tracking-wide ml-auto ${catTheme.text}`}>{habit.category}</span>
                             </div>
                         )
                     })}
                     <div className="h-px bg-gray-100 my-2"></div>
                </div>
            )}

            {/* Tasks Content */}
            <div className="p-4 flex-1">
                {tasks.filter((t:Task) => !t.habitId).length === 0 && (!habits || habits.length === 0) ? (
                    <div className="text-gray-300 text-sm italic py-4 text-center">Frei</div>
                ) : (
                    tasks.filter((t:Task) => !t.habitId).map((task: Task) => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onEdit={onEditTask} 
                        onDelete={onDeleteTask}
                        onToggle={onToggleTask}
                        readOnly={readOnly}
                    />
                    ))
                )}
            </div>

            {/* Daily Reflection Section */}
            <div className="bg-gray-50 border-t border-gray-100 p-4 print:bg-white print:border-t-2 print:border-gray-200">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Tägliche Reflexion</h4>
                <div className="space-y-3">
                    <input 
                        readOnly={readOnly}
                        type="text"
                        value={reflection.mood}
                        onChange={(e) => onUpdateReflection && onUpdateReflection('mood', e.target.value)}
                        placeholder="Gefühl..."
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-black outline-none print:border-none print:p-0 print:text-sm"
                    />
                     <input 
                        readOnly={readOnly}
                        type="text"
                        value={reflection.gratitude}
                        onChange={(e) => onUpdateReflection && onUpdateReflection('gratitude', e.target.value)}
                        placeholder="Dankbar..."
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-black outline-none print:border-none print:p-0 print:text-sm"
                    />
                     <input 
                        readOnly={readOnly}
                        type="text"
                        value={reflection.improvement}
                        onChange={(e) => onUpdateReflection && onUpdateReflection('improvement', e.target.value)}
                        placeholder="Verbesserung..."
                        className="w-full bg-white text-gray-900 border border-gray-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-black outline-none print:border-none print:p-0 print:text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

// --- Mobile Components ---

const MobileStickyInput = ({ onAdd }: { onAdd: (text: string, date: string) => void }) => {
    const [text, setText] = useState('');
    const [date, setDate] = useState(toISODate(new Date()));
    const weekDays = getCurrentWeekDays();

    const handleSubmit = () => {
        if(text.trim()) {
            onAdd(text, date);
            setText('');
        }
    }

    return (
        <div className="fixed bottom-28 left-0 right-0 px-5 z-40 flex justify-center">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 flex items-center p-2 pl-4 gap-3">
                <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Neue Aufgabe..." 
                    className="flex-1 bg-transparent text-lg outline-none placeholder-gray-400 h-10 min-w-0"
                />
                 <select 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-50 rounded-lg text-xs font-bold px-2 py-1 h-8 outline-none border border-gray-100 text-gray-600 max-w-[80px]"
                 >
                    {weekDays.map(d => <option key={toISODate(d)} value={toISODate(d)}>{getWeekdayName(d).slice(0,3)}</option>)}
                </select>
                <button onClick={handleSubmit} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-transform flex-shrink-0">
                    <PlusIcon />
                </button>
            </div>
        </div>
    )
}

const MobileTodo = () => {
    const { tasks, habits, addTask, updateTask, deleteTask, endWeek, toggleHabitForDate } = useApp();
    const weekDays = getCurrentWeekDays();
    const todayISO = toISODate(new Date());

    const handleAdd = async (text: string, date: string) => {
        const cat = await categorizeTask(text);
        const newTask: Task = {
            id: Date.now().toString(36), text, completed: false, date, category: cat, peopleIds: [], createdAt: Date.now()
        };
        addTask(newTask);
    }

    return (
        <div className="p-5 pt-8 fade-in pb-40">
            <header className="mb-8">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{new Date().toLocaleDateString('de-DE', {weekday: 'long', month:'long', day:'numeric'})}</div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dein Fokus</h1>
            </header>

            {habits.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Habits</h3>
                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar">
                        {habits.map(h => {
                            const isDoneToday = tasks.some(t => t.habitId === h.id && t.date === todayISO && t.completed);
                            return (
                                <button key={h.id} onClick={() => toggleHabitForDate(h, todayISO)} className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isDoneToday ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'} shadow-sm`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isDoneToday ? 'border-white' : 'border-gray-300'}`}>
                                        {isDoneToday && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className="font-bold text-sm whitespace-nowrap">{h.title}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {weekDays.map(day => {
                    const dateStr = toISODate(day);
                    const isToday = dateStr === todayISO;
                    const dayTasks = tasks.filter(t => t.date === dateStr && !t.habitId);
                    if (dateStr < todayISO && dayTasks.length === 0) return null;

                    return (
                        <div key={dateStr} className={isToday ? 'opacity-100' : 'opacity-80'}>
                             <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gray-50/95 backdrop-blur py-2 z-10">
                                <div className={`text-2xl font-bold ${isToday ? 'text-black' : 'text-gray-400'}`}>{getWeekdayName(day).slice(0,3)}</div>
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <div className="text-xs font-mono text-gray-400">{formatDate(day)}</div>
                             </div>
                             {dayTasks.length === 0 ? (
                                 <div className="text-center py-6 text-gray-400 italic text-sm bg-gray-100/50 rounded-2xl border border-dashed border-gray-200">Keine Aufgaben</div>
                             ) : (
                                 <div className="space-y-3">
                                     {dayTasks.map(t => (
                                         <TaskItem key={t.id} task={t} onToggle={(tk) => updateTask({...tk, completed: !tk.completed})} onDelete={deleteTask} />
                                     ))}
                                 </div>
                             )}
                        </div>
                    )
                })}
            </div>
            
            <button onClick={endWeek} className="w-full mt-12 mb-8 bg-gray-200 text-gray-800 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide">Woche abschließen</button>
            <MobileStickyInput onAdd={handleAdd} />
        </div>
    )
}

const MobileMenu = () => {
    const navigate = useNavigate();
    const menuItems = [
        { id: 'training', label: 'Training', desc: 'Workout Pläne', icon: <ActivityIcon /> },
        { id: 'people', label: 'Personen', desc: 'Kontakte verwalten', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
        { id: 'intention', label: 'Intentionen', desc: 'Ziele & Hypothesen', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> },
        { id: 'goals', label: 'Ziele', desc: 'Langfristige Planung', icon: <ChartIcon /> },
    ];

    return (
        <div className="p-5 pt-8 fade-in pb-40">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Menü</h1>
            <div className="grid grid-cols-1 gap-4 mb-8">
                {menuItems.map(item => (
                    <button key={item.id} onClick={() => navigate(`/${item.id}`)} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 active:scale-95 transition-transform text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black">{item.icon}</div>
                        <div className="flex-1">
                            <div className="font-bold text-xl text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.desc}</div>
                        </div>
                        <div className="text-gray-300"><ArrowRightIcon /></div>
                    </button>
                ))}
            </div>
            
            <DataManagement />
        </div>
    )
}

const MobileJournal = () => {
    const { journal } = useApp();
    return (
        <div className="p-5 pt-8 fade-in pb-40">
            <header className="mb-8 flex justify-between items-end">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Journal</h1>
                <button onClick={() => window.print()} className="bg-gray-100 p-3 rounded-full"><BookIcon /></button>
            </header>
            <div className="space-y-6">
                {journal.length === 0 && <div className="text-center py-20 text-gray-400">Archiv ist leer.</div>}
                {journal.map(entry => (
                    <div key={entry.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">{entry.weekLabel}</h3>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{entry.date}</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl text-gray-600 italic text-sm mb-6">
                            "{entry.notes || 'Keine Notizen...'}"
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Highlights</div>
                            {entry.tasks.slice(0, 3).map(t => <div key={t.id} className="flex items-center gap-2 text-sm text-gray-700"><div className="w-1.5 h-1.5 bg-black rounded-full"></div> {t.text}</div>)}
                            {entry.tasks.length > 3 && <div className="text-xs text-gray-400 mt-1">+ {entry.tasks.length - 3} weitere</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Simple helper to check active state
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/', icon: <HomeIcon />, label: 'Plan' },
        { path: '/journal', icon: <BookIcon />, label: 'Journal' },
        { path: '/habits', icon: <ActivityIcon />, label: 'Habits' },
        { path: '/menu', icon: <MenuIcon />, label: 'Mehr' },
    ];

    return (
        <div className="flex flex-col w-full h-full bg-gray-50">
             <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                {children}
             </main>
             {/* Floating Navigation Dock */}
             <nav className="fixed bottom-6 left-4 right-4 bg-white shadow-2xl rounded-3xl border border-gray-100/50 z-50 h-[4.5rem] flex items-center justify-around px-2 pb-0">
                {navItems.map(item => {
                    const active = isActive(item.path);
                    return (
                        <button 
                            key={item.path}
                            onClick={() => navigate(item.path)} 
                            className={`flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all duration-200 ${active ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-black text-white shadow-lg translate-y-[-4px]' : ''}`}>
                                {React.cloneElement(item.icon as React.ReactElement<any>, { width: active ? 20 : 24, height: active ? 20 : 24 })}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 transition-all ${active ? 'opacity-100 translate-y-[-2px]' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}

// --- Pages ---

const HabitsPage = () => {
    const { habits, addHabit, deleteHabit } = useApp();
    const [newHabit, setNewHabit] = useState('');
    const [cat, setCat] = useState<Category>(Category.UNASSIGNED);
    const { isMobile } = useViewMode();

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(newHabit.trim()) {
            addHabit(newHabit.trim(), cat);
            setNewHabit('');
        }
    }

    return (
        <div className={`max-w-3xl mx-auto font-sans ${isMobile ? 'p-5 pt-8 pb-32' : ''}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Gewohnheiten</h2>
            <p className="text-gray-500 mb-8">Kleine Schritte jeden Tag. Level dich hoch!</p>

            <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <input 
                    type="text" 
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="Neue Gewohnheit..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg outline-none bg-white text-black"
                />
                 <select 
                  value={cat}
                  onChange={(e) => setCat(e.target.value as Category)}
                  className="bg-white text-gray-900 border border-gray-300 rounded-lg p-2"
                 >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                 </select>
                <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Starten
                </button>
            </form>

            <div className="grid gap-4">
                {habits.map(habit => {
                    const theme = CATEGORY_THEMES[habit.category] || CATEGORY_THEMES[Category.UNASSIGNED];
                    return (
                    <div key={habit.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xl border-2 border-yellow-200">
                                {habit.level}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    {habit.title}
                                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${theme.badge} border-none`}>{habit.category}</span>
                                </h3>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                    Streak: {habit.streak} Tage
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteHabit(habit.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                            <TrashIcon />
                        </button>
                    </div>
                )})}
                 {habits.length === 0 && <div className="text-center text-gray-400 py-10">Noch keine Gewohnheiten. Starte heute!</div>}
            </div>
        </div>
    );
};

const TrainingPage = () => {
    const { workouts, addWorkout, deleteWorkout, scheduleWorkout } = useApp();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [scheduledDays, setScheduledDays] = useState<number[]>([]);
    const weekDays = getCurrentWeekDays();
    const { isMobile } = useViewMode();

    const toggleDay = (idx: number) => {
        setScheduledDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            addWorkout(name.trim(), desc.trim(), scheduledDays);
            setName('');
            setDesc('');
            setScheduledDays([]);
        }
    }

    return (
        <div className={`max-w-4xl mx-auto font-sans ${isMobile ? 'p-5 pt-8 pb-32' : ''}`}>
             <h2 className="text-3xl font-bold text-gray-900 mb-2">Training</h2>
             <p className="text-gray-500 mb-8">Erstelle Pläne und weise sie Tagen zu.</p>

             <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-[1fr_2fr]'}`}>
                 {/* Creator */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                     <h3 className="font-bold text-lg mb-4">Neuer Plan</h3>
                     <form onSubmit={handleAdd} className="space-y-4">
                         <input 
                            value={name} onChange={e => setName(e.target.value)}
                            placeholder="Name (z.B. Push Day)"
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black bg-white"
                         />
                         <textarea 
                            value={desc} onChange={e => setDesc(e.target.value)}
                            placeholder="Übungen (z.B. Bankdrücken 3x8...)"
                            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-black h-32 resize-none bg-white"
                         />
                         <div className="flex gap-1 flex-wrap">
                            {weekDays.map((d, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => toggleDay(i)}
                                    className={`w-8 h-8 rounded-full text-xs font-bold transition-colors border ${scheduledDays.includes(i) ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 hover:border-black'}`}
                                >
                                    {getWeekdayName(d).slice(0, 2)}
                                </button>
                            ))}
                         </div>
                         <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800">Plan erstellen</button>
                     </form>
                 </div>

                 {/* List */}
                 <div className="space-y-6">
                     {workouts.map(w => (
                         <div key={w.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <h3 className="font-bold text-xl">{w.name}</h3>
                                     <p className="text-gray-500 text-sm whitespace-pre-line mt-2">{w.description}</p>
                                     <div className="flex gap-2 mt-3">
                                        {weekDays.map((d, i) => (
                                            <div key={i} className={`w-2 h-2 rounded-full ${w.scheduledDays.includes(i) ? 'bg-green-500' : 'bg-gray-200'}`} title={getWeekdayName(d)}></div>
                                        ))}
                                     </div>
                                 </div>
                                 <button onClick={() => deleteWorkout(w.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                             </div>
                             
                             <div className="border-t border-gray-100 pt-4">
                                 <span className="text-xs font-bold uppercase text-gray-400 block mb-2">Planen für:</span>
                                 <div className="flex flex-wrap gap-2">
                                     {weekDays.map(day => (
                                         <button 
                                            key={toISODate(day)}
                                            onClick={() => { scheduleWorkout(w, toISODate(day)); alert(`${w.name} für ${getWeekdayName(day)} geplant!`); }}
                                            className="px-3 py-1 bg-gray-100 hover:bg-black hover:text-white rounded-md text-xs font-medium transition-colors"
                                         >
                                             {getWeekdayName(day).slice(0, 2)}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     ))}
                     {workouts.length === 0 && <div className="text-center text-gray-400 py-10">Erstelle deinen ersten Trainingsplan.</div>}
                 </div>
             </div>
        </div>
    );
}

const WeeklyTodo = () => {
  const { tasks, addTask, updateTask, deleteTask, endWeek, dailyReflections, updateDailyReflection, habits, toggleHabitForDate } = useApp();
  const weekDays = getCurrentWeekDays();
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { isMobile } = useViewMode();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    setLoading(true);
    const category = await categorizeTask(newTaskText);
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2,9);

    const newTask: Task = {
      id: generateId(),
      text: newTaskText,
      completed: false,
      date: selectedDate,
      category,
      peopleIds: [],
      createdAt: Date.now()
    };

    addTask(newTask);
    setNewTaskText('');
    setLoading(false);
  };

  const handleToggle = (task: Task) => {
    updateTask({ ...task, completed: !task.completed });
  };

  const confirmEndWeek = () => {
    endWeek();
    setShowConfirm(false);
    window.location.reload(); 
  };

  const onTaskDrop = (taskId: string, targetDate: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
          updateTask({ ...task, date: targetDate });
      }
  };

  if (isMobile) {
      return <MobileTodo />;
  }

  return (
    <div className="w-full max-w-[98%] mx-auto pb-20 font-sans">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Wochenplan</h2>
          <p className="text-gray-500 mt-1">Plane deine Woche und reflektiere täglich.</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowConfirm(true)}
          className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          Woche beenden
        </button>
      </header>

      <CategoryLegend />

      {/* Quick Add Bar */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-center sticky top-4 z-20">
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Neue Aufgabe hinzufügen..."
          className="flex-1 bg-white text-gray-900 border-none outline-none placeholder-gray-400 text-base font-sans"
          disabled={loading}
        />
        <select 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-sm border-gray-200 border rounded-lg px-2 py-2 bg-white text-gray-900 font-sans"
        >
          {weekDays.map(day => (
            <option key={toISODate(day)} value={toISODate(day)}>
              {getWeekdayName(day)}, {formatDate(day)}
            </option>
          ))}
        </select>
        <button 
          type="submit" 
          disabled={loading || !newTaskText.trim()}
          className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : <PlusIcon />}
        </button>
      </form>

      {/* Vertical Grid View - Expanded */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-stretch">
        {weekDays.map(day => {
          const dateStr = toISODate(day);
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const reflection = dailyReflections[dateStr] || { mood: '', gratitude: '', improvement: '' };
          
          return (
            <div key={dateStr} className="min-h-[600px]">
                <DayColumn 
                    date={day}
                    tasks={dayTasks}
                    reflection={reflection}
                    onAddTask={() => setSelectedDate(dateStr)}
                    onToggleTask={handleToggle}
                    onEditTask={setEditingTask}
                    onDeleteTask={deleteTask}
                    onUpdateReflection={(field: string, val: string) => updateDailyReflection(dateStr, field as any, val)}
                    habits={habits}
                    onToggleHabit={(h: Habit) => toggleHabitForDate(h, dateStr)}
                    onTaskDrop={onTaskDrop}
                />
            </div>
          );
        })}
      </div>

      <TaskModal 
        isOpen={!!editingTask} 
        task={editingTask} 
        onClose={() => setEditingTask(null)}
        onSave={(updated) => { updateTask(updated); setEditingTask(null); }}
      />
      
      <ConfirmModal 
        isOpen={showConfirm}
        title="Woche beenden?"
        message={`Alle Aufgaben werden ins Journal verschoben.\nEine neue Woche beginnt.`}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmEndWeek}
      />
    </div>
  );
};

const Journal = () => {
  const { journal, updateJournalEntry, people } = useApp();
  const [showResume, setShowResume] = useState(false);
  const { isMobile } = useViewMode();

  const handlePrint = () => {
    window.print();
  };

  if (isMobile) return <MobileJournal />;

  return (
    <div className="max-w-3xl mx-auto font-sans pb-20">
       <header className="flex justify-between items-center mb-8 no-print">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Journal</h2>
          <p className="text-gray-500 mt-1">Archivierte Wochen im Tagebuch-Format.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowResume(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <ChartIcon /> Resume
            </button>
            <button type="button" onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
                <DownloadIcon /> PDF
            </button>
        </div>
      </header>
      
      <div className="space-y-16">
        {journal.length === 0 && <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Noch keine Einträge.</p>
            <p className="text-gray-400 text-sm mt-2">Beende eine Woche im Wochenplan, um das Journal zu füllen.</p>
        </div>}
        
        {journal.map(entry => {
          // Group tasks by date string
          const groupedTasks: Record<string, Task[]> = {};
          entry.tasks.forEach(t => {
              if(!groupedTasks[t.date]) groupedTasks[t.date] = [];
              groupedTasks[t.date].push(t);
          });
          
          const sortedDates = Object.keys(groupedTasks).sort();

          return (
          <article key={entry.id} className="journal-entry pb-12 border-b border-gray-300 last:border-0 print:border-none print:break-after-always">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{entry.weekLabel}</h3>
                <span className="text-gray-400 font-mono text-sm">Archiviert am {entry.date}</span>
            </div>

            {/* Reflection Note Area - Keeps the "Notes" capability */}
            <div className="mb-8">
                 <textarea 
                    value={entry.notes}
                    onChange={(e) => updateJournalEntry(entry.id, e.target.value)}
                    className="w-full bg-transparent text-gray-600 outline-none resize-none font-sans italic text-sm"
                    placeholder="Generelle Gedanken zur Woche hinzufügen..."
                    rows={2}
                />
            </div>

            {/* Diary List View */}
            <div className="bg-[#1e1e1e] text-gray-200 p-8 rounded-xl font-sans shadow-2xl leading-relaxed text-sm">
                {sortedDates.map(dateStr => {
                     // Format date like "12.12"
                     const d = new Date(dateStr);
                     const dateHeader = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                     const dayTasks = groupedTasks[dateStr];

                     return (
                         <div key={dateStr} className="mb-6 last:mb-0">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                <span className="text-lg font-bold text-gray-100">{dateHeader}</span>
                             </div>
                             <ul className="pl-5 space-y-1">
                                {dayTasks.map(t => {
                                    // Construct the text: "Category - Text"
                                    const peopleNames = t.peopleIds.map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ');
                                    const withPeople = peopleNames ? ` (mit ${peopleNames})` : '';
                                    
                                    return (
                                        <li key={t.id} className="list-disc text-gray-300 marker:text-gray-500">
                                            <span>
                                                {/* Category Highlight */}
                                                {t.category && t.category !== Category.UNASSIGNED && (
                                                    <span className="text-gray-400">{t.category} - </span>
                                                )}
                                                <span className={`${t.category === Category.CREATIVE ? 'underline decoration-pink-400 decoration-wavy' : ''} ${t.category === Category.FOCUS ? 'underline decoration-blue-400 decoration-dotted' : ''}`}>
                                                    {t.text}
                                                </span>
                                                {withPeople}
                                            </span>
                                            {/* Sub-item / Additional Info */}
                                            {t.additionalInfo && (
                                                <ul className="pl-4 mt-1 list-[square] marker:text-gray-600 text-xs text-gray-400">
                                                    <li>{t.additionalInfo}</li>
                                                </ul>
                                            )}
                                        </li>
                                    )
                                })}
                             </ul>
                         </div>
                     )
                })}
                {sortedDates.length === 0 && <p className="text-gray-500 italic">Keine Einträge für diese Woche.</p>}
            </div>

          </article>
        )})}
      </div>

      <ResumeModal isOpen={showResume} onClose={() => setShowResume(false)} />
      <style>{`
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            ::-webkit-scrollbar { display: none; }
            .bg-\\[\\#1e1e1e\\] { background-color: #1e1e1e !important; color: #e5e5e5 !important; }
        }
      `}</style>
    </div>
  );
};

const IntentionAlignment = () => {
  const { intention, updateIntention } = useApp();
  const { isMobile } = useViewMode();
  
  const sections: { key: keyof typeof intention, title: string, placeholder: string }[] = [
    { key: 'day', title: 'Tages-Hypothese', placeholder: 'Heute werde ich glücklich sein, wenn ich...' },
    { key: 'week', title: 'Wochen-Hypothese', placeholder: 'Diese Woche konzentriere ich mich auf...' },
    { key: 'month', title: 'Monats-Hypothese', placeholder: 'Diesen Monat erforsche ich...' },
    { key: 'year', title: 'Jahres-Hypothese', placeholder: 'Dieses Jahr steht unter dem Stern...' },
  ];

  return (
    <div className={`max-w-3xl mx-auto font-sans ${isMobile ? 'p-5 pt-8 pb-32' : ''}`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Intention Alignment</h2>
        <p className="text-gray-500 mb-8">Finde heraus, was dich wirklich glücklich macht. Stelle Hypothesen auf.</p>

        <div className="grid gap-6">
            {sections.map(section => (
                <div key={section.key} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">{section.title}</h3>
                    <textarea 
                        value={intention[section.key]}
                        onChange={(e) => updateIntention(section.key, e.target.value)}
                        placeholder={section.placeholder}
                        className="w-full h-32 p-4 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black outline-none resize-none font-sans"
                    />
                </div>
            ))}
        </div>
    </div>
  );
};

const GoalsPage = () => {
    const { goals, updateGoals } = useApp();
    const { isMobile } = useViewMode();

    return (
        <div className={`max-w-3xl mx-auto font-sans ${isMobile ? 'p-5 pt-8 pb-32' : ''}`}>
             <h2 className="text-3xl font-bold text-gray-900 mb-2">Ziele</h2>
             <p className="text-gray-500 mb-8">Deine Visionen für die Zukunft.</p>

             <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                        Monatliche Ziele
                    </h3>
                    <textarea 
                        value={goals.monthly}
                        onChange={(e) => updateGoals('monthly', e.target.value)}
                        className="w-full h-48 p-4 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black transition-all outline-none font-sans"
                        placeholder="Was möchtest du diesen Monat erreichen?"
                    />
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <span className="w-2 h-8 bg-black rounded-full"></span>
                        Jährliche Ziele
                    </h3>
                    <textarea 
                        value={goals.yearly}
                        onChange={(e) => updateGoals('yearly', e.target.value)}
                        className="w-full h-48 p-4 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black transition-all outline-none font-sans"
                        placeholder="Wo siehst du dich am Ende des Jahres?"
                    />
                </div>
             </div>
        </div>
    );
};

const PeoplePage = () => {
    const { people, addPerson } = useApp();
    const [name, setName] = useState('');
    const { isMobile } = useViewMode();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            addPerson(name.trim());
            setName('');
        }
    }

    return (
        <div className={`max-w-2xl mx-auto font-sans ${isMobile ? 'p-5 pt-8 pb-32' : ''}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Personen</h2>
            <p className="text-gray-500 mb-8">Verwalte deine sozialen Kontakte für das Journaling.</p>

            <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name eingeben..."
                    className="flex-1 p-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-black outline-none shadow-sm font-sans"
                />
                <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Hinzufügen
                </button>
            </form>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {people.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Noch keine Personen eingetragen.</div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {people.map(person => (
                            <li key={person.id} className="p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                    {person.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900">{person.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const { isMobile } = useViewMode();
    return (
        <div className={`max-w-3xl mx-auto font-sans ${isMobile ? 'p-5 pt-8 pb-32' : ''}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Einstellungen</h2>
            <p className="text-gray-500 mb-8">Verwalte dein System und deine Daten.</p>
            <DataManagement />
        </div>
    )
}

// --- Layouts & Main App ---

const DesktopLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-[#f9fafb] font-sans">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 overflow-y-auto print:ml-0 print:p-0">
             {children}
          </main>
        </div>
    )
}

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { isMobile, toggleViewMode } = useViewMode();
    
    return (
        <div className="relative">
            {isMobile ? (
                <MobileLayout>{children}</MobileLayout>
            ) : (
                <DesktopLayout>{children}</DesktopLayout>
            )}
            
            {/* View Toggle Button */}
            <button 
                onClick={toggleViewMode} 
                className={`fixed z-[60] bg-white text-black border border-gray-200 shadow-2xl p-3 rounded-full flex items-center justify-center transition-transform active:scale-90 no-print ${isMobile ? 'bottom-24 right-6' : 'bottom-6 right-6'}`}
                title={isMobile ? "Desktop View" : "Mobile View"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
            </button>
        </div>
    )
}

const App = () => {
  const [locked, setLocked] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const wasUnlocked = sessionStorage.getItem('unlocked') === 'true';
    if (wasUnlocked) {
      setLocked(false);
    }
  }, []);

  const handleUnlock = () => {
    setLocked(false);
    sessionStorage.setItem('unlocked', 'true');
  };
  
  const toggleViewMode = () => setIsMobile(!isMobile);

  if (locked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <AppProvider>
      <ViewModeContext.Provider value={{ isMobile, toggleViewMode }}>
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<WeeklyTodo />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/habits" element={<HabitsPage />} />
                    <Route path="/training" element={<TrainingPage />} />
                    <Route path="/intention" element={<IntentionAlignment />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/people" element={<PeoplePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/menu" element={<MobileMenu />} />
                </Routes>
            </Layout>
        </HashRouter>
      </ViewModeContext.Provider>
    </AppProvider>
  );
};

export default App;