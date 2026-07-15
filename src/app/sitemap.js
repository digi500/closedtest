import { db } from '../lib/db';

// Helper to detect if text is Turkish or English
function detectLanguage(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  
  // Turkish specific characters
  const turkishChars = /[şçğıöüıİĞÜŞÖÇ]/;
  // Very common Turkish stop words
  const turkishWords = /\b(ve|bir|için|bu|ile|de|da|olan|olarak|en|veya|ama|içinde|göre|kadar|yeni|tüm|tümü|araçlar|odaklanma|sayacı|oyunu|retro|grafiklere|bağımlılık|arkadaşlarınızla|günlük|gelir|giderlerinizi|sade|şekilde|takip|grafikli|raporlar|hakkında|destek|giriş|üye|indir|uygulaması)\b/;
  
  if (turkishChars.test(text) || turkishWords.test(text)) {
    return 'tr';
  }
  return 'en';
}

export default async function sitemap() {
  const baseUrl = 'https://closedtest-beryl.vercel.app';

  // Fetch all applications
  let apps = [];
  try {
    apps = await db.getApps() || [];
  } catch (e) {
    console.error('Error fetching apps for sitemap:', e);
  }

  // Major languages for the homepage alternates to keep it clean and optimized
  const majorLangs = ["tr", "en", "de", "fr", "es", "it", "ru", "pt-BR", "zh", "ja", "ko"];

  const routes = [];

  // 1. Add home page with major language alternates
  const homeLanguages = {};
  majorLangs.forEach(code => {
    homeLanguages[code] = `${baseUrl}/?lang=${code}`;
  });

  routes.push({
    url: `${baseUrl}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
    alternates: {
      languages: homeLanguages,
    },
  });

  // 2. Add dynamic app detail pages
  // Each app is published with a single link matching its original description language.
  // We omit '?lang=tr' for Turkish apps since Turkish is the site's default language, keeping the URL clean.
  apps.forEach(app => {
    if (app && app.id) {
      const appLang = detectLanguage(app.title, app.description);
      const lastMod = app.created_at ? new Date(app.created_at) : new Date();
      
      const url = appLang === 'tr' 
        ? `${baseUrl}/app/${app.id}` 
        : `${baseUrl}/app/${app.id}?lang=${appLang}`;

      routes.push({
        url: url,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  });

  return routes;
}
