import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Shield, Sparkles, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, NotificationItem } from '../../types';
import api from '../../api/client';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    approver: 'bg-amber-100 text-amber-700 border-amber-200',
    creator: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-inkloom-border px-4 lg:px-8 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-inkloom-muted hover:text-inkloom-text hover:bg-inkloom-bg rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-inkloom-primary via-indigo-600 to-inkloom-secondary flex items-center justify-center text-white shadow-glow-primary group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-inkloom-primary to-inkloom-secondary bg-clip-text text-transparent">
              Inkloom AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-inkloom-primary/10 text-inkloom-primary">
              Enterprise
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 rounded-full border uppercase text-[10px] tracking-wide font-bold ${user ? roleColors[user.role] : ''}`}>
          {user?.role}
        </span>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-inkloom-muted hover:text-inkloom-text hover:bg-inkloom-bg rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-inkloom-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-inkloom-border p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-inkloom-border">
                <span className="font-bold text-sm text-inkloom-text">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-inkloom-primary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-inkloom-border/50 py-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-inkloom-muted">No notifications yet.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 text-xs rounded-lg transition-colors ${
                        !n.is_read ? 'bg-inkloom-primary/5 font-medium' : ''
                      }`}
                    >
                      <div className="font-semibold text-inkloom-text mb-0.5">{n.title}</div>
                      <div className="text-inkloom-muted text-[11px] leading-relaxed">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-inkloom-bg transition-colors border border-transparent hover:border-inkloom-border"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-inkloom-text leading-tight">{user?.full_name}</div>
              <div className="text-[10px] text-inkloom-muted">{user?.title || user?.email}</div>
            </div>
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || 'User'}`}
              alt={user?.full_name}
              className="w-8 h-8 rounded-full border border-inkloom-border object-cover"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-inkloom-border p-2 z-50">
              <div className="px-3 py-2 border-b border-inkloom-border">
                <div className="font-bold text-xs text-inkloom-text">{user?.full_name}</div>
                <div className="text-[11px] text-inkloom-muted truncate">{user?.email}</div>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-inkloom-text hover:bg-inkloom-bg rounded-xl flex items-center gap-2 mt-1"
              >
                <Shield className="w-4 h-4 text-inkloom-muted" /> Organization Settings
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-inkloom-error hover:bg-red-50 rounded-xl flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
