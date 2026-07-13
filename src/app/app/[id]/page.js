'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import { db } from '../../../lib/db';

export default function AppDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [app, setApp] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedReddit, setCopiedReddit] = useState(false);

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
    if (confirm('Uygulamanızın 14 günlük test süreci başarıyla tamamlandı ve Google Play\'de yayınlandı olarak işaretlemek istiyor musunuz?')) {
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
    const siteUrl = typeof window !== 'undefined' ? window.location.href : `https://closedtest.vercel.app/app/${app.id}`;
    return `[Google Play Closed Testing] Need testers for my app: ${app.title} (${app.category})

Hi everyone! I need 12 testers for my app to pass the mandatory 14-day closed testing period on Google Play.

* App Name: ${app.title}
* Category: ${app.category}
* Description: ${app.description}

You can join my Google Group and download the app directly from the Closed Test platform:
${siteUrl}

Thank you so much! Post yours below and I will test back.`;
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
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>
        </div>
      </>
    );
  }

  if (!app) {
    return (
      <>
        <Header />
        <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <h2>Uygulama Bulunamadı</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Aradığınız test talebi mevcut değil veya silinmiş.</p>
          <button onClick={() => router.push('/')} style={{ marginTop: '1.5rem' }}>Ana Sayfaya Dön</button>
        </div>
      </>
    );
  }

  // Separate parent comments and replies
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <>
      <Header />
      <main className="container">
        <div className="app-detail">
          
          {/* Back button */}
          <div>
            <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ← Tüm Uygulamalara Dön
            </Link>
          </div>

          {/* Header section */}
          <div className="detail-header">
            <div className="detail-logo" style={{ borderColor: app.status === 'published' ? '#10b981' : 'var(--border-color)' }}>
              {app.logo_letter}
            </div>
            <div className="detail-meta-info">
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '600', textTransform: 'uppercase' }}>
                {app.category}
              </span>
              <h1 className="detail-title">{app.title}</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ekleyen: <strong>{app.owner_name}</strong> • {formatDate(app.created_at)}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="detail-stats">
            <div className="stat-item">
              <span className="stat-val">{app.click_count || 0}</span>
              <span className="stat-label">Görüntülenme</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{app.group_join_count || 0}</span>
              <span className="stat-label">Grup Katılım Tıklaması</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">{app.download_count || 0}</span>
              <span className="stat-label">İndirme Tıklaması</span>
            </div>
            <div className="stat-item">
              <span className="stat-val" style={{ color: app.status === 'published' ? '#10b981' : '#f59e0b' }}>
                {app.status === 'published' ? 'Yayınlandı' : 'Test Ediliyor'}
              </span>
              <span className="stat-label">Durum</span>
            </div>
          </div>

          {/* Creator panel (Owner Actions) */}
          {user && app.owner_id === user.id && (
            <div className="alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <div>
                <strong>Geliştirici Paneli:</strong> Bu uygulamanın yöneticisisiniz. Test süreci bitti mi?
              </div>
              {app.status === 'testing' ? (
                <button className="primary" onClick={handleMarkPublished} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  ✓ Test Bitti, Yayınlandı İşaretle
                </button>
              ) : (
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.85rem' }}>✓ Yayınlandı olarak işaretlendi</span>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Uygulama Açıklaması
            </h3>
            <p className="detail-desc">{app.description}</p>
          </div>

          {/* Testing Flow Guide / Links */}
          {app.status === 'testing' ? (
            <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-color)' }}>
                Test Sürecine Katılın (2 Adım)
              </h3>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Google Play kuralları gereği, indirme bağlantısının aktif olması için öncelikle test grubuna üye olmalısınız.
              </p>

              <div className="detail-links">
                <button onClick={handleGroupClick} className="primary" style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
                  1. Google Grubuna Katıl
                </button>
                <button onClick={handleDownloadClick} style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
                  2. Google Play'den İndir
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#10b981' }}>
                Bu Uygulamanın Test Süreci Başarıyla Tamamlandı!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Destek olan tüm gönüllü test kullanıcılarına teşekkür ederiz.
              </p>
            </div>
          )}

          {/* SHARING TOOL PANEL (Reddit/Direct Link) */}
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Paylaşım & Tanıtım Aracı</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Uygulamanıza daha hızlı test kullanıcısı bulabilmek için Reddit ve benzeri platformlarda tanıtım yapın.
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button onClick={copyToClipboard} style={{ fontSize: '0.8rem' }}>
                {copied ? '✓ Link Kopyalandı' : 'Sitenin Linkini Kopyala'}
              </button>
              <button onClick={copyRedditPostText} style={{ fontSize: '0.8rem' }}>
                {copiedReddit ? '✓ Reddit Taslağı Kopyalandı' : 'Reddit İçin Taslak Kopyala'}
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/AndroidClosedTesting/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                Reddit'te Paylaş (r/AndroidClosedTesting)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/TestersCommunity/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                Reddit'te Paylaş (r/TestersCommunity)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/AndroidAppTesters/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                Reddit'te Paylaş (r/AndroidAppTesters)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/AndroidAppTester/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                Reddit'te Paylaş (r/AndroidAppTester)
              </button>
              <button onClick={() => window.open(`https://www.reddit.com/r/betatests/submit?title=[Closed+Testing]+Need+testers+for+my+app:+${encodeURIComponent(app.title)}`, '_blank')} style={{ fontSize: '0.8rem', borderColor: '#ff4500' }}>
                Reddit'te Paylaş (r/betatests)
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Öneri:</strong> Kopyaladığınız Reddit taslağını doğrudan Reddit'teki kapalı test yardımlaşma topluluklarında paylaşarak kolayca tester çekebilirsiniz.
            </div>
          </div>

          {/* COMMENTS SECTION */}
          <div className="comments-container">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              Geri Bildirimler & Yorumlar ({comments.length})
            </h3>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleAddComment} className="comment-input-box">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Uygulama hakkında bir geri bildirim bırakın, bulduğunuz hataları yazın veya test grubuna katıldığınızı belirtin..."
                  required
                />
                <button type="submit" className="primary" style={{ fontSize: '0.8rem' }}>Gönder</button>
              </form>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                Yorum yapabilmek veya hataları bildirebilmek için <button onClick={() => db.loginWithGoogle()} style={{ border: 'none', background: 'none', color: 'var(--accent-color)', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem' }}>Google ile Giriş Yapmalısınız</button>.
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
                            Cevapla
                          </button>
                        )}
                      </div>

                      {/* Reply Input Box */}
                      {replyToId === comment.id && user && (
                        <form onSubmit={(e) => handleAddReply(e, comment.id)} className="reply-input-box">
                          <textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder={`${comment.user_name} adlı kullanıcıya cevap ver...`}
                            required
                            style={{ minHeight: '60px', padding: '0.5rem', fontSize: '0.85rem' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className="primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Gönder</button>
                            <button type="button" onClick={() => setReplyToId(null)} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Vazgeç</button>
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
                                    <span style={{ color: 'var(--accent-color)', fontSize: '0.7rem', marginLeft: '0.4rem', border: '1px solid var(--accent-color)', padding: '0px 3px', borderRadius: '3px' }}>Geliştirici</span>
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
                Henüz yorum yapılmamış. İlk yorumu siz yapın!
              </p>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
