import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, History, Lightbulb, User, Cloud, RefreshCw } from "lucide-react";
import { THEME } from "../constants";

export function Layout({ children, isSyncing }: { children: React.ReactNode, isSyncing?: boolean }) {
  const location = useLocation();

  const tabs = [
    { name: "Observation", icon: Home, path: "/" },
    { name: "History", icon: History, path: "/history" },
    { name: "Insights", icon: Lightbulb, path: "/insights" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* Header */}
      <header className="px-8 py-4 flex flex-col md:flex-row justify-between items-center bg-white border-b border-border sticky top-0 z-50 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white">
              <div className="font-bold text-lg">B</div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">Bloom</h1>
          </Link>

          <div className="md:hidden flex items-center gap-4 bg-light-accent px-3 py-1.5 rounded-full border border-border">
             <div className="w-5 h-5 bg-secondary/30 rounded-full flex items-center justify-center font-bold text-primary text-[10px] uppercase">?</div>
             <div className="text-[10px] font-medium text-text">Parent</div>
          </div>
        </div>

        <nav className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-white text-primary shadow-sm ring-1 ring-border" 
                    : "text-muted hover:text-primary transition-colors"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{tab.name === "Observation" ? "Home" : tab.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="hidden md:flex items-center gap-4 bg-light-accent px-4 py-2 rounded-full border border-border">
           {isSyncing ? (
             <div className="flex items-center gap-2 text-primary animate-pulse">
               <RefreshCw size={12} className="animate-spin" />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Syncing Cloud</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-muted">
               <Cloud size={12} />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Stored in Cloud</span>
             </div>
           )}
           <div className="w-6 h-6 bg-secondary/30 rounded-full flex items-center justify-center font-bold text-primary text-xs uppercase">?</div>
           <div className="text-xs font-medium text-text">Parent Dashboard</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl">
        {children}
      </main>

      {/* Footer from design */}
      <footer className="px-8 py-3 bg-light-accent text-center border-t border-border mt-auto">
        <p className="text-[10px] text-muted font-medium uppercase tracking-widest">Child Development Strategist AI System • Bloom</p>
      </footer>
    </div>
  );
}
