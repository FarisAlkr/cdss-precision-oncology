"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { ArrowLeft, User, Activity, AlertCircle, TrendingUp, FlaskConical, Sparkles, Target } from "lucide-react";
import { getMolecularColor, getRiskColor } from "@/lib/utils";

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  expected_molecular_group: string;
  expected_risk_category: string;
  key_insight: string;
}

interface ScenarioDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  patient_data: any;
  expected_molecular_group: string;
  expected_risk_category: string;
  key_insight: string;
  narrative_points: string[];
}

export default function DemoPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDetail | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/scenarios");
      const data = await response.json();
      setScenarios(data.scenarios);
    } catch (err) {
      setError("Failed to load scenarios. Make sure the backend is running.");
    }
  };

  const loadScenario = async (scenarioId: string) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      // Fetch scenario details
      const response = await fetch(`http://localhost:8000/api/v1/scenarios/${scenarioId}`);
      const scenario = await response.json();
      setSelectedScenario(scenario);

      // Run prediction
      const predResponse = await fetch("http://localhost:8000/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scenario.patient_data),
      });
      const predResult = await predResponse.json();
      setPrediction(predResult);
    } catch (err) {
      setError("Failed to load scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Interactive Demo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
              Clinical Demo Scenarios
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore 4 real-world scenarios demonstrating how molecular profiling transforms risk assessment
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!selectedScenario ? (
            // Scenario Selection Grid
            <div className="grid md:grid-cols-2 gap-6">
              {scenarios.map((scenario, idx) => {
                const molecularColor = getMolecularColor(scenario.expected_molecular_group);
                const riskColor = getRiskColor(scenario.expected_risk_category);

                return (
                  <Card
                    key={scenario.id}
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 hover:border-blue-200 hover:-translate-y-1 relative overflow-hidden"
                    onClick={() => loadScenario(scenario.id)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                            {scenario.title}
                          </CardTitle>
                          <CardDescription className="text-base">{scenario.subtitle}</CardDescription>
                        </div>
                        <Badge className={`${molecularColor} px-3 py-1 text-sm border-2 ml-3`}>
                          {scenario.expected_molecular_group}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="relative">
                      <p className="text-sm text-slate-700 mb-4 leading-relaxed">{scenario.description}</p>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600">Expected Risk:</span>
                        </div>
                        <Badge className={`${riskColor} px-3 py-1 border-2`}>
                          {scenario.expected_risk_category}
                        </Badge>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 italic">Click to explore this scenario →</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Scenario Details View
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedScenario(null);
                  setPrediction(null);
                }}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scenarios
              </Button>

              {loading ? (
                <Card className="border-2 shadow-xl">
                  <CardContent className="text-center py-20">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                    <p className="text-lg font-medium text-slate-700">Running AI prediction...</p>
                    <p className="text-sm text-slate-500 mt-2">Analyzing molecular profile and clinical features</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Scenario Header Card */}
                  <Card className="border-2 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={`${getMolecularColor(selectedScenario.expected_molecular_group)} mb-3 px-3 py-1 border-2`}>
                            {selectedScenario.expected_molecular_group}
                          </Badge>
                          <CardTitle className="text-3xl mb-2">{selectedScenario.title}</CardTitle>
                          <CardDescription className="text-lg">{selectedScenario.subtitle}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <p className="text-slate-700 mb-6 text-lg leading-relaxed">{selectedScenario.description}</p>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Key Clinical Insight</p>
                            <p className="text-sm text-blue-800 leading-relaxed">{selectedScenario.key_insight}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient Profile Card */}
                  <Card className="border-2 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <User className="h-6 w-6" />
                        Patient Profile
                      </CardTitle>
                      <CardDescription className="text-base">Clinical and pathological characteristics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                          { label: "Age", value: `${selectedScenario.patient_data.age} years` },
                          { label: "BMI", value: selectedScenario.patient_data.bmi },
                          { label: "FIGO Stage", value: selectedScenario.patient_data.stage },
                          { label: "Grade", value: selectedScenario.patient_data.grade },
                          { label: "Histology", value: selectedScenario.patient_data.histology },
                          { label: "MI", value: selectedScenario.patient_data.myometrial_invasion },
                          { label: "LVSI", value: selectedScenario.patient_data.lvsi },
                          { label: "Lymph Nodes", value: selectedScenario.patient_data.lymph_nodes },
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                            <p className="font-semibold text-slate-900">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <FlaskConical className="h-4 w-4" />
                          Molecular Biomarkers
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {[
                            { label: "POLE", value: selectedScenario.patient_data.pole_status },
                            { label: "MMR", value: selectedScenario.patient_data.mmr_status },
                            { label: "p53", value: selectedScenario.patient_data.p53_status },
                            { label: "L1CAM", value: selectedScenario.patient_data.l1cam_status },
                            { label: "CTNNB1", value: selectedScenario.patient_data.ctnnb1_status },
                          ].map((item, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-lg border-2 border-blue-100">
                              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                              <p className="font-semibold text-blue-900 text-sm">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Prediction Results */}
                  {prediction && (
                    <Card className="border-2 border-primary shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-full blur-3xl" />

                      <CardHeader className="relative">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg">
                            <Activity className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">AI Risk Assessment</CardTitle>
                            <CardDescription className="text-base">Real-time molecular-informed prediction</CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="relative space-y-8">
                        {/* Risk Score Display */}
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="flex-shrink-0">
                            <RiskGauge
                              value={prediction.recurrence_probability * 100}
                              category={prediction.risk_category}
                              size="md"
                            />
                          </div>

                          <div className="flex-1 space-y-4 w-full">
                            <div className="bg-white rounded-xl p-6 border-2 border-slate-100">
                              <h4 className="font-semibold text-slate-900 mb-4">Molecular Classification</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Group:</span>
                                  <Badge className={`${getMolecularColor(prediction.molecular_classification.group)} px-3 py-1 border-2`}>
                                    {prediction.molecular_classification.group}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Subtype:</span>
                                  <span className="text-sm font-medium">{prediction.molecular_classification.subtype}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600">Confidence:</span>
                                  <span className="text-sm font-bold">{(prediction.molecular_classification.confidence * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>

                            {prediction.reclassified && (
                              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                  <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-semibold text-yellow-900 mb-2">Risk Reclassified</p>
                                    <div className="space-y-1 text-sm text-yellow-800">
                                      <p>Stage-based: {(prediction.stage_based_risk * 100).toFixed(1)}%</p>
                                      <p className="font-bold">Molecular: {(prediction.recurrence_probability * 100).toFixed(1)}%</p>
                                      <p className="text-xs">
                                        Difference: {prediction.risk_difference > 0 ? "+" : ""}
                                        {(prediction.risk_difference * 100).toFixed(1)}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Clinical Rationale */}
                        <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                          <h4 className="font-semibold text-slate-900 mb-3">Classification Rationale</h4>
                          <p className="text-sm text-slate-700 leading-relaxed mb-4">
                            {prediction.molecular_classification.rationale}
                          </p>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-xs font-semibold text-blue-900 mb-2">Clinical Significance:</p>
                            <p className="text-xs text-blue-800 leading-relaxed">
                              {prediction.molecular_classification.clinical_significance}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Clinical Narrative */}
                  {prediction && (
                    <Card className="border-2 shadow-xl bg-gradient-to-br from-white to-slate-50">
                      <CardHeader>
                        <CardTitle className="text-2xl">Clinical Narrative</CardTitle>
                        <CardDescription className="text-base">
                          Step-by-step explanation of this case's clinical significance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {selectedScenario.narrative_points.map((point, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-slate-100 hover:border-blue-200 transition-colors duration-200"
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                                {idx + 1}
                              </div>
                              <span className="text-sm text-slate-700 leading-relaxed flex-1">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* CTA Section */}
          {!selectedScenario && (
            <div className="mt-12 text-center bg-gradient-to-r from-primary via-blue-600 to-indigo-600 rounded-2xl p-12 text-white shadow-2xl">
              <h2 className="text-3xl font-bold mb-4">Ready to Try Your Own Assessment?</h2>
              <p className="text-lg text-blue-100 mb-8">
                Use our AI-powered tool to assess real patient data
              </p>
              <Link href="/assess">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-8 py-6">
                  Start Assessment
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
