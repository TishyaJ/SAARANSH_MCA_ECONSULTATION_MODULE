import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Modern Color Palette
const COLORS = {
    Positive: '#4CAF7D', // Soft Green
    Negative: '#E76F51', // Warm Red-Orange
    Neutral: '#F4A261',  // Warm Golden Neutral
};

interface SentimentDistributionCardProps {
    sentimentCounts: {
        Positive: number;
        Negative: number;
        Neutral: number;
    };
    avgConfidence: number;
}

const SentimentDistributionCard: React.FC<SentimentDistributionCardProps> = ({ sentimentCounts, avgConfidence }) => {
    // Use sentiment counts from database
    const data = useMemo(() => {
        return Object.entries(sentimentCounts).map(([name, value]) => ({
            name,
            value,
            color: COLORS[name as keyof typeof COLORS],
        }));
    }, [sentimentCounts]);

    const total = sentimentCounts.Positive + sentimentCounts.Negative + sentimentCounts.Neutral;

    const stats = [
        { label: 'Positive', value: data.find(d => d.name === 'Positive')?.value || 0, color: COLORS.Positive },
        { label: 'Negative', value: data.find(d => d.name === 'Negative')?.value || 0, color: COLORS.Negative },
        { label: 'Neutral', value: data.find(d => d.name === 'Neutral')?.value || 0, color: COLORS.Neutral },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { name, value, color } = payload[0].payload;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return (
                <div className="bg-white p-3 border border-slate-100 rounded-lg shadow-xl text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-700">{name}</span>
                    </div>
                    <div className="text-slate-500">
                        {value} comments ({percent}%)
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-bold pointer-events-none drop-shadow-md"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800">Sentiment Distribution</CardTitle>
                        <CardDescription className="text-sm text-slate-500 mt-1">
                            Breakdown of stakeholder positions
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Top Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            <span className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Chart */}
                <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="white"
                                strokeWidth={2}
                                label={renderCustomLabel}
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text (Total) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-2xl font-bold text-slate-800">{total}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Total</div>
                    </div>
                </div>

                {/* Footer: Confidence Score */}
                <div className="mt-6 flex justify-center">
                    <Badge variant="outline" className="px-4 py-1.5 bg-slate-50 text-slate-600 border-slate-200 font-normal text-sm">
                        Confidence Score: <span className="font-semibold text-slate-800 ml-1">4.2 / 5</span>
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default SentimentDistributionCard;