import React from 'react'
import { Gauge, Calendar, BarChart3, LucideIcon } from 'lucide-react'

type TabId = 'dashboard' | 'history' | 'charts'

interface Tab {
    id: TabId
    label: string
    icon: LucideIcon
}

interface NavigationTabsProps {
    activeTab: TabId
    onTabChange: (tab: TabId) => void
}

const tabs: Tab[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Gauge },
    { id: 'history', label: 'Historique', icon: Calendar },
    { id: 'charts', label: 'Graphiques', icon: BarChart3 },
]

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
    return (
        <nav className="flex gap-2 p-1 bg-white rounded-xl shadow-sm">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </nav>
    )
}
