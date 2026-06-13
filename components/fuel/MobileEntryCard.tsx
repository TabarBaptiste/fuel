import React from 'react'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { formatDateLong } from '@/lib/utils/dateFormat'
import { ConsumptionBadge } from './ConsumptionBadge'
import { EnrichedFuelEntry, FuelEntry } from '@/lib/types'

interface MobileEntryCardProps {
    entry: EnrichedFuelEntry
    onDelete: (id: number) => void
    onEdit: (entry: FuelEntry) => void
    isDeleting: boolean
    isAuthenticated: boolean
}

export function MobileEntryCard({ entry, onDelete, onEdit, isDeleting, isAuthenticated }: MobileEntryCardProps) {
    const hasKm = entry.kmCompteur > 0

    return (
        <div className="card p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-semibold text-gray-100">{formatDateLong(entry.date)}</p>
                    {hasKm && (
                        <p className="text-sm text-gray-500">{entry.kmCompteur.toLocaleString('fr-FR')} km</p>
                    )}
                    {entry.isFullTank ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700 mt-1">
                            Plein complet
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-900/50 text-amber-300 border border-amber-700 mt-1">
                            Plein partiel
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(entry)}
                        disabled={!isAuthenticated}
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Modifier"
                    >
                        {!isAuthenticated ? <span className="text-gray-400">🔒</span> : <Pencil className="w-4 h-4" />}
                    </button>
                    <button onClick={() => onDelete(entry.id)} disabled={isDeleting || !isAuthenticated} className="btn-danger" title="Supprimer">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : !isAuthenticated ? <span className="text-gray-400">🔒</span> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Litres</p>
                    <p className="font-semibold text-gray-100">{entry.litres.toFixed(2)} L à {entry.prixLitre.toFixed(3)} €</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Coût</p>
                    <p className="font-semibold text-gray-100">{entry.coutTotal.toFixed(2)} €</p>
                </div>
                {entry.kmParcourus > 0 && (
                    <>
                        <div className="bg-gray-700/50 rounded-lg p-3">
                            <p className="text-gray-400 text-xs">Parcourus</p>
                            <p className="font-semibold text-gray-100">{entry.kmParcourus} km</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-3">
                            <p className="text-gray-400 text-xs">Conso L/100km</p>
                            <ConsumptionBadge value={entry.consoL100km} />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
