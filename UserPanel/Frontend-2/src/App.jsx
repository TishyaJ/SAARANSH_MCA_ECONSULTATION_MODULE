import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EConsultationLanding from "./pages/EConsultationLanding";
import ConsultationListing from "./pages/ConsultationListing";
import FilteredConsultation from "./pages/FilteredConsultation";
import DocumentDetails from "./pages/DocumentDetails";
import DocumentDetails2 from "./pages/DocumentDetails2";
import DocumentDetails3 from "./pages/DocumentDetails3";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EConsultationLanding />} />
          <Route path="/consultation-listing" element={<ConsultationListing />} />
          <Route path="/filtered-consultation" element={<FilteredConsultation />} />
          <Route path="/document-details" element={<DocumentDetails />} />
          <Route path="/document-details2" element={<DocumentDetails2 />} />
          <Route path="/document-details3" element={<DocumentDetails3 />} />
          <Route path="/econsultation-landing" element={<EConsultationLanding />} />
          <Route path="/demo" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;