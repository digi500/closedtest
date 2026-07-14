import "./globals.css";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";

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

const alternatesLanguages = {};
langCodes.forEach(code => {
  alternatesLanguages[code] = `https://closedtest-beryl.vercel.app/?lang=${code}`;
});

export const metadata = {
  title: "Closed Test - Google Play Kapalı Test Yardımlaşma Platformu",
  description: "Google Play 14 günlük kapalı test süreci için gönüllü test kullanıcıları bulun, geri bildirim toplayın ve uygulamanızı başarıyla yayınlayın.",
  alternates: {
    canonical: 'https://closedtest-beryl.vercel.app',
    languages: alternatesLanguages,
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <LanguageProvider>
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
