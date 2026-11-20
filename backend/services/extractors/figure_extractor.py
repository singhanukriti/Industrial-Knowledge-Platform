try:
    from models.document_element import DocumentElement
except ModuleNotFoundError:
    from backend.models.document_element import DocumentElement


class FigureExtractor:
    def extract(self, document, context):
        print("Extracting figures...")
        figures = []
        for item in document.iterate_items():
            if item.__class__.__name__ == "PictureItem":
                try:
                    markdown = item.export_to_markdown()
                except Exception:
                    markdown = "Figure"
                figures.append(
                    DocumentElement(
                        element_type="figure",
                        content=markdown,
                    )
                )
        context.elements.extend(figures)
        print(f"Found {len(figures)} figure(s).")
        return context
