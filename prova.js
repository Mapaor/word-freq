function corregeixAccents(text) {
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
    // Correccions específiques per a català
    { pattern: /`\s*a/g, replacement: 'à' },
    { pattern: /´\s*e/g, replacement: 'é' },
    { pattern: /`\s*e/g, replacement: 'è' },
    { pattern: /´\s*o/g, replacement: 'ó' },
    { pattern: /`\s*o/g, replacement: 'ò' },
    { pattern: /´\s*i/g, replacement: 'í' },
    { pattern: /`\s*i/g, replacement: 'ì' },
    { pattern: /´\s*u/g, replacement: 'ú' },
    { pattern: /¨\s*u/g, replacement: 'ü' },
    { pattern: /l\s*·\s*l/g, replacement: 'l·l' },
    // Casos generals (sense espai)
    { pattern: /`a/g, replacement: 'à' },
    { pattern: /´e/g, replacement: 'é' },
    { pattern: /`e/g, replacement: 'è' },
    { pattern: /´o/g, replacement: 'ó' },
    { pattern: /`o/g, replacement: 'ò' },
    { pattern: /´i/g, replacement: 'í' },
    { pattern: /`i/g, replacement: 'ì' },
    { pattern: /´u/g, replacement: 'ú' },
    { pattern: /¨u/g, replacement: 'ü' }
  ];

  let result = decodedText;
  accentReplacements.forEach(({pattern, replacement}) => {
    result = result.replace(pattern, replacement);
  });

  return result;
}

// Exemple d'ús amb text que conté caràcters problemàtics
const textMalCodificat = String.raw`Prefaci  Aquestes notes corresponen al curs de Mec` + '`' + String.raw`anica Qu` + '`' + String.raw`antica del grau de F´ısica. Els alumnes...`;

console.log(corregeixAccents(textMalCodificat));