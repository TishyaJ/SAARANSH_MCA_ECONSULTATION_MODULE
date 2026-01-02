import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MinisterConsultationDetail = () => {
    const { id } = useParams();
    const [consultation, setConsultation] = useState<any>(null);
    const [summaries, setSummaries] = useState<any>({});
    const [comments, setComments] = useState<any[]>([]);
    const [sentimentDistribution, setSentimentDistribution] = useState<any>({});
    const [stakeholderData, setStakeholderData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const consultationMap: any = {
                    '1': { id: 1, bill: 'bill_1', title: 'Establishment of Indian Multi-Disciplinary Partnership (MDP) firms by the Govt. of India', status: 'In Progress', endDate: '2025-10-15' },
                    '2': { id: 2, bill: 'bill_2', title: 'Digital Competition Bill, 2025', status: 'Completed', endDate: '2025-08-31' },
                    '3': { id: 3, bill: 'bill_3', title: 'Companies Amendment Bill, 2025', status: 'Completed', endDate: '2025-07-15' }
                };

                const consultationData = consultationMap[id || '1'];
                setConsultation(consultationData);

                if (consultationData) {
                    const [summariesRes, commentsRes] = await Promise.all([
                        fetch(`${import.meta.env.VITE_API_URL}/api/summaries/${consultationData.bill}`),
                        fetch(`${import.meta.env.VITE_API_URL}/api/comments/${consultationData.bill}`)
                    ]);

                    const summariesJson = await summariesRes.json();
                    const commentsJson = await commentsRes.json();

                    if (summariesJson.ok) setSummaries(summariesJson.data);
                    if (commentsJson.ok) {
                        const commentsData = commentsJson.data || [];
                        setComments(commentsData);

                        // Calculate sentiment distribution
                        const distribution: any = { Positive: 0, Negative: 0, Neutral: 0 };
                        commentsData.forEach((comment: any) => {
                            const sentiment = comment.sentiment?.charAt(0).toUpperCase() + comment.sentiment?.slice(1).toLowerCase();
                            if (distribution.hasOwnProperty(sentiment)) {
                                distribution[sentiment]++;
                            }
                        });
                        setSentimentDistribution(distribution);

                        // Calculate stakeholder breakdown
                        const stakeholderMap: any = {};
                        commentsData.forEach((comment: any) => {
                            const type = comment.stakeholder_type || 'Unknown';
                            if (!stakeholderMap[type]) {
                                stakeholderMap[type] = { Positive: 0, Negative: 0, Neutral: 0, total: 0 };
                            }
                            const sentiment = comment.sentiment?.charAt(0).toUpperCase() + comment.sentiment?.slice(1).toLowerCase();
                            if (sentiment === 'Positive' || sentiment === 'Negative' || sentiment === 'Neutral') {
                                stakeholderMap[type][sentiment]++;
                            }
                            stakeholderMap[type].total++;
                        });

                        const stakeholderArray = Object.entries(stakeholderMap).map(([name, data]: [string, any]) => ({
                            name,
                            Positive: data.Positive,
                            Negative: data.Negative,
                            Neutral: data.Neutral,
                            total: data.total
                        }));
                        setStakeholderData(stakeholderArray);
                    }
                }
            } catch (error) {
                console.error('Error fetching consultation data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-xl font-semibold">Loading consultation details...</div>
            </div>
        );
    }

    if (!consultation) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-xl font-semibold text-destructive">Consultation not found</div>
            </div>
        );
    }

    const totalSubmissions = comments.length;
    const totalSentiment = sentimentDistribution.Positive + sentimentDistribution.Negative + sentimentDistribution.Neutral;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back Button */}
            <Button variant="outline" asChild>
                <Link to="/minister">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
            </Button>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-3">{consultation.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <span>{totalSubmissions} Submissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={consultation.status === 'In Progress' ? 'default' : 'secondary'} className="bg-white/20 text-white">
                            {consultation.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Ends: {consultation.endDate}</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Positive Sentiment</p>
                                <p className="text-3xl font-bold text-success mt-2">
                                    {totalSentiment > 0 ? ((sentimentDistribution.Positive / totalSentiment) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-success/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Negative Sentiment</p>
                                <p className="text-3xl font-bold text-destructive mt-2">
                                    {totalSentiment > 0 ? ((sentimentDistribution.Negative / totalSentiment) * 100).toFixed(1) : 0}%
                                </p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-destructive/20 rotate-180" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Stakeholder Groups</p>
                                <p className="text-3xl font-bold text-primary mt-2">{stakeholderData.length}</p>
                            </div>
                            <Users className="h-10 w-10 text-primary/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Overall Summary */}
            <Card className="border-2 border-primary/20">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-xl">Overall Summary</CardTitle>
                    <CardDescription>AI-generated summary of all submissions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Overall Summary */}
                    <div>
                        <p className="text-base leading-relaxed text-muted-foreground">
                            {consultation.id === 1
                                ? 'The consultation on establishing Multi-Disciplinary Partnership (MDP) firms has received strong support from stakeholders. Key themes include appreciation for the progressive framework, concerns about regulatory compliance costs for smaller firms, and requests for clear implementation guidelines. Industry bodies and individual professionals have highlighted the potential for enhanced service delivery and global competitiveness.'
                                : consultation.id === 2
                                    ? 'The Digital Competition Bill has garnered positive feedback for addressing critical gaps in the regulatory framework. Stakeholders appreciate provisions for data portability and interoperability. Main concerns revolve around implementation timelines and the need for sector-specific guidelines. Tech industry representatives emphasize the importance of balancing competition promotion with innovation incentives.'
                                    : 'The Companies Amendment Bill consultation shows mixed responses. While stakeholders acknowledge the bill addresses important corporate governance issues, there are concerns about transition timelines and compliance burden on existing entities. Legal experts and consulting firms have requested clarity on applicability to different company sizes and phased implementation approaches.'
                            }
                        </p>
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Positive Views */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-1 w-1 rounded-full bg-success"></div>
                            <h3 className="text-lg font-semibold text-success">Positive Views</h3>
                        </div>
                        <p className="text-base leading-relaxed pl-3 border-l-4 border-success/30">
                            {consultation.id === 1
                                ? 'Stakeholders strongly support the MDP framework, viewing it as a progressive step towards modernizing professional services in India. Industry bodies appreciate the multi-disciplinary approach that aligns with global best practices. Individual professionals highlight the potential for enhanced service delivery, increased competitiveness, and better career opportunities. The framework is seen as enabling innovation and fostering collaboration across different professional domains.'
                                : consultation.id === 2
                                    ? 'The Digital Competition Bill receives praise for addressing critical regulatory gaps in the digital economy. Stakeholders commend the provisions for data portability and interoperability, which promote consumer choice and fair competition. Tech industry representatives appreciate the balanced approach that encourages innovation while protecting consumer interests. The bill is recognized for its forward-thinking stance on platform regulation and digital market dynamics.'
                                    : 'Stakeholders acknowledge that the Companies Amendment Bill addresses important corporate governance issues and strengthens regulatory oversight. Legal experts appreciate the clarity brought to director responsibilities and compliance requirements. The amendments are seen as necessary steps to improve transparency and accountability in corporate operations. Industry bodies recognize the intent to align Indian corporate law with international standards.'
                            }
                        </p>
                    </div>

                    {/* Negative Views */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-1 w-1 rounded-full bg-destructive"></div>
                            <h3 className="text-lg font-semibold text-destructive">Negative Views / Concerns</h3>
                        </div>
                        <p className="text-base leading-relaxed pl-3 border-l-4 border-destructive/30">
                            {consultation.id === 1
                                ? 'Concerns are raised about the regulatory compliance burden, particularly for smaller firms and startups. Stakeholders worry that compliance costs may be prohibitive, potentially limiting market participation and innovation. There are requests for clearer implementation guidelines, phased rollout timelines, and support mechanisms for SMEs. Some professionals express uncertainty about the practical implications of multi-disciplinary partnerships and the need for detailed operational frameworks.'
                                : consultation.id === 2
                                    ? 'Stakeholders express concerns about implementation timelines and the need for sector-specific guidelines. There are worries about the regulatory burden on smaller tech companies and startups. Questions arise regarding the enforcement mechanisms and how the bill will adapt to rapidly evolving digital markets. Some industry representatives seek clarity on compliance requirements and request consultation on detailed rules before implementation.'
                                    : 'Major concerns revolve around transition timelines and the compliance burden on existing entities. Smaller companies worry about the cost and complexity of implementing new governance requirements. Stakeholders request clarity on applicability to different company sizes and advocate for phased implementation approaches. There are concerns about the practical challenges of meeting new compliance standards within proposed timeframes, especially for resource-constrained organizations.'
                            }
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Sentiment by Stakeholder Type - Bar Graph */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Sentiment Analysis by Stakeholder Type</CardTitle>
                    <CardDescription>Breakdown of sentiment across different stakeholder groups</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stakeholderData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    interval={0}
                                />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="Positive" fill="#22c55e" name="Positive" />
                                <Bar dataKey="Neutral" fill="#f59e0b" name="Neutral" />
                                <Bar dataKey="Negative" fill="#ef4444" name="Negative" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Comments */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Key Representative Comments</CardTitle>
                    <CardDescription>Top submissions by confidence score</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {comments
                            .filter(c => c.confidence_score)
                            .sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0))
                            .slice(0, 5)
                            .map((comment, index) => (
                                <div key={index} className="border rounded-lg p-4 hover:bg-card-hover transition-colors">
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
                                                {comment.summary || comment.comment_data}
                                            </p>
                                        </div>
                                        <div className="ml-4 text-right shrink-0">
                                            <div className="text-xs text-muted-foreground">Score</div>
                                            <div className="text-lg font-bold text-primary">{comment.confidence_score}/5</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MinisterConsultationDetail;
