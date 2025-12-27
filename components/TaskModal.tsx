import React, { useState, useEffect } from 'react';
import { Task, Category, Person, CATEGORY_THEMES } from '../types';
import { useApp } from '../context/AppContext';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const { people } = useApp();
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) setEditedTask({ ...task });
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handlePersonToggle = (personId: string) => {
    setEditedTask(prev => {
      if (!prev) return null;
      const exists = prev.peopleIds.includes(personId);
      return {
        ...prev,
        peopleIds: exists 
          ? prev.peopleIds.filter(id => id !== personId)
          : [...prev.peopleIds, personId]
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Aufgabe bearbeiten</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <input 
                type="text" 
                value={editedTask.text}
                onChange={(e) => setEditedTask({...editedTask, text: e.target.value})}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                 <input 
                  type="date"
                  value={editedTask.date}
                  onChange={(e) => setEditedTask({...editedTask, date: e.target.value})}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                 <select 
                  value={editedTask.category}
                  onChange={(e) => setEditedTask({...editedTask, category: e.target.value as Category})}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2"
                 >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                 </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zusätzliche Infos</label>
              <textarea 
                value={editedTask.additionalInfo || ''}
                onChange={(e) => setEditedTask({...editedTask, additionalInfo: e.target.value})}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-2 h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mit wem?</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {people.map(person => (
                  <button
                    key={person.id}
                    onClick={() => handlePersonToggle(person.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      editedTask.peopleIds.includes(person.id)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {person.name}
                  </button>
                ))}
                {people.length === 0 && <span className="text-xs text-gray-500 italic">Füge Personen im Menü "Personen" hinzu.</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Abbrechen</button>
          <button 
            onClick={() => onSave(editedTask)} 
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};