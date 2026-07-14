'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { db } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [sortBy, setSortBy] = useState('newest');
  const { language, t, mounted } = useLanguage();

  const categories = [
    { id: 'Tümü', labelKey: 'categoryAll' },
    { id: '🎮 Oyun', labelKey: 'games' },
    { id: '🛠️ Araçlar & Verimlilik', labelKey: 'tools' },
    { id: '🎓 Eğitim & Bilgi', labelKey: 'education' },
    { id: '❤️ Sağlık & Yaşam', labelKey: 'health' },
    { id: '🌍 Sosyal & Eğlence', labelKey: 'social' },
    { id: '🧩 Diğer', labelKey: 'other' }
  ];

  const getTranslatedCategory = (catId) => {
    const found = categories.find(c => c.id === catId);
    return found ? t(found.labelKey) : catId;
  };

  useEffect(() => {
    async function loadApps() {
      try {
        const allApps = await db.getApps();
        setApps(allApps);
      } catch (e) {
        console.error('Failed to load apps:', e);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  // Format relative date in Turkish
  const formatDateRelative = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        if (language === 'tr') {
          return diffMins <= 1 ? 'Şimdi' : `${diffMins} dk önce`;
        } else {
          return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
        }
      }
      if (language === 'tr') {
        return `${diffHours} saat önce`;
      } else {
        return `${diffHours}h ago`;
      }
    }
    if (diffDays === 1) {
      return language === 'tr' ? 'Dün' : 'Yesterday';
    }
    if (language === 'tr') {
      return `${diffDays} gün önce`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Filter apps
  const activeApps = apps.filter(app => app.status === 'testing');
  const publishedApps = apps.filter(app => app.status === 'published');

  // Filter active apps by category
  const filteredActiveApps = selectedCategory === 'Tümü'
    ? activeApps
    : activeApps.filter(app => app.category === selectedCategory);

  // Sort active apps
  const sortedAndFilteredActiveApps = [...filteredActiveApps].sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Sort published apps
  const sortedPublishedApps = [...publishedApps].sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Slider apps: Last 5 active apps added
  const sliderApps = activeApps.slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Closed Test",
    "url": "https://closedtest.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://closedtest.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* HERO SECTION / INTRO */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                {t('heroTitle')}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '1rem' }}>
                {t('heroSubtitle')}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                {t('heroDesc')}
              </p>
            </div>

            {/* NEWLY ADDED CAROUSEL / SLIDER */}
            {sliderApps.length > 0 && (
              <div className="slider-wrapper">
                <div className="section-header">
                  <h2>{t('newApps')}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('recentApps')}</span>
                </div>
                <div className="slider-container">
                  {sliderApps.map((app) => (
                    <Link href={`/app/${app.id}`} key={app.id} className="slider-card">
                      <div className="slider-logo">
                        {app.logo_letter}
                      </div>
                      <div className="slider-title">{app.title}</div>
                      <div className="slider-meta">{formatDateRelative(app.created_at)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIVE TEST APPLICATIONS SECTION */}
            <div className="section-header" style={{ marginTop: '2rem' }}>
              <h2>{t('testedApps', { count: activeApps.length })}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('testingStatus')}</span>
            </div>

            {/* Category Filters */}
            <div className="filter-bar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>

            {/* Sorting Tabs */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem', gap: '0.5rem' }}>
              <button 
                onClick={() => setSortBy('newest')} 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.3rem 0.75rem', 
                  borderRadius: '15px',
                  backgroundColor: sortBy === 'newest' ? 'var(--accent-color)' : 'var(--card-bg)',
                  color: sortBy === 'newest' ? '#fff' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: sortBy === 'newest' ? 'var(--accent-color)' : 'var(--border-color)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                📅 {language === 'tr' ? 'En Yeniler' : 'Newest'}
              </button>
              <button 
                onClick={() => setSortBy('likes')} 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.3rem 0.75rem', 
                  borderRadius: '15px',
                  backgroundColor: sortBy === 'likes' ? 'var(--accent-color)' : 'var(--card-bg)',
                  color: sortBy === 'likes' ? '#fff' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: sortBy === 'likes' ? 'var(--accent-color)' : 'var(--border-color)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🔥 {language === 'tr' ? 'En Çok Beğenilenler' : 'Most Liked'}
              </button>
            </div>

            {/* Active Apps Grid */}
            {sortedAndFilteredActiveApps.length > 0 ? (
              <div className="grid-container">
                {sortedAndFilteredActiveApps.map((app) => (
                  <Link href={`/app/${app.id}`} key={app.id} className="app-card">
                    <div>
                      <div className="app-card-header">
                        <div className="app-card-logo">
                          {app.logo_letter}
                        </div>
                        <div className="app-card-details">
                          <div className="app-card-title">{app.title}</div>
                          <div className="app-card-subtitle">{getTranslatedCategory(app.category)}</div>
                        </div>
                      </div>
                      <p className="app-card-desc">{app.description}</p>
                    </div>
                    <div className="app-card-footer">
                      <span>{app.owner_name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>❤️ {app.likes_count || 0}</span>
                        <span>{formatDateRelative(app.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('noApps')}</p>
              </div>
            )}

            {/* COMPLETED / PUBLISHED APPLICATIONS SECTION */}
            {publishedApps.length > 0 && (
              <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
                <div className="section-header">
                  <h2 style={{ color: '#10b981' }}>✓ {t('published')} ({publishedApps.length})</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('publishedStatus')}</span>
                </div>
                <div className="grid-container">
                  {sortedPublishedApps.map((app) => (
                    <Link href={`/app/${app.id}`} key={app.id} className="app-card" style={{ opacity: 0.75 }}>
                      <div>
                        <div className="app-card-header">
                          <div className="app-card-logo" style={{ borderColor: '#10b981' }}>
                            {app.logo_letter}
                          </div>
                          <div className="app-card-details">
                            <div className="app-card-title">{app.title}</div>
                            <div className="app-card-subtitle">{getTranslatedCategory(app.category)}</div>
                          </div>
                        </div>
                        <p className="app-card-desc">{app.description}</p>
                      </div>
                      <div className="app-card-footer">
                        <span>{app.owner_name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>❤️ {app.likes_count || 0}</span>
                          <span style={{ color: '#10b981', fontWeight: '600' }}>{t('published').toUpperCase()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
