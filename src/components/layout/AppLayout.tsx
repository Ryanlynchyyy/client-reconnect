import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  MessageCircle, 
  BarChart, 
  ChevronRight,
  Briefcase,
  ChevronDown,
  MessageSquare,
  FileText
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [smsExpanded, setSmsExpanded] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-full md:w-64"
        )}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className={cn("overflow-hidden", collapsed && "opacity-0")}>
            <h1 className="text-xl font-bold text-cliniko-primary">Cliniko Follow-Up</h1>
            <p className="text-xs text-muted-foreground">Patient Management</p>
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight className={cn(
              "h-5 w-5 transition-transform",
              collapsed ? "rotate-180" : ""
            )} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col p-2 space-y-1">
          <NavItem 
            to="/" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            description="Follow-up queue" 
            collapsed={collapsed}
          />
          <NavItem 
            to="/patients" 
            icon={<Users size={20} />} 
            label="Patients" 
            description="Patient records"
            collapsed={collapsed}
          />
          <NavItem 
            to="/workcover" 
            icon={<Briefcase size={20} />} 
            label="WorkCover" 
            description="Session tracking"
            collapsed={collapsed}
            badge="New"
          />
          
          {/* SMS Management Section with Dropdown */}
          <div className="relative">
            {!collapsed ? (
              <>
                <button
                  onClick={() => setSmsExpanded(!smsExpanded)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors hover:bg-gray-100",
                    (window.location.pathname === '/sms' || window.location.pathname === '/sms/replies') ? 
                      "bg-cliniko-muted text-cliniko-primary font-medium" : "text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={20} />
                    <div className="flex flex-col flex-1">
                      <span>SMS Management</span>
                      <span className="text-xs text-muted-foreground">Messages & Replies</span>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    smsExpanded ? "rotate-180" : ""
                  )} />
                </button>
                
                {smsExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    <NavLink
                      to="/sms"
                      className={({ isActive }) => cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm",
                        "hover:bg-gray-100",
                        isActive ? "bg-cliniko-muted text-cliniko-primary font-medium" : "text-gray-700"
                      )}
                    >
                      <FileText size={16} />
                      <span>Templates</span>
                    </NavLink>
                    <NavLink
                      to="/sms/replies"
                      className={({ isActive }) => cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm",
                        "hover:bg-gray-100",
                        isActive ? "bg-cliniko-muted text-cliniko-primary font-medium" : "text-gray-700"
                      )}
                    >
                      <MessageSquare size={16} />
                      <span>Replies</span>
                    </NavLink>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Collapsed view */}
                <NavLink
                  to="/sms"
                  className={({ isActive }) => cn(
                    "flex justify-center p-2 rounded-md transition-colors",
                    "hover:bg-gray-100",
                    isActive ? "bg-cliniko-muted text-cliniko-primary" : "text-gray-700"
                  )}
                >
                  <MessageCircle size={20} />
                </NavLink>
              </>
            )}
          </div>
          
          <NavItem 
            to="/analytics" 
            icon={<BarChart size={20} />} 
            label="Analytics" 
            description="Performance data"
            collapsed={collapsed}
          />
          <NavItem 
            to="/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            description="Configuration"
            collapsed={collapsed}
          />
        </nav>
        
        {/* Footer */}
        <div className={cn(
          "mt-auto p-4 text-xs text-muted-foreground border-t border-gray-200",
          collapsed && "hidden"
        )}>
          <p>© {new Date().getFullYear()} Cliniko Follow-Up</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
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
  description?: string;
  collapsed?: boolean;
  badge?: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, 
  icon, 
  label, 
  description, 
  collapsed = false,
  badge
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        "hover:bg-gray-100",
        isActive ? "bg-cliniko-muted text-cliniko-primary font-medium" : "text-gray-700",
        collapsed && "justify-center px-2"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="truncate">{label}</span>
            {badge && (
              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && <span className="text-xs text-muted-foreground truncate">{description}</span>}
        </div>
      )}
    </NavLink>
  );
};

export default AppLayout;
