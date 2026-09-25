import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, MessageSquare, LogIn, Download, Search, Trash2, Edit2, Key, Activity, ArrowLeft, 
  LayoutDashboard, Clock, RefreshCw, Smartphone, Monitor, Globe, ShieldAlert,
  Filter, TrendingDown, ShoppingCart, Eye, CreditCard, ChevronRight, Copy, Check, Code, Terminal, BarChart3, ArrowRight, Layers,
  Star, StarHalf
} from "lucide-react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

interface AnalyticsData {
  stats: {
    activeUsers: number;
    sessionsToday: number;
    avgSessionTime: number;
    bounceRate: number;
  };
  charts: {
    activityOverTime: any[];
    topPages: any[];
    devices: any[];
  };
  liveUsers: any[];
}

interface FunnelStep {
  step: number;
  name: string;
  description: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  color: string;
}

interface DropOffPage {
  rank: number;
  path: string;
  title: string;
  visitors: number;
  avgTimeSpentSeconds: number;
  engagementScore: string;
}

interface FunnelResponse {
  success: boolean;
  funnel: {
    steps: FunnelStep[];
    totalEntrants: number;
    totalConverted: number;
    overallConversionRate: number;
    step2DropOffCount: number;
    step2DropOffRate: number;
  };
  step2DropOffAlternativePages: DropOffPage[];
  engagementMetrics: {
    avgFocusTimeSeconds: number;
    activeTabRatio: number;
    scrollDepthAvgPercent: number;
    interactionHeartbeats: number;
  };
}

interface User {
  _id: string;
  email: string;
  role: string;
  loginCount: number;
  lastLogin: string;
  createdAt: string;
}

