'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { monthlySpendingData } from '@/lib/mockData';

export function SpendingChart() {
    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">
                    Monthly Spending vs. Anomalies
                </h3>
                <p className="text-sm text-slate-400">
                    Financial activity and detected irregularities over time
                </p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={monthlySpendingData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="spending"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                            yAxisId="anomalies"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#fff',
                            }}
                            labelStyle={{ color: '#94a3b8' }}
                            formatter={(value, name) => [
                                name === 'spending'
                                    ? `$${Number(value).toLocaleString()}`
                                    : value,
                                name === 'spending' ? 'Spending' : 'Anomalies',
                            ]}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => (
                                <span className="text-slate-300 text-sm capitalize">
                                    {value}
                                </span>
                            )}
                        />
                        <Area
                            yAxisId="spending"
                            type="monotone"
                            dataKey="spending"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#spendingGradient)"
                            name="spending"
                        />
                        <Area
                            yAxisId="anomalies"
                            type="monotone"
                            dataKey="anomalies"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="url(#anomalyGradient)"
                            name="anomalies"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
