'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { db } from '../../lib/db';
import { useLanguage } from '../../context/LanguageContext';

// Client-side image compression helper (WebP format)
function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if width is larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Resim sıkıştırılamadı.'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function AddApp() {
  const router = useRouter();
  const { t, mounted } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '🛠️ Araçlar & Verimlilik',
    google_group_url: '',
    play_store_url: ''
  });

  const categories = [
    { id: '🎮 Oyun', labelKey: 'games' },
    { id: '🛠️ Araçlar & Verimlilik', labelKey: 'tools' },
    { id: '🎓 Eğitim & Bilgi', labelKey: 'education' },
    { id: '❤️ Sağlık & Yaşam', labelKey: 'health' },
    { id: '🌍 Sosyal & Eğlence', labelKey: 'social' },
    { id: '🧩 Diğer', labelKey: 'other' }
  ];

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) return setError(t('errTitleEmpty'));
    if (!formData.description.trim()) return setError(t('errDescEmpty'));
    if (!formData.google_group_url.startsWith('http')) {
      return setError(t('errGroupUrl'));
    }
    if (!formData.play_store_url.startsWith('http')) {
      return setError(t('errPlayUrl'));
    }

    setSaving(true);
    try {
      let screenshot_url = null;
      if (screenshotFile) {
        setUploadStatus(t('statusCompressing'));
        const compressedFile = await compressImage(screenshotFile);
        
        setUploadStatus(t('statusUploading'));
        screenshot_url = await db.uploadScreenshot(compressedFile);
      }

      setUploadStatus(t('statusSaving'));
      await db.addApp({
        ...formData,
        screenshot_url
      });
      router.push('/');
    } catch (e) {
      console.error(e);
      setError(e.message || t('errGeneric'));
    } finally {
      setSaving(false);
      setUploadStatus('');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div className="form-card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>{t('commentLoginRequired').replace('için', '')}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Uygulama ekleyebilmek için öncelikle Google hesabınız ile giriş yapmanız gerekmektedir.
            </p>
            <button onClick={() => db.loginWithGoogle()} className="primary">
              {t('loginGoogle')}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container">
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', textAlign: 'center' }}>
          {t('addTitle')}
        </h1>

        <div className="form-card">
          {error && <div className="alert-info" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">{t('appName')}</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Örn: Focus Pomodoro"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">{t('appCategory')}</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{t(cat.labelKey)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('appDesc')}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Uygulamanızın ne işe yaradığını, test kullanıcılarının neleri denemesini istediğinizi detaylıca açıklayın."
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="google_group_url">{t('googleGroupUrl')}</label>
              <input
                type="url"
                id="google_group_url"
                name="google_group_url"
                value={formData.google_group_url}
                onChange={handleChange}
                placeholder="Örn: https://groups.google.com/g/uygulamanizin-test-grubu"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                {t('googleGroupHelp')}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="play_store_url">{t('playStoreUrl')}</label>
              <input
                type="url"
                id="play_store_url"
                name="play_store_url"
                value={formData.play_store_url}
                onChange={handleChange}
                placeholder="Örn: https://play.google.com/apps/testing/com.sirket.uygulama"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                {t('playStoreHelp')}
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="screenshot">{t('screenshot')}</label>
              <input
                type="file"
                id="screenshot"
                name="screenshot"
                accept="image/*"
                onChange={(e) => setScreenshotFile(e.target.files[0] || null)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#16161a',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-color)',
                  width: '100%'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                {t('screenshotHelp')}
              </span>
            </div>

            <div className="form-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
              {uploadStatus && (
                <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', textAlign: 'center', fontWeight: '500' }}>
                  {uploadStatus}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => router.push('/')} disabled={saving}>
                  {t('cancel')}
                </button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? t('saving') : t('save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
