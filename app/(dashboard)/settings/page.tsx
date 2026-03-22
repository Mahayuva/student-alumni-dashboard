"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, Bell, Shield, Camera, Save, Linkedin, Github, Twitter, Loader2, Settings } from "lucide-react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState("profile");
    const [isLoading, setIsLoading] = useState(false);
    const [aiKey, setAiKey] = useState("");
    const [isSavingAiKey, setIsSavingAiKey] = useState(false);

    // Fetch AI Key for Admins
    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            fetch("/api/admin/config")
                .then(res => res.json())
                .then(data => {
                    const keyConfig = data.find((c: any) => c.key === "GOOGLE_AI_KEY");
                    if (keyConfig) setAiKey(keyConfig.value);
                })
                .catch(err => console.error("Failed to fetch config", err));
        }
    }, [session]);

    const [profile, setProfile] = useState({
        fullName: session?.user?.name || "",
        email: session?.user?.email || "",
        bio: "",
        batch: "",
        department: "",
        city: "",
        company: "",
        jobTitle: "",
        education: "",
        skills: "",
        interests: "",
        social: {
            linkedin: "",
            github: "",
            twitter: ""
        }
    });

    // Fetch live profile from DB
    useEffect(() => {
        if (session?.user?.email) {
            fetch("/api/settings/profile")
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setProfile(prev => ({ ...prev, ...data }));
                    }
                })
                .catch(err => console.error("Failed to fetch live profile data", err));
        }
    }, [session?.user?.email]);

    const [toggles, setToggles] = useState({
        notifications: {
            email: true,
            jobAlerts: true,
            events: true,
            mentorship: true
        },
        privacy: {
            publicProfile: true,
            showEmail: true,
            showLocation: true,
            acceptMentorship: true
        }
    });

    // Fetch live toggles
    useEffect(() => {
        if (session?.user?.email) {
            fetch("/api/settings/toggles")
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setToggles({
                            notifications: {
                                email: data.emailNotifications ?? true,
                                jobAlerts: data.jobAlerts ?? true,
                                events: data.eventReminders ?? true,
                                mentorship: data.mentorshipRequests ?? true
                            },
                            privacy: {
                                publicProfile: data.publicProfile ?? true,
                                showEmail: data.showEmail ?? true,
                                showLocation: data.showLocation ?? true,
                                acceptMentorship: data.acceptMentorship ?? true
                            }
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch toggles", err));
        }
    }, [session?.user?.email]);

    const updateToggle = async (key: string, value: boolean) => {
        try {
            const res = await fetch("/api/settings/toggles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: value })
            });
            if (!res.ok) throw new Error("Update failed");
        } catch (e) {
            console.error("Toggle update failed", e);
            // Revert state if needed or show error
        }
    };

    const handleSaveAiKey = async () => {
        setIsSavingAiKey(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "GOOGLE_AI_KEY", value: aiKey })
            });
            if (res.ok) alert("AI Settings Updated!");
        } catch (e) {
            console.error("Save error", e);
        } finally {
            setIsSavingAiKey(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/settings/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            const data = await res.json();
            if (res.ok) {
                // Successful save
                alert("Profile Updated Successfully!");
            } else {
                console.error("Failed to save", data);
                alert("Failed to save profile");
            }
        } catch (e) {
            console.error("Save error", e);
            alert("An error occurred during save");
        } finally {
            setIsLoading(false);
        }
    };

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const res = await fetch("/api/settings/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword })
            });

            if (res.ok) {
                alert("Password Updated Successfully!");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                alert(data.error || "Update failed");
            }
        } catch (e) {
            console.error("Password update error", e);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "privacy", label: "Privacy", icon: Shield },
        ...(session?.user?.role === "ADMIN" ? [{ id: "admin", label: "Admin Settings", icon: Settings }] : []),
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
                    <Settings className="w-8 h-8 text-blue-600" /> Settings
                </h1>
                <p className="text-slate-500 mt-1">Manage your account preferences</p>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">

                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Profile Photo Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-1">Profile Photo</h2>
                            <p className="text-sm text-slate-500 mb-6">Update your profile picture</p>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        session?.user?.name?.charAt(0) || "U"
                                    )}
                                </div>
                                <div>
                                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                                        <Camera className="w-4 h-4" /> Change Photo
                                    </button>
                                    <p className="text-xs text-slate-400 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-6">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <input type="email" value={profile.email} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Bio</label>
                                    <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Tell us about yourself..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Batch/Year</label>
                                    <input type="text" value={profile.batch} onChange={(e) => setProfile({ ...profile, batch: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Department</label>
                                    <input type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <input type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company</label>
                                    <input type="text" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Job Title</label>
                                    <input type="text" value={profile.jobTitle} onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Education</label>
                                    <input type="text" value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Skills (comma separated)</label>
                                    <input type="text" value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Interests (comma separated)</label>
                                    <input type="text" value={profile.interests} onChange={(e) => setProfile({ ...profile, interests: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Social Links Card */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-6">Social Links</h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="LinkedIn URL" value={profile.social.linkedin} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, linkedin: e.target.value } })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="relative">
                                    <Github className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="GitHub URL" value={profile.social.github} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, github: e.target.value } })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" placeholder="Twitter URL" value={profile.social.twitter} onChange={(e) => setProfile({ ...profile, social: { ...profile.social, twitter: e.target.value } })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="fixed bottom-6 right-6 z-20 md:static md:flex md:justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === "security" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-1">Change Password</h2>
                            <p className="text-sm text-slate-500 mb-6">Update your account password</p>

                            <div className="space-y-4 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="Enter new password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm new password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                                    />
                                </div>
                                <div className="pt-2">
                                    <button 
                                        onClick={handleUpdatePassword}
                                        disabled={isUpdatingPassword}
                                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50"
                                    >
                                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === "notifications" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Email notifications</div>
                                        <div className="text-sm text-slate-500">Receive updates via email</div>
                                    </div>
                                    <Toggle checked={toggles.notifications.email} onChange={() => {
                                        setToggles(p => ({ ...p, notifications: { ...p.notifications, email: !p.notifications.email } }));
                                        updateToggle("emailNotifications", !toggles.notifications.email);
                                    }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Job alerts</div>
                                        <div className="text-sm text-slate-500">New job postings matching your profile</div>
                                    </div>
                                    <Toggle checked={toggles.notifications.jobAlerts} onChange={() => {
                                        setToggles(p => ({ ...p, notifications: { ...p.notifications, jobAlerts: !p.notifications.jobAlerts } }));
                                        updateToggle("jobAlerts", !toggles.notifications.jobAlerts);
                                    }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Event reminders</div>
                                        <div className="text-sm text-slate-500">Upcoming events you're registered for</div>
                                    </div>
                                    <Toggle checked={toggles.notifications.events} onChange={() => {
                                        setToggles(p => ({ ...p, notifications: { ...p.notifications, events: !p.notifications.events } }));
                                        updateToggle("eventReminders", !toggles.notifications.events);
                                    }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Mentorship requests</div>
                                        <div className="text-sm text-slate-500">When someone wants to connect</div>
                                    </div>
                                    <Toggle checked={toggles.notifications.mentorship} onChange={() => {
                                        setToggles(p => ({ ...p, notifications: { ...p.notifications, mentorship: !p.notifications.mentorship } }));
                                        updateToggle("mentorshipRequests", !toggles.notifications.mentorship);
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRIVACY TAB */}
                {activeTab === "privacy" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-6">Privacy Settings</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Public profile</div>
                                        <div className="text-sm text-slate-500">Allow others to view your profile</div>
                                    </div>
                                    <Toggle checked={toggles.privacy.publicProfile} onChange={() => {
                                        setToggles(p => ({ ...p, privacy: { ...p.privacy, publicProfile: !p.privacy.publicProfile } }));
                                        updateToggle("publicProfile", !toggles.privacy.publicProfile);
                                    }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Show email</div>
                                        <div className="text-sm text-slate-500">Display email on your profile</div>
                                    </div>
                                    <Toggle checked={toggles.privacy.showEmail} onChange={() => {
                                        setToggles(p => ({ ...p, privacy: { ...p.privacy, showEmail: !p.privacy.showEmail } }));
                                        updateToggle("showEmail", !toggles.privacy.showEmail);
                                    }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Show location on map</div>
                                        <div className="text-sm text-slate-500">Appear in AlumFinder</div>
                                    </div>
                                    <Toggle checked={toggles.privacy.showLocation} onChange={() => {
                                        setToggles(p => ({ ...p, privacy: { ...p.privacy, showLocation: !p.privacy.showLocation } }));
                                        updateToggle("showLocation", !toggles.privacy.showLocation);
                                    }} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Accept mentorship requests</div>
                                        <div className="text-sm text-slate-500">Allow students to connect</div>
                                    </div>
                                    <Toggle checked={toggles.privacy.acceptMentorship} onChange={() => {
                                        setToggles(p => ({ ...p, privacy: { ...p.privacy, acceptMentorship: !p.privacy.acceptMentorship } }));
                                        updateToggle("acceptMentorship", !toggles.privacy.acceptMentorship);
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADMIN TAB */}
                {activeTab === "admin" && session?.user?.role === "ADMIN" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-1 text-red-600">Platform-Wide API Settings</h2>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Critical configuration for system AI features (Chatbot & Skills Analyzer). This key will be used by everyone on the platform.</p>

                            <div className="space-y-4 max-w-2xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        Google AI Studio API Key (Gemini)
                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Encrypted</span>
                                    </label>
                                    <div className="relative group">
                                        <Shield className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        <input 
                                            type="password" 
                                            placeholder="AIzaSy..." 
                                            value={aiKey}
                                            onChange={(e) => setAiKey(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm" 
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-500 underline">Google AI Studio</a>. This will override the one in your .env file.</p>
                                </div>
                                <div className="pt-2">
                                    <button 
                                        onClick={handleSaveAiKey}
                                        disabled={isSavingAiKey}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
                                    >
                                        {isSavingAiKey ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" /> Save Global Key
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional Config Tip */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex gap-4">
                            <Bell className="w-6 h-6 text-blue-500 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900">Pro-Tip for Admins</h3>
                                <p className="text-sm text-blue-700 mt-1">Changes to the AI API key are instant. If your chatbot or skill analyzer stops working, verify your key has not reached its quota limits at the Google Cloud Console.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon helper
function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? "bg-blue-600" : "bg-slate-200"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );
}
