"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { useResultsStore } from "@/stores/resultsStore";
import { getMolecularColor, getRiskColor, formatPercentage } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Activity,
  FileText,
  Download,
  Share2,
  BarChart3,
  Target,
  Zap,
  Sparkles,
  Shield,
  Brain,
  Dna,
  Clock,
  Info,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

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

const MOLECULAR_DESCRIPTIONS: Record<string, { title: string; description: string; prognosis: string; color: string }> = {
  POLEmut: {
    title: "POLE Mutated",
    description: "Excellent prognosis due to ultramutated phenotype with robust anti-tumor immune response.",
    prognosis: "Excellent",
    color: "from-emerald-500 to-teal-500",
  },
  MMRd: {
    title: "Mismatch Repair Deficient",
    description: "Associated with Lynch syndrome. Potential candidate for immune checkpoint inhibitor therapy.",
    prognosis: "Intermediate-Favorable",
    color: "from-blue-500 to-cyan-500",
  },
  NSMP: {
    title: "No Specific Molecular Profile",
    description: "Risk stratified by traditional clinicopathological features and L1CAM/CTNNB1 status.",
    prognosis: "Variable",
    color: "from-slate-500 to-gray-500",
  },
  p53abn: {
    title: "p53 Abnormal",
    description: "Associated with aggressive tumor biology and copy-number high phenotype.",
    prognosis: "Poor",
    color: "from-rose-500 to-red-500",
  },
};

