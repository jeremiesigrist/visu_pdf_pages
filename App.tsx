import React, { useState, lazy, Suspense } from 'react';
import { Chapter } from './types';
import FileUpload from './components/FileUpload';
import JsonViewer from './components/JsonViewer';

// Lazily load the PdfViewer component
const PdfViewer = lazy(() => import('./components/PdfViewer'));

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-4 text-gray-400">
             <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Loading PDF Viewer...</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Chapter[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);
  const [pdfSessionId, setPdfSessionId] = useState<number>(0);

  const handleFilesUploaded = (pdf: File, json: Chapter[]) => {
    setPdfFile(pdf);
    setJsonData(json);
    setCurrentPage(1);
    setActiveChapterIndex(null);
    setPdfSessionId(Date.now()); // Create a new session ID to force remount
  };

  const handlePageSelect = (page: number, index: number) => {
    setCurrentPage(page);
    setActiveChapterIndex(index);
  };

  const resetApp = () => {
    setPdfFile(null);
    setJsonData(null);
    setCurrentPage(1);
    setActiveChapterIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="m9 9.5 2 2 4-4"/></svg>
          <h1 className="text-xl font-bold text-white">PDF Chapter Verifier</h1>
        </div>
        {pdfFile && jsonData && (
            <button
                onClick={resetApp}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Load New Files
            </button>
        )}
      </header>

      <main className="flex-grow flex">
        {!pdfFile || !jsonData ? (
          <div className="w-full flex items-center justify-center p-8">
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </div>
        ) : (
          <div className="flex w-full h-[calc(100vh-64px)]">
            <aside className="w-2/5 h-full overflow-y-auto bg-gray-800 border-r border-gray-700">
              <JsonViewer 
                data={jsonData} 
                onPageSelect={handlePageSelect} 
                activeChapterIndex={activeChapterIndex}
              />
            </aside>
            <section className="w-3/5 h-full bg-gray-900 flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <PdfViewer 
                  file={pdfFile} 
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  sessionId={pdfSessionId}
                />
              </Suspense>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;