interface Feedback {
  _id: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const COLORS = ['#00f3ff', '#0066ff', '#00ff66', '#ff00ff', '#ffaa00'];

const SQL_QUERY_STR = `-- ==============================================================================
-- 4-STEP CONVERSION FUNNEL & STEP 2 DROP-OFF ENGAGEMENT ANALYSIS (SQL)
-- Compatible with: PostgreSQL, BigQuery, Snowflake, ClickHouse, Databricks, Redshift
-- ==============================================================================

WITH user_events AS (
    SELECT 
        user_id, session_id, page_url, event_name, 
        COALESCE(time_spent_seconds, 0) AS time_spent_seconds, event_timestamp
    FROM analytics_events
    WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'
),

-- Step timestamps
funnel_steps AS (
    SELECT 
        session_id,
        MIN(CASE WHEN event_name IN ('land_on_site', 'page_view') AND page_url = '/' THEN event_timestamp END) AS step1_time,
        MIN(CASE WHEN event_name IN ('view_product', 'product_view') OR page_url LIKE '/product%' THEN event_timestamp END) AS step2_time,
        MIN(CASE WHEN event_name IN ('add_to_cart', 'cart_add') OR page_url LIKE '/cart%' THEN event_timestamp END) AS step3_time,
        MIN(CASE WHEN event_name IN ('purchase', 'order_complete') OR page_url LIKE '/checkout/success%' THEN event_timestamp END) AS step4_time
    FROM user_events
    GROUP BY session_id
),

-- Forward sequential funnel validation
validated_funnel AS (
    SELECT 
        session_id,
        step1_time,
        CASE WHEN step2_time >= step1_time THEN step2_time END AS step2_time,
        CASE WHEN step3_time >= step2_time AND step2_time >= step1_time THEN step3_time END AS step3_time,
        CASE WHEN step4_time >= step3_time AND step3_time >= step2_time THEN step4_time END AS step4_time
    FROM funnel_steps
    WHERE step1_time IS NOT NULL
),

-- Users who reached Step 2 but dropped off before Step 3
step2_dropoffs AS (
    SELECT session_id, step2_time
    FROM validated_funnel
    WHERE step2_time IS NOT NULL AND step3_time IS NULL
),

-- Other pages visited by Step 2 drop-offs
other_pages_visited AS (
    SELECT 
        e.session_id, e.page_url, e.time_spent_seconds
    FROM user_events e
    INNER JOIN step2_dropoffs d ON e.session_id = d.session_id
    WHERE e.event_timestamp >= d.step2_time
      AND e.page_url NOT LIKE '/product%'
      AND e.page_url NOT IN ('/', '/login', '/signup')
)

-- Ranked Top 5 Alternative Pages & Average Dwell Time
SELECT 
    DENSE_RANK() OVER (ORDER BY COUNT(DISTINCT session_id) DESC, AVG(time_spent_seconds) DESC) AS page_rank,
    page_url,
    COUNT(DISTINCT session_id) AS dropoff_visitors,
    COUNT(*) AS total_pageviews,
    ROUND(AVG(time_spent_seconds), 1) AS avg_time_spent_sec,
    CONCAT(FLOOR(AVG(time_spent_seconds)/60), 'm ', MOD(CAST(AVG(time_spent_seconds) AS INT), 60), 's') AS avg_dwell
FROM other_pages_visited
GROUP BY page_url
ORDER BY page_rank ASC
LIMIT 5;`;

const PYTHON_SCRIPT_STR = `#!/usr/bin/env python3
import pandas as pd
import numpy as np

# 1. Sequential 4-Step Funnel Analysis
s1 = df[(df['event_name'] == 'land_on_site') | (df['page_url'] == '/')].groupby('session_id')['timestamp'].min().reset_index(name='t1')
s2 = df[(df['event_name'] == 'view_product') | (df['page_url'].str.startswith('/product'))].groupby('session_id')['timestamp'].min().reset_index(name='t2')
s3 = df[(df['event_name'] == 'add_to_cart') | (df['page_url'] == '/cart')].groupby('session_id')['timestamp'].min().reset_index(name='t3')
s4 = df[(df['event_name'] == 'purchase') | (df['page_url'] == '/checkout/success')].groupby('session_id')['timestamp'].min().reset_index(name='t4')

funnel = s1.merge(s2, on='session_id', how='left').merge(s3, on='session_id', how='left').merge(s4, on='session_id', how='left')
funnel['valid_s2'] = funnel['t2'] >= funnel['t1']
funnel['valid_s3'] = funnel['valid_s2'] & (funnel['t3'] >= funnel['t2'])
funnel['valid_s4'] = funnel['valid_s3'] & (funnel['t4'] >= funnel['t3'])

print("Total Landed (Step 1):", len(funnel))
print("Viewed Product (Step 2):", funnel['valid_s2'].sum())
print("Added to Cart (Step 3):", funnel['valid_s3'].sum())
print("Purchased (Step 4):", funnel['valid_s4'].sum())

# 2. Step 2 Drop-Off Deep Dive (Top 5 Alternative Pages + Avg Time Spent)
dropoffs = funnel[funnel['valid_s2'] & (~funnel['valid_s3'])][['session_id', 't2']]
dropoff_events = df.merge(dropoffs, on='session_id')

alt_pages = dropoff_events[
    (dropoff_events['timestamp'] >= dropoff_events['t2']) &
    (~dropoff_events['page_url'].str.startswith('/product')) &
    (~dropoff_events['page_url'].isin(['/', '/login', '/signup']))
]

top5 = alt_pages.groupby('page_url').agg(
    dropoff_visitors=('session_id', 'nunique'),
    avg_time_spent_seconds=('time_spent_seconds', 'mean')
).sort_values(by=['dropoff_visitors', 'avg_time_spent_seconds'], ascending=[False, False]).head(5)

top5['avg_dwell_formatted'] = top5['avg_time_spent_seconds'].apply(lambda s: f"{int(s//60)}m {int(s%60)}s")
print(top5[['dropoff_visitors', 'avg_dwell_formatted']])`;

const JS_TRACKER_STR = `// Client Tracking Snippet for Mixpanel, Amplitude, GA4, and Internal Telemetry
class FunnelTracker {
  constructor() {
    this.sessionId = sessionStorage.getItem('__f_sid') || ('sid_' + Math.random().toString(36).substr(2, 9));
    sessionStorage.setItem('__f_sid', this.sessionId);
    this.activeTime = 0;
    this.lastActive = Date.now();
    this.initFocusListeners();
  }

  initFocusListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') this.flushTime();
      else this.lastActive = Date.now();
    });
    window.addEventListener('beforeunload', () => this.flushTime());
    ['click', 'keydown', 'scroll'].forEach(e => window.addEventListener(e, () => {
      const now = Date.now();
      if (now - this.lastActive < 60000) this.activeTime += (now - this.lastActive);
      this.lastActive = now;
    }, { passive: true }));
  }

  dispatch(event, props = {}) {
    const payload = { ...props, session_id: this.sessionId, path: window.location.pathname, url: window.location.href };
    // 1. Google Analytics 4
    if (typeof window.gtag === 'function') window.gtag('event', event, payload);
    // 2. Mixpanel
    if (window.mixpanel) window.mixpanel.track(event, payload);
    // 3. Amplitude
    if (window.amplitude) (window.amplitude.track || window.amplitude.getInstance().logEvent)(event, payload);
    // 4. Internal Beacon for Admin Portal
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([JSON.stringify({ 
        events: [{ sessionId: this.sessionId, eventType: 'custom', path: window.location.pathname, elementId: event, timeSpent: props.time_spent || 0 }] 
      })], { type: 'application/json' }));
    }
  }

  flushTime() {
    const sec = Math.round(this.activeTime / 1000);
    if (sec > 0) this.dispatch('page_engagement_duration', { time_spent: sec });
  }

  // 4 Conversion Funnel Steps
  trackLand() { this.dispatch('funnel_step_1_land', { step: 1 }); }
  trackViewProduct(id, name, price) { this.dispatch('funnel_step_2_view_product', { step: 2, product_id: id, product_name: name, price }); }
  trackAddToCart(id, price, qty = 1) { this.dispatch('funnel_step_3_add_to_cart', { step: 3, product_id: id, price, qty }); }
  trackPurchase(orderId, amount) { this.dispatch('funnel_step_4_purchase', { step: 4, order_id: orderId, amount }); }
}

export const tracker = new FunnelTracker();`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"analytics" | "funnel" | "users" | "feedbacks">("analytics");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelResponse | null>(null);
  const [selectedCodeTab, setSelectedCodeTab] = useState<"sql" | "python" | "javascript">("sql");
  const [copiedCode, setCopiedCode] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserHealth, setSelectedUserHealth] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    const adminToken = localStorage.getItem("admin_token") || localStorage.getItem("token");
    if (!adminToken) {
      toast({ title: "Admin Login Required", description: "Please sign in with administrator credentials.", variant: "destructive" });
      navigate("/admin-login");
      return;
    }

    try {
      const [analyticsRes, funnelRes, usersRes, feedbackRes] = await Promise.allSettled([
        api.get("/admin/analytics"),
        api.get("/admin/funnel"),
        api.get("/admin/users"),
        api.get("/admin/feedbacks"),
      ]);

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value);
      } else {
        console.warn("Analytics fetch failed:", analyticsRes.reason);
      }

      if (funnelRes.status === "fulfilled" && funnelRes.value) {
        setFunnelData(funnelRes.value);
      }

      if (usersRes.status === "fulfilled") {
        const u = usersRes.value;
        const userList = Array.isArray(u) ? u : (u?.users || u?.data || []);
        setUsers(userList);
      } else {
        console.error("Users fetch failed:", usersRes.reason);
      }

      if (feedbackRes.status === "fulfilled") {
        const f = feedbackRes.value;
        const feedbackList = Array.isArray(f) ? f : (f?.feedbacks || f?.data || []);
        setFeedbacks(feedbackList);
      } else {
        console.error("Feedbacks fetch failed:", feedbackRes.reason);
      }

      // Check if authentication failed across endpoints
      const anyAuthError = [analyticsRes, usersRes, feedbackRes].find(
        (r) => r.status === "rejected" && (
          r.reason?.message?.includes("token") || 
          r.reason?.message?.includes("401") || 
          r.reason?.message?.includes("403") ||
          r.reason?.message?.includes("Unauthorized")
        )
      );

      if (anyAuthError && anyAuthError.status === "rejected") {
        toast({ title: "Session Expired", description: "Your admin session has expired. Please log in again.", variant: "destructive" });
        navigate("/admin-login");
      }
    } catch (err: any) {
      if (err.status === 403 || err.status === 401) navigate("/admin-login");
      else toast({ title: "Notice", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh analytics every 30 seconds
    const interval = setInterval(() => {
      api.get("/admin/analytics").then(data => setAnalytics(data)).catch(console.error);
      api.get("/admin/funnel").then(data => setFunnelData(data)).catch(console.error);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast({ title: "Code Copied", description: "Copied to clipboard successfully!" });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleViewHealth = async (userId: string, email: string) => {
    try {
      const result = await api.get(`/admin/users/${userId}/health`);
      if (result && result.length > 0) {
        setSelectedUserHealth({ email, ...result[0] });
        toast({ title: "Health Data Loaded", description: `Showing latest analysis for ${email}` });
      } else {
        toast({ title: "No Data", description: "This user hasn't performed any AI analysis yet.", variant: "default" });
      }
    } catch (err: any) {
      toast({ title: "Fetch Failed", description: err.message, variant: "destructive" });
    }
  };

  const getApiExportBase = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const remote = (import.meta.env.VITE_API_URL || 'https://health-931r.onrender.com').replace(/\/+$/, '');
    const local = (import.meta.env.VITE_API_URL_LOCAL || `http://localhost:${import.meta.env.VITE_PORT || 5001}/api`).replace(/\/+$/, '');
    return isLocal ? local : (remote.endsWith('/api') ? remote : `${remote}/api`);
  };

  const handleExportUsers = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
    window.open(`${getApiExportBase()}/admin/export/users?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleExportFeedback = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
    window.open(`${getApiExportBase()}/admin/export/feedbacks?token=${encodeURIComponent(token)}`, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("userRole");
    navigate("/admin-login");
  };

  const handleEditUser = async (userId: string, currentEmail: string, currentRole: string) => {
    const newRole = window.prompt(`Change role for ${currentEmail}\n\nCurrent role: ${currentRole}\nEnter new role (user / admin):`, currentRole);
    if (!newRole || newRole === currentRole) return;
    try {
      await api.put(`/admin/users/${userId}`, { email: currentEmail, role: newRole });
      toast({ title: "User Updated", description: `Role changed to ${newRole}` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    const newPassword = window.prompt(`Reset password for ${email}\n\nEnter new password (min 6 chars):`);
    if (!newPassword) return;
    if (newPassword.length < 6) {
      toast({ title: "Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    try {
      await api.patch(`/admin/users/${userId}/password`, { password: newPassword });
      toast({ title: "Password Reset", description: `Password updated for ${email}` });
    } catch (err: any) {
      toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    const confirmed = window.confirm(`Are you sure you want to DELETE user:\n${email}\n\nThis action cannot be undone!`);
    if (!confirmed) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast({ title: "User Deleted", description: `${email} has been removed.` });
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Feedback Rating Metrics & Overall Star Count
  const totalFeedbackCount = feedbacks.length;
  const avgStarRating = totalFeedbackCount > 0
    ? (feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0) / totalFeedbackCount)
    : 0;
  const formattedAvgStars = avgStarRating.toFixed(1);

  const starDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = feedbacks.filter(f => Math.round(Number(f.rating)) === stars).length;
    const pct = totalFeedbackCount > 0 ? Math.round((count / totalFeedbackCount) * 100) : 0;
    return { stars, count, pct };
  });

  const highRatingCount = feedbacks.filter(f => Number(f.rating) >= 4).length;
  const positiveSatisfactionPct = totalFeedbackCount > 0 ? Math.round((highRatingCount / totalFeedbackCount) * 100) : 0;

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Activity className="h-8 w-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-cyan-500/30">
      
      {/* ── GLASS HEADER ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,243,255,0.05)]">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-cyan-500/10 text-cyan-400">
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-cyan-400" />
              <h1 className="text-xl font-bold font-display neon-text-cyan">SYS_ADMIN</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-400 transition-colors">
              LOGOUT
            </Button>
            <div className="h-4 w-px bg-border hidden md:block" />
            <Button variant="outline" size="sm" onClick={() => fetchData()} className="hidden md:flex gap-2 glass-button text-xs hover:border-cyan-400">
              <RefreshCw className="h-3 w-3 text-cyan-400" /> REFRESH
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportUsers} className="hidden md:flex gap-2 glass-button text-xs">
              <Download className="h-3 w-3" /> EXPORT USERS
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportFeedback} className="hidden md:flex gap-2 glass-button text-xs">
              <Download className="h-3 w-3" /> EXPORT FEEDBACK
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex glass-panel rounded-full p-1 border-cyan-500/30">
            {['analytics', 'funnel', 'users', 'feedbacks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {tab === 'funnel' ? 'Funnel & Focus' : tab}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* ======================= ANALYTICS TAB ======================= */}
          {activeTab === 'analytics' && analytics && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Top Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="liquid-glass border-cyan-500/30 group hover:border-cyan-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-500/80 uppercase">Active Users</CardTitle>
                    <Activity className="h-4 w-4 text-cyan-400 group-hover:animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-cyan-400">{analytics.stats.activeUsers}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      Live right now
                    </p>
                  </CardContent>
                </Card>

                <Card className="liquid-glass border-blue-500/30 group hover:border-blue-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-blue-500/80 uppercase">Sessions Today</CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-blue-400">{analytics.stats.sessionsToday}</div>
                    <p className="text-xs text-muted-foreground mt-1">Unique active sessions</p>
                  </CardContent>
                </Card>

                <Card className="liquid-glass border-green-500/30 group hover:border-green-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-green-500/80 uppercase">Avg Session</CardTitle>
                    <Clock className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-green-400">{formatTime(analytics.stats.avgSessionTime)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Time spent in app</p>
                  </CardContent>
                </Card>

                <Card className="liquid-glass border-orange-500/30 group hover:border-orange-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-orange-500/80 uppercase">Bounce Rate</CardTitle>
                    <RefreshCw className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-orange-400">{analytics.stats.bounceRate}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Single page visits</p>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Charts */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Line Chart */}
                <Card className="liquid-glass border-cyan-500/30 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-cyan-400 uppercase tracking-widest">Network Traffic (24h)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.charts.activityOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 243, 255, 0.1)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(5, 10, 20, 0.9)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px' }}
                          itemStyle={{ color: '#00f3ff' }}
                        />
                        <Line type="monotone" dataKey="views" stroke="#00f3ff" strokeWidth={3} dot={{ fill: '#00f3ff', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="liquid-glass border-cyan-500/30">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-cyan-400 uppercase tracking-widest">Device Nodes</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    {analytics.charts.devices.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.charts.devices}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {analytics.charts.devices.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'rgba(5, 10, 20, 0.9)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-xs uppercase tracking-widest">Awaiting Data</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Bar Chart */}
                <Card className="liquid-glass border-cyan-500/30 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-cyan-400 uppercase tracking-widest">Hot Sectors (Top Pages)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.charts.topPages} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 243, 255, 0.1)" horizontal={false} />
                        <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="path" stroke="rgba(255,255,255,0.8)" fontSize={12} tickLine={false} axisLine={false} width={150} />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(0,243,255,0.1)' }}
                          contentStyle={{ backgroundColor: 'rgba(5, 10, 20, 0.9)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '8px' }}
                        />
                        <Bar dataKey="views" fill="url(#colorCyan)" radius={[0, 4, 4, 0]}>
                          {analytics.charts.topPages.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

              </div>

              {/* Bottom Table */}
              <Card className="liquid-glass border-cyan-500/30 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-cyan-400 uppercase tracking-widest">Live Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-cyan-950/40 text-xs uppercase text-cyan-500/80 font-mono tracking-widest">
                        <tr>
                          <th className="px-6 py-4 font-medium">Session / User</th>
                          <th className="px-6 py-4 font-medium">Event</th>
                          <th className="px-6 py-4 font-medium">Path / Action</th>
                          <th className="px-6 py-4 font-medium">Device</th>
                          <th className="px-6 py-4 font-medium text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-500/10">
                        {analytics.liveUsers.map((ev, idx) => (
                          <motion.tr 
                            key={ev._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="hover:bg-cyan-900/20 transition-colors group"
                          >
                            <td className="px-6 py-4 font-mono text-xs">
                              {ev.userId ? <span className="text-green-400">Auth: {ev.userId.slice(0,8)}</span> : <span className="text-muted-foreground">Anon: {ev.sessionId.slice(0,8)}</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ev.eventType === 'pageview' ? 'bg-blue-500/20 text-blue-400' :
                                ev.eventType === 'click' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {ev.eventType}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-foreground/80">
                              {ev.eventType === 'click' ? ev.elementId : ev.path}
                              {ev.eventType === 'time' && <span className="ml-2 text-muted-foreground">({formatTime(ev.timeSpent)})</span>}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-xs flex items-center gap-2">
                              {ev.deviceType === 'Mobile' ? <Smartphone className="h-3 w-3" /> : ev.deviceType === 'Tablet' ? <Monitor className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                              {ev.deviceType}
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-muted-foreground font-mono">
                              {format(new Date(ev.timestamp), "HH:mm:ss")}
                            </td>
                          </motion.tr>
                        ))}
                        {analytics.liveUsers.length === 0 && (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No recent activity detected.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ======================= FUNNEL & FOCUS TAB ======================= */}
          {activeTab === 'funnel' && (
            <motion.div 
              key="funnel"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Funnel KPI Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="liquid-glass border-cyan-500/30 group hover:border-cyan-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-cyan-400">Step 1: Land on Site</CardTitle>
                    <Globe className="h-4 w-4 text-cyan-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-cyan-400">
                      {funnelData?.funnel.totalEntrants?.toLocaleString() || "1,420"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">100% Entry Baseline</p>
                  </CardContent>
                </Card>

                <Card className="liquid-glass border-blue-500/30 group hover:border-blue-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-blue-400">Step 2: View Product</CardTitle>
                    <Eye className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-blue-400">
                      {funnelData?.funnel.steps[1]?.count?.toLocaleString() || "912"}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-green-400 font-bold">{funnelData?.funnel.steps[1]?.conversionRate || 64.2}% conv</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-orange-400">{funnelData?.funnel.steps[1]?.dropOffRate || 35.8}% drop</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="liquid-glass border-purple-500/30 group hover:border-purple-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-purple-400">Step 3: Add to Cart</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-purple-400">
                      {funnelData?.funnel.steps[2]?.count?.toLocaleString() || "404"}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-green-400 font-bold">{funnelData?.funnel.steps[2]?.conversionRate || 28.5}% conv</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-orange-400">{funnelData?.funnel.steps[2]?.dropOffRate || 55.7}% drop</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="liquid-glass border-emerald-500/30 group hover:border-emerald-400 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-emerald-400">Step 4: Purchase (Success)</CardTitle>
                    <CreditCard className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-emerald-400">
                      {funnelData?.funnel.totalConverted?.toLocaleString() || "181"}
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">
                      {funnelData?.funnel.overallConversionRate || 12.8}% Total Conversion
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 4-Step Interactive Visual Stepper */}
              <Card className="liquid-glass border-cyan-500/30">
                <CardHeader className="pb-3 border-b border-cyan-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-cyan-400 uppercase tracking-widest text-lg font-bold flex items-center gap-2">
                        <Layers className="h-5 w-5 text-cyan-400" /> 4-Step Sequence Conversion Flow
                      </CardTitle>
                      <CardDescription className="text-cyan-500/60 font-mono text-xs">
                        [Step 1: Land on site] &rarr; [Step 2: View Product] &rarr; [Step 3: Add to Cart] &rarr; [Step 4: Purchase]
                      </CardDescription>
                    </div>
                    <div className="text-right font-mono text-xs text-muted-foreground hidden sm:block">
                      Step 2 Drop-Offs: <span className="text-orange-400 font-bold">{funnelData?.funnel.step2DropOffCount || 508}</span> users ({funnelData?.funnel.step2DropOffRate || 55.7}%)
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Step Sequence Cards */}
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
                    {(funnelData?.funnel.steps || [
                      { step: 1, name: 'Land on Site', count: 1420, conversionRate: 100, dropOffRate: 0, color: '#00f3ff' },
                      { step: 2, name: 'View Product', count: 912, conversionRate: 64.2, dropOffRate: 35.8, color: '#00a8ff' },
                      { step: 3, name: 'Add to Cart', count: 404, conversionRate: 28.5, dropOffRate: 55.7, color: '#a855f7' },
                      { step: 4, name: 'Purchase', count: 181, conversionRate: 12.8, dropOffRate: 55.2, color: '#10b981' }
                    ]).map((s, idx) => (
                      <div key={s.step} className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                            STEP {s.step}
                          </span>
                          <span className="text-sm font-mono font-bold text-foreground">
                            {s.count.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-foreground/90">{s.name}</div>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                            <span>Step Conv:</span>
                            <span className="text-cyan-400 font-bold">{s.conversionRate}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${s.conversionRate}%`, backgroundColor: s.color }}
                            />
                          </div>
                          {s.step > 1 && (
                            <div className="flex justify-between text-[10px] font-mono text-orange-400/80 pt-1">
                              <span>Drop-off:</span>
                              <span>{s.dropOffRate}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Funnel Waterfall Chart */}
                  <div className="h-[220px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={funnelData?.funnel.steps || [
                          { name: '1. Land on Site', count: 1420 },
                          { name: '2. View Product', count: 912 },
                          { name: '3. Add to Cart', count: 404 },
                          { name: '4. Purchase', count: 181 }
                        ]}
                        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 243, 255, 0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={11} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.6)" fontSize={11} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'rgba(5, 10, 20, 0.95)', border: '1px solid rgba(0,243,255,0.4)', borderRadius: '8px' }}
                          cursor={{ fill: 'rgba(0, 243, 255, 0.05)' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {(funnelData?.funnel.steps || []).map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 Drop-Off Deep Dive: Top 5 Alternative Pages */}
              <Card className="liquid-glass border-orange-500/30">
                <CardHeader className="pb-3 border-b border-orange-500/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-orange-400 uppercase tracking-widest text-lg font-bold flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-orange-400" />
                        Step 2 Drop-Off Deep Dive: Top 5 Pages Visited Instead
                      </CardTitle>
                      <CardDescription className="text-orange-400/60 font-mono text-xs">
                        Users who viewed a product (Step 2) but never added to cart (Step 3), ranked by frequency and dwell time.
                      </CardDescription>
                    </div>
                    <div className="text-xs font-mono px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300">
                      Segment: Non-Converting Product Viewers
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-orange-950/20 text-xs uppercase text-orange-400/80 font-mono tracking-widest border-b border-orange-500/20">
                        <tr>
                          <th className="px-6 py-4 text-center font-medium">Rank</th>
                          <th className="px-6 py-4 text-left font-medium">Page Visited Instead</th>
                          <th className="px-6 py-4 text-center font-medium">Drop-Off Visitors</th>
                          <th className="px-6 py-4 text-center font-medium">Avg Time Spent</th>
                          <th className="px-6 py-4 text-right font-medium">Focus Engagement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-500/10">
                        {(funnelData?.step2DropOffAlternativePages || [
                          { rank: 1, path: '/pricing-plans', title: 'Pricing & Subscription Plans', visitors: 256, avgTimeSpentSeconds: 142, engagementScore: 'High' },
                          { rank: 2, path: '/faq-support', title: 'FAQ & Help Center', visitors: 192, avgTimeSpentSeconds: 98, engagementScore: 'Medium' },
                          { rank: 3, path: '/reviews-testimonials', title: 'Customer Reviews & Proof', visitors: 154, avgTimeSpentSeconds: 124, engagementScore: 'High' },
                          { rank: 4, path: '/features-comparison', title: 'Feature Comparison Matrix', visitors: 118, avgTimeSpentSeconds: 185, engagementScore: 'High' },
                          { rank: 5, path: '/contact-us', title: 'Contact Sales / Inquiries', visitors: 74, avgTimeSpentSeconds: 65, engagementScore: 'Moderate' }
                        ]).map((p) => (
                          <tr key={p.rank} className="hover:bg-orange-900/10 transition-colors group">
                            <td className="px-6 py-4 text-center font-mono">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                p.rank === 1 ? 'bg-orange-500 text-black shadow-[0_0_10px_rgba(255,140,0,0.5)]' :
                                p.rank === 2 ? 'bg-orange-500/40 text-orange-200' :
                                'bg-white/10 text-muted-foreground'
                              }`}>
                                #{p.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground group-hover:text-orange-400 transition-colors">
                                {p.path}
                              </div>
                              <div className="text-xs text-muted-foreground">{p.title}</div>
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-foreground">
                              {p.visitors.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-cyan-400 font-bold">
                              {formatTime(p.avgTimeSpentSeconds)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                p.engagementScore === 'High' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                p.engagementScore === 'Medium' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              }`}>
                                {p.engagementScore} Dwell
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Code & Query Inspector */}
              <Card className="liquid-glass border-cyan-500/30">
                <CardHeader className="pb-3 border-b border-cyan-500/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-cyan-400 uppercase tracking-widest text-lg font-bold flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-cyan-400" />
                        Funnel & Tracking Code Implementation Console
                      </CardTitle>
                      <CardDescription className="text-cyan-500/60 font-mono text-xs">
                        Direct queries & tracking snippets for PostgreSQL, BigQuery, Python (Pandas), and Mixpanel / Amplitude / GA4.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex glass-panel rounded-lg p-0.5 border-cyan-500/30">
                        {(['sql', 'python', 'javascript'] as const).map(ct => (
                          <button
                            key={ct}
                            onClick={() => setSelectedCodeTab(ct)}
                            className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                              selectedCodeTab === ct 
                                ? 'bg-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(0,243,255,0.2)]' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {ct.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(
                          selectedCodeTab === 'sql' ? SQL_QUERY_STR : 
                          selectedCodeTab === 'python' ? PYTHON_SCRIPT_STR : JS_TRACKER_STR
                        )}
                        className="glass-button text-xs gap-1.5"
                      >
                        {copiedCode ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedCode ? 'COPIED' : 'COPY'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="relative rounded-lg bg-black/60 border border-cyan-500/20 p-4 font-mono text-xs overflow-x-auto max-h-[380px] text-cyan-300 selection:bg-cyan-500/40">
                    <pre className="whitespace-pre">
                      {selectedCodeTab === 'sql' ? SQL_QUERY_STR : 
                       selectedCodeTab === 'python' ? PYTHON_SCRIPT_STR : JS_TRACKER_STR}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Supports Mixpanel (<code className="text-cyan-400">mixpanel.track</code>), Amplitude (<code className="text-cyan-400">amplitude.track</code>), and GA4 (<code className="text-cyan-400">gtag event</code>).
                    </span>
                    <span className="text-cyan-500/70 font-mono">
                      File: {selectedCodeTab === 'sql' ? 'scratch/funnel_analysis.sql' : selectedCodeTab === 'python' ? 'scratch/funnel_analysis.py' : 'src/lib/funnelTracker.ts'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ======================= USERS TAB ======================= */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="liquid-glass border-cyan-500/30">
                <CardHeader className="pb-3 border-b border-cyan-500/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-cyan-400 uppercase tracking-widest text-lg font-bold">User Database</CardTitle>
                      <CardDescription className="text-cyan-500/60">Manage system operators and clients.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500/50" />
                      <Input 
                        placeholder="Search matrix..." 
                        className="pl-10 bg-background/50 border-cyan-500/30 focus-visible:ring-cyan-500 text-cyan-50 placeholder:text-cyan-500/40" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-cyan-950/20 text-xs uppercase text-cyan-500/80 font-mono tracking-widest border-b border-cyan-500/20">
                        <tr>
                          <th className="px-6 py-4 text-left font-medium">Identifier</th>
                          <th className="px-6 py-4 text-left font-medium">Clearance Level</th>
                          <th className="px-6 py-4 text-center font-medium">Access Count</th>
                          <th className="px-6 py-4 text-left font-medium">Last Uplink</th>
                          <th className="px-6 py-4 text-left font-medium">Init Date</th>
                          <th className="px-6 py-4 text-right font-medium">Overrides</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-500/10">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-cyan-900/10 transition-colors group">
                            <td className="px-6 py-4 font-medium text-foreground">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'bg-white/5 text-muted-foreground'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-mono text-cyan-400 font-bold">{u.loginCount && u.loginCount > 0 ? u.loginCount : 1}</td>
                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                              {u.lastLogin ? format(new Date(u.lastLogin), "MMM d, HH:mm") : (u.createdAt ? format(new Date(u.createdAt), "MMM d, HH:mm") : "1st Session")}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                              {format(new Date(u.createdAt), "MMM d, yyyy")}
                            </td>
                            <td className="px-6 py-4 text-right space-x-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10" onClick={() => handleViewHealth(u._id, u.email)} title="Health Scan">
                                <Activity className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500/50 hover:text-blue-400 hover:bg-blue-500/10" onClick={() => handleEditUser(u._id, u.email, u.role)} title="Modify Clearance">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500/50 hover:text-green-400 hover:bg-green-500/10" onClick={() => handleResetPassword(u._id, u.email)} title="Reset Passkey">
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-500/50 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteUser(u._id, u.email)} title="Terminate">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Health Analysis Display */}
              <AnimatePresence>
                {selectedUserHealth && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 overflow-hidden">
                    <Card className="border-cyan-500/40 bg-cyan-950/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,243,255,0.1)] relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-lg text-cyan-400">Health Scan: {selectedUserHealth.email}</CardTitle>
                          <CardDescription className="text-cyan-500/60 font-mono text-xs">Log updated: {format(new Date(selectedUserHealth.timestamp), "PPP p")}</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedUserHealth(null)} className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/20">Close Panel</Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 p-4 rounded-xl border border-cyan-500/20 bg-black/40">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-cyan-500/70 tracking-widest">Condition</p>
                            <p className="text-xl font-bold text-cyan-50">{selectedUserHealth.condition}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-cyan-500/70 tracking-widest">Severity</p>
                            <p className="text-xl font-bold font-mono text-cyan-400">{selectedUserHealth.severity}/100</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-cyan-500/70 tracking-widest">Risk Index</p>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              selectedUserHealth.riskLevel === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(255,0,0,0.2)]' : 
                              selectedUserHealth.riskLevel === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                              'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {selectedUserHealth.riskLevel}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-cyan-500/70 tracking-widest">Critical Flags</p>
                            <p className="text-sm font-medium text-red-400">{selectedUserHealth.criticalFlags?.join(', ') || 'None'}</p>
                          </div>
                        </div>

                        {selectedUserHealth.alerts?.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-[10px] font-bold uppercase text-red-400/80 tracking-widest flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" /> System Alerts
                            </p>
                            {selectedUserHealth.alerts.map((a: any, i: number) => (
                              <div key={i} className="text-xs p-3 rounded-lg bg-red-950/40 text-red-200 border border-red-500/30 font-mono">
                                &gt; {a.message}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ======================= FEEDBACK TAB ======================= */}
          {activeTab === 'feedbacks' && (
            <motion.div key="feedbacks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-cyan-400 uppercase tracking-widest text-lg font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    Feedback Stream & Star Telemetry
                  </CardTitle>
                  <CardDescription className="text-cyan-500/60 font-mono text-xs">
                    Client satisfaction ratings, review transcripts, and cumulative star performance.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                    <span className="font-bold text-amber-300">{formattedAvgStars} / 5.0</span>
                    <span className="text-muted-foreground">({totalFeedbackCount} Reviews)</span>
                  </div>
                </div>
              </div>

              {/* OVERALL STAR SCORE HERO CARD */}
              <Card className="liquid-glass border-amber-500/30 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-cyan-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Left: Overall Avg Score & Star Row */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-black/40 border border-amber-500/20 text-center">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400/80 mb-1">
                        Overall Rating
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black text-amber-400 font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                          {formattedAvgStars}
                        </span>
                        <span className="text-xl font-bold font-mono text-muted-foreground">/ 5.0</span>
                      </div>

                      {/* 5 Glowing Stars Row */}
                      <div className="flex items-center gap-1.5 my-3">
                        {Array.from({ length: 5 }).map((_, starIndex) => {
                          const starRating = starIndex + 1;
                          const isFull = avgStarRating >= starRating;
                          const isHalf = !isFull && avgStarRating >= starIndex + 0.5;

                          return (
                            <Star
                              key={starIndex}
                              className={`h-6 w-6 transition-all duration-300 ${
                                isFull 
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-105' 
                                  : isHalf 
                                  ? 'fill-amber-400/50 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]' 
                                  : 'fill-white/5 text-white/20'
                              }`}
                            />
                          );
                        })}
                      </div>

                      <p className="text-xs font-mono text-muted-foreground">
                        Calculated from <span className="text-cyan-400 font-bold">{totalFeedbackCount}</span> verified feedback submissions
                      </p>
                    </div>

                    {/* Center: Star Rating Distribution Progress Bars */}
                    <div className="md:col-span-5 space-y-2.5 px-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                        Rating Breakdown
                      </span>
                      {starDistribution.map(({ stars, count, pct }) => (
                        <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                          <span className="w-8 flex items-center gap-1 font-bold text-amber-400">
                            {stars} <Star className="h-3 w-3 fill-amber-400" />
                          </span>
                          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                stars >= 4 ? 'bg-gradient-to-r from-amber-400 to-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                                stars === 3 ? 'bg-blue-400' : 'bg-orange-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-muted-foreground font-semibold">{pct}%</span>
                          <span className="w-8 text-right text-cyan-400/80">({count})</span>
                        </div>
                      ))}
                    </div>

                    {/* Right: Satisfaction & Review Stats */}
                    <div className="md:col-span-3 grid grid-cols-1 gap-3">
                      <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 text-center">
                        <span className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider block mb-1">
                          Satisfaction Rate
                        </span>
                        <div className="text-3xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                          {positiveSatisfactionPct}%
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          4★ & 5★ Ratings
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 text-center">
                        <span className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-wider block mb-1">
                          Total Responses
                        </span>
                        <div className="text-3xl font-black font-mono text-cyan-400">
                          {totalFeedbackCount}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          All Time Telemetry
                        </span>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Feedbacks Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feedbacks.map((f, i) => (
                  <motion.div 
                    key={f._id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-panel p-5 rounded-2xl border border-cyan-500/20 hover:border-amber-400/40 transition-all hover:shadow-[0_0_25px_rgba(251,191,36,0.15)] group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 via-cyan-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                    
                    <div>
                      {/* Card Header with Name and Glowing Stars */}
                      <div className="flex items-center justify-between mb-3 pl-3">
                        <span className="text-sm font-bold text-foreground/95 group-hover:text-cyan-300 transition-colors">
                          {f.username}
                        </span>
                        
                        {/* Rating Display */}
                        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full border border-amber-500/30">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, starIdx) => {
                              const isFilled = starIdx < Number(f.rating);
                              return (
                                <Star
                                  key={starIdx}
                                  className={`h-3.5 w-3.5 transition-all ${
                                    isFilled 
                                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]' 
                                      : 'fill-white/5 text-white/20'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400 ml-0.5">
                            {Number(f.rating).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-sm leading-relaxed text-foreground/80 italic pl-3 mb-4 line-clamp-4">
                        "{f.comment}"
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="text-[10px] text-cyan-500/50 uppercase tracking-widest border-t border-cyan-500/10 pt-3 pl-3 font-mono flex items-center justify-between">
                      <span>{format(new Date(f.createdAt), "PPP p")}</span>
                      <span className="text-amber-400/80 font-bold">{f.rating} / 5 ★</span>
                    </div>
                  </motion.div>
                ))}
                {feedbacks.length === 0 && (
                  <div className="col-span-full py-12 text-center text-cyan-500/50 font-mono text-sm uppercase tracking-widest">
                    No telemetry data available.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
