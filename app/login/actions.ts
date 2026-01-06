'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  // FIX: Added 'await' here because createClient is async
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  // FIX: Added 'await' here
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
    },
  });

  if (error) {
    console.error('Signup Error:', error);
    return redirect('/login?message=Could not authenticate user');
  }

  return redirect('/login?message=Check email to continue sign in process');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
}