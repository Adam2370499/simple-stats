import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Use the server client!

// 🛑 THIS LINE FIXES THE FROZEN DATA
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient(); // Await the client creation
    const { searchParams } = new URL(request.url);
    const website_id = searchParams.get('website_id');

    if (!website_id) {
      return NextResponse.json({ error: 'Missing website_id' }, { status: 400 });
    }

    // 1. Fetch ALL data for this website
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('url_path, referrer, device_type, created_at')
      .eq('website_id', website_id);

    if (error) throw error;

    // 2. Process Data in JavaScript
    const totalVisitors = pageViews.length;

    // Top Pages
    const pagesMap = pageViews.reduce((acc: any, view) => {
      acc[view.url_path] = (acc[view.url_path] || 0) + 1;
      return acc;
    }, {});
    const topPages = Object.entries(pagesMap)
      .map(([url_path, count]) => ({ url_path, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Referrers
    const referrersMap = pageViews.reduce((acc: any, view) => {
      const ref = view.referrer || 'Direct';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {});
    const topReferrers = Object.entries(referrersMap)
      .map(([referrer, count]) => ({ referrer, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device Usage
    const devicesMap = pageViews.reduce((acc: any, view) => {
      const device = view.device_type || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    const deviceUsage = Object.entries(devicesMap)
      .map(([device_type, count]) => ({ device_type, count: count as number }));

    // NEW: Last 7 Days Logic (Fixed for Timezones)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Count views where created_at string starts with this date
      // Note: This matches UTC dates. Ideally, we match user timezone, 
      // but for MVP this is consistent.
      const count = pageViews.filter(view => 
        view.created_at.startsWith(dateStr)
      ).length;

      last7Days.push({ date: dateStr, count });
    }

    return NextResponse.json({
      totalVisitors,
      topPages,
      topReferrers,
      deviceUsage,
      last7Days 
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}