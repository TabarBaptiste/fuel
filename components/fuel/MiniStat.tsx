import React from 'react'

interface MiniStatProps {
    label: string
    value: string
}

export function MiniStat({ label, value }: MiniStatProps) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    )
}
