/**
 * AppLayout - Main application layout with sidebar + topbar
 * Design: White sidebar, indigo active states, clean topbar
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard, Briefcase, Users, Calendar, Zap,
  BarChart3, Settings, Brain, ChevronLeft, ChevronRight,
  Bell, Search, LogOut, ChevronDown, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "工作台", path: "/dashboard" },
  { icon: Briefcase, label: "职位管理", path: "/jobs" },
  { icon: Users, label: "候选人", path: "/candidates" },
  { icon: Calendar, label: "面试管理", path: "/interviews" },
  { icon: Zap, label: "Skill Hub", path: "/skill-hub" },
  { icon: BarChart3, label: "数据看板", path: "/analytics" },
  { icon: Settings, label: "设置", path: "/settings" },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: { label: string; path?: string }[];
}

export default function AppLayout({ children, title, breadcrumb }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    const stored = localStorage.getItem("hule_user");
    if (!stored) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    toast.success("已退出登录");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === path;
    return location.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            葫乐<span className="ai-gradient-text">AI</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-indigo-600" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      {!collapsed && user && (
        <div className="px-3 py-4 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {user.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{user.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user.company || "葫乐科技"}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                账户设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronLeft className="w-3 h-3 text-gray-500" />}
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col relative bg-white border-r border-gray-100 sidebar-transition flex-shrink-0 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-56 bg-white border-r border-gray-100 h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 h-14 flex items-center gap-4 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            {breadcrumb && breadcrumb.length > 0 ? (
              <div className="flex items-center gap-1.5 text-sm">
                {breadcrumb.map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-gray-300">/</span>}
                    {item.path ? (
                      <button
                        onClick={() => navigate(item.path!)}
                        className="text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <span className="text-gray-900 font-medium">{item.label}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : title ? (
              <h1 className="text-base font-semibold text-gray-900">{title}</h1>
            ) : null}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-500 hover:text-gray-700">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            {user && (
              <Avatar className="w-7 h-7 cursor-pointer" onClick={() => navigate("/settings")}>
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                  {user.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
