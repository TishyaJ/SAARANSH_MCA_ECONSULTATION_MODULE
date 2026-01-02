import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Eye,
  Search,
  Clock,
  FileText,
  AlertCircle,
  History,
  ArrowRight,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BadgeCount } from "@/components/ui/badge-count";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EConsultationLanding = () => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: "Home", href: "/econsultation-landing" },
    { label: "Additional Services", href: "#" },
    { label: "E-Consultation" },
  ];

  const handleBeyond7DaysClick = () => {
    navigate("/consultation-listing");
  };

  const handleTodayClick = () => {
    navigate("/filtered-consultation?filter=today&count=0");
  };

  const handleNext7DaysClick = () => {
    navigate("/filtered-consultation?filter=next7days&count=0");
  };

  const handlePostedTodayClick = () => {
    navigate("/filtered-consultation?filter=posted-today&count=0");
  };

  const handlePostedLast7DaysClick = () => {
    navigate("/filtered-consultation?filter=posted-last7days&count=0");
  };

  const handlePostedEarlierClick = () => {
    navigate("/filtered-consultation?filter=posted-earlier&count=1");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Global header from your app */}
      <Header />

      <main className="container mx-auto px-4 py-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Left column - Enhanced dark blue card */}
          <div className="bg-[#092044] rounded-lg p-8 text-white shadow-lg flex flex-col justify-between h-full relative overflow-hidden group">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-white border-b-2 border-white/20 pb-4 inline-block">
                The E-Consultation Module
              </h2>

              <div className="bg-white/10 rounded-xl p-8 backdrop-blur-md border border-white/20 shadow-inner">
                <div className="text-center space-y-6">
                  <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-6 shadow-lg">
                    <FileText className="h-10 w-10 text-[#092044]" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-widest">
                      Online platform to invite
                    </p>
                    <p className="text-white font-black text-2xl tracking-wide bg-orange-600/90 py-1 px-4 rounded inline-block shadow-sm transform hover:scale-105 transition-transform">
                      PUBLIC SUGGESTIONS
                    </p>
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-widest mt-2">
                      on
                    </p>
                    <div className="space-y-1 mt-2">
                      <p className="text-white font-bold text-xl tracking-wide border-b border-white/30 pb-1 inline-block">
                        PROPOSED AMENDMENTS
                      </p>
                      <p className="text-blue-200 text-xs py-1">&amp;</p>
                      <p className="text-white font-bold text-xl tracking-wide border-b border-white/30 pb-1 inline-block">
                        DRAFT LEGISLATIONS
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Enhanced explanation card */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-[#092044]">
                  What is E-Consultation?
                </h2>
              </div>
              <Button
                variant="ghost"
                className="h-8 text-gray-500 px-3"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" /> Hide
              </Button>
            </div>

            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed text-base text-justify mb-6">
                E-Consultation is an online platform wherein, proposed
                amendments or draft legislations can be posted, Stakeholders
                and users can submit their comments and suggestions. Before
                notifying any crucial amendment or new legislation, MCA will
                publish the draft document on E-Consultation portal for public
                consultation and inviting inputs and suggestions of external
                stakeholders.
              </p>

              <ul className="space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">
                    Review draft legislations and proposed amendments directly
                    from the source.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">
                    Submit your comments and suggestions securely online.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">
                    Participate in the democratic process of policy formulation.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-auto p-4 bg-blue-50 border-l-4 border-[#092044] rounded-r-md">
              <p className="text-sm text-[#092044]">
                <strong>Note:</strong> Please ensure to submit your comments and
                suggestions. Public feedback is crucial for robust policy making.
              </p>
            </div>
          </div>
        </div>

        {/* List of documents - Enhanced */}
        <section className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-1.5 bg-orange-500 rounded-full" />
            <h2 className="text-2xl font-bold text-[#092044]">
              List of Documents Open for Consultation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Comments Due Soon card */}
            <Card className="border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#092044] text-lg">
                      Comments Due Soon
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Deadlines approaching
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  

                  <button
                    onClick={handleNext7DaysClick}
                    className="w-full flex items-center justify-between p-5 hover:bg-orange-50/30 transition-colors group text-left"
                  >
                    <div>
                      <span className="text-gray-800 font-semibold text-base block group-hover:text-orange-700 transition-colors">
                        Next 7 Days
                      </span>
                      <span className="text-xs text-gray-500 mt-1 block">
                        Upcoming deadlines
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <BadgeCount count={1} />
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-orange-600 transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </button>

                  <button
                    onClick={handleBeyond7DaysClick}
                    className="w-full flex items-center justify-between p-5 hover:bg-green-50/30 transition-colors group text-left"
                  >
                    <div>
                      <span className="text-gray-800 font-semibold text-base block group-hover:text-green-700 transition-colors">
                        Beyond 7 Days
                      </span>
                      <span className="text-xs text-gray-500 mt-1 block">
                        Future deadlines
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <BadgeCount count={3} />
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-green-600 transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Posted Recently card */}
            <Card className="border border-gray-200 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <History className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#092044] text-lg">
                      Posted Recently
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Archive
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {/* You can add rows for posted today / last 7 days later using their handlers */}
                  <button
                    onClick={handlePostedEarlierClick}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group text-left"
                  >
                    <div>
                      <span className="text-gray-800 font-semibold text-base block group-hover:text-[#092044] transition-colors">
                        Earlier
                      </span>
                      <span className="text-xs text-gray-500 mt-1 block">
                        Archive
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <BadgeCount count={1} />
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#092044] transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EConsultationLanding;
