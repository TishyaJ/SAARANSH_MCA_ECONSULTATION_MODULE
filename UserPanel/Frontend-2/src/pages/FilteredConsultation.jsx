import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FilteredConsultation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filter = searchParams.get("filter");
  const count = parseInt(searchParams.get("count")) || 0;

  const breadcrumbItems = [
    { label: "Home", href: "/econsultation-landing" },
    { label: "Additional Services", href: "#" },
    { label: "E-Consultation", href: "/" },
    { label: getFilterTitle(filter) }
  ];

  const documents = [
    {
      id: "J34I_D",
      title: "Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt of India",
      postedOn: "2025-09-17",
      commentsDue: "2025-09-30",
      type: "Report",
      bucket: "posted-earlier", // posted-today | posted-last7days | posted-earlier
    },
  ];

  function filterDocuments(items, filter) {
    switch (filter) {
      case "posted-today":
        return items.filter((d) => d.bucket === "posted-today");
      case "posted-last7days":
        return items.filter((d) => d.bucket === "posted-last7days");
      case "posted-earlier":
        return items.filter((d) => d.bucket === "posted-earlier");
      case "today":
      case "next7days":
      default:
        return items;
    }
  }

  const filtered = filterDocuments(documents, filter);

  function getFilterTitle(filter) {
    switch(filter) {
      case "today": return "Today";
      case "next7days": return "Next 7 Days";
      case "posted-today": return "Posted Today";
      case "posted-last7days": return "Posted Last 7 Days";
      case "posted-earlier": return "Posted Earlier";
      default: return "Filtered Results";
    }
  }

  const handleBackClick = () => {
    navigate("/");
  };

  const handleCommentClick = () => {
    navigate("/document-details");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Home className="h-5 w-5 mr-2" />
          <h1 className="text-2xl font-bold">E-Consultation - {getFilterTitle(filter)}</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Documents for {getFilterTitle(filter)}</h2>
            
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents open for consultation</h3>
                <p className="text-gray-500">There are currently no documents available for consultation in this time period.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="mb-1">
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{doc.type}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{doc.title}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Posted On: {new Date(doc.postedOn).toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            <p>Comments due date: {new Date(doc.commentsDue).toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleCommentClick}
                          className="bg-gov-blue hover:bg-gov-blue-dark text-white"
                        >
                          Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FilteredConsultation;