import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase (Use specific keys for the API route)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Must use Service Role to bypass RLS
);

// 1. Handle "OPTIONS" request (The Browser's "Knock Knock" check)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-website-id',
    },
  });
}

// 2. Handle "POST" request (The actual data)
export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-website-id',
  };

  try {
    const body = await request.json();
    const { website_id, url, referrer, device, user_agent } = body;

    // Validate
    if (!website_id || !url) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400, headers });
    }

    // Insert into Supabase
    const { error } = await supabase.from('page_views').insert({
      website_id,
      url_path: url,
      referrer: referrer || 'Direct',
      device_type: device || 'Desktop',
      user_agent: user_agent,
    });

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500, headers });
    }

    return NextResponse.json({ success: true }, { headers });

  } catch (error) {
    console.error('Track Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers });
  }
}