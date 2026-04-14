"use client";

import { useState, useEffect } from "react";
import { Palette, Type, Check, X, Settings2, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeCustomizer() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // We'll use local state for immediate feedback, but sync with localStorage/document
    const [themeColor, setThemeColor] = useState("blue");
    const [fontFamily, setFontFamily] = useState("inter");
    const { theme: mode, setTheme: setMode } = useTheme();

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
        // Load saved preferences
        const savedColor = localStorage.getItem("theme-color") || "blue";
        const savedFont = localStorage.getItem("theme-font") || "inter";
        setThemeColor(savedColor);
        setFontFamily(savedFont);

        // Apply immediately
        if (savedColor.startsWith('#')) {
            document.documentElement.setAttribute("data-theme", "custom");
            document.documentElement.style.setProperty('--primary', savedColor);
            document.documentElement.style.setProperty('--primary-light', savedColor + '1a');
            document.documentElement.style.setProperty('--primary-shadow', savedColor + '33');
        } else {
            document.documentElement.setAttribute("data-theme", savedColor);
            document.documentElement.style.removeProperty('--primary');
            document.documentElement.style.removeProperty('--primary-light');
            document.documentElement.style.removeProperty('--primary-shadow');
        }
        document.body.setAttribute("data-font", savedFont);
    }, []);

    const handleColorChange = (color: string) => {
        setThemeColor(color);
        localStorage.setItem("theme-color", color);
        if (color.startsWith('#')) {
            document.documentElement.setAttribute("data-theme", "custom");
            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--primary-light', color + '1a');
            document.documentElement.style.setProperty('--primary-shadow', color + '33');
        } else {
            document.documentElement.setAttribute("data-theme", color);
            document.documentElement.style.removeProperty('--primary');
            document.documentElement.style.removeProperty('--primary-light');
            document.documentElement.style.removeProperty('--primary-shadow');
        }
    };

    const handleFontChange = (font: string) => {
        setFontFamily(font);
        localStorage.setItem("theme-font", font);
        document.body.setAttribute("data-font", font);
    };

    if (!mounted) return null;

    const themes = [
        { id: "blue", color: "#2563eb", label: "Blue" },
        { id: "purple", color: "#7c3aed", label: "Purple" },
        { id: "green", color: "#059669", label: "Green" },
        { id: "orange", color: "#ea580c", label: "Orange" },
        { id: "rose", color: "#e11d48", label: "Rose" },
    ];

    const fonts = [
        { id: "inter", label: "Modern (Inter)", style: "font-sans" },
        { id: "serif", label: "Elegant (Serif)", style: "font-serif" },
        { id: "mono", label: "Technical (Mono)", style: "font-mono" },
        { id: "roboto", label: "Clean (Roboto)", style: "font-sans" },
        { id: "poppins", label: "Geometric (Poppins)", style: "font-sans" },
        { id: "outfit", label: "Contemporary (Outfit)", style: "font-sans" },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-transparent"
            >
                <Settings2 className="w-4 h-4" />
                <span className="hidden md:inline">Customize</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Theme Settings
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Colors */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                                Accent Color
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {themes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleColorChange(t.id)}
                                        className={`w-full aspect-square rounded-full flex items-center justify-center transition-all ${themeColor === t.id
                                                ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                                                : "hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: t.color }}
                                        title={t.label}
                                    >
                                        {themeColor === t.id && <Check className="w-4 h-4 text-white" />}
                                    </button>
                                ))}
                                
                                {/* Custom Color Picker Box */}
                                <div 
                                    className={`relative w-full aspect-square rounded-full flex items-center justify-center transition-all shadow-sm border border-slate-200 overflow-hidden ${
                                        themeColor.startsWith('#')
                                            ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                                            : "hover:scale-105"
                                    }`}
                                    style={{ 
                                        background: themeColor.startsWith('#') 
                                            ? themeColor 
                                            : 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
                                    }}
                                    title="Custom Color"
                                >
                                    <input 
                                        type="color" 
                                        value={themeColor.startsWith('#') ? themeColor : '#2563eb'}
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        className="absolute inset-[auto] w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 cursor-pointer z-10"
                                    />
                                    {themeColor.startsWith('#') && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                            <Check className="w-4 h-4 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fonts */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                                Font Family
                            </label>
                            <div className="space-y-2">
                                {fonts.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => handleFontChange(f.id)}
                                        className={`w-full px-4 py-3 rounded-lg border text-left text-sm transition-all flex justify-between items-center ${fontFamily === f.id
                                                ? "border-primary bg-primary-light text-primary"
                                                : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        <span className={f.style}>{f.label}</span>
                                        {fontFamily === f.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
