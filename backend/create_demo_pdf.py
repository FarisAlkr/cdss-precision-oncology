"""Create a demo PDF for patient data that can be extracted via pattern matching"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

def create_patient_report_pdf(output_path: str):
    """Create a professional-looking patient pathology report PDF"""

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1e3a5f')
    )

    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=15,
        spaceAfter=10,
        textColor=colors.HexColor('#2563eb')
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        leading=14
    )

    elements = []

    # Header
    elements.append(Paragraph("PATHOLOGY & MOLECULAR REPORT", title_style))
    elements.append(Paragraph("Endometrial Cancer Comprehensive Assessment", styles['Heading3']))
    elements.append(Spacer(1, 20))

    # Patient Demographics
    elements.append(Paragraph("PATIENT DEMOGRAPHICS", section_style))

    demo_data = [
        ["Patient ID:", "EC-2024-0847"],
        ["Age:", "64 years"],
        ["BMI:", "32.5 kg/m²"],
        ["ECOG Status:", "1"],
        ["Diabetes:", "No"],
    ]

    demo_table = Table(demo_data, colWidths=[3*cm, 8*cm])
    demo_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
    ]))
    elements.append(demo_table)
    elements.append(Spacer(1, 15))

    # Pathological Findings
    elements.append(Paragraph("PATHOLOGICAL FINDINGS", section_style))

    path_data = [
        ["FIGO Stage:", "IA"],
        ["Histology:", "Endometrioid"],
        ["Grade:", "G3"],
        ["Myometrial Invasion:", "<50%"],
        ["LVSI Status:", "Focal"],
        ["Lymph Node Status:", "Negative"],
    ]

    path_table = Table(path_data, colWidths=[4*cm, 8*cm])
    path_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
    ]))
    elements.append(path_table)
    elements.append(Spacer(1, 15))

    # Molecular Markers
    elements.append(Paragraph("MOLECULAR PROFILING RESULTS", section_style))

    mol_data = [
        ["POLE Status:", "Wild-type"],
        ["MMR Status:", "Proficient"],
        ["MLH1:", "Intact"],
        ["PMS2:", "Intact"],
        ["MSH2:", "Intact"],
        ["MSH6:", "Intact"],
        ["p53 Status:", "Abnormal"],
        ["L1CAM Status:", "Positive"],
        ["CTNNB1 Status:", "Wild-type"],
    ]

    mol_table = Table(mol_data, colWidths=[4*cm, 8*cm])
    mol_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
        ('BACKGROUND', (1, 6), (1, 6), colors.HexColor('#fee2e2')),  # Highlight p53 abnormal
        ('BACKGROUND', (1, 7), (1, 7), colors.HexColor('#fef3c7')),  # Highlight L1CAM positive
    ]))
    elements.append(mol_table)
    elements.append(Spacer(1, 15))

    # Hormone Receptors
    elements.append(Paragraph("HORMONE RECEPTOR STATUS", section_style))

    hr_data = [
        ["Estrogen Receptor (ER):", "20%"],
        ["Progesterone Receptor (PR):", "10%"],
    ]

    hr_table = Table(hr_data, colWidths=[4*cm, 8*cm])
    hr_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(hr_table)
    elements.append(Spacer(1, 20))

    # Interpretation
    elements.append(Paragraph("INTERPRETATION", section_style))
    interpretation = """
    Based on the molecular profiling results, this tumor demonstrates p53 abnormal status
    with overexpression pattern, consistent with the TCGA p53abn molecular subtype.
    The presence of L1CAM positivity further supports aggressive tumor biology.
    Despite favorable anatomical staging (Stage IA, <50% myometrial invasion),
    molecular features indicate high-risk disease requiring consideration of adjuvant therapy.
    """
    elements.append(Paragraph(interpretation.strip(), body_style))
    elements.append(Spacer(1, 20))

    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.gray,
        alignment=TA_CENTER
    )
    elements.append(Paragraph("This report is for demonstration purposes only.", footer_style))
    elements.append(Paragraph("Generated for OncoRisk EC Clinical Decision Support System", footer_style))

    doc.build(elements)
    print(f"PDF created: {output_path}")

if __name__ == "__main__":
    output_path = "/home/faris/Desktop/MyWork/AI_Agent/patenits_examples_data/Patient_Report_Demo.pdf"
    create_patient_report_pdf(output_path)
