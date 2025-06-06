import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { ProgressProvider } from "./contexts/ProgressContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ModulePage from "@/pages/ModulePage";
import Leaderboard from "@/pages/Leaderboard";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

function Router() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        mobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Mobile Nav Toggle */}
        <div className="bg-primary text-white p-4 md:hidden flex items-center">
          <button 
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
            className="focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold ml-3">PromptMaster AI</h1>
        </div>

        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/modules/:moduleId" component={ModulePage} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <TooltipProvider>
        <ProgressProvider>
          <Toaster />
          <Router />
        </ProgressProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
