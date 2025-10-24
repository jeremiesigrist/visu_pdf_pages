import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';

interface JsonViewerProps {
  data: Chapter[];
  onPageSelect: (page: number, id: string) => void;
  activeChapterId: string | null;
  onDataChange: (data: Chapter[]) => void;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, onPageSelect, activeChapterId, onDataChange }) => {
    
    const [editablePages, setEditablePages] = useState<{ [id: string]: { start: string; end: string } }>({});

    useEffect(() => {
        const initialPages: { [id: string]: { start: string; end: string } } = {};
        data.forEach((item) => {
            initialPages[item.id] = { 
                start: String(item.page_debut), 
                end: String(item.page_fin) 
            };
        });
        setEditablePages(initialPages);
    }, [data]);

    const handleInputChange = (id: string, type: 'start' | 'end', value: string) => {
        setEditablePages(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [type]: value,
            }
        }));

        const pageNum = parseInt(value, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
            onPageSelect(pageNum, id);

            const newData = data.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        [type === 'start' ? 'page_debut' : 'page_fin']: pageNum
                    };
                }
                return item;
            });
            onDataChange(newData);
        }
    };

    const handleInputFocus = (id: string, type: 'start' | 'end') => {
        const pageNum = parseInt(editablePages[id]?.[type] || '0', 10);
         if (!isNaN(pageNum) && pageNum > 0) {
            onPageSelect(pageNum, id);
        }
    };

    const handleTypeChange = (id: string, newType: string) => {
        const newData = data.map((item) => {
            if (item.id === id) {
                return { ...item, type_bloc: newType };
            }
            return item;
        });
        onDataChange(newData);
    };
    
    const handleDelete = (idToDelete: string) => {
        // The `window.confirm` dialog is blocked in the sandboxed environment,
        // which was preventing the deletion from ever running.
        // By removing it, the deletion becomes immediate upon click.
        const newData = data.filter((item) => item.id !== idToDelete);
        onDataChange(newData);
    };

    const handleDuplicate = (idToDuplicate: string) => {
        const itemIndex = data.findIndex(item => item.id === idToDuplicate);
        if (itemIndex === -1) return;

        const itemToDuplicate = data[itemIndex];
        const duplicatedItem: Chapter = { 
            ...itemToDuplicate,
            id: crypto.randomUUID(),
        };
        
        const newData = [...data];
        newData.splice(itemIndex + 1, 0, duplicatedItem);
        onDataChange(newData);
    };

    const PageButton = ({ page, id }: { page: number, id: string }) => (
        <button
            onClick={() => onPageSelect(page, id)}
            className="px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label={`Go to original page ${page}`}
        >
            {page}
        </button>
    );

  return (
    <div className="p-4 space-y-3">
        <h2 className="text-lg font-bold text-white p-2 sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">Chapter Index</h2>
        {data.map((item) => (
            <div
                key={item.id}
                className={`relative rounded-lg transition-all duration-300 ${
                    activeChapterId === item.id 
                    ? 'bg-gray-700/80 border border-indigo-500 shadow-lg' 
                    : 'bg-gray-900/50 border border-transparent hover:border-gray-600'
                }`}
            >
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    <button
                        onClick={() => handleDuplicate(item.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                        title="Duplicate Block"
                        aria-label="Duplicate this block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
                        title="Delete Block"
                        aria-label="Delete this block"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    <h3 className="font-bold text-indigo-300 text-md pr-16">{item.chapitre_nom}</h3>
                    {item.sous_chapitre && (
                        <p className="text-sm text-gray-400 italic">
                            {item.sous_chapitre}
                        </p>
                    )}
                    <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-3 mt-3">
                        <select
                            value={item.type_bloc}
                            onChange={(e) => handleTypeChange(item.id, e.target.value)}
                            className={`appearance-none cursor-pointer px-2 py-1 rounded text-xs font-bold border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${item.type_bloc === 'QCM' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}
                            aria-label={`Block type for ${item.chapitre_nom}`}
                        >
                            <option value="QCM" className="bg-gray-800 text-gray-200 font-bold">QCM</option>
                            <option value="Correction" className="bg-gray-800 text-gray-200 font-bold">Correction</option>
                        </select>
                        <div className="space-y-2 text-right">
                             <div className="flex items-center justify-end gap-2 text-gray-300">
                                 <span className="w-10 text-left">Début:</span>
                                 <PageButton page={item.page_debut} id={item.id}/>
                                 <input 
                                     type="number"
                                     value={editablePages[item.id]?.start ?? ''}
                                     onChange={(e) => handleInputChange(item.id, 'start', e.target.value)}
                                     onFocus={() => handleInputFocus(item.id, 'start')}
                                     min="1"
                                     className="w-20 text-center bg-gray-800 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                     aria-label={`Editable start page for ${item.chapitre_nom}`}
                                 />
                             </div>
                             <div className="flex items-center justify-end gap-2 text-gray-300">
                                 <span className="w-10 text-left">Fin:</span>
                                 <PageButton page={item.page_fin} id={item.id}/>
                                 <input 
                                     type="number"
                                     value={editablePages[item.id]?.end ?? ''}
                                     onChange={(e) => handleInputChange(item.id, 'end', e.target.value)}
                                     onFocus={() => handleInputFocus(item.id, 'end')}
                                     min="1"
                                     className="w-20 text-center bg-gray-800 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                     aria-label={`Editable end page for ${item.chapitre_nom}`}
                                 />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );
};

export default JsonViewer;