from .base_extractor import BaseExtractor


class MetadataExtractor(BaseExtractor):
    def extract(self, document, context):
        """Extract metadata and store it in the document context."""
        return context
