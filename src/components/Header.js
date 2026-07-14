'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { db } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

const languageOptions = [
  { value: "tr", label: "🇹🇷 Türkçe" },
  { value: "en", label: "🇺🇸 English" },
  { value: "en-GB", label: "🇬🇧 English" },
  { value: "en-AU", label: "🇦🇺 English" },
  { value: "pt-BR", label: "🇧🇷 Português" },
  { value: "pt-PT", label: "🇵🇹 Português" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "es-MX", label: "🇲🇽 Español" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "ru", label: "🇷🇺 Русский" },
  { value: "zh", label: "🇨🇳 简体中文" },
  { value: "ja", label: "🇯🇵 日本語" },
  { value: "ko", label: "🇰🇷 한국어" },
  { value: "hi", label: "🇮🇳 हिन्दी" },
  { value: "ar", label: "🇸🇦 العربية" },
  { value: "nl", label: "🇳🇱 Nederlands" },
  { value: "pl", label: "🇵🇱 Polski" },
  { value: "sv", label: "🇸🇪 Svenska" },
  { value: "no", label: "🇳🇴 Norsk" },
  { value: "da", label: "🇩🇰 Dansk" },
  { value: "fi", label: "🇫🇮 Suomi" },
  { value: "el", label: "🇬🇷 Ελληνικά" },
  { value: "he", label: "🇮🇱 עברית" },
  { value: "cs", label: "🇨🇿 Čeština" },
  { value: "ro", label: "🇷🇴 Română" },
  { value: "hu", label: "🇭🇺 Magyar" },
  { value: "uk", label: "🇺🇦 Українська" },
  { value: "id", label: "🇮🇩 Bahasa Indonesia" },
  { value: "vi", label: "🇻🇳 Tiếng Việt" },
  { value: "th", label: "🇹🇭 ไทย" },
  { value: "tl", label: "🇵🇭 Tagalog" },
  { value: "ms", label: "🇲🇾 Bahasa Melayu" },
  { value: "sk", label: "🇸🇰 Slovenčina" },
  { value: "bg", label: "🇧🇬 Български" },
  { value: "hr", label: "🇭🇷 Hrvatski" },
  { value: "sr", label: "🇷🇸 Српски / Srpski" },
  { value: "zh-TW", label: "🇹🇼 繁體中文" },
  { value: "ca", label: "🇦🇩 Català" },
  { value: "sl", label: "🇸🇮 Slovenščina" },
  { value: "et", label: "🇪🇪 Eesti" },
  { value: "lv", label: "🇱🇻 Latviešu" },
  { value: "lt", label: "🇱🇹 Lietuvių" },
  { value: "is", label: "🇮🇸 Íslenska" },
  { value: "ga", label: "🇮🇪 Gaeilge" },
  { value: "mt", label: "🇲🇹 Malti" },
  { value: "sq", label: "🇦🇱 Shqip" },
  { value: "mk", label: "🇲🇰 Македонски" },
  { value: "bs", label: "🇧🇦 Bosanski" },
  { value: "ka", label: "🇬🇪 ქართული" },
  { value: "hy", label: "🇦🇲 Հայերեն" },
  { value: "az", label: "🇦🇿 Azərbaycan dili" },
  { value: "kk", label: "🇰🇿 Қาзақ тілі" },
  { value: "uz", label: "🇺🇿 O'zbekcha" },
  { value: "fa", label: "🇮🇷 فارسی" },
  { value: "ur", label: "🇵🇰 اردو" },
  { value: "bn", label: "🇧🇩 বাংলা" },
  { value: "pa", label: "🇵🇰 ਪੰਜਾਬী / پنجابی" },
  { value: "mr", label: "🇮🇳 मराठी" },
  { value: "te", label: "🇮🇳 తెలుగు" },
  { value: "ta", label: "🇮🇳 தமிழ்" },
  { value: "gu", label: "🇮🇳 ગુજરાતી" },
  { value: "kn", label: "🇮🇳 ಕನ್ನಡ" },
  { value: "ml", label: "🇮🇳 മലയാളം" },
  { value: "si", label: "🇱🇰 සිංහල" },
  { value: "ne", label: "🇳🇵 नेपाली" },
  { value: "my", label: "🇲🇲 မြန်မာဘာသာ" },
  { value: "km", label: "🇰🇭 ភាសាខ្មែរ" },
  { value: "lo", label: "🇱🇦 ພາສາລາວ" },
  { value: "mn", label: "🇲🇳 Монгол хэл" },
  { value: "tg", label: "🇹🇯 Тоҷикӣ" },
  { value: "ky", label: "🇰🇬 Кыргызча" },
  { value: "tk", label: "🇹🇲 Türkmen dili" },
  { value: "eu", label: "🇪🇸 Euskara" },
  { value: "gl", label: "🇪🇸 Galego" },
  { value: "lb", label: "🇱🇺 Lëtzebuergesch" },
  { value: "cy", label: "🇬🇧 Cymraeg" },
  { value: "af", label: "🇿🇦 Afrikaans" },
  { value: "sw", label: "🇰🇪 Kiswahili" },
  { value: "zu", label: "🇿🇦 isiZulu" },
  { value: "xh", label: "🇿🇦 isiXhosa" },
  { value: "am", label: "🇪🇹 አማርኛ" },
  { value: "yo", label: "🇳🇬 Yorùbá" },
  { value: "ig", label: "🇳🇬 Igbo" },
  { value: "so", label: "🇸🇴 Soomaali" },
  { value: "mg", label: "🇲🇬 Malagasy" },
  { value: "eo", label: "🌐 Esperanto" },
  { value: "la", label: "🇻🇦 Latina" },
  { value: "haw", label: "🇺🇸 ʻŌlelo Hawaiʻi" },
  { value: "mi", label: "🇳🇿 Te Reo Māori" },
  { value: "sm", label: "🇼🇸 Gagana Samoa" },
  { value: "su", label: "🇮🇩 Basa Sunda" },
  { value: "jv", label: "🇮🇩 Basa Jawa" },
  { value: "hmn", label: "🏳️ Hmoob" },
  { value: "yi", label: "🇮🇱 ייִדיש" },
  { value: "co", label: "🇫🇷 Corsu" },
  { value: "fy", label: "🇳🇱 Frysk" },
  { value: "sa", label: "🇮🇳 संस्कृतम्" },
  { value: "bo", label: "🇨🇳 བོད་སྐད།" },
  { value: "gn", label: "🇵🇾 Avañe'ẽ" },
  { value: "be", label: "🇧🇾 Беларуская" },
  { value: "tt", label: "🇷🇺 Татарча" },
  { value: "gd", label: "🇬🇧 Gàidhlig" },
  { value: "fo", label: "🇩🇰 Føroyskt" },
  { value: "or", label: "🇮🇳 ଓଡ଼ିଆ" },
  { value: "sd", label: "🇵🇰 سنڌي" },
  { value: "as", label: "🇮🇳 অসমীয়া" },
  { value: "qu", label: "🇵🇪 Qhichwa" },
  { value: "ay", label: "🇧🇴 Aymar aru" },
  { value: "om", label: "🇪🇹 Afaan Oromoo" },
  { value: "ti", label: "🇪🇷 ትግርኛ" },
  { value: "rw", label: "🇷🇼 Ikinyarwanda" },
  { value: "sn", label: "🇿🇼 chiShona" },
  { value: "fj", label: "🇫🇯 Na Vosa Vakaviti" },
  { value: "to", label: "🇹🇴 Lea Faka-Tonga" }
];

function LanguageDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = languageOptions.find(opt => opt.value === value) || languageOptions[0];

  const filteredOptions = languageOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', marginRight: '0.5rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          padding: '0.35rem 0.6rem',
          borderRadius: '6px',
          color: 'var(--text-color)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          outline: 'none',
        }}
      >
        <span>{selectedOption.label}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '115%',
            right: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            width: '240px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="Ara / Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-color)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                color: 'var(--text-color)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
              autoFocus
            />
          </div>
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '0.25rem 0'
            }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    width: '100%',
                    background: opt.value === value ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: 'none',
                    padding: '0.45rem 0.75rem',
                    color: opt.value === value ? 'var(--accent-color)' : 'var(--text-color)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (opt.value !== value) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (opt.value !== value) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Sonuç bulunamadı.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
            <LanguageDropdown value={language} onChange={changeLanguage} />
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
