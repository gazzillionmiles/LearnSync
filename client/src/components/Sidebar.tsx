import { Link, useLocation } from "wouter";
import { useProgress } from "../contexts/ProgressContext";
import { Module } from "@shared/types";
import { LucideCode, LucideLayout, LucideTrophy, LucideLogOut } from "lucide-react";
import { Logo } from "@/lib/icons";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useModules } from "../hooks/useModules";

interface SidebarProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileSidebarOpen, setMobileSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  const { getTotalPoints } = useProgress();
  
  const { modules, isLoadingModules: isLoading, modulesError: error } = useModules();

  // Helper to determine if a route is active
  const isActive = (path: string) => {
    if (!path) return false;
    return location === path;
  };

  // Helper to determine if a module is active
  const isModuleActive = (moduleId: string) => {
    if (!moduleId) return false;
    return location === `/module/${moduleId}`;
  };

  // Get module progress
  const { getModuleProgress } = useProgress();

  // Mobile sidebar component with close button
  const MobileSidebar = (
    <div 
      className={`fixed inset-0 z-40 transform md:hidden ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
    >
      <div className="bg-primary text-white w-64 h-full overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <Logo className="h-8 w-8" />
              <h1 className="text-xl font-bold">PromptMaster AI</h1>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <SidebarContent 
            modules={modules} 
            isActive={isActive} 
            isModuleActive={isModuleActive} 
            getModuleProgress={getModuleProgress} 
            onClick={() => setMobileSidebarOpen(false)}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
      <div 
        className="bg-gray-900 bg-opacity-50 absolute inset-0 -z-10"
        onClick={() => setMobileSidebarOpen(false)}
      ></div>
    </div>
  );

  // Sidebar Content
  const content = (
    <div className="p-4">
      <div className="flex items-center justify-center space-x-2 mb-8">
        <Logo className="h-8 w-8" />
        <h1 className="text-xl font-bold">PromptMaster AI</h1>
      </div>

      <SidebarContent 
        modules={modules} 
        isActive={isActive} 
        isModuleActive={isModuleActive} 
        getModuleProgress={getModuleProgress} 
        isLoading={isLoading}
        error={error}
      />
      
      <div className="p-4 absolute bottom-0 w-64 border-t border-primary-500">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-300 flex items-center justify-center text-primary-700 font-bold">
            T
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="bg-primary text-white w-64 flex-shrink-0 overflow-y-auto md:block hidden">
        {content}
      </aside>
      
      {/* Mobile Sidebar */}
      {MobileSidebar}
    </>
  );
}

interface SidebarContentProps {
  modules: Module[];
  isActive: (path: string) => boolean;
  isModuleActive: (moduleId: string) => boolean;
  getModuleProgress: (moduleId: string) => { completed: number; total: number };
  onClick?: () => void;
  isLoading: boolean;
  error: unknown;
}

function SidebarContent({ modules, isActive, isModuleActive, getModuleProgress, onClick, isLoading, error }: SidebarContentProps) {
  const { user, logout } = useAuth();
  const { getTotalPoints } = useProgress();
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load modules. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Link 
        to="/"
        onClick={onClick}
        className={`block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10 ${
          isActive('/') ? 'bg-white bg-opacity-20' : ''
        }`}
      >
        <div className="flex items-center">
          <LucideLayout className="h-4 w-4 mr-2" />
          <span>Dashboard</span>
        </div>
      </Link>

      <h3 className="text-sm uppercase text-gray-200 font-semibold mt-6 mb-2 px-4">Learning Modules</h3>
      
      {modules && modules.length > 0 ? (
        modules.map((module: Module) => {
          if (!module?.id) return null;
          const progress = getModuleProgress(module.id);
          
          return (
            <Link 
              key={module.id}
              to={`/module/${module.id}`}
              onClick={onClick}
              className={`block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10 ${
                isModuleActive(module.id) ? 'bg-white bg-opacity-20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LucideCode className="h-4 w-4 mr-2" />
                  <span>{module.title || 'Untitled Module'}</span>
                </div>
                {progress?.completed > 0 && (
                  <span className="ml-2 text-xs bg-primary-300 text-primary-800 px-1.5 py-0.5 rounded-full">
                    {progress.completed}/{progress.total}
                  </span>
                )}
              </div>
            </Link>
          );
        })
      ) : (
        <div className="px-4 text-sm text-gray-300">No modules available</div>
      )}

      <Link 
        to="/leaderboard"
        onClick={onClick}
        className={`block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10 ${
          isActive('/leaderboard') ? 'bg-white bg-opacity-20' : ''
        }`}
      >
        <div className="flex items-center">
          <LucideTrophy className="h-4 w-4 mr-2" />
          <span>Leaderboard</span>
        </div>
      </Link>

      {user && (
        <button
          onClick={() => {
            logout();
            if (onClick) onClick();
          }}
          className="block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10"
        >
          <div className="flex items-center">
            <LucideLogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </div>
        </button>
      )}
    </div>
  );
}
