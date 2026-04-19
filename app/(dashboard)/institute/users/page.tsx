"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Search, MessageSquare, ShieldCheck, GraduationCap } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type User = {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "ALUMNI" | "ADMIN" | "INSTITUTE";
    isVerified: boolean;
};

export default function InstituteUserManagementPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-primary" />
                        Community Management
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Connect with any student or alumni directly.</p>
                </div>
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search students or alumni..."
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing Community...</div>
                ) : filteredUsers.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary font-bold text-xl border-2 border-white shadow-sm">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={`${
                                        user.role === "ALUMNI" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                        user.role === "STUDENT" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                        "bg-purple-50 text-purple-600 border-purple-100"
                                    } text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md`}>
                                        {user.role}
                                    </Badge>
                                    {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-500" />}
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-sm text-slate-500 mb-6 truncate px-1">
                            {user.email}
                        </div>

                        <Link
                            href={`/institute/messages/${user.id}`}
                            className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Direct Message
                        </Link>
                    </div>
                ))}
            </div>
            
            {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">NO MEMBERS FOUND</p>
                </div>
            )}
        </div>
    );
}
