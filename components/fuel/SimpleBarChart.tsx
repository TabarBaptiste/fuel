import React from 'react'
import { MonthlyStats } from '@/lib/types'

interface SimpleBarChartProps {
    data: MonthlyStats[]
    valueKey: keyof MonthlyStats
    labelKey: keyof MonthlyStats
    color: string
    unit: string
    decimals?: number
}

export function SimpleBarChart({ data, valueKey, labelKey, color, unit, decimals = 0 }: SimpleBarChartProps) {
    const maxValue = Math.max(...data.map(d => Number(d[valueKey]) || 0))
    const displayData = data.slice(-6) // Show last 6 months

    return (
        <div className="space-y-3">
            {displayData.map((item, index) => {
                const value = Number(item[valueKey]) || 0
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
                const label = String(item[labelKey])

                return (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium text-gray-800">
                                {value.toFixed(decimals)} {unit}
                            </span>
                        </div>
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