export default function ResultsPage() {
  const router = useRouter();
  const { prediction, loading, error } = useResultsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !prediction && !error) {
      router.push("/assess");
    }
  }, [loading, prediction, error, router]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh relative overflow-hidden flex items-center justify-center">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-premium p-12 rounded-3xl"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <Brain className="absolute inset-0 m-auto w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Patient Data</h3>
          <p className="text-slate-500">AI is processing molecular and clinical features...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-mesh relative overflow-hidden flex items-center justify-center p-6">
        <div className="floating-orb floating-orb-1" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-premium p-8 rounded-3xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 text-center mb-2">Assessment Error</h3>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <Button onClick={() => router.push("/assess")} className="w-full" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Assessment
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!prediction) return null;

  const molecularInfo = MOLECULAR_DESCRIPTIONS[prediction.molecular_classification.group] || MOLECULAR_DESCRIPTIONS.NSMP;
  const riskPercentage = prediction.recurrence_probability * 100;
  const isRiskIncreased = prediction.risk_difference > 0;

  return (
    <div className="min-h-screen gradient-mesh relative overflow-hidden">
      {/* Ambient Floating Orbs */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      <div className="floating-orb floating-orb-3" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/assess"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-all duration-300 group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="hidden sm:inline">New Assessment</span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 mb-6">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">AI Analysis Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="text-slate-800">Risk Assessment</span>{" "}
            <span className="text-gradient">Results</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Generated on {new Date(prediction.assessment_date).toLocaleDateString()} at{" "}
            {new Date(prediction.assessment_date).toLocaleTimeString()}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Main Risk Score Card */}
          <motion.div variants={itemVariants}>
            <div className="card-premium rounded-3xl overflow-hidden">
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${
                prediction.risk_category === 'LOW' ? 'from-emerald-500 to-teal-500' :
                prediction.risk_category === 'INTERMEDIATE' ? 'from-amber-500 to-orange-500' :
                'from-rose-500 to-red-500'
              } p-6 sm:p-8`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">5-Year Recurrence Risk</h2>
                    <p className="text-white/80 mt-1">AI-powered molecular risk stratification</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-10">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                  {/* Risk Gauge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                    className="relative"
                  >
                    <div className={`absolute inset-0 blur-3xl opacity-30 ${
                      prediction.risk_category === 'LOW' ? 'bg-emerald-400' :
                      prediction.risk_category === 'INTERMEDIATE' ? 'bg-amber-400' :
                      'bg-rose-400'
                    }`} />
                    <RiskGauge
                      value={riskPercentage}
                      category={prediction.risk_category}
                      size="lg"
                    />
                  </motion.div>

                  {/* Risk Details */}
                  <div className="space-y-6 flex-1 max-w-lg">
                    {/* Risk Category Badge */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                      <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Risk Category</span>
                      <Badge className={`${getRiskColor(prediction.risk_category)} px-5 py-2 text-base font-bold rounded-xl`}>
                        {prediction.risk_category} RISK
                      </Badge>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Risk Percentile</p>
                        <p className="text-2xl font-bold text-indigo-700">{prediction.risk_percentile}<span className="text-base">th</span></p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Model Version</p>
                        <p className="text-lg font-bold text-slate-700">{prediction.model_version}</p>
                      </div>
                    </div>

                    {/* Risk Comparison */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-slate-800">Risk Comparison</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Stage-based risk</span>
                          <span className="font-semibold text-slate-700">{formatPercentage(prediction.stage_based_risk)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Molecular-informed risk</span>
                          <span className="font-bold text-indigo-600">{formatPercentage(prediction.recurrence_probability)}</span>
                        </div>
                        <div className="pt-3 border-t border-blue-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Impact of Molecular Profiling</span>
                            <span className={`flex items-center gap-1 font-bold ${isRiskIncreased ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {isRiskIncreased ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {isRiskIncreased ? '+' : ''}{formatPercentage(prediction.risk_difference)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reclassification Alert */}
                    {prediction.reclassified && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-amber-800">Risk Reclassified</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Molecular profiling significantly changed the risk assessment compared to traditional staging alone.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Molecular Classification Card */}
          <motion.div variants={itemVariants}>
            <div className="card-premium rounded-3xl overflow-hidden">
              <div className={`bg-gradient-to-r ${molecularInfo.color} p-6 sm:p-8`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Dna className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">Molecular Classification</h2>
                      <p className="text-white/80 mt-1">TCGA/ProMisE molecular subtype</p>
                    </div>
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                    <p className="text-white text-2xl font-bold">{prediction.molecular_classification.group}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">{molecularInfo.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{molecularInfo.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prognosis</p>
                        <p className={`text-lg font-bold ${
                          molecularInfo.prognosis === 'Excellent' ? 'text-emerald-600' :
                          molecularInfo.prognosis === 'Poor' ? 'text-rose-600' :
                          'text-amber-600'
                        }`}>{molecularInfo.prognosis}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
                        <p className="text-lg font-bold text-indigo-600">
                          {(prediction.molecular_classification.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">Classification Confidence</span>
                        <span className="text-sm font-bold text-indigo-600">
                          {(prediction.molecular_classification.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.molecular_classification.confidence * 100}%` }}
                          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full bg-gradient-to-r ${molecularInfo.color}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-500" />
                        Classification Rationale
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {prediction.molecular_classification.rationale}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Clinical Significance
                      </h4>
                      <p className="text-sm text-indigo-700 leading-relaxed">
                        {prediction.molecular_classification.clinical_significance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Insights Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Risk Level",
                subtitle: "Categorization",
                value: prediction.risk_category,
                description: `Based on ${formatPercentage(prediction.recurrence_probability)} recurrence probability`,
                gradient: "from-blue-500 to-indigo-600",
                valueColor: getRiskColor(prediction.risk_category),
              },
              {
                icon: FlaskConical,
                title: "Molecular Group",
                subtitle: "TCGA Classification",
                value: prediction.molecular_classification.group,
                description: prediction.molecular_classification.subtype,
                gradient: "from-purple-500 to-pink-600",
                valueColor: "text-purple-600",
              },
              {
                icon: Zap,
                title: "Model Confidence",
                subtitle: "Prediction Certainty",
                value: `${(prediction.molecular_classification.confidence * 100).toFixed(0)}%`,
                description: "High confidence classification",
                gradient: "from-emerald-500 to-teal-600",
                valueColor: "text-emerald-600",
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card-premium card-glow rounded-2xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                      <card.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{card.title}</h3>
                      <p className="text-sm text-slate-500">{card.subtitle}</p>
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${card.valueColor} mb-2`}>{card.value}</p>
                  <p className="text-sm text-slate-500">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Next Steps Card */}
          <motion.div variants={itemVariants}>
            <div className="card-premium rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">Recommended Next Steps</h2>
                    <p className="text-white/70 mt-1">Actions based on risk assessment</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="space-y-4">
                  {[
                    {
                      icon: CheckCircle2,
                      color: "from-emerald-400 to-teal-500",
                      bgColor: "from-emerald-50 to-teal-50",
                      borderColor: "border-emerald-200",
                      title: "Molecular Testing Complete",
                      description: "All required biomarkers have been assessed for comprehensive risk stratification.",
                    },
                    {
                      icon: Activity,
                      color: "from-amber-400 to-orange-500",
                      bgColor: "from-amber-50 to-orange-50",
                      borderColor: "border-amber-200",
                      title: "Review with Multidisciplinary Team",
                      description: "Discuss molecular findings and risk assessment in tumor board for treatment planning.",
                    },
                    {
                      icon: Target,
                      color: "from-blue-400 to-indigo-500",
                      bgColor: "from-blue-50 to-indigo-50",
                      borderColor: "border-blue-200",
                      title: "Consider Clinical Trial Eligibility",
                      description: "Evaluate eligibility for molecular subtype-specific clinical trials (e.g., RAINBO).",
                    },
                  ].map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r ${step.bgColor} border-2 ${step.borderColor}`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{step.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assess">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </Link>
            <Button size="lg" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export Full Report
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <p className="font-semibold text-slate-600">Important Disclaimer</p>
            </div>
            <p className="text-sm text-slate-500 max-w-3xl mx-auto leading-relaxed">
              This AI-powered risk assessment is for research and educational purposes only.
              It should not be used as the sole basis for clinical decision-making.
              Always consult with qualified healthcare professionals for medical advice.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
