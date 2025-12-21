"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { useResultsStore } from "@/stores/resultsStore";
import { getMolecularColor, getRiskColor, formatPercentage } from "@/lib/utils";
import {
  ArrowLeft,
  TrendingUp,
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
} from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const { prediction, loading, error } = useResultsStore();

  useEffect(() => {
    if (!loading && !prediction && !error) {
      router.push("/assess");
    }
  }, [loading, prediction, error, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-slate-600">Generating risk assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">{error}</p>
            <Button onClick={() => router.push("/assess")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!prediction) return null;

  const molecularColor = getMolecularColor(prediction.molecular_classification.group);
  const riskPercentage = prediction.recurrence_probability * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/assess" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              New Assessment
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Activity className="w-3 h-3 mr-1.5" />
              AI Risk Assessment Complete
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Risk Assessment Results
            </h1>
            <p className="text-lg text-slate-600">
              Generated on {new Date(prediction.assessment_date).toLocaleDateString()} at{" "}
              {new Date(prediction.assessment_date).toLocaleTimeString()}
            </p>
          </div>

          {/* Main Risk Score Card */}
          <Card className="mb-8 border-2 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
            <CardHeader className="text-center pb-8 relative">
              <CardTitle className="text-3xl mb-2">5-Year Recurrence Risk</CardTitle>
              <CardDescription className="text-lg">
                AI-powered prediction based on molecular profiling and clinical features
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12 relative">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                {/* Risk Gauge */}
                <div>
                  <RiskGauge
                    value={riskPercentage}
                    category={prediction.risk_category}
                    size="lg"
                  />
                </div>

                {/* Risk Details */}
                <div className="space-y-6 flex-1 max-w-md">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Risk Category</span>
                      <Badge
                        className={`${getRiskColor(prediction.risk_category)} px-4 py-1 text-base`}
                      >
                        {prediction.risk_category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Risk Percentile</span>
                      <span className="text-lg font-bold">{prediction.risk_percentile}th</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Model Version</span>
                      <span className="text-sm">{prediction.model_version}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Risk Comparison
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Stage-based risk:</span>
                        <span className="font-medium">{formatPercentage(prediction.stage_based_risk)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Molecular-informed risk:</span>
                        <span className="font-bold">{formatPercentage(prediction.recurrence_probability)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Difference:</span>
                        <span className={`font-bold ${prediction.risk_difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {prediction.risk_difference > 0 ? '+' : ''}
                          {formatPercentage(prediction.risk_difference)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {prediction.reclassified && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-yellow-900 text-sm">Risk Reclassified</p>
                          <p className="text-xs text-yellow-800 mt-1">
                            Molecular profiling significantly changed the risk assessment compared to stage-based prediction.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Molecular Classification Card */}
          <Card className="mb-8 border-2 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FlaskConical className="h-6 w-6" />
                    Molecular Classification
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    TCGA/ProMisE molecular subtype determination
                  </CardDescription>
                </div>
                <Badge className={`${molecularColor} px-4 py-2 text-lg border-2`}>
                  {prediction.molecular_classification.group}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">Molecular Group</h4>
                  <p className="text-lg font-medium">{prediction.molecular_classification.group}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">Subtype</h4>
                  <p className="text-lg font-medium">{prediction.molecular_classification.subtype}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">Confidence</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.molecular_classification.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{(prediction.molecular_classification.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Classification Rationale</h4>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 border border-slate-200">
                  {prediction.molecular_classification.rationale}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Clinical Significance</h4>
                <p className="text-sm text-slate-700 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  {prediction.molecular_classification.clinical_significance}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Risk Level</CardTitle>
                    <CardDescription>Categorization</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${getRiskColor(prediction.risk_category)}`}>
                  {prediction.risk_category}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  Based on {formatPercentage(prediction.recurrence_probability)} recurrence probability
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Molecular Group</CardTitle>
                    <CardDescription>TCGA Classification</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${molecularColor}`}>
                  {prediction.molecular_classification.group}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {prediction.molecular_classification.subtype}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Model Confidence</CardTitle>
                    <CardDescription>Prediction Certainty</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {(prediction.molecular_classification.confidence * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  High confidence classification
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Clinical Recommendations Placeholder */}
          <Card className="mb-8 border-2 shadow-xl bg-gradient-to-br from-slate-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Next Steps
              </CardTitle>
              <CardDescription className="text-base">
                Recommended actions based on risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-blue-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Molecular Testing Complete</p>
                    <p className="text-sm text-slate-600 mt-1">
                      All required biomarkers have been assessed for comprehensive risk stratification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-yellow-100">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Review with Multidisciplinary Team</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Discuss molecular findings and risk assessment in tumor board for treatment planning
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-100">
                  <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Consider Clinical Trial Eligibility</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Evaluate eligibility for molecular subtype-specific clinical trials (e.g., RAINBO)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assess">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Demo Scenarios
              </Button>
            </Link>
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600">
              <Download className="mr-2 h-4 w-4" />
              Export Full Report
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 text-center text-sm text-slate-500 bg-slate-100 rounded-lg p-6 border border-slate-200">
            <p className="font-semibold mb-2">Important Disclaimer</p>
            <p>
              This AI-powered risk assessment is for research and educational purposes only.
              It should not be used as the sole basis for clinical decision-making.
              Always consult with qualified healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
