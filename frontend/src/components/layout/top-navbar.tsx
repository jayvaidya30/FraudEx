'use client';

import { Bell, User, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/upload': 'Upload Document',
    '/history': 'Document History',
    '/settings': 'Settings',
};

export function TopNavbar() {
    const pathname = usePathname();

    // Get page title, handle dynamic routes
    let pageTitle = pageTitles[pathname] || 'Dashboard';
    if (pathname.startsWith('/report/')) {
        pageTitle = 'Analysis Report';
    }

    return (
        <header className="fixed top-0 right-0 left-16 md:left-64 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 transition-all duration-300">
            <div className="flex h-full items-center justify-between px-6">
                {/* Page Title */}
                <div>
                    <h1 className="text-xl font-semibold text-white">{pageTitle}</h1>
                    <p className="text-xs text-slate-400">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                    </button>

                    {/* User Profile */}
                    <button className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800 transition-colors">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-white">Alex Chen</p>
                            <p className="text-xs text-slate-400">Admin</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
                    </button>
                </div>
            </div>
        </header>
    );
}
