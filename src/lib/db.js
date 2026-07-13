import { supabase } from './supabase';

// Helper to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ''
  );
};

// Local storage mock database key
const MOCK_STORAGE_KEY_APPS = 'closedtest_mock_apps';
const MOCK_STORAGE_KEY_COMMENTS = 'closedtest_mock_comments';
const MOCK_STORAGE_KEY_USER = 'closedtest_mock_user';

// Mock initial data if storage is empty
const INITIAL_MOCK_APPS = [
  {
    id: 'mock-app-1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    owner_id: 'mock-user-1',
    owner_name: 'Ahmet Yılmaz',
    title: 'Focus Pomodoro',
    description: 'Verimliliğinizi artıracak, minimalist tasarımlı odaklanma ve Pomodoro sayacı uygulaması. Görev yönetimi ve istatistik desteği mevcuttur.',
    category: '🛠️ Araçlar & Verimlilik',
    google_group_url: 'https://groups.google.com/g/focus-pomodoro-testing',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.focus.pomodoro',
    logo_letter: 'P',
    status: 'testing',
    click_count: 42,
    group_join_count: 18,
    download_count: 14
  },
  {
    id: 'mock-app-2',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    owner_id: 'mock-user-2',
    owner_name: 'Can Demir',
    title: 'Retro Pixel Runner',
    description: '8-bit retro grafiklere ve chiptune müziklere sahip, bağımlılık yapıcı sonsuz koşu oyunu. Arkadaşlarınızla skor yarışına girin.',
    category: '🎮 Oyun',
    google_group_url: 'https://groups.google.com/g/retro-pixel-runner',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.retro.pixel.runner',
    logo_letter: 'R',
    status: 'testing',
    click_count: 85,
    group_join_count: 24,
    download_count: 21
  },
  {
    id: 'mock-app-3',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    owner_id: 'mock-user-3',
    owner_name: 'Zeynep Kaya',
    title: 'Daily Budget Tracker',
    description: 'Günlük gelir ve giderlerinizi en sade şekilde takip edin. Grafikli raporlar ve Excel export desteği.',
    category: '🛠️ Araçlar & Verimlilik',
    google_group_url: 'https://groups.google.com/g/daily-budget-tracker',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.daily.budget.tracker',
    logo_letter: 'B',
    status: 'published', // Completed 14-days testing successfully!
    click_count: 120,
    group_join_count: 32,
    download_count: 28
  }
];

const INITIAL_MOCK_COMMENTS = [
  {
    id: 'comment-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    app_id: 'mock-app-1',
    user_id: 'tester-1',
    user_name: 'Mehmet A.',
    content: 'Gruba katıldım ve uygulamayı indirdim. Pomodoro sayacı bittiğinde ses çalması gerekirken bazen çalmıyor, kontrol edebilir misiniz?',
    parent_id: null
  },
  {
    id: 'reply-1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    app_id: 'mock-app-1',
    user_id: 'mock-user-1',
    user_name: 'Ahmet Yılmaz', // Owner
    content: 'Geri bildirim için teşekkürler Mehmet Bey. Arka planda çalışma izni verilmediğinde ses motoru uyku moduna geçiyor olabilir. Son güncellemede bunu düzelttim, güncelleyip tekrar bakabilir misiniz?',
    parent_id: 'comment-1'
  }
];

// Helper to initialize local storage data
const initMockData = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(MOCK_STORAGE_KEY_APPS)) {
      localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(INITIAL_MOCK_APPS));
    }
    if (!localStorage.getItem(MOCK_STORAGE_KEY_COMMENTS)) {
      localStorage.setItem(MOCK_STORAGE_KEY_COMMENTS, JSON.stringify(INITIAL_MOCK_COMMENTS));
    }
  }
};

