import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Search, Filter, Download, Eye, ArrowLeft, Volume2, ChevronDown, Sparkles, Loader2, RotateCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { wordCloudData, STANCE_COLORS, STANCE_BG_COLORS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import ViewFullTextModal from '@/components/ViewFullTextModal';
import SentimentDistributionCard from '@/components/SentimentDistributionCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [wordCloudFilter, setWordCloudFilter] = useState('All');
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const consultationId = parseInt(id || '1');
  const [consultation, setConsultation] = React.useState<any | null>(null);
  const [comments, setComments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSpeaking, setIsSpeaking] = React.useState<string | null>(null);
  const [summaries, setSummaries] = React.useState<{
    overall_summary: string | null;
    positive_summary: string | null;
    negative_summary: string | null;
  }>({
    overall_summary: null,
    positive_summary: null,
    negative_summary: null
  });
  const [expandedSummaries, setExpandedSummaries] = React.useState({
    overall: false,
    positive: false,
    negative: false
  });
  const [sectionSummaries, setSectionSummaries] = React.useState<{
    section_1: string | null;
    section_2: string | null;
    section_3: string | null;
  }>({
    section_1: null,
    section_2: null,
    section_3: null
  });
  const [expandedSections, setExpandedSections] = React.useState({
    section1: false,
    section2: false,
    section3: false
  });
  const [sectionSentiments, setSectionSentiments] = React.useState<{
    section1: { positive: string | null; negative: string | null };
    section2: { positive: string | null; negative: string | null };
    section3: { positive: string | null; negative: string | null };
  }>({
    section1: { positive: null, negative: null },
    section2: { positive: null, negative: null },
    section3: { positive: null, negative: null }
  });
  const [activeSectionView, setActiveSectionView] = React.useState<{
    section1: 'overall' | 'positive' | 'negative';
    section2: 'overall' | 'positive' | 'negative';
    section3: 'overall' | 'positive' | 'negative';
  }>({
    section1: 'overall',
    section2: 'overall',
    section3: 'overall'
  });
  const [sentimentDistribution, setSentimentDistribution] = React.useState<{
    Positive: number;
    Negative: number;
    Neutral: number;
  }>({
    Positive: 0,
    Negative: 0,
    Neutral: 0
  });

  const [isGenerating, setIsGenerating] = useState<{
    overall: boolean;
    positive: boolean;
    negative: boolean;
    section1_overall: boolean;
    section1_positive: boolean;
    section1_negative: boolean;
    section2_overall: boolean;
    section2_positive: boolean;
    section2_negative: boolean;
    section3_overall: boolean;
    section3_positive: boolean;
    section3_negative: boolean;
  }>({
    overall: false,
    positive: false,
    negative: false,
    section1_overall: false,
    section1_positive: false,
    section1_negative: false,
    section2_overall: false,
    section2_positive: false,
    section2_negative: false,
    section3_overall: false,
    section3_positive: false,
    section3_negative: false
  });

  const handleGenerateOverview = async (type: 'overall' | 'positive' | 'negative', sectionId?: string) => {
    // Generate key for loading state
    let loadingKey = type;
    if (sectionId) {
      if (sectionId === 'Section 1') loadingKey = `section1_${type}`;
      if (sectionId === 'Section 2') loadingKey = `section2_${type}`;
      if (sectionId === 'Section 3') loadingKey = `section3_${type}`;
    }

    setIsGenerating(prev => ({ ...prev, [loadingKey]: true }));
    try {
      const billKey = consultation?.bill || `bill_${id}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-overview/${billKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, section: sectionId })
      });
      const json = await res.json();
      if (json.ok && json.data) {
        if (!sectionId) {
          // Global Update
          setSummaries(prev => ({
            ...prev,
            overall_summary: json.data.overall || prev.overall_summary,
            positive_summary: json.data.positive || prev.positive_summary,
            negative_summary: json.data.negative || prev.negative_summary
          }));
        } else {
          // Section Update
          if (sectionId === 'Section 1') {
            if (type === 'overall') setSectionSummaries(p => ({ ...p, section_1: json.data.overall }));
            if (type === 'positive') setSectionSentiments(p => ({ ...p, section1: { ...p.section1, positive: json.data.positive } }));
            if (type === 'negative') setSectionSentiments(p => ({ ...p, section1: { ...p.section1, negative: json.data.negative } }));
          }
          if (sectionId === 'Section 2') {
            if (type === 'overall') setSectionSummaries(p => ({ ...p, section_2: json.data.overall }));
            if (type === 'positive') setSectionSentiments(p => ({ ...p, section2: { ...p.section2, positive: json.data.positive } }));
            if (type === 'negative') setSectionSentiments(p => ({ ...p, section2: { ...p.section2, negative: json.data.negative } }));
          }
          if (sectionId === 'Section 3') {
            if (type === 'overall') setSectionSummaries(p => ({ ...p, section_3: json.data.overall }));
            if (type === 'positive') setSectionSentiments(p => ({ ...p, section3: { ...p.section3, positive: json.data.positive } }));
            if (type === 'negative') setSectionSentiments(p => ({ ...p, section3: { ...p.section3, negative: json.data.negative } }));
          }
        }
      }
    } catch (e) {
      console.error('Failed to generate overview', e);
    } finally {
      setIsGenerating(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Use consultation ID from URL, fallback to available word cloud data
  const wordCloud = wordCloudData[consultationId] || wordCloudData[1] || {};

  // Text-to-speech function
  const speakText = (text: string, sectionId: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (isSpeaking === sectionId) {
      // If already speaking this section, stop it
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsSpeaking(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(sectionId);
    window.speechSynthesis.speak(utterance);
  };

  // PDF Export function
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add page if needed
    const checkAddPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Header
    doc.setFillColor(59, 130, 246); // Primary blue
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Consultation Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(consultation?.title || 'Consultation Detail', pageWidth / 2, 28, { align: 'center' });

    yPosition = 50;

    // Metadata Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Generated:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString(), 60, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(consultation?.status || 'N/A', 60, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Total Submissions:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(String(consultation?.submissions || comments.length), 60, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('End Date:', 14, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(consultation?.endDate || 'N/A', 60, yPosition);
    yPosition += 15;

    // Overall Summaries Section
    checkAddPage(40);
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Sentiment Summaries', 16, yPosition + 2);
    yPosition += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Overall Summary
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Overall Summary:', 14, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const overallText = summaries.overall_summary || 'No overall summary available yet.';
    const overallLines = doc.splitTextToSize(overallText, pageWidth - 28);
    doc.text(overallLines, 14, yPosition);
    yPosition += overallLines.length * 5 + 8;

    checkAddPage(30);

    // Positive Summary
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('Positive Summary:', 14, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const positiveText = summaries.positive_summary || 'No positive summary available yet.';
    const positiveLines = doc.splitTextToSize(positiveText, pageWidth - 28);
    doc.text(positiveLines, 14, yPosition);
    yPosition += positiveLines.length * 5 + 8;

    checkAddPage(30);

    // Negative Summary
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Negative Summary:', 14, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const negativeText = summaries.negative_summary || 'No negative summary available yet.';
    const negativeLines = doc.splitTextToSize(negativeText, pageWidth - 28);
    doc.text(negativeLines, 14, yPosition);
    yPosition += negativeLines.length * 5 + 15;

    // Sentiment Distribution Section
    checkAddPage(50);
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sentiment Distribution', 16, yPosition + 2);
    yPosition += 15;

    autoTable(doc, {
      startY: yPosition,
      head: [['Sentiment', 'Count', 'Percentage']],
      body: [
        ['Positive', String(sentimentDistribution.Positive), `${((sentimentDistribution.Positive / comments.length) * 100 || 0).toFixed(1)}%`],
        ['Negative', String(sentimentDistribution.Negative), `${((sentimentDistribution.Negative / comments.length) * 100 || 0).toFixed(1)}%`],
        ['Neutral', String(sentimentDistribution.Neutral), `${((sentimentDistribution.Neutral / comments.length) * 100 || 0).toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Stakeholder Analysis Section
    checkAddPage(50);
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Stakeholder Analysis', 16, yPosition + 2);
    yPosition += 15;

    const stakeholderBody = stakeholderData.map(s => [
      s.name,
      String(s.value),
      `${((s.value / comments.length) * 100 || 0).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Stakeholder Type', 'Count', 'Percentage']],
      body: stakeholderBody.length > 0 ? stakeholderBody : [['No data', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Section-wise Summaries
    checkAddPage(40);
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Section-wise Summaries', 16, yPosition + 2);
    yPosition += 15;

    // Section 1
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Section 1', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Overall:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s1Overall = sectionSummaries.section_1 || 'No summary available.';
    const s1OverallLines = doc.splitTextToSize(s1Overall, pageWidth - 28);
    doc.text(s1OverallLines, 14, yPosition);
    yPosition += s1OverallLines.length * 5 + 5;

    checkAddPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('Positive:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s1Pos = sectionSentiments.section1.positive || 'No positive summary.';
    const s1PosLines = doc.splitTextToSize(s1Pos, pageWidth - 28);
    doc.text(s1PosLines, 14, yPosition);
    yPosition += s1PosLines.length * 5 + 5;

    checkAddPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Negative:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s1Neg = sectionSentiments.section1.negative || 'No negative summary.';
    const s1NegLines = doc.splitTextToSize(s1Neg, pageWidth - 28);
    doc.text(s1NegLines, 14, yPosition);
    yPosition += s1NegLines.length * 5 + 10;

    // Section 2
    checkAddPage(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Section 2', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Overall:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s2Overall = sectionSummaries.section_2 || 'No summary available.';
    const s2OverallLines = doc.splitTextToSize(s2Overall, pageWidth - 28);
    doc.text(s2OverallLines, 14, yPosition);
    yPosition += s2OverallLines.length * 5 + 5;

    checkAddPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('Positive:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s2Pos = sectionSentiments.section2.positive || 'No positive summary.';
    const s2PosLines = doc.splitTextToSize(s2Pos, pageWidth - 28);
    doc.text(s2PosLines, 14, yPosition);
    yPosition += s2PosLines.length * 5 + 5;

    checkAddPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Negative:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s2Neg = sectionSentiments.section2.negative || 'No negative summary.';
    const s2NegLines = doc.splitTextToSize(s2Neg, pageWidth - 28);
    doc.text(s2NegLines, 14, yPosition);
    yPosition += s2NegLines.length * 5 + 10;

    // Section 3
    checkAddPage(40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Section 3', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('Overall:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s3Overall = sectionSummaries.section_3 || 'No summary available.';
    const s3OverallLines = doc.splitTextToSize(s3Overall, pageWidth - 28);
    doc.text(s3OverallLines, 14, yPosition);
    yPosition += s3OverallLines.length * 5 + 5;

    checkAddPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text('Positive:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s3Pos = sectionSentiments.section3.positive || 'No positive summary.';
    const s3PosLines = doc.splitTextToSize(s3Pos, pageWidth - 28);
    doc.text(s3PosLines, 14, yPosition);
    yPosition += s3PosLines.length * 5 + 5;

    checkAddPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('Negative:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const s3Neg = sectionSentiments.section3.negative || 'No negative summary.';
    const s3NegLines = doc.splitTextToSize(s3Neg, pageWidth - 28);
    doc.text(s3NegLines, 14, yPosition);
    yPosition += s3NegLines.length * 5 + 15;

    // Submissions Table
    checkAddPage(50);
    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Submissions', 16, yPosition + 2);
    yPosition += 15;

    const submissionsBody = comments.map(c => [
      c.submitter || 'Anonymous',
      c.stakeholderType || 'N/A',
      c.stance || 'Neutral',
      String(c.confidenceScore_based_on_ensemble_model || 0),
      (c.summary || c.originalText || '').substring(0, 100) + (c.summary?.length > 100 ? '...' : '')
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Submitter', 'Stakeholder Type', 'Sentiment', 'Score', 'Summary']],
      body: submissionsBody.length > 0 ? submissionsBody : [['No submissions', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 'auto' }
      }
    });

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }

    // Save the PDF
    const fileName = `Consultation_Report_${consultation?.bill || 'Bill'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch consultations to get bill key and metadata
        const cRes = await fetch(`${import.meta.env.VITE_API_URL}/api/consultations`);
        const cJson = await cRes.json();
        let meta = null;
        if (cJson.ok) {
          meta = (cJson.data || []).find((c: any) => Number(c.id) === consultationId);
        }

        if (meta) {
          setConsultation(meta);
          // fetch comments for the bill key (e.g., bill_1)
          const billKey = meta.bill || `bill_${meta.id}`;
          const commentsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${billKey}`);
          const commentsJson = await commentsRes.json();
          const rows = commentsJson.ok ? commentsJson.data : [];

          // Fetch summaries from documents table
          const summariesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/summaries/${billKey}`);
          const summariesJson = await summariesRes.json();
          if (summariesJson.ok && summariesJson.data) {
            setSummaries(summariesJson.data);
          }

          // Fetch section-wise summaries
          const sectionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sections/${billKey}`);
          const sectionsJson = await sectionsRes.json();
          if (sectionsJson.ok && sectionsJson.data) {
            setSectionSummaries(sectionsJson.data);
          }

          // Fetch section-wise sentiment summaries (positive/negative)
          const sectionSentimentsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/section-sentiments/${billKey}`);
          const sectionSentimentsJson = await sectionSentimentsRes.json();
          if (sectionSentimentsJson.ok && sectionSentimentsJson.data) {
            setSectionSentiments(sectionSentimentsJson.data);
          }

          // Fetch sentiment distribution from database
          const sentimentRes = await fetch(`${import.meta.env.VITE_API_URL}/api/sentiment/${billKey}`);
          const sentimentJson = await sentimentRes.json();
          if (sentimentJson.ok && sentimentJson.data) {
            const counts = { Positive: 0, Negative: 0, Neutral: 0 };
            sentimentJson.data.forEach((row: any) => {
              const sentiment = row.sentiment?.charAt(0).toUpperCase() + row.sentiment?.slice(1).toLowerCase();
              if (sentiment === 'Positive' || sentiment === 'Negative' || sentiment === 'Neutral') {
                counts[sentiment] = parseInt(row.count) || 0;
              }
            });
            setSentimentDistribution(counts);
          }

          // Map DB rows to frontend comment model
          const mapped = (rows || []).map((r: any) => ({
            id: r.comments_id || r.id || r.comment_id || r.commentsid || Math.random(),
            submitter: r.commenter_name || r.submitter || 'Anonymous',
            stakeholderType: r.stakeholder_type || r.stakeholderType || 'Individual',
            date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : (r.date || ''),
            stance: r.sentiment || r.stance || 'Neutral',
            summary: r.summary || r.comment_data || (r.comment_data ? String(r.comment_data).slice(0, 200) : ''),
            confidenceScore_based_on_ensemble_model: r.confidence_score || r.confidenceScore_based_on_ensemble_model || 0,
            originalText: r.comment_data || r.originalText || '',
            keywords: r.keywords || [],
            mlModel: r.ml_model || r.model || null,
            consultationId: consultationId
          }));

          setComments(mapped);
        } else {
          // fallback: set a minimal consultation if none returned
          setConsultation({ id: consultationId, title: 'Consultation', status: 'Draft', submissions: 0, endDate: '' });
          setComments([]);
        }
      } catch (e) {
        console.error('Error loading consultation data', e);
        setConsultation({ id: consultationId, title: 'Consultation', status: 'Draft', submissions: 0, endDate: '' });
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [consultationId]);

  const filteredComments = useMemo(() => {
    return comments
      .filter(c => filter === 'All' || c.stance === filter)
      .filter(c => {
        const submitter = (c.submitter || '').toString().toLowerCase();
        const summary = (c.summary || '').toString().toLowerCase();
        const keywords = Array.isArray(c.keywords) ? c.keywords : [];
        return (
          submitter.includes(searchTerm.toLowerCase()) ||
          summary.includes(searchTerm.toLowerCase()) ||
          keywords.some((keyword: string) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
  }, [comments, filter, searchTerm]);

  const stanceDistribution = Object.keys(STANCE_COLORS).map(stance => ({
    name: stance,
    value: comments.filter(c => c.stance === stance).length,
    color: STANCE_COLORS[stance as keyof typeof STANCE_COLORS]
  })).filter(item => item.value > 0);

  const filteredWordCloud = wordCloud[wordCloudFilter] || [];

  const avgConfidence = comments.length ? (comments.reduce((sum, c) => sum + (c.confidenceScore_based_on_ensemble_model || 0), 0) / comments.length) : 0;

  // Prepare Stakeholder Data for Donut Chart
  const stakeholderData = useMemo(() => {
    const counts = comments.reduce((acc, comment) => {
      const type = comment.stakeholderType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Define colors for stakeholders
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [comments]);

  if (!consultation && loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">Consultation not found</h2>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {consultation.title}
          </h1>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>{consultation.submissions} submissions</span>
            <span>•</span>
            <span>Due: {consultation.endDate}</span>
            <span>•</span>
            <Badge variant={
              consultation.status === 'Analysis Complete' ? 'default' :
                consultation.status === 'In Progress' ? 'secondary' :
                  'outline'
            }>
              {consultation.status}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            {consultation.description}
          </p>
        </div>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="wordcloud">WordCloud</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Chart */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>
                  Breakdown of stakeholder positions on this consultation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {stanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {stanceDistribution.map((stance) => (
                    <div key={stance.name} className="flex items-center text-sm">
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: stance.color }}
                      ></span>
                      <span className="text-muted-foreground">{stance.name} ({stance.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
            <SentimentDistributionCard sentimentCounts={sentimentDistribution} avgConfidence={avgConfidence} />

            {/* Overall Sentiment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Overall Sentiment Summary
                </CardTitle>
                <CardDescription>
                  Summary insights from sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="font-semibold text-primary">Overall Bill Summary</h4>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleGenerateOverview('overall')}
                        disabled={isGenerating.overall}
                        title="Regenerate Overall Summary"
                      >
                        {isGenerating.overall ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <RotateCw className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setExpandedSummaries(prev => ({ ...prev, overall: !prev.overall }))}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSummaries.overall && "rotate-180")} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => speakText(summaries.overall_summary || 'No summary available yet', 'overall')}
                    >
                      <Volume2 className={cn("h-4 w-4", isSpeaking === 'overall' && "text-primary animate-pulse")} />
                    </Button>
                  </div>
                  {expandedSummaries.overall && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {summaries.overall_summary || 'Coming soon - Data will be fetched from database'}
                    </p>
                  )}
                  {!expandedSummaries.overall && summaries.overall_summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {summaries.overall_summary}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="font-semibold text-success">Positive Summary</h4>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleGenerateOverview('positive')}
                        disabled={isGenerating.positive}
                        title="Regenerate Positive Summary"
                      >
                        {isGenerating.positive ? (
                          <Loader2 className="h-4 w-4 animate-spin text-success" />
                        ) : (
                          <RotateCw className="h-4 w-4 text-success" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setExpandedSummaries(prev => ({ ...prev, positive: !prev.positive }))}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSummaries.positive && "rotate-180")} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => speakText(summaries.positive_summary || 'No positive summary available yet', 'positive')}
                    >
                      <Volume2 className={cn("h-4 w-4", isSpeaking === 'positive' && "text-success animate-pulse")} />
                    </Button>
                  </div>
                  {expandedSummaries.positive && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {summaries.positive_summary || 'Coming soon - Database insights'}
                    </p>
                  )}
                  {!expandedSummaries.positive && summaries.positive_summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {summaries.positive_summary}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h4 className="font-semibold text-destructive">Negative Summary</h4>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleGenerateOverview('negative')}
                        disabled={isGenerating.negative}
                        title="Regenerate Negative Summary"
                      >
                        {isGenerating.negative ? (
                          <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                        ) : (
                          <RotateCw className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setExpandedSummaries(prev => ({ ...prev, negative: !prev.negative }))}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSummaries.negative && "rotate-180")} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => speakText(summaries.negative_summary || 'No negative summary available yet', 'negative')}
                    >
                      <Volume2 className={cn("h-4 w-4", isSpeaking === 'negative' && "text-destructive animate-pulse")} />
                    </Button>
                  </div>
                  {expandedSummaries.negative && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {summaries.negative_summary || 'Coming soon - AI-powered analysis'}
                    </p>
                  )}
                  {!expandedSummaries.negative && summaries.negative_summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {summaries.negative_summary}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-80"
                />
              </div>
              <div className="flex items-center bg-secondary rounded-lg p-1">
                {['All', 'Positive', 'Negative', 'Neutral'].map(stance => (
                  <Button
                    key={stance}
                    variant={filter === stance ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(stance)}
                    className="text-xs"
                  >
                    {stance}
                  </Button>
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredComments.length} of {comments.length} submissions
            </span>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{comment.submitter}</h3>
                      <p className="text-sm text-muted-foreground">{comment.stakeholderType} • {comment.date} {comment.mlModel ? '• Model: ' + comment.mlModel : ''}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs border", STANCE_BG_COLORS[comment.stance as keyof typeof STANCE_BG_COLORS])}>
                        {comment.stance}
                      </Badge>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Score:</span>
                        <span className="text-sm font-medium">{comment.confidenceScore_based_on_ensemble_model}/5</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground mb-4">{comment.summary}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {comment.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedComment({
                          ...comment,
                          fullText: comment.originalText
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Full Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wordcloud" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Word Cloud Analysis</CardTitle>
                  <CardDescription>
                    Visual representation of key ts and topics via WordCloud
                  </CardDescription>
                </div>
                <div className="flex items-center bg-secondary rounded-lg p-1">
                  {['All', 'Positive', 'Negative', 'Neutral'].map(stance => (
                    <Button
                      key={stance}
                      variant={wordCloudFilter === stance ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setWordCloudFilter(stance)}
                      className="text-xs"
                    >
                      {stance}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] flex items-center justify-center p-8">
                {filteredWordCloud.length > 0 ? (
                  <div className="w-full flex justify-center">
                    <img
                      src={filteredWordCloud[0].image}
                      alt={filteredWordCloud[0].alt}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: '400px' }}
                      onError={(e) => {
                        console.error('Failed to load image:', filteredWordCloud[0].image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg">No word cloud available for this filter.</p>
                    <p className="text-sm mt-2">Try selecting a different stance or "All".</p>
                    <p className="text-xs mt-2 opacity-50">Debug: Consultation ID: {consultationId}, Filter: {wordCloudFilter}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Stakeholder Analysis</CardTitle>
                <CardDescription>
                  Breakdown by stakeholder type and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stakeholderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stakeholderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Section-wise Summary</CardTitle>
                <CardDescription>
                  AI-generated summary of key themes by section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-muted/20 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base text-primary">Section 1</h4>
                        {activeSectionView.section1 === 'overall' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('overall', 'Section 1')} disabled={isGenerating.section1_overall} title="Regenerate Section 1 Overall">
                            {isGenerating.section1_overall ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                        {activeSectionView.section1 === 'positive' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('positive', 'Section 1')} disabled={isGenerating.section1_positive} title="Regenerate Section 1 Positive">
                            {isGenerating.section1_positive ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                        {activeSectionView.section1 === 'negative' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('negative', 'Section 1')} disabled={isGenerating.section1_negative} title="Regenerate Section 1 Negative">
                            {isGenerating.section1_negative ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setExpandedSections(prev => ({ ...prev, section1: !prev.section1 }))}
                      >
                        <ChevronDown className={cn("h-5 w-5 transition-transform text-primary", expandedSections.section1 && "rotate-180")} />
                      </Button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={activeSectionView.section1 === 'overall' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section1: 'overall' }))}
                        className="flex-1"
                      >
                        Overall Summary
                      </Button>
                      <Button
                        size="sm"
                        variant={activeSectionView.section1 === 'positive' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section1: 'positive' }))}
                        className={cn(
                          "flex-1",
                          activeSectionView.section1 === 'positive'
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "border-green-600 text-green-600 hover:bg-green-50"
                        )}
                      >
                        Positive
                      </Button>
                      <Button
                        size="sm"
                        variant={activeSectionView.section1 === 'negative' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section1: 'negative' }))}
                        className={cn(
                          "flex-1",
                          activeSectionView.section1 === 'negative'
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "border-red-600 text-red-600 hover:bg-red-50"
                        )}
                      >
                        Negative
                      </Button>
                    </div>

                    {expandedSections.section1 && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {activeSectionView.section1 === 'overall' && (sectionSummaries.section_1 || 'No summary available yet.')}
                        {activeSectionView.section1 === 'positive' && (sectionSentiments.section1?.positive || 'No positive summary available yet.')}
                        {activeSectionView.section1 === 'negative' && (sectionSentiments.section1?.negative || 'No negative summary available yet.')}
                      </p>
                    )}
                    {!expandedSections.section1 && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                        {activeSectionView.section1 === 'overall' && sectionSummaries.section_1}
                        {activeSectionView.section1 === 'positive' && sectionSentiments.section1?.positive}
                        {activeSectionView.section1 === 'negative' && sectionSentiments.section1?.negative}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-muted/20 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base text-foreground">Section 2</h4>
                        {activeSectionView.section2 === 'overall' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('overall', 'Section 2')} disabled={isGenerating.section2_overall} title="Regenerate Section 2 Overall">
                            {isGenerating.section2_overall ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                        {activeSectionView.section2 === 'positive' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('positive', 'Section 2')} disabled={isGenerating.section2_positive} title="Regenerate Section 2 Positive">
                            {isGenerating.section2_positive ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                        {activeSectionView.section2 === 'negative' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('negative', 'Section 2')} disabled={isGenerating.section2_negative} title="Regenerate Section 2 Negative">
                            {isGenerating.section2_negative ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setExpandedSections(prev => ({ ...prev, section2: !prev.section2 }))}
                      >
                        <ChevronDown className={cn("h-5 w-5 transition-transform text-foreground", expandedSections.section2 && "rotate-180")} />
                      </Button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={activeSectionView.section2 === 'overall' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section2: 'overall' }))}
                        className="flex-1"
                      >
                        Overall Summary
                      </Button>
                      <Button
                        size="sm"
                        variant={activeSectionView.section2 === 'positive' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section2: 'positive' }))}
                        className={cn(
                          "flex-1",
                          activeSectionView.section2 === 'positive'
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "border-green-600 text-green-600 hover:bg-green-50"
                        )}
                      >
                        Positive
                      </Button>
                      <Button
                        size="sm"
                        variant={activeSectionView.section2 === 'negative' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section2: 'negative' }))}
                        className={cn(
                          "flex-1",
                          activeSectionView.section2 === 'negative'
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "border-red-600 text-red-600 hover:bg-red-50"
                        )}
                      >
                        Negative
                      </Button>
                    </div>

                    {expandedSections.section2 && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {activeSectionView.section2 === 'overall' && (sectionSummaries.section_2 || 'No summary available yet.')}
                        {activeSectionView.section2 === 'positive' && (sectionSentiments.section2?.positive || 'No positive summary available yet.')}
                        {activeSectionView.section2 === 'negative' && (sectionSentiments.section2?.negative || 'No negative summary available yet.')}
                      </p>
                    )}
                    {!expandedSections.section2 && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                        {activeSectionView.section2 === 'overall' && sectionSummaries.section_2}
                        {activeSectionView.section2 === 'positive' && sectionSentiments.section2?.positive}
                        {activeSectionView.section2 === 'negative' && sectionSentiments.section2?.negative}
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-muted/20 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base text-foreground">Section 3</h4>
                        {activeSectionView.section3 === 'overall' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('overall', 'Section 3')} disabled={isGenerating.section3_overall} title="Regenerate Section 3 Overall">
                            {isGenerating.section3_overall ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                        {activeSectionView.section3 === 'positive' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('positive', 'Section 3')} disabled={isGenerating.section3_positive} title="Regenerate Section 3 Positive">
                            {isGenerating.section3_positive ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                        {activeSectionView.section3 === 'negative' && (
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleGenerateOverview('negative', 'Section 3')} disabled={isGenerating.section3_negative} title="Regenerate Section 3 Negative">
                            {isGenerating.section3_negative ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCw className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setExpandedSections(prev => ({ ...prev, section3: !prev.section3 }))}
                      >
                        <ChevronDown className={cn("h-5 w-5 transition-transform text-foreground", expandedSections.section3 && "rotate-180")} />
                      </Button>
                    </div>

                    <div className="flex gap-2 mb-3">
                      <Button
                        size="sm"
                        variant={activeSectionView.section3 === 'overall' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section3: 'overall' }))}
                        className="flex-1"
                      >
                        Overall Summary
                      </Button>
                      <Button
                        size="sm"
                        variant={activeSectionView.section3 === 'positive' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section3: 'positive' }))}
                        className={cn(
                          "flex-1",
                          activeSectionView.section3 === 'positive'
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "border-green-600 text-green-600 hover:bg-green-50"
                        )}
                      >
                        Positive
                      </Button>
                      <Button
                        size="sm"
                        variant={activeSectionView.section3 === 'negative' ? 'default' : 'outline'}
                        onClick={() => setActiveSectionView(prev => ({ ...prev, section3: 'negative' }))}
                        className={cn(
                          "flex-1",
                          activeSectionView.section3 === 'negative'
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "border-red-600 text-red-600 hover:bg-red-50"
                        )}
                      >
                        Negative
                      </Button>
                    </div>

                    {expandedSections.section3 && (
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {activeSectionView.section3 === 'overall' && (sectionSummaries.section_3 || 'No summary available yet.')}
                        {activeSectionView.section3 === 'positive' && (sectionSentiments.section3?.positive || 'No positive summary available yet.')}
                        {activeSectionView.section3 === 'negative' && (sectionSentiments.section3?.negative || 'No negative summary available yet.')}
                      </p>
                    )}
                    {!expandedSections.section3 && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                        {activeSectionView.section3 === 'overall' && sectionSummaries.section_3}
                        {activeSectionView.section3 === 'positive' && sectionSentiments.section3?.positive}
                        {activeSectionView.section3 === 'negative' && sectionSentiments.section3?.negative}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ViewFullTextModal
        comment={selectedComment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComment(null);
        }}
      />
    </div>
  );
};

export default ConsultationDetail;