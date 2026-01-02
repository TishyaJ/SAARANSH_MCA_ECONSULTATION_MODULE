import React, { useState, useEffect, useRef } from "react";
import { Home, Download, Printer, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommentModal } from "@/components/modals/CommentModal";
import { useToast } from "@/hooks/use-toast";
import goiLogo from "@/assets/goi-logo.png";

const DocumentDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const initialSections = [
    { id: 1, title: 'Objective', text: 'The Government of India and MCA aim to build globally competitive Indian Multi-Disciplinary Partnership (MDP) firms in consulting and auditing, reducing dependence on multinational firms and supporting Atmanirbhar Bharat.' },
    { id: 2, title: 'Background Gaps', text: 'A Background Note highlights gaps between Indian firms and large international networks in scale, branding, technology, integration of services, and talent investment.' },
    { id: 3, title: 'Strengths of International Firms', text: 'International firms use multidisciplinary models, global networks, strong brands, partnership structures, advanced technology platforms, and substantial investment in talent and training.' },
    { id: 4, title: 'Regulatory Barriers', text: 'Current Indian regulations limit growth—restrictions on advertising/branding, narrow MDP rules, fragmented licensing across professions, procurement norms that favor global players, and the broad "Indian" definition in procurement orders.' },
    { id: 5, title: 'Recent Reforms', text: 'RBI and ICAI have introduced measures (e.g., audit diversification, joint audits, and enabling combinations) to open opportunities for larger Indian firms, but structural reforms remain necessary.' },
    { id: 6, title: 'Proposed Changes', text: 'Simplify mergers under Section 233 where appropriate, revisit professional regulation and MDP eligibility, reform procurement criteria to level the playing field, and clarify the definition of "Indian" for public procurement.' },
    { id: 7, title: 'Consultation Topics', text: 'The paper requests section-wise feedback on regulatory amendments, safeguards for MDPs, dispute resolution mechanisms, brand-building without unethical solicitation, international best practices, and measures to improve global competitiveness.' },
    { id: 8, title: 'Outcome Goal', text: 'Enable Indian firms to scale, innovate, and build global brands across audit, advisory, ESG, and multidisciplinary consultancy services while maintaining professional ethics and investor protections.' }
  ];

  const [sections, setSections] = useState(initialSections);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(4.2);
  const [originalSections] = useState(initialSections);
  const [selectedLang, setSelectedLang] = useState('en');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const { toast } = useToast();

  // Document ID - hardcoded to 1 for now, can be dynamic from route params
  const documentId = 1;

  const breadcrumbItems = [
    { label: "Home", href: "#" },
    { label: "Additional Services", href: "#" },
    { label: "E-Consultation" }
  ];

  const handleSave = () => {
    toast({
      title: "Draft Saved",
      description: "Your comment has been saved as a draft."
    });
  };

  const handleSubmit = () => {
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    toast({
      title: "Success!",
      description: "Your comments have been submitted for review. Thank you for your participation.",
      variant: "default"
    });
    setComment("");
    setUploadedFile(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`
      });
    }
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/publicnotice.pdf';
    link.download = 'publicnotice.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewPdfInNewTab = () => {
    window.open('/publicnotice.pdf', '_blank', 'noopener,noreferrer');
  };

  // Fetch summary and confidence score from API (multilingual support)
  const fetchSummaryLang = async (lang) => {
    setSummaryLoading(true);
    try {
      const url = `/api/documents/${documentId}/summary?lang=${encodeURIComponent(lang)}`;
      const res = await fetch(url, { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!res.ok) {
        let msg = 'Server did not return a translated summary.';
        try {
          const errBody = await res.json();
          if (errBody && errBody.message) msg = errBody.message;
        } catch (e) {}
        console.warn('Summary API returned non-ok status', res.status, msg);
        toast({ title: 'Translation unavailable', description: msg });
        return;
      }
      const data = await res.json();
      // Expecting { sections: [{id,title,text,audioUrl}], confidence }
      if (data && data.sections && Array.isArray(data.sections)) {
        setSections(data.sections);
        if (data.confidence != null) setConfidenceScore(data.confidence);
      } else if (data && data.summary) {
        // backward compatibility: single summary returned
        setSections([{ id: 1, title: 'Summary', text: data.summary, audioUrl: data.audioUrl }]);
        if (data.confidence != null) setConfidenceScore(data.confidence);
      } else {
        toast({ title: 'Translation unavailable', description: 'No translated content returned.' });
      }
    } catch (err) {
      console.error('Summary fetch error', err);
      toast({ title: 'Translation error', description: 'Could not reach translation service. Please check the backend server.' });
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch (use default language)
    fetchSummaryLang(selectedLang).catch(() => {});
    return () => { if (audioRef.current) { audioRef.current.pause?.(); audioRef.current = null; } };
  }, [documentId]);

  // attempt translation via public LibreTranslate endpoints (best-effort)
  // NOTE: translation is handled by the backend mock or a paid provider configured on the server.

  const playAudio = (audioUrl, text) => {
    stopAudio();
    if (audioUrl) {
      try {
          audioRef.current = new Audio(audioUrl);
          // allow cross-origin audio where possible
          try { audioRef.current.crossOrigin = 'anonymous'; } catch(e) {}
          audioRef.current.onended = () => setAudioPlaying(false);
          audioRef.current.onerror = (ev) => {
            console.error('Audio element error', ev, audioUrl);
            toast({ title: 'Audio playback failed', description: 'Could not play audio from server. Falling back to speech synthesis.' });
            setAudioPlaying(false);
            // fallback to TTS below
          };
          const playPromise = audioRef.current.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(() => setAudioPlaying(true)).catch((err) => {
              console.warn('Audio play promise rejected', err);
              toast({ title: 'Audio blocked', description: 'Browser prevented audio playback. Interact with the page and try again.' });
            });
          } else {
            setAudioPlaying(true);
          }
          return;
        } catch (e) {
          console.warn('Audio play failed, falling back to TTS', e);
        }
    }

    // Fallback to Web Speech API
    if (text && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      const langCode = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'es' ? 'es-ES' : selectedLang === 'ta' ? 'ta-IN' : 'en-US';
      utter.lang = langCode;
      utter.onend = () => setAudioPlaying(false);
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
      setAudioPlaying(true);
      return;
    }

    toast({ title: 'Audio not supported', description: 'No audio available and speech synthesis is unavailable.' });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      try { audioRef.current.pause(); audioRef.current.currentTime = 0; } catch (e) {}
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setAudioPlaying(false);
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
          Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt of India
        </h2>

        <Tabs defaultValue="document-details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="public-notice">Public Notice</TabsTrigger>
            <TabsTrigger value="instruction-kit">Instruction Kit</TabsTrigger>
            <TabsTrigger value="document-details">Document details and comments</TabsTrigger>
          </TabsList>

          <TabsContent value="public-notice" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Public Notice Document</h3>
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
                      {showPdfViewer ? 'Hide PDF' : 'View PDF'}
                    </Button>
                  </div>
                </div>
                {showPdfViewer ? (
                  <div className="bg-white rounded-lg border min-h-96">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h4 className="text-lg font-medium">Public Notice - MDP Firms</h4>
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
                        src="/publicnotice.pdf"
                        className="w-full h-full border-0"
                        title="Public Notice - MDP Firms"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 min-h-96">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl text-gray-400 mb-4">📄</div>
                        <h4 className="text-lg font-medium mb-2">Public Notice - MDP Firms</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Official public notice regarding establishment of Indian Multi-Disciplinary Partnership firms
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
                            Click to view the official public notice document
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  NOTE: Stakeholders to ensure that relevant comments are provided against their selected Section. It is mandatory to Save every comment entered for each selected Chapter before submitting an E-Consultation paper.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instruction-kit" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="bg-gov-light-blue rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 flex items-center justify-center mr-4">
                        <img src={goiLogo} alt="Government of India" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gov-blue">MINISTRY OF</h3>
                        <h3 className="text-lg font-bold text-gov-blue">CORPORATE AFFAIRS</h3>
                        <p className="text-xs text-muted-foreground">GOVERNMENT OF INDIA</p>
                      </div>
                    </div>
                    <div className="text-right mb-4">
                      <h2 className="text-base font-semibold">EMPOWERING BUSINESS, PROTECTING INVESTORS</h2>
                      <div className="flex justify-center space-x-2 text-xs mt-1">
                        <span className="text-gov-orange">REGULATOR</span>
                        <span>•</span>
                        <span className="text-gov-green">INTEGRATOR</span>
                        <span>•</span>
                        <span className="text-gov-red">FACILITATOR</span>
                        <span>•</span>
                        <span className="text-gov-blue">EDUCATOR</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold">Ministry of Corporate Affairs (MCA)</h2>
                    <h3 className="text-base font-medium mt-2">Instruction kit</h3>
                    <h3 className="text-base font-medium">E-Consultation</h3>
                    <p className="text-sm text-right mt-4">Release Date: 26 April 2021</p>
                  </div>
                  
                  <div className="text-left">
                    <h4 className="font-semibold mb-3">Table of Contents</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="text-gov-blue hover:underline cursor-pointer">• Purpose of this document</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Confidentiality</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Accessing the E-Consultation Module</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Accessing the documents for providing consultation comments/suggestions</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Instructions for submitting a public comment</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• User Profile Information and OTP Verification</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Modifying previously provided comments</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Providing Feedback (optional)</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Other Features</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Tips and Recommendations for successful submission</li>
                      <li className="text-gov-blue hover:underline cursor-pointer">• Glossary</li>
                    </ul>
                    <div className="mt-6 space-y-6 text-sm leading-6 text-muted-foreground">
                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Purpose of this document</h5>
                        <p>EConsultation module aims to provide an online platform, wherein public suggestions can be invited from various stakeholders in the form of comments and suggestions on the proposed amendments and/or draft legislations. The purpose of this instruction kit document is to help the stakeholders submit public suggestion with ease.</p>
                        <p>This document also includes important recommendations and tips to be noted for successful submission.</p>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Confidentiality</h5>
                        <p><strong>Public comments</strong> - Comments posted by one user will not be available for view by other users. It shall be viewed only by the MCA backend users.</p>
                        <p><strong>User Profile Information</strong> - The user profile information (name, contact details, etc.) provided by users while submitting a comment shall be kept confidential and will only be available to the MCA backend users.</p>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Accessing the E-Consultation Module</h5>
                        <p>To access the E-Consultation module, user needs to navigate to MCA 21 homepage and select “E-consultation module” from the homepage. Comments can be submitted by any of the following 2 methods:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Guest Access (non-registered user) without Login</li>
                          <li>Registered user can login and access the module</li>
                        </ul>
                        <p>A detailed step by step guide on E-Consultation module is available on the homepage as an Introduction video. Please click here to access the video.</p>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Accessing the documents for providing consultation comments/suggestions</h5>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>All the documents open for consultation shall be available with “Date of posting” and “Comments due date” on the home screen of E-Consultation page.</li>
                          <li>One can also use the search bar within E-Consultation module to perform keyword searches within the module in order to search for a particular document/document(s). Upon performing the keyword search, list of documents matching the search criteria shall be displayed.</li>
                          <li>The user can refine the search based on exact phrase, words, with at least one of the words or without these word(s).</li>
                          <li>Filter search results option either on the basis of posting date, document type or applicable act.</li>
                          <li>Sort search results option basis the document posting date or comment due date.</li>
                          <li>In case the registered user has subscribed to the alerts and updates, they can access the consultation document directly through the link provided in information email (once the document is uploaded).</li>
                        </ul>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Instructions for submitting a public comment</h5>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Once the relevant document is identified, select the document to comment on. A new page with respective consultation will open.</li>
                          <li>Post selecting the requisite document, the user has an option to provide their comments at document level, chapter level or section level.</li>
                          <li>At the document level - A text box for entering comments/suggestions is provided, which will be Optional.</li>
                          <li>At the chapter/section level – Select one out of the three dropdown options.</li>
                          <li>In agreement</li>
                          <li>Suggest removal of the chapter/section</li>
                          <li>Suggest modification in the chapter/section</li>
                          <li>In case “Suggest modification in the chapter/section” or “Suggest removal of the chapter/section” is selected, a text box for entering comments/suggestion is provided, which shall be Mandatory.</li>
                        </ul>
                        <p>Comment box is accessible in a separate pane on the right side of the screen. Comments can be brief or in-depth and well researched.</p>
                        <p>It is suggested that users provide their detailed comments against each section and chapter and only provide summary/high level comments at the document level.</p>
                        <p>The user can save their comments by clicking on the “Save” button at any given point of time. Please note – For guest users, the comments will be saved only for the particular session. In case the session is refreshed for any reason, the comments provided will be lost. Registered users will be able to access their saved comments at a later point of time as well.</p>
                        <p>After the user has completed providing their comments, they shall click on “Submit” option to submit comments to MCA. Before submission, a pop-up window for providing optional supporting attachment shall appear. Please note - Attachment should not exceed the maximum size limit of 25 MB and the acceptable formats are PDF, DOC, PNG or JPEG.</p>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">User Profile Information and OTP Verification</h5>
                        <p><strong>User Profile Information</strong> - Once the comments are submitted, user profile information, such as Name, E-mail ID, Address, Name of the organization, Industry of operation etc. either in personal capacity, or professional capacity need to be provided.</p>
                        <p>In case the user has logged in through their Registered login id on MCA portal, such user profile details shall be pre-filled and non-editable. In case the user is not registered on MCA portal/not logged in, the user will be required to provide the user profile information, before the consultation comments can be submitted.</p>
                        <p><strong>OTP Verification</strong> - In case of Guest user, then validation of the email ID and mobile number shall be done through OTP. Please note – It is mandatory for the guest user to provide user profile information and then proceed for OTP verification, otherwise the consultation comments will not be recorded.</p>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Modifying previously provided comments</h5>
                        <p>Users can modify their comments on the document any number of times, till the consultation is open on a particular document. In case the user decides to modify their comments, the previous comments will be overwritten, and new comments shall be proceeded with.</p>
                        <p>Registered users will be able to see their previously submitted comments on the E-Consultation page, post logging in. They can modify their comments by accessing the relevant document. However, it will be mandatory to Submit the new comments by clicking on the “Submit” action button, before the same is recorded.</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Guest users: Guest users (users who are not registered on MCA portal or users who did not login using their Registered login id while providing comments earlier) will also be able to modify their comments using the following steps:</li>
                          <li>Proceed to provide comments on the document.</li>
                          <li>Once they have finished providing their updated comments on the document, they are required to provide the same PAN/Aadhar/CIN/FCRN/LLPIN/FLLPIN that was used while providing the initial comments.</li>
                          <li>A confirmation will be asked to overwrite the previously submitted comments. Once the user selects “Yes”, previous comments will be over-written.</li>
                        </ul>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Providing Feedback (optional)</h5>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Feedback on a scale from 1-5 can be provided. (where “5” represents completely satisfied and “1” not at all satisfied).</li>
                          <li>In case a rating between 1 to 4 is selected, optional text box to provide suggestions on improvement is available.</li>
                        </ul>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Other Features</h5>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Download - The “download” feature will allow downloading the proposed amendments/draft legislations in PDF format. If comments are provided, then proposed amendments/draft legislations, along with comments shall be downloaded.</li>
                          <li>Print - The “print” feature will allow printing the proposed amendments/draft legislations. If comments on any section are provided, then proposed amendments/draft legislations, along with the comments shall be printed.</li>
                          <li>Bookmark - In case of registered user, additional facility to bookmark any section for providing comments later is provided.</li>
                          <li>Update - In case of registered user, additional facility of updating the comments/suggestions provided in the consultation before the due date is provided.</li>
                        </ul>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Tips and Recommendations for successful submission</h5>
                        <p>These tips and recommendations are meant to help the user submit comments that are impactful and help improve rules and regulations.</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Read and understand the regulatory document you are commenting on.</li>
                          <li>Use specific examples to illustrate concerns.</li>
                          <li>The comment process is not a vote – one well supported comment is often more influential than thousand form of letters.</li>
                          <li>State clearly what you support, as well as what you disagree with.</li>
                          <li>Phrase your comments as statements, not questions, and use respectful language.</li>
                          <li>Be concise but support your claims.</li>
                          <li>You can add only one attachment. In case you have multiple documents to attach, please combine them into one and then attach.</li>
                          <li>If you have access to any facts or articles that were not included in the document, consider providing a copy.</li>
                        </ul>
                      </section>

                      <section className="space-y-2">
                        <h5 className="text-base font-semibold text-foreground">Glossary</h5>
                        <p>Key terms and abbreviations used within the E-Consultation module and this instruction kit.</p>
                      </section>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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

            {/* Document Metadata */}
            <Card className="mb-6 border-2 border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Document ID</label>
                    <p className="text-lg font-medium text-gray-900">J34I_D</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Documents</label>
                    <p className="text-lg font-medium text-gray-900">Report</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name of Act</label>
                    <p className="text-lg font-medium text-gray-900">MDP Firms Establishment</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Posted On</label>
                    <p className="text-lg font-medium text-gray-900">26 November 2025</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Comments due date</label>
                    <p className="text-lg font-medium text-gray-900">29 December 2025</p>
                  </div>
                </div>
                
                {/* Summary & Quality Score */}
                <div className="mt-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold">Summary</h4>
                          <p className="text-xs text-muted-foreground">Concise summary (multilingual) and audio playback</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs mr-2">Language</label>
                          <select
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="es">Spanish</option>
                            <option value="ta">Tamil</option>
                          </select>
                                                    <Button size="sm" variant="outline" onClick={() => fetchSummaryLang(selectedLang)}>
                                                      Translate
                                                    </Button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Average Quality Score</span>
                          <span className="text-sm font-medium">
                            {confidenceScore != null ? (() => {
                              const raw = Number(confidenceScore);
                              const display = raw <= 1 ? (raw * 5) : raw;
                              return `${display.toFixed(1)}/5.0`;
                            })() : '—'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                          <div
                            className="bg-gov-orange h-3"
                            style={{ width: `${confidenceScore != null ? ((Number(confidenceScore) <=1 ? (Number(confidenceScore)*5) : Number(confidenceScore)) / 5) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        {summaryLoading ? (
                          <p className="text-sm text-muted-foreground">Loading summary…</p>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-auto">
                            {sections && sections.length > 0 ? (
                              sections.map((sec) => (
                                <div key={sec.id} className="border rounded p-3 bg-gray-50">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm font-semibold">{sec.id}. {sec.title}</div>
                                      <div className="text-sm text-muted-foreground mt-2">{sec.text}</div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                                      <Button size="sm" onClick={() => audioPlaying ? stopAudio() : playAudio(sec.audioUrl, sec.text)}>
                                        {audioRef.current && audioPlaying ? 'Stop' : 'Play'}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(sec.text); toast({ title: 'Copied', description: 'Section copied to clipboard.' }); }}>
                                        Copy
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="max-h-48 overflow-auto border rounded p-3 bg-gray-50 text-sm leading-6">No summary available.</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          className="text-sm text-gov-blue underline ml-2 cursor-pointer"
                          onClick={(e) => { e.preventDefault(); window.open('/digital-competition-bill-2025.pdf', '_blank'); }}
                        >
                          View Full Document
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose prose-sm max-w-none">
                      <p className="mb-4">
                        The undersigned is directed to refer to the subject mentioned above and to say that the Government of India is committed to enabling the growth of large Indian firms capable of competing with leading international players by facilitating establishment of Indian Multi-Disciplinary Partnership (MDP) firms. In this context, a Background Note has been prepared to identify the challenges faced by Indian firms and to seek suggestions for necessary amendments to laws, rules, and regulations. These inputs will help strengthen Indian firms to compete not only in the domestic market but also globally.
                      </p>
                      <p className="mb-4">
                        <strong>2.</strong> The Ministry of Corporate Affairs is actively working towards amending the relevant Acts, rules, and regulations to support the growth of domestic MDPs and enhance their international competitiveness.
                      </p>
                      <p className="mb-4">
                        <strong>3.</strong> All stakeholders are requested to review the Background Note and submit their responses on the same latest by 30.09.2025 on the "E-Consultation Module" or at the email <a href="mailto:so-pimca@gov.in" className="text-gov-blue underline">so-pimca@gov.in</a>.
                      </p>
                      <p className="mb-4">
                        <strong>4.</strong> This issues with the approval of the Competent Authority.
                      </p>
                      <p className="mb-4">
                        <strong>Encls.:</strong> As above.
                      </p>
                      <p className="text-right">
                        <strong>(Randhir Kumar)</strong><br />
                        Under Secretary to the Government of India
                      </p>
                      <div className="mt-6 space-y-4">
                        <p>
                          The global consulting and auditing industry is valued at nearly $240 billion, dominated by international networks and global strategy majors. Despite India’s world-class talent pool, domestic firms remain marginal players, particularly in high-value audits and consulting, partly due to structural and regulatory barriers.
                        </p>
                        <p>
                          India’s leadership has repeatedly emphasized the need to build indigenous professional service giants. While government efforts so far have largely concentrated on the auditing sector, it is equally important to prioritise the consulting business, which represents a far larger share of the revenue potential and strategic influence in the professional services industry. The recent FTAs of India has opened opportunities for Indian consultancy firms to expand their presence abroad.
                        </p>
                        <p>
                          India needs this vision to ensure that its talent, which is currently working for global firms and delivers value abroad, is fully utilised within the country. India needs to contain its reliance on multinational corporations for strategic audits and consulting for strengthening its economic sovereignty, thereby moving towards achieving the goal of Atmanirbhar Bharat. At the same time, India must focus on building global brands in areas such as Environmental, Social and Governance (ESG), audit, advisory, compliance, and multidisciplinary consultancy, including IT services, tapping into its vast export potential. In addition, it is equally important to strengthen institutions, raise professional standards, and foster a culture of innovation that supports long-term ecosystem development within the country.
                        </p>
                        <p>
                          Study of International firms reveals the strengths of International firms as under, which are not available with Indian firms:
                        </p>
                        <p>
                          International firms follow an integrated multidisciplinary model, offering a wide range of services—auditing, tax and legal, consulting, deal advisory, and specialised areas like ESG, forensics, and technology. This approach allows them to act as one-stop solution providers, addressing the requirement of client with coordinated expertise, combining global reach with local knowledge, and delivering end-to-end support across the entire business lifecycle.
                        </p>
                        <p>
                          International firms operate through vast global networks that span numerous countries, enabling them to serve multinational clients with the same standards and quality across the world. These networks ensure scale by mobilising large pools of expertise and resources, while consistency is maintained through uniform methodologies, shared technology platforms, and global best practices. This structure allows the international firms to deliver seamless, reliable, and comparable services worldwide, making them trusted partners for global businesses and governments.
                        </p>
                        <p>
                          Presently, merger between fellow subsidiary companies belonging to the same group (i.e. having same holding company) is not covered under section 233. It is proposed that such mergers may also be included in section 233 since these would be similar to mergers between holding company and unlisted subsidiary companies. It is proposed to cover only unlisted fellow subsidiaries under this category.
                        </p>
                        <p>
                          The International firms have strong and well-known brands that acts as “trust multiplier”. Because of their reputation, their clients, feel confident that their work is reliable, and of good quality. This trust helps them build stronger client relationships, hire the best talent, and win big projects around the world.
                        </p>
                        <p>
                          The international firms operate through partnership structures where senior professionals are partners who own and manage the firm. This model creates strong accountability, as partners are directly responsible for the quality of work and client relationships, while also sharing the risks and rewards of the business. At the same time, it supports retention by offering talented professionals a clear path to partnership, motivating them to stay and grow within their firm, thereby strengthening long-term stability and commitment.
                        </p>
                        <p>
                          The International firms strengthen their services through deep technology alliances with global leaders enabling them to deliver advanced IT solutions to their clients. In addition, they have developed their own proprietary platforms which enhance audit quality, data analytics, and client services. Such blend mix of alliance and their own proprietary platforms give them a strong edge in combining technology with professional expertise to provide more efficient, reliable, and innovative solutions worldwide.
                        </p>
                        <p>
                          The International firms invest heavily in leadership academies, professional certifications, and global mobility programs to build and retain top talent. These initiatives equip professionals with advanced skills, international exposure, and leadership capabilities, ensuring they stay ahead in the rapidly changing business environment. By adopting continuous learning and offering global career opportunities, the International firms not only enhance service quality for their clients but also strengthen employee engagement, loyalty, and long-term growth within the firm.
                        </p>
                        <p>
                          The government and regulatory bodies have taken several measures to strengthen the position of Indian audit firms and create a more level playing field with global players.
                        </p>
                        <p>
                          In April 2021, the Reserve Bank of India (RBI) issued a circular aimed at diversifying the auditing business of financial institutions. It restricted the number of audits by a single firm to a maximum of four Scheduled Commercial Banks (SCBs), eight Urban Co-operative Banks (UCBs), and eight Non-Banking Financial Companies (NBFCs). It also made joint audits mandatory for large banks with assets exceeding ₹15,000 crore. Previously, around 250 major banks and NBFCs were primarily audited by just six large firms. Under the new limits, these firms can collectively handle a maximum of 72 assignments, with the remaining business opening up to Indian firms that offer cost-effective services and can build capabilities.
                        </p>
                        <p>
                          The Institute of Chartered Accountants of India (ICAI) has also taken steps to enhance the competitiveness of Indian firms against the International firms. Currently, out of 95,000 firms registered with ICAI, about 70,000 are proprietorship firms, and only 400 Indian firms have more than 10 partners. In contrast, some of the international firms have much higher number of partners. To bridge this gap, ICAI initiated measures to allow Indian firms to combine and form larger aggregate entities with greater operational capacity.
                        </p>
                        <p>
                          In India, professionals such as chartered accountants, company secretaries, and lawyers face restrictions on advertising and branding due to regulations set by their governing bodies. These rules were originally intended to uphold dignity, ethics, and independence in the profession. However, this ban limits Indian firms from building strong brands and competing on a global scale, especially against multinational firms, which can freely advertise and establish market visibility abroad. There should be a distinction between professional brand-building and solicitation/advertising.
                        </p>
                        <p>
                          In India, restrictions on multidisciplinary partnerships (MDPs) prevent professionals such as chartered accountants, company secretaries, lawyers, and actuaries from working together under a single firm structure. As a result, they often operate in silos, limiting collaboration and the ability to offer integrated services like those provided by International firms. ICAI’s 2021 MDP framework is also restrictive as it permits only six professions and excludes MBAs, IT, insolvency experts etc. The three Professional institutes, i.e., ICAI, ICSI and ICoAI, need to establish systems and environment for professional development, which includes shared common resources for smaller firms.
                        </p>
                        <p>
                          In India, licensing for professional services is governed by different regulators overseeing specific professions such as chartered accountancy, company secretarial practice, law, and actuarial science. Each operates under its own rules and restrictions, often without coordination, which creates silos and limits collaboration. This fragmented framework makes it difficult to build multidisciplinary firms, reduces competitiveness against International players, and prevents the development of Indian firms meeting diverse and complex client needs.
                        </p>
                        <p>
                          GFR allows procuring entities the flexibility to relax certain provisions in respect of startups and MSME but in practice, sometimes process followed in procurement does not create a level playing field between Indian entities and International entities. In high-value consulting, audit, and advisory assignments, stringent eligibility conditions such as high global turnover, extensive international experience, and global presence tend to disadvantage Indian firms, even when they possess the necessary expertise.
                        </p>
                        <p>
                          In the definition of “Indian” under the 2017 Public Procurement (Preference to Make in India) Order, which allows foreign-owned firms to qualify as Indian based only on local value addition, ignoring ownership and technical know-how. Another issue is that sometimes technical qualifications are evaluated at the firm level rather than the individual level, favoring global companies with established track records.
                        </p>
                        <p>
                          Indian professional firms largely operate in standalone silos with limited access to global collaboration platforms, which restricts their ability to share knowledge, leverage international best practices, and serve multinational clients seamlessly.
                        </p>
                        <h4 className="text-base font-semibold">General Information</h4>
                        <p>Name of the Organization/Individual:</p>
                        <p>Field of work:</p>
                        <p>Contact Details:</p>
                        <h4 className="text-base font-semibold">Questions</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Q1. Suggest specific changes in the Rules/Regulations administering different professionals in India to ensure Indian firms develop into globally competitive players in the field of consultancy.</li>
                          <li>Q2. Which regulatory safeguards are required to successfully implement the MDP framework?</li>
                          <li>Q3. What should be the mechanism to settle disputes among professionals in a MDP?</li>
                          <li>Q4. Are you aware of successful MDP models in other countries? If yes, which of the best practices should be adopted in India?</li>
                          <li>Q5. What measures can the Government/Professional Bodies take to ensure Indian firms develop into globally competitive players?</li>
                          <li>Q6. What regulations of the governing bodies/associations is preventing Indian firms to provide services in India on the lines of global consultancy firms in India and abroad?</li>
                          <li>Q7. What is the status of presence of Indian Consultancy firms in International market?</li>
                          <li>Q8. How can brand building for Indian firms be encouraged without opening the sector to solicitation/advertising?</li>
                          <li>Q9. Any other suggestions.</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comment Form */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-sm font-semibold">Attach a file to this Document</h3>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                        </div>
                        <label htmlFor="file-upload" className="w-full">
                          <Button variant="outline" className="w-full" asChild>
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
                          PDF, Word Doc, PNG, JPEG
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Section</label>
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a chapter or section to comment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="section1">Section 1</SelectItem>
                            <SelectItem value="section2">Section 2</SelectItem>
                            <SelectItem value="section3">Section 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Add Comments</label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Enter comment here..."
                          className="min-h-32"
                        />
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-semibold text-gov-blue">Show reference information</summary>
                          <div className="mt-2 max-h-64 overflow-auto border rounded p-3 text-xs leading-5 space-y-2 bg-gray-50">
                            <p>The undersigned is directed to refer to the subject mentioned above and to say that the Government of India is committed to enabling the growth of large Indian firms capable of competing with leading international players by facilitating establishment of Indian Multi-Disciplinary Partnership (MDP) firms...</p>
                            <p>2. The Ministry of Corporate Affairs is actively working towards amending the relevant Acts, rules, and regulations to support the growth of domestic MDPs and enhance their international competitiveness.</p>
                            <p>3. All stakeholders are requested to review the Background Note and submit their responses on the same latest by 30.09.2025 on the 'E-Consultation Module' or at the email so-pimca@gov.in.</p>
                            <p>4. This issues with the approval of the Competent Authority. Encls.: As above. (Randhir Kumar) Under Secretary to the Government of India</p>
                            <p>The global consulting and auditing industry is valued at nearly $240 billion ...</p>
                            <p>India’s leadership has repeatedly emphasized the need to build indigenous professional service giants ...</p>
                            <p>International firms follow an integrated multidisciplinary model ...</p>
                            <p>International firms operate through vast global networks ...</p>
                            <p>The International firms have strong and well-known brands ...</p>
                            <p>The international firms operate through partnership structures ...</p>
                            <p>The International firms strengthen their services through deep technology alliances ...</p>
                            <p>The International firms invest heavily in leadership academies ...</p>
                            <p>The government and regulatory bodies have taken several measures ...</p>
                            <p>In April 2021, the Reserve Bank of India (RBI) issued a circular ...</p>
                            <p>The Institute of Chartered Accountants of India (ICAI) has also taken steps ...</p>
                            <p>In India, professionals face restrictions on advertising and branding ...</p>
                            <p>In India, restrictions on multidisciplinary partnerships (MDPs) ...</p>
                            <p>In India, licensing for professional services is governed by different regulators ...</p>
                            <p>GFR allows procuring entities the flexibility to relax certain provisions ...</p>
                            <p>Definition of “Indian” under the 2017 Public Procurement ...</p>
                            <p>Indian professional firms largely operate in standalone silos ...</p>
                            <p><strong>General Information</strong>: Name, Field of work, Contact Details</p>
                            <p><strong>Questions</strong>: Q1 - Q9 as listed above.</p>
                          </div>
                        </details>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="secondary" onClick={handleSave} className="flex-1">
                          SAVE
                        </Button>
                        <Button onClick={handleSubmit} className="flex-1 bg-gov-blue hover:bg-gov-blue-dark">
                          SUBMIT
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              NOTE: Stakeholders to ensure that relevant comments are provided against their selected Section. It is mandatory to Save every comment entered for each selected Chapter before submitting an E-Consultation paper.
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

export default DocumentDetails;