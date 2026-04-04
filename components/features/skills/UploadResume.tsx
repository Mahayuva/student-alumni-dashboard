"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";

interface UploadResumeProps {
    onUpload: (file: File) => void;
    currentFile: File | null;
    onRemove: () => void;
    isAnalyzing: boolean;
}

export function UploadResume({ onUpload, currentFile, onRemove, isAnalyzing }: UploadResumeProps) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndUpload(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const validateAndUpload = (file: File) => {
        if (file.type === "application/pdf" || file.type === "text/plain") {
            onUpload(file);
        } else {
            alert("Please upload a PDF or Text file.");
        }
    };

    return (
        <div className="w-full">
            {!currentFile ? (
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                        ? "border-primary bg-primary-light"
                        : "border-slate-200 hover:border-primary/30 hover:bg-slate-50"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="resume-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pdf,.txt"
                        disabled={isAnalyzing}
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-primary-light text-primary rounded-full">
                            <Upload className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500 mt-1">PDF or TXT (max 5MB)</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                            <p className="font-medium text-sm text-slate-900 truncate">{currentFile.name}</p>
                            <p className="text-xs text-slate-500">{(currentFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                    </div>

                    {!isAnalyzing && (
                        <button
                            onClick={onRemove}
                            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {isAnalyzing && (
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Analyzing...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
