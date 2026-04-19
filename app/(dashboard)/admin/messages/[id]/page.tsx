"use client";

import React from "react";
import { ThreadView } from "@/components/features/messages/ThreadView";

export default function AdminMessagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    return <ThreadView id={id} backUrl="/admin/users" />;
}
