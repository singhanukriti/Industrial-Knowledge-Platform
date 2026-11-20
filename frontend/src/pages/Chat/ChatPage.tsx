import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Send, Bot, User, BookOpen, Sparkles,
    FileText, RotateCcw, Loader2, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentDocuments } from "@/hooks/useRecentDocuments";
import { sendChatMessage } from "@/services/chat.service";
import { API_BASE } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    id:      string;
    role:    "user" | "assistant";
    content: string;
}

const SUGGESTIONS = [
    "Summarize this document",
    "What are the key findings?",
    "List the main topics covered",
    "Are there any tables or figures I should know about?",
];


export default function ChatPage() {
    const [messages, setMessages]       = useState<Message[]>([]);
    const [input, setInput]             = useState("");
    const [sending, setSending]         = useState(false);
    const [filename, setFilename]       = useState("");
    const [userPicked, setUserPicked]   = useState(false);
    const [showPdf, setShowPdf]         = useState(true);   // toggle left panel

    const bottomRef                     = useRef<HTMLDivElement>(null);
    const textareaRef                   = useRef<HTMLTextAreaElement>(null);
    const { data: docs = [] }           = useRecentDocuments();
    const [searchParams]                = useSearchParams();

    // Auto-scroll chat
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Deep-link: ?doc=<filename>
    const paramDoc          = searchParams.get("doc");
    const effectiveFilename = userPicked
        ? filename
        : (paramDoc || filename);

    const selectedDoc = docs.find((d) => d.filename === effectiveFilename);
    const pdfUrl = effectiveFilename ? `${API_BASE}/documents/${encodeURIComponent(effectiveFilename)}/file` : null;

    function pickDocument(value: string) {
        setFilename(value);
        setUserPicked(true);
        setMessages([]);   // clear chat when switching docs
    }

    async function send(preset?: string) {
        const q = (preset ?? input).trim();
        if (!q || sending) return;

        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: q }]);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setSending(true);

        try {
            const res = await sendChatMessage({ filename: effectiveFilename, question: q });
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: res.answer }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", content: "Sorry, I couldn't get a response. Please check the backend is running." },
            ]);
        } finally {
            setSending(false);
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
    }

    function autoResize(e: React.FormEvent<HTMLTextAreaElement>) {
        const el = e.currentTarget;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    }

    return (
        /* Full-height, break out of main layout's inner padding */
        <div className="flex flex-col -mx-6 -mt-6" style={{ height: "calc(100vh - 4rem)" }}>

            {/* ── Top bar ── */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background shrink-0">
                {/* PDF panel toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setShowPdf((v) => !v)}
                    title={showPdf ? "Hide PDF" : "Show PDF"}
                >
                    {showPdf
                        ? <PanelLeftClose className="h-4 w-4" />
                        : <PanelLeftOpen  className="h-4 w-4" />
                    }
                </Button>

                <span className="font-semibold text-sm">AI Chat</span>

                <div className="flex-1" />

                {/* Document picker */}
                {docs.length > 0 && (
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <select
                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm
                                focus:outline-none focus:ring-2 focus:ring-ring max-w-[260px] truncate"
                            value={effectiveFilename}
                            onChange={(e) => pickDocument(e.target.value)}
                        >
                            <option value="">All documents</option>
                            {docs.map((d) => (
                                <option key={d.document_id} value={d.filename}>
                                    {d.filename}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear chat */}
                {messages.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setMessages([])}
                        title="Clear chat"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* ── Two-panel body ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* LEFT: PDF Viewer */}
                {showPdf && (
                    <div className="flex flex-col border-r overflow-hidden" style={{ width: "55%" }}>
                        {/* PDF header */}
                        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30 shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-xs font-medium truncate flex-1 text-muted-foreground">
                                {effectiveFilename || "No document selected"}
                            </span>
                            {selectedDoc && (
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                    {selectedDoc.pages} pages · {selectedDoc.chunks} chunks
                                </span>
                            )}
                        </div>

                        {/* PDF frame */}
                        {!effectiveFilename ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                                <FileText className="h-10 w-10" />
                                <p className="text-sm font-medium">No document selected</p>
                                <p className="text-xs max-w-[200px]">
                                    Pick a document from the dropdown to view its PDF here
                                </p>
                            </div>
                        ) : pdfUrl ? (
                            <iframe
                                key={pdfUrl}
                                src={`${pdfUrl}#toolbar=1&view=FitH`}
                                title="PDF Preview"
                                className="flex-1 w-full h-full"
                                style={{ border: "none" }}
                            />
                        ) : null}
                    </div>
                )}

                {/* RIGHT: Chat panel */}
                <div className="flex flex-col flex-1 min-w-0 min-h-0">

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-7 w-7 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">Ask me anything</p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                        {docs.length === 0
                                            ? "Upload documents first, then ask questions about them."
                                            : selectedDoc
                                                ? `I'll search "${selectedDoc.filename}" to answer your questions.`
                                                : "Select a document or search across all indexed files."}
                                    </p>
                                </div>

                                {docs.length > 0 && (
                                    <div className="w-full max-w-lg mt-2">
                                        <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground mb-3">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Try asking
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {SUGGESTIONS.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    disabled={sending}
                                                    onClick={() => void send(s)}
                                                    className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs
                                                        font-medium text-foreground transition-colors
                                                        hover:border-primary hover:bg-primary/5 hover:text-primary
                                                        disabled:opacity-50"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`rounded-full h-8 w-8 flex items-center justify-center shrink-0 mt-0.5
                                        ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted border"
                                        }`}
                                >
                                    {msg.role === "user"
                                        ? <User className="h-4 w-4" />
                                        : <Bot  className="h-4 w-4" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                                        ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-sm max-w-[75%]"
                                            : "bg-muted rounded-tl-sm max-w-[85%] prose prose-sm dark:prose-invert"
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
                        {sending && (
                            <div className="flex gap-3">
                                <div className="rounded-full h-8 w-8 flex items-center justify-center shrink-0 bg-muted border mt-0.5">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* ── Ask Question input ── */}
                    <div className="border-t px-4 py-3 shrink-0 bg-background">
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                onInput={autoResize}
                                placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
                                disabled={sending}
                                className="flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm
                                    placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                                    min-h-[44px] max-h-[140px] disabled:opacity-50 overflow-y-auto leading-relaxed"
                            />
                            <Button
                                size="icon"
                                className="h-11 w-11 shrink-0 rounded-xl"
                                onClick={() => void send()}
                                disabled={!input.trim() || sending}
                                aria-label="Send message"
                            >
                                {sending
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Send    className="h-4 w-4" />
                                }
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
