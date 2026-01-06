import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { updateProfile, addWebsite, deleteWebsite } from './actions'; // Added deleteWebsite
import { User, Globe, Trash2, AlertCircle, CheckCircle } from 'lucide-react'; // Added icons

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const supabase = await createClient();

  // 1. Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // 2. Fetch their websites with a view count (limit to 1 just to see if ANY exist)
  const { data: websites } = await supabase
    .from('websites')
    .select('*, page_views(count)')
    .eq('user_id', user.id);

  // 3. Get current name (or fall back to email if empty)
  const currentName = user.user_metadata?.display_name || '';
  const currentEmail = user.email || '';

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* Success/Error Message */}
        {searchParams.message && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
            {searchParams.message}
          </div>
        )}

        {/* SECTION 1: Personal Details (Editable) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
          </div>
          
          <div className="p-6">
            <form action={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="fullName"
                  defaultValue={currentName}
                  placeholder="e.g. Zayar"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">This name will appear on your dashboard.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={currentEmail}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 2: My Websites */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Globe className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">My Websites</h2>
            </div>
          </div>
          
          <div className="p-6">
            {/* Add Website Form */}
            <form action={addWebsite} className="mb-8 flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Add New Domain</label>
                    <input
                        name="domain"
                        placeholder="e.g. my-shop.com"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    + Add
                </button>
            </form>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Property List</h3>
              
              {websites && websites.length > 0 ? (
                <div className="grid gap-3">
                  {websites.map((site) => (
                    <div key={site.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between bg-gray-50/50 group hover:border-gray-300 transition-all">
                      
                      {/* Left: Info */}
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="font-medium text-gray-900">{site.domain}</p>
                           {/* Simple Badge - In a real app, we would check DB for >0 views */}
                           {site.page_views[0]?.count > 0 ? (
  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 flex items-center gap-1">
    <CheckCircle className="w-3 h-3" /> Active
  </span>
) : (
  <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" /> Pending Data
  </span>
)}
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1 select-all" title="Click to copy ID">
                          ID: {site.id}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3">
                        <form action={deleteWebsite}>
                            <input type="hidden" name="websiteId" value={site.id} />
                            <button 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Website"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>No websites tracked yet.</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg flex gap-3 items-start">
               <AlertCircle className="w-5 h-5 shrink-0" />
               <p>
                 <strong>Verification Note:</strong> Adding a domain here does not automatically track it. 
                 You must copy the <strong>Script</strong> from the Dashboard and paste it into the 
                 <code>&lt;head&gt;</code> of your website to verify ownership and start receiving data.
               </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}