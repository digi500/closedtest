import { db } from '../../../lib/db';

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  let app = null;
  try {
    app = await db.getApp(id);
  } catch (e) {
    console.error('Error fetching app for metadata:', e);
  }

  if (!app) {
    return {
      title: "Uygulama Bulunamadı - Closed Test",
    };
  }

  return {
    title: `${app.title} - Google Play Kapalı Test Desteği | Closed Test`,
    description: `${app.title} için kapalı test grubuna katılın, 14 günlük test kullanıcısı olun. Açıklama: ${app.description ? app.description.slice(0, 150) : ''}...`,
    alternates: {
      canonical: `https://closedtest.com/app/${id}`,
    }
  };
}

export default function AppLayout({ children }) {
  return <>{children}</>;
}
