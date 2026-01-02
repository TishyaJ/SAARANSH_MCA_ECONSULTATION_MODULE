import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FileText, TrendingUp, Users, MessageSquare, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MinisterDashboard = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [topComments, setTopComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hardcoded data - no backend needed
        const hardcodedData = {
            totalSubmissions: 34,
            activeConsultations: 1,
            completedConsultations: 2,
            overallSentiment: {
                Positive: 22,
                Negative: 7,
                Neutral: 5
            },
            sentimentPercentages: {
                Positive: '64.7',
                Negative: '20.6',
                Neutral: '14.7'
            },
            stakeholderBreakdown: {
                'Individual': 18,
                'Industry Body': 7,
                'Consulting Firm': 5,
                'NGO': 3,
                'Law Firm': 1
            },
            executiveSummary: 'Currently 1 active consultation with 34 total submissions across all bills. Overall sentiment is predominantly positive (64.7%) with strong engagement from individual citizens and industry bodies. Key concerns raised include implementation timelines and regulatory compliance requirements.',
            consultations: [
                { id: 1, title: 'Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt. of India', status: 'In Progress' },
                { id: 2, title: 'Digital Competition Bill, 2025', status: 'Completed' },
                { id: 3, title: 'Companies Amendment Bill, 2025', status: 'Completed' }
            ]
        };

        const hardcodedComments = [
            {
                commenter_name: 'Rajesh Kumar',
                stakeholder_type: 'Individual',
                sentiment: 'Positive',
                confidence_score: 4.8,
                summary: 'The proposed MDP framework will significantly enhance professional services delivery in India. The multi-disciplinary approach aligns well with global best practices and will boost competitiveness.',
                created_at: '2024-09-15T10:30:00Z',
                bill_key: 'bill_1'
            },
            {
                commenter_name: 'FICCI',
                stakeholder_type: 'Industry Body',
                sentiment: 'Positive',
                confidence_score: 4.7,
                summary: 'We welcome the Digital Competition Bill as it addresses critical gaps in the current regulatory framework. The provisions for data portability and interoperability are particularly commendable.',
                created_at: '2024-08-20T14:15:00Z',
                bill_key: 'bill_2'
            },
            {
                commenter_name: 'Priya Sharma',
                stakeholder_type: 'Consulting Firm',
                sentiment: 'Neutral',
                confidence_score: 4.5,
                summary: 'While the Companies Amendment Bill addresses several important issues, clarity is needed on transition timelines and compliance requirements for existing entities.',
                created_at: '2024-07-10T09:45:00Z',
                bill_key: 'bill_3'
            },
            {
                commenter_name: 'Legal Services Council',
                stakeholder_type: 'NGO',
                sentiment: 'Negative',
                confidence_score: 4.3,
                summary: 'Concerns regarding the regulatory burden on smaller firms. The compliance costs may be prohibitive for startups and SMEs, potentially limiting market participation.',
                created_at: '2024-09-10T16:20:00Z',
                bill_key: 'bill_1'
            },
            {
                commenter_name: 'Tech Industry Association',
                stakeholder_type: 'Industry Body',
                sentiment: 'Positive',
                confidence_score: 4.6,
                summary: 'The bill strikes a good balance between promoting competition and protecting consumer interests. Implementation support and clear guidelines will be crucial for success.',
                created_at: '2024-08-25T11:00:00Z',
                bill_key: 'bill_2'
            }
        ];

        setDashboardData(hardcodedData);
        setTopComments(hardcodedComments);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-xl font-semibold">Loading Executive Dashboard...</div>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-xl font-semibold text-destructive">Error loading dashboard</div>
                </div>
            </div>
        );
    }

    // Prepare sentiment data for pie chart
    const sentimentData = [
        { name: 'Positive', value: dashboardData.overallSentiment.Positive, color: '#22c55e', percentage: dashboardData.sentimentPercentages.Positive },
        { name: 'Negative', value: dashboardData.overallSentiment.Negative, color: '#ef4444', percentage: dashboardData.sentimentPercentages.Negative },
        { name: 'Neutral', value: dashboardData.overallSentiment.Neutral, color: '#f59e0b', percentage: dashboardData.sentimentPercentages.Neutral }
    ].filter(item => item.value > 0);

    // Prepare stakeholder data
    const stakeholderData = Object.entries(dashboardData.stakeholderBreakdown || {})
        .map(([name, value]) => ({
            name,
            value: value as number,
            percentage: ((value as number / dashboardData.totalSubmissions) * 100).toFixed(1)
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
                <h1 className="text-4xl font-bold mb-3">Executive Dashboard</h1>
                <p className="text-blue-100 text-lg">
                    High-level overview of public consultation feedback
                </p>
            </div>

            {/* Executive Summary Card */}
            <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-lg leading-relaxed text-foreground">
                        {dashboardData.executiveSummary}
                    </p>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                                <p className="text-4xl font-bold text-primary mt-2">{dashboardData.totalSubmissions}</p>
                            </div>
                            <MessageSquare className="h-12 w-12 text-primary/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Consultations</p>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{dashboardData.activeConsultations}</p>
                            </div>
                            <Clock className="h-12 w-12 text-blue-600/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Positive Sentiment</p>
                                <p className="text-4xl font-bold text-success mt-2">{dashboardData.sentimentPercentages.Positive}%</p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-success/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">{dashboardData.completedConsultations}</p>
                            </div>
                            <CheckCircle className="h-12 w-12 text-green-600/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Overall Sentiment Distribution</CardTitle>
                        <CardDescription>Aggregated sentiment across all consultations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Stakeholder Engagement */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Stakeholder Engagement
                        </CardTitle>
                        <CardDescription>Participation by stakeholder type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stakeholderData.map((stakeholder, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{stakeholder.name}</span>
                                        <span className="text-muted-foreground">{stakeholder.value} ({stakeholder.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-3">
                                        <div
                                            className="bg-primary h-3 rounded-full transition-all"
                                            style={{ width: `${stakeholder.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Consultations */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Active Consultations</CardTitle>
                    <CardDescription>Current public consultation processes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData.consultations.map((consultation: any) => (
                            <div
                                key={consultation.id}
                                className="border-2 rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-sm leading-relaxed pr-2 line-clamp-2">
                                        {consultation.title}
                                    </h3>
                                    <Badge
                                        variant={consultation.status === 'In Progress' ? 'default' : 'secondary'}
                                        className="shrink-0"
                                    >
                                        {consultation.status === 'In Progress' ? (
                                            <Clock className="h-3 w-3 mr-1" />
                                        ) : (
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {consultation.status}
                                    </Badge>
                                </div>
                                <Button asChild size="sm" className="w-full mt-3">
                                    <Link to={`/minister/consultation/${consultation.id}`}>
                                        View Details
                                        <ArrowRight className="h-3 w-3 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Comments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Top Representative Comments</CardTitle>
                    <CardDescription>Highest confidence submissions across all consultations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topComments.map((comment, index) => (
                            <div
                                key={index}
                                className="border rounded-lg p-4 hover:bg-card-hover transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-sm">{comment.commenter_name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {comment.stakeholder_type}
                                            </Badge>
                                            <Badge
                                                className={`text-xs ${comment.sentiment === 'Positive'
                                                    ? 'bg-success/10 text-success'
                                                    : comment.sentiment === 'Negative'
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : 'bg-warning/10 text-warning'
                                                    }`}
                                            >
                                                {comment.sentiment}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {comment.summary}
                                        </p>
                                    </div>
                                    <div className="ml-4 text-right shrink-0">
                                        <div className="text-xs text-muted-foreground">Confidence</div>
                                        <div className="text-lg font-bold text-primary">{comment.confidence_score}/5</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        {comment.bill_key.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MinisterDashboard;
