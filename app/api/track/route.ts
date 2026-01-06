import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, referrer, device, website_id } = body;

    if (!url || !website_id) {
      return NextResponse.json(
        { error: 'Missing required fields: url and website_id' },
        { status: 400 }
      );
    }

    // Extract path from full URL
    const urlPath = new URL(url).pathname;

    // Insert into page_views table
    const { error } = await supabase.from('page_views').insert({
      website_id,
      url_path: urlPath,
      referrer: referrer || null,
      device_type: device || null,
      browser: null, // Can be extracted from User-Agent header if needed
      country: null, // Can be extracted from request headers if needed
    });

    if (error) {
      console.error('Error inserting page view:', error);
      return NextResponse.json(
        { error: 'Failed to track page view' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

