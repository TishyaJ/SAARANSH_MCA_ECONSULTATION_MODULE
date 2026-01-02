import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STANCE_COLORS } from '@/data/mockData';

const Dashboard = () => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recentRes, consultRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/recent-activity`),
        fetch(`${import.meta.env.VITE_API_URL}/api/consultations`)
      ]);

      if (!recentRes.ok) throw new Error(`Recent activity HTTP ${recentRes.status}`);
      if (!consultRes.ok) throw new Error(`Consultations HTTP ${consultRes.status}`);

      const recentJson = await recentRes.json();
      const consultJson = await consultRes.json();

      if (recentJson.ok) setRecentActivity(recentJson.data || []);
      if (consultJson.ok) setConsultations(consultJson.data || []);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Calculate overall statistics
  const totalSubmissions = consultations.reduce((sum, c) => sum + (c.submissions || 0), 0);
  const activeConsultations = consultations.filter(c => c.status === 'In Progress').length;
  const completedConsultations = consultations.filter(c => c.status === 'Analysis Complete' || c.status === 'Completed').length;

  // Calculate sentiment distribution from recent activity
  const stanceDistribution = ['Positive', 'Negative', 'Neutral'].map(stance => ({
    name: stance,
    value: recentActivity.filter(comment => comment.sentiment === stance).length,
    color: STANCE_COLORS[stance as keyof typeof STANCE_COLORS]
  }));

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Analysis Complete':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Analysis Complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Completed':
        return <Star className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error Alert */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          <p className="font-medium">⚠️ Error loading data</p>
          <p className="text-sm">{error}</p>
            <button 
            onClick={loadData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-secondary rounded-xl p-8 border text-foreground">
        <h1 className="text-3xl font-bold mb-2">Project Saaransh Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          AI-powered sentiment analysis for MCA e-consultation feedback
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-primary">{totalSubmissions}</div>
            <div className="text-sm text-muted-foreground">Total Submissions</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-primary">{activeConsultations}</div>
            <div className="text-sm text-muted-foreground">Active Consultations</div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="text-2xl font-bold text-primary">{completedConsultations}</div>
            <div className="text-sm text-muted-foreground">Completed Analyses</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Sentiment Distribution</CardTitle>
            <CardDescription>
              Sentiment analysis across all active consultations
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
              {stanceDistribution.map((stance) => {
                const totalComments = recentActivity.length;
                const percentage = totalComments > 0 ? ((stance.value / totalComments) * 100).toFixed(1) : '0';
                return (
                  <div key={stance.name} className="flex items-center text-sm">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: stance.color }}
                    ></span>
                    <span className="text-muted-foreground">{stance.name}: {percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Active Consultations</CardTitle>
            <CardDescription>
              Current e-consultation processes and their status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="border rounded-lg p-4 hover:bg-card-hover transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm leading-relaxed pr-4">
                    {consultation.title}
                  </h3>
                  <Badge variant={getStatusBadgeVariant(consultation.status)} className="flex items-center gap-1 shrink-0">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(consultation.status)}
                      {consultation.status}
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{consultation.submissions} submissions</span>
                  <span>Due: {consultation.endDate}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex-1 bg-secondary rounded-full h-2 mr-3">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${consultation.progress_percentage}%` }}
                    ></div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/consultation/${consultation.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest submissions and analysis updates from database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading recent activity...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity found</p>
            ) : (
              recentActivity.slice(0, 5).map((comment, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-card-hover transition-colors border">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.commenter_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {comment.comment_data}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <span>{comment.stakeholder_type}</span>
                      </Badge>
                      <Badge
                        className={`text-xs ${comment.sentiment === 'Positive' ? 'bg-success/10 text-success' :
                            comment.sentiment === 'Negative' ? 'bg-destructive/10 text-destructive' :
                              'bg-warning/10 text-warning'
                          }`}
                      >
                        <span>{comment.sentiment}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {comment.bill}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;