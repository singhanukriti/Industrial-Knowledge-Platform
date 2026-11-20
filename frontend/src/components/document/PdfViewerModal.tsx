import { useEffect, useRef, useState } from "react";
import { ExternalLink, MessageSquareText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api, { API_BASE } from "@/services/api";

interface PdfViewerModalProps {
    filename: string | null;
    onClose: () => void;
    onAskAi?: (filename: string) => void;
}

function buildPdfUrl(filename: string) {
    return `${API_BASE}/documents/${encodeURIComponent(filename)}/file`;
}

function PdfFrame({ filename }: { filename: string }) {
    const [src, setSrc]       = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(false);
    const objectUrlRef        = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        api
            .get(`/documents/${encodeURIComponent(filename)}/file`, {
                responseType: "blob",
            })
            .then((res) => {
                if (cancelled) return;
                const url = URL.createObjectURL(res.data);
                objectUrlRef.current = url;
                setSrc(url);
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setError(true);
                setLoading(false);
            });

        return () => {
            cancelled = true;
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [filename]);

    const rawUrl = buildPdfUrl(filename);

    return (
        <>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <p className="text-sm">Could not load this PDF.</p>
                    <Button
                        size="sm"
                        variant="outline"
                        render={<a href={rawUrl} target="_blank" rel="noreferrer" />}
                    >
                        Open in new tab
                    </Button>
                </div>
            )}
            {src && (
                <iframe
                    src={src}
                    title={filename}
                    className="absolute inset-0 h-full w-full border-0 bg-white"
                />
            )}
        </>
    );
}

export default function PdfViewerModal({ filename, onClose, onAskAi }: PdfViewerModalProps) {
    const rawUrl = filename ? buildPdfUrl(filename) : null;

    return (
        <Dialog open={!!filename} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="w-[94vw] max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3 shrink-0">
                    <DialogTitle className="truncate text-sm font-medium">
                        {filename}
                    </DialogTitle>
                    <div className="flex items-center gap-2 shrink-0">
                        {filename && onAskAi && (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onAskAi(filename)}
                            >
                                <MessageSquareText className="h-4 w-4" />
                                Ask AI
                            </Button>
                        )}
                        {rawUrl && (
                            <Button
                                size="sm"
                                variant="ghost"
                                render={<a href={rawUrl} target="_blank" rel="noreferrer" />}
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open
                            </Button>
                        )}
                    </div>
                </div>

                <div className="relative flex-1 bg-white">
                    {filename && <PdfFrame key={filename} filename={filename} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}
