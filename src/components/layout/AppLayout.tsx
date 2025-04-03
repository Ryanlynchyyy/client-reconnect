
import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart, 
  ChevronRight,
  Briefcase,
  FileText,
  MessageSquare,
  Menu,
  LogOut,
  Waves,
  SunMedium,
  Umbrella
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f0fdfe]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 mr-3 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/793f395e-ebe8-4678-b600-e179f64eb91c.png" 
              alt="Body in Mind Physio" 
              className="h-8 mr-2" 
            />
            <h1 className="text-xl font-bold text-beach-ocean">Body in Mind</h1>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-20"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-30",
          collapsed ? "w-[70px]" : "w-64",
          mobileMenuOpen ? "fixed inset-y-0 left-0" : "hidden md:block"
        )}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div className={cn("overflow-hidden flex items-center", collapsed && "opacity-0")}>
            <div className="w-9 h-9 flex items-center justify-center mr-2">
              <img 
                src="/lovable-uploads/793f395e-ebe8-4678-b600-e179f64eb91c.png" 
                alt="Body in Mind Physio" 
                className="w-full h-auto" 
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-beach-ocean">Body in Mind</h1>
              <p className="text-xs text-beach-coral">Physiotherapy</p>
            </div>
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hidden md:block"
          >
            <ChevronRight className={cn(
              "h-5 w-5 transition-transform",
              collapsed ? "rotate-180" : ""
            )} />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 md:hidden"
          >
            <ChevronRight className="h-5 w-5 transform rotate-180" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-65px)]">
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
          
          {/* Navigation Category Divider */}
          <div className={cn(
            "px-3 py-2 text-xs font-medium text-beach-ocean",
            collapsed && "text-center px-0"
          )}>
            {collapsed ? "SMS" : "SMS MANAGEMENT"}
          </div>
          
          {/* SMS Templates Menu Item */}
          <NavItem 
            to="/sms" 
            icon={<FileText size={20} />} 
            label="SMS Templates" 
            description="Message templates"
            collapsed={collapsed}
          />
          
          {/* SMS Replies Menu Item */}
          <NavItem 
            to="/sms/replies" 
            icon={<MessageSquare size={20} />} 
            label="SMS Replies" 
            description="Patient responses"
            collapsed={collapsed}
          />
          
          {/* Navigation Category Divider */}
          <div className={cn(
            "px-3 py-2 text-xs font-medium text-beach-ocean",
            collapsed && "text-center px-0"
          )}>
            {collapsed ? "•••" : "REPORTING"}
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
        </div>
        
        {/* Footer */}
        <div className={cn(
          "mt-auto p-4 text-xs text-muted-foreground border-t border-gray-200 sticky bottom-0 bg-white",
          collapsed && "p-2 text-center"
        )}>
          {collapsed ? (
            <LogOut size={20} className="mx-auto text-gray-500" />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-beach-ocean flex items-center justify-center text-xs font-medium text-white">
                    JB
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Joshua Bailey</span>
                    <span className="text-[10px] text-beach-ocean">Physiotherapist</span>
                  </div>
                </div>
                <LogOut size={16} className="text-gray-500 hover:text-gray-700 cursor-pointer" />
              </div>
              <p className="mt-2">© {new Date().getFullYear()} Body in Mind Physio</p>
            </>
          )}
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
        "hover:bg-beach-sand hover:text-beach-ocean",
        isActive ? "bg-beach-sand text-beach-ocean font-medium" : "text-gray-700",
        collapsed && "justify-center px-2"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!collapsed && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="truncate">{label}</span>
            {badge && (
              <span className="bg-beach-coral text-white text-xs px-1.5 py-0.5 rounded-full">
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
