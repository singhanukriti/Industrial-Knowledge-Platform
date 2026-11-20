from pathlib import Path


class StorageService:

    # Resolve paths relative to this file's location (backend/)
    BASE_DIR = Path(__file__).parent.parent

    @classmethod
    def folder_size(cls, folder_name: str) -> int:
        folder = cls.BASE_DIR / folder_name

        if not folder.exists():
            return 0

        total = 0
        for file in folder.rglob("*"):
            if file.is_file():
                try:
                    total += file.stat().st_size
                except OSError:
                    pass
        return total

    @staticmethod
    def format_size(size: int) -> str:
        units = ["B", "KB", "MB", "GB", "TB"]
        index = 0
        value = float(size)

        while value >= 1024 and index < len(units) - 1:
            value /= 1024
            index += 1

        return f"{value:.2f} {units[index]}"

    @classmethod
    def get_storage_usage(cls) -> dict:
        uploads  = cls.folder_size("uploads")
        images   = cls.folder_size("extracted_images")
        chroma   = cls.folder_size("chroma_db")
        metadata = cls.folder_size("metadata")
        logs     = cls.folder_size("logs")
        total    = uploads + images + chroma + metadata + logs

        return {
            "uploads":  cls.format_size(uploads),
            "images":   cls.format_size(images),
            "chroma":   cls.format_size(chroma),
            "metadata": cls.format_size(metadata),
            "logs":     cls.format_size(logs),
            "total":    cls.format_size(total),
        }
