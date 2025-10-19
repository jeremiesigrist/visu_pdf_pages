import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';

interface PdfViewerProps {
  file: File;
  pageNumber: number;
  setPageNumber: (page: number) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full">
        <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);


const PdfViewer: React.FC<PdfViewerProps> = ({ file, pageNumber, setPageNumber }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    // Ensure the current page isn't out of bounds after a new doc loads
    if (pageNumber > numPages) {
        setPageNumber(numPages);
    }
  }
  
  const goToPrevPage = () => {
    if (pageNumber > 1) {
        setPageNumber(pageNumber - 1);
    }
  }

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) {
        setPageNumber(pageNumber + 1);
    }
  }
  
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
          // Allow empty input for typing
      } else {
          const newPage = parseInt(value, 10);
          if (!isNaN(newPage) && newPage > 0 && numPages && newPage <= numPages) {
              setPageNumber(newPage);
          }
      }
  };
  
  const handlePageInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.value === '') {
          setPageNumber(pageNumber); // Reset if empty
      }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900">
      <div className="flex-grow overflow-auto p-4">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<LoadingSpinner />}
          error={<p className="text-red-400 text-center p-4">Failed to load PDF file.</p>}
        >
          <Page 
            key={file ? file.name + pageNumber : pageNumber}
            pageNumber={pageNumber} 
            loading={<LoadingSpinner />}
            />
        </Document>
      </div>
      {numPages && (
        <div className="flex-shrink-0 bg-gray-800 p-2 border-t border-gray-700 flex justify-center items-center gap-4">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="p-2 rounded-md disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="flex items-center gap-2 text-sm">
            Page
            <input 
                type="number"
                value={pageNumber}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                className="w-16 text-center bg-gray-900 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            of {numPages}
          </div>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="p-2 rounded-md disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;