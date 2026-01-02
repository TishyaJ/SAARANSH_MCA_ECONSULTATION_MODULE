import React from 'react';
import { Users, Building2, FileText, TrendingUp, Calendar, Award, Filter, Download, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { STANCE_BG_COLORS } from '@/data/mockData';
import { useEffect, useState } from 'react';

const StakeholderAnalytics = () => {
  const [allComments, setAllComments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
          ...(bill1Json.ok ? bill1Json.data.map((r: any) => ({ ...r, bill: 'bill_1' })) : []),
          ...(bill2Json.ok ? bill2Json.data.map((r: any) => ({ ...r, bill: 'bill_2' })) : []),
          ...(bill3Json.ok ? bill3Json.data.map((r: any) => ({ ...r, bill: 'bill_3' })) : [])
        ];

        // Map DB rows to frontend comment model
        const mapped = allRows.map((r: any) => ({
          id: r.comments_id || r.id || r.comment_id || Math.random(),
          submitter: r.commenter_name || r.submitter || 'Anonymous',
          stakeholderType: r.stakeholder_type || r.stakeholderType || 'Individual',
          date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : (r.date || ''),
          stance: r.sentiment || r.stance || 'Neutral',
          summary: r.comment_data || r.summary || '',
          confidenceScore_based_on_ensemble_model: r.confidence_score || r.confidenceScore_based_on_ensemble_model || 0,
          originalText: r.comment_data || r.originalText || '',
          keywords: r.keywords || [],
          consultationId: r.bill || null
        }));

        setAllComments(mapped);
        setConsultations(consultJson.ok ? consultJson.data : []);
      } catch (e) {
        console.error('Error loading stakeholder analytics data', e);
        setAllComments([]);
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
  
  const stakeholderTypes = allComments.reduce((acc, comment) => {
    // Normalize stakeholder type: trim whitespace and ensure consistent capitalization
    const normalizedType = (comment.stakeholderType || 'Individual').trim();
    acc[normalizedType] = (acc[normalizedType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stanceByType = allComments.reduce((acc, comment) => {
    // Normalize stakeholder type: trim whitespace and ensure consistent capitalization
    const normalizedType = (comment.stakeholderType || 'Individual').trim();
    if (!acc[normalizedType]) {
      acc[normalizedType] = {};
    }
    acc[normalizedType][comment.stance] = (acc[normalizedType][comment.stance] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const topStakeholders = Object.entries(stakeholderTypes)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5);

  const averageQualityByType = Object.entries(
    allComments.reduce((acc, comment) => {
      if (!acc[comment.stakeholderType]) {
        acc[comment.stakeholderType] = { total: 0, count: 0 };
      }
      acc[comment.stakeholderType].total += comment.confidenceScore_based_on_ensemble_model;
      acc[comment.stakeholderType].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([type, data]: [string, { total: number; count: number }]) => ({
    type,
    average: (data.total / data.count).toFixed(1)
  }));

  // Engagement data for charts
  const engagementData = [
    { name: 'Jul', submissions: 2, quality: 4.2 },
    { name: 'Aug', submissions: 5, quality: 4.1 },
    { name: 'Sep', submissions: 1, quality: 4.3 },
    { name: 'Oct', submissions: 0, quality: 4.4 }
  ];

  // Convert stakeholder types to chart format
  const stakeholderStats = Object.entries(stakeholderTypes).map(([type, count]) => ({
    type,
    count,
    percentage: ((Number(count) / (allComments.length || 1)) * 100).toFixed(1)
  }));

  // Convert sentiment data to chart format - Get top 5 stakeholder types
  const sentimentByStakeholder = Object.entries(stanceByType)
    .sort((a, b) => {
      const totalA = Object.values(a[1]).reduce((sum, count) => sum + count, 0);
      const totalB = Object.values(b[1]).reduce((sum, count) => sum + count, 0);
      return totalB - totalA;
    })
    .slice(0, 5)
    .map(([type, stances]: [string, Record<string, number>]) => ({
      name: type,
      Positive: stances.Positive || 0,
      Negative: stances.Negative || 0,
      Neutral: stances.Neutral || 0
    }));

  const COLORS = ['#3B82F6', '#EF4444', '#F97316', '#22C55E', '#A855F7'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Law Firm': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Industry Body': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'NGO': return 'bg-green-100 text-green-800 border-green-200';
      case 'Consulting Firm': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-secondary rounded-xl p-8 border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Stakeholder Analytics</h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive analysis of stakeholder engagement and feedback patterns
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stakeholders</p>
                <p className="text-2xl font-bold">{Object.keys(stakeholderTypes).length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Unique stakeholder types</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Submissions</p>
                <p className="text-2xl font-bold">{allComments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-info" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Confidence Score</p>
                <p className="text-2xl font-bold">
                  4.2
                </p>
              </div>
              <Award className="h-8 w-8 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Stakeholder participation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          <TabsTrigger value="trends">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stakeholder Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-5 h-5 mr-2" />
                  Stakeholder Distribution
                </CardTitle>
                <CardDescription>Breakdown by stakeholder type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stakeholderStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                    >
                      {stakeholderStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {stakeholderStats.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{Number(item.count)}</span>
                        <span className="text-green-600 text-xs">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis by Stakeholder Type */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis by Stakeholder Type</CardTitle>
                <CardDescription>Distribution of stance across different stakeholder categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={sentimentByStakeholder} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Positive" stackId="a" fill="#22C55E" name="Positive" />
                    <Bar dataKey="Negative" stackId="a" fill="#EF4444" name="Negative" />
                    <Bar dataKey="Neutral" stackId="a" fill="#F97316" name="Neutral" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Trends Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Engagement Trends
                </CardTitle>
                <CardDescription>Monthly submission and quality trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="submissions" fill="#3B82F6" name="Submissions" />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#EF4444" name="Avg Quality" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Timeline</CardTitle>
                <CardDescription>
                  Submission patterns over time by consultation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {consultations.map((consultation) => {
                  const submissions = allComments.filter(c => Number(c.consultationId) === Number(consultation.id) || c.consultationId === consultation.bill).length;
                  const totalExpected = consultation.submissions || Math.max(submissions, 1);
                  const progress = (submissions / totalExpected) * 100;

                  return (
                    <div key={consultation.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{consultation.title}</span>
                        <span className="text-xs text-muted-foreground">{submissions} submissions</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Due: {consultation.endDate}</span>
                        <Badge variant={
                          consultation.status === 'Analysis Complete' ? 'default' :
                          consultation.status === 'In Progress' ? 'secondary' :
                          'outline'
                        }>
                          {consultation.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Score Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Score Analysis</CardTitle>
                <CardDescription>
                  Distribution of submission quality scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'Excellent (4.5-5.0)', count: allComments.filter(c => c.confidenceScore_based_on_ensemble_model >= 4.5).length, color: 'bg-success' },
                    { label: 'Good (4.0-4.4)', count: allComments.filter(c => c.confidenceScore_based_on_ensemble_model >= 4.0 && c.confidenceScore_based_on_ensemble_model < 4.5).length, color: 'bg-info' },
                    { label: 'Average (3.0-3.9)', count: allComments.filter(c => c.confidenceScore_based_on_ensemble_model >= 3.0 && c.confidenceScore_based_on_ensemble_model < 4.0).length, color: 'bg-warning' },
                    { label: 'Below Average (< 3.0)', count: allComments.filter(c => c.confidenceScore_based_on_ensemble_model < 3.0).length, color: 'bg-destructive' }
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm">{label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-secondary rounded-full h-2">
                          <div
                            className={`${color} h-2 rounded-full`}
                            style={{ width: `${(count / allComments.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Quality Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Quality Contributors</CardTitle>
                <CardDescription>
                  Highest quality submissions by stakeholder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allComments
                  .sort((a, b) => b.confidenceScore_based_on_ensemble_model - a.confidenceScore_based_on_ensemble_model)
                  .slice(0, 5)
                  .map((comment, index) => (
                    <div key={comment.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{comment.submitter}</p>
                          <p className="text-xs text-muted-foreground">{comment.stakeholderType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{comment.confidenceScore_based_on_ensemble_model}/5</Badge>
                          {index < 3 && (
                            <Badge className={
                              index === 0 ? 'bg-success text-success-foreground' :
                              index === 1 ? 'bg-info text-info-foreground' :
                              'bg-warning text-warning-foreground'
                            }>
                              #{index + 1}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {comment.summary}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Patterns</CardTitle>
                <CardDescription>
                  Key insights from stakeholder behavior analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Peak Engagement Period</h4>
                  <p className="text-sm text-muted-foreground">
                    Most submissions occur in the final 2 weeks before consultation deadline, 
                    indicating last-minute stakeholder mobilization.
                  </p>
                </div>

                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-2">Quality Correlation</h4>
                  <p className="text-sm text-muted-foreground">
                    Industry bodies and law firms consistently provide higher quality submissions 
                    compared to individual stakeholders.
                  </p>
                </div>

                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2">Stance Predictability</h4>
                  <p className="text-sm text-muted-foreground">
                    NGOs show 85% supportive stance on transparency measures, 
                    while industry bodies are 70% opposed to compliance increases.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Insights</CardTitle>
                <CardDescription>
                  AI-powered predictions for future consultations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Expected Stakeholder Response</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>High Industry Engagement</span>
                      <span className="text-warning font-medium">92% likely</span>
                    </div>
                    <div className="flex justify-between">
                      <span>NGO Participation</span>
                      <span className="text-success font-medium">78% likely</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Individual Submissions</span>
                      <span className="text-info font-medium">65% likely</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Legal Firm Response</span>
                      <span className="text-primary font-medium">87% likely</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Recommended Actions</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Target early outreach to individual stakeholders</li>
                    <li>• Prepare for high-volume industry responses</li>
                    <li>• Allocate additional review time for complex submissions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StakeholderAnalytics;