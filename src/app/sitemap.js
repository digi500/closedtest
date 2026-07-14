import { db } from '../lib/db';

export default async function sitemap() {
  const baseUrl = 'https://closedtest-beryl.vercel.app';

  // Fetch all applications
  let apps = [];
  try {
    apps = await db.getApps() || [];
  } catch (e) {
    console.error('Error fetching apps for sitemap:', e);
  }

  const langCodes = [
    "tr", "en", "en-GB", "en-AU", "pt-BR", "pt-PT", "es", "es-MX", "de", "fr",
    "it", "ru", "zh", "ja", "ko", "hi", "ar", "nl", "pl", "sv",
    "no", "da", "fi", "el", "he", "cs", "ro", "hu", "uk", "id",
    "vi", "th", "tl", "ms", "sk", "bg", "hr", "sr", "zh-TW", "ca",
    "sl", "et", "lv", "lt", "is", "ga", "mt", "sq", "mk", "bs",
    "ka", "hy", "az", "kk", "uz", "fa", "ur", "bn", "pa", "mr",
    "te", "ta", "gu", "kn", "ml", "si", "ne", "my", "km", "lo",
    "mn", "tg", "ky", "tk", "eu", "gl", "lb", "cy", "af", "sw",
    "zu", "xh", "am", "yo", "ig", "so", "mg", "eo", "la", "haw",
    "mi", "sm", "su", "jv", "hmn", "yi", "co", "fy", "sa", "bo",
    "gn", "be", "tt", "gd", "fo", "or", "sd", "as", "qu", "ay",
    "om", "ti", "rw", "sn", "fj", "to"
  ];

  const routes = [];

  // 1. Add home page variations
  langCodes.forEach(code => {
    routes.push({
      url: `${baseUrl}/?lang=${code}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // 2. Add dynamic app detail page variations
  apps.forEach(app => {
    if (app && app.id) {
      langCodes.forEach(code => {
        routes.push({
          url: `${baseUrl}/app/${app.id}?lang=${code}`,
          lastModified: app.created_at ? new Date(app.created_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  });

  return routes;
}
