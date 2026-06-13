"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Sparkles, Crosshair, Users, BookOpen, Rocket, Play, Activity, Mail, Megaphone, Filter, Search, ExternalLink, AtSign, Globe, Tag, Send, LayoutDashboard, Code } from "lucide-react";
import { GtmAgentResponse, LiveLead } from "@/lib/schema";

const TERMINAL_LOGS = [
  "Initializing AutoVibe Autonomous Agent...",
  "Loading cognitive models and extraction rules...",
  "Connecting to Serper.dev API...",
  "Generating targeted search operators based on semantic intent...",
  "Executing deep-web queries for organic discussions...",
  "Discovered highly relevant community threads.",
  "Invoking Firecrawl to scrape raw markdown context...",
  "Sanitizing data payloads and enforcing token limits...",
  "Injecting context into structured synthesis engine...",
  "Analyzing demographic profile and core pain points...",
  "Extracting localized vernacular and slang...",
  "Evaluating vibe alignment based on emotional parameters...",
  "Composing strategic Launch Assets and landing page hooks...",
  "Validating JSON schema contract...",
  "Formatting Email Campaigns and Lead Generation sequences...",
  "Finalizing response payload..."
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<GtmAgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<LiveLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  
  // Execution Agent States
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [deployingEmail, setDeployingEmail] = useState(false);
  const [deployingSocial, setDeployingSocial] = useState(false);
  const [emailDeployed, setEmailDeployed] = useState(false);
  const [socialDeployed, setSocialDeployed] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setResult(null);
    setLeads([]);
    setError(null);
    setCampaignId(null);
    setEmailDeployed(false);
    setSocialDeployed(false);
    setLogs(["[SYSTEM] Run initiated."]);

    // Simulate terminal logs while waiting
    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < TERMINAL_LOGS.length) {
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,8)}] ${TERMINAL_LOGS[currentLogIndex]}`]);
        currentLogIndex++;
      }
    }, 1200);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });

      if (!res.ok) {
        throw new Error("Failed to generate strategy");
      }

      const data = await res.json() as GtmAgentResponse;
      setResult(data);
      setLogs(prev => [...prev, `[SYSTEM] Execution completed successfully. Initiating live lead hunt...`]);
      
      // Trigger Lead Sourcing in Background
      fetchLeads(data, idea);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLogs(prev => [...prev, `[ERROR] Execution failed: ${err.message}`]);
    } finally {
      clearInterval(logInterval);
      setLoading(false);
    }
  };

  const fetchLeads = async (strategy: GtmAgentResponse, currentIdea: string) => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: currentIdea,
          demographic_profile: strategy.audience_intel.demographic_profile,
          core_pain_points: strategy.audience_intel.core_pain_points
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.leads && data.leads.length > 0) {
          setLeads(data.leads);
          // Automatically save campaign once leads are found
          saveCampaign(strategy, currentIdea, data.leads);
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const saveCampaign = async (strategy: GtmAgentResponse, currentIdea: string, scrapedLeads: LiveLead[]) => {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: currentIdea, strategy, leads: scrapedLeads })
      });
      if (res.ok) {
        const { campaignId: id } = await res.json();
        setCampaignId(id);
        setLogs(prev => [...prev, `[SYSTEM] Campaign saved to execution database. ID: ${id}`]);
      }
    } catch (e) {
      console.error("Failed to save campaign", e);
    }
  };

  const deployEmail = async () => {
    if (!campaignId || !result) return;
    setDeployingEmail(true);
    try {
      await fetch("/api/deploy/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          subject: result.launch_assets.email_campaign.subject_line,
          htmlBody: result.launch_assets.email_campaign.body_copy
        })
      });
      setEmailDeployed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDeployingEmail(false);
    }
  };

  const deploySocial = async () => {
    if (!campaignId || !result) return;
    setDeployingSocial(true);
    try {
      await fetch("/api/deploy/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          tweetContent: result.launch_assets.distribution_hack
        })
      });
      setSocialDeployed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDeployingSocial(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Agent V4 Active
          </div>
          <a href="/campaigns" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 hover:bg-blue-500/20 transition-colors">
            <LayoutDashboard className="w-3 h-3" />
            Dashboard
          </a>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          AutoVibe <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Execution Agent</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Generate a full GTM strategy, find real leads, and deploy campaigns automatically.
        </p>
      </header>

      {/* Input Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={loading}
            placeholder="e.g. A tool to help indie developers track database metrics..."
            className="w-full p-5 pl-6 pr-16 text-lg bg-white/5 backdrop-blur-md border border-white/20 rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all placeholder-white/40 text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !idea.trim()}
            className="absolute right-3 top-3 bottom-3 bg-white/10 hover:bg-white/20 text-white px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
          </button>
        </form>
      </motion.section>

      {/* Terminal & Results State */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.section
            key="terminal"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Agent Execution Terminal</span>
              </div>
              <div 
                ref={terminalRef}
                className="p-4 h-64 overflow-y-auto font-mono text-sm text-green-400/90 space-y-2"
              >
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                  >
                    {log}
                  </motion.div>
                ))}
                <div className="animate-pulse">_</div>
              </div>
            </div>
          </motion.section>
        )}

        {result && !loading && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Intelligence Audit Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors" />
              
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <Crosshair className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Intelligence Audit</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Demographic Profile
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{result.audience_intel.demographic_profile}</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Core Pain Points</h3>
                  <ul className="space-y-2">
                    {result.audience_intel.core_pain_points.map((point, i) => (
                      <li key={i} className="text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Vernacular & Slang
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.audience_intel.vernacular_and_slang.map((word, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sources Meta */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500">
                    Based on queries: <span className="font-mono text-gray-400">{result.meta.processed_queries.join(', ')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Creative Deliverables Hub */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors" />

              <div className="flex items-center gap-3 pb-4 border-b border-white/10 justify-between">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Creative Deliverables</h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 font-medium">
                  {result.strategy.detected_vibe}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Strategic Reasoning</h3>
                  <p className="text-gray-300 italic">"{result.strategy.vibe_reasoning}"</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3">Landing Page Copy</h3>
                  <h4 className="text-xl font-bold text-white mb-2">{result.launch_assets.landing_page.hero_headline}</h4>
                  <p className="text-gray-400">{result.launch_assets.landing_page.sub_headline}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Video Ad Script</h3>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-sm text-gray-300 whitespace-pre-wrap font-mono">
                      {result.launch_assets.creative_execution.video_ad_script}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Visual Art Direction (Midjourney)</h3>
                    <p className="text-sm text-gray-400">{result.launch_assets.creative_execution.visual_art_direction}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xs uppercase tracking-wider text-green-400 font-semibold mb-2">Growth Hack</h3>
                    <p className="text-gray-300 bg-green-500/10 p-3 rounded-lg border border-green-500/20">{result.launch_assets.distribution_hack}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Campaign Engine */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-green-500/5 rounded-full blur-3xl -z-10 group-hover:bg-green-500/10 transition-colors" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Email Outreach Engine</h2>
                </div>
                {campaignId && leads.length > 0 && (
                  <button
                    onClick={deployEmail}
                    disabled={deployingEmail || emailDeployed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      emailDeployed 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                    }`}
                  >
                    {emailDeployed ? 'Deployed!' : deployingEmail ? 'Sending...' : 'Deploy to Leads'}
                    {!emailDeployed && !deployingEmail && <Send className="w-3 h-3" />}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">Subject: {result.launch_assets.email_campaign.subject_line}</span>
                  </div>
                  <div className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-sans">
                    {result.launch_assets.email_campaign.body_copy}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Call to Action
                  </h3>
                  <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg border border-white/10">
                    {result.launch_assets.email_campaign.call_to_action}
                  </p>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Follow-Up Strategy</h3>
                  <p className="text-sm text-gray-400 italic">"{result.launch_assets.email_campaign.follow_up_angle}"</p>
                </div>
              </div>
            </div>

            {/* Lead Generation Funnel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-orange-500/5 rounded-full blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Filter className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Lead Gen Funnel</h2>
                </div>
                {campaignId && (
                  <button
                    onClick={deploySocial}
                    disabled={deployingSocial || socialDeployed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                      socialDeployed 
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                        : 'bg-orange-500 hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                    }`}
                  >
                    {socialDeployed ? 'Posted to X!' : deployingSocial ? 'Posting...' : 'Post Hack to X'}
                    {!socialDeployed && !deployingSocial && <Rocket className="w-3 h-3" />}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> Primary Channel
                  </h3>
                  <span className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 font-medium inline-block">
                    {result.launch_assets.lead_generation.primary_channel}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-2">The Lead Magnet</h3>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-sm text-gray-300 shadow-inner">
                    {result.launch_assets.lead_generation.lead_magnet_idea}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">First-Touch Hook</h3>
                  <p className="text-gray-300 font-mono text-sm pl-4 border-l-2 border-orange-500/50">
                    "{result.launch_assets.lead_generation.outreach_hook}"
                  </p>
                </div>
              </div>
            </div>

            {/* SEO & Content Strategy */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden group lg:col-span-2">
              <div className="absolute top-0 left-0 p-32 bg-cyan-500/5 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/10 transition-colors" />

              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">SEO & Content Strategy</h2>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Website SEO */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" /> Website Meta Tags
                  </h3>
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Title Tag</span>
                    <p className="text-cyan-400 text-sm font-medium bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                      {result.launch_assets.seo_optimization.website_meta_title}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Meta Description</span>
                    <p className="text-gray-300 text-sm bg-white/5 border border-white/10 rounded-lg p-3">
                      {result.launch_assets.seo_optimization.website_meta_description}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Primary Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {result.launch_assets.seo_optimization.primary_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs text-gray-300 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-cyan-500/70" /> {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* GTM Injection Block */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <Code className="w-4 h-4 text-purple-400" /> GTM & GA4 Injection Script
                </h3>
                <p className="text-xs text-gray-400 mb-2">Paste this exact code into the `&lt;head&gt;` of your landing page to track the success of this campaign via Google Tag Manager and GA4.</p>
                <pre className="bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto text-xs text-purple-300 font-mono">
{`<!-- Google Tag Manager / AutoVibe Campaign Tracking -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->

<!-- AutoVibe Campaign DataLayer Inject -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': 'campaign_landed',
    'campaign_id': '${campaignId || 'generating...'}',
    'primary_keyword': '${result.launch_assets.seo_optimization.primary_keywords[0] || ''}'
  });
</script>`}
                </pre>
              </div>
            </div>

            {/* Live Lead Hunt Results */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden group lg:col-span-2">
              <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 rounded-full blur-3xl -z-10 group-hover:bg-yellow-500/10 transition-colors" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Search className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-bold text-white">Live Automated Lead Sourcing</h2>
                </div>
                {loadingLeads ? (
                  <span className="flex items-center gap-2 text-xs text-yellow-400 font-mono">
                    <Activity className="w-4 h-4 animate-spin" /> Scraping Web...
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-mono">{leads.length} Leads Found</span>
                )}
              </div>

              {loadingLeads && leads.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <Activity className="w-8 h-8 animate-spin text-yellow-500/50" />
                  <p className="text-sm font-mono">Executing Google Dorks and scanning social forums...</p>
                </div>
              )}

              {leads.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead, i) => (
                    <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:border-yellow-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{lead.source}</span>
                        {lead.type === 'email' ? <AtSign className="w-4 h-4 text-green-400" /> : <Users className="w-4 h-4 text-blue-400" />}
                      </div>
                      
                      {lead.type === 'email' && lead.contact && (
                        <div className="text-sm font-mono text-white bg-white/5 p-2 rounded truncate">
                          {lead.contact}
                        </div>
                      )}
                      
                      {lead.snippet && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                          "...{lead.snippet.replace(/<[^>]+>/g, '')}..."
                        </p>
                      )}

                      {lead.link && (
                        <a href={lead.link} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-medium">
                          View Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
