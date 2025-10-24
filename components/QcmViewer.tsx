import React from 'react';
import { QCM } from '../types';

interface QcmViewerProps {
  data: QCM[];
  onSearch: (text: string, id: string) => void;
  activeQcmId: string | null;
  isSearching: boolean;
}

const QcmViewer: React.FC<QcmViewerProps> = ({ data, onSearch, activeQcmId, isSearching }) => {
  return (
    <div className="p-4 space-y-3">
        <h2 className="text-lg font-bold text-white p-2 sticky top-0 bg-gray-800/80 backdrop-blur-sm z-10">QCM Index</h2>
        {data.map((item) => (
            <div
                key={item.id}
                className={`rounded-lg transition-all duration-300 ${
                    activeQcmId === item.id 
                    ? 'bg-gray-700/80 border border-indigo-500 shadow-lg' 
                    : 'bg-gray-900/50 border border-transparent hover:border-gray-600'
                }`}
            >
                <div className="p-4 space-y-3">
                    <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">{item.sourceChapter}</p>
                    <h3 className="font-bold text-gray-200 text-md">
                        <span className="text-gray-400 mr-2">{item.numero}.</span>
                        {item.question}
                    </h3>
                    {item.sous_chapitre && (
                        <p className="text-sm text-gray-400 italic pt-2 border-t border-gray-700/50">
                            {item.sous_chapitre}
                        </p>
                    )}
                     <div className="flex justify-end items-center pt-3 mt-3 border-t border-gray-700">
                        <button
                            onClick={() => onSearch(item.question, item.id)}
                            disabled={isSearching}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            aria-label={`Search for question ${item.numero}`}
                        >
                            {isSearching && activeQcmId === item.id ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    Find in PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );
};

export default QcmViewer;
