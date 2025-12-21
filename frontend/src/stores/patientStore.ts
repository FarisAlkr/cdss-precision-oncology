/**
 * Patient Data Store
 * Manages patient data during assessment form
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PatientData } from "@/lib/types";

interface PatientStore {
  patientData: Partial<PatientData>;
  setPatientData: (data: Partial<PatientData>) => void;
  updateField: (field: keyof PatientData, value: any) => void;
  resetPatientData: () => void;
  isComplete: () => boolean;
}

const initialPatientData: Partial<PatientData> = {
  diabetes: false,
  ecog_status: 0,
};

export const usePatientStore = create<PatientStore>()(
  persist(
    (set, get) => ({
      patientData: initialPatientData,

      setPatientData: (data) =>
        set((state) => ({
          patientData: { ...state.patientData, ...data },
        })),

      updateField: (field, value) =>
        set((state) => ({
          patientData: { ...state.patientData, [field]: value },
        })),

      resetPatientData: () =>
        set({
          patientData: initialPatientData,
        }),

      isComplete: () => {
        const data = get().patientData;
        const requiredFields: (keyof PatientData)[] = [
          "age",
          "bmi",
          "stage",
          "histology",
          "grade",
          "myometrial_invasion",
          "lvsi",
          "lymph_nodes",
          "pole_status",
          "mmr_status",
          "p53_status",
          "l1cam_status",
          "ctnnb1_status",
        ];

        return requiredFields.every(
          (field) => data[field] !== undefined && data[field] !== null && data[field] !== ""
        );
      },
    }),
    {
      name: "patient-data-storage",
    }
  )
);
