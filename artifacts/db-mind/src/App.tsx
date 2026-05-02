import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import UploadPage from "@/pages/upload";
import SessionPage from "@/pages/session";
import { MigrationProvider } from "@/context/MigrationContext";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={UploadPage} />
      <Route path="/session/:id" component={SessionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Ensure theme is dark
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MigrationProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </MigrationProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