export const db = {
  // --- AUTH METHODS ---
  async getCurrentUser() {
    if (isSupabaseConfigured()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            isMock: false
          };
        }
      } catch (e) {
        console.error('Supabase auth error, falling back to mock auth:', e);
      }
    }

    // Mock Auth Fallback
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem(MOCK_STORAGE_KEY_USER);
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  },

  async loginWithGoogle() {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
          }
        });
        if (!error) return;
      } catch (e) {
        console.error('Supabase Google Auth failed, logging in with mock user:', e);
      }
    }

    // Mock Auth Login
    if (typeof window !== 'undefined') {
      const mockUser = {
        id: 'mock-current-user',
        email: 'developer@closedtest.dev',
        name: 'Geliştirici Dostu',
        isMock: true
      };
      localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(mockUser));
      window.location.reload();
    }
  },

  async logout() {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase sign out error:', e);
      }
    }

    // Mock Auth Logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MOCK_STORAGE_KEY_USER);
      window.location.reload();
    }
  },

  // --- APP METHODS ---
  async getApps() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error) return data;
      } catch (e) {
        console.error('Supabase getApps error, fetching from mock data:', e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const apps = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_APPS) || '[]');
      return apps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return [];
  },

  async getApp(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('id', id)
          .single();
        if (!error) return data;
      } catch (e) {
        console.error(`Supabase getApp ${id} error, fetching from mock data:`, e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const apps = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_APPS) || '[]');
      return apps.find(app => app.id === id) || null;
    }
    return null;
  },

  async addApp(appData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Uygulama eklemek için giriş yapmalısınız.');

    const newApp = {
      title: appData.title,
      description: appData.description,
      category: appData.category,
      google_group_url: appData.google_group_url,
      play_store_url: appData.play_store_url,
      logo_letter: appData.title.trim().charAt(0).toUpperCase()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('apps')
          .insert([{
            ...newApp,
            owner_id: user.id,
            owner_name: user.name
          }])
          .select()
          .single();
        if (!error) return data;
      } catch (e) {
        console.error('Supabase addApp error, saving to mock data:', e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const apps = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_APPS) || '[]');
      const createdApp = {
        ...newApp,
        id: 'app-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        owner_id: user.id,
        owner_name: user.name,
        status: 'testing',
        click_count: 0,
        group_join_count: 0,
        download_count: 0
      };
      apps.push(createdApp);
      localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(apps));
      return createdApp;
    }
  },

  async markAsPublished(id) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('apps')
          .update({ status: 'published' })
          .eq('id', id)
          .select()
          .single();
        if (!error) return data;
      } catch (e) {
        console.error(`Supabase markAsPublished error:`, e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const apps = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_APPS) || '[]');
      const index = apps.findIndex(app => app.id === id);
      if (index !== -1) {
        apps[index].status = 'published';
        localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(apps));
        return apps[index];
      }
    }
    return null;
  },

  async incrementCount(id, field) {
    // fields: 'click_count', 'group_join_count', 'download_count'
    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('increment_app_count', { app_id: id, field_name: field });
      } catch (e) {
        console.error(`Supabase incrementCount error:`, e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const apps = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_APPS) || '[]');
      const index = apps.findIndex(app => app.id === id);
      if (index !== -1) {
        apps[index][field] = (apps[index][field] || 0) + 1;
        localStorage.setItem(MOCK_STORAGE_KEY_APPS, JSON.stringify(apps));
        return apps[index];
      }
    }
    return null;
  },

  // --- COMMENT METHODS ---
  async getComments(appId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('app_id', appId)
          .order('created_at', { ascending: true });
        if (!error) return data;
      } catch (e) {
        console.error(`Supabase getComments ${appId} error, fetching from mock data:`, e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const comments = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_COMMENTS) || '[]');
      return comments.filter(c => c.app_id === appId);
    }
    return [];
  },

  async addComment(appId, content, parentId = null) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Yorum yazmak için giriş yapmalısınız.');

    const newComment = {
      app_id: appId,
      content,
      parent_id: parentId,
      user_name: user.name
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert([{
            ...newComment,
            user_id: user.id
          }])
          .select()
          .single();
        if (!error) return data;
      } catch (e) {
        console.error('Supabase addComment error:', e);
      }
    }

    // Mock Fallback
    initMockData();
    if (typeof window !== 'undefined') {
      const comments = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY_COMMENTS) || '[]');
      const createdComment = {
        ...newComment,
        id: 'comment-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        user_id: user.id
      };
      comments.push(createdComment);
      localStorage.setItem(MOCK_STORAGE_KEY_COMMENTS, JSON.stringify(comments));
      return createdComment;
    }
  }
};
