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
        // Apply accent correction to the extracted text
        const correctedText = corregeixAccents(extractedText.trim());
        setText(correctedText);
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

  // Function to correct malformed accents from LaTeX PDFs
  const corregeixAccents = (text) => {
    // Codificar el text com a URI per evitar problemes amb caràcters especials
    const encodedText = encodeURIComponent(text);
    
    // Substituir seqüències problemàtiques abans de decodificar
    const replacements = [
      { pattern: /%C2%60/g, replacement: '%60' },  // ` mal codificat
      { pattern: /%C2%B4/g, replacement: '%27' },  // ´ mal codificat
      { pattern: /%C2%A8/g, replacement: '%22' },  // ¨ mal codificat
      { pattern: /%20%60/g, replacement: '%60' },  // espai + `
      { pattern: /%20%B4/g, replacement: '%B4' },  // espai + ´
      { pattern: /%20%A8/g, replacement: '%A8' }   // espai + ¨
    ];

    let processed = encodedText;
    replacements.forEach(({pattern, replacement}) => {
      processed = processed.replace(pattern, replacement);
    });

    // Decodificar i aplicar correccions d'accents
    const decodedText = decodeURIComponent(processed);
    
    const accentReplacements = [
      // Correccions específiques per paraules problemàtiques completes
      { pattern: /CAP\s+'\s+ITOL/g, replacement: 'CAPÍTOL' },
      // Correccions amb apòstrof simple (') - casos més comuns en LaTeX
      { pattern: /'\s+a/g, replacement: 'á' },      // ' a -> á (agut)
      { pattern: /'\s+e/g, replacement: 'é' },      // ' e -> é (agut)
      { pattern: /'\s+i/g, replacement: 'í' },      // ' i -> í (agut)
      { pattern: /'\s+ı/g, replacement: 'í' },      // ' ı -> í (LaTeX dotless i) - per F'ısica
      { pattern: /'\s+o/g, replacement: 'ó' },      // ' o -> ó (agut) - per equaci'o
      { pattern: /'\s+u/g, replacement: 'ú' },      // ' u -> ú (agut)
      
      // Correccions per títols en majúscules amb apòstrof
      { pattern: /'\s+A/g, replacement: 'Á' },      // ' A -> Á
      { pattern: /'\s+E/g, replacement: 'É' },      // ' E -> É
      { pattern: /'\s+I/g, replacement: 'Í' },      // ' I -> Í - per CAP'ITOL
      { pattern: /'\s+O/g, replacement: 'Ó' },      // ' O -> Ó
      { pattern: /'\s+U/g, replacement: 'Ú' },      // ' U -> Ú
      
      // Correccions amb dièresi doble cometes (") - per Schr"odinger
      { pattern: /"\s+a/g, replacement: 'ä' },      // "a -> ä
      { pattern: /"\s+e/g, replacement: 'ë' },      // "e -> ë  
      { pattern: /"\s+i/g, replacement: 'ï' },      // "i -> ï
      { pattern: /"\s+o/g, replacement: 'ö' },      // "o -> ö - per Schr"odinger
      { pattern: /"\s+u/g, replacement: 'ü' },      // "u -> ü
      
      // Correccions específiques per a català amb greus i aguts originals
      { pattern: /`\s+a/g, replacement: 'à' },
      { pattern: /´\s+e/g, replacement: 'é' },
      { pattern: /`\s+e/g, replacement: 'è' },
      { pattern: /´\s+o/g, replacement: 'ó' },
      { pattern: /`\s+o/g, replacement: 'ò' },
      { pattern: /´\s+i/g, replacement: 'í' },
      { pattern: /`\s+i/g, replacement: 'ì' },
      { pattern: /´\s+u/g, replacement: 'ú' },
      { pattern: /¨\s+u/g, replacement: 'ü' },
      
      // Correccions per títols en majúscules amb accents greus i aguts
      { pattern: /`\s+A/g, replacement: 'À' },      // ` A -> À - per MEC`ANICA
      { pattern: /´\s+E/g, replacement: 'É' },      // ´ E -> É
      { pattern: /`\s+E/g, replacement: 'È' },      // ` E -> È
      { pattern: /´\s+O/g, replacement: 'Ó' },      // ´ O -> Ó
      { pattern: /`\s+O/g, replacement: 'Ò' },      // ` O -> Ò
      { pattern: /´\s+I/g, replacement: 'Í' },      // ´ I -> Í
      { pattern: /`\s+I/g, replacement: 'Ì' },      // ` I -> Ì
      { pattern: /´\s+U/g, replacement: 'Ú' },      // ´ U -> Ú
      { pattern: /¨\s+U/g, replacement: 'Ü' },      // ¨ U -> Ü
      { pattern: /l\s*·\s*l/g, replacement: 'l·l' },
      
      // Correccions per ela geminada amb punt i espais
      { pattern: /l\s*\.\s*l/g, replacement: 'l·l' },   // l . l -> l·l (oscil . lador)
      { pattern: /l\s*\.\s*L/g, replacement: 'l·L' },   // l . L -> l·L (inici de paraula)
      
      // Casos sense espai - apòstrof simple
      { pattern: /'a/g, replacement: 'á' },
      { pattern: /'e/g, replacement: 'é' },
      { pattern: /'i/g, replacement: 'í' },
      { pattern: /'ı/g, replacement: 'í' },         // LaTeX dotless i sense espai
      { pattern: /'o/g, replacement: 'ó' },
      { pattern: /'u/g, replacement: 'ú' },
      
      // Casos sense espai - majúscules amb apòstrof
      { pattern: /'A/g, replacement: 'Á' },
      { pattern: /'E/g, replacement: 'É' },
      { pattern: /'I/g, replacement: 'Í' },
      { pattern: /'O/g, replacement: 'Ó' },
      { pattern: /'U/g, replacement: 'Ú' },
      
      // Casos sense espai - dièresi
      { pattern: /"a/g, replacement: 'ä' },
      { pattern: /"e/g, replacement: 'ë' },
      { pattern: /"i/g, replacement: 'ï' },
      { pattern: /"o/g, replacement: 'ö' },
      { pattern: /"u/g, replacement: 'ü' },
      
      // Casos generals originals (sense espai)
      { pattern: /`a/g, replacement: 'à' },
      { pattern: /´e/g, replacement: 'é' },
      { pattern: /`e/g, replacement: 'è' },
      { pattern: /´o/g, replacement: 'ó' },
      { pattern: /`o/g, replacement: 'ò' },
      { pattern: /´i/g, replacement: 'í' },
      { pattern: /`i/g, replacement: 'ì' },
      { pattern: /´u/g, replacement: 'ú' },
      { pattern: /¨u/g, replacement: 'ü' },
      
      // Casos generals - majúscules sense espai
      { pattern: /`A/g, replacement: 'À' },
      { pattern: /´E/g, replacement: 'É' },
      { pattern: /`E/g, replacement: 'È' },
      { pattern: /´O/g, replacement: 'Ó' },
      { pattern: /`O/g, replacement: 'Ò' },
      { pattern: /´I/g, replacement: 'Í' },
      { pattern: /`I/g, replacement: 'Ì' },
      { pattern: /´U/g, replacement: 'Ú' },
      { pattern: /¨U/g, replacement: 'Ü' },
      
      // Casos sense espai - ela geminada
      { pattern: /l\.l/g, replacement: 'l·l' },         // l.l -> l·l
      { pattern: /l\.L/g, replacement: 'l·L' }          // l.L -> l·L
    ];

    let result = decodedText;
    accentReplacements.forEach(({pattern, replacement}) => {
      result = result.replace(pattern, replacement);
    });

    return result;
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
