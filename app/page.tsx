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
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userName, setUserName] = useState('User'); // Added missing state

  // 1. Fetch User, Websites & Restore Selection
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsInitializing(false);
        return; 
      }

      // Get user's name (optional, falls back to email part)
      if (user.email) setUserName(user.email.split('@')[0]);

      const { data: sites } = await supabase
        .from('websites')
        .select('id, domain, name')
        .eq('user_id', user.id);

      if (sites && sites.length > 0) {
        setWebsites(sites);

        // CHECK MEMORY
        const savedId = localStorage.getItem('last_selected_website');
        const targetSite = sites.find((s: any) => s.id === savedId);

        if (targetSite) {
          setSelectedWebsiteId(savedId);
        } else {
          setSelectedWebsiteId(sites[0].id);
        }
      }
      
      setIsInitializing(false);
    };

    init();
  }, []);

  // 2. Fetch Stats
  useEffect(() => {
    if (!selectedWebsiteId) return;

    const fetchStats = async () => {
       const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
       try {
         const res = await fetch(`/api/dashboard?website_id=${selectedWebsiteId}&timezone=${userTimezone}`);
         if (res.ok) {
            const jsonData = await res.json();
            setData(jsonData);
         }
       } catch (error) {
         console.error(error);
       }
    };

    fetchStats();
  }, [selectedWebsiteId]);

  // --- RENDER STATES ---

  // 1. Loading State (Prevent Glitch)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 2. No Websites State
  if (websites.length === 0) {
    return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome! 👋</h1>
              <p className="text-gray-600 mb-6">You don't have a website connected yet.</p>
              <a href="/profile" className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  + Add Your First Website
              </a>
          </div>
        </div>
      );
  }

  // 3. Loading Data State
  if (!data) {
     return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading stats...</p>
        </div>
      </div>
    );
  }

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
                onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedWebsiteId(newId);
                    localStorage.setItem('last_selected_website', newId);
                }}
                className="bg-transparent font-bold text-xl focus:outline-none cursor-pointer hover:text-gray-600 transition-colors pr-8 appearance-none"
                >
                {websites.map((site) => (
                    <option key={site.id} value={site.id}>
                    {site.name}
                    </option>
                ))}
            </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button
                onClick={() => {
                  const script = `<script src="${window.location.origin}/tracker.js" data-website-id="${selectedWebsiteId}" async></script>`;
                  navigator.clipboard.writeText(script);
                  alert(`Script copied!`);
                }}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Script
              </button>

             <button
                onClick={async () => {
                  alert('Sending report...');
                  await fetch(`/api/send-report?website_id=${selectedWebsiteId}`, { method: 'POST' });
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