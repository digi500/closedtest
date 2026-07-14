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
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                color: 'var(--text-color)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: '600',
                outline: 'none',
                marginRight: '0.5rem'
              }}
            >
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="en">🇺🇸 English</option>
              <option value="en-GB">🇬🇧 English</option>
              <option value="en-AU">🇦🇺 English</option>
              <option value="pt-BR">🇧🇷 Português</option>
              <option value="pt-PT">🇵🇹 Português</option>
              <option value="es">🇪🇸 Español</option>
              <option value="es-MX">🇲🇽 Español</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="ru">🇷🇺 Русский</option>
              <option value="zh">🇨🇳 简体中文</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="ko">🇰🇷 한국어</option>
              <option value="hi">🇮🇳 हिन्दी</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="nl">🇳🇱 Nederlands</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="sv">🇸🇪 Svenska</option>
              <option value="no">🇳🇴 Norsk</option>
              <option value="da">🇩🇰 Dansk</option>
              <option value="fi">🇫🇮 Suomi</option>
              <option value="el">🇬🇷 Ελληνικά</option>
              <option value="he">🇮🇱 עברית</option>
              <option value="cs">🇨🇿 Čeština</option>
              <option value="ro">🇷🇴 Română</option>
              <option value="hu">🇭🇺 Magyar</option>
              <option value="uk">🇺🇦 Українська</option>
              <option value="id">🇮🇩 Bahasa Indonesia</option>
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="th">🇹🇭 ไทย</option>
              <option value="tl">🇵🇭 Tagalog</option>
              <option value="ms">🇲🇾 Bahasa Melayu</option>
              <option value="sk">🇸🇰 Slovenčina</option>
              <option value="bg">🇧🇬 Български</option>
              <option value="hr">🇭🇷 Hrvatski</option>
              <option value="sr">🇷🇸 Српски / Srpski</option>
              <option value="zh-TW">🇹🇼 繁體中文</option>
              <option value="ca">🇦🇩 Català</option>
              <option value="sl">🇸🇮 Slovenščina</option>
              <option value="et">🇪🇪 Eesti</option>
              <option value="lv">🇱🇻 Latviešu</option>
              <option value="lt">🇱🇹 Lietuvių</option>
              <option value="is">🇮🇸 Íslenska</option>
              <option value="ga">🇮🇪 Gaeilge</option>
              <option value="mt">🇲🇹 Malti</option>
              <option value="sq">🇦🇱 Shqip</option>
              <option value="mk">🇲🇰 Македонски</option>
              <option value="bs">🇧🇦 Bosanski</option>
              <option value="ka">🇬🇪 ქართული</option>
              <option value="hy">🇦🇲 Հայերեն</option>
              <option value="az">🇦🇿 Azərbaycan dili</option>
              <option value="kk">🇰🇿 Қазақ тілі</option>
              <option value="uz">🇺🇿 O'zbekcha</option>
              <option value="fa">🇮🇷 فارسی</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="bn">🇧🇩 বাংলা</option>
              <option value="pa">🇵🇰 ਪੰਜਾਬੀ / پنجابی</option>
              <option value="mr">🇮🇳 मराठी</option>
              <option value="te">🇮🇳 తెలుగు</option>
              <option value="ta">🇮🇳 தமிழ்</option>
              <option value="gu">🇮🇳 ગુજરાતી</option>
              <option value="kn">🇮🇳 ಕನ್ನಡ</option>
              <option value="ml">🇮🇳 മലയാളം</option>
              <option value="si">🇱🇰 සිංහල</option>
              <option value="ne">🇳🇵 नेपाली</option>
              <option value="my">🇲🇲 မြန်မာဘာသာ</option>
              <option value="km">🇰🇭 ភាសាខ្មែរ</option>
              <option value="lo">🇱🇦 ພາສາລາວ</option>
              <option value="mn">🇲🇳 Монгол хэл</option>
              <option value="tg">🇹🇯 Тоҷикӣ</option>
              <option value="ky">🇰🇬 Кыргызча</option>
              <option value="tk">🇹🇲 Türkmen dili</option>
              <option value="eu">🇪🇸 Euskara</option>
              <option value="gl">🇪🇸 Galego</option>
              <option value="lb">🇱🇺 Lëtzebuergesch</option>
              <option value="cy">🇬🇧 Cymraeg</option>
              <option value="af">🇿🇦 Afrikaans</option>
              <option value="sw">🇰🇪 Kiswahili</option>
              <option value="zu">🇿🇦 isiZulu</option>
              <option value="xh">🇿🇦 isiXhosa</option>
              <option value="am">🇪🇹 አማርኛ</option>
              <option value="yo">🇳🇬 Yorùbá</option>
              <option value="ig">🇳🇬 Igbo</option>
              <option value="so">🇸🇴 Soomaali</option>
              <option value="mg">🇲🇬 Malagasy</option>
              <option value="eo">🌐 Esperanto</option>
              <option value="la">🇻🇦 Latina</option>
              <option value="haw">🇺🇸 ʻŌlelo Hawaiʻi</option>
              <option value="mi">🇳🇿 Te Reo Māori</option>
              <option value="sm">🇼🇸 Gagana Samoa</option>
              <option value="su">🇮🇩 Basa Sunda</option>
              <option value="jv">🇮🇩 Basa Jawa</option>
              <option value="hmn">🏳️ Hmoob</option>
              <option value="yi">🇮🇱 ייִדיש</option>
              <option value="co">🇫🇷 Corsu</option>
              <option value="fy">🇳🇱 Frysk</option>
              <option value="sa">🇮🇳 संस्कृतम्</option>
              <option value="bo">🇨🇳 བོད་སྐད།</option>
              <option value="gn">🇵🇾 Avañe'ẽ</option>
              <option value="be">🇧🇾 Беларуская</option>
              <option value="tt">🇷🇺 Татарча</option>
              <option value="gd">🇬🇧 Gàidhlig</option>
              <option value="fo">🇩🇰 Føroyskt</option>
              <option value="or">🇮🇳 ଓଡ଼ିଆ</option>
              <option value="sd">🇵🇰 سنڌي</option>
              <option value="as">🇮🇳 অসমীয়া</option>
              <option value="qu">🇵🇪 Qhichwa</option>
              <option value="ay">🇧🇴 Aymar aru</option>
              <option value="om">🇪🇹 Afaan Oromoo</option>
              <option value="ti">🇪🇷 ትግርኛ</option>
              <option value="rw">🇷🇼 Ikinyarwanda</option>
              <option value="sn">🇿🇼 chiShona</option>
              <option value="fj">🇫🇯 Na Vosa Vakaviti</option>
              <option value="to">🇹🇴 Lea Faka-Tonga</option>
            </select>
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
