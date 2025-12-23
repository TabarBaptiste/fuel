import React from 'react'
import { BarChart3 } from 'lucide-react'
import { ChartCard } from './ChartCard'
import { SimpleBarChart } from './SimpleBarChart'
import { ConsumptionBadge } from './ConsumptionBadge'
import { EmptyState } from './EmptyState'
import { MonthlyStats } from '@/lib/types'

interface ChartsTabProps {
    monthlyStats: MonthlyStats[]
}

export function ChartsTab({ monthlyStats }: ChartsTabProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Évolution mensuelle
            </h2>

            {monthlyStats.length > 0 ? (
                <>
                    {/* Cost per Month Chart */}
                    <ChartCard
                        title="💸 Coût par mois"
                        subtitle="Dépenses mensuelles en carburant"
                    >
                        <SimpleBarChart
                            data={monthlyStats}
                            valueKey="coutTotal"
                            labelKey="moisLabel"
                            color="from-amber-400 to-orange-500"
                            unit="€"
                        />
                    </ChartCard>

                    {/* Liters per Month Chart */}
                    <ChartCard
                        title="⛽ Litres achetés par mois"
                        subtitle="Volume de carburant consommé"
                    >
                        <SimpleBarChart
                            data={monthlyStats}
                            valueKey="litresTotal"
                            labelKey="moisLabel"
                            color="from-blue-400 to-cyan-500"
                            unit="L"
                        />
                    </ChartCard>

                    {/* Consumption per Month Chart */}
                    <ChartCard
                        title="📊 Consommation moyenne par mois"
                        subtitle="L/100km - évolution de l'efficacité"
                    >
                        <SimpleBarChart
                            data={monthlyStats}
                            valueKey="consoMoyenne"
                            labelKey="moisLabel"
                            color="from-green-400 to-emerald-500"
                            unit="L/100"
                            decimals={1}
                        />
                    </ChartCard>

                    {/* Monthly Summary Table */}
                    <div className="card overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800">📅 Résumé mensuel</h3>
                        </div>
                        <div className="overflow-x-auto">
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
                                            <td className="table-cell text-right">{month.coutTotal.toFixed(2)} €</td>
                                            <td className="table-cell text-right">{month.litresTotal.toFixed(1)} L</td>
                                            <td className="table-cell text-right">
                                                <ConsumptionBadge value={month.consoMoyenne} />
                                            </td>
                                            <td className="table-cell text-right">{month.nbPleins}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState message="Pas encore assez de données pour afficher les graphiques. Ajoutez au moins 2 pleins." />
            )}
        </div>
    )
}
