import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing app ID' }, { status: 400 });
  }

  try {
    const app = await db.getApp(id);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // If it's already marked as published in our DB, no need to check
    if (app.status === 'published') {
      return NextResponse.json({ published: true, updated: false });
    }

    // Extract package name from Google Play URLs
    let packageId = null;
    const playUrl = app.play_store_url;
    if (playUrl) {
      try {
        if (playUrl.includes('id=')) {
          const urlObj = new URL(playUrl);
          packageId = urlObj.searchParams.get('id');
        } else if (playUrl.includes('/apps/testing/')) {
          const parts = playUrl.split('/apps/testing/');
          packageId = parts[1] ? parts[1].split('/')[0] : null;
        } else {
          // If it doesn't match standard URLs but is just the package name
          packageId = playUrl.trim();
        }
      } catch (e) {
        packageId = playUrl.trim();
      }
    }

    if (!packageId) {
      return NextResponse.json({ error: 'Could not extract package name' }, { status: 400 });
    }

    // Fetch the public Google Play Store page from server-side
    const googlePlayUrl = `https://play.google.com/store/apps/details?id=${packageId}`;
    const playRes = await fetch(googlePlayUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (playRes.status === 200) {
      // The app is live/published publicly on the Play Store!
      // Update our database status to 'published'
      await db.markAsPublished(id);
      return NextResponse.json({ published: true, updated: true });
    } else {
      // Still in testing (or returned 404/other error)
      return NextResponse.json({ published: false, status: playRes.status });
    }
  } catch (e) {
    console.error('Check published API error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}
