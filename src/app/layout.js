import "./globals.css";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: "Closed Test - Google Play Kapalı Test Yardımlaşma Platformu",
  description: "Google Play 14 günlük kapalı test süreci için gönüllü test kullanıcıları bulun, geri bildirim toplayın ve uygulamanızı başarıyla yayınlayın.",
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
