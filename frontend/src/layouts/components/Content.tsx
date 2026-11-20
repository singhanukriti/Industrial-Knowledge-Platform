import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Content({ children }: Props) {
    return (
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
            {children}
        </main>
    );
}
