from .base_extractor import BaseExtractor


class TextExtractor(BaseExtractor):
    def extract(self, document, context):
        """Extract textual content and store it in the document context."""
        return context
