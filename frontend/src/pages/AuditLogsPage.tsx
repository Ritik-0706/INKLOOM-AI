import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Clock, User, ArrowRight } from 'lucide-react';
import api from '../api/client';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('approved')) return 'bg-emerald-50 text-inkloom-success border-emerald-200';
    if (action.includes('created')) return 'bg-purple-50 text-inkloom-primary border-purple-200';
    if (action.includes('applied')) return 'bg-blue-50 text-inkloom-secondary border-blue-200';
    if (action.includes('changes')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-inkloom-text border-slate-200';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
          Compliance Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
          Immutable event log tracking all reviews, edits, suggestion applications, and approval sign-offs.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-inkloom-border text-inkloom-muted uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Timestamp</th>
                <th className="pb-3 font-bold">Action Event</th>
                <th className="pb-3 font-bold">Actor</th>
                <th className="pb-3 font-bold">Entity</th>
                <th className="pb-3 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inkloom-border/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-inkloom-bg/50 transition-colors">
                  <td className="py-3 text-inkloom-muted font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getActionBadge(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-inkloom-text">
                    {log.user_name || log.user_email || 'System Automated'}
                  </td>
                  <td className="py-3 text-inkloom-muted capitalize">
                    {log.entity_type}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-inkloom-muted max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
