'use client';

import React from 'react';
import PDFReader from '@/components/PDFReader';

const PDFReaderPage = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lector de PDF</h1>
      <PDFReader />
    </div>
  );
};

export default PDFReaderPage;
