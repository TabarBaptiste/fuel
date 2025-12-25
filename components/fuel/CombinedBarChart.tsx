import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MonthlyStats } from '@/lib/types'

interface DataSeries {
    valueKey: keyof MonthlyStats
    label: string
    color: string
    unit: string
    decimals?: number
}

interface CombinedBarChartProps {
    data: MonthlyStats[]
    series: DataSeries[]
}

export function CombinedBarChart({ data, series }: CombinedBarChartProps) {
    const displayData = data.slice(-6) // Show last 6 months

    const getTrendIcon = (currentItem: MonthlyStats, valueKey: keyof MonthlyStats) => {
        const currentIndex = data.findIndex(item => item.mois === currentItem.mois)
        if (currentIndex <= 0) return null // No previous month

        const previousItem = data[currentIndex - 1]
        const currentValue = Number(currentItem[valueKey]) || 0
        const previousValue = Number(previousItem[valueKey]) || 0

        if (currentValue > previousValue) {
            return <TrendingUp className="w-4 h-4 text-green-500" />
        } else if (currentValue < previousValue) {
            return <TrendingDown className="w-4 h-4 text-red-500" />
        } else {
            return <Minus className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <div className="space-y-6">
            {displayData.reverse().map((item, monthIndex) => {
                const label = item.moisLabel

                return (
                    <div key={monthIndex} className="space-y-2">
                        <h4 className="font-semibold text-gray-700">{label}</h4>
                        <div className="space-y-2 pl-2">
                            {series.map((s, seriesIndex) => {
                                const value = Number(item[s.valueKey]) || 0
                                // Calculer le max pour cette série spécifique
                                const maxValue = Math.max(...data.map(d => Number(d[s.valueKey]) || 0))
                                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

                                return (
                                    <div key={seriesIndex} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">{s.label}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-800">
                                                    {value.toFixed(s.decimals || 0)} {s.unit}
                                                </span>
                                                {getTrendIcon(item, s.valueKey)}
                                            </div>
                                        </div>
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
