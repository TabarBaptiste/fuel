import React from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { formatDateLong } from '@/lib/utils/dateFormat'
import { ConsumptionBadge } from './ConsumptionBadge'

interface MobileEntryCardProps {
    entry: {
        id: number
        date: string
        kmCompteur: number
        kmParcourus: number
        litres: number
        prixLitre: number
        coutTotal: number
        consoL100km: number
    }
    onDelete: (id: number) => void
    isDeleting: boolean
    isAuthenticated: boolean
}

export function MobileEntryCard({ entry, onDelete, isDeleting, isAuthenticated }: MobileEntryCardProps) {
    return (
        <div className="card p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-semibold text-gray-100">{formatDateLong(entry.date)}</p>
                    <p className="text-sm text-gray-500">{entry.kmCompteur.toLocaleString('fr-FR')} km</p>
                </div>
                <button onClick={() => onDelete(entry.id)} disabled={isDeleting || !isAuthenticated} className="btn-danger">
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : !isAuthenticated ? <span className="text-gray-400">🔒</span> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>

            {entry.kmParcourus > 0 && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Parcourus</p>
                        <p className="font-semibold">{entry.kmParcourus} km</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Litres</p>
                        <p className="font-semibold">{entry.litres.toFixed(2)} L à {entry.prixLitre.toFixed(2)} €</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Coût</p>
                        <p className="font-semibold">{entry.coutTotal.toFixed(2)} €</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs">Conso L/100km</p>
                        <ConsumptionBadge value={entry.consoL100km} />
                    </div>
                </div>
            )}
        </div>
    )
}
