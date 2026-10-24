import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, AlertTriangle, Clock, TrendingUp, 
  ArrowRight, ShieldCheck, RefreshCw, Plus, FileText, CheckSquare, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import api from '../api/client';
import { AnalyticsData, ContentItem, ApprovalRequest } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [analyticsRes, contentsRes, approvalsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/content'),
        api.get('/approvals?status_filter=in_review'),
      ]);
      setAnalytics(analyticsRes.data);
      setContents(contentsRes.data);
      setPendingApprovals(approvalsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
              Brand Governance Dashboard
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-inkloom-primary/10 text-inkloom-primary">
              Live Audits
            </span>
          </div>
          <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
            Welcome back, <span className="font-semibold text-inkloom-text">{user?.full_name}</span>. Here is your enterprise compliance posture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-inkloom-border bg-white hover:bg-inkloom-bg text-inkloom-muted hover:text-inkloom-text transition-colors shadow-sm"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-inkloom-primary' : ''}`} />
          </button>

          <Link
            to="/studio"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-inkloom-primary to-inkloom-secondary hover:from-inkloom-primaryHover hover:to-blue-600 shadow-glow-primary transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Content Review</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Reviewed"
          value={analytics?.total_reviewed ?? 0}
          change="+18.4%"
          trend="up"
          icon={FileText}
          gradient="from-inkloom-primary to-indigo-600"
        />
        <StatCard
          label="Pending Approvals"
          value={analytics?.pending_approvals ?? 0}
          change="3 awaiting sign-off"
          trend="neutral"
          icon={Clock}
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          label="Critical Flags"
          value={analytics?.critical_issues ?? 0}
          change="-42.1%"
          trend="up"
          icon={AlertTriangle}
          gradient="from-red-500 to-inkloom-accent"
        />
        <StatCard
          label="1st-Pass Approval Rate"
          value={`${analytics?.first_pass_approval_rate ?? 91}%`}
          change="+6.2%"
          trend="up"
          icon={CheckCircle2}
          gradient="from-inkloom-highlight to-emerald-500"
        />
      </div>

      {/* High-level Score and Compliance Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall Brand Compliance Score Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-inkloom-muted">
                Enterprise Health
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-inkloom-success border border-emerald-200">
                Optimal
              </span>
            </div>
            <h2 className="text-lg font-bold text-inkloom-text">Overall Compliance Index</h2>
            <p className="text-xs text-inkloom-muted mt-1 leading-relaxed">
              Weighted index calculated from terminology accuracy, substantiated claims, and tone consistency.
            </p>
          </div>

          <div className="my-6 flex items-center justify-center">
            <ScoreGauge score={analytics?.average_compliance_score ?? 94.2} size={150} />
          </div>

          <div className="pt-4 border-t border-inkloom-border/60 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-2xl bg-inkloom-bg/60">
              <div className="text-[10px] uppercase font-bold text-inkloom-muted">Turnaround</div>
              <div className="text-sm font-extrabold text-inkloom-text">{analytics?.turnaround_time_hours ?? 2.4} hrs</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-inkloom-bg/60">
              <div className="text-[10px] uppercase font-bold text-inkloom-muted">Engine SLA</div>
              <div className="text-sm font-extrabold text-inkloom-primary">Deterministic</div>
            </div>
          </div>
        </div>

        {/* 7-Day Compliance Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-inkloom-text">Compliance Score Trajectory</h2>
              <p className="text-xs text-inkloom-muted">7-day rolling average of audited content versions</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-inkloom-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-inkloom-primary" />
              <span>Score %</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trends || []}>
                <XAxis dataKey="date" stroke="#74728C" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} stroke="#74728C" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8E4F7', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#242044' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7657F6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#7657F6', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#478BFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Issue Breakdown & Frequently Detected Clichés */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-inkloom-text">Issue Distribution by Category</h2>
              <p className="text-xs text-inkloom-muted">Breakdown of flagged governance occurrences</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.categories_breakdown || []} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#74728C" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="label" type="category" stroke="#242044" fontSize={11} tickLine={false} axisLine={false} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8E4F7' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {(analytics?.categories_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequently Detected Clichés & Policy Violations */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-inkloom-text mb-1">Recurring Governance Issues</h2>
            <p className="text-xs text-inkloom-muted mb-4">Most common terms and superlatives detected across drafts</p>

            <div className="space-y-3">
              {(analytics?.frequent_mistakes || []).map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border/70 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-inkloom-error">"{m.phrase}"</span>
                      <span className="text-[10px] font-semibold text-inkloom-muted px-1.5 py-0.5 rounded bg-white">
                        {m.occurrences}x detected
                      </span>
                    </div>
                    <div className="text-[11px] text-inkloom-success font-medium mt-1">
                      Fix: "{m.suggestion}"
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-inkloom-primary uppercase">
                    {m.rule_id.split('-').slice(-1)[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/brands"
            className="mt-4 pt-3 border-t border-inkloom-border/60 text-xs font-bold text-inkloom-primary flex items-center justify-between hover:underline"
          >
            <span>Manage Brand Vocabulary Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Pending Approvals & Recent Content Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Approval Queue Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-inkloom-text">Awaiting Your Approval</h2>
              <p className="text-xs text-inkloom-muted">Items submitted for sign-off</p>
            </div>
            <Link to="/approvals" className="text-xs font-bold text-inkloom-primary hover:underline">
              View All ({pendingApprovals.length})
            </Link>
          </div>

          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs text-inkloom-muted">
                <CheckCircle2 className="w-8 h-8 text-inkloom-success mx-auto mb-2 opacity-80" />
                No content items currently awaiting sign-off.
              </div>
            ) : (
              pendingApprovals.slice(0, 3).map((app) => (
                <div key={app.id} className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/40 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-inkloom-text line-clamp-1">
                      {app.content_title}
                    </span>
                    <Badge variant="in_review">v{app.requested_version_number}</Badge>
                  </div>
                  <div className="text-[11px] text-inkloom-muted line-clamp-2">
                    {app.decision_notes || 'Submitted for brand compliance review.'}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-inkloom-muted font-medium">By {app.requester_name}</span>
                    <Link
                      to="/approvals"
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>Review Sign-off</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Content Audits Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-inkloom-text">Recent Content Drafts</h2>
              <p className="text-xs text-inkloom-muted">Workspaces and audit results</p>
            </div>
            <Link to="/studio" className="text-xs font-bold text-inkloom-primary hover:underline">
              Open Studio
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-inkloom-border text-inkloom-muted uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-bold">Content Title</th>
                  <th className="pb-3 font-bold">Type</th>
                  <th className="pb-3 font-bold">Score</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inkloom-border/50">
                {contents.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-inkloom-bg/60 transition-colors">
                    <td className="py-3 font-semibold text-inkloom-text max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-3 text-inkloom-muted uppercase text-[10px]">
                      {c.content_type.replace('_', ' ')}
                    </td>
                    <td className="py-3 font-bold">
                      <span className={c.latest_score >= 90 ? 'text-inkloom-success' : c.latest_score >= 75 ? 'text-inkloom-secondary' : 'text-inkloom-error'}>
                        {c.latest_score.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={c.status}>{c.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/studio?content_id=${c.id}`}
                        className="text-xs font-bold text-inkloom-primary hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
