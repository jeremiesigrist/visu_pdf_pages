import React, { useState, useEffect, useRef } from 'react';
import { getDocument } from 'pdfjs-dist';

// Define a type for the PDF document proxy to avoid using 'any'.
type PDFDocumentProxy = {
  numPages: number;
  getPage(pageNumber: number): Promise<any>;
  destroy(): void;
};

// Define an interface for the RenderTask from pdf.js
interface RenderTask {
  promise: Promise<void>;
  cancel(): void;
}

interface PdfViewerProps {
  file: File;
  pageNumber: number;
  setPageNumber: (page: number) => void;
  sessionId: number;
  searchText: string | null;
  onSearchComplete: (result: { found: boolean, page?: number } | null) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full w-full">
        <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const PdfViewer: React.FC<PdfViewerProps> = ({ file, pageNumber, setPageNumber, sessionId, searchText, onSearchComplete }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (!file) return;

      if (pdfDoc) {
        pdfDoc.destroy();
      }
      
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setNumPages(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const doc = await getDocument(typedArray).promise as PDFDocumentProxy;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        if (pageNumber > doc.numPages) {
          setPageNumber(1);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error loading PDF document:', err);
        setError(`Failed to load PDF: ${errorMessage}`);
        setLoading(false);
      }
    };
    
    loadPdf();
    
    return () => {
      pdfDoc?.destroy();
      renderTaskRef.current?.cancel();
    };
  }, [file, sessionId]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current || !textLayerRef.current) return;

    let isStale = false;
    renderTaskRef.current?.cancel();

    const renderPage = async () => {
      setLoading(true);
      
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (isStale) return;

        const container = containerRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: scaledViewport,
          };

          const task = page.render(renderContext) as RenderTask;
          renderTaskRef.current = task;
          await task.promise;
        }
        
        // Render text layer
        const textContent = await page.getTextContent();
        if (isStale) return;
        
        const textLayerDiv = textLayerRef.current!;
        textLayerDiv.innerHTML = ''; // Clear previous text layer
        textLayerDiv.style.width = `${scaledViewport.width}px`;
        textLayerDiv.style.height = `${scaledViewport.height}px`;

        const { renderTextLayer } = await import('pdfjs-dist');
        await renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: scaledViewport,
            textDivs: [],
        }).promise;
          
        if (!isStale) {
            setLoading(false);
            setError(null);
        }

      } catch (err: any) {
        if (isStale || err.name === 'RenderingCancelledException') {
            return;
        }
        console.error('Error rendering page:', err);
        setError('Failed to render page.');
        setLoading(false);
      }
    };

    renderPage();

    return () => {
      isStale = true;
    };
  }, [pdfDoc, pageNumber]);

  useEffect(() => {
    const searchForText = async () => {
        if (!searchText || !pdfDoc) {
            onSearchComplete(null);
            return;
        }

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            if (pageText.toLowerCase().includes(searchText.toLowerCase())) {
                onSearchComplete({ found: true, page: i });
                return;
            }
        }

        onSearchComplete({ found: false });
    };

    searchForText();
  }, [searchText, pdfDoc]);
  
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
          setPageNumber(0);
          return;
      }
      const newPage = parseInt(value, 10);
      if (!isNaN(newPage) && newPage > 0 && numPages && newPage <= numPages) {
          setPageNumber(newPage);
      } else if (value.length <= String(numPages).length) {
          setPageNumber(0); 
      }
  };
  
  const handlePageInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if(isNaN(value) || value < 1) {
          setPageNumber(1);
      } else if (numPages && value > numPages) {
          setPageNumber(numPages);
      }
  };
  
  const displayPageNumber = pageNumber > 0 ? pageNumber : '';

  return (
    <div className="flex flex-col h-full w-full bg-gray-900">
      <div ref={containerRef} className="flex-grow overflow-auto p-4 flex items-start justify-center relative">
        {(loading && !error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-20">
                <LoadingSpinner />
            </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-30">
            <div className="text-red-400 text-center p-4 bg-gray-800 rounded-lg shadow-xl">
                <p className="font-bold text-lg">Render Error</p>
                <p>{error}</p>
            </div>
          </div>
        )}
        <div 
          className="relative" 
          style={{ 
            opacity: (loading || error) ? 0.5 : 1,
            transition: 'opacity 0.3s'
          }}>
          <canvas 
            ref={canvasRef} 
            className="shadow-lg"
          />
          <div ref={textLayerRef} className="textLayer absolute top-0 left-0" />
        </div>
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
                value={displayPageNumber}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                className="w-16 text-center bg-gray-900 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            of {numPages}
          </div>
          <button onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages} className="p-2 rounded-md disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;