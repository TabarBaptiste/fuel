import React from 'react'

interface ConsumptionBadgeProps {
    value: number
}

export function ConsumptionBadge({ value }: ConsumptionBadgeProps) {
    if (value <= 0) return <span className="text-gray-400">-</span>

    let colorClass = 'bg-gray-100 text-gray-800'
    if (value < 6) colorClass = 'bg-green-100 text-green-800'
    else if (value < 8) colorClass = 'bg-yellow-100 text-yellow-800'
    else colorClass = 'bg-red-100 text-red-800'

    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {value.toFixed(1)}
        </span>
    )
}
