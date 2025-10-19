
import React from 'react';
import { Chapter } from '../types';

interface JsonViewerProps {
  data: Chapter[];
  onPageSelect: (page: number, index: number) => void;
  activeChapterIndex: number | null;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, onPageSelect, activeChapterIndex }) => {
    
    const PageButton = ({ page, index }: { page: number, index: number }) => (
        <button
            onClick={() => onPageSelect(page, index)}
            className="px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        >
            {page}
        </button>
    );

  return (
    <div className="p-4 space-y-3">
        <h2 className="text-lg font-bold text-white p-2 sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">Chapter Index</h2>
        {data.map((item, index) => (
            <div
                key={index}
                className={`rounded-lg transition-all duration-300 ${
                    activeChapterIndex === index 
                    ? 'bg-gray-700/80 border border-indigo-500 shadow-lg' 
                    : 'bg-gray-900/50 border border-transparent hover:border-gray-600'
                }`}
            >
                <div className="p-4 space-y-3">
                    <h3 className="font-bold text-indigo-300 text-md">{item.chapitre_nom}</h3>
                    {item.sous_chapitre && (
                        <p className="text-sm text-gray-400 italic">
                            {item.sous_chapitre}
                        </p>
                    )}
                    <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-3 mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.type_bloc === 'QCM' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}>
                            {item.type_bloc}
                        </span>
                        <div className="flex items-center gap-2 text-gray-300">
                            Pages:
                            <div className="flex gap-2">
                                <PageButton page={item.page_debut} index={index}/>
                                <span>-</span>
                                <PageButton page={item.page_fin} index={index}/>
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