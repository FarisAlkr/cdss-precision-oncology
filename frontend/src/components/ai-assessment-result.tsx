"use client";

import { motion } from "framer-motion";
import type { MedicalAssessment } from "@/lib/api";

interface AIAssessmentResultProps {
  assessment: MedicalAssessment;
  onUseData?: () => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "LOW":
      return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    case "INTERMEDIATE":
      return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    case "HIGH":
      return "text-red-400 bg-red-500/20 border-red-500/30";
    default:
      return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  }
};

const getMolecularColor = (group: string) => {
  switch (group) {
    case "POLEmut":
      return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    case "MMRd":
      return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    case "NSMP":
      return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    case "p53abn":
      return "text-red-400 bg-red-500/20 border-red-500/30";
    default:
      return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  }
};

export function AIAssessmentResult({ assessment, onUseData }: AIAssessmentResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header with Risk Score */}
      <div className="glass-premium rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">AI Medical Assessment</h2>
            <p className="text-sm sm:text-base text-white/60">Comprehensive analysis powered by AI</p>
          </div>
          <div className="flex items-center gap-2 sm:block sm:text-right">
            <div className="text-xs sm:text-sm text-white/60 sm:mb-1">Extraction Confidence</div>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400">
              {Math.round(assessment.extraction_confidence * 100)}%
            </div>
          </div>
        </div>

        {/* Risk and Classification Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Risk Score */}
          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${getRiskColor(assessment.risk_category)}`}>
            <div className="text-xs sm:text-sm opacity-80 mb-1">5-Year Recurrence Risk</div>
            <div className="text-2xl sm:text-3xl font-bold">{assessment.five_year_recurrence_risk.toFixed(1)}%</div>
            <div className="text-xs sm:text-sm mt-1">{assessment.risk_category} Risk</div>
          </div>

          {/* Molecular Group */}
          <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${getMolecularColor(assessment.molecular_group)}`}>
            <div className="text-xs sm:text-sm opacity-80 mb-1">Molecular Classification</div>
            <div className="text-2xl sm:text-3xl font-bold">{assessment.molecular_group}</div>
            <div className="text-xs sm:text-sm mt-1">
              {Math.round(assessment.molecular_group_confidence * 100)}% confidence
            </div>
          </div>

          {/* Risk Score */}
          <div className="rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10 bg-white/5">
            <div className="text-xs sm:text-sm text-white/60 mb-1">Overall Risk Score</div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{assessment.risk_score.toFixed(0)}</div>
            <div className="text-xs sm:text-sm text-white/60 mt-1">out of 100</div>
          </div>
        </div>
      </div>

      {/* Clinical Summary */}
      <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Clinical Summary
        </h3>
        <p className="text-sm sm:text-base text-white/80 leading-relaxed">{assessment.clinical_summary}</p>
      </div>

      {/* Key Findings */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Risk Factors */}
        <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-2 sm:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Factors
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {assessment.risk_factors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-white/70">
                <span className="text-red-400 mt-0.5 sm:mt-1 flex-shrink-0">-</span>
                <span>{factor}</span>
              </li>
            ))}
            {assessment.risk_factors.length === 0 && (
              <li className="text-sm sm:text-base text-white/50 italic">No significant risk factors identified</li>
            )}
          </ul>
        </div>

        {/* Protective Factors */}
        <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-emerald-400 mb-2 sm:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Protective Factors
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {assessment.protective_factors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-white/70">
                <span className="text-emerald-400 mt-0.5 sm:mt-1 flex-shrink-0">+</span>
                <span>{factor}</span>
              </li>
            ))}
            {assessment.protective_factors.length === 0 && (
              <li className="text-sm sm:text-base text-white/50 italic">No specific protective factors identified</li>
            )}
          </ul>
        </div>
      </div>

      {/* Molecular Rationale */}
      <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"></span>
          Molecular Classification Rationale
        </h3>
        <p className="text-sm sm:text-base text-white/80 leading-relaxed">{assessment.molecular_rationale}</p>
      </div>

      {/* Treatment Implications */}
      <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
          Treatment Implications
        </h3>
        <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-3 sm:mb-4">{assessment.treatment_implications}</p>

        <h4 className="text-xs sm:text-sm font-semibold text-white/60 mb-1.5 sm:mb-2">Recommended Surveillance</h4>
        <p className="text-sm sm:text-base text-white/70">{assessment.recommended_surveillance}</p>

        {assessment.clinical_trial_eligibility.length > 0 && (
          <>
            <h4 className="text-xs sm:text-sm font-semibold text-white/60 mt-3 sm:mt-4 mb-1.5 sm:mb-2">Clinical Trial Eligibility</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {assessment.clinical_trial_eligibility.map((trial, i) => (
                <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs sm:text-sm">
                  {trial}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detailed Explanation */}
      <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
          Detailed Medical Explanation
        </h3>
        <p className="text-sm sm:text-base text-white/80 leading-relaxed whitespace-pre-wrap">{assessment.detailed_explanation}</p>
      </div>

      {/* Warnings & Missing Data */}
      {(assessment.warnings.length > 0 || assessment.missing_critical_data.length > 0) && (
        <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 border border-amber-500/30">
          <h3 className="text-base sm:text-lg font-semibold text-amber-400 mb-2 sm:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Notes
          </h3>

          {assessment.missing_critical_data.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-semibold text-white/60 mb-1.5 sm:mb-2">Missing Data</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {assessment.missing_critical_data.map((data, i) => (
                  <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs sm:text-sm">
                    {data}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assessment.warnings.length > 0 && (
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white/60 mb-1.5 sm:mb-2">Warnings</h4>
              <ul className="space-y-1">
                {assessment.warnings.map((warning, i) => (
                  <li key={i} className="text-amber-400/80 text-xs sm:text-sm">- {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {onUseData && (
        <div className="flex justify-center px-4 sm:px-0">
          <button
            onClick={onUseData}
            className="btn-premium w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm sm:text-base"
          >
            Use Extracted Data for Assessment
          </button>
        </div>
      )}
    </motion.div>
  );
}
