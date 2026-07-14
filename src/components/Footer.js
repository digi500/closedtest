'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 0',
      marginTop: '4rem',
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      textAlign: 'center'
    }}>
      <div className="container">
        <p style={{ marginBottom: '0.5rem' }}>
          © {new Date().getFullYear()} <strong>{t('logo')}</strong>. {t('footerText')}
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          {t('footerSubText')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href="/support"
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              backgroundColor: 'var(--card-bg)'
            }}
          >
            💬 {language === 'tr' ? 'Destek & SSS' : 'Support & FAQ'}
          </Link>
          <a
            href="https://github.com/digi500/closedtest"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              backgroundColor: 'var(--card-bg)'
            }}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            {t('githubBtn')}
          </a>
        </div>
      </div>
    </footer>
  );
}
