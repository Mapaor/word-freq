'use client';

import { useState } from 'react';
import styles from '@/styles/ParaulesFreq.module.css';

// Stopwords combinades per català, castellà i anglès
const IGNOREWORDS = new Set([
    // Lletres individuals
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
    // Números
    "0","1","2","3","4","5","6","7","8","9",
    // Símbols
    "!",'"',"#","$","%","&","'","(",")","*","+","-",".","/","<",">","?","@","[","\\","]","^","_","`","{","|","}","~",
    // Català
    "el","la","els","les","un","una","uns","unes","i","o","però","com","si","en","amb","de","a","per","que","què","quan","on","hi","li","al","del","dels","als","més","menys","ja","no","sí","també","molt","poc","són","era","és","s'ha","han","va","van","he","has","hem","havent","això","allò","aquesta","aquest","aquell","aquella","meu","meua","seu","seva","teu","teva","nostre","vostre","d'ells","entre","havia","fins",
    "doncs","tot","res","cap","alguna","alguns","algunes","algú","ningú","aquí","allí","allà","després","abans","sempre","mai","encara","mentre","durant","sobretot","només","potser","qualsevol","cadascú","altres","tothom","cosa","fet","fer","tenia","tenim","tenen","tens","tinc",
    // Castellà
    "el","la","los","las","un","una","unos","unas","y","o","pero","como","si","en","con","de","a","por","que","cuando","donde","se","le","al","del","más","menos","ya","no","sí","también","muy","poco","son","era","es","ha","han",
    "entonces","todo","nada","ninguno","ninguna","alguno","algunos","algunas","alguien","nadie","aquí","allí","allá","después","antes","siempre","nunca","todavía","mientras","durante","sobre","solo","quizás","talvez","cualquiera","cada","otro","todos","todas","cosa","hecho","hacer","tenía","tenemos","tienen","tienes","tengo",
    // Anglès
    "the","a","an","and","or","but","if","in","with","of","to","for","this","that","which","when","where","is","are","was","were","be","been","has","have","had","it","its","on","at","by","as","from","I","my","mine","you","your","yours","he","him","his","she","her","hers","us","our","ours","they","their","theirs","about",
    "then","all","none","noone","someone","anyone","any","some","here","there","before","after","always","never","still","while","during","just","maybe","perhaps","each","every","other","thing","stuff","did","do","does","done","had","has","having","am","will","would","can","could","should","shall","must",
    // LaTeX mal processat
    "dx", "dt", "dy", "dz",
]);

function eliminarDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function eliminarApostrofs(text) {
  return text.replace(/([dlsnDLSN])['’]/g, '');  
}

const normalitza = (text) =>
  eliminarApostrofs(eliminarDiacritics(text));

const IGNOREWORDS_NORMALIZED = new Set([...IGNOREWORDS].map(w => normalitza(w.toLowerCase())));



export default function ParaulesFreq() {
  const [text, setText] = useState('');
  const [resultat, setResultat] = useState([]);
  const [k, setK] = useState(10);

    const analitzaText = () => {
    const paraules = normalitza(text)
        .toLowerCase()
        .replace(/[^\w\s'-]/g, '') // neteja caràcters no útils
        .split(/\s+/);

    const comptador = {};
    for (const paraula of paraules) {
        if (!paraula || normalitza(IGNOREWORDS_NORMALIZED.has(paraula) ? paraula : "") || IGNOREWORDS_NORMALIZED.has(normalitza(paraula))) continue;
        comptador[paraula] = (comptador[paraula] || 0) + 1;
    }

    const ordenat = Object.entries(comptador)
        .sort((a, b) => b[1] - a[1])
        .slice(0, k)
        .map(([paraula, freq]) => ({ paraula, freq }));

    setResultat(ordenat);
    };


  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        Paraules més freqüents
      </h2>

      <textarea
        className={styles.textarea}
        rows={8}
        placeholder="Enganxa o escriu el teu text aquí..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className={styles.controls}>
        <label className={styles.label}>
          Paraules a mostrar?
        </label>
        <input
          type="number"
          min="1"
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
          className={styles.numberInput}
        />
      </div>

      <button onClick={analitzaText} className={styles.button}>
        Analitza 🔍
      </button>

      {resultat.length > 0 && (
        <div className={styles.resultats}>
          <h3 className={styles.resultTitle}>
            Resultats
          </h3>
          <ul className={styles.list}>
            {resultat.map(({ paraula, freq }) => (
              <li key={paraula} className={styles.listItem}>
                <span className={styles.word}>{paraula}</span>
                <span className={styles.count}>{freq}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
