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

  const faqs = [
    {
      q: t('faq1Q'),
      a: t('faq1A')
    },
    {
      q: t('faq2Q'),
      a: t('faq2A')
    },
    {
      q: t('faq3Q'),
      a: t('faq3A')
    },
    {
      q: t('faq4Q'),
      a: t('faq4A')
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
            {t('supportTitle')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            {t('supportDesc')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
          
          {/* FAQ Area (Left Column) */}
          <div style={{ flex: '1.2', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
              {t('faqTitle')}
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
              {t('contactFormTitle')}
            </h2>

            {success ? (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>✉️</span>
                <h3 style={{ fontSize: '1.1rem', color: '#10b981', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {t('messageSent')}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('messageSentDesc')}
                </p>
                <button className="primary" onClick={() => setSuccess(false)} style={{ fontSize: '0.85rem' }}>
                  {t('writeNewMessage')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    {t('nameLabel')}
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
                    {t('emailLabel')}
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
                    {t('subjectLabel')}
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
                    {t('messageLabel')}
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
                    ? t('sendingMessage')
                    : t('sendMessage')}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
