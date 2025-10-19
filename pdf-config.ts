import * as pdfjs from 'pdfjs-dist';

// Définir l'emplacement du worker de pdfjs
// C'est crucial pour que react-pdf fonctionne correctement, surtout sans un bundler comme Webpack/Vite.
pdfjs.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@4.4.188/build/pdf.worker.mjs`;
