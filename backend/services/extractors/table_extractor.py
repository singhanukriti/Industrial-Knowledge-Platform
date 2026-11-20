try:
    from models.document_element import DocumentElement
    from services.extractors.base_extractor import BaseExtractor
except ModuleNotFoundError:
    from backend.models.document_element import DocumentElement
    from backend.services.extractors.base_extractor import BaseExtractor


class TableExtractor(BaseExtractor):
    def extract(self, document, context):
        print("Extracting tables...")
        try:
            tables = list(document.tables)
        except Exception:
            tables = []

        print(f"Found {len(tables)} table(s).")
        for index, table in enumerate(tables):
            try:
                markdown = table.export_to_markdown(document)
            except Exception:
                markdown = str(table)

            element = DocumentElement(
                element_type="table",
                content=markdown,
                metadata={"table_index": index},
            )
            context.elements.append(element)

        return context
