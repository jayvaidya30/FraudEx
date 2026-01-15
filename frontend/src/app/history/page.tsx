import { FileText, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { documentReports } from '@/lib/mockData';

export default function HistoryPage() {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 60) return 'text-red-400 bg-red-500/20';
        if (score >= 30) return 'text-amber-400 bg-amber-500/20';
        return 'text-emerald-400 bg-emerald-500/20';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Document History</h2>
                    <p className="text-slate-400">
                        View and manage all analyzed documents
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    {documentReports.length} documents analyzed
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                    All
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                    High Risk
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                    Medium Risk
                </button>
                <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                    Low Risk
                </button>
            </div>

            {/* Documents List */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-900/30">
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Document
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Upload Date
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Transactions
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Flags
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Risk Score
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {documentReports.map((doc) => (
                            <tr
                                key={doc.id}
                                className="hover:bg-slate-700/20 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                                            <FileText className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-slate-400">{doc.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        {formatDate(doc.uploadDate)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm text-slate-300">
                                        {doc.totalTransactions.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-sm">
                                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                                        <span className="text-slate-300">{doc.flagsCount}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(doc.corruptionScore)}`}
                                    >
                                        {doc.corruptionScore}/100
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                        <CheckCircle className="h-3 w-3" />
                                        Analyzed
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/report/${doc.id}`}
                                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                                    >
                                        View Report
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    Showing 1-{documentReports.length} of {documentReports.length} documents
                </p>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-sm" disabled>
                        Previous
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-sm" disabled>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
