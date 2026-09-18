import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import shutil
from PIL import Image
from datetime import datetime

from app.database.session import SessionLocal, Base, engine
import app.models
from app.models.patient import Patient
from app.models.study import Study, StudyImage
from app.models.finding import Finding
from app.models.report import Report, ReportVersion
from app.models.model_result import ModelResult
from app.core.config import settings
from app.services.export_service import export_service

# Recreate tables to guarantee all columns (including disease columns) exist
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
db = SessionLocal()

settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Ensure demo scans are in upload dir
base_dir = settings.BASE_DIR
src_uploads = base_dir / "uploads"

# Verify files exist
for fn in ["brain_mri.jpg", "lung_mri.jpg", "chest_xray.jpg", "knee_xray.jpg"]:
    fp = settings.UPLOAD_DIR / fn
    if not fp.exists():
        cand = base_dir.parent / fn
        if cand.exists():
            shutil.copy(cand, fp)

print("Seeding MedScan AI clinical demo studies...")

# 1. Yashvi M. Patel - X-Ray Chest
p1 = Patient(
    mrn="MRN-XP-20252",
    full_name="Yashvi M. Patel",
    age=21,
    gender="Female",
    dob="2005-04-12",
    clinical_notes="Fever, productive cough and shortness of breath for 4 days."
)
db.add(p1)
db.commit()
db.refresh(p1)

s1 = Study(
    patient_id=p1.id,
    study_uid="1.2.840.113619.2.555.2025252",
    accession_number="ACC-2025-252",
    modality="XRAY",
    body_part="CHEST",
    study_description="X-Ray Chest - PA View",
    study_date="2026-09-15",
    status="APPROVED",
    priority="ROUTINE",
    referring_physician="Dr. Hiren Shah"
)
db.add(s1)
db.commit()
db.refresh(s1)

img1 = StudyImage(
    study_id=s1.id,
    image_uid="IMG-XR-555",
    file_name="chest_xray.jpg",
    file_path=str(settings.UPLOAD_DIR / "chest_xray.jpg"),
    file_type="JPG",
    slice_index=0
)
db.add(img1)
db.commit()
db.refresh(img1)

r1_bullets = [
    "Bronchovascular markings are prominent and peribronchially thickened in bilateral lower lung fields.",
    "No focal lobar consolidation, cavitary lesion, or pneumothorax identified.",
    "Cardiac silhouette and mediastinal contours are within normal limits for age.",
    "Bilateral costophrenic and cardiophrenic angles are sharp and clear.",
    "Visualised osseous thoracic cage and soft tissue structures appear intact."
]

r1 = Report(
    study_id=s1.id,
    patient_id=p1.id,
    pid="555",
    apt_id="2025252",
    ref_by="Dr. Hiren Shah",
    exam_title="X-RAY CHEST",
    exam_view="X-Ray Chest - PA View",
    registered_on="10:45 AM 15 Sep, 2026",
    reported_on="11:15 AM 15 Sep, 2026",
    scan_image_url="/static/uploads/chest_xray.jpg",
    bullet_findings_json=r1_bullets,
    disease_name="Acute Bronchial Inflammation",
    disease_type="Infective / Allergic Bronchitis",
    disease_stage="Moderate Acute Phase (Peribronchial Cuffing)",
    findings_text="\n".join([f"• {b}" for b in r1_bullets]),
    impression_text="Bilateral prominent bronchovascular markings consistent with acute bronchitis (likely infective or allergic etiology). No acute consolidation.",
    advice_text="Clinical correlation with auscultation findings, complete blood count, and symptomatic therapy.",
    radiologist_name="Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)",
    status="APPROVED",
    signed_at=datetime.utcnow()
)
db.add(r1)

# 2. Eleanor Vance - Brain MRI
p2 = Patient(
    mrn="MRN-BR-88219",
    full_name="Eleanor Vance",
    age=54,
    gender="Female",
    dob="1972-04-12",
    clinical_notes="Progressive early morning headaches, altered mental status, and left-sided hemiparesis."
)
db.add(p2)
db.commit()
db.refresh(p2)

s2 = Study(
    patient_id=p2.id,
    study_uid="1.2.840.113619.2.88219",
    accession_number="ACC-2026-MR-001",
    modality="MRI",
    body_part="BRAIN",
    study_description="Brain MRI with Contrast - Axial T1ce & FLAIR",
    study_date="2026-09-15",
    status="DRAFT",
    priority="STAT",
    referring_physician="Dr. Arthur Davies"
)
db.add(s2)
db.commit()
db.refresh(s2)

