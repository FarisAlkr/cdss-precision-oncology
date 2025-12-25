"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  File,
} from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileAnalyzed?: (data: any) => void;
  isAnalyzing?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  "application/pdf": FileText,
  "text/csv": FileSpreadsheet,
  "application/json": FileSpreadsheet,
  "image/png": Image,
  "image/jpeg": Image,
  "image/jpg": Image,
  default: File,
};

export function FileUpload({
  onFileSelect,
  onFileAnalyzed,
  isAnalyzing = false,
  accept = ".pdf,.csv,.json,.png,.jpg,.jpeg",
  maxSize = 10,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type
    const allowedTypes = accept.split(",").map((t) => t.trim().replace(".", ""));
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedTypes.some((t) => t === fileExtension || file.type.includes(t))) {
      return "File type not supported";
    }

    return null;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);

      const file = e.dataTransfer.files[0];
      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize, accept]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize, accept]
  );

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const getFileIcon = (file: File) => {
    const Icon = FILE_ICONS[file.type] || FILE_ICONS.default;
    return Icon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="upload-zone"
          >
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center w-full p-5 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300",
                isDragging
                  ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                  : "border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-300 hover:bg-indigo-50/50",
                error && "border-rose-300 bg-rose-50"
              )}
            >
              <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Icon */}
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-300",
                  isDragging
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                    : "bg-gradient-to-br from-slate-200 to-slate-300"
                )}
              >
                <Upload
                  className={cn(
                    "w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-300",
                    isDragging ? "text-white" : "text-slate-500"
                  )}
                />
              </motion.div>

              {/* Text */}
              <div className="text-center">
                <p className="text-base sm:text-lg font-semibold text-slate-700 mb-1">
                  {isDragging ? "Drop your file here" : "Upload Patient Document"}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                  Drag & drop or click to browse
                </p>
              </div>

              {/* Supported formats */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {[
                  { icon: FileText, label: "PDF", color: "text-red-500 bg-red-50" },
                  { icon: Image, label: "Images", color: "text-blue-500 bg-blue-50" },
                  { icon: FileSpreadsheet, label: "CSV/JSON", color: "text-green-500 bg-green-50" },
                ].map((format) => (
                  <div
                    key={format.label}
                    className={cn(
                      "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium",
                      format.color
                    )}
                  >
                    <format.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {format.label}
                  </div>
                ))}
              </div>

              {/* Max size hint */}
              <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-slate-400">
                Maximum file size: {maxSize}MB
              </p>
            </label>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-sm text-rose-600">{error}</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key="file-selected"
            className="relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200"
          >
            {/* Close button */}
            {!isAnalyzing && (
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              </button>
            )}

            <div className="flex items-center gap-3 sm:gap-4">
              {/* File icon */}
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                {React.createElement(getFileIcon(selectedFile), {
                  className: "w-5 h-5 sm:w-7 sm:h-7 text-indigo-500",
                })}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                <p className="font-semibold text-sm sm:text-base text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 hidden sm:block">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-100">
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 animate-spin" />
                    <span className="text-xs sm:text-sm font-medium text-indigo-600">
                      Analyzing...
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    <span className="text-xs sm:text-sm font-medium text-emerald-600">
                      Ready
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Status */}
            <div className="mt-3 sm:hidden">
              {isAnalyzing ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span className="text-xs font-medium text-indigo-600">Analyzing...</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">Ready</span>
                </div>
              )}
            </div>

            {/* AI Analysis indicator */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/80 backdrop-blur-sm border border-indigo-100"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base text-slate-800">
                      AI is extracting patient data...
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      This may take a few seconds
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear",
                    }}
                    className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
