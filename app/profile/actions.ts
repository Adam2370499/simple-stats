'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get('fullName') as string;

  // 1. Update the User's Metadata in Supabase Auth
  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: fullName,
    },
  });

  if (error) {
    console.error('Profile Update Error:', error);
    return redirect('/profile?message=Error updating profile');
  }

  // 2. Refresh the pages so the new name shows up immediately
  revalidatePath('/profile');
  revalidatePath('/'); // Updates the Dashboard "Hey [Name]" too
  
  return redirect('/profile?message=Profile updated successfully');
}

export async function addWebsite(formData: FormData) {
  const supabase = await createClient();
  const domain = formData.get('domain') as string;
  const name = formData.get('name') as string; // <--- Get Name

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/login');

  const { error } = await supabase
    .from('websites')
    .insert({
      domain: domain,
      name: name, // <--- Save Name
      user_id: user.id
    });

  if (error) {
    console.error('Error adding website:', error);
    return redirect('/profile?message=Error adding website');
  }

  revalidatePath('/profile');
  revalidatePath('/'); 
  return redirect('/profile?message=Website added successfully');
}

  export async function deleteWebsite(formData: FormData) {
    const supabase = await createClient();
    const websiteId = formData.get('websiteId') as string;
  
    // Security: Ensure the user actually OWNS this website before deleting
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/login');
  
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', websiteId)
      .eq('user_id', user.id); // <--- Crucial Security Check
  
    if (error) {
      return redirect('/profile?message=Error deleting website');
    }
  
    revalidatePath('/profile');
    revalidatePath('/'); 
    return redirect('/profile?message=Website deleted');
  }