img2 = StudyImage(
    study_id=s2.id,
    image_uid="IMG-MR-001",
    file_name="brain_mri.jpg",
    file_path=str(settings.UPLOAD_DIR / "brain_mri.jpg"),
    file_type="JPG",
    slice_index=0
)
db.add(img2)
db.commit()
db.refresh(img2)

r2_bullets = [
    "Heterogeneously enhancing large intra-axial mass identified in the right frontoparietal parenchyma measuring approximately 4.8 x 4.2 cm.",
    "Central non-enhancing liquefactive necrosis with irregular, thick peripheral hyper-enhancing ring margins.",
    "Marked perilesional vasogenic edema extending along adjacent subcortical white matter tracts and corona radiata.",
    "Significant positive mass effect with compression and near-total effacement of the ipsilateral right lateral ventricle.",
    "Subfalcine herniation with 4.5 mm midline shift of cerebral structures toward the contralateral left hemisphere.",
    "Flow voids in the major circle of Willis intracranial arteries appear preserved."
]

r2 = Report(
    study_id=s2.id,
    patient_id=p2.id,
    pid="882",
    apt_id="2026001",
    ref_by="Dr. Arthur Davies",
    exam_title="BRAIN MRI WITH CONTRAST",
    exam_view="Brain MRI - Axial T1ce & FLAIR View",
    registered_on="09:15 AM 15 Sep, 2026",
    reported_on="09:45 AM 15 Sep, 2026",
    scan_image_url="/static/uploads/brain_mri.jpg",
    bullet_findings_json=r2_bullets,
    disease_name="Primary Malignant Brain Neoplasm (Brain Tumor)",
    disease_type="Glioblastoma Multiforme (GBM) - CNS WHO Grade IV (IDH-wildtype Astrocytoma)",
    disease_stage="Advanced Necrotic Phase (WHO Grade IV) with Mass Effect & 4.5mm Midline Shift",
    findings_text="\n".join([f"• {b}" for b in r2_bullets]),
    impression_text="Right frontoparietal necrotic ring-enhancing mass with extensive surrounding vasogenic edema and 4.5 mm midline shift, pathognomonic for High-Grade Glioma / Glioblastoma Multiforme (WHO Grade IV).",
    advice_text="Urgent neurosurgical consultation for stereotactic navigation-guided craniotomy and debulking; adjuvant Stupp protocol (concurrent Temozolomide + Radiotherapy).",
    radiologist_name="Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)",
    status="DRAFT"
)
db.add(r2)

# 3. Arthur Davies - Lung MRI (replacing Spine MRI)
p3 = Patient(
    mrn="MRN-LM-30192",
    full_name="Arthur Davies",
    age=62,
    gender="Male",
    dob="1964-08-20",
    clinical_notes="Chronic smoker presenting with persistent hemoptysis, right pleuritic chest pain, and 8 kg weight loss."
)
db.add(p3)
db.commit()
db.refresh(p3)

s3 = Study(
    patient_id=p3.id,
    study_uid="1.2.840.113619.2.30192",
    accession_number="ACC-2026-MR-003",
    modality="MRI",
    body_part="LUNG",
    study_description="Lung MRI (Thoracic MRI) - Axial T2 & DWI",
    study_date="2026-09-15",
    status="DRAFT",
    priority="STAT",
    referring_physician="Dr. Emily Thorne"
)
db.add(s3)
db.commit()
db.refresh(s3)

img3 = StudyImage(
    study_id=s3.id,
    image_uid="IMG-MR-003",
    file_name="lung_mri.jpg",
    file_path=str(settings.UPLOAD_DIR / "lung_mri.jpg"),
    file_type="JPG",
    slice_index=0
)
db.add(img3)
db.commit()
db.refresh(img3)

r3_bullets = [
    "Axial T2-hyperintense, diffusion-restricted parenchymal mass measuring approx 4.2 x 3.6 cm in the posterior segment of the right lung.",
    "Tumor exhibits irregular, spiculated margins with peripheral ground-glass halo and visceral pleural abutting.",
    "Direct bronchial bundling with abrupt termination and subsegmental bronchial cut-off sign.",
    "Prominent ipsilateral right hilar lymphadenopathy (short axis 1.4 cm), indicative of N1 nodal involvement.",
    "Contralateral left lung parenchyma, carina, and trachea lumen demonstrate normal patency.",
    "No pericardial invasion, pleural effusion, or chest wall osseous destruction identified on this sequence."
]

