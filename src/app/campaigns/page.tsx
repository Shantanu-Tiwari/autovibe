"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Activity, Users, Globe, Play, CheckCircle } from "lucide-react";
import Link from "next/link";

type Analytics = {
  activeUsers: string;
  pageViews: string;
  conversions: string;
  mock: boolean;
};

export default function CampaignsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Agent
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Execution <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-2">Monitor deployed campaigns and live GA4 tracking metrics.</p>
        </div>
      </header>

      {/* Analytics Overview */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Global GA4 Analytics
          </h2>
          {analytics?.mock && (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs rounded-full">
              Mock Data (No Credentials)
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Activity className="w-8 h-8 text-purple-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/30 border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Active Users</span>
              </div>
              <p className="text-4xl font-black text-white">{analytics?.activeUsers}</p>
              <p className="text-xs text-green-400 mt-2">+12% vs last week</p>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Page Views</span>
              </div>
              <p className="text-4xl font-black text-white">{analytics?.pageViews}</p>
              <p className="text-xs text-green-400 mt-2">+24% vs last week</p>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Conversions</span>
              </div>
              <p className="text-4xl font-black text-white">{analytics?.conversions}</p>
              <p className="text-xs text-green-400 mt-2">+5% vs last week</p>
            </div>
          </div>
        )}
      </section>

      {/* Campaigns List Placeholder */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Recent Campaigns</h2>
        <div className="text-center py-12 text-gray-500 bg-black/20 rounded-xl border border-white/5 border-dashed">
          <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>Database connected. Deploy a campaign from the home page to see it appear here.</p>
        </div>
      </section>
    </main>
  );
}
