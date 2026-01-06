import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const website_id = searchParams.get('website_id');
    // Get the timezone sent by the frontend (or default to UTC)
    const timezone = searchParams.get('timezone') || 'UTC';

    if (!website_id) {
      return NextResponse.json({ error: 'Missing website_id' }, { status: 400 });
    }

    // 1. Fetch ALL data
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('url_path, referrer, device_type, created_at')
      .eq('website_id', website_id);

    if (error) throw error;

    // 2. Process Standard Stats
    const totalVisitors = pageViews.length;

    // Top Pages
    const pagesMap = pageViews.reduce((acc: any, view) => {
      acc[view.url_path] = (acc[view.url_path] || 0) + 1;
      return acc;
    }, {});
    const topPages = Object.entries(pagesMap)
      .map(([url_path, count]) => ({ url_path, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Top Referrers
    const referrersMap = pageViews.reduce((acc: any, view) => {
      const ref = view.referrer || 'Direct';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {});
    const topReferrers = Object.entries(referrersMap)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Device Usage
    const devicesMap = pageViews.reduce((acc: any, view) => {
      const device = view.device_type || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    const deviceUsage = Object.entries(devicesMap)
      .map(([device_type, count]) => ({ device_type, count }));

    // 3. DYNAMIC TIMEZONE "Last 7 Days" Logic
    
    // Helper: Convert any date to "YYYY-MM-DD" in the USER'S timezone
    const getDateStringInZone = (dateObj: Date, zone: string) => {
       return dateObj.toLocaleDateString('en-CA', { timeZone: zone }); // en-CA gives YYYY-MM-DD format
    };

    const last7Days = [];
    const now = new Date();

    // Loop backwards 7 days
    for (let i = 6; i >= 0; i--) {
      // Calculate "Target Day" based on current time
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      
      // Get the string for this day in the user's timezone (e.g., "2023-10-25")
      const dayLabel = getDateStringInZone(d, timezone);
      
      // Filter views that match this specific local date
      const count = pageViews.filter(view => {
        const viewDate = new Date(view.created_at);
        const viewLocalLabel = getDateStringInZone(viewDate, timezone);
        return viewLocalLabel === dayLabel;
      }).length;

      last7Days.push({ date: dayLabel, count });
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