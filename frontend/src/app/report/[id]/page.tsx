import { Calendar, FileText, Building2, Hash, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { FraudGauge } from '@/components/report/fraud-gauge';
import { BenfordChart } from '@/components/report/benford-chart';
import { FlaggedTable } from '@/components/report/flagged-table';
import { getReportById } from '@/lib/mockData';

interface ReportPageProps {
    params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { id } = await params;
    const report = getReportById(id);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            {/* Report Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Info */}
                <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/20">
                                <FileText className="h-7 w-7 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white mb-1">
                                    {report.name}
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Document ID: {report.id}
                                </p>
                            </div>
                        </div>
                        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                            <Download className="h-4 w-4" />
                            Export Report
                        </button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                                <Calendar className="h-5 w-5 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Date Range</p>
                                <p className="text-sm font-medium text-white">
                                    {report.summary.dateRange}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                                <Hash className="h-5 w-5 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Transactions</p>
                                <p className="text-sm font-medium text-white">
                                    {report.totalTransactions.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                                <Building2 className="h-5 w-5 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Vendors</p>
                                <p className="text-sm font-medium text-white">
                                    {report.summary.vendorCount}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total Amount</p>
                            <p className="text-lg font-bold text-white">
                                ${report.summary.totalAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Corruption Score Gauge */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 flex flex-col items-center justify-center">
                    <p className="text-sm text-slate-400 mb-2">Overall Corruption Factor</p>
                    <FraudGauge score={report.corruptionScore} size="md" />
                </div>
            </div>

            {/* Benford's Law Chart */}
            <BenfordChart data={report.benfordData} />

            {/* Flagged Transactions Table */}
            <FlaggedTable transactions={report.flaggedTransactions} />

            {/* Analysis Notes */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Analysis Summary
                </h3>
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-slate-300">
                        This document analysis has identified several areas of concern that warrant
                        further investigation:
                    </p>
                    <ul className="text-slate-300 space-y-2 mt-3">
                        <li>
                            <strong className="text-white">Benford&apos;s Law Deviation:</strong> The distribution
                            of leading digits shows significant deviation from expected values,
                            particularly for digits 1 and 2. This pattern is often associated with
                            manipulated financial data.
                        </li>
                        <li>
                            <strong className="text-white">Duplicate Transactions:</strong> Multiple instances
                            of potential duplicate payments were detected, totaling approximately $31,500
                            across 2 vendor accounts.
                        </li>
                        <li>
                            <strong className="text-white">Round Number Payments:</strong> An unusually high
                            percentage (23%) of transactions end in round numbers ($X,000), which may
                            indicate estimated rather than actual invoices.
                        </li>
                    </ul>
                    <p className="text-slate-400 mt-4 text-xs">
                        Note: These findings are risk indicators and should be verified through
                        manual review. FraudEx provides detection assistance, not definitive fraud
                        determination.
                    </p>
                </div>
            </div>
        </div>
    );
}
