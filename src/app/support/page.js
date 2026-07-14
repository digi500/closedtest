'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { db } from '../../lib/db';
import { useLanguage } from '../../context/LanguageContext';

export default function SupportPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = language === 'tr' ? [
    {
      q: 'Google Play 20 Test Kullanıcısı Kuralı Nedir?',
      a: 'Google, Kasım 2023\'ten sonra açılan yeni bireysel geliştirici hesapları için uygulamalarını yayına almadan önce en az 20 test kullanıcısı ile en az 14 gün boyunca aralıksız kapalı test yapma zorunluluğu getirmiştir. Bu kuralı tamamlamayan uygulamalar yayına alınamaz.'
    },
    {
      q: 'Platform Nasıl Çalışıyor? Ücretli mi?',
      a: 'Platformumuz tamamen ücretsiz ve yardımlaşma (cooperative) esasına dayanır. Geliştiriciler birbirlerinin uygulamalarını test ederler. Siz başkalarının uygulamalarını test ettikçe kazanacağınız prestij ve yardımlaşma ağı ile diğer geliştiriciler de sizin uygulamanızı test eder.'
    },
    {
      q: 'Bir Uygulamayı Nasıl Test Ederim?',
      a: 'Test etmek istediğiniz uygulamanın sayfasına gidin. 1. Adımdaki butona tıklayarak uygulamanın Google Grubuna katılın. Ardından 2. Adımdaki indirme butonuna tıklayarak uygulamayı Google Play\'den telefonunuza indirin ve en az 14 gün boyunca telefonunuzdan silmeyin.'
    },
    {
      q: 'Uygulamamın Test Süreci Bitince Ne Olur?',
      a: '14 günlük süreç başarıyla tamamlandığında, uygulama detay sayfanızda bulunan geliştirici panelinden uygulamanızı "Yayınlandı Olarak İşaretle" seçeneğiyle güncelleyebilirsiniz. Sistemimiz bunu Google Play Store üzerinden de doğrular. Bu aşamadan sonra test adımları kalkar ve doğrudan Google Play indirme butonu görünür.'
    }
  ] : [
    {
      q: 'What is the Google Play 20 Tester Rule?',
      a: 'Google requires all new personal developer accounts created after November 2023 to run a closed test with at least 20 testers for 14 consecutive days before they can publish their apps to production.'
    },
    {
      q: 'How Does This Platform Work? Is it Free?',
      a: 'Our platform is completely free and based on mutual cooperation. Developers test each other\'s apps. By testing other applications, you build connections and trust, and other developers test your app in return.'
    },
    {
      q: 'How Do I Test an Application?',
      a: 'Go to the page of the app you want to test. Click the button in Step 1 to join the Google Group. Then, click the button in Step 2 to download the app from Google Play, and keep it installed on your phone for at least 14 days.'
    },
    {
      q: 'What Happens When My App Testing is Complete?',
      a: 'Once the 14-day period is successfully completed, you can mark your app as "Published" via the developer panel on your app page. Our system will also verify this automatically via the Google Play Store. The testing steps will then be replaced by a direct download link.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      alert(language === 'tr' ? 'Mesaj iletilirken bir hata oluştu.' : 'An error occurred while sending your message.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>
            {language === 'tr' ? 'Destek & İletişim' : 'Support & Contact'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            {language === 'tr' 
              ? 'Platform hakkında sorularınız mı var veya bizimle iletişime geçmek mi istiyorsunuz? Aşağıdaki formdan mesaj atabilir veya SSS bölümünü inceleyebilirsiniz.'
              : 'Do you have questions about the platform or want to get in touch? Send us a message using the form below or browse the FAQ section.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* FAQ Area (Left Column) */}
          <div style={{ flex: '1.2', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
              {language === 'tr' ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions'}
            </h2>
            
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '1.25rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--text-color)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    ▼
                  </span>
                </button>
                {activeFaq === idx && (
                  <div style={{ 
                    padding: '0 1.25rem 1.25rem 1.25rem', 
                    fontSize: '0.9rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.6', 
                    borderTop: '1px solid rgba(255,255,255,0.03)',
                    paddingTop: '1rem'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Form Area (Right Column) */}
          <div style={{ flex: '1', minWidth: '320px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              {language === 'tr' ? 'Bize Mesaj Gönderin' : 'Send Us a Message'}
            </h2>

            {success ? (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>✉️</span>
                <h3 style={{ fontSize: '1.1rem', color: '#10b981', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {language === 'tr' ? 'Mesajınız Gönderildi!' : 'Message Sent!'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {language === 'tr' 
                    ? 'İletişim talebiniz başarıyla alındı. En kısa sürede e-posta adresiniz üzerinden geri dönüş yapacağız.' 
                    : 'Your contact request has been received. We will get back to you via email as soon as possible.'}
                </p>
                <button className="primary" onClick={() => setSuccess(false)} style={{ fontSize: '0.85rem' }}>
                  {language === 'tr' ? 'Yeni Mesaj Yaz' : 'Write New Message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    {language === 'tr' ? 'Adınız Soyadınız' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    {language === 'tr' ? 'E-posta Adresiniz' : 'Your Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    {language === 'tr' ? 'Konu' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    {language === 'tr' ? 'Mesajınız' : 'Your Message'}
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '6px',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="primary"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  {loading 
                    ? (language === 'tr' ? 'Gönderiliyor...' : 'Sending...') 
                    : (language === 'tr' ? '✉️ Mesaj Gönder' : '✉️ Send Message')}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
