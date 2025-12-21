"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatientStore } from "@/stores/patientStore";
import { useResultsStore } from "@/stores/resultsStore";
import { api } from "@/lib/api";
import { FIGO_STAGES, HISTOLOGY_TYPES, GRADES, LVSI_STATUSES, MYOMETRIAL_INVASION_STATUSES, LYMPH_NODE_STATUSES, ECOG_STATUSES } from "@/lib/constants";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, User, FlaskConical, Activity, FileText } from "lucide-react";

const STEPS = [
  { id: "demographics", title: "Demographics", icon: User },
  { id: "pathology", title: "Pathology", icon: FileText },
  { id: "molecular", title: "Molecular", icon: FlaskConical },
  { id: "clinical", title: "Clinical Features", icon: Activity },
];

export default function AssessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { patientData, setPatientData, isComplete } = usePatientStore();
  const { setPrediction, setError } = useResultsStore();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Badge variant="secondary" className="px-3 py-1">
              Step {currentStep + 1} of {STEPS.length}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Patient Assessment
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Complete the multi-step form to generate AI-powered risk assessment
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-2 ${isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-slate-400"}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive ? "bg-primary text-white shadow-lg scale-110" :
                        isCompleted ? "bg-green-600 text-white" :
                        "bg-slate-200"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className="hidden md:block text-sm font-medium">{step.title}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-12 md:w-24 h-1 mx-2 rounded-full transition-all duration-300 ${
                        isCompleted ? "bg-green-600" : "bg-slate-200"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Form Card */}
          <Card className="shadow-2xl border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  if (idx === currentStep) {
                    return <Icon key={step.id} className="h-6 w-6 text-primary" />;
                  }
                  return null;
                })}
                <CardTitle className="text-2xl">{STEPS[currentStep].title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {currentStep === 0 && "Basic patient information and demographics"}
                {currentStep === 1 && "Pathological findings and tumor characteristics"}
                {currentStep === 2 && "Molecular biomarkers and genetic testing"}
                {currentStep === 3 && "Clinical features and comorbidities"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Demographics Step */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Age"
                      htmlFor="age"
                      required
                      helpText="Patient age in years"
                      error={errors.age}
                    >
                      <Input
                        id="age"
                        type="number"
                        placeholder="65"
                        value={patientData.age || ""}
                        onChange={(e) => setPatientData({ age: parseInt(e.target.value) || 0 })}
                      />
                    </FormField>

                    <FormField
                      label="BMI"
                      htmlFor="bmi"
                      required
                      helpText="Body Mass Index (kg/m²)"
                      error={errors.bmi}
                    >
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        placeholder="28.5"
                        value={patientData.bmi || ""}
                        onChange={(e) => setPatientData({ bmi: parseFloat(e.target.value) || 0 })}
                      />
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="ECOG Performance Status"
                      htmlFor="ecog"
                      required
                      helpText="Patient functional status (0-4)"
                    >
                      <Select
                        value={patientData.ecog_status?.toString()}
                        onValueChange={(value) => setPatientData({ ecog_status: parseInt(value) })}
                      >
                        <SelectTrigger id="ecog">
                          <SelectValue placeholder="Select ECOG status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ECOG_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value.toString()}>
                              {status.label}: {status.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Diabetes"
                      htmlFor="diabetes"
                      required
                      helpText="History of diabetes mellitus"
                    >
                      <Select
                        value={patientData.diabetes?.toString()}
                        onValueChange={(value) => setPatientData({ diabetes: value === "true" })}
                      >
                        <SelectTrigger id="diabetes">
                          <SelectValue placeholder="Select diabetes status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Pathology Step */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="FIGO Stage"
                      htmlFor="stage"
                      required
                      helpText="2009 FIGO staging"
                    >
                      <Select
                        value={patientData.stage}
                        onValueChange={(value) => setPatientData({ stage: value as any })}
                      >
                        <SelectTrigger id="stage">
                          <SelectValue placeholder="Select FIGO stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIGO_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}: {stage.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Histology"
                      htmlFor="histology"
                      required
                      helpText="Tumor histological type"
                    >
                      <Select
                        value={patientData.histology}
                        onValueChange={(value) => setPatientData({ histology: value as any })}
                      >
                        <SelectTrigger id="histology">
                          <SelectValue placeholder="Select histology" />
                        </SelectTrigger>
                        <SelectContent>
                          {HISTOLOGY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Grade"
                      htmlFor="grade"
                      required
                      helpText="Tumor differentiation grade"
                    >
                      <Select
                        value={patientData.grade}
                        onValueChange={(value) => setPatientData({ grade: value as any })}
                      >
                        <SelectTrigger id="grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Myometrial Invasion"
                      htmlFor="myometrial"
                      required
                      helpText="Depth of myometrial invasion"
                    >
                      <Select
                        value={patientData.myometrial_invasion}
                        onValueChange={(value) => setPatientData({ myometrial_invasion: value as any })}
                      >
                        <SelectTrigger id="myometrial">
                          <SelectValue placeholder="Select invasion depth" />
                        </SelectTrigger>
                        <SelectContent>
                          {MYOMETRIAL_INVASION_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="LVSI"
                      htmlFor="lvsi"
                      required
                      helpText="Lymphovascular space invasion"
                    >
                      <Select
                        value={patientData.lvsi}
                        onValueChange={(value) => setPatientData({ lvsi: value as any })}
                      >
                        <SelectTrigger id="lvsi">
                          <SelectValue placeholder="Select LVSI status" />
                        </SelectTrigger>
                        <SelectContent>
                          {LVSI_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="Lymph Nodes"
                      htmlFor="lymph_nodes"
                      required
                      helpText="Lymph node involvement"
                    >
                      <Select
                        value={patientData.lymph_nodes}
                        onValueChange={(value) => setPatientData({ lymph_nodes: value as any })}
                      >
                        <SelectTrigger id="lymph_nodes">
                          <SelectValue placeholder="Select lymph node status" />
                        </SelectTrigger>
                        <SelectContent>
                          {LYMPH_NODE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Molecular Step */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="POLE Status"
                      htmlFor="pole"
                      required
                      helpText="POLE mutation status"
                    >
                      <Select
                        value={patientData.pole_status}
                        onValueChange={(value) => setPatientData({ pole_status: value as any })}
                      >
                        <SelectTrigger id="pole">
                          <SelectValue placeholder="Select POLE status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wild-type">Wild-type</SelectItem>
                          <SelectItem value="Mutated">Mutated</SelectItem>
                          <SelectItem value="Not Tested">Not Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="MMR Status"
                      htmlFor="mmr"
                      required
                      helpText="Mismatch repair protein status"
                    >
                      <Select
                        value={patientData.mmr_status}
                        onValueChange={(value) => setPatientData({ mmr_status: value as any })}
                      >
                        <SelectTrigger id="mmr">
                          <SelectValue placeholder="Select MMR status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Proficient">Proficient (pMMR)</SelectItem>
                          <SelectItem value="Deficient">Deficient (dMMR)</SelectItem>
                          <SelectItem value="Not Tested">Not Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="p53 Status"
                      htmlFor="p53"
                      required
                      helpText="p53 immunohistochemistry"
                    >
                      <Select
                        value={patientData.p53_status}
                        onValueChange={(value) => setPatientData({ p53_status: value as any })}
                      >
                        <SelectTrigger id="p53">
                          <SelectValue placeholder="Select p53 status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wild-type">Wild-type</SelectItem>
                          <SelectItem value="Abnormal">Abnormal</SelectItem>
                          <SelectItem value="Not Tested">Not Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField
                      label="L1CAM Status"
                      htmlFor="l1cam"
                      required
                      helpText="L1CAM expression (≥10% cutoff)"
                    >
                      <Select
                        value={patientData.l1cam_status}
                        onValueChange={(value) => setPatientData({ l1cam_status: value as any })}
                      >
                        <SelectTrigger id="l1cam">
                          <SelectValue placeholder="Select L1CAM status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Negative">Negative (&lt;10%)</SelectItem>
                          <SelectItem value="Positive">Positive (≥10%)</SelectItem>
                          <SelectItem value="Not Tested">Not Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="CTNNB1 Status"
                      htmlFor="ctnnb1"
                      required
                      helpText="β-catenin nuclear accumulation"
                    >
                      <Select
                        value={patientData.ctnnb1_status}
                        onValueChange={(value) => setPatientData({ ctnnb1_status: value as any })}
                      >
                        <SelectTrigger id="ctnnb1">
                          <SelectValue placeholder="Select CTNNB1 status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wild-type">Wild-type</SelectItem>
                          <SelectItem value="Mutated">Mutated</SelectItem>
                          <SelectItem value="Not Tested">Not Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Clinical Features Step */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Estrogen Receptor (ER %)"
                      htmlFor="er_percent"
                      helpText="Optional: ER expression percentage"
                    >
                      <Input
                        id="er_percent"
                        type="number"
                        step="0.1"
                        placeholder="80"
                        value={patientData.er_percent || ""}
                        onChange={(e) => setPatientData({ er_percent: parseFloat(e.target.value) })}
                      />
                    </FormField>

                    <FormField
                      label="Progesterone Receptor (PR %)"
                      htmlFor="pr_percent"
                      helpText="Optional: PR expression percentage"
                    >
                      <Input
                        id="pr_percent"
                        type="number"
                        step="0.1"
                        placeholder="60"
                        value={patientData.pr_percent || ""}
                        onChange={(e) => setPatientData({ pr_percent: parseFloat(e.target.value) })}
                      />
                    </FormField>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Form Complete - Ready to Submit
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                      You've completed all required fields. Click "Generate Risk Assessment" to get your AI-powered prediction.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Activity className="h-4 w-4" />
                      <span>Prediction typically takes 1-2 seconds</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button onClick={handleNext} size="lg">
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Risk Assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>All data is processed securely and used only for risk assessment purposes.</p>
            <p className="mt-1">For demo purposes only. Not for clinical decision-making.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
