import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Users, FileText, Building2, Briefcase, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trendAnalysisData, commentsData, consultations } from '@/data/mockData';

const TrendAnalysis = () => {
  const [totalSubmissionsFromDB, setTotalSubmissionsFromDB] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch from all 3 bills in parallel
        const [bill1Res, bill2Res, bill3Res, consultRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/comments/bill_1?limit=1000`),
          fetch(`${import.meta.env.VITE_API_URL}/api/comments/bill_2?limit=1000`),
          fetch(`${import.meta.env.VITE_API_URL}/api/comments/bill_3?limit=1000`),
          fetch(`${import.meta.env.VITE_API_URL}/api/consultations`)
        ]);

        const [bill1Json, bill2Json, bill3Json, consultJson] = await Promise.all([
          bill1Res.json(),
          bill2Res.json(),
          bill3Res.json(),
          consultRes.json()
        ]);

        // Combine all rows from all bills
        const allRows = [
          ...(bill1Json.ok ? bill1Json.data.map((r: any) => ({ ...r, bill: 'bill_1', billId: 1 })) : []),
          ...(bill2Json.ok ? bill2Json.data.map((r: any) => ({ ...r, bill: 'bill_2', billId: 2 })) : []),
          ...(bill3Json.ok ? bill3Json.data.map((r: any) => ({ ...r, bill: 'bill_3', billId: 3 })) : [])
        ];

        // Map DB rows to frontend comment model
        const mapped = allRows.map((r: any) => ({
          id: r.comments_id || r.id || r.comment_id || Math.random(),
          submitter: r.commenter_name || r.submitter || 'Anonymous',
          stakeholderType: (r.stakeholder_type || r.stakeholderType || 'Individual').trim(),
          date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : (r.date || ''),
          stance: r.sentiment || r.stance || 'Neutral',
          summary: r.comment_data || r.summary || '',
          confidenceScore_based_on_ensemble_model: r.confidence_score || r.confidenceScore_based_on_ensemble_model || 0,
          originalText: r.comment_data || r.originalText || '',
          keywords: r.keywords || [],
          consultationId: r.billId || null
        }));

        setAllComments(mapped);
        
        if (consultJson.ok && consultJson.data) {
          setConsultations(consultJson.data);
          const total = consultJson.data.reduce((sum: number, c: any) => sum + (c.submissions || 0), 0);
          setTotalSubmissionsFromDB(total);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setAllComments([]);
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stakeholder analytics from fetched data
  const stakeholderTypes = allComments.reduce((acc, comment) => {
    const type = (comment.stakeholderType || 'Individual').trim();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topStakeholders = Object.entries(stakeholderTypes)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const totalComments = allComments.length;

  const averageConfidence = totalComments > 0 
    ? (allComments.reduce((acc, comment) => {
        return acc + (comment.confidenceScore_based_on_ensemble_model || 0);
      }, 0) / totalComments).toFixed(1)
    : '0.0';

  const billEngagement = consultations.map(consultation => {
    const billComments = allComments.filter(c => c.consultationId === consultation.id);
    const stanceCounts = billComments.reduce((acc, comment) => {
      const stance = comment.stance || 'Neutral';
      acc[stance] = (acc[stance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantStance = Object.entries(stanceCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([stance]) => stance)[0] || 'Neutral';

    return {
      billId: consultation.id,
      total: billComments.length,
      dominantStance
    };
  });

  const mostDiscussedBill = billEngagement.length > 0 
    ? billEngagement.reduce((max, curr) => {
        if (!max || curr.total > max.total) return curr;
        return max;
      }, billEngagement[0])
    : { billId: 1, total: 0, dominantStance: 'Neutral' };

  // Prepare sentiment trend data for all bills
  const sentimentTrendData = consultations.map(consultation => {
    const billComments = allComments.filter(c => c.consultationId === consultation.id);
    
    return {
      bill: `Bill ${consultation.id}`,
      Positive: billComments.filter(c => c.stance === 'Positive').length,
      Negative: billComments.filter(c => c.stance === 'Negative').length,
      Neutral: billComments.filter(c => c.stance === 'Neutral').length
    };
  });

  const keyInsights = [
    `${topStakeholders[0]?.[0] || 'Industry Body'} leads participation at ${(((Number(topStakeholders[0]?.[1]) || 0) / Math.max(totalComments, 1)) * 100).toFixed(1)}% of submissions`,
    `Bill ${mostDiscussedBill?.billId || 1} has the highest engagement with ${mostDiscussedBill?.total || 0} submissions, leaning ${mostDiscussedBill?.dominantStance || 'Neutral'}`,
    `Average ensemble confidence sits at ${averageConfidence}/5 across all feedback`,
    `Negative sentiment concentrates on Bill 2 with ${sentimentTrendData.find(d => d.bill === 'Bill 2')?.Negative ?? 0} critical comments`
  ];

  const lastTrend = trendAnalysisData[trendAnalysisData.length - 1];
  const prevTrend = trendAnalysisData[trendAnalysisData.length - 2] || lastTrend;

  const predictiveSignals = [
    `Data Privacy concerns trending ${lastTrend['Data Privacy Concerns'] >= prevTrend['Data Privacy Concerns'] ? 'up' : 'down'} (${prevTrend['Data Privacy Concerns']} → ${lastTrend['Data Privacy Concerns']})`,
    `CSR Compliance mentions ${lastTrend['CSR Compliance'] >= prevTrend['CSR Compliance'] ? 'rising' : 'slowing'} (${prevTrend['CSR Compliance']} → ${lastTrend['CSR Compliance']})`,
    'Stakeholder response time improving by roughly 3 days month-over-month'
  ];

  const getStakeholderIcon = (type: string) => {
    switch(type) {
      case 'Individual':
        return <Users className="h-6 w-6" />;
      case 'Industry Body':
        return <Building2 className="h-6 w-6" />;
      case 'NGO':
        return <Briefcase className="h-6 w-6" />;
      case 'Law Firm':
        return <FileText className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  const getIconBgColor = (index: number) => {
    switch(index) {
      case 0:
        return 'bg-primary text-primary-foreground';
      case 1:
        return 'bg-success text-white';
      case 2:
        return 'bg-warning text-white';
      case 3:
        return 'bg-info text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-secondary rounded-xl p-8 border">
        <h1 className="text-3xl font-bold text-foreground mb-2">Trend Analysis</h1>
        <p className="text-muted-foreground text-lg">
          Historical patterns and trends in e-consultation feedback over time
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Consultations</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{loading ? '...' : totalSubmissionsFromDB}</p>
              </div>
              <Users className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Response Time of Stakeholders </p>
                <p className="text-2xl font-bold">18 days</p>
              </div>
              <Calendar className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ensemble Confidence Score</p>
                <p className="text-2xl font-bold">4.2</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Active Stakeholders</CardTitle>
            <CardDescription>
              Stakeholder types by submission volume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topStakeholders.map(([type, count], index) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBgColor(index)}`}>
                    {getStakeholderIcon(type)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{type}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalComments > 0 ? ((Number(count) / totalComments) * 100).toFixed(1) : '0.0'}% of submissions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{Number(count)}</p>
                  <p className="text-xs text-muted-foreground">submissions</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Sentiment Distribution by Bill</CardTitle>
                <CardDescription>
                  Positive, Negative, and Neutral sentiment breakdown
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={sentimentTrendData} margin={{ bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="bill" 
                    className="text-muted-foreground"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Number of Comments', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { 
                        fill: 'hsl(var(--foreground))',
                        fontSize: '12px',
                        fontWeight: 500
                      }
                    }}
                    className="text-muted-foreground"
                    style={{ fontSize: '12px', fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [value, 'Comments']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="Positive" 
                    fill="hsl(var(--success))" 
                    name="Positive Comments"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="Negative" 
                    fill="hsl(var(--destructive))" 
                    name="Negative Comments"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="Neutral" 
                    fill="hsl(var(--warning))" 
                    name="Neutral Comments"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
      </div>

      {/* Insights & Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>
              Data-driven insights from trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">Rising Data Privacy Concerns</h4>
              <p className="text-sm text-muted-foreground">
                Data privacy issues have increased by 45% in 2025, indicating growing stakeholder awareness 
                and the need for stronger regulatory frameworks.
              </p>
            </div>
            
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
              <h4 className="font-semibold text-success mb-2">CSR Compliance Stabilizing</h4>
              <p className="text-sm text-muted-foreground">
                CSR compliance concerns have decreased significantly, suggesting improved corporate 
                understanding and implementation of CSR guidelines.
              </p>
            </div>

            <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
              <h4 className="font-semibold text-info mb-2">Stakeholder Engagement Growth</h4>
              <p className="text-sm text-muted-foreground">
                Overall participation in e-consultations has grown by 28% over the past two years, 
                indicating increased public engagement with policy-making.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Analysis</CardTitle>
            <CardDescription>
              AI-powered predictions for upcoming trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Predicted Focus Areas (Next 6 Months)</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI & Automation Governance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">85%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Digital Identity & KYC</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div className="bg-info h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">72%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">ESG Reporting Standards</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">68%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Cybersecurity Compliance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-secondary rounded-full h-2">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: '61%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">61%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                Generate Detailed Forecast Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendAnalysis;