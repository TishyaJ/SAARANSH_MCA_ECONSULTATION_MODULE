import React, { useState } from "react";
import { Home, Download, Printer, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CommentModal } from "@/components/modals/CommentModal";
import { useToast } from "@/hooks/use-toast";
import goiLogo from "@/assets/goi-logo.png";

const DocumentDetails2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const { toast } = useToast();

  const documentId = 2;

  const breadcrumbItems = [
    { label: "Home", href: "#" },
    { label: "Additional Services", href: "#" },
    { label: "E-Consultation" },
  ];

  const handleSave = () => {
    toast({
      title: "Draft Saved",
      description: "Your comment has been saved as a draft.",
    });
  };

  const handleSubmit = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    toast({
      title: "Success!",
      description:
        "Your comments have been submitted for review. Thank you for your participation.",
      variant: "default",
    });
    setComment("");
    setUploadedFile(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.href = "/digital-competition-bill-2025.pdf"; // update path if needed
    link.download = "digital-competition-bill-2025.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPdfInNewTab = () => {
    window.open(
      "/digital-competition-bill-2025.pdf",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-4">
          <Home className="h-5 w-5 mr-2" />
          <h1 className="text-2xl font-bold">E-Consultation</h1>
        </div>

        <h2 className="text-xl font-semibold mb-6">
          Digital Competition Bill, 2025
        </h2>

        <Tabs defaultValue="document-details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="public-notice">Public Notice</TabsTrigger>
            <TabsTrigger value="instruction-kit">Instruction Kit</TabsTrigger>
            <TabsTrigger value="document-details">
              Document details and comments
            </TabsTrigger>
          </TabsList>

          {/* PUBLIC NOTICE TAB */}
          <TabsContent value="public-notice" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Public Notice – Digital Competition Bill, 2025
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPdf}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPdfViewer(!showPdfViewer)}
                    >
                      {showPdfViewer ? "Hide PDF" : "View PDF"}
                    </Button>
                  </div>
                </div>

                {showPdfViewer ? (
                  <div className="bg-white rounded-lg border min-h-96">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h4 className="text-lg font-medium">
                        Digital Competition Bill, 2025
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPdfViewer(false)}
                      >
                        Close Viewer
                      </Button>
                    </div>
                    <div className="h-96">
                      <iframe
                        src="/digital-competition-bill-2025.pdf"
                        className="w-full h-full border-0"
                        title="Digital Competition Bill, 2025"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 min-h-96">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl text-gray-400 mb-4">📄</div>
                        <h4 className="text-lg font-medium mb-2">
                          Digital Competition Bill, 2025
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Public consultation on the proposed law to regulate
                          Systemically Significant Digital Enterprises (SSDEs)
                          and ensure fair competition in India&apos;s digital
                          markets.
                        </p>
                        <div className="space-y-2">
                          <Button
                            className="bg-gov-blue hover:bg-gov-blue-dark w-full"
                            onClick={() => setShowPdfViewer(true)}
                          >
                            View Document
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleViewPdfInNewTab}
                          >
                            Open in New Tab
                          </Button>
                          <p className="text-xs text-gray-500">
                            Click to view the official consultation document of
                            the Digital Competition Bill, 2025.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  NOTE: Stakeholders are requested to carefully review the
                  provisions of the Digital Competition Bill, 2025 and provide
                  focused, section-wise comments through this E-Consultation
                  module.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INSTRUCTION KIT TAB – you can paste your existing long content here */}
          <TabsContent value="instruction-kit" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {/* Keep your existing instruction-kit JSX here (same as other detail page) */}
                <div className="bg-gov-light-blue rounded-lg p-6">
                  {/* ... full instruction kit content ... */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 flex items-center justify-center mr-4">
                        <img
                          src={goiLogo}
                          alt="Government of India"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gov-blue">
                          MINISTRY OF
                        </h3>
                        <h3 className="text-lg font-bold text-gov-blue">
                          CORPORATE AFFAIRS
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          GOVERNMENT OF INDIA
                        </p>
                      </div>
                    </div>
                    {/* ... rest of your instruction kit sections ... */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENT DETAILS & COMMENTS TAB */}
          <TabsContent value="document-details" className="mt-6">
            <div className="flex items-center justify-end mb-4 space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>

            <Card className="mb-6 border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Document ID
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      DCB_2025_01
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type of Document
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      Draft Bill / Report
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Name of Act
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      Digital Competition Bill, 2025
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Posted On
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      26 November 2025
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comments due date
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      29 December 2025
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Document Name
                  </label>
                  <p className="text-lg font-medium text-gray-900 leading-relaxed">
                    Report on the Digital Competition Bill, 2025 – public
                    consultation on regulating Systemically Significant Digital
                    Enterprises (SSDEs) and strengthening competition in
                    India&apos;s digital economy.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MAIN DOCUMENT CONTENT (shortened for brevity) */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <section>
                        <p>
                          The Digital Competition Bill, 2024/2025 is a
                          comprehensive legislative proposal developed to
                          address rising concerns about market dominance, data
                          concentration, and anti-competitive practices in
                          India&apos;s rapidly expanding digital economy. The
                          bill, guided by recommendations from the Committee on
                          Digital Competition Law (CDCL), seeks to regulate
                          large digital platforms—also referred to as
                          “Systemically Significant Digital Enterprises”
                          (SSDEs)—and ensure they operate in a fair,
                          competitive, and transparent manner.
                        </p>

                        <h3>1. Classification of Systemically Significant Digital Enterprises (SSDEs)</h3>
                        <p>
                          The bill identifies large digital companies with
                          enormous influence on markets, data, and user
                          behavior. These are classified as “Systemically
                          Significant Digital Enterprises.” Criteria include:
                        </p>
                        <ul>
                          <li>High user base and platform dependence</li>
                          <li>Dominant position in at least one core digital service</li>
                          <li>Significant financial strength or market capitalization</li>
                          <li>Control of critical data assets or digital infrastructure</li>
                          <li>Ability to influence business users or consumers at scale</li>
                        </ul>
                        <p>
                          Core digital services include social media,
                          e-commerce marketplaces, app stores, search engines,
                          online advertising, communication services, digital
                          payments, cloud services, and mobility platforms. Once
                          designated as an SSDE, a digital enterprise must
                          comply with stricter obligations aimed at ensuring
                          fair competition.
                        </p>

                        <h3>2. Prohibited Conduct for SSDEs</h3>
                        <p>The bill outlines activities SSDEs cannot engage in:</p>
                        <ul>
                          <li>Self-preferencing of their own products or services</li>
                          <li>Using business-user data to compete unfairly</li>
                          <li>Anti-steering that prevents alternative payment options</li>
                          <li>Exclusive contracts that limit competition</li>
                          <li>Blocking interoperability with competing services</li>
                          <li>Shadow banning and manipulative ranking algorithms</li>
                          <li>Deep discounting to eliminate competitors</li>
                          <li>Bundling that forces additional products or services</li>
                        </ul>

                        <h3>3. Positive Obligations for SSDEs</h3>
                        <p>
                          Alongside restrictions, the bill mandates positive
                          steps to increase fairness and transparency:
                        </p>
                        <ul>
                          <li>Mandatory transparency reports on algorithms</li>
                          <li>Clear disclosures on ranking and recommendation criteria</li>
                          <li>Data portability for users and businesses</li>
                          <li>Interoperability requirements for messaging and payments</li>
                          <li>Fair access rules for app developers on app stores</li>
                          <li>Non-discriminatory terms for marketplace sellers</li>
                          <li>Allowing third-party payment systems on platforms</li>
                          <li>Transparent advertising metrics and reporting</li>
                        </ul>

                        <h3>4. Data Protection, User Rights &amp; Accountability</h3>
                        <p>
                          The bill complements the DPDP Act by ensuring users
                          maintain control over their data and preventing
                          unfair cross-use of data that could enable dominance.
                          Key measures include:
                        </p>
                        <ul>
                          <li>Restrictions on combining data across services without consent</li>
                          <li>Transparent information to users about data usage</li>
                          <li>Requirements for compliance officers and third-party audits</li>
                          <li>Regular risk assessments and published transparency disclosures</li>
                        </ul>

                        <h3>5. Impact on Startups &amp; MSMEs</h3>
                        <p>
                          The bill aims to level the playing field for startups
                          and micro, small, and medium enterprises by:
                        </p>
                        <ul>
                          <li>Reducing dependency on platform-dictated pricing</li>
                          <li>Allowing freedom to choose payment methods</li>
                          <li>Increasing visibility without algorithmic manipulation</li>
                          <li>Providing access to data generated by their customers</li>
                          <li>Protecting against sudden policy or algorithm changes</li>
                        </ul>

                        <h3>6. Enforcement Mechanism</h3>
                        <p>
                          Enforcement would be handled by a specialized unit
                          within the Competition Commission of India (CCI).
                          The bill provides for a range of enforcement tools:
                        </p>
                        <ul>
                          <li>Monetary penalties based on turnover or global revenue</li>
                          <li>Behavioral and structural remedies</li>
                          <li>Orders for platform redesign and mandatory audits</li>
                          <li>Public disclosure of violations to raise awareness</li>
                        </ul>

                        <h3>7. Stakeholder Concerns &amp; Industry Feedback</h3>
                        <p>
                          During consultations stakeholders raised a mix of
                          concerns and suggestions:
                        </p>
                        <ul>
                          <li>Large platforms warn against overly prescriptive rules</li>
                          <li>App developers support anti-steering and transparency</li>
                          <li>Startups favour level-playing-field measures</li>
                          <li>Industry groups seek clearer SSDE thresholds</li>
                          <li>Economists advise balancing oversight with innovation</li>
                        </ul>

                        <h3>8. Expected Outcomes</h3>
                        <p>
                          The bill is intended to:
                        </p>
                        <ul>
                          <li>Foster fair competition and prevent monopolistic behaviour</li>
                          <li>Reduce entry barriers for new digital businesses</li>
                          <li>Increase consumer choice and platform transparency</li>
                          <li>Promote ethical data use and interoperability</li>
                          <li>Encourage innovation by reducing anti-competitive barriers</li>
                        </ul>

                        <h3>Related Reform</h3>
                        <p>
                          The Corporate Governance &amp; Disclosure Standards
                          Reform Bill, 2025 complements this initiative by
                          strengthening board independence, improving beneficial
                          ownership transparency, mandating standardised ESG
                          reporting, and enhancing whistleblower protections.
                        </p>

                        <p>
                          <strong>Report posted on:</strong> 26 November 2025 —
                          <strong>Comments due:</strong> 29 December 2025.
                        </p>
                      </section>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* COMMENT FORM */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-sm font-semibold">
                            Attach a file to this Document
                          </h3>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                        <label htmlFor="file-upload" className="w-full">
                          <Button
                            variant="outline"
                            className="w-full"
                            asChild
                          >
                            <span>Choose File</span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {uploadedFile && (
                          <p className="text-sm text-gov-blue mt-2">
                            Selected: {uploadedFile.name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word Doc, PNG, JPEG (max 25 MB)
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          Section
                        </label>
                        <Select
                          value={selectedSection}
                          onValueChange={setSelectedSection}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a chapter or section to comment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ssde-classification">
                              Chapter 1 – SSDE Classification
                            </SelectItem>
                            <SelectItem value="prohibited-conduct">
                              Chapter 2 – Prohibited Conduct
                            </SelectItem>
                            <SelectItem value="obligations">
                              Chapter 3 – Positive Obligations
                            </SelectItem>
                            <SelectItem value="data-governance">
                              Chapter 4 – Data & Accountability
                            </SelectItem>
                            <SelectItem value="startups-msmes">
                              Chapter 5 – Startups & MSMEs
                            </SelectItem>
                            <SelectItem value="enforcement">
                              Chapter 6 – Enforcement Mechanism
                            </SelectItem>
                            <SelectItem value="stakeholder-feedback">
                              Chapter 7 – Stakeholder Feedback
                            </SelectItem>
                            <SelectItem value="outcomes">
                              Chapter 8 – Expected Outcomes
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          Add Comments
                        </label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Enter comment here..."
                          className="min-h-32"
                        />
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-gov-blue">
                            Show reference information
                          </summary>
                          <div className="mt-2 max-h-64 overflow-auto border rounded p-3 text-xs leading-5 space-y-2 bg-gray-50">
                            {/* short reference summary */}
                            <p>
                              The Digital Competition Bill, 2024/2025 addresses
                              market dominance, data concentration and
                              anti-competitive practices in India&apos;s digital
                              economy by regulating Systemically Significant
                              Digital Enterprises (SSDEs) through an ex-ante
                              framework.
                            </p>
                            <p>
                              Stakeholders are encouraged to provide
                              section-wise suggestions, including alternative
                              formulations, safeguards, and implementation
                              challenges.
                            </p>
                          </div>
                        </details>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          onClick={handleSave}
                          className="flex-1"
                        >
                          SAVE
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          className="flex-1 bg-gov-blue hover:bg-gov-blue-dark"
                        >
                          SUBMIT
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              NOTE: Stakeholders must ensure that relevant comments are provided
              against the selected chapter/section. It is mandatory to save
              every comment entered for each selected section before submitting
              an E-Consultation response.
            </p>
          </TabsContent>
        </Tabs>
      </main>

      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        comment={comment}
        uploadedFile={uploadedFile}
        documentId={documentId}
        section={selectedSection}
      />
    </div>
  );
};

export default DocumentDetails2;
