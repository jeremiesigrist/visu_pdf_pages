import React, { useState, lazy, Suspense } from 'react';
import { Chapter, ChapterFromFile, QCM } from './types';
import FileUpload from './components/FileUpload';
import JsonViewer from './components/JsonViewer';

// Lazily load components
const PdfViewer = lazy(() => import('./components/PdfViewer'));
const QcmViewer = lazy(() => import('./components/QcmViewer'));


const AppLoading: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-4 text-gray-400">
             <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>{message}</p>
        </div>
    </div>
);


const App: React.FC = () => {
  const [mode, setMode] = useState<'chapter' | 'qcm' | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<Chapter[] | QCM[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pdfSessionId, setPdfSessionId] = useState<number>(0);
  const [searchText, setSearchText] = useState<{ text: string, id: string } | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  const handleFilesUploaded = (pdf: File, data: ChapterFromFile[] | QCM[], detectedMode: 'chapter' | 'qcm') => {
    if (detectedMode === 'chapter') {
        const dataWithIds = (data as ChapterFromFile[]).map(chapter => ({
            ...chapter,
            id: crypto.randomUUID(),
        }));
        setJsonData(dataWithIds);
    } else {
        setJsonData(data as QCM[]);
    }
    setMode(detectedMode);
    setPdfFile(pdf);
    setCurrentPage(1);
    setActiveId(null);
    setPdfSessionId(Date.now()); // Create a new session ID to force remount
  };

  const handlePageSelect = (page: number, id: string) => {
    setCurrentPage(page);
    setActiveId(id);
  };

  const handleSearch = (text: string, id: string) => {
    setSearchText({ text, id });
    setActiveId(id);
    setIsSearching(true);
  };
  
  const handleSearchComplete = (result: { found: boolean; page?: number } | null) => {
    setIsSearching(false);
    if(result?.found && result.page) {
      setCurrentPage(result.page);
    } else if (result && !result.found) {
        // In a sandboxed iframe, alerts are often blocked. 
        // A more robust solution would be a custom notification component.
        console.warn(`Search text not found: "${searchText?.text}"`);
    }
    // Clear search text to allow searching for the same item again
    setSearchText(null);
  };

  const resetApp = () => {
    setMode(null);
    setPdfFile(null);
    setJsonData(null);
    setCurrentPage(1);
    setActiveId(null);
    setSearchText(null);
    setIsSearching(false);
  };

  const handleJsonUpdate = (updatedData: Chapter[]) => {
    setJsonData(updatedData);
  };

  const handleExportJson = () => {
    if (!jsonData || mode !== 'chapter') return;
    
    // Remove the internal 'id' field before exporting
    const dataToExport = (jsonData as Chapter[]).map(({ id, ...rest }) => rest);

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'updated_chapters.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };
  
  const renderSidebar = () => {
      if (!jsonData) return null;
      switch(mode) {
          case 'chapter':
              return (
                <JsonViewer 
                  data={jsonData as Chapter[]} 
                  onPageSelect={handlePageSelect} 
                  activeChapterId={activeId}
                  onDataChange={handleJsonUpdate}
                />
              );
          case 'qcm':
              return (
                 <Suspense fallback={<AppLoading message="Loading QCMs..." />}>
                    <QcmViewer
                        data={jsonData as QCM[]}
                        onSearch={handleSearch}
                        activeQcmId={activeId}
                        isSearching={isSearching}
                    />
                 </Suspense>
              );
          default:
              return null;
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="m9 9.5 2 2 4-4"/></svg>
          <h1 className="text-xl font-bold text-white">PDF Verifier</h1>
        </div>
        {pdfFile && jsonData && (
            <div className="flex items-center gap-4">
                {mode === 'chapter' && (
                    <button
                        onClick={handleExportJson}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export JSON
                    </button>
                )}
                <button
                    onClick={resetApp}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Load New Files
                </button>
            </div>
        )}
      </header>

      <main className="flex-grow flex overflow-hidden">
        {!pdfFile || !jsonData ? (
          <div className="w-full flex items-center justify-center p-8">
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </div>
        ) : (
          <>
            <aside className="w-2/5 h-full overflow-y-auto bg-gray-800 border-r border-gray-700">
              {renderSidebar()}
            </aside>
            <section className="w-3/5 h-full bg-gray-900">
              <Suspense fallback={<AppLoading message="Loading PDF Viewer..." />}>
                <PdfViewer 
                  file={pdfFile} 
                  pageNumber={currentPage}
                  setPageNumber={setCurrentPage}
                  sessionId={pdfSessionId}
                  searchText={searchText?.text ?? null}
                  onSearchComplete={handleSearchComplete}
                />
              </Suspense>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default App;