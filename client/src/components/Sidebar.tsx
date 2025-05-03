import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useProgress } from "@/hooks/useProgress";
import { Module } from "@shared/types";
import { LucideCode, LucideLayout, LucideTrophy } from "lucide-react";
import { Logo } from "@/lib/icons";

interface SidebarProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileSidebarOpen, setMobileSidebarOpen }: SidebarProps) {
  const [location] = useLocation();
  const { getTotalPoints } = useProgress();
  
  const { data: modules = [] } = useQuery<Module[]>({ 
    queryKey: ['/api/modules'],
  });

  // Helper to determine if a route is active
  const isActive = (path: string) => {
    return location === path;
  };

  // Helper to determine if a module is active
  const isModuleActive = (moduleId: string) => {
    return location === `/modules/${moduleId}`;
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
      />
      
      <div className="p-4 absolute bottom-0 w-64 border-t border-primary-500">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-300 flex items-center justify-center text-primary-700 font-bold">
            T
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Test User</p>
            <p className="text-xs text-gray-300">{getTotalPoints()} points</p>
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
}

function SidebarContent({ modules, isActive, isModuleActive, getModuleProgress, onClick }: SidebarContentProps) {
  return (
    <div className="space-y-1">
      <Link 
        href="/"
        onClick={onClick}
      >
        <div 
          className={`block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10 ${
            isActive('/') ? 'bg-white bg-opacity-20' : ''
          }`}
        >
          <div className="flex items-center">
            <LucideLayout className="h-4 w-4 mr-2" />
            <span>Dashboard</span>
          </div>
        </div>
      </Link>

      <h3 className="text-sm uppercase text-gray-200 font-semibold mt-6 mb-2 px-4">Learning Modules</h3>
      
      {modules.map(module => {
        const progress = getModuleProgress(module.id);
        
        return (
          <Link 
            key={module.id}
            href={`/modules/${module.id}`}
            onClick={onClick}
          >
            <div 
              className={`block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10 ${
                isModuleActive(module.id) ? 'bg-white bg-opacity-20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LucideCode className="h-4 w-4 mr-2" />
                  <span>{module.title}</span>
                </div>
                {progress.completed > 0 && (
                  <span className="ml-2 text-xs bg-primary-300 text-primary-800 px-1.5 py-0.5 rounded-full">
                    {progress.completed}/{progress.total}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}

      <h3 className="text-sm uppercase text-gray-200 font-semibold mt-6 mb-2 px-4">Platform</h3>
      
      <Link 
        href="/leaderboard"
        onClick={onClick}
      >
        <div 
          className={`block w-full py-2 px-4 rounded-md text-left font-medium hover:bg-white hover:bg-opacity-10 ${
            isActive('/leaderboard') ? 'bg-white bg-opacity-20' : ''
          }`}
        >
          <div className="flex items-center">
            <LucideTrophy className="h-4 w-4 mr-2" />
            <span>Leaderboard</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
