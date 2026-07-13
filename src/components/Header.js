'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, changeLanguage, t, mounted } = useLanguage();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleLogin = async () => {
    try {
      await db.loginWithGoogle();
    } catch (e) {
      console.error('Login failed:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await db.logout();
      setUser(null);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <header>
      <div className="container header-content">
        <Link href="/" className="logo">
          {t('logo')}<span>●</span>
        </Link>
        
        <nav className="user-nav">
          {mounted && (
            <button 
              onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                color: 'var(--text-color)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {language === 'tr' ? '🇺🇸 EN' : '🇹🇷 TR'}
            </button>
          )}
          
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="user-info">
                    {user.isMock && <span style={{ color: '#f59e0b', marginRight: '0.5rem', fontSize: '0.75rem', border: '1px solid #f59e0b', padding: '1px 4px', borderRadius: '4px' }}>{t('mockMode')}</span>}
                    {user.name}
                  </span>
                  <Link href="/add" className="btn primary">
                    {t('addApp')}
                  </Link>
                  <button onClick={handleLogout}>{t('logout')}</button>
                </>
              ) : (
                <button onClick={handleLogin} className="primary">
                  {t('loginGoogle')}
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
