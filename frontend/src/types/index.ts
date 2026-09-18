export interface Patient {
  id: string;
  mrn: string;
  full_name: string;
  age: number;
  gender: string;
  dob?: string;
  contact?: string;
  clinical_notes?: string;
  created_at: string;
}

export interface StudyImage {
  id: string;
  study_id: string;
  image_uid: string;
  file_name: string;
  file_path: string;
  file_type: string;
  slice_index: number;
  window_center?: number;
  window_width?: number;
  rows?: number;
  columns?: number;
  pixel_spacing?: string;
  metadata_json?: Record<string, any>;
  image_url: string;
  created_at: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color?: string;
}

export interface Finding {
  id: string;
  study_id: string;
  image_id?: string;
  modality: string;
  category: string;
  finding_text: string;
  anatomical_location: string;
  severity: "NORMAL" | "MILD" | "MODERATE" | "SEVERE" | "CRITICAL";
  confidence_score: number;
  bounding_box_json?: BoundingBox;
  segmentation_mask_url?: string;
  heatmap_url?: string;
  status: "AI_SUGGESTED" | "ACCEPTED" | "REJECTED" | "MODIFIED";
  radiologist_comment?: string;
  created_at: string;
}

export interface ReportVersion {
  id: string;
  version_number: number;
  findings_text?: string;
  impression_text?: string;
  recommendations_text?: string;
  edited_by?: string;
  change_summary?: string;
  created_at: string;
}

export interface Report {
  id: string;
  study_id: string;
  patient_id: string;
  pid: string;
  apt_id: string;
  ref_by: string;
  exam_title: string;
  exam_view: string;
  registered_on?: string;
  reported_on?: string;
  scan_image_url?: string;
  bullet_findings_json?: string[];
  disease_name?: string;
  disease_type?: string;
  disease_stage?: string;
  
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_mrn?: string;
  
  radiologist_id?: string;
  radiologist_name?: string;
  status: "DRAFT" | "PRELIMINARY" | "FINAL" | "SIGNED" | "APPROVED";
  clinical_history?: string;
  technique?: string;
  comparison?: string;
  findings_text?: string;
  impression_text?: string;
  advice_text?: string;
  recommendations_text?: string;
  clinical_notes_text?: string;
  bi_rads_rads_score?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
  versions?: ReportVersion[];
}

export interface Study {
  id: string;
  patient_id: string;
  patient?: Patient;
  study_uid: string;
  accession_number: string;
  modality: "MRI" | "CT" | "XRAY" | "ULTRASOUND";
  body_part: string;
  study_description?: string;
  study_date?: string;
  status: "PENDING" | "PROCESSING" | "ANALYZED" | "REVIEWED" | "SIGNED_OFF";
  priority: "STAT" | "URGENT" | "ROUTINE";
  referring_physician?: string;
  images_count?: number;
  findings_count?: number;
  images?: StudyImage[];
  findings?: Finding[];
  created_at: string;
  updated_at: string;
}

export interface CriticalFindingAlert {
  study_id: string;
  patient_name: string;
  mrn: string;
  modality: string;
  finding_text: string;
  severity: string;
  detected_time: string;
}

export interface ProcessingTrend {
  date: string;
  total_studies: number;
  ai_analyzed: number;
  critical_detected: number;
}

export interface DashboardMetrics {
  total_studies: number;
  pending_review: number;
  analyzed_count: number;
  signed_off_count: number;
  critical_findings_count: number;
  average_turnaround_mins: number;
  modality_breakdown: {
    mri: number;
    ct: number;
    xray: number;
    ultrasound: number;
  };
  critical_alerts: CriticalFindingAlert[];
  processing_trends: ProcessingTrend[];
  ai_model_health: Record<string, string>;
}

export interface PipelineStage {
  model_name: string;
  stage: string;
  execution_time_ms: number;
  status: string;
}

export interface AIAnalysisResult {
  study_id: string;
  modality: string;
  detected_findings: any[];
  probable_diagnoses: { diagnosis: string; probability: number }[];
  confidence_score: number;
  bounding_boxes: BoundingBox[];
  heatmap_url?: string;
  segmentation_mask_url?: string;
  pipeline_stages: PipelineStage[];
  clinical_explanation: string;
  draft_report?: Record<string, string>;
}
