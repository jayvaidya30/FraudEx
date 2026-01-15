import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: LucideIcon;
    format?: 'currency' | 'number' | 'percentage';
    isAlert?: boolean;
}

export function KPICard({
    title,
    value,
    change,
    trend,
    icon: Icon,
    format = 'number',
    isAlert = false,
}: KPICardProps) {
    const formatValue = (val: string | number) => {
        if (typeof val === 'string') return val;
        switch (format) {
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    notation: 'compact',
                    maximumFractionDigits: 1,
                }).format(val);
            case 'percentage':
                return `${val.toFixed(1)}%`;
            default:
                return new Intl.NumberFormat('en-US', {
                    notation: val > 9999 ? 'compact' : 'standard',
                    maximumFractionDigits: 1,
                }).format(val);
        }
    };

    const isPositiveChange = change > 0;
    const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;

    return (
        <div
            className={`
        relative overflow-hidden rounded-xl border p-5
        transition-all duration-300 hover:scale-[1.02]
        ${isAlert
                    ? 'bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-800/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                }
      `}
        >
            {/* Background gradient accent */}
            <div
                className={`
          absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20
          ${isAlert ? 'bg-red-500' : 'bg-blue-500'}
        `}
            />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div
                        className={`
              flex h-10 w-10 items-center justify-center rounded-lg
              ${isAlert ? 'bg-red-600/20' : 'bg-blue-600/20'}
            `}
                    >
                        <Icon
                            className={`h-5 w-5 ${isAlert ? 'text-red-400' : 'text-blue-400'}`}
                        />
                    </div>
                    <div
                        className={`
              flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
              ${isPositiveChange
                                ? trend === 'up' && !isAlert
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                : trend === 'down' && !isAlert
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                            }
            `}
                    >
                        <TrendIcon className="h-3 w-3" />
                        {Math.abs(change).toFixed(1)}%
                    </div>
                </div>

                {/* Value */}
                <p className="text-2xl font-bold text-white mb-1">
                    {formatValue(value)}
                </p>

                {/* Title */}
                <p className="text-sm text-slate-400">{title}</p>
            </div>
        </div>
    );
}
