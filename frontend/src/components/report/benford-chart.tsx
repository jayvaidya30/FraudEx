'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

interface BenfordData {
    digit: string;
    expected: number;
    actual: number;
}

interface BenfordChartProps {
    data: BenfordData[];
}

export function BenfordChart({ data }: BenfordChartProps) {
    // Calculate deviation for tooltip
    const dataWithDeviation = data.map((d) => ({
        ...d,
        deviation: ((d.actual - d.expected) / d.expected * 100).toFixed(1),
    }));

    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">
                    Benford&apos;s Law Analysis
                </h3>
                <p className="text-sm text-slate-400">
                    Comparing expected vs actual first-digit distribution
                </p>
            </div>

            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dataWithDeviation}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        barGap={4}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#334155"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="digit"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            label={{
                                value: 'First Digit',
                                position: 'bottom',
                                fill: '#64748b',
                                fontSize: 12,
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 35]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#fff',
                            }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                            formatter={(value, name) => [
                                `${value}%`,
                                name === 'expected' ? 'Expected (Benford)' : 'Actual',
                            ]}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const item = payload[0].payload;
                                    const isDeviant = Math.abs(parseFloat(item.deviation)) > 15;

                                    return (
                                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
                                            <p className="text-slate-300 text-sm mb-2">
                                                Digit: <span className="font-bold text-white">{label}</span>
                                            </p>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-blue-400">
                                                    Expected: {item.expected}%
                                                </p>
                                                <p className="text-orange-400">
                                                    Actual: {item.actual}%
                                                </p>
                                                <p className={isDeviant ? 'text-red-400 font-medium' : 'text-slate-400'}>
                                                    Deviation: {item.deviation}%
                                                    {isDeviant && ' ⚠️'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => (
                                <span className="text-slate-300 text-sm capitalize">
                                    {value === 'expected' ? 'Expected (Benford)' : 'Actual Distribution'}
                                </span>
                            )}
                        />
                        <ReferenceLine y={0} stroke="#475569" />
                        <Bar
                            dataKey="expected"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            name="expected"
                        />
                        <Bar
                            dataKey="actual"
                            fill="#f97316"
                            radius={[4, 4, 0, 0]}
                            name="actual"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <p className="text-sm text-slate-300">
                    <span className="font-medium text-white">Analysis: </span>
                    Significant deviations from Benford&apos;s Law detected in digits 1 and 2,
                    which may indicate potential data manipulation or fraudulent entries.
                </p>
            </div>
        </div>
    );
}
