'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import { db } from '../../../lib/db';
import { useLanguage } from '../../../context/LanguageContext';

export default function AppDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [app, setApp] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedReddit, setCopiedReddit] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const appData = await db.getApp(id);
        if (appData) {
          setApp(appData);
          // Increment click count for page view
          db.incrementCount(id, 'click_count');
          const commentsData = await db.getComments(id);
          setComments(commentsData);
        }
        const currentUser = await db.getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error('Error loading app detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Automatically translate the app description to the selected user language on load or language switch
  useEffect(() => {
    if (app && app.description && language) {
      const autoTranslate = async () => {
        setIsTranslating(true);
        try {
          const targetLang = language;
          const desc = app.description;
          const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(desc)}`);
          const data = await res.json();
          if (data && data[0]) {
            const translatedText = data[0].map(item => item[0]).join('');
            setTranslatedDesc(translatedText);
          }
        } catch (err) {
          console.error("Auto-translation failed:", err);
        } finally {
          setIsTranslating(false);
        }
      };
      autoTranslate();
    }
  }, [app, language]);

  const handleGroupClick = async () => {
    if (!app) return;
    await db.incrementCount(app.id, 'group_join_count');
    setApp(prev => ({ ...prev, group_join_count: (prev.group_join_count || 0) + 1 }));
    window.open(app.google_group_url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadClick = async () => {
    if (!app) return;
    await db.incrementCount(app.id, 'download_count');
    setApp(prev => ({ ...prev, download_count: (prev.download_count || 0) + 1 }));
    window.open(app.play_store_url, '_blank', 'noopener,noreferrer');
  };

  const handleMarkPublished = async () => {
    if (!app || !user || app.owner_id !== user.id) return;
    if (confirm(language === 'tr' ? 'Uygulamanızın 14 günlük test süreci başarıyla tamamlandı ve Google Play\'de yayınlandı olarak işaretlemek istiyor musunuz?' : 'Your application has successfully completed its 14-day testing period and do you want to mark it as published on Google Play?')) {
      const updated = await db.markAsPublished(app.id);
      if (updated) {
        setApp(updated);
      }
    }
  };



  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const created = await db.addComment(app.id, newComment);
      setComments(prev => [...prev, created]);
      setNewComment('');
    } catch (e) {
      alert(e.message || 'Yorum eklenirken hata oluştu.');
    }
  };

  const handleAddReply = async (e, parentId) => {
    e.preventDefault();
    if (!newReply.trim() || !user) return;

    try {
      const created = await db.addComment(app.id, newReply, parentId);
      setComments(prev => [...prev, created]);
      setNewReply('');
      setReplyToId(null);
    } catch (e) {
      alert(e.message || 'Cevap eklenirken hata oluştu.');
    }
  };

  const copyToClipboard = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate pre-formatted Reddit post markdown
  const getRedditPostText = () => {
    if (!app) return '';
    const siteUrl = typeof window !== 'undefined' ? window.location.href : `https://closedtest-beryl.vercel.app/app/${app.id}`;
    if (language === 'tr') {
      return `[Google Play Kapalı Test] Uygulamam için test kullanıcısı arıyorum: ${app.title} (${app.category})

Herkese merhaba! Uygulamamın Google Play'deki zorunlu 14 günlük kapalı test sürecini geçebilmesi için 12 test kullanıcısına ihtiyacım var.

* Uygulama Adı: ${app.title}
* Kategori: ${app.category}
* Açıklama: ${app.description}

Google Grubuma katılabilir ve kapalı test yardımlaşma platformu üzerinden uygulamayı doğrudan indirebilirsiniz:
${siteUrl}

Çok teşekkürler! Siz de kendi uygulamanızı aşağıya yazın, ben de test edeyim.`;
    } else {
      return `[Google Play Closed Testing] Need testers for my app: ${app.title} (${app.category})

Hi everyone! I need 12 testers for my app to pass the mandatory 14-day closed testing period on Google Play.

* App Name: ${app.title}
* Category: ${app.category}
* Description: ${app.description}

You can join my Google Group and download the app directly from the Closed Test platform:
${siteUrl}

Thank you so much! Post yours below and I will test back.`;
    }
  };

  const copyRedditPostText = () => {
    const text = getRedditPostText();
    navigator.clipboard.writeText(text);
    setCopiedReddit(true);
    setTimeout(() => setCopiedReddit(false), 2000);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTranslatedCategory = (catId) => {
    const categories = [
      { id: '🎮 Oyun', labelKey: 'games' },
      { id: '🛠️ Araçlar & Verimlilik', labelKey: 'tools' },
      { id: '🎓 Eğitim & Bilgi', labelKey: 'education' },
      { id: '❤️ Sağlık & Yaşam', labelKey: 'health' },
      { id: '🌍 Sosyal & Eğlence', labelKey: 'social' },
      { id: '🧩 Diğer', labelKey: 'other' }
    ];
    const found = categories.find(c => c.id === catId);
    return found ? t(found.labelKey) : catId;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
        </div>
      </>
    );
  }

  if (!app) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>{t('appNotFound')}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('appNotFoundDesc')}</p>
          <button onClick={() => router.push('/')} style={{ marginTop: '1.5rem' }}>{t('backToHome')}</button>
        </div>
      </>
    );
  }

  // Separate parent comments and replies
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  // Dynamic Schema.org JSON-LD for Google SoftwareApplication rich snippet indexing
  const jsonLd = app ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.title,
    "operatingSystem": "Android",
    "applicationCategory": app.category || "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": app.description,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": comments ? Math.max(1, comments.length) : 1
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header />
      <main className="container">
        <div className="app-detail">
          
          {/* Back button */}
          <div>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('backToApps')}
            </Link>
          </div>

          {/* Header section */}
          <div className="detail-header">
            <div className="detail-logo" style={{ borderColor: app.status === 'published' ? '#10b981' : 'var(--border-color)' }}>
              {app.logo_letter}
            </div>
            <div className="detail-meta-info">
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600', textTransform: 'uppercase' }}>
                {getTranslatedCategory(app.category)}
              </span>
              <h1 className="detail-title">{app.title}</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('addedBy')}: <strong>{app.owner_name}</strong> • {formatDate(app.created_at)}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="detail-stats">
            <div className="stat-item">
              <span className="stat-val">{app.click_count || 0}</span>
              <span className="stat-label">{t('views')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{app.group_join_count || 0}</span>
              <span className="stat-label">{t('groupClicks')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{app.download_count || 0}</span>
              <span className="stat-label">{t('downloadClicks')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-val" style={{ color: app.status === 'published' ? '#10b981' : '#f59e0b' }}>
                {app.status === 'published' ? t('published') : t('testing')}
              </span>
              <span className="stat-label">{t('status')}</span>
            </div>
          </div>

          {/* Creator panel (Owner Actions) */}
          {user && app.owner_id === user.id && (
            <div className="alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <div>
                <strong>{t('devPanel')}</strong> {t('devPanelDesc')}
              </div>
              {app.status === 'testing' ? (
                <button className="primary" onClick={handleMarkPublished} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  {t('markPublished')}
                </button>
              ) : (
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.85rem' }}>{t('markedPublished')}</span>
              )}
            </div>
          )}

          {/* Main layout with Description on left and Screenshot on right */}
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '2rem', marginTop: '1.5rem', alignItems: 'flex-start' }}>
            
            {/* Left Column (Description and Testing Flow) */}
            <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Description */}
              <div>
                <div style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
                    {t('descriptionTitle')}
                  </h3>
                </div>
                <p className="detail-desc" style={{ whiteSpace: 'pre-wrap' }}>
                  {translatedDesc || app.description}
                </p>
              </div>

              {/* Testing Flow Guide / Links */}
              {app.status === 'testing' ? (
                <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-color)' }}>
                    {t('joinTestingTitle')}
                  </h3>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {t('joinTestingDesc')}
                  </p>

                  <div className="detail-links">
                    <button onClick={handleGroupClick} className="primary" style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
                      {t('step1Group')}
                    </button>
                    <button onClick={handleDownloadClick} style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
                      {t('step2Download')}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#10b981' }}>
                    {t('testingFinished')}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {t('testingFinishedDesc')}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column (Screenshot) */}
            {app.screenshot_url && (
              <div style={{ width: '280px', flexShrink: '0', margin: '0 auto' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  {language === 'tr' ? 'Ekran Görüntüsü' : 'Screenshot'}
                </h3>
                <div style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  backgroundColor: '#16161a',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                }}>
                  <img 
                    src={app.screenshot_url} 
                    alt={`${app.title} Ekran Görüntüsü`} 
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* SHARING TOOL PANEL (Reddit/Direct Link) */}
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{t('sharingTitle')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {t('sharingDesc')}
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button onClick={copyToClipboard} style={{ fontSize: '0.8rem' }}>
                {copied ? t('copiedLink') : t('copyLink')}
              </button>
              <button onClick={copyRedditPostText} style={{ fontSize: '0.8rem' }}>
                {copiedReddit ? t('copiedReddit') : t('copyReddit')}
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/AndroidClosedTesting/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                {t('shareReddit')} (r/AndroidClosedTesting)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/TestersCommunity/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                {t('shareReddit')} (r/TestersCommunity)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/AndroidAppTesters/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                {t('shareReddit')} (r/AndroidAppTesters)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/AndroidAppTester/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                {t('shareReddit')} (r/AndroidAppTester)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/betatests/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                {t('shareReddit')} (r/betatests)
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>{language === 'tr' ? 'Öneri:' : 'Tip:'}</strong> {t('sharingSuggestion')}
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="comments-container">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              {t('commentsCount', { count: comments.length })}
            </h3>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="comment-input-box">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('commentPlaceholder')}
                  required
                />
                <button type="submit" className="primary" style={{ fontSize: '0.8rem' }}>{t('commentSubmit')}</button>
              </form>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                {t('commentLoginRequired')}{' '}
                <button onClick={() => db.loginWithGoogle()} style={{ border: 'none', background: 'none', color: 'var(--accent-color)', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {t('commentLoginRequiredBtn')}
                </button>
                .
              </div>
            )}

            {/* Comments List */}
            {rootComments.length > 0 ? (
              <div className="comment-list">
                {rootComments.map((comment) => {
                  const replies = getReplies(comment.id);
                  return (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user_name}</span>
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                      
                      {/* Actions */}
                      <div className="comment-actions">
                        {user && (
                          <button
                            className="comment-btn"
                            onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                          >
                            {t('replyBtn')}
                          </button>
                        )}
                      </div>

                      {/* Reply Input Box */}
                      {replyToId === comment.id && user && (
                        <form onSubmit={(e) => handleAddReply(e, comment.id)} className="reply-input-box">
                          <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder={t('replyPlaceholder', { name: comment.user_name })}
                            required
                            style={{ minHeight: '60px', padding: '0.5rem', fontSize: '0.85rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>{t('commentSubmit')}</button>
                            <button type="button" onClick={() => setReplyToId(null)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>{t('replyCancel')}</button>
                          </div>
                        </form>
                      )}

                      {/* Nested Replies */}
                      {replies.length > 0 && (
                        <div className="reply-list">
                          {replies.map((reply) => (
                            <div key={reply.id} className="reply-item">
                              <div className="comment-header">
                                <span className="comment-user">
                                  {reply.user_name} 
                                  {reply.user_id === app.owner_id && (
                                    <span style={{ color: 'var(--accent-color)', fontSize: '0.7rem', marginLeft: '0.4rem', border: '1px solid var(--accent-color)', padding: '0px 3px', borderRadius: '3px' }}>
                                      {language === 'tr' ? 'Geliştirici' : 'Developer'}
                                    </span>
                                  )}
                                </span>
                                <span>{formatDate(reply.created_at)}</span>
                              </div>
                              <div className="comment-content">{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                {language === 'tr' ? 'Henüz yorum yapılmamış. İlk yorumu siz yapın!' : 'No comments yet. Be the first to comment!'}
              </p>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
