// No top-level static imports to ensure we control the execution order.
// We will dynamically import everything we need.

(async () => {
  try {
    // 1. CRITICAL STEP: Configure PDF.js first.
    // By dynamically importing it here, we ensure this code runs to completion
    // before any other module (like our App or PdfViewer) can be loaded.
    const { GlobalWorkerOptions } = await import('pdfjs-dist');
    //GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.mjs`;
    GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

    // 2. Now that the environment is safely configured, load React and our App.
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { default: App } = await import('./App');

    // 3. Find the root element and render the application.
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

  } catch (error) {
    // If anything fails during this critical bootstrap phase, display a clear error.
    console.error("Application bootstrap failed:", error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #f87171; font-family: sans-serif;">
          <h2>Failed to load the app.</h2>
          <p>An error occurred during initialization. Please check the browser console for details and try reloading.</p>
        </div>
      `;
    }
  }
})();