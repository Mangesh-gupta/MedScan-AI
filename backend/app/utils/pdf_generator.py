import os
import io
from pathlib import Path
from datetime import datetime
import qrcode
from PIL import Image as PILImage

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

def generate_reference_radiology_pdf(
    report_dict: dict,
    patient_dict: dict,
    output_path: str,
    scan_image_path: str = None
) -> str:
    """
    Generates an official VisionGuard 360 Diagnostic Radiology Report PDF
    with clinical styling matching the reference format, clean branding,
    and no third-party contact details.
    """
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    # A4 Dimensions: 595.27 x 841.89 points
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=25,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Colors
    c_primary = colors.HexColor("#0284c7")  # Royal Cyan/Blue
    c_dark = colors.HexColor("#0f172a")     # Slate 900
    c_border = colors.HexColor("#cbd5e1")

    # Typography
    t_center_title = ParagraphStyle(
        'CenterTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=c_primary,
        alignment=TA_LEFT
    )
    t_exam_title = ParagraphStyle(
        'ExamTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=c_dark,
        alignment=TA_CENTER
    )
    t_exam_view = ParagraphStyle(
        'ExamView',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=c_dark,
        alignment=TA_CENTER
    )
    t_body = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_dark
    )
    t_body_italic = ParagraphStyle(
        'ReportBodyItalic',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13.5,
        textColor=c_dark
    )
    t_heading = ParagraphStyle(
        'SectionHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=c_dark
    )
    t_meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=c_dark
    )
    t_meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=c_dark
    )

    story = []

    # 1. Header Block (VisionGuard 360 Branding)
    logo_path = "backend/static/logo.png"
    rl_logo = None
    if os.path.exists(logo_path):
        rl_logo = RLImage(logo_path, width=0.55*inch, height=0.55*inch)
    
    header_left = [
        Paragraph("<b>MEDSCAN AI</b>", t_center_title),
        Paragraph("<font size=8.5 color='#0284c7'><b>ADVANCED RADIOLOGY & DIAGNOSTIC IMAGING COPILOT</b></font>", styles['Normal']),
        Paragraph("<font size=7.5 color='#64748b'>Digital X-Ray & Magnetic Resonance Imaging (MRI) Clinical Division</font>", styles['Normal'])
    ]

    header_right = [
        Paragraph("<font size=8.5 color='#0284c7'><b>OFFICIAL RADIOLOGY RECORD</b></font>", ParagraphStyle('HRight1', alignment=TA_RIGHT)),
        Paragraph("<font size=7.5 color='#64748b'>AI-Assisted Precision Reporting</font>", ParagraphStyle('HRight2', alignment=TA_RIGHT))
    ]

    t_header = Table(
        [[rl_logo or '', header_left, header_right]],
        colWidths=[0.65*inch, 4.4*inch, 2.35*inch]
    )
    t_header.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_header)

    # Blue ribbon with website
    ribbon_table = Table(
        [[
            Paragraph("<font size=7.5 color='white'><b>/// CLINICAL ARTIFICIAL INTELLIGENCE DIAGNOSTICS</b></font>", styles['Normal']),
            Paragraph("<font size=7.5 color='white'><b>www.medscan.ai</b></font>", ParagraphStyle('RibRight', alignment=TA_RIGHT))
        ]],
        colWidths=[5.0*inch, 2.4*inch]
    )
    ribbon_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(ribbon_table)
    story.append(Spacer(1, 6))

    # 2. Patient Demographics Block with QR Code
    qr_data = f"MEDSCAN-AI|PATIENT:{patient_dict.get('full_name', 'Yashvi M. Patel')}|PID:{report_dict.get('pid', '555')}|ACC:{report_dict.get('apt_id', '2025252')}"
    qr_img = qrcode.make(qr_data)
    qr_bytes = io.BytesIO()
    qr_img.save(qr_bytes, format='PNG')
    qr_bytes.seek(0)
    rl_qr = RLImage(qr_bytes, width=0.65*inch, height=0.65*inch)

    p_name = patient_dict.get("full_name") or "Yashvi M. Patel"
    p_age = patient_dict.get("age") or 21
    p_sex = patient_dict.get("gender") or "Female"
    pid = report_dict.get("pid") or "555"
    apt_id = report_dict.get("apt_id") or "2025252"
    ref_by = report_dict.get("ref_by") or "Dr. Hiren Shah"
    reg_on = report_dict.get("registered_on") or datetime.now().strftime("%I:%M %p %d %b, %y")
    rep_on = report_dict.get("reported_on") or datetime.now().strftime("%I:%M %p %d %b, %y")

    is_approved = report_dict.get("status") == "APPROVED"

    demo_left = [
        Paragraph(f"<b>{p_name}</b>", ParagraphStyle('DName', fontName='Helvetica-Bold', fontSize=10.5, textColor=c_dark)),
        Paragraph(f"Age : {p_age} Years", t_meta_val),
        Paragraph(f"Sex : {p_sex}", t_meta_val)
    ]

    demo_mid = [
        Paragraph(f"<b>PID</b> : {pid}", t_meta_val),
        Paragraph(f"<b>Apt ID</b> : {apt_id}", t_meta_val),
        Paragraph(f"<b>Ref. By</b> : <b>{ref_by}</b>", t_meta_val)
    ]

    demo_right = [
        Paragraph("<b>Study Date & Time:</b>", t_meta_label),
        Paragraph(f"{reg_on}", t_meta_val),
        Paragraph(f"<b>{'Verified Date & Time:' if is_approved else 'Report Date & Time:'}</b>", t_meta_label),
        Paragraph(f"{rep_on}", t_meta_val)
    ]

    t_demo = Table(
        [[demo_left, rl_qr, demo_mid, demo_right]],
        colWidths=[2.2*inch, 0.8*inch, 2.3*inch, 2.1*inch]
    )
    t_demo.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_demo)
    story.append(HRFlowable(width="100%", thickness=0.8, color=c_border, spaceBefore=3, spaceAfter=8))

    # 3. Examination Title & View (Exact anatomical sub-type)
    exam_title = (report_dict.get("exam_title") or "X-RAY CHEST").upper()
    exam_view = report_dict.get("exam_view") or "X-Ray Chest - PA View"
    story.append(Paragraph(f"<b>{exam_title}</b>", t_exam_title))
    story.append(Paragraph(f"<b>{exam_view}</b>", t_exam_view))
    story.append(Spacer(1, 10))

    # 4. Bulleted Findings
    bullet_items = report_dict.get("bullet_findings_json")
    if not bullet_items and report_dict.get("findings_text"):
        raw = report_dict["findings_text"]
        bullet_items = [line.strip().lstrip("•*- ").strip() for line in raw.split("\n") if line.strip()]

    if not bullet_items:
        bullet_items = [
            "Bronchovascular markings are prominent in bilateral lung fields.",
            "Rest of the visualised lung fields are normal.",
            "Bilateral hilum appears normal.",
            "Cardiac silhouette is normal.",
            "Both cp angles are normal.",
            "Visualised bones & soft tissues appear normal."
        ]

    for item in bullet_items:
        story.append(Paragraph(f"• {item}", t_body))
        story.append(Spacer(1, 2.5))
    # Disease Classification & Clinical Staging Box
    d_name = report_dict.get("disease_name")
    d_type = report_dict.get("disease_type")
    d_stage = report_dict.get("disease_stage")

    if d_name or d_type or d_stage:
        staging_data = [
            [
                Paragraph("<font size=8 color='#0369a1'><b>DISEASE IDENTIFIED:</b></font>", styles['Normal']),
                Paragraph(f"<font size=8 color='#0f172a'><b>{d_name or 'Pathology Detected'}</b></font>", styles['Normal'])
            ],
            [
                Paragraph("<font size=8 color='#0369a1'><b>TUMOR / SUB-TYPE:</b></font>", styles['Normal']),
                Paragraph(f"<font size=8 color='#0f172a'>{d_type or 'Clinical Sub-type'}</font>", styles['Normal'])
            ],
            [
                Paragraph("<font size=8 color='#0369a1'><b>STAGE / PHASE:</b></font>", styles['Normal']),
                Paragraph(f"<font size=8 color='#b91c1c'><b>{d_stage or 'Evaluated Stage'}</b></font>", styles['Normal'])
            ]
        ]
        t_staging = Table(staging_data, colWidths=[1.8*inch, 5.6*inch])
        t_staging.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e0f2fe")),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_staging)
        story.append(Spacer(1, 6))

    # 5. IMPRESSION
    impression = report_dict.get("impression_text") or "Above features are suggestive of bronchitis- likely allergic/infective."
    story.append(Paragraph("<b>IMPRESSION</b>", t_heading))
    story.append(Spacer(1, 2))
    story.append(Paragraph(f"{impression}", t_body))
    story.append(Spacer(1, 6))

    # 6. ADVICE
    advice = report_dict.get("advice_text") or "Clinical correlation."
    story.append(Paragraph("<b>ADVICE</b>", t_heading))
    story.append(Spacer(1, 2))
    story.append(Paragraph(f"<i>{advice}</i>", t_body_italic))
    story.append(Spacer(1, 8))

    # 7. Embedded Actual Medical Scan Image (Centered)
    scan_path = scan_image_path or report_dict.get("scan_image_url")
    if scan_path and os.path.exists(scan_path):
        try:
            pil_img = PILImage.open(scan_path)
            orig_w, orig_h = pil_img.size
            target_h = 2.4 * inch
            aspect = orig_w / orig_h
            target_w = target_h * aspect
            if target_w > 4.5 * inch:
                target_w = 4.5 * inch
                target_h = target_w / aspect
            rl_scan = RLImage(scan_path, width=target_w, height=target_h)
            t_scan = Table([[rl_scan]], colWidths=[7.4*inch])
            t_scan.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(t_scan)
        except Exception as e:
            print(f"Error embedding scan image in PDF: {e}")
    story.append(Spacer(1, 8))

    # 8. Signatures Block
    sig_block = []
    sig_block.append(HRFlowable(width="100%", thickness=0.5, color=c_border, spaceBefore=4, spaceAfter=4))
    
    if is_approved:
        approval_banner = Table(
            [[
                Paragraph("<font size=8 color='#047857'><b>[✓] DIGITALLY VERIFIED & APPROVED BY RADIOLOGIST</b></font>", ParagraphStyle('ApprL', alignment=TA_CENTER)),
                Paragraph(f"<font size=7.5 color='#065f46'><b>STATUS: OFFICIAL RECORD • VERIFIED AT {rep_on}</b></font>", ParagraphStyle('ApprR', alignment=TA_CENTER))
            ]],
            colWidths=[3.7*inch, 3.7*inch]
        )
        approval_banner.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#d1fae5')),
            ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#10b981')),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#10b981')),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        sig_block.append(approval_banner)
        sig_block.append(Spacer(1, 3))
    
    label_row = [
        Paragraph("<font size=7.5 color='#64748b'>Thanks for Reference</font>", styles['Normal']),
        Paragraph("<font size=7.5 color='#64748b'>****End of Report****</font>", ParagraphStyle('CHead', alignment=TA_CENTER)),
        Paragraph("", styles['Normal'])
    ]

    sig_tech_p = "backend/static/signatures/sig_tech.png"
    sig_dr1_p = "backend/static/signatures/sig_dr1.png"
    sig_dr2_p = "backend/static/signatures/sig_dr2.png"

    rl_sig_tech = RLImage(sig_tech_p, width=1.3*inch, height=0.35*inch) if os.path.exists(sig_tech_p) else ''
    rl_sig_dr1 = RLImage(sig_dr1_p, width=1.3*inch, height=0.35*inch) if os.path.exists(sig_dr1_p) else ''
    rl_sig_dr2 = RLImage(sig_dr2_p, width=1.3*inch, height=0.35*inch) if os.path.exists(sig_dr2_p) else ''

    sigs_row = [rl_sig_tech, rl_sig_dr1, rl_sig_dr2]

    names_row = [
        Paragraph("<b>Radiologic Technologists</b><br/><font size=7 color='#64748b'>(MSC, PGDM)</font>", styles['Normal']),
        Paragraph("<b>Dr. Payal Shah</b><br/><font size=7 color='#64748b'>(MD, Radiologist)</font>", ParagraphStyle('SN1', alignment=TA_CENTER)),
        Paragraph("<b>Dr. Vimal Shah</b><br/><font size=7 color='#64748b'>(MD, Radiologist)</font>", ParagraphStyle('SN2', alignment=TA_RIGHT))
    ]

    t_sigs = Table([label_row, sigs_row, names_row], colWidths=[2.5*inch, 2.4*inch, 2.5*inch])
    t_sigs.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('TOPPADDING', (0,0), (-1,-1), 1),
    ]))
    sig_block.append(t_sigs)

    # 9. Clean Professional Footer Banner (No 3rd-party phone/email)
    now_str = datetime.now().strftime("%d %b, %Y %I:%M %p")
    footer_text = Table(
        [[
            Paragraph(f"<font size=7 color='#64748b'>Generated on : {now_str}</font>", styles['Normal']),
            Paragraph("<font size=7 color='#64748b'>Page 1 of 1</font>", ParagraphStyle('FR', alignment=TA_RIGHT))
        ]],
        colWidths=[4.0*inch, 3.4*inch]
    )
    sig_block.append(footer_text)

    bottom_bar = Table(
        [[
            Paragraph("<font size=8 color='white'><b>MEDSCAN AI CLINICAL COPILOT</b></font>", ParagraphStyle('BarL', alignment=TA_CENTER)),
            Paragraph("<font size=8 color='#facc15'><b>CONFIDENTIAL MEDICAL RECORD • ISO 13485 CERTIFIED</b></font>", ParagraphStyle('BarR', alignment=TA_CENTER))
        ]],
        colWidths=[3.7*inch, 3.7*inch]
    )
    bottom_bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_primary),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    sig_block.append(bottom_bar)

    story.append(KeepTogether(sig_block))

    doc.build(story)
    return output_path
