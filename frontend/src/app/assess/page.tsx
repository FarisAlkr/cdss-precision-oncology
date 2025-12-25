"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { usePatientStore } from "@/stores/patientStore";
import { useResultsStore } from "@/stores/resultsStore";
import { api, MedicalAssessment } from "@/lib/api";
import { parseDocument, validateExtractedData } from "@/lib/document-parser";
import { AIAssessmentResult } from "@/components/ai-assessment-result";
import { FIGO_STAGES, HISTOLOGY_TYPES, GRADES, LVSI_STATUSES, MYOMETRIAL_INVASION_STATUSES, LYMPH_NODE_STATUSES, ECOG_STATUSES } from "@/lib/constants";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  User,
  FlaskConical,
  Activity,
  Microscope,
  Sparkles,
  Shield,
  Clock,
  Dna,
  Heart,
  Brain,
  Info,
  ChevronRight,
  Upload,
  FileText,
  AlertTriangle,
  Wand2,
} from "lucide-react";

const STEPS = [
  {
    id: "demographics",
    title: "Patient Demographics",
    subtitle: "Basic Information",
    icon: User,
    description: "Enter patient demographics and health status",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pathology",
    title: "Pathological Profile",
    subtitle: "Tumor Characteristics",
    icon: Microscope,
    description: "Detailed pathological findings and staging",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "molecular",
    title: "Molecular Markers",
    subtitle: "Biomarker Analysis",
    icon: Dna,
    description: "Molecular profiling and genetic markers",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "clinical",
    title: "Clinical Review",
    subtitle: "Final Confirmation",
    icon: Activity,
    description: "Review and submit for AI analysis",
    color: "from-orange-500 to-amber-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

interface FormFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}

function PremiumFormField({ label, required, helpText, children, icon: Icon }: FormFieldProps) {
  return (
    <motion.div variants={itemVariants} className="group">
      <label className="block mb-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500" />}
          {label}
          {required && <span className="text-rose-500">*</span>}
        </span>
      </label>
      <div className="relative">
        {children}
      </div>
      {helpText && (
        <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="w-3 h-3" />
          {helpText}
        </p>
      )}
    </motion.div>
  );
}

