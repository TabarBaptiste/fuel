import React from 'react'
import { Fuel, Settings } from 'lucide-react'

interface HeaderProps {
    tankCapacity: number
    showSettings: boolean
    onToggleSettings: () => void
    onTankCapacityChange: (value: number) => void
    defaultCapacity: number
}

export function Header({
    tankCapacity,
    showSettings,
    onToggleSettings,
    onTankCapacityChange,
    defaultCapacity
}: HeaderProps) {
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                            <Fuel className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Carburant</h1>
                            <p className="text-xs text-gray-500">Suivi intelligent</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleSettings}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {showSettings && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-fade-in">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacité du réservoir (L)
                        </label>
                        <input
                            type="number"
                            value={tankCapacity}
                            onChange={(e) => onTankCapacityChange(parseFloat(e.target.value) || defaultCapacity)}
                            className="input-field w-32"
                        />
                    </div>
                )}
            </div>
        </header>
    )
}
