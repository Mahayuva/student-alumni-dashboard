"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Check, MoreHorizontal, Search, UserCog, UserMinus, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

type User = {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "ALUMNI" | "ADMIN";
    isVerified: boolean;
};

export default function UserManagementPage() {
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

    const handleAction = async (id: string, action: string, newRole?: string) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, role: newRole })
            });

            if (res.ok) {
                toast.success("User updated successfully");
                fetchUsers(); // Refresh
            } else {
                toast.error("Failed to update user");
            }
        } catch (e) {
            toast.error("An error occurred");
        }
    };

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-slate-500">Manage students and alumni access.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex h-64 items-center justify-center text-slate-400">Loading users...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-900">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50:bg-slate-800/20 transition-colors">
                                    <td className="p-4 font-medium">{user.name || "Unknown"}</td>
                                    <td className="p-4">
                                        <Badge className={
                                            user.role === "ADMIN" ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-0" :
                                                user.role === "ALUMNI" ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-0" :
                                                    "bg-blue-100 text-blue-700 hover:bg-blue-200 border-0"
                                        }>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-slate-500">{user.email}</td>
                                    <td className="p-4">
                                        <Badge className={
                                            user.isVerified ? "bg-green-100 text-green-700" :
                                                "bg-yellow-100 text-yellow-700"
                                        }>
                                            {user.isVerified ? "Active" : "Pending Verification"}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {!user.isVerified && (
                                                <button
                                                    onClick={() => handleAction(user.id, "verify")}
                                                    className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100:bg-green-900/40 rounded-lg transition-colors"
                                                    title="Approve User"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            {user.role !== "ADMIN" && (
                                                <button
                                                    onClick={() => handleAction(user.id, "updateRole", "ADMIN")}
                                                    className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100:bg-purple-900/40 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                                                    title="Promote to Admin"
                                                >
                                                    <UserCog className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
