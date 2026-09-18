import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from PIL import Image
import numpy as np

try:
    import pydicom
    from pydicom.pixel_data_handlers.util import apply_voi_lut
    HAS_PYDICOM = True
except ImportError:
    HAS_PYDICOM = False

def is_dicom_file(file_path: str) -> bool:
    try:
        with open(file_path, "rb") as f:
            header = f.read(132)
            return len(header) >= 132 and header[128:132] == b"DICM"
    except Exception:
        return False

def parse_dicom_file(file_path: str) -> Tuple[Dict[str, Any], Optional[str]]:
    metadata: Dict[str, Any] = {
        "is_dicom": False,
        "modality": "UNKNOWN",
        "body_part": "UNKNOWN",
        "patient_name": "ANONYMOUS",
        "patient_id": "UNKNOWN",
        "study_description": "",
        "window_center": 40.0,
        "window_width": 400.0,
        "rows": 512,
        "columns": 512,
        "pixel_spacing": "1.0\1.0",
        "slice_thickness": "1.0",
        "kvp": "120",
        "manufacturer": "Siemens Healthineers"
    }
    
    if not HAS_PYDICOM:
        return metadata, None

    try:
        ds = pydicom.dcmread(file_path, force=True)
        metadata["is_dicom"] = True
        metadata["modality"] = str(getattr(ds, "Modality", "UNKNOWN")).upper()
        metadata["body_part"] = str(getattr(ds, "BodyPartExamined", "CHEST")).upper()
        metadata["patient_name"] = str(getattr(ds, "PatientName", "ANONYMOUS"))
        metadata["patient_id"] = str(getattr(ds, "PatientID", "UNKNOWN"))
        metadata["study_description"] = str(getattr(ds, "StudyDescription", "Diagnostic Scan"))
        metadata["slice_thickness"] = str(getattr(ds, "SliceThickness", "1.0"))
        metadata["kvp"] = str(getattr(ds, "KVP", "120"))
        metadata["manufacturer"] = str(getattr(ds, "Manufacturer", "Siemens Healthineers"))
        
        # Window settings
        wc = getattr(ds, "WindowCenter", 40)
        ww = getattr(ds, "WindowWidth", 400)
        if isinstance(wc, pydicom.multival.MultiValue):
            wc = wc[0]
        if isinstance(ww, pydicom.multival.MultiValue):
            ww = ww[0]
        metadata["window_center"] = float(wc) if wc is not None else 40.0
        metadata["window_width"] = float(ww) if ww is not None else 400.0
        
        metadata["rows"] = int(getattr(ds, "Rows", 512))
        metadata["columns"] = int(getattr(ds, "Columns", 512))
        
        spacing = getattr(ds, "PixelSpacing", None)
        if spacing:
            metadata["pixel_spacing"] = f"{spacing[0]}\{spacing[1]}"

        # Render preview PNG if pixel array exists
        preview_png_path = None
        if hasattr(ds, "pixel_array"):
            try:
                arr = ds.pixel_array.astype(float)
                # apply voi lut if possible
                try:
                    arr = apply_voi_lut(ds.pixel_array, ds)
                except Exception:
                    pass
                # normalize to 0-255
                arr_min, arr_max = arr.min(), arr.max()
                if arr_max > arr_min:
                    norm = ((arr - arr_min) / (arr_max - arr_min) * 255.0).astype(np.uint8)
                else:
                    norm = np.zeros(arr.shape, dtype=np.uint8)
                
                img = Image.fromarray(norm)
                png_dest = str(Path(file_path).with_suffix(".png"))
                img.save(png_dest)
                preview_png_path = png_dest
            except Exception as e:
                print(f"Error extracting pixel array: {e}")

        return metadata, preview_png_path
    except Exception as e:
        print(f"Error parsing DICOM {file_path}: {e}")
        return metadata, None
