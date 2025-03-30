
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Settings, MessageCircle } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-cliniko-primary text-white flex flex-col">
        {/* Logo/Header */}
        <div className="p-4 border-b border-cliniko-accent">
          <h1 className="text-xl font-bold">Cliniko Follow-Up</h1>
          <p className="text-sm text-white/80">Patient Management System</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col p-2 md:p-4 space-y-1">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/patients" icon={<Users size={20} />} label="Patients" />
          <NavItem to="/sms" icon={<MessageCircle size={20} />} label="SMS Templates" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>
        
        {/* Footer */}
        <div className="mt-auto p-4 text-xs text-white/70">
          <p>© {new Date().getFullYear()} Cliniko Follow-Up</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main content wrapper */}
        <div className="flex-1 p-4 md:p-8 bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        "hover:bg-cliniko-accent/80",
        isActive ? "bg-cliniko-accent text-white" : "text-white/90"
      )}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default AppLayout;
