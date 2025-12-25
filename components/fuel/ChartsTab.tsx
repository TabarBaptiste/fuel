import React from 'react'
import { BarChart3, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ChartCard } from './ChartCard'
import { CombinedBarChart } from './CombinedBarChart'
import { ConsumptionBadge } from './ConsumptionBadge'
import { EmptyState } from './EmptyState'
import { MonthlyStats } from '@/lib/types'

interface ChartsTabProps {
    monthlyStats: MonthlyStats[]
}

export function ChartsTab({ monthlyStats }: ChartsTabProps) {
    const getTrendIcon = (currentItem: MonthlyStats, valueKey: keyof MonthlyStats) => {
        const currentIndex = monthlyStats.findIndex(item => item.mois === currentItem.mois)
        if (currentIndex <= 0) return null // No previous month

        const previousItem = monthlyStats[currentIndex - 1]
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
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Évolution mensuelle
            </h2>

            {monthlyStats.length > 0 ? (
                <>
                    {/* Monthly Summary Table */}
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                                Résumé mensuel
                            </h3>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="table-header text-left">Mois</th>
                                        <th className="table-header text-right">Coût</th>
                                        <th className="table-header text-right">Litres</th>
                                        <th className="table-header text-right">Conso</th>
                                        <th className="table-header text-right">Pleins</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {[...monthlyStats].reverse().map((month) => (
                                        <tr key={month.mois} className="hover:bg-gray-50">
                                            <td className="table-cell font-medium">{month.moisLabel}</td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span>{month.coutTotal.toFixed(2)} €</span>
                                                    {getTrendIcon(month, 'coutTotal')}
                                                </div>
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span>{month.litresTotal.toFixed(1)} L</span>
                                                    {getTrendIcon(month, 'litresTotal')}
                                                </div>
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <ConsumptionBadge value={month.consoMoyenne} />
                                                    {getTrendIcon(month, 'consoMoyenne')}
                                                </div>
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span>{month.nbPleins}</span>
                                                    {getTrendIcon(month, 'nbPleins')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3 p-4">
                            {[...monthlyStats].reverse().map((month) => (
                                <div key={month.mois} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-gray-800">{month.moisLabel}</h4>
                                        <div className="flex items-center gap-1">
                                            <ConsumptionBadge value={month.consoMoyenne} />
                                            {getTrendIcon(month, 'consoMoyenne')}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div className="text-center">
                                            <p className="text-gray-500">Coût</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <p className="font-semibold text-amber-600">{month.coutTotal.toFixed(2)} €</p>
                                                {getTrendIcon(month, 'coutTotal')}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-500">Litres</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <p className="font-semibold text-blue-600">{month.litresTotal.toFixed(1)} L</p>
                                                {getTrendIcon(month, 'litresTotal')}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-500">Pleins</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <p className="font-semibold text-indigo-600">{month.nbPleins}</p>
                                                {getTrendIcon(month, 'nbPleins')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Combined Chart */}
                    <ChartCard
                        subtitle="Coûts, litres et consommation par mois"
                    >
                        <CombinedBarChart
                            data={monthlyStats}
                            series={[
                                {
                                    valueKey: 'coutTotal',
                                    label: 'Coût',
                                    color: 'from-amber-400 to-orange-500',
                                    unit: '€',
                                    decimals: 2
                                },
                                {
                                    valueKey: 'litresTotal',
                                    label: 'Litres',
                                    color: 'from-blue-400 to-cyan-500',
                                    unit: 'L',
                                    decimals: 1
                                },
                                {
                                    valueKey: 'consoMoyenne',
                                    label: 'Consommation',
                                    color: 'from-green-400 to-emerald-500',
                                    unit: 'L/100',
                                    decimals: 1
                                }
                            ]}
                        />
                    </ChartCard>
                </>
            ) : (
                <EmptyState message="Pas encore assez de données pour afficher les graphiques. Ajoutez au moins 2 pleins." />
            )}
        </div>
    )
}
