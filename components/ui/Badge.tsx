import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300": variant === "default",
                    "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100": variant === "secondary",
                    "text-slate-950 dark:text-slate-50 border border-slate-200 dark:border-slate-800": variant === "outline",
                },
                className
            )}
            {...props}
        />
    );
}
