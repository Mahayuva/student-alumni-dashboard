"use client";

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">🚧</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500 max-w-md">
                This feature is currently under development. Stay tuned for updates!
            </p>
        </div>
    );
}
