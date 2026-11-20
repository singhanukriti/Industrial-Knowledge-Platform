import type { LucideIcon } from "lucide-react";
import { FileText, BookOpen, Database, Table, Image, BarChart2, HardDrive, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { useStorage } from "@/hooks/useStorage";
import { useActivity } from "@/hooks/useActivity";
import { useRecentDocuments } from "@/hooks/useRecentDocuments";

function Stat({ label, value, icon: Icon, color = "text-blue-600" }: {
    label: string; value: string | number; icon: LucideIcon; color?: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className={`rounded-xl bg-muted p-3 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsPage() {
    const { data: stats } = useDashboard();
    const { data: storage } = useStorage();
    const { data: activity = [] } = useActivity();
    const { data: docs = [] } = useRecentDocuments();

    const avgChunksPerDoc = stats && stats.documents > 0
        ? Math.round(stats.chunks / stats.documents)
        : 0;

    const avgPagesPerDoc = stats && stats.documents > 0
        ? Math.round(stats.pages / stats.documents)
        : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Platform-wide statistics and insights.
                </p>
            </div>

            {/* Knowledge Base Stats */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Knowledge Base</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <Stat label="Total Documents"  value={stats?.documents ?? 0} icon={FileText}  color="text-blue-600"   />
                    <Stat label="Total Pages"       value={stats?.pages     ?? 0} icon={BookOpen}  color="text-purple-600" />
                    <Stat label="Total Chunks"      value={stats?.chunks    ?? 0} icon={Database}  color="text-green-600"  />
                    <Stat label="Total Tables"      value={stats?.tables    ?? 0} icon={Table}     color="text-pink-600"   />
                    <Stat label="Total Images"      value={stats?.images    ?? 0} icon={Image}     color="text-orange-600" />
                    <Stat label="Avg Pages / Doc"   value={avgPagesPerDoc}        icon={BookOpen}  color="text-violet-600" />
                    <Stat label="Avg Chunks / Doc"  value={avgChunksPerDoc}       icon={Database}  color="text-teal-600"   />
                    <Stat label="Activity Events"   value={activity.length}       icon={Activity}  color="text-yellow-600" />
                </div>
            </section>

            {/* Storage */}
            {storage && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Storage Breakdown
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { label: "Uploaded PDFs",    value: storage.uploads  },
                            { label: "Extracted Images", value: storage.images   },
                            { label: "Chroma Database",  value: storage.chroma   },
                            { label: "Metadata",         value: storage.metadata },
                            { label: "Logs",             value: storage.logs     },
                            { label: "Total",            value: storage.total    },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl border p-4 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{label}</span>
                                <span className="font-semibold text-sm">{value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Document table */}
            {docs.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart2 className="h-5 w-5" />
                        Document Breakdown
                    </h2>
                    <div className="rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Document</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Pages</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Chunks</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Tables</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Images</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map((doc, i) => (
                                    <tr key={doc.document_id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                                        <td className="p-3 font-medium truncate max-w-[200px]">{doc.filename}</td>
                                        <td className="p-3 text-right text-muted-foreground">{doc.pages}</td>
                                        <td className="p-3 text-right text-muted-foreground">{doc.chunks}</td>
                                        <td className="p-3 text-right text-muted-foreground">{doc.tables}</td>
                                        <td className="p-3 text-right text-muted-foreground">{doc.images}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}
