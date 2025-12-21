"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, MOLECULAR_GROUP_INFO } from "@/lib/constants";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  FlaskConical,
  Hospital,
  Lightbulb,
  LineChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header with Glassmorphism */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 50 ? "rgba(255, 255, 255, 0.9)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(12px)" : "none",
          borderBottom: scrollY > 50 ? "1px solid rgba(148, 163, 184, 0.1)" : "none",
          boxShadow: scrollY > 50 ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="relative z-10">OE</span>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    v1.0
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0 border-green-300 text-green-700">
                    AI-Powered
                  </Badge>
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/#features"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200"
              >
                How It Works
              </Link>
              <Link
                href="/demo"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200"
              >
                Demo
              </Link>
              <Link href="/assess">
                <Button size="sm" className="shadow-md hover:shadow-lg transition-all duration-300">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Premium */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium shadow-sm">
                <Sparkles className="w-3 h-3 mr-1.5" />
                AI-Powered Clinical Intelligence
              </Badge>
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-blue-200 text-blue-700">
                <Shield className="w-3 h-3 mr-1.5" />
                Evidence-Based
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Transform Endometrial
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Cancer Risk Assessment
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Precision oncology meets artificial intelligence. Integrate molecular profiling with anatomical staging
              for truly personalized cancer care.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/assess">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 group"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 hover:bg-slate-50 transition-all duration-300 group"
                >
                  <Activity className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  View Live Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 pt-12 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>PORTEC-3 Based</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>ESGO Guidelines</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Clinical Validation</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-12 animate-bounce">
              <ChevronDown className="h-6 w-6 text-slate-400 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement - Premium Cards */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                The Challenge
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Traditional Staging Falls Short
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Anatomical staging alone misses 27.4% of patients who need different treatment
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Approach */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-red-100 hover:border-red-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-8 w-8 text-red-600" />
                    <Badge variant="destructive">Limited</Badge>
                  </div>
                  <CardTitle className="text-2xl">Traditional FIGO Staging</CardTitle>
                  <CardDescription className="text-base">Anatomical features only</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-slate-700">Based solely on tumor extent and spread</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-slate-700">Misses underlying tumor biology</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      <span className="text-slate-700">Can dramatically over- or under-estimate risk</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-red-100">
                    <p className="text-sm font-semibold text-red-700">
                      Example: Stage IA + p53abn → 16-19% recurrence (not 5%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Molecular Approach */}
              <Card className="group hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Brain className="h-8 w-8 text-green-600" />
                    <Badge className="bg-green-600">Advanced</Badge>
                  </div>
                  <CardTitle className="text-2xl">Molecular Integration</CardTitle>
                  <CardDescription className="text-base">Biology-informed precision medicine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Integrates TCGA molecular classification</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Captures aggressive biology in early-stage disease</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Identifies treatment de-escalation opportunities</span>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-green-100">
                    <p className="text-sm font-semibold text-green-700">
                      27.4% of patients reclassified with molecular data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Lightbulb className="w-3 h-3 mr-1.5" />
                Our Approach
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Four powerful steps to precision risk stratification
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FlaskConical,
                  step: "01",
                  title: "Molecular Classification",
                  description: "ProMisE/TCGA hierarchical algorithm classifies into POLEmut, MMRd, NSMP, or p53abn",
                  color: "blue",
                },
                {
                  icon: Brain,
                  step: "02",
                  title: "AI Risk Prediction",
                  description: "XGBoost ML model predicts 5-year recurrence probability with 75% AUC",
                  color: "indigo",
                },
                {
                  icon: LineChart,
                  step: "03",
                  title: "SHAP Explainability",
                  description: "Transparent feature contribution analysis shows why the prediction was made",
                  color: "purple",
                },
                {
                  icon: Hospital,
                  step: "04",
                  title: "Treatment Recommendations",
                  description: "Evidence-based guidelines from PORTEC-3, ESGO, and RAINBO trials",
                  color: "pink",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={idx}
                    className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden border-2"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-full blur-2xl`} />
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-400 mb-2">STEP {item.step}</div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Molecular Groups - Interactive Cards */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <FlaskConical className="w-3 h-3 mr-1.5" />
                TCGA Classification
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Four Molecular Groups</h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Each with distinct biology, prognosis, and treatment recommendations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(MOLECULAR_GROUP_INFO).map(([key, group]) => (
                <Card
                  key={key}
                  className="group hover:shadow-2xl transition-all duration-500 border-2 hover:scale-[1.02] bg-white/95 backdrop-blur-sm"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-4 py-2 rounded-lg font-bold text-lg ${group.colorClass} bg-opacity-20`}>
                        {group.displayName}
                      </div>
                      <Badge variant="outline" className="border-slate-300">
                        {group.frequency}
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900">{group.shortDescription}</CardTitle>
                    <CardDescription className="text-base text-slate-600">{group.prognosis}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Features:</h4>
                      <p className="text-sm text-slate-700">{group.keyFeatures}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-slate-600" />
                        <span className="font-medium text-slate-900">
                          5-year recurrence: {group.recurrenceRate}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Zap className="w-3 h-3 mr-1.5" />
                Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Built for Clinical Excellence
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Every feature designed with oncologists and patients in mind
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart3,
                  title: "Risk Stratification",
                  description: "Accurate 5-year recurrence risk with confidence intervals and percentiles",
                },
                {
                  icon: Activity,
                  title: "Real-time Predictions",
                  description: "Instant AI-powered analysis with sub-second response times",
                },
                {
                  icon: LineChart,
                  title: "Visual Explanations",
                  description: "SHAP waterfall charts show which features drive the prediction",
                },
                {
                  icon: Users,
                  title: "Clinical Scenarios",
                  description: "4 demo cases showcasing molecular reclassification in action",
                },
                {
                  icon: Shield,
                  title: "Evidence-Based",
                  description: "Recommendations grounded in PORTEC-3 and RAINBO trial data",
                },
                {
                  icon: Sparkles,
                  title: "Transparent AI",
                  description: "Full interpretability with feature contributions and confidence scores",
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="group p-6 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-100"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Cancer Care?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Start using AI-powered molecular risk assessment today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assess">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 text-lg px-8 py-6 shadow-xl">
                  Start Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  View Demo Cases
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold">
                    OE
                  </div>
                  <span className="text-xl font-bold text-white">{APP_NAME}</span>
                </div>
                <p className="text-sm text-slate-400 max-w-md">
                  AI-powered precision risk stratification for endometrial cancer. Bridging the gap between
                  anatomical staging and molecular biology.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/assess" className="hover:text-white transition-colors">
                      Assessment
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="hover:text-white transition-colors">
                      Demo Scenarios
                    </Link>
                  </li>
                  <li>
                    <Link href="/#features" className="hover:text-white transition-colors">
                      Features
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://pubmed.ncbi.nlm.nih.gov/30579872/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      PORTEC-3 Trial
                    </a>
                  </li>
                  <li>
                    <a href="https://www.esgo.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                      ESGO Guidelines
                    </a>
                  </li>
                  <li>
                    <a href="http://localhost:8000/api/docs" className="hover:text-white transition-colors">
                      API Documentation
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-sm text-center text-slate-500">
              <p>&copy; 2025 {APP_NAME}. Built for Soroka Medical Center presentation.</p>
              <p className="mt-2">For research and educational purposes only. Not for clinical use.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
