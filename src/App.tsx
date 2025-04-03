
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Patients from "./pages/Patients";
import Settings from "./pages/Settings";
import SMSTemplates from "./pages/SMSTemplates";
import Analytics from "./pages/Analytics";
import WorkCover from "./pages/WorkCover";
import BookingGaps from "./pages/BookingGaps";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sms" element={<SMSTemplates />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/workcover" element={<WorkCover />} />
          <Route path="/booking-gaps" element={<BookingGaps />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
