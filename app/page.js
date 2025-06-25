import styles from '@/styles/HomePage.module.css';
import ParaulesFreq from '@/components/paraulesFreq';
import PDFReader from '@/components/PDFReader';
import Link from 'next/link';

export default function Page() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🔍 Analitza el teu text</h1>
          <p className={styles.subtitle}>
            Descobreix quines paraules apareixen més sovint en qualsevol text en català, castellà o anglès.
          </p>
        </header>
        <section className={styles.content}>
          <ParaulesFreq />
        </section>
        <div className="p-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Lector de PDF</h1>
          <PDFReader />
        </div>
        <footer className={styles.footer}>
          <span>© 2025 · Martí Pardo</span>
        </footer>
      </div>
    </main>
  );
}
