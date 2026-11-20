import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.vision.image_captioner import ImageCaptioner

captioner = ImageCaptioner()

caption = captioner.caption(
    "extracted_images/Screenshot 2025-04-07 140916.png"
)

print()

print("=" * 60)
print("Generated Caption")
print("=" * 60)

print(caption)

print("=" * 60)
