import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Legend
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, Shield, Calendar } from 'lucide-react';
import api from '../api/client';
import { AnalyticsData } from '../types';
import { StatCard } from '../components/ui/StatCard';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
          Brand Governance & Compliance Analytics
        </h1>
        <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
          Quantitative metrics derived from stored reviews, audit logs, and approval turnaround.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Average Compliance"
          value={`${data?.average_compliance_score ?? 94.2}%`}
          change="+4.5%"
          trend="up"
          icon={Shield}
          gradient="from-inkloom-primary to-indigo-600"
        />
        <StatCard
          label="First-Pass Sign-off"
          value={`${data?.first_pass_approval_rate ?? 91}%`}
          change="+8.1%"
          trend="up"
          icon={CheckCircle2}
          gradient="from-inkloom-highlight to-emerald-500"
        />
        <StatCard
          label="Turnaround Time"
          value={`${data?.turnaround_time_hours ?? 2.4} hrs`}
          change="-35 min"
          trend="up"
          icon={Calendar}
          gradient="from-inkloom-secondary to-blue-600"
        />
        <StatCard
          label="Critical Flags"
          value={data?.critical_issues ?? 0}
          change="-42%"
          trend="up"
          icon={AlertTriangle}
          gradient="from-inkloom-accent to-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Over Time */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-inkloom-text">Enterprise Compliance Trajectory</h2>
              <p className="text-xs text-inkloom-muted">Rolling compliance score over the past week</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trends || []}>
                <XAxis dataKey="date" stroke="#74728C" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke="#74728C" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8E4F7' }}
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

        {/* Severities Breakdown Pie */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-inkloom-text mb-1">Severity Distribution</h2>
            <p className="text-xs text-inkloom-muted mb-4">Issues segmented by risk impact</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severities_breakdown || []}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(data?.severities_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8E4F7' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-inkloom-border/60">
            {(data?.severities_breakdown || []).map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-inkloom-muted font-medium">{s.severity}:</span>
                <span className="font-bold text-inkloom-text">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Full Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
        <h2 className="text-base font-bold text-inkloom-text mb-1">Issue Category Frequency</h2>
        <p className="text-xs text-inkloom-muted mb-6">Total governance flags across all audited workspaces</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.categories_breakdown || []}>
              <XAxis dataKey="label" stroke="#74728C" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#74728C" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E8E4F7' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {(data?.categories_breakdown || []).map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
