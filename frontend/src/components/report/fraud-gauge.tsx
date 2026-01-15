'use client';

interface FraudGaugeProps {
    score: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
}

export function FraudGauge({ score, size = 'lg' }: FraudGaugeProps) {
    const sizes = {
        sm: { width: 150, height: 90, strokeWidth: 12, fontSize: '1.5rem' },
        md: { width: 200, height: 120, strokeWidth: 14, fontSize: '2rem' },
        lg: { width: 280, height: 160, strokeWidth: 18, fontSize: '2.5rem' },
    };

    const config = sizes[size];
    const radius = (config.width - config.strokeWidth) / 2;
    const circumference = Math.PI * radius;
    const progress = (score / 100) * circumference;

    // Color based on risk level
    const getColor = (value: number) => {
        if (value < 30) return { stroke: '#10b981', text: 'Low Risk', textColor: 'text-emerald-400' };
        if (value < 60) return { stroke: '#f59e0b', text: 'Medium Risk', textColor: 'text-amber-400' };
        if (value < 80) return { stroke: '#f97316', text: 'High Risk', textColor: 'text-orange-400' };
        return { stroke: '#ef4444', text: 'Critical Risk', textColor: 'text-red-400' };
    };

    const colorConfig = getColor(score);

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: config.width, height: config.height }}>
                <svg
                    width={config.width}
                    height={config.height}
                    className="transform -scale-x-100"
                    viewBox={`0 0 ${config.width} ${config.height + 10}`}
                >
                    {/* Background arc */}
                    <path
                        d={`
              M ${config.strokeWidth / 2} ${config.height}
              A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}
            `}
                        fill="none"
                        stroke="#334155"
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Progress arc */}
                    <path
                        d={`
              M ${config.strokeWidth / 2} ${config.height}
              A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}
            `}
                        fill="none"
                        stroke={colorConfig.stroke}
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${progress} ${circumference}`}
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 8px ${colorConfig.stroke}40)`,
                        }}
                    />

                    {/* Tick marks */}
                    {[0, 25, 50, 75, 100].map((tick, i) => {
                        const angle = Math.PI * (tick / 100);
                        const x1 = config.width / 2 - (radius - 8) * Math.cos(angle);
                        const y1 = config.height - (radius - 8) * Math.sin(angle);
                        const x2 = config.width / 2 - (radius + 8) * Math.cos(angle);
                        const y2 = config.height - (radius + 8) * Math.sin(angle);

                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#475569"
                                strokeWidth={2}
                            />
                        );
                    })}
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <span
                        className="font-bold text-white"
                        style={{ fontSize: config.fontSize }}
                    >
                        {score}
                    </span>
                    <span className="text-slate-400 text-sm">/ 100</span>
                </div>
            </div>

            {/* Risk Label */}
            <div className="mt-4 text-center">
                <span
                    className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
            ${colorConfig.textColor}
          `}
                    style={{ backgroundColor: `${colorConfig.stroke}20` }}
                >
                    <span
                        className="h-2 w-2 rounded-full animate-pulse"
                        style={{ backgroundColor: colorConfig.stroke }}
                    />
                    {colorConfig.text}
                </span>
            </div>
        </div>
    );
}
