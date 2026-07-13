'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/db';

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          Closed Test<span>●</span>
        </Link>
        
        <nav className="user-nav">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="user-info">
                    {user.isMock && <span style={{ color: '#f59e0b', marginRight: '0.5rem', fontSize: '0.75rem', border: '1px solid #f59e0b', padding: '1px 4px', borderRadius: '4px' }}>Mock Mod</span>}
                    {user.name}
                  </span>
                  <Link href="/add" className="btn primary">
                    + Uygulama Ekle
                  </Link>
                  <button onClick={handleLogout}>Çıkış Yap</button>
                </>
              ) : (
                <button onClick={handleLogin} className="primary">
                  Google ile Giriş Yap
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
