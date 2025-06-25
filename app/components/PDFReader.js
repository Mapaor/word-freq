'use client';

import React, { useState } from 'react';
import styles from './PDFReader.module.css';

const PDFReader = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Només es permeten fitxers PDF.');
      return;
    }

    setLoading(true);
    setError('');
    setText('');

    try {
      // 👇 Importem pdfjsDist només al client
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';


      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(reader.result);
        try {
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let extractedText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            extractedText += strings.join(' ') + '\n';
          }

          setText(extractedText);
        } catch (err) {
          console.error(err);
          setError('Error en llegir el PDF.');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setError('No s\'ha pogut carregar el lector de PDF.');
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
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
