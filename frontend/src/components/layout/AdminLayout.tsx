import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Mic,
  Award,
  Building,
  Clock,
  CreditCard,
  QrCode,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Shield,
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { CIB_LOGO_URL } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, adminLogout } = useApp();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Events', icon: Calendar, href: '/admin/events' },
    { label: 'Registrations', icon: Users, href: '/admin/registrations' },
    { label: 'Check-In Counter', icon: QrCode, href: '/admin/check-in' },
    { label: 'Speakers', icon: Mic, href: '/admin/speakers' },
    { label: 'Corporate Members & Sponsors', icon: Building, href: '/admin/sponsors' },
    { label: 'Payments Ledger', icon: CreditCard, href: '/admin/payments' },
    { label: 'Certificates', icon: Award, href: '/admin/certificates' },
    { label: 'Event Resources', icon: FileText, href: '/admin/resources' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-72 h-[100dvh] max-h-[100dvh] bg-[#1B7E3E] text-white flex flex-col transition-transform duration-200 border-r border-white shadow-none lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-white/20 flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-none shadow-xs">
              <img
                src={CIB_LOGO_URL}
                alt="CIB Ghana Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-display tracking-wide uppercase leading-none">
                CIB ADMIN
              </h2>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-none lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-0 py-2 space-y-0 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold transition-all relative ${
                  active
                    ? 'bg-white text-[#1B7E3E] font-black border-l-4 border-[#1B7E3E]'
                    : 'text-emerald-50 hover:bg-white/15 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-[#1B7E3E]' : 'text-emerald-200'}`} />
                <span className="tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Session & Logout */}
        <div className="border-t border-white/15 p-3 space-y-1 bg-[#145C2D] shrink-0">
          <div className="flex items-center justify-between px-2 py-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="font-bold text-white text-[11px] truncate max-w-[120px]">
                Admin Active
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold text-emerald-200 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
              title="Sign out of Admin Center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Bottom Return to Public Site (Optimized for Mobile Visibility & Touch) */}
        <div className="border-t border-white/20 p-3 sm:p-3.5 pb-6 sm:pb-3.5 bg-[#0F4722] shrink-0">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-none bg-white hover:bg-emerald-50 active:scale-[0.98] text-[#1B7E3E] text-xs sm:text-sm font-black transition-all cursor-pointer border border-white"
          >
            <ArrowLeft className="w-4 h-4 text-[#1B7E3E] shrink-0" />
            <span className="tracking-tight font-extrabold uppercase">Return to Public Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
        {/* Admin Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3.5 sm:px-6 lg:px-10 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 sm:p-2.5 rounded-none text-slate-700 hover:bg-slate-100 lg:hidden shrink-0 border-0 outline-none cursor-pointer"
                aria-label="Open Sidebar"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              {title && (
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 font-display tracking-tight truncate">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-none border border-slate-200 hover:border-cib-green-600 text-slate-700 hover:text-cib-green-700 hover:bg-emerald-50/50 text-xs font-bold transition-all shrink-0 cursor-pointer"
                title="Return to Public Site"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Public Site</span>
              </Link>
              {actions}
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-colors border-0 cursor-pointer"
                title="Logout of Admin Center"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body (Mobile-optimized padding & full width) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-10 w-full min-w-0 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

