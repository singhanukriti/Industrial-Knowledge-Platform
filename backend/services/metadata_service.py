import json
from pathlib import Path


class MetadataService:

    METADATA_DIR = Path(__file__).parent.parent / "metadata"

    def __init__(self):
        self.METADATA_DIR.mkdir(exist_ok=True)

    def metadata_path(self, document_id: str) -> Path:
        return self.METADATA_DIR / f"{document_id}.json"

    def save(self, metadata: dict) -> None:
        path = self.metadata_path(metadata["document_id"])
        with open(path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)

    def load(self, document_id: str) -> dict | None:
        path = self.metadata_path(document_id)
        if not path.exists():
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def load_all(self) -> list[dict]:
        documents = []
        for file in sorted(self.METADATA_DIR.glob("*.json")):
            with open(file, "r", encoding="utf-8") as f:
                documents.append(json.load(f))
        return documents

    def load_by_filename(self, filename: str) -> dict | None:
        for doc in self.load_all():
            if doc.get("filename") == filename:
                return doc
        return None

    def delete(self, document_id: str) -> None:
        path = self.metadata_path(document_id)
        if path.exists():
            path.unlink()

    def exists(self, document_id: str) -> bool:
        return self.metadata_path(document_id).exists()

    def count(self) -> int:
        return len(list(self.METADATA_DIR.glob("*.json")))

    def delete_by_hash(self, file_hash: str) -> None:
        """Delete all metadata files where the stored hash matches file_hash.
        This is used when a document is removed but its hash is known.
        """
        for meta_file in self.METADATA_DIR.glob("*.json"):
            try:
                with open(meta_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if data.get("hash") == file_hash:
                    meta_file.unlink()
            except Exception:
                continue