export default function AssessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    filledFields: string[];
    missingFields: string[];
    warnings: string[];
  } | null>(null);
  const [aiAssessment, setAiAssessment] = useState<MedicalAssessment | null>(null);
  const [showAiAssessment, setShowAiAssessment] = useState(false);

  const { patientData, setPatientData } = usePatientStore();
  const { setPrediction, setError } = useResultsStore();

  const handleFileSelect = async (file: File) => {
    setIsAnalyzing(true);
    setUploadResult(null);
    setAiAssessment(null);

    try {
      const fileName = file.name.toLowerCase();

      let extractedData: any = {};
      let warnings: string[] = [];

      if (fileName.endsWith(".csv") || fileName.endsWith(".json")) {
        // Parse locally for CSV/JSON
        const result = await parseDocument(file);
        extractedData = result.data;

        // Validate extracted data
        const validation = validateExtractedData(extractedData);

        // Apply extracted data to form
        if (Object.keys(extractedData).length > 0) {
          setPatientData(extractedData);
        }

        setUploadResult({
          success: validation.filledFields.length > 0,
          filledFields: validation.filledFields,
          missingFields: validation.missingFields,
          warnings,
        });

        // Auto-hide upload section if we got good data
        if (validation.filledFields.length >= 5) {
          setTimeout(() => setShowUpload(false), 2000);
        }
      } else {
        // Use AI-powered analysis for PDF/images
        try {
          const assessment = await api.aiAnalyzeDocument(file);
          setAiAssessment(assessment);
          setShowAiAssessment(true);
          setShowUpload(false);
        } catch (err: any) {
          // Fallback to pattern-based extraction
          try {
            const result = await api.analyzeDocument(file);
            extractedData = result.extracted_data;
            warnings = result.warnings || [];

            const validation = validateExtractedData(extractedData);
            if (Object.keys(extractedData).length > 0) {
              setPatientData(extractedData);
            }

            setUploadResult({
              success: validation.filledFields.length > 0,
              filledFields: validation.filledFields,
              missingFields: validation.missingFields,
              warnings: [...warnings, "AI analysis not available, used pattern extraction instead."],
            });
          } catch (fallbackErr: any) {
            warnings.push(err.message || "AI analysis failed. Please fill the form manually.");
            setUploadResult({
              success: false,
              filledFields: [],
              missingFields: [],
              warnings,
            });
          }
        }
      }
    } catch (err: any) {
      setUploadResult({
        success: false,
        filledFields: [],
        missingFields: [],
        warnings: [err.message || "Failed to analyze document"],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUseAiData = () => {
    if (aiAssessment?.patient_data) {
      setPatientData(aiAssessment.patient_data as any);
      setShowAiAssessment(false);
      // Reset to form view at first step
      setCurrentStep(0);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    if (index < currentStep) {
      setDirection(-1);
      setCurrentStep(index);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const prediction = await api.predict(patientData as any);
      setPrediction(prediction);
      router.push("/results");
    } catch (err: any) {
      setError(err.message || "Failed to generate prediction");
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentIcon = STEPS[currentStep].icon;

  if (!mounted) return null;

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* Ambient Floating Orbs */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-600">HIPAA Compliant</span>
              </div>
              <div className="badge-premium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Step {currentStep + 1}/{STEPS.length}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 mb-4 sm:mb-6">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
            <span className="text-xs sm:text-sm font-medium text-indigo-700">AI-Powered Risk Stratification</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-4">
            <span className="text-slate-800">Patient</span>{" "}
            <span className="text-gradient">Assessment</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Complete the assessment form for comprehensive molecular risk stratification
            powered by advanced machine learning algorithms.
          </p>
        </motion.div>

        {/* Document Upload Section */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto mb-6 sm:mb-10"
            >
              <div className="card-premium rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-xl font-bold text-white">Smart Document Upload</h3>
                        <p className="text-white/80 text-xs sm:text-sm">Upload a patient file to auto-fill</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUpload(false)}
                      className="text-white/80 hover:text-white hover:bg-white/10"
                    >
                      Skip
                    </Button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    isAnalyzing={isAnalyzing}
                  />

                  {/* Upload Result */}
                  <AnimatePresence>
                    {uploadResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 sm:mt-6"
                      >
                        {uploadResult.success ? (
                          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm sm:text-base text-emerald-800">
                                  Extracted {uploadResult.filledFields.length} fields
                                </p>
                                <p className="text-xs sm:text-sm text-emerald-600 mt-1 break-words">
                                  Fields: {uploadResult.filledFields.join(", ")}
                                </p>
                                {uploadResult.missingFields.length > 0 && (
                                  <p className="text-xs sm:text-sm text-amber-600 mt-2 break-words">
                                    Fill manually: {uploadResult.missingFields.join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm sm:text-base text-amber-800">Could not extract data</p>
                                {uploadResult.warnings.map((warning, i) => (
                                  <p key={i} className="text-xs sm:text-sm text-amber-600 mt-1 break-words">{warning}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Toggle to manual entry */}
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-center gap-3 sm:gap-4">
                    <span className="text-xs sm:text-sm text-slate-500">or</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpload(false)}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm"
                    >
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Fill form manually
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Upload Button when hidden */}
        {!showUpload && !showAiAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto mb-6 flex justify-end"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpload(true)}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </motion.div>
        )}

        {/* AI Assessment Results Display */}
        <AnimatePresence>
          {showAiAssessment && aiAssessment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto mb-6 sm:mb-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-800">AI Medical Assessment</h2>
                    <p className="text-xs sm:text-base text-slate-500">Comprehensive analysis of your medical document</p>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAiAssessment(false);
                      setShowUpload(true);
                    }}
                    className="text-slate-600 border-slate-200 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Upload</span> Another
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAiAssessment(false)}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Manual Form
                  </Button>
                </div>
              </div>

              <AIAssessmentResult
                assessment={aiAssessment}
                onUseData={handleUseAiData}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Step Indicator - Hidden when showing AI assessment */}
        {!showAiAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 sm:mb-10"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              const isClickable = idx < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => isClickable && handleStepClick(idx)}
                    disabled={!isClickable}
                    className={`relative flex flex-col items-center group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Step Circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        boxShadow: isActive
                          ? "0 0 0 4px rgba(99, 102, 241, 0.15), 0 8px 24px -4px rgba(99, 102, 241, 0.3)"
                          : "none",
                      }}
                      className={`
                        w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500
                        ${isActive
                          ? `bg-gradient-to-br ${step.color} text-white`
                          : isCompleted
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white"
                            : "bg-white/80 text-slate-400 border-2 border-slate-200"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                      ) : (
                        <StepIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                      )}
                    </motion.div>

                    {/* Step Label */}
                    <div className="mt-2 sm:mt-3 text-center">
                      <p className={`text-[10px] sm:text-sm font-semibold transition-colors duration-300 ${
                        isActive ? "text-slate-800" : isCompleted ? "text-emerald-600" : "text-slate-400"
                      }`}>
                        {step.subtitle}
                      </p>
                      <p className={`text-xs mt-0.5 hidden lg:block ${
                        isActive ? "text-slate-500" : "text-slate-400"
                      }`}>
                        {step.title}
                      </p>
                    </div>

                    {/* Active Indicator Dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute -bottom-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>

                  {/* Connector Line */}
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 mx-1.5 sm:mx-4 h-0.5 rounded-full bg-slate-200 relative overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-5 sm:mt-8 max-w-4xl mx-auto">
            <div className="progress-premium">
              <motion.div
                className="progress-premium-bar"
                initial={false}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 sm:mt-2">
              <span className="text-[10px] sm:text-xs text-slate-400">Assessment Progress</span>
              <span className="text-xs font-medium text-indigo-600">{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </motion.div>
        )}

        {/* Main Form Card - Hidden when showing AI assessment */}
        {!showAiAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="card-premium rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Card Header */}
            <div className={`bg-gradient-to-r ${STEPS[currentStep].color} p-4 sm:p-6 md:p-8`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <CurrentIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white truncate">
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="text-white/80 text-xs sm:text-base mt-0.5 sm:mt-1 line-clamp-2">
                    {STEPS[currentStep].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-6 md:p-10">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {/* Demographics Step */}
                  {currentStep === 0 && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-5 sm:space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="Age" required helpText="Patient age in years (35-90)" icon={User}>
                          <Input
                            type="number"
                            placeholder="Enter age..."
                            value={patientData.age || ""}
                            onChange={(e) => setPatientData({ age: parseInt(e.target.value) || 0 })}
                            className="input-premium h-12 sm:h-14 text-sm sm:text-base"
                          />
                        </PremiumFormField>

                        <PremiumFormField label="BMI" required helpText="Body Mass Index (kg/m²)" icon={Heart}>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Enter BMI..."
                            value={patientData.bmi || ""}
                            onChange={(e) => setPatientData({ bmi: parseFloat(e.target.value) || 0 })}
                            className="input-premium h-12 sm:h-14 text-sm sm:text-base"
                          />
                        </PremiumFormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="ECOG Performance Status" required helpText="Functional status (0-4)" icon={Activity}>
                          <Select
                            value={patientData.ecog_status?.toString()}
                            onValueChange={(value) => setPatientData({ ecog_status: parseInt(value) })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select ECOG status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              {ECOG_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value.toString()} className="py-3">
                                  <span className="font-medium">{status.label}</span>
                                  <span className="text-slate-400 ml-2">- {status.description}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>

                        <PremiumFormField label="Diabetes Status" required helpText="History of diabetes mellitus">
                          <Select
                            value={patientData.diabetes?.toString()}
                            onValueChange={(value) => setPatientData({ diabetes: value === "true" })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              <SelectItem value="false" className="py-3">No Diabetes</SelectItem>
                              <SelectItem value="true" className="py-3">Yes - Diabetic</SelectItem>
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>
                    </motion.div>
                  )}

                  {/* Pathology Step */}
                  {currentStep === 1 && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-5 sm:space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="FIGO Stage" required helpText="2009 FIGO staging system" icon={Microscope}>
                          <Select
                            value={patientData.stage}
                            onValueChange={(value) => setPatientData({ stage: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select stage..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0 max-h-72">
                              {FIGO_STAGES.map((stage) => (
                                <SelectItem key={stage.value} value={stage.value} className="py-3">
                                  <span className="font-semibold text-indigo-600">{stage.label}</span>
                                  <span className="text-slate-400 ml-2 text-sm">- {stage.description}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>

                        <PremiumFormField label="Histology Type" required helpText="Tumor histological classification">
                          <Select
                            value={patientData.histology}
                            onValueChange={(value) => setPatientData({ histology: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select histology..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              {HISTOLOGY_TYPES.map((type) => (
                                <SelectItem key={type} value={type} className="py-3">{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="Tumor Grade" required helpText="Differentiation grade (G1-G3)">
                          <Select
                            value={patientData.grade}
                            onValueChange={(value) => setPatientData({ grade: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select grade..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              {GRADES.map((grade) => (
                                <SelectItem key={grade} value={grade} className="py-3">{grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>

                        <PremiumFormField label="Myometrial Invasion" required helpText="Depth of invasion">
                          <Select
                            value={patientData.myometrial_invasion}
                            onValueChange={(value) => setPatientData({ myometrial_invasion: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select depth..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              {MYOMETRIAL_INVASION_STATUSES.map((status) => (
                                <SelectItem key={status} value={status} className="py-3">{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="LVSI Status" required helpText="Lymphovascular space invasion">
                          <Select
                            value={patientData.lvsi}
                            onValueChange={(value) => setPatientData({ lvsi: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select LVSI status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              {LVSI_STATUSES.map((status) => (
                                <SelectItem key={status} value={status} className="py-3">{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>

                        <PremiumFormField label="Lymph Node Status" required helpText="Regional lymph node involvement">
                          <Select
                            value={patientData.lymph_nodes}
                            onValueChange={(value) => setPatientData({ lymph_nodes: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              {LYMPH_NODE_STATUSES.map((status) => (
                                <SelectItem key={status} value={status} className="py-3">{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>
                    </motion.div>
                  )}

                  {/* Molecular Step */}
                  {currentStep === 2 && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-5 sm:space-y-8"
                    >
                      {/* Molecular Info Banner */}
                      <motion.div
                        variants={itemVariants}
                        className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <Dna className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-emerald-800">TCGA Molecular Classification</h3>
                            <p className="text-sm text-emerald-600 mt-1">
                              Enter biomarker results for accurate molecular subtype classification (POLEmut, MMRd, NSMP, p53abn).
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="POLE Mutation Status" required helpText="Polymerase epsilon mutation" icon={Dna}>
                          <Select
                            value={patientData.pole_status}
                            onValueChange={(value) => setPatientData({ pole_status: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              <SelectItem value="Wild-type" className="py-3">Wild-type</SelectItem>
                              <SelectItem value="Mutated" className="py-3">
                                <span className="text-emerald-600 font-medium">Mutated</span>
                                <span className="text-slate-400 ml-2">- Excellent prognosis</span>
                              </SelectItem>
                              <SelectItem value="Not Tested" className="py-3">Not Tested</SelectItem>
                            </SelectContent>
                          </Select>
                        </PremiumFormField>

                        <PremiumFormField label="MMR Status" required helpText="Mismatch repair protein status">
                          <Select
                            value={patientData.mmr_status}
                            onValueChange={(value) => setPatientData({ mmr_status: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              <SelectItem value="Proficient" className="py-3">Proficient (pMMR)</SelectItem>
                              <SelectItem value="Deficient" className="py-3">
                                <span className="text-blue-600 font-medium">Deficient (dMMR)</span>
                                <span className="text-slate-400 ml-2">- Immunotherapy eligible</span>
                              </SelectItem>
                              <SelectItem value="Not Tested" className="py-3">Not Tested</SelectItem>
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="p53 Status" required helpText="p53 immunohistochemistry pattern">
                          <Select
                            value={patientData.p53_status}
                            onValueChange={(value) => setPatientData({ p53_status: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              <SelectItem value="Wild-type" className="py-3">Wild-type</SelectItem>
                              <SelectItem value="Abnormal" className="py-3">
                                <span className="text-rose-600 font-medium">Abnormal</span>
                                <span className="text-slate-400 ml-2">- Aggressive subtype</span>
                              </SelectItem>
                              <SelectItem value="Not Tested" className="py-3">Not Tested</SelectItem>
                            </SelectContent>
                          </Select>
                        </PremiumFormField>

                        <PremiumFormField label="L1CAM Status" required helpText="L1CAM expression (≥10% cutoff)">
                          <Select
                            value={patientData.l1cam_status}
                            onValueChange={(value) => setPatientData({ l1cam_status: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              <SelectItem value="Negative" className="py-3">Negative (&lt;10%)</SelectItem>
                              <SelectItem value="Positive" className="py-3">Positive (≥10%)</SelectItem>
                              <SelectItem value="Not Tested" className="py-3">Not Tested</SelectItem>
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="CTNNB1 Status" required helpText="β-catenin nuclear accumulation">
                          <Select
                            value={patientData.ctnnb1_status}
                            onValueChange={(value) => setPatientData({ ctnnb1_status: value as any })}
                          >
                            <SelectTrigger className="input-premium h-12 sm:h-14 text-sm sm:text-base">
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-0">
                              <SelectItem value="Wild-type" className="py-3">Wild-type</SelectItem>
                              <SelectItem value="Mutated" className="py-3">Mutated</SelectItem>
                              <SelectItem value="Not Tested" className="py-3">Not Tested</SelectItem>
                            </SelectContent>
                          </Select>
                        </PremiumFormField>
                      </div>
                    </motion.div>
                  )}

                  {/* Clinical Review Step */}
                  {currentStep === 3 && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-5 sm:space-y-8"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <PremiumFormField label="Estrogen Receptor (%)" helpText="Optional: ER expression percentage">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g., 80"
                            value={patientData.er_percent || ""}
                            onChange={(e) => setPatientData({ er_percent: parseFloat(e.target.value) })}
                            className="input-premium h-12 sm:h-14 text-sm sm:text-base"
                          />
                        </PremiumFormField>

                        <PremiumFormField label="Progesterone Receptor (%)" helpText="Optional: PR expression percentage">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g., 60"
                            value={patientData.pr_percent || ""}
                            onChange={(e) => setPatientData({ pr_percent: parseFloat(e.target.value) })}
                            className="input-premium h-12 sm:h-14 text-sm sm:text-base"
                          />
                        </PremiumFormField>
                      </div>

                      {/* Ready to Submit Card */}
                      <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8"
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                              </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid)" />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">Ready for AI Analysis</h3>
                              <p className="text-white/80">Your assessment is complete</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                <span className="text-white/90 font-medium">Demographics</span>
                              </div>
                              <p className="text-white/60 text-sm">Patient profile verified</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                <span className="text-white/90 font-medium">Pathology</span>
                              </div>
                              <p className="text-white/60 text-sm">Tumor characteristics set</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                <span className="text-white/90 font-medium">Molecular</span>
                              </div>
                              <p className="text-white/60 text-sm">Biomarkers recorded</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-white/70">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Analysis typically completes in 1-2 seconds</span>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-slate-100 gap-3">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="btn-secondary-premium flex items-center gap-1.5 sm:gap-2 disabled:opacity-40 text-sm sm:text-base px-3 sm:px-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Previous</span>
                  <span className="xs:hidden">Back</span>
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="btn-premium flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-4 sm:px-6"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-premium flex items-center gap-1.5 sm:gap-2 min-w-0 sm:min-w-[220px] justify-center text-sm sm:text-base px-4 sm:px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Generate Risk Assessment</span>
                        <span className="sm:hidden">Generate</span>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 sm:mt-10 text-center px-4"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span>256-bit Encryption</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-full sm:w-auto text-center">For research purposes only</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
