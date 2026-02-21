"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function AlumniMapPage() {
    const Map = useMemo(
        () =>
            dynamic(() => import("@/components/features/map/AlumniMap"), {
                loading: () => (
                    <div className="h-[600px] w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        Loading Map...
                    </div>
                ),
                ssr: false,
            }),
        []
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">AlumFinder</h1>
                <p className="text-slate-500">Discover where your peers are working around the world.</p>
            </div>

            <Map />
        </div>
    );
}
