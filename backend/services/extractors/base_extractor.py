from abc import ABC, abstractmethod


class BaseExtractor(ABC):
    @abstractmethod
    def extract(self, document, context):
        """Extract information from a parsed document and update the DocumentContext."""
        pass
