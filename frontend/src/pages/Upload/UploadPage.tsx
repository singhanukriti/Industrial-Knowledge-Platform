import { useRef, useState, useCallback, useEffect } from "react";
import {
    Upload, FileText, CheckCircle2, AlertCircle,
    Loader2, X, Send, Bot, User, ChevronLeft,
    MessageSquare, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { sendChatMessage } from "@/services/chat.service";
import type { ChatMessage } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */
interface QueuedFile {
    id: string;
    file: File;
    status: "pending" | "uploading" | "done" | "error";
    error?: string;
    objectUrl?: string; // blob URL for the PDF viewer
}

/* ────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────── */
export default function UploadPage() {
    const inputRef            = useRef<HTMLInputElement>(null);
    const [queue, setQueue]   = useState<QueuedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const [activeFile, setActiveFile] = useState<QueuedFile | null>(null);

    const queryClient   = useQueryClient();
    const processingRef = useRef(false);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            queue.forEach((q) => q.objectUrl && URL.revokeObjectURL(q.objectUrl));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Upload logic ───────────────────────────────────────
    const processQueue = useCallback(async (items: QueuedFile[]) => {
        if (processingRef.current) return;
        processingRef.current = true;

        for (const item of items) {
            if (item.status !== "pending") continue;

            setQueue((prev) =>
                prev.map((q) => q.id === item.id ? { ...q, status: "uploading" } : q)
            );

            try {
                const formData = new FormData();
                formData.append("files", item.file);

                const response = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                setQueue((prev) =>
                    prev.map((q) => q.id === item.id ? { ...q, status: "done" } : q)
                );

                void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                void queryClient.invalidateQueries({ queryKey: ["recent-documents"] });
                void queryClient.invalidateQueries({ queryKey: ["activity"] });
                void queryClient.invalidateQueries({ queryKey: ["storage"] });
                void queryClient.invalidateQueries({ queryKey: ["documents"] });

            } catch (error: any) {
                const message = error?.response?.data?.detail || "Upload failed";
                setQueue((prev) =>
                    prev.map((q) => q.id === item.id
                        ? { ...q, status: "error", error: message }
                        : q
                    )
                );
            }
        }

        processingRef.current = false;
    }, [queryClient]);

    function addFiles(files: FileList | File[]) {
        const pdfs = Array.from(files).filter(
            (f) => f.type === "application/pdf" || f.name.endsWith(".pdf")
        );
        if (pdfs.length === 0) return;

        const newItems: QueuedFile[] = pdfs.map((f) => ({
            id:        `${f.name}-${Date.now()}-${Math.random()}`,
            file:      f,
            status:    "pending",
            objectUrl: URL.createObjectURL(f),
        }));

        setQueue((prev) => {
            const updated = [...prev, ...newItems];
            setTimeout(() => processQueue(updated), 0);
            return updated;
        });
    }

    function onDragOver(e: React.DragEvent)  { e.preventDefault(); setDragging(true); }
    function onDragLeave(e: React.DragEvent) { e.preventDefault(); setDragging(false); }
    function onDrop(e: React.DragEvent) {
        e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
    }
    function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) addFiles(e.target.files);
        e.target.value = "";
    }

    function removeItem(id: string) {
        setQueue((prev) => {
            const item = prev.find((q) => q.id === id);
            if (item?.objectUrl) URL.revokeObjectURL(item.objectUrl);
            return prev.filter((q) => q.id !== id);
        });
        if (activeFile?.id === id) setActiveFile(null);
    }

    function retryItem(id: string) {
        setQueue((prev) => {
            const updated = prev.map((q) =>
                q.id === id ? { ...q, status: "pending" as const, error: undefined } : q
            );
            setTimeout(() => processQueue(updated), 0);
            return updated;
        });
    }

    const hasDone = queue.some((q) => q.status === "done");
    const isProc  = queue.some((q) => q.status === "uploading");

    // ── Split-panel view ───────────────────────────────────
    if (activeFile) {
        return (
            <SplitView
                file={activeFile}
                onClose={() => setActiveFile(null)}
            />
        );
    }

    // ── Drop-zone / queue view ─────────────────────────────
    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Upload Documents</h1>
                <p className="text-muted-foreground mt-1">
                    Upload PDF files to index them into the knowledge base.
                </p>
            </div>

            {/* Drop zone */}
            <div
                className={`rounded-2xl border-2 border-dashed transition-colors p-14 text-center cursor-pointer
                    ${dragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Drop PDFs here or click to browse"
            >
                <Upload className={`mx-auto h-12 w-12 mb-4 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-lg font-medium">
                    {dragging ? "Drop your PDFs here" : "Drag & Drop PDF Files Here"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    or click to browse — multiple files supported
                </p>

                <Button
                    className="mt-6"
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                    Browse Files
                </Button>

                <input
                    hidden
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={onFileInput}
                />
            </div>

            {/* File queue */}
            {queue.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                            {queue.length} file{queue.length !== 1 ? "s" : ""} •{" "}
                            {queue.filter((q) => q.status === "done").length} done
                        </p>
                        {hasDone && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setQueue((p) => p.filter((q) => q.status !== "done"))}
                            >
                                Clear completed
                            </Button>
                        )}
                    </div>

                    {queue.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl border p-3.5 hover:bg-muted/30 transition-colors"
                        >
                            {item.status === "pending"   && <FileText     className="h-5 w-5 text-muted-foreground shrink-0" />}
                            {item.status === "uploading" && <Loader2      className="h-5 w-5 animate-spin text-blue-600 shrink-0" />}
                            {item.status === "done"      && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                            {item.status === "error"     && <AlertCircle  className="h-5 w-5 text-red-500 shrink-0" />}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.status === "pending"   && "Waiting…"}
                                    {item.status === "uploading" && "Uploading & indexing…"}
                                    {item.status === "done"      && "Indexed — click View & Chat to explore"}
                                    {item.status === "error"     && (item.error ?? "Failed")}
                                </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                {item.status === "error" && (
                                    <Button variant="ghost" size="sm" onClick={() => retryItem(item.id)}>
                                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                        Retry
                                    </Button>
                                )}
                                {item.status === "done" && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setActiveFile(item)}
                                    >
                                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                        View & Chat
                                    </Button>
                                )}
                                {item.status !== "uploading" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => removeItem(item.id)}
                                        aria-label="Remove"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {isProc && (
                        <p className="text-xs text-muted-foreground text-center">
                            Processing documents one at a time…
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Split-panel view  (PDF left | Chat right)
──────────────────────────────────────────────────────────── */
function SplitView({ file, onClose }: { file: QueuedFile; onClose: () => void }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput]       = useState("");
    const [thinking, setThinking] = useState(false);
    const messagesEndRef          = useRef<HTMLDivElement>(null);
    const textareaRef             = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage() {
        const q = input.trim();
        if (!q || thinking) return;

        const userMsg: ChatMessage = {
            id:        crypto.randomUUID(),
            role:      "user",
            content:   q,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setThinking(true);

        try {
            const res = await sendChatMessage({
                filename: file.file.name,
                question: q,
            });

            setMessages((prev) => [
                ...prev,
                {
                    id:        crypto.randomUUID(),
                    role:      "assistant",
                    content:   res.answer,
                    timestamp: new Date().toISOString(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id:        crypto.randomUUID(),
                    role:      "assistant",
                    content:   "Sorry, I couldn't get a response. Please try again.",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setThinking(false);
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void sendMessage();
        }
    }

    function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }

    return (
        // Break out of main layout padding to fill full height
        <div className="flex flex-col -mx-6 -mt-6" style={{ height: "calc(100vh - 4rem)" }}>

            {/* Top bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background shrink-0">
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{file.file.name}</span>
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium px-2 py-0.5 rounded-full shrink-0">
                    Indexed
                </span>
            </div>

            {/* Two-panel body */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* LEFT: PDF viewer */}
                <div className="flex flex-col flex-1 min-w-0 border-r overflow-hidden">
                    <div className="px-3 py-1.5 border-b bg-muted/30 shrink-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            PDF Preview
                        </p>
                    </div>
                    <iframe
                        src={`${file.objectUrl}#toolbar=1&view=FitH`}
                        title="PDF Preview"
                        className="flex-1 w-full h-full"
                        style={{ border: "none" }}
                    />
                </div>

                {/* RIGHT: AI Chat */}
                <div className="flex flex-col w-[380px] shrink-0 min-h-0">

                    {/* Chat header */}
                    <div className="px-4 py-1.5 border-b bg-muted/30 shrink-0 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            AI Chat
                        </p>
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-auto text-muted-foreground"
                                onClick={() => setMessages([])}
                                title="Clear chat"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 py-10 text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Ask about this document</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Type a question or pick a suggestion
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1.5 w-full">
                                    {[
                                        "Summarize this document",
                                        "What are the key findings?",
                                        "List the main topics covered",
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            className="text-left text-xs rounded-xl border px-3 py-2 hover:bg-muted transition-colors"
                                            onClick={() => {
                                                setInput(q);
                                                textareaRef.current?.focus();
                                            }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                <div
                                    className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center mt-0.5
                                        ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted border"
                                        }`}
                                >
                                    {msg.role === "user"
                                        ? <User className="h-3 w-3" />
                                        : <Bot  className="h-3 w-3 text-primary" />
                                    }
                                </div>
                                <div
                                    className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap
                                        ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted rounded-tl-sm prose prose-sm dark:prose-invert"
                                        }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Thinking indicator */}
                        {thinking && (
                            <div className="flex gap-2">
                                <div className="h-6 w-6 rounded-full shrink-0 bg-muted border flex items-center justify-center mt-0.5">
                                    <Bot className="h-3 w-3 text-primary" />
                                </div>
                                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Ask Question */}
                    <div className="border-t p-3 shrink-0 bg-background">
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                onInput={autoResize}
                                placeholder="Ask a question… (Enter to send)"
                                disabled={thinking}
                                className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm
                                    placeholder:text-muted-foreground focus:outline-none focus:ring-2
                                    focus:ring-ring min-h-[40px] max-h-[120px] disabled:opacity-50 overflow-y-auto"
                            />
                            <Button
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                onClick={() => void sendMessage()}
                                disabled={!input.trim() || thinking}
                                aria-label="Send"
                            >
                                {thinking
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Send    className="h-4 w-4" />
                                }
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                            Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
