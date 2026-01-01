import React from 'react'
import { Calendar, Loader2, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/dateFormat'
import { ConsumptionBadge } from './ConsumptionBadge'
import { MobileEntryCard } from './MobileEntryCard'
import { EmptyState } from './EmptyState'
import { EnrichedFuelEntry } from '@/lib/types'

interface HistoryTabProps {
    enrichedEntries: EnrichedFuelEntry[]
    onDelete: (id: number) => void
    deletingId: number | null
    hasEntries: boolean
    isAuthenticated: boolean
}

export function HistoryTab({ enrichedEntries, onDelete, deletingId, hasEntries, isAuthenticated }: HistoryTabProps) {
    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Historique des pleins
            </h2>

            {/* Desktop Table */}
            <div className="card overflow-hidden hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <tr>
                                <th className="table-header text-left">Date</th>
                                <th className="table-header text-right">Compteur</th>
                                <th className="table-header text-right">Parcourus</th>
                                <th className="table-header text-right">Litres</th>
                                <th className="table-header text-right">Prix/L</th>
                                <th className="table-header text-right">Coût</th>
                                <th className="table-header text-center">Type</th>
                                <th className="table-header text-right">L/100km</th>
                                <th className="table-header text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[...enrichedEntries].reverse().map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="table-cell">{formatDate(entry.date)}</td>
                                    <td className="table-cell text-right">{entry.kmCompteur.toLocaleString('fr-FR')}</td>
                                    <td className="table-cell text-right font-medium">
                                        {entry.kmParcourus > 0 ? `${entry.kmParcourus} km` : '-'}
                                    </td>
                                    <td className="table-cell text-right">{entry.litres.toFixed(2)} L</td>
                                    <td className="table-cell text-right">{entry.prixLitre.toFixed(3)} €</td>
                                    <td className="table-cell text-right font-medium">
                                        {entry.coutTotal > 0 ? `${entry.coutTotal.toFixed(2)} €` : '-'}
                                    </td>
                                    <td className="table-cell text-center">
                                        {entry.isFullTank ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                                                Plein
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-900/50 text-amber-300 border border-amber-700">
                                                Partiel
                                            </span>
                                        )}
                                    </td>
                                    <td className="table-cell text-right">
                                        <ConsumptionBadge value={entry.consoL100km} />
                                    </td>
                                    <td className="table-cell text-center">
                                        <button
                                            onClick={() => onDelete(entry.id)}
                                            disabled={deletingId === entry.id || !isAuthenticated}
                                            className="btn-danger"
                                        >
                                            {deletingId === entry.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : !isAuthenticated ? (
                                                <span className="text-gray-400">🔒</span>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
                {[...enrichedEntries].reverse().map((entry) => (
                    <MobileEntryCard
                        key={entry.id}
                        entry={entry}
                        onDelete={onDelete}
                        isDeleting={deletingId === entry.id}
                        isAuthenticated={isAuthenticated}
                    />
                ))}
            </div>

            {!hasEntries && (
                <EmptyState message="Aucun plein enregistré. Ajoutez votre premier plein pour commencer le suivi !" />
            )}
        </div>
    )
}
