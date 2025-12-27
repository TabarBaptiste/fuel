import React from 'react'

interface MiniStatProps {
    label: string
    value: string
}

export function MiniStat({ label, value }: MiniStatProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-lg font-bold text-gray-100">{value}</p>
        </div>
    )
}
