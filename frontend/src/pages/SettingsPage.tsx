import React, { useState, useEffect } from 'react';
import { Shield, Lock, Cpu, Database, CheckCircle2, Info, Server } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    api.get('/health').then((res) => setHealth(res.data)).catch(() => {});
    api.get('/organizations/current').then((res) => setOrg(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
          Settings & Security Governance
        </h1>
        <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
          Review system architecture, AI engine configuration, and data confidentiality posture.
        </p>
      </div>

      {/* AI Engine & Local Deterministic Provider Status */}
      <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-inkloom-primary flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-inkloom-text">Review Engine Architecture</h2>
            <p className="text-xs text-inkloom-muted">Deterministic rule-based heuristics & optional model provider</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border">
            <span className="text-[10px] uppercase font-bold text-inkloom-muted block">Active Provider</span>
            <span className="text-sm font-extrabold text-inkloom-text mt-1 block">
              {health?.ai_engine?.provider || 'local_deterministic'}
            </span>
            <span className="text-[10px] text-inkloom-success font-semibold">Ready / Fully Functional</span>
          </div>

          <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border">
            <span className="text-[10px] uppercase font-bold text-inkloom-muted block">External AI Required</span>
            <span className="text-sm font-extrabold text-inkloom-secondary mt-1 block">No (0 Paid Keys)</span>
            <span className="text-[10px] text-inkloom-muted font-medium">Standalone Hackathon MVP</span>
          </div>

          <div className="p-4 rounded-2xl bg-inkloom-bg/60 border border-inkloom-border">
            <span className="text-[10px] uppercase font-bold text-inkloom-muted block">External LLM Status</span>
            <span className="text-sm font-extrabold text-inkloom-text mt-1 block">
              {health?.ai_engine?.external_llm_configured ? 'Configured' : 'Not Configured (Safe Local)'}
            </span>
            <span className="text-[10px] text-inkloom-muted font-medium">Auto fallback active</span>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-inkloom-secondary flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-inkloom-text">Organization Tenancy</h2>
            <p className="text-xs text-inkloom-muted">Isolated multi-tenant container</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-inkloom-muted block font-semibold mb-1">Organization Name</label>
            <div className="p-3 rounded-xl bg-inkloom-bg/50 border border-inkloom-border font-bold text-inkloom-text">
              {org?.name || 'Luminary Cloud Technologies'}
            </div>
          </div>
          <div>
            <label className="text-inkloom-muted block font-semibold mb-1">Tenancy Slug</label>
            <div className="p-3 rounded-xl bg-inkloom-bg/50 border border-inkloom-border font-mono text-inkloom-text">
              {org?.slug || 'luminary-cloud'}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy, Retention & Confidentiality Disclosure */}
      <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-inkloom-success flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-inkloom-text">Privacy & Human Oversight Guarantees</h2>
            <p className="text-xs text-inkloom-muted">Governance and confidentiality policy</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-inkloom-muted leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-900">
            <strong className="block text-emerald-950 font-bold mb-0.5">Strict Confidentiality:</strong>
            Draft content, press releases, and internal whitepapers are processed locally within your organizational boundary. They are never retained or used to train public language models.
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-purple-900">
            <strong className="block text-purple-950 font-bold mb-0.5">Zero Silent Publishing:</strong>
            Inkloom AI acts purely as an assistive review layer. The platform never automatically publishes, deletes, or silently rewrites copy without human creator approval.
          </div>
        </div>
      </div>
    </div>
  );
};
