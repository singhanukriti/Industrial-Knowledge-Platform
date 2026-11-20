import { FileText } from "lucide-react";
import { useRecentDocuments } from "@/hooks/useRecentDocuments";

export default function RecentDocuments() {
    const { data = [] } = useRecentDocuments();

    return (
        <div className="rounded-xl border p-6">
            <h2 className="text-2xl font-semibold mb-6">Recent Documents</h2>

            {data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    No documents indexed yet.
                </p>
            ) : (
                <div className="space-y-4">
                    {data.map((doc) => (
                        <div
                            key={doc.document_id}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <span className="font-medium truncate">
                                        {doc.filename}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 ml-7">
                                    {doc.pages} Pages &bull; {doc.chunks} Chunks
                                </p>
                            </div>

                            <div className="text-right shrink-0 ml-4">
                                <div className="text-sm font-medium text-green-600 capitalize">
                                    {doc.status}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(doc.uploaded_at).toLocaleDateString(
                                        undefined,
                                        { day: "numeric", month: "short", year: "numeric" }
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
