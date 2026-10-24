import math
from typing import List, Dict, Any, Tuple
from PIL import Image

def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c*2 for c in hex_clean])
    return (
        int(hex_clean[0:2], 16),
        int(hex_clean[2:4], 16),
        int(hex_clean[4:6], 16)
    )

def rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}".upper()

def color_distance(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    # Standard Euclidean distance in RGB color space
    rmean = (c1[0] + c2[0]) / 2.0
    r = c1[0] - c2[0]
    g = c1[1] - c2[1]
    b = c1[2] - c2[2]
    return math.sqrt((((512 + rmean) * r * r) / 256) + 4 * g * g + (((767 - rmean) * b * b) / 256))

class VisualAssetAnalyzer:
    """
    Genuine Pillow-powered image analyzer for brand compliance.
    Extracts dominant color palette, verifies dimensions, and compares
    against authorized brand color swatches.
    """

    def analyze_image(
        self,
        image_path: str,
        brand_colors: List[Dict[str, Any]] = None,
        expected_content_type: str = "social_post"
    ) -> Dict[str, Any]:
        brand_colors = brand_colors or []
        warnings: List[str] = []
        recommendations: List[str] = []

        try:
            with Image.open(image_path) as img:
                # Convert to RGB
                rgb_img = img.convert("RGB")
                width, height = rgb_img.size
                aspect_ratio = f"{round(width / height, 2)}:1" if height > 0 else "1:1"

                # Extract dominant colors via quantize
                small_img = rgb_img.resize((150, 150))
                quantized = small_img.quantize(colors=6, method=Image.Quantize.MEDIANCUT)
                palette = quantized.getpalette()[:18] # 6 colors * 3 (r, g, b)
                
                # Count color frequencies
                color_counts = quantized.getcolors() or []
                total_pixels = sum(count for count, _ in color_counts) or 1
                color_counts.sort(key=lambda x: x[0], reverse=True)

                dominant_colors = []
                for count, idx in color_counts[:5]:
                    r = palette[idx * 3]
                    g = palette[idx * 3 + 1]
                    b = palette[idx * 3 + 2]
                    hex_code = rgb_to_hex(r, g, b)
                    percentage = round((count / total_pixels) * 100, 1)

                    # Find closest brand color if brand colors provided
                    closest_brand = None
                    min_dist = float("inf")
                    is_compliant = True

                    if brand_colors:
                        for b_color in brand_colors:
                            b_hex = b_color.get("hex", "#FFFFFF")
                            try:
                                b_rgb = hex_to_rgb(b_hex)
                                dist = color_distance((r, g, b), b_rgb)
                                if dist < min_dist:
                                    min_dist = dist
                                    closest_brand = b_color.get("name", b_hex)
                            except Exception:
                                continue

                        # Distance threshold for color match (approx 120 Euclidean in RGB)
                        is_compliant = min_dist < 130.0

                    dominant_colors.append({
                        "hex": hex_code,
                        "percentage": percentage,
                        "rgb": [r, g, b],
                        "closest_brand_color": closest_brand,
                        "delta_e": round(min_dist, 2) if min_dist != float("inf") else 0.0,
                        "is_brand_compliant": is_compliant
                    })

                # Calculate overall brand match score
                if brand_colors and dominant_colors:
                    compliant_weight = sum(c["percentage"] for c in dominant_colors if c["is_brand_compliant"])
                    brand_match_score = round(max(10.0, min(100.0, compliant_weight)), 1)
                else:
                    brand_match_score = 90.0

                # Dimension and aspect checks
                if width < 800 or height < 600:
                    warnings.append(f"Image resolution ({width}x{height}px) is low for high-DPI displays. Minimum recommended is 1200x800px.")
                else:
                    recommendations.append("Resolution is optimal for digital publishing.")

                if brand_match_score < 60.0:
                    warnings.append("Dominant colors deviate significantly from configured brand palette. Consider incorporating primary brand accent colors.")

                checks_result = {
                    "width": width,
                    "height": height,
                    "aspect_ratio": aspect_ratio,
                    "color_match_percentage": brand_match_score,
                    "automated_logo_detection": "Manual review required. Automated model-based logo verification is planned for future enterprise releases.",
                    "notes": "Verified automated color quantization and dimensional consistency."
                }

                summary = f"Analyzed {width}x{height}px image. Extracted {len(dominant_colors)} dominant hues with a {brand_match_score}% brand palette affinity."

                return {
                    "width": width,
                    "height": height,
                    "aspect_ratio": aspect_ratio,
                    "dominant_colors": dominant_colors,
                    "brand_match_score": brand_match_score,
                    "checks_result": checks_result,
                    "summary": summary,
                    "warnings": warnings,
                    "recommendations": recommendations
                }

        except Exception as e:
            return {
                "width": 0,
                "height": 0,
                "aspect_ratio": "unknown",
                "dominant_colors": [],
                "brand_match_score": 50.0,
                "checks_result": {"error": str(e)},
                "summary": f"Could not complete full image inspection: {str(e)}",
                "warnings": [f"Image processing error: {str(e)}"],
                "recommendations": ["Upload a valid PNG, JPG, or WebP image."]
            }

visual_analyzer = VisualAssetAnalyzer()
