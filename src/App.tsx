
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import Settings from "./pages/Settings";
import SMSTemplates from "./pages/SMSTemplates";
import SMSReplies from "./pages/SMSReplies";
import Analytics from "./pages/Analytics";
import WorkCover from "./pages/WorkCover";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sms" element={<SMSTemplates />} />
            <Route path="/sms/replies" element={<SMSReplies />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/workcover" element={<WorkCover />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
