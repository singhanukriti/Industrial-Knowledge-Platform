import { useState } from "react";
import { Settings, Server, Globe, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/services/api";

interface HealthStatus {
    status: string;
}

export default function SettingsPage() {
    const [apiUrl, setApiUrl]     = useState(import.meta.env.VITE_API_URL ?? "http://localhost:8000");
    const [health, setHealth]     = useState<"idle" | "ok" | "error">("idle");
    const [checking, setChecking] = useState(false);

    async function checkHealth() {
        setChecking(true);
        setHealth("idle");
        try {
            const res = await api.get<HealthStatus>("/health");
            setHealth(res.data.status === "Healthy" ? "ok" : "error");
        } catch {
            setHealth("error");
        } finally {
            setChecking(false);
        }
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Platform configuration and connection settings.
                </p>
            </div>

            {/* Connection */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">Backend Connection</h2>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm text-muted-foreground">API URL</label>
                        <Input
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="http://localhost:8000"
                        />
                        <p className="text-xs text-muted-foreground">
                            To change this permanently, update <code className="bg-muted px-1 rounded">VITE_API_URL</code> in <code className="bg-muted px-1 rounded">frontend/.env</code> and restart the dev server.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => void checkHealth()}
                            disabled={checking}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
                            Test Connection
                        </Button>

                        {health === "ok" && (
                            <span className="flex items-center gap-1.5 text-sm text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Connected
                            </span>
                        )}
                        {health === "error" && (
                            <span className="flex items-center gap-1.5 text-sm text-red-500">
                                <XCircle className="h-4 w-4" />
                                Cannot reach backend
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* About */}
            <Card>
                <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">About</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                        {[
                            ["Platform",  "Industrial Knowledge Platform"],
                            ["Frontend",  "React 19 + Vite 8 + TypeScript 6"],
                            ["UI",        "Shadcn/UI + Tailwind CSS v4"],
                            ["Backend",   "FastAPI + ChromaDB + Docling"],
                            ["Version",   "1.0.0"],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Keyboard shortcuts */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-base font-semibold">Keyboard Shortcuts</h2>
                    </div>
                    <div className="space-y-2 text-sm">
                        {[
                            ["Enter",        "Send chat message / trigger search"],
                            ["Shift+Enter",  "New line in chat input"],
                            ["Escape",       "Close dialogs"],
                        ].map(([key, desc]) => (
                            <div key={key} className="flex justify-between items-center">
                                <span className="text-muted-foreground">{desc}</span>
                                <kbd className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{key}</kbd>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
