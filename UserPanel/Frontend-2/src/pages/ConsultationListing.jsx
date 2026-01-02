import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ConsultationListing = () => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Home", href: "/econsultation-landing" },
    { label: "Additional Services", href: "#" },
    { label: "E-Consultation" }
  ];

  const handleCommentClick = () => {
    navigate("/document-details");
  };
  const handleCommentClick2 = () => {
    navigate("/document-details2");
  };
  const handleCommentClick3 = () => {
    navigate("/document-details3");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb items={breadcrumbItems} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Home className="h-5 w-5 mr-2" />
            <h1 className="text-2xl font-bold">E-Consultation</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10 w-64" 
                placeholder="Search E-Consultation"
              />
            </div>
            <Button variant="link" className="text-gov-blue">Refine Search</Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Beyond 7 Days</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by</span>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-gov-light-blue/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    Report
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Establishment of Indian Multi-Disciplinary Partnership (MDP) firms
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Posted on: 25-Nov-2025 | J34I_D
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Comments Due on: 28-Dec-2025
                  </div>
                </div>
              </div>
              
              <div className="ml-6">
                <Button 
                  onClick={handleCommentClick}
                  className="bg-gov-blue hover:bg-gov-blue-dark"
                >
                  Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card className="bg-gov-light-blue/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    Report
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Digital Competition Bill, 2025
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Posted on: 26-Nov-2025 | J34I_F
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Comments Due on: 29-Dec-2025
                  </div>
                </div>
              </div>
              
              <div className="ml-6">
                <Button 
                  onClick={handleCommentClick2}
                  className="bg-gov-blue hover:bg-gov-blue-dark"
                >
                  Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      <Card className="bg-gov-light-blue/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    Amendment
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Companies Amendment Bill, 2025
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Posted on: 27-Nov-2025 | J34I_G
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Comments Due on: 30-Dec-2025
                  </div>
                </div>
              </div>
              
              <div className="ml-6">
                <Button 
                  onClick={handleCommentClick3}
                  className="bg-gov-blue hover:bg-gov-blue-dark"
                >
                  Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};



export default ConsultationListing;