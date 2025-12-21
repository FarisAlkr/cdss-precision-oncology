"""
Demo Scenarios API Routes

Endpoints for accessing pre-defined clinical scenarios for demo mode.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.data.clinical_evidence import get_scenario, get_all_scenarios, DEMO_SCENARIOS

router = APIRouter()


@router.get("/scenarios")
async def list_scenarios():
    """
    Get list of all demo scenarios

    Returns:
        Dictionary of all scenarios with metadata
    """
    scenarios = get_all_scenarios()

    # Return simplified list for UI
    scenario_list = []
    for scenario_id, scenario in scenarios.items():
        scenario_list.append(
            {
                "id": scenario["id"],
                "title": scenario["title"],
                "subtitle": scenario["subtitle"],
                "description": scenario["description"],
                "expected_molecular_group": scenario.get("expected_molecular_group"),
                "expected_risk_category": scenario.get("expected_risk_category"),
                "key_insight": scenario["key_insight"],
            }
        )

    return {"scenarios": scenario_list, "total": len(scenario_list)}


@router.get("/scenarios/{scenario_id}")
async def get_scenario_details(scenario_id: str):
    """
    Get detailed scenario including patient data

    Args:
        scenario_id: Scenario identifier

    Returns:
        Complete scenario with patient data and narrative
    """
    scenario = get_scenario(scenario_id)

    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    return scenario


@router.get("/scenarios/{scenario_id}/patient")
async def get_scenario_patient(scenario_id: str):
    """
    Get just the patient data for a scenario

    Args:
        scenario_id: Scenario identifier

    Returns:
        Patient data object ready for prediction API
    """
    scenario = get_scenario(scenario_id)

    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")

    # For grey-zone scenario with two patients
    if scenario_id == "grey-zone":
        return {
            "patient_a": scenario["patient_data_a"],
            "patient_b": scenario["patient_data_b"],
        }

    return scenario["patient_data"]
