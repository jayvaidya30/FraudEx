'use client';

import { useState } from 'react';
import {
    User,
    Bell,
    Shield,
    Palette,
    Database,
    Mail,
    Lock,
    Globe,
    Moon,
    Sun,
    Check,
} from 'lucide-react';

export default function SettingsPage() {
    const [darkMode, setDarkMode] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    const settingSections = [
        {
            title: 'Profile',
            icon: User,
            description: 'Manage your account details',
            settings: [
                { label: 'Full Name', value: 'Alex Chen', type: 'text' },
                { label: 'Email', value: 'alex.chen@company.com', type: 'email' },
                { label: 'Role', value: 'Admin', type: 'readonly' },
            ],
        },
        {
            title: 'Security',
            icon: Lock,
            description: 'Password and authentication settings',
            settings: [
                { label: 'Password', value: '••••••••••••', type: 'password' },
                { label: 'Two-Factor Auth', value: 'Enabled', type: 'badge' },
            ],
        },
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-slate-400">
                    Manage your account and application preferences
                </p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {settingSections.map((section) => (
                    <div
                        key={section.title}
                        className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden"
                    >
                        <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                                <section.icon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-slate-400">{section.description}</p>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {section.settings.map((setting) => (
                                <div
                                    key={setting.label}
                                    className="flex items-center justify-between"
                                >
                                    <label className="text-sm text-slate-300">
                                        {setting.label}
                                    </label>
                                    {setting.type === 'badge' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                            <Check className="h-3 w-3" />
                                            {setting.value}
                                        </span>
                                    ) : (
                                        <input
                                            type={setting.type === 'password' ? 'password' : 'text'}
                                            value={setting.value}
                                            readOnly={setting.type === 'readonly'}
                                            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-sm w-64 focus:outline-none focus:border-blue-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Appearance */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                    <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                            <Palette className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Appearance</h3>
                            <p className="text-sm text-slate-400">
                                Customize the look and feel
                            </p>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {darkMode ? (
                                    <Moon className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-slate-400" />
                                )}
                                <span className="text-sm text-slate-300">Dark Mode</span>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-slate-400" />
                                <span className="text-sm text-slate-300">Language</span>
                            </div>
                            <select className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500">
                                <option>English (US)</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                    <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/20">
                            <Bell className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Notifications</h3>
                            <p className="text-sm text-slate-400">
                                Configure how you receive alerts
                            </p>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-slate-400" />
                                <span className="text-sm text-slate-300">
                                    Email Notifications
                                </span>
                            </div>
                            <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-slate-400" />
                                <span className="text-sm text-slate-300">
                                    Push Notifications
                                </span>
                            </div>
                            <button
                                onClick={() => setPushNotifications(!pushNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications ? 'bg-blue-600' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data & Privacy */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                    <div className="flex items-center gap-3 p-5 border-b border-slate-700/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/20">
                            <Database className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Data & Privacy</h3>
                            <p className="text-sm text-slate-400">
                                Manage your data and privacy settings
                            </p>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Export All Data</span>
                            <button className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors">
                                Download
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">
                                Delete All Documents
                            </span>
                            <button className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm font-medium hover:bg-red-600/30 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
