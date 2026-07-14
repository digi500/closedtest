'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { db } from '../lib/db';
import { useLanguage } from '../context/LanguageContext';

const languageOptions = [
  { value: "tr", flag: "🇹🇷", name: "Türkçe" },
  { value: "en", flag: "🇺🇸", name: "English" },
  { value: "en-GB", flag: "🇬🇧", name: "English" },
  { value: "en-AU", flag: "🇦🇺", name: "English" },
  { value: "pt-BR", flag: "🇧🇷", name: "Português" },
  { value: "pt-PT", flag: "🇵🇹", name: "Português" },
  { value: "es", flag: "🇪🇸", name: "Español" },
  { value: "es-MX", flag: "🇲🇽", name: "Español" },
  { value: "de", flag: "🇩🇪", name: "Deutsch" },
  { value: "fr", flag: "🇫🇷", name: "Français" },
  { value: "it", flag: "🇮🇹", name: "Italiano" },
  { value: "ru", flag: "🇷🇺", name: "Русский" },
  { value: "zh", flag: "🇨🇳", name: "简体中文" },
  { value: "ja", flag: "🇯🇵", name: "日本語" },
  { value: "ko", flag: "🇰🇷", name: "한국어" },
  { value: "hi", flag: "🇮🇳", name: "हिन्दी" },
  { value: "ar", flag: "🇸🇦", name: "العربية" },
  { value: "nl", flag: "🇳🇱", name: "Nederlands" },
  { value: "pl", flag: "🇵🇱", name: "Polski" },
  { value: "sv", flag: "🇸🇪", name: "Svenska" },
  { value: "no", flag: "🇳🇴", name: "Norsk" },
  { value: "da", flag: "🇩🇰", name: "Dansk" },
  { value: "fi", flag: "🇫🇮", name: "Suomi" },
  { value: "el", flag: "🇬🇷", name: "Ελληνικά" },
  { value: "he", flag: "🇮🇱", name: "עברית" },
  { value: "cs", flag: "🇨🇿", name: "Čeština" },
  { value: "ro", flag: "🇷🇴", name: "Română" },
  { value: "hu", flag: "🇭🇺", name: "Magyar" },
  { value: "uk", flag: "🇺🇦", name: "Українська" },
  { value: "id", flag: "🇮🇩", name: "Bahasa Indonesia" },
  { value: "vi", flag: "🇻🇳", name: "Tiếng Việt" },
  { value: "th", flag: "🇹🇭", name: "ไทย" },
  { value: "tl", flag: "🇵🇭", name: "Tagalog" },
  { value: "ms", flag: "🇲🇾", name: "Bahasa Melayu" },
  { value: "sk", flag: "🇸🇰", name: "Slovenčina" },
  { value: "bg", flag: "🇧🇬", name: "Български" },
  { value: "hr", flag: "🇭🇷", name: "Hrvatski" },
  { value: "sr", flag: "🇷🇸", name: "Српски / Srpski" },
  { value: "zh-TW", flag: "🇹🇼", name: "繁體中文" },
  { value: "ca", flag: "🇦🇩", name: "Català" },
  { value: "sl", flag: "🇸🇮", name: "Slovenščina" },
  { value: "et", flag: "🇪🇪", name: "Eesti" },
  { value: "lv", flag: "🇱🇻", name: "Latviešu" },
  { value: "lt", flag: "🇱🇹", name: "Lietuvių" },
  { value: "is", flag: "🇮🇸", name: "Íslenska" },
  { value: "ga", flag: "🇮🇪", name: "Gaeilge" },
  { value: "mt", flag: "🇲🇹", name: "Malti" },
  { value: "sq", flag: "🇦🇱", name: "Shqip" },
  { value: "mk", flag: "🇲🇰", name: "Македонски" },
  { value: "bs", flag: "🇧🇦", name: "Bosanski" },
  { value: "ka", flag: "🇬🇪", name: "ქართული" },
  { value: "hy", flag: "🇦🇲", name: "Հայերեն" },
  { value: "az", flag: "🇦🇿", name: "Azərbaycan dili" },
  { value: "kk", flag: "🇰🇿", name: "Қาзақ тілі" },
  { value: "uz", flag: "🇺🇿", name: "O'zbekcha" },
  { value: "fa", flag: "🇮🇷", name: "فارسی" },
  { value: "ur", flag: "🇵🇰", name: "اردو" },
  { value: "bn", flag: "🇧🇩", name: "বাংলা" },
  { value: "pa", flag: "🇵🇰", name: "ਪੰਜਾਬੀ / پنجابی" },
  { value: "mr", flag: "🇮🇳", name: "मराठी" },
  { value: "te", flag: "🇮🇳", name: "తెలుగు" },
  { value: "ta", flag: "🇮🇳", name: "தமிழ்" },
  { value: "gu", flag: "🇮🇳", name: "ગુજરાતી" },
  { value: "kn", flag: "🇮🇳", name: "ಕನ್ನಡ" },
  { value: "ml", flag: "🇮🇳", name: "മലയാളം" },
  { value: "si", flag: "🇱🇰", name: "සිංහල" },
  { value: "ne", flag: "🇳🇵", name: "नेपाली" },
  { value: "my", flag: "🇲🇲", name: "မြန်မာဘာသာ" },
  { value: "km", flag: "🇰🇭", name: "ភាសាខ្មែរ" },
  { value: "lo", flag: "🇱🇦", name: "ພາສາລາວ" },
  { value: "mn", flag: "🇲🇳", name: "Монгол хэл" },
  { value: "tg", flag: "🇹🇯", name: "Тоҷикӣ" },
  { value: "ky", flag: "🇰🇬", name: "Кыргызча" },
  { value: "tk", flag: "🇹🇲", name: "Türkmen dili" },
  { value: "eu", flag: "🇪🇸", name: "Euskara" },
  { value: "gl", flag: "🇪🇸", name: "Galego" },
  { value: "lb", flag: "🇱🇺", name: "Lëtzebuergesch" },
  { value: "cy", flag: "🇬🇧", name: "Cymraeg" },
  { value: "af", flag: "🇿🇦", name: "Afrikaans" },
  { value: "sw", flag: "🇰🇪", name: "Kiswahili" },
  { value: "zu", flag: "🇿🇦", name: "isiZulu" },
  { value: "xh", flag: "🇿🇦", name: "isiXhosa" },
  { value: "am", flag: "🇪🇹", name: "አማርኛ" },
  { value: "yo", flag: "🇳🇬", name: "Yorùbá" },
  { value: "ig", flag: "🇳🇬", name: "Igbo" },
  { value: "so", flag: "🇸🇴", name: "Soomaali" },
  { value: "mg", flag: "🇲🇬", name: "Malagasy" },
  { value: "eo", flag: "🌐", name: "Esperanto" },
  { value: "la", flag: "🇻🇦", name: "Latina" },
  { value: "haw", flag: "🇺🇸", name: "ʻŌlelo Hawaiʻi" },
  { value: "mi", flag: "🇳🇿", name: "Te Reo Māori" },
  { value: "sm", flag: "🇼🇸", name: "Gagana Samoa" },
  { value: "su", flag: "🇮🇩", name: "Basa Sunda" },
  { value: "jv", flag: "🇮🇩", name: "Basa Jawa" },
  { value: "hmn", flag: "🏳️", name: "Hmoob" },
  { value: "yi", flag: "🇮🇱", name: "ייִדיש" },
  { value: "co", flag: "🇫🇷", name: "Corsu" },
  { value: "fy", flag: "🇳🇱", name: "Frysk" },
  { value: "sa", flag: "🇮🇳", name: "संस्कृतम्" },
  { value: "bo", flag: "🇨🇳", name: "བོད་སྐད།" },
  { value: "gn", flag: "🇵🇾", name: "Avañe'ẽ" },
  { value: "be", flag: "🇧🇾", name: "Беларуская" },
  { value: "tt", flag: "🇷🇺", name: "Татарча" },
  { value: "gd", flag: "🇬🇧", name: "Gàidhlig" },
  { value: "fo", flag: "🇩🇰", name: "Føroyskt" },
  { value: "or", flag: "🇮🇳", name: "ଓଡ଼ିଆ" },
  { value: "sd", flag: "🇵🇰", name: "سنڌي" },
  { value: "as", flag: "🇮🇳", name: "অসমীয়া" },
  { value: "qu", flag: "🇵🇪", name: "Qhichwa" },
  { value: "ay", flag: "🇧🇴", name: "Aymar aru" },
  { value: "om", flag: "🇪🇹", name: "Afaan Oromoo" },
  { value: "ti", flag: "🇪🇷", name: "ትግርኛ" },
  { value: "rw", flag: "🇷🇼", name: "Ikinyarwanda" },
  { value: "sn", flag: "🇿🇼", name: "chiShona" },
  { value: "fj", flag: "🇫🇯", name: "Na Vosa Vakaviti" },
  { value: "to", flag: "🇹🇴", name: "Lea Faka-Tonga" }
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

  // 1. Sort options alphabetically by localized language name (Turkish locale compare)
  const sortedOptions = [...languageOptions].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  // 2. Filter sorted options
  const filteredOptions = sortedOptions.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
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
        <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>
          {selectedOption.flag}
        </span>
        <span>{selectedOption.name}</span>
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
                  <span style={{ display: 'inline-block', width: '20px', textAlign: 'center', marginRight: '0.5rem' }}>
                    {opt.flag}
                  </span>
                  <span>{opt.name}</span>
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
