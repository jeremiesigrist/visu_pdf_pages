
import React, { useState, useRef } from 'react';
import { ChapterFromFile } from '../types';

interface FileUploadProps {
  onFilesUploaded: (pdf: File, json: ChapterFromFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'json') => {
    const file = e.target.files?.[0] || null;
    if (type === 'pdf') {
      setPdfFile(file);
    } else {
      setJsonFile(file);
    }
    setError(null);
  };

  const handleLoadFiles = () => {
    if (!pdfFile || !jsonFile) {
      setError('Please select both a PDF and a JSON file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        // Simple validation of the JSON structure
        if (Array.isArray(data) && data.length > 0 && 'chapitre_nom' in data[0]) {
          onFilesUploaded(pdfFile, data as ChapterFromFile[]);
        } else {
          throw new Error('JSON structure is invalid.');
        }
      } catch (err) {
        setError('Failed to parse JSON file. Please ensure it is valid and has the correct structure.');
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError('Failed to read the JSON file.');
        setIsLoading(false);
    }

    reader.readAsText(jsonFile);
  };
  
  const FileInputCard = ({ title, file, onButtonClick, onFileChange, inputRef, accept, Icon }: {
    title: string;
    file: File | null;
    onButtonClick: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    accept: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  }) => (
    <div 
      className="border-2 border-dashed border-gray-600 rounded-xl p-6 w-full text-center cursor-pointer hover:border-indigo-400 hover:bg-gray-800/50 transition-all duration-300"
      onClick={onButtonClick}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        accept={accept}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <Icon className="w-12 h-12 text-gray-500" />
        <p className="text-lg font-semibold text-gray-300">{title}</p>
        {file ? (
          <span className="text-indigo-300 font-medium break-all">{file.name}</span>
        ) : (
          <span className="text-gray-500">Click to select a file</span>
        )}
      </div>
    </div>
  );

  const PdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10.3 12.3a.9.9 0 0 1 1.4 0l.3.3a.9.9 0 0 1 0 1.4l-2 2a.9.9 0 0 1-1.4 0l-.3-.3a.9.9 0 0 1 0-1.4l2-2Z"/><path d="M12.5 10.5a.9.9 0 0 1 1.4 0l.3.3a.9.9 0 0 1 0 1.4l-2 2a.9.9 0 0 1-1.4 0l-.3-.3a.9.9 0 0 1 0-1.4l2-2Z"/></svg>
  );

  const JsonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M10 15h.01"/><path d="M14 15h.01"/></svg>
  );

  return (
    <div className="max-w-4xl mx-auto w-full bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6 border border-gray-700">
      <h2 className="text-3xl font-bold text-center text-white mb-2">Upload Your Files</h2>
      <p className="text-center text-gray-400 mb-8">Select a PDF document and its corresponding JSON chapter index.</p>

      <div className="flex flex-col md:flex-row gap-6">
        <FileInputCard
          title="PDF Document"
          file={pdfFile}
          onButtonClick={() => pdfInputRef.current?.click()}
          onFileChange={(e) => handleFileChange(e, 'pdf')}
          inputRef={pdfInputRef}
          accept=".pdf"
          Icon={PdfIcon}
        />
        <FileInputCard
          title="JSON Index"
          file={jsonFile}
          onButtonClick={() => jsonInputRef.current?.click()}
          onFileChange={(e) => handleFileChange(e, 'json')}
          inputRef={jsonInputRef}
          accept=".json"
          Icon={JsonIcon}
        />
      </div>

      {error && <p className="text-red-400 text-center font-medium mt-4">{error}</p>}
      
      <button
        onClick={handleLoadFiles}
        disabled={!pdfFile || !jsonFile || isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors duration-300 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : 'Load & Verify'}
      </button>
    </div>
  );
};

export default FileUpload;
