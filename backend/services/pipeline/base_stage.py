from abc import ABC, abstractmethod


class PipelineStage(ABC):
    """
    Base class for all pipeline stages.
    """

    @abstractmethod
    def process(self, context: dict) -> dict:
        """
        Process the pipeline context and return the updated context.
        """
        pass
