'use client';

import { useState, useEffect } from 'react';
import { DropZone } from '@/components/upload/drop-zone';
import { UploadProgress, UploadStatus } from '@/components/upload/upload-progress';
import { FileCheck, Shield, Zap } from 'lucide-react';

interface UploadFile {
    id: string;
    name: string;
    size: number;
    status: UploadStatus;
    progress: number;
}

export default function UploadPage() {
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

    const handleFilesAdded = (newFiles: File[]) => {
        const filesWithProgress = newFiles.map((file, index) => ({
            id: `upload-${Date.now()}-${index}`,
            name: file.name,
            size: parseFloat((file.size / 1024 / 1024).toFixed(2)),
            status: 'uploading' as UploadStatus,
            progress: 0,
        }));

        setUploadFiles((prev) => [...prev, ...filesWithProgress]);
    };

    // Simulate upload progress
    useEffect(() => {
        const interval = setInterval(() => {
            setUploadFiles((prev) =>
                prev.map((file) => {
                    if (file.status === 'complete') return file;

                    const newProgress = Math.min(file.progress + Math.random() * 15, 100);
                    let newStatus: UploadStatus = file.status;

                    if (newProgress >= 100) {
                        newStatus = 'complete';
                    } else if (newProgress >= 75) {
                        newStatus = 'analyzing';
                    } else if (newProgress >= 45) {
                        newStatus = 'ocr';
                    } else {
                        newStatus = 'uploading';
                    }

                    return {
                        ...file,
                        progress: newProgress,
                        status: newStatus,
                    };
                })
            );
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Upload Document</h2>
                <p className="text-slate-400">
                    Upload financial documents for fraud analysis and anomaly detection
                </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {
                        icon: FileCheck,
                        title: 'Multi-Format Support',
                        desc: 'PDF invoices, CSV bank statements, and more',
                    },
                    {
                        icon: Zap,
                        title: 'Fast Processing',
                        desc: 'OCR and analysis in under 30 seconds',
                    },
                    {
                        icon: Shield,
                        title: 'Secure & Private',
                        desc: 'End-to-end encryption, data deleted after analysis',
                    },
                ].map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 flex-shrink-0">
                            <feature.icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{feature.title}</p>
                            <p className="text-xs text-slate-400">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Drop Zone */}
            <DropZone onFilesAdded={handleFilesAdded} />

            {/* Upload Progress */}
            {uploadFiles.length > 0 && <UploadProgress files={uploadFiles} />}

            {/* Tips */}
            <div className="rounded-xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 p-6">
                <h4 className="text-sm font-semibold text-white mb-3">
                    Tips for Best Results
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        Ensure documents are clear and legible for accurate OCR processing
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        CSV files should have headers: Date, Vendor, Amount, Description
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        For best anomaly detection, upload at least 3 months of transaction data
                    </li>
                </ul>
            </div>
        </div>
    );
}
