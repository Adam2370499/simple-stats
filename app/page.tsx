'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Smartphone, FileText, TrendingUp, Copy, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// Types
interface DashboardData {
  totalVisitors: number;
  topPages: { url_path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  deviceUsage: { device_type: string | null; count: number }[];
  last7Days: { date: string; count: number }[];
}

interface Website {
    id: string;
    domain: string;
    name: string;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  
  // Multi-Site State
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);

  useEffect(() => {
    const initDashboard = async () => {
      const supabase = createClient();
      
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
        setUserName(name);

        // 2. Get ALL Websites
        const { data: sites } = await supabase
          .from('websites')
          .select('id, domain, name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (sites && sites.length > 0) {
          setWebsites(sites);
          // Default to the first website
          setSelectedWebsiteId(sites[0].id);
        }
      }
      setLoading(false);
    };

    initDashboard();
  }, []);

// Fetch Data when Website Changes
useEffect(() => {
  if (!selectedWebsiteId) return;

  const fetchStats = async () => {
      try {
          // 1. Detect User's Timezone (e.g., "Asia/Singapore")
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          // 2. Send it to the API
          const response = await fetch(`/api/dashboard?website_id=${selectedWebsiteId}&timezone=${userTimezone}`);
          
          if (response.ok) {
              const jsonData = await response.json();
              setData(jsonData);
          }
      } catch (err) {
          console.error(err);
      }
  };

  fetchStats();
}, [selectedWebsiteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your stats...</p>
        </div>
      </div>
    );
  }

  // Handle No Websites
  if (websites.length === 0) {
    return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {userName}! 👋</h1>
              <p className="text-gray-600 mb-6">You don't have a website connected yet.</p>
              <a href="/profile" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  + Add Your First Website
              </a>
          </div>
        </div>
      );
  }

  if (!data) return <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">Loading data...</div>;

  // Format charts
  const deviceChartData = (data.deviceUsage || []).map((item, index) => ({
    name: item.device_type || 'Unknown', value: item.count,
  }));
  const chartData = (data.last7Days || []).map((item) => {
    const date = new Date(item.date);
    return { date: item.date, day: date.toLocaleDateString('en-US', { weekday: 'short' }), count: item.count };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Website Selector */}
        <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Hey {userName}! 👋</h1>
            
            {/* WEBSITE SELECTOR DROPDOWN */}
            <div className="relative inline-block">
                <select 
                    value={selectedWebsiteId || ''}
                    onChange={(e) => setSelectedWebsiteId(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                >
                    {websites.map(site => (
    <option key={site.id} value={site.id}>
        {site.name} ({site.domain})
    </option>
))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button
                onClick={() => {
                  // Uses the actual current website URL (whether localhost or vercel)
const script = `<script src="${window.location.origin}/tracker.js" data-website-id="${selectedWebsiteId}" async></script>`;
                  navigator.clipboard.writeText(script);
                  alert(`Script for ${websites.find(w => w.id === selectedWebsiteId)?.domain} copied!`);
                }}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Script
              </button>

             <button
                onClick={async () => {
                  alert('Sending report...');
                  await fetch(`/api/send-report?website_id=${selectedWebsiteId}`, { method: 'POST' }); // Pass ID
                  alert('Check your inbox!');
                }}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Send Report
              </button>
          </div>
        </div>
        
        {/* Charts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-xl"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
              <h2 className="text-lg font-semibold text-gray-900">Growth Trend</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorPurple)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-50 rounded-xl"><Users className="w-6 h-6 text-purple-600" /></div>
                <h2 className="text-lg font-semibold text-gray-900">Total Visitors</h2>
              </div>
              <div><span className="text-6xl font-bold text-gray-900 tracking-tight">{data.totalVisitors.toLocaleString()}</span><span className="ml-2 text-lg text-gray-400 font-medium">unique people</span></div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-cyan-50 rounded-xl"><Smartphone className="w-5 h-5 text-cyan-600" /></div>
                <h2 className="text-lg font-semibold text-gray-900">Devices</h2>
              </div>
              <div className="flex-1 min-h-[200px]">
                {deviceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deviceChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {deviceChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex items-center justify-center text-gray-400 text-sm">No device data yet</div>)}
              </div>
            </div>

            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
                <h2 className="text-lg font-semibold text-gray-900">Top Pages</h2>
              </div>
              {data.topPages.length > 0 ? (
                <div className="overflow-hidden">
                  <table className="min-w-full">
                    <thead><tr className="border-b border-gray-100"><th className="text-left py-3 text-sm font-medium text-gray-500">Page URL</th><th className="text-right py-3 text-sm font-medium text-gray-500">Views</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.topPages.map((page, index) => (
                        <tr key={index} className="group hover:bg-gray-50 transition-colors"><td className="py-4 text-gray-900 font-medium">{page.url_path}</td><td className="py-4 text-right text-gray-600">{page.count.toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (<p className="text-sm text-gray-500 text-center py-8">No page data yet</p>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}