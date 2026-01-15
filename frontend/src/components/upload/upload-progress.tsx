'use client';

import { FileText, CheckCircle, Loader2, Eye, Search } from 'lucide-react';
import Link from 'next/link';

export type UploadStatus = 'uploading' | 'ocr' | 'analyzing' | 'complete';

interface UploadFile {
    id: string;
    name: string;
    size: number;
    status: UploadStatus;
    progress: number;
}

interface UploadProgressProps {
    files: UploadFile[];
}

const statusConfig: Record<
    UploadStatus,
    { label: string; color: string; bgColor: string }
> = {
    uploading: {
        label: 'Uploading',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
    },
    ocr: {
        label: 'OCR Processing',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
    },
    analyzing: {
        label: 'Analyzing',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
    },
    complete: {
        label: 'Complete',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
    },
};

export function UploadProgress({ files }: UploadProgressProps) {
    if (files.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Processing Files</h3>

            <div className="space-y-3">
                {files.map((file) => {
                    const config = statusConfig[file.status];
                    const isComplete = file.status === 'complete';

                    return (
                        <div
                            key={file.id}
                            className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                                        <FileText className="h-5 w-5 text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{file.size} MB</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                      ${config.bgColor} ${config.color}
                    `}
                                    >
                                        {isComplete ? (
                                            <CheckCircle className="h-3.5 w-3.5" />
                                        ) : file.status === 'analyzing' ? (
                                            <Search className="h-3.5 w-3.5 animate-pulse" />
                                        ) : (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        )}
                                        {config.label}
                                    </span>

                                    {isComplete && (
                                        <Link
                                            href={`/report/${file.id}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Report
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
                                <div
                                    className={`
                    absolute left-0 top-0 h-full rounded-full transition-all duration-500
                    ${isComplete
                                            ? 'bg-emerald-500'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-400'
                                        }
                  `}
                                    style={{ width: `${file.progress}%` }}
                                />
                                {!isComplete && (
                                    <div
                                        className="absolute left-0 top-0 h-full w-full animate-pulse"
                                        style={{
                                            background:
                                                'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                            animation: 'shimmer 1.5s infinite',
                                        }}
                                    />
                                )}
                            </div>

                            {/* Progress Steps */}
                            <div className="flex justify-between mt-3">
                                {['Uploading', 'OCR', 'Analyzing', 'Complete'].map(
                                    (step, index) => {
                                        const stepProgress = (index + 1) * 25;
                                        const isStepComplete = file.progress >= stepProgress;
                                        const isCurrentStep =
                                            file.progress >= stepProgress - 25 &&
                                            file.progress < stepProgress;

                                        return (
                                            <div
                                                key={step}
                                                className={`
                          flex items-center gap-1.5 text-xs
                          ${isStepComplete
                                                        ? 'text-emerald-400'
                                                        : isCurrentStep
                                                            ? 'text-blue-400'
                                                            : 'text-slate-500'
                                                    }
                        `}
                                            >
                                                <div
                                                    className={`
                            h-1.5 w-1.5 rounded-full
                            ${isStepComplete
                                                            ? 'bg-emerald-400'
                                                            : isCurrentStep
                                                                ? 'bg-blue-400 animate-pulse'
                                                                : 'bg-slate-600'
                                                        }
                          `}
                                                />
                                                {step}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
