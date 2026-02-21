"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

export default function AlumFinderControlPage() {
    const Map = useMemo(
        () =>
            dynamic(() => import("@/components/features/map/AlumniMap"), {
                loading: () => (
                    <div className="h-[600px] w-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                        Loading Global Map...
                    </div>
                ),
                ssr: false,
            }),
        []
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MapPin className="w-8 h-8 text-red-500" /> AlumFinder Control
                </h1>
                <p className="text-slate-500 mt-1">Configure global map settings and monitor geographic networking.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative z-0">
                <Map />
            </div>
        </div>
    );
}
