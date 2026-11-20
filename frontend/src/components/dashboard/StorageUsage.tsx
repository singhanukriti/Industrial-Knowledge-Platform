import { HardDrive, FolderOpen, Image, Database, FileText, FileCode } from "lucide-react";
import { useStorage } from "@/hooks/useStorage";

interface RowProps {
    icon: React.ElementType;
    title: string;
    value: string;
    bold?: boolean;
}

function Row({ icon: Icon, title, value, bold = false }: RowProps) {
    return (
        <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 shrink-0" />
                <span className={bold ? "font-semibold text-foreground" : ""}>{title}</span>
            </div>
            <span className={`text-sm ${bold ? "font-bold text-foreground" : "font-medium"}`}>
                {value}
            </span>
        </div>
    );
}

export default function StorageUsage() {
    const { data } = useStorage();

    if (!data) return null;

    return (
        <div className="rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-6">
                <HardDrive className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-2xl font-semibold">Storage Usage</h2>
            </div>

            <div className="space-y-2">
                <Row icon={FolderOpen} title="Uploaded PDFs"    value={data.uploads}  />
                <Row icon={Image}      title="Extracted Images" value={data.images}   />
                <Row icon={Database}   title="Chroma Database"  value={data.chroma}   />
                <Row icon={FileText}   title="Metadata"         value={data.metadata} />
                <Row icon={FileCode}   title="Logs"             value={data.logs}     />
                <hr className="my-2" />
                <Row icon={HardDrive}  title="Total"            value={data.total}    bold />
            </div>
        </div>
    );
}
