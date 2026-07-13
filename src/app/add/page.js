'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { db } from '../../lib/db';

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
    '🎮 Oyun',
    '🛠️ Araçlar & Verimlilik',
    '🎓 Eğitim & Bilgi',
    '❤️ Sağlık & Yaşam',
    '🌍 Sosyal & Eğlence',
    '🧩 Diğer'
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
    if (!formData.title.trim()) return setError('Uygulama adı boş bırakılamaz.');
    if (!formData.description.trim()) return setError('Açıklama alanı boş bırakılamaz.');
    if (!formData.google_group_url.startsWith('http')) {
      return setError('Geçerli bir Google Grubu katılım linki girin (https://... ile başlamalı).');
    }
    if (!formData.play_store_url.startsWith('http')) {
      return setError('Geçerli bir Google Play Store test linki girin (https://... ile başlamalı).');
    }

    setSaving(true);
    try {
      let screenshot_url = null;
      if (screenshotFile) {
        setUploadStatus('Resim sıkıştırılıyor...');
        const compressedFile = await compressImage(screenshotFile);
        
        setUploadStatus('Resim depoya yükleniyor...');
        screenshot_url = await db.uploadScreenshot(compressedFile);
      }

      setUploadStatus('Uygulama bilgileri kaydediliyor...');
      await db.addApp({
        ...formData,
        screenshot_url
      });
      router.push('/');
    } catch (e) {
      console.error(e);
      setError(e.message || 'Uygulama eklenirken bir hata oluştu.');
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
          <p style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>
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
            <h2 style={{ marginBottom: '1rem' }}>Giriş Yapmalısınız</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Uygulama ekleyebilmek için öncelikle Google hesabınız ile giriş yapmanız gerekmektedir.
            </p>
            <button onClick={() => db.loginWithGoogle()} className="primary">
              Google ile Giriş Yap
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
          Yeni Test Talebi Oluştur
        </h1>

        <div className="form-card">
          {error && <div className="alert-info" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Uygulama Adı</label>
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
              <label htmlFor="category">Kategori</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Uygulama Açıklaması ve Test Talebi Detayı</label>
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
              <label htmlFor="google_group_url">Google Grubu Katılım Linki</label>
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
                Kullanıcıların Google Play üzerinden test grubunuza dahil olabilmesi için bu gruba katılmaları gerekir.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="play_store_url">Google Play Store Test Bağlantısı (Opt-in Link)</label>
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
                Google Play Console'daki kapalı test panelinizden alacağınız test katılım bağlantısı.
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="screenshot">Uygulama Ekran Görüntüsü (Dikey - İsteğe Bağlı)</label>
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
                Uygulamanızın dikey (telefon ekranı) ekran görüntüsü. Resim yüklenirken otomatik olarak WebP olarak sıkıştırılır.
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
                  Vazgeç
                </button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Yayınla'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
