import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Sparkles, BookOpen, Image as ImageIcon, 
  CheckSquare, BarChart3, Users, History, Settings, ExternalLink, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/studio', label: 'Review Studio', icon: Sparkles, badge: 'Core' },
    { to: '/brands', label: 'Brand Guidelines', icon: BookOpen },
    { to: '/assets', label: 'Visual Asset Review', icon: ImageIcon },
    { to: '/approvals', label: 'Approval Queue', icon: CheckSquare },
    { to: '/analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { to: '/team', label: 'Team Members', icon: Users },
    { to: '/audit', label: 'Audit Trail', icon: History },
    { to: '/settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-inkloom-text/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-inkloom-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* Brand header */}
          <div className="hidden lg:flex items-center gap-2.5 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-inkloom-primary to-inkloom-secondary flex items-center justify-center text-white shadow-glow-primary">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-inkloom-text tracking-tight">Inkloom AI</div>
              <div className="text-[10px] text-inkloom-muted font-medium">Brand Governance Engine</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-inkloom-muted">
              Workflow Navigation
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-inkloom-primary to-indigo-600 text-white shadow-glow-primary'
                        : 'text-inkloom-muted hover:text-inkloom-text hover:bg-inkloom-bg'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-inkloom-accent/20 text-inkloom-accent border border-inkloom-accent/30">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Engine status footer */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-inkloom-bg to-purple-50/70 border border-inkloom-border/80">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-inkloom-highlight animate-pulse" />
            <span className="text-xs font-bold text-inkloom-text">Review Engine Online</span>
          </div>
          <p className="text-[11px] text-inkloom-muted leading-tight mb-2">
            Local deterministic governance active. 0 paid API keys required.
          </p>
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-inkloom-primary flex items-center gap-1 hover:underline"
          >
            <span>FastAPI OpenAPI Spec</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>
    </>
  );
};
