import { useState } from "react";
import { Search, FileText, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecentDocuments } from "@/hooks/useRecentDocuments";
import api from "@/services/api";

interface SearchHit {
    content: string;
    source:  string;
    chunk:   number;
    score:   number;
}

interface SearchResult {
    query:   string;
    results: SearchHit[];
}

export default function SearchPage() {
    const [query, setQuery]         = useState("");
    const [filename, setFilename]   = useState("");
    const [results, setResults]     = useState<SearchResult | null>(null);
    const [searching, setSearching] = useState(false);
    const [expanded, setExpanded]   = useState<number | null>(null);
    const { data: docs = [] }       = useRecentDocuments();

    async function doSearch() {
        const q = query.trim();
        if (!q || searching) return;

        setSearching(true);
        setResults(null);
        setExpanded(null);

        try {
            const res = await api.post<SearchResult>("/search/", {
                query: q,
                filename: filename || undefined,
                top_k: 8,
            });
            setResults(res.data);
        } catch {
            setResults({ query: q, results: [] });
        } finally {
            setSearching(false);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") void doSearch();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Search</h1>
                <p className="text-muted-foreground mt-1">
                    Semantic search across all indexed documents.
                </p>
            </div>

            {/* Search bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search for anything in your documents…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {docs.length > 0 && (
                    <select
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                    >
                        <option value="">All documents</option>
                        {docs.map((d) => (
                            <option key={d.document_id} value={d.filename}>
                                {d.filename}
                            </option>
                        ))}
                    </select>
                )}

                <Button onClick={() => void doSearch()} disabled={!query.trim() || searching}>
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
            </div>

            {/* Results */}
            {searching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                </div>
            )}

            {results && (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {results.results.length} result{results.results.length !== 1 ? "s" : ""} for &ldquo;{results.query}&rdquo;
                    </p>

                    {results.results.length === 0 && (
                        <div className="rounded-xl border p-10 text-center">
                            <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="font-medium">No results found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try different keywords or upload more documents.
                            </p>
                        </div>
                    )}

                    {results.results.map((hit, i) => (
                        <div key={i} className="rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                            <button
                                className="w-full text-left"
                                onClick={() => setExpanded(expanded === i ? null : i)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="text-xs font-medium text-muted-foreground truncate">
                                            {hit.source} — chunk {hit.chunk}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs font-medium text-blue-600">
                                            {(hit.score * 100).toFixed(0)}% match
                                        </span>
                                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === i ? "rotate-90" : ""}`} />
                                    </div>
                                </div>
                                <p className={`text-sm mt-2 leading-relaxed ${expanded === i ? "" : "line-clamp-2"}`}>
                                    {hit.content}
                                </p>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
