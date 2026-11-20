import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, Search, BookOpen, Database, Table, Image, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/hooks/useDocuments";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import PdfViewerModal from "@/components/document/PdfViewerModal";

export default function DocumentsPage() {
    const { data: docs = [], isLoading } = useDocuments();
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);
    const [viewing, setViewing] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    function openChat(filename: string) {
        navigate(`/chat?doc=${encodeURIComponent(filename)}`);
    }

    const filtered = docs.filter((d) =>
        d.filename.toLowerCase().includes(search.toLowerCase())
    );

    async function handleDelete(filename: string) {
        setDeleting(filename);
        try {
            await api.delete(`/documents/${encodeURIComponent(filename)}`);
            void queryClient.invalidateQueries({ queryKey: ["documents"] });
            void queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
            void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            void queryClient.invalidateQueries({ queryKey: ["storage"] });
        } catch {
            // ignore — user can retry
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Documents</h1>
                <p className="text-muted-foreground mt-1">
                    All indexed documents in the knowledge base.
                </p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search documents…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading && (
                <p className="text-muted-foreground text-sm">Loading documents…</p>
            )}

            {!isLoading && filtered.length === 0 && (
                <div className="rounded-xl border p-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">No documents found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Upload a PDF to get started.
                    </p>
                </div>
            )}

            <div className="grid gap-4">
                {filtered.map((doc) => (
                    <div
                        key={doc.document_id}
                        className="flex items-center justify-between rounded-xl border p-5 hover:bg-muted/30 transition-colors cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={() => setViewing(doc.filename)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setViewing(doc.filename);
                            }
                        }}
                        aria-label={`Open ${doc.filename}`}
                    >
                        <div className="flex gap-4 items-start min-w-0">
                            <div className="rounded-lg bg-blue-50 p-2.5 dark:bg-blue-950/30 shrink-0">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{doc.filename}</p>
                                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {doc.pages} pages
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Database className="h-3.5 w-3.5" />
                                        {doc.chunks} chunks
                                    </span>
                                    {doc.tables > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Table className="h-3.5 w-3.5" />
                                            {doc.tables} tables
                                        </span>
                                    )}
                                    {doc.images > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Image className="h-3.5 w-3.5" />
                                            {doc.images} images
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        {doc.status}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(doc.uploaded_at).toLocaleDateString(undefined, {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={(e) => { e.stopPropagation(); setViewing(doc.filename); }}
                                aria-label={`View ${doc.filename}`}
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={(e) => { e.stopPropagation(); openChat(doc.filename); }}
                                aria-label={`Chat about ${doc.filename}`}
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-red-500"
                                disabled={deleting === doc.filename}
                                onClick={(e) => { e.stopPropagation(); handleDelete(doc.filename); }}
                                aria-label={`Delete ${doc.filename}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <PdfViewerModal
                filename={viewing}
                onClose={() => setViewing(null)}
                onAskAi={(filename) => {
                    setViewing(null);
                    openChat(filename);
                }}
            />
        </div>
    );
}
