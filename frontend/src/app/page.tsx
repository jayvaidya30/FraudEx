import { DollarSign, FileText, AlertTriangle, Activity } from 'lucide-react';
import { KPICard } from '@/components/dashboard/kpi-card';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { kpiData, recentActivity, documentReports } from '@/lib/mockData';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">At a Glance</h2>
          <p className="text-slate-400">
            Overview of your financial analysis metrics
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
        >
          <FileText className="h-4 w-4" />
          Upload Document
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Spend"
          value={kpiData.totalSpend.value}
          change={kpiData.totalSpend.change}
          trend={kpiData.totalSpend.trend}
          icon={DollarSign}
          format="currency"
        />
        <KPICard
          title="Documents Processed"
          value={kpiData.documentsProcessed.value}
          change={kpiData.documentsProcessed.change}
          trend={kpiData.documentsProcessed.trend}
          icon={FileText}
          format="number"
        />
        <KPICard
          title="High Risk Flags"
          value={kpiData.highRiskFlags.value}
          change={kpiData.highRiskFlags.change}
          trend={kpiData.highRiskFlags.trend}
          icon={AlertTriangle}
          format="number"
          isAlert={true}
        />
        <KPICard
          title="Avg. Fraud Score"
          value={kpiData.averageFraudScore.value}
          change={kpiData.averageFraudScore.change}
          trend={kpiData.averageFraudScore.trend}
          icon={Activity}
          format="percentage"
        />
      </div>

      {/* Main Chart */}
      <SpendingChart />

      {/* Bottom Section: Recent Activity + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      h-2 w-2 rounded-full
                      ${activity.result === 'High Risk'
                        ? 'bg-red-500'
                        : activity.result === 'Low Risk'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }
                    `}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-400">
                      {activity.document}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`
                      text-xs font-medium px-2 py-1 rounded-full
                      ${activity.result === 'High Risk'
                        ? 'bg-red-500/20 text-red-400'
                        : activity.result === 'Low Risk'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }
                    `}
                  >
                    {activity.result}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Documents
          </h3>
          <div className="space-y-3">
            {documentReports.slice(0, 4).map((doc) => (
              <Link
                key={doc.id}
                href={`/report/${doc.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30 hover:border-slate-600 transition-colors"
              >
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-lg
                    ${doc.corruptionScore >= 60
                      ? 'bg-red-500/20'
                      : doc.corruptionScore >= 30
                        ? 'bg-amber-500/20'
                        : 'bg-emerald-500/20'
                    }
                  `}
                >
                  <FileText
                    className={`
                      h-5 w-5
                      ${doc.corruptionScore >= 60
                        ? 'text-red-400'
                        : doc.corruptionScore >= 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    `}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Score: {doc.corruptionScore} • {doc.flagsCount} flags
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
