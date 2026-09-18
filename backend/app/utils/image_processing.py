import os
import io
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def generate_synthetic_heatmap(base_image_path: str, center_x_ratio: float = 0.5, center_y_ratio: float = 0.5, radius_ratio: float = 0.25) -> str:
    """Generates a medical Grad-CAM style heatmap and saves it as a PNG overlay"""
    try:
        base = Image.open(base_image_path).convert("RGBA")
        w, h = base.size
        
        # Create gradient heatmap
        heatmap = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(heatmap)
        
        cx, cy = int(w * center_x_ratio), int(h * center_y_ratio)
        r = int(min(w, h) * radius_ratio)
        
        for i in range(r, 0, -3):
            alpha = int((1.0 - (i / r)) * 170) # max 170 opacity
            # color transitions from red center to yellow to green/cyan outer
            fraction = i / r
            red = int(255 * (1.0 - fraction * 0.4))
            green = int(220 * fraction)
            blue = int(40 * fraction)
            bbox = [cx - i, cy - i, cx + i, cy + i]
            draw.ellipse(bbox, fill=(red, green, blue, alpha))
            
        # Blur the heatmap for smooth Grad-CAM appearance
        blurred = heatmap.filter(ImageFilter.GaussianBlur(radius=8))
        
        out_dir = Path(base_image_path).parent
        stem = Path(base_image_path).stem
        out_path = out_dir / f"{stem}_heatmap.png"
        blurred.save(str(out_path), "PNG")
        return str(out_path)
    except Exception as e:
        print(f"Error generating heatmap: {e}")
        return ""

def generate_segmentation_mask(base_image_path: str, center_x_ratio: float = 0.5, center_y_ratio: float = 0.5, size_ratio: float = 0.2) -> str:
    """Generates a smooth cyan/emerald segmentation mask overlay"""
    try:
        base = Image.open(base_image_path).convert("RGBA")
        w, h = base.size
        
        mask = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(mask)
        
        cx, cy = int(w * center_x_ratio), int(h * center_y_ratio)
        rx, ry = int(w * size_ratio * 0.8), int(h * size_ratio * 0.9)
        
        # Draw organic irregular shape or ellipse
        bbox = [cx - rx, cy - ry, cx + rx, cy + ry]
        draw.ellipse(bbox, fill=(6, 182, 212, 110), outline=(34, 211, 238, 240), width=2) # Cyan
        
        out_dir = Path(base_image_path).parent
        stem = Path(base_image_path).stem
        out_path = out_dir / f"{stem}_segmask.png"
        mask.save(str(out_path), "PNG")
        return str(out_path)
    except Exception as e:
        print(f"Error generating segmentation mask: {e}")
        return ""
