'use client';

import React, { useState, useEffect } from 'react';
import styles from './PDFReader.module.css';

const PDFReader = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  useEffect(() => {
    // Load PDF.js from Mozilla CDN
    const loadPdfJs = () => {
      if (typeof window !== 'undefined' && !window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          // Set up the worker
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setPdfJsLoaded(true);
          console.log('PDF.js loaded successfully');
        };
        script.onerror = () => {
          setError('No s\'ha pogut carregar PDF.js');
        };
        document.head.appendChild(script);
      } else if (window.pdfjsLib) {
        setPdfJsLoaded(true);
      }
    };

    loadPdfJs();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Només es permeten fitxers PDF.');
      return;
    }

    if (!pdfJsLoaded) {
      setError('PDF.js encara no està carregat. Prova de nou en uns segons.');
      return;
    }

    setLoading(true);
    setError('');
    setText('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      
      // Load the PDF document using Mozilla's PDF.js
      const pdf = await window.pdfjsLib.getDocument({
        data: typedArray,
        verbosity: 0,
      }).promise;

      let extractedText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Join all text items with spaces and preserve some structure
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .trim();
        
        if (pageText) {
          extractedText += pageText + '\n\n';
        }
      }
      
      if (extractedText.trim()) {
        setText(extractedText.trim());
      } else {
        setText('No s\'ha pogut extreure text d\'aquest PDF. És possible que sigui un PDF d\'imatges o que estigui protegit.');
      }
      
    } catch (err) {
      console.error('Error en processar PDF:', err);
      setError(`Error en llegir PDF: ${err.message || 'Error desconegut'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback per a Safari més antic
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError('No s\'ha pogut copiar el text');
    }
  };

  return (
    <div className={styles.container}>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileChange}
        className={styles.fileInput}
      />
      {loading && <p className={styles.loadingText}>Carregant...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {text && (
        <div className={styles.textContainer}>
          {/* Copy success message */}
          <div className={`${styles.copySuccessMessage} ${copySuccess ? styles.show : ''}`}>
            Copiat!
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopyText}
            className={styles.copyButton}
            aria-label="Copiar text"
            title="Copiar text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.copyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          {/* Text content */}
          <div className={styles.textBlock}>
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFReader;
