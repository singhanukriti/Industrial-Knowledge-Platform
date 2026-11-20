import os

from .base_extractor import BaseExtractor
try:
    from models.document_element import DocumentElement
    from core.services import Services
except ModuleNotFoundError:
    from backend.models.document_element import DocumentElement
    from backend.core.services import Services


class ImageExtractor(BaseExtractor):
    def __init__(self):
        self.output_dir = "extracted_images"
        os.makedirs(self.output_dir, exist_ok=True)

    def extract(self, document, context):
        print("Extracting images...")
        count = 0

        for item in document.iterate_items():
            item_type = type(item).__name__
            if item_type in ["PictureItem", "ImageItem", "FigureItem"]:
                try:
                    image = item.get_image(document)
                    if image is None:
                        continue

                    image_path = os.path.join(
                        self.output_dir,
                        f"{os.path.basename(context.pdf_path)}_{count}.png"
                    )
                    image.save(image_path)

                    caption = Services.captioner.caption(image_path)

                    context.elements.append(
                        DocumentElement(
                            element_type="image",
                            content=image_path,
                            caption=caption
                        )
                    )
                    count += 1
                except Exception as e:
                    print(e)

        print(f"Extracted {count} image(s).")
        return context
