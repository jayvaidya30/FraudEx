'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface DropZoneProps {
    onFilesAdded: (files: File[]) => void;
}

export function DropZone({ onFilesAdded }: DropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const droppedFiles = Array.from(e.dataTransfer.files).filter(
                (file) =>
                    file.type === 'application/pdf' || file.type === 'text/csv'
            );

            if (droppedFiles.length > 0) {
                setFiles((prev) => [...prev, ...droppedFiles]);
                onFilesAdded(droppedFiles);
            }
        },
        [onFilesAdded]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                const selectedFiles = Array.from(e.target.files);
                setFiles((prev) => [...prev, ...selectedFiles]);
                onFilesAdded(selectedFiles);
            }
        },
        [onFilesAdded]
    );

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          relative flex flex-col items-center justify-center
          rounded-2xl border-2 border-dashed p-12
          transition-all duration-300 ease-out cursor-pointer
          ${isDragging
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                        : 'border-slate-600 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'
                    }
        `}
            >
                {/* Animated background */}
                <div
                    className={`
            absolute inset-0 rounded-2xl transition-opacity duration-300
            ${isDragging ? 'opacity-100' : 'opacity-0'}
          `}
                    style={{
                        background:
                            'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                    }}
                />

                <input
                    type="file"
                    accept=".pdf,.csv"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div
                    className={`
            flex h-16 w-16 items-center justify-center rounded-2xl mb-4
            transition-all duration-300
            ${isDragging ? 'bg-blue-600 scale-110' : 'bg-slate-700'}
          `}
                >
                    <Upload
                        className={`h-8 w-8 transition-colors duration-300 ${isDragging ? 'text-white' : 'text-slate-400'
                            }`}
                    />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                    {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    or click to browse from your computer
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-1 rounded bg-slate-700/50">PDF</span>
                    <span className="px-2 py-1 rounded bg-slate-700/50">CSV</span>
                    <span>files supported</span>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">
                        Selected files ({files.length})
                    </p>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-slate-800/50 border border-slate-700/50 p-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <button
                                    onClick={() => removeFile(index)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
