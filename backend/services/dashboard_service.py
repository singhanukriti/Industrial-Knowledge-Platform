try:
    from services.metadata_service import MetadataService
    from services.activity_service import ActivityService
    from services.storage_service import StorageService
    from utils.metadata import load_documents
except ModuleNotFoundError:
    from backend.services.metadata_service import MetadataService
    from backend.services.activity_service import ActivityService
    from backend.services.storage_service import StorageService
    from backend.utils.metadata import load_documents


class DashboardService:

    metadata = MetadataService()
    activity = ActivityService()
    storage  = StorageService()

    @classmethod
    def _all_documents(cls):
        metadata_docs = cls.metadata.load_all()
        legacy_docs = load_documents()

        metadata_by_filename = {doc["filename"]: doc for doc in metadata_docs}

        merged = list(metadata_docs)
        for doc in legacy_docs:
            filename = doc["filename"]
            if filename not in metadata_by_filename:
                size_kb = doc.get("size_kb", 0)
                merged.append({
                    "document_id": f"legacy_{filename}",
                    "filename": filename,
                    "hash": "",
                    "pages": 0,
                    "chunks": 0,
                    "tables": 0,
                    "images": 0,
                    "figures": 0,
                    "graphs": 0,
                    "file_size": int(size_kb * 1024),
                    "status": "uploaded",
                    "uploaded_at": doc.get("uploaded_at", ""),
                })

        return merged

    @classmethod
    def get_dashboard_stats(cls):
        docs = cls._all_documents()

        return {
            "documents": len(docs),
            "pages":   sum(d.get("pages",   0) for d in docs),
            "chunks":  sum(d.get("chunks",  0) for d in docs),
            "tables":  sum(d.get("tables",  0) for d in docs),
            "images":  sum(d.get("images",  0) for d in docs),
            "figures": sum(d.get("figures", 0) for d in docs),
            "graphs":  sum(d.get("graphs",  0) for d in docs),
        }

    @classmethod
    def get_recent_documents(cls):
        docs = cls._all_documents()
        docs.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
        return docs[:5]

    @classmethod
    def get_recent_activity(cls):
        return cls.activity.recent(limit=10)

    @classmethod
    def storage_usage(cls):
        return cls.storage.get_storage_usage()