r3 = Report(
    study_id=s3.id,
    patient_id=p3.id,
    pid="301",
    apt_id="2026003",
    ref_by="Dr. Emily Thorne",
    exam_title="LUNG MRI (THORACIC MRI)",
    exam_view="Lung MRI - Axial T2 & Diffusion Weighted (DWI) View",
    registered_on="10:00 AM 15 Sep, 2026",
    reported_on="10:30 AM 15 Sep, 2026",
    scan_image_url="/static/uploads/lung_mri.jpg",
    bullet_findings_json=r3_bullets,
    disease_name="Primary Bronchogenic Malignancy (Lung Tumor)",
    disease_type="Non-Small Cell Lung Carcinoma (NSCLC) - High suspicion for Invasive Adenocarcinoma",
    disease_stage="Locally Advanced Phase (Clinical Stage T2b N1 M0 - Stage IIB/IIIA)",
    findings_text="\n".join([f"• {b}" for b in r3_bullets]),
    impression_text="Right lung spiculated parenchymal mass with regional bronchial obstruction and ipsilateral hilar lymphadenopathy, highly suspicious for Non-Small Cell Lung Carcinoma (NSCLC / Invasive Adenocarcinoma), Locally Advanced Phase (Stage IIB/IIIA).",
    advice_text="CT-guided core needle biopsy / EBUS-TBNA for histopathological confirmation and biomarker assay (EGFR, ALK, PD-L1); whole-body PET-CT for M-staging.",
    radiologist_name="Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)",
    status="DRAFT"
)
db.add(r3)

# 4. James Wilson - Knee X-Ray
p4 = Patient(
    mrn="MRN-KN-41908",
    full_name="James Wilson",
    age=49,
    gender="Male",
    dob="1977-03-15",
    clinical_notes="Chronic right knee stiffness, deep joint line tenderness aggravated by stairs."
)
db.add(p4)
db.commit()
db.refresh(p4)

s4 = Study(
    patient_id=p4.id,
    study_uid="1.2.840.113619.2.41908",
    accession_number="ACC-2026-XR-004",
    modality="XRAY",
    body_part="KNEE",
    study_description="Knee Radiograph (X-Ray) - Lateral & AP View",
    study_date="2026-09-15",
    status="APPROVED",
    priority="ROUTINE",
    referring_physician="Dr. Marcus Bell"
)
db.add(s4)
db.commit()
db.refresh(s4)

img4 = StudyImage(
    study_id=s4.id,
    image_uid="IMG-XR-004",
    file_name="knee_xray.jpg",
    file_path=str(settings.UPLOAD_DIR / "knee_xray.jpg"),
    file_type="JPG",
    slice_index=0
)
db.add(img4)
db.commit()
db.refresh(img4)

r4_bullets = [
    "Articular alignment of the tibiofemoral and patellofemoral joints is anatomical.",
    "Moderate medial compartment joint space narrowing with marginal osteophytosis along the tibial plateau.",
    "Subchondral sclerosis visible along the weight-bearing medial articular surfaces.",
    "No acute fracture, cortical disruption, or suprapatellar joint effusion identified.",
    "Visualised patella, fibular head, and proximal tibial shaft show normal bone mineralization."
]

r4 = Report(
    study_id=s4.id,
    patient_id=p4.id,
    pid="419",
    apt_id="2026004",
    ref_by="Dr. Marcus Bell",
    exam_title="KNEE RADIOGRAPH (X-RAY)",
    exam_view="Knee X-Ray - Lateral & AP View",
    registered_on="01:15 PM 15 Sep, 2026",
    reported_on="01:45 PM 15 Sep, 2026",
    scan_image_url="/static/uploads/knee_xray.jpg",
    bullet_findings_json=r4_bullets,
    disease_name="Degenerative Joint Disease (Knee Osteoarthritis)",
    disease_type="Medial Compartment Knee Osteoarthritis (Gonarthrosis)",
    disease_stage="Kellgren-Lawrence Grade II (Moderate Phase with Joint Space Narrowing)",
    findings_text="\n".join([f"• {b}" for b in r4_bullets]),
    impression_text="Moderate medial compartment degenerative osteoarthritis of the knee (Kellgren-Lawrence Grade II). No acute traumatic fracture.",
    advice_text="Orthopedic clinical evaluation, quadriceps strengthening physiotherapy, and weight-bearing guidance.",
    radiologist_name="Dr. Payal Shah & Dr. Vimal Shah (MD, Radiologist)",
    status="APPROVED",
    signed_at=datetime.utcnow()
)
db.add(r4)

db.commit()

# Generate PDFs
try:
    export_service.export_report_pdf(db, r1.id)
    export_service.export_report_pdf(db, r2.id)
    export_service.export_report_pdf(db, r3.id)
    export_service.export_report_pdf(db, r4.id)
except Exception as e:
    print(f"PDF seed error: {e}")

db.close()
print("All 4 demo studies seeded & hospital-grade PDFs generated!")
