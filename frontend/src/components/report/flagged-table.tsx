'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface FlaggedTransaction {
    id: string;
    date: string;
    vendor: string;
    amount: number;
    reason: string;
    severity: 'low' | 'medium' | 'high';
}

interface FlaggedTableProps {
    transactions: FlaggedTransaction[];
}

const severityConfig = {
    low: {
        icon: Info,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        badge: 'bg-blue-500/20 text-blue-300',
    },
    medium: {
        icon: AlertCircle,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300',
    },
    high: {
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        badge: 'bg-red-500/20 text-red-300',
    },
};

export function FlaggedTable({ transactions }: FlaggedTableProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Flagged Transactions
                        </h3>
                        <p className="text-sm text-slate-400">
                            {transactions.length} suspicious items detected
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            High: {transactions.filter((t) => t.severity === 'high').length}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Medium: {transactions.filter((t) => t.severity === 'medium').length}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Low: {transactions.filter((t) => t.severity === 'low').length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-900/30">
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Vendor
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Reason for Flag
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Severity
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {transactions.map((transaction) => {
                            const config = severityConfig[transaction.severity];
                            const Icon = config.icon;

                            return (
                                <tr
                                    key={transaction.id}
                                    className={`
                    transition-colors hover:bg-slate-700/20
                    ${config.bgColor}
                  `}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-slate-300">
                                            {formatDate(transaction.date)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-white">
                                            {transaction.vendor}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="text-sm font-mono font-medium text-white">
                                            {formatCurrency(transaction.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${config.badge}
                      `}
                                        >
                                            <Icon className="h-3 w-3" />
                                            {transaction.reason}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`
                        inline-flex items-center justify-center h-6 w-6 rounded-full
                        ${config.bgColor} ${config.borderColor} border
                      `}
                                        >
                                            <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
                <p className="text-xs text-slate-400 text-center">
                    Showing all {transactions.length} flagged transactions •{' '}
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        Export to CSV
                    </button>
                </p>
            </div>
        </div>
    );
}
