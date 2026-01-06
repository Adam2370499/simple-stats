import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CHANGE THIS TO YOUR ACTUAL EMAIL ADDRESS
const MY_EMAIL = 'zayarhtoo237@gmail.com'; 

export async function POST() {
  try {
    // 1. Fetch the stats (Total Visitors)
    // In a real app, we would filter by date (e.g., last 7 days)
    const { count, error } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    const totalVisitors = count || 0;

    // 2. Send the Email
    const { data, error: emailError } = await resend.emails.send({
      from: 'SimpleStats <onboarding@resend.dev>',
      to: [MY_EMAIL],
      subject: 'Weekly Analytics Report 🚀',
      html: `
        <h1>Your Weekly Summary</h1>
        <p>Your website is growing!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px;">
            <h2 style="color: #4b5563; margin: 0;">Total Visitors</h2>
            <p style="font-size: 32px; font-weight: bold; color: #111827; margin: 10px 0;">
                ${totalVisitors}
            </p>
        </div>
        <p>Keep up the great work!</p>
      `,
    });

    if (emailError) throw emailError;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}