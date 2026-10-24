import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle2, XCircle, Mail, UserCheck } from 'lucide-react';
import api from '../api/client';
import { User, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const TeamPage: React.FC = () => {
  const { user: currentUser, switchDemoRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    approver: 'bg-amber-100 text-amber-700 border-amber-200',
    creator: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const matrix = [
    { permission: 'Manage Brand Profiles & Rules', admin: true, manager: true, approver: false, creator: false },
    { permission: 'Create & Audit Content', admin: true, manager: true, approver: true, creator: true },
    { permission: 'Apply & Dismiss Review Issues', admin: true, manager: true, approver: true, creator: true },
    { permission: 'Submit Draft for Approval', admin: true, manager: true, approver: true, creator: true },
    { permission: 'Authorize Final Sign-off / Request Revisions', admin: true, manager: true, approver: true, creator: false },
    { permission: 'Manage Team Roles & API Keys', admin: true, manager: false, approver: false, creator: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-inkloom-text tracking-tight">
          Organization Team & Access Governance
        </h1>
        <p className="text-xs sm:text-sm text-inkloom-muted mt-1">
          Role-based access control (RBAC) enforced on every API endpoint.
        </p>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {users.map((member) => (
          <div
            key={member.id}
            className={`bg-white rounded-3xl p-5 border shadow-card-soft transition-all space-y-4 flex flex-col justify-between ${
              currentUser?.id === member.id ? 'border-inkloom-primary ring-2 ring-inkloom-primary/20' : 'border-inkloom-border'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <img
                  src={member.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${member.full_name}`}
                  alt={member.full_name}
                  className="w-12 h-12 rounded-2xl border border-inkloom-border object-cover shadow-sm"
                />
                <span className={`px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${roleColors[member.role]}`}>
                  {member.role}
                </span>
              </div>

              <h2 className="text-sm font-bold text-inkloom-text">{member.full_name}</h2>
              <div className="text-xs text-inkloom-muted mt-0.5">{member.title || 'Brand Specialist'}</div>
              <div className="text-[11px] text-inkloom-muted font-mono mt-2 truncate flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-inkloom-muted flex-shrink-0" />
                <span>{member.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-inkloom-border/60">
              <button
                onClick={() => switchDemoRole(member.role)}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  currentUser?.id === member.id
                    ? 'bg-inkloom-primary/10 text-inkloom-primary cursor-default'
                    : 'bg-inkloom-bg hover:bg-slate-100 text-inkloom-text border border-inkloom-border'
                }`}
              >
                {currentUser?.id === member.id ? 'Active Persona' : `Switch to ${member.role}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-inkloom-border shadow-card-soft space-y-4">
        <div>
          <h2 className="text-base font-bold text-inkloom-text">Role Permissions Matrix</h2>
          <p className="text-xs text-inkloom-muted">Strictly authorized via backend permission dependencies</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-inkloom-border text-inkloom-muted uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Operation / Permission</th>
                <th className="pb-3 font-bold text-center">Admin</th>
                <th className="pb-3 font-bold text-center">Manager</th>
                <th className="pb-3 font-bold text-center">Approver</th>
                <th className="pb-3 font-bold text-center">Creator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inkloom-border/50">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-inkloom-bg/50 transition-colors">
                  <td className="py-3 font-semibold text-inkloom-text">{row.permission}</td>
                  <td className="py-3 text-center">
                    {row.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-inkloom-success mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.manager ? (
                      <CheckCircle2 className="w-4 h-4 text-inkloom-success mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.approver ? (
                      <CheckCircle2 className="w-4 h-4 text-inkloom-success mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.creator ? (
                      <CheckCircle2 className="w-4 h-4 text-inkloom-success mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
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
