'use client';

import { useState } from 'react';
import styles from '@/styles/ParaulesFreq.module.css';

// All possible two-letter combinations (aa, ab, ..., zz)
const twoLetterWords = [];
for (let i = 97; i <= 122; i++) {
  for (let j = 97; j <= 122; j++) {
    twoLetterWords.push(String.fromCharCode(i) + String.fromCharCode(j));
  }
}

// Stopwords combinades per català, castellà i anglès
const IGNOREWORDS = new Set([
    // Lletres individuals
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
    // Dues lletres
    ...twoLetterWords,
    // Números
    "0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30",
    "uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte","veintiuno","veintidós","veintitrés","veinticuatro","veinticinco","veintiséis","veintisiete","veintiocho","veintinueve","treinta",
    "un","dos","tres","quatre","cinc","sis","set","vuit","nou","deu","onze","dotze","tretze","catorze","quinze","setze","disset","divuit","dinou","vint","vint-i-u","vint-i-dos","vint-i-tres","vint-i-quatre","vint-i-cinc","vint-i-sis","vint-i-set","vint-i-vuit","vint-i-nou","trenta",
    "one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","twenty-one","twenty-two","twenty-three","twenty-four","twenty-five","twenty-six","twenty-seven","twenty-eight","twenty-nine","thirty",
    // Símbols
    "!",'"',"#","$","%","&","'","(",")","*","+","-",".","/","<",">","?","@","[","\\","]","^","_","`","{","|","}","~",
    // Català
    "el","la","els","les","un","una","uns","unes","i","o","però","com","si","en","amb","de","a","per","que","què","quan","on","hi","li","al","del","dels","als","més","menys","ja","no","sí","també","molt","poc","són","era","és","s'ha","han","va","van","he","has","hem","havent","això","allò","aquesta","aquest","aquell","aquella","meu","meua","seu","seva","seus","teu","teva","nostre","vostre","d'ells","entre","havia","fins","tal","mateix","mateixa","aixi","sap","sabem","pel","tot","tots","tota","totes","res","cap","diu","estem","cal","llavors","aleshores","queda","tenir","tenim","fent","obtenim","sino","estan","des","definim","descriure","definir","donada","utilitzat","cert","donar","actuar","actua",
    "doncs","tot","res","cap","alguna","alguns","algunes","algú","ningú","aquí","allí","allà","després","abans","sempre","mai","encara","mentre","durant","sobretot","només","potser","qualsevol","cadascú","altres","tothom","cosa","fet","fer","tenia","tenim","tenen","tens","tinc","ho","em","et","te","ens","us","tan","tant","és","ser","serà","seria","son","seran","sigui","estar","està","vaig","anem","van","fem","fa","altre","altra","pot","poden","veiem","veu","veus","vist","donat","dona","som","volem","vol","ara","cas","capítol","dir","sota","sobre","dins","fora","entre","ben","diferent","igual","sense","direm","tenint","qual","qualsevol","cada","utlitzar","formen","vegades","permet","satisfa","clar",
    // Típics de Llibres de Text
    "capítol","introducció","conclusió","referències","bibliografia","annex","apèndix","índex","glossari","nota","inici","fi","inicial","final","resum","objectius","metodologia","resultats","discussiò","anàlisi","exemple","exemples","explicació","explicacions","definició","definicions","teoria","teories","pràctica","pràctiques","activitat","activitats","problema","problemes","solució","solucions","canvi","notar","noteu","possible","possibles","depen","obtenim","obtenir","obtingut","lloc","tipus","min","max","recordem","siguin","farem","haurem","aquestes","tindrem","punt","trobar","veurem","suposem","utilitzant","vegem","vegeu","comprovem","comprovar","observem","hom","dit","quals",
    // Castellà
    "el","la","los","las","un","una","unos","unas","y","o","pero","como","si","en","con","de","a","por","que","cuando","donde","se","le","al","del","más","menos","ya","no","sí","también","muy","poco","son","era","es","ha","han","este","esta","ese","esa","aquel","aquella","mi","tu","su","nuestro","vuestro","mío","tuyo","suyo","nuestro","vuestro","entre","había","hasta",
    "entonces","todo","nada","ninguno","ninguna","alguno","algunos","algunas","alguien","nadie","aquí","allí","allá","después","antes","siempre","nunca","todavía","mientras","durante","sobre","solo","quizás","talvez","cualquiera","cada","otro","todos","todas","cosa","hecho","hacer","tenía","tenemos","tienen","tienes","tengo","capítulo",
    // Anglès
    "the","a","an","and","or","but","if","in","with","of","to","for","this","that","which","when","where","is","are","was","were","be","been","has","have","had","it","its","on","at","by","as","from","I","my","mine","you","your","yours","he","him","his","she","her","hers","us","our","ours","they","their","theirs","about",
    "then","all","none","noone","someone","anyone","any","some","here","there","before","after","always","never","still","while","during","just","maybe","perhaps","each","every","other","thing","stuff","did","do","does","done","had","has","having","am","will","would","can","could","should","shall","must","let","chapter","in","out",
    // LaTeX mal processat
    "dx","dt","dy","dz","exp","sin","cos","tan","log","ln","sqrt","pi","ij","lm","mn","nm","ji","kl","ijk","xyz","nlm","ms","lms","lmms","lim","det","sum","frac","int",
    // Altres
    "etc","etcètera","et","al","i.e.","e.g.","vs","vs.","v.s.","v.s","p.ej","p.ex.",
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
        Paraules rellevants més freqüents
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
