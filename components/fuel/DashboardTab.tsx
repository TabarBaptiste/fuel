import React from 'react'
import { Wallet, Droplets, Route, Car, Plus, Loader2 } from 'lucide-react'
import { QuestionCard } from './QuestionCard'
import { FormField } from './FormField'
import { MiniStat } from './MiniStat'
import { Stats, MonthlyStats, TripEstimate, NewEntryForm } from '@/lib/types'

interface DashboardTabProps {
    monthlyStats: MonthlyStats[]
    stats: Stats
    entries: any[]
    tripDistance: string
    onTripDistanceChange: (value: string) => void
    tripEstimate: TripEstimate | null
    fullTankCost: number
    newEntry: NewEntryForm
    onInputChange: (field: keyof NewEntryForm, value: string) => void
    onKeyPress: (e: React.KeyboardEvent) => void
    isLoading: boolean
    onAddEntry: () => void
}

export function DashboardTab({
    monthlyStats,
    stats,
    entries,
    tripDistance,
    onTripDistanceChange,
    tripEstimate,
    fullTankCost,
    newEntry,
    onInputChange,
    onKeyPress,
    isLoading,
    onAddEntry,
}: DashboardTabProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Key Questions Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question 1: Combien me coûte ma voiture par mois ? */}
                <QuestionCard
                    icon={<Wallet className="w-6 h-6" />}
                    iconBg="from-amber-400 to-orange-500"
                    question="Combien me coûte ma voiture ?"
                    mainValue={monthlyStats.length > 0
                        ? `${monthlyStats[monthlyStats.length - 1].coutTotal.toFixed(0)} €`
                        : '- €'
                    }
                    mainLabel="ce mois-ci"
                    subValue={`${stats.totalCout.toFixed(0)} € au total`}
                />

                {/* Question 2: Combien je consomme réellement ? */}
                <QuestionCard
                    icon={<Droplets className="w-6 h-6" />}
                    iconBg="from-blue-400 to-cyan-500"
                    question="Combien je consomme ?"
                    mainValue={`${stats.consoMoyenneGlissante.toFixed(1)} L`}
                    mainLabel="pour 100 km"
                    subValue={`Moyenne récente (${Math.min(5, entries.length)} pleins)`}
                />

                {/* Question 3: Combien va me coûter un trajet ? */}
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 rounded-xl text-white">
                            <Route className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-700">Estimer un trajet</h3>
                    </div>
                    <div className="flex gap-3 mb-4">
                        <input
                            type="number"
                            value={tripDistance}
                            onChange={(e) => onTripDistanceChange(e.target.value)}
                            placeholder="Distance en km"
                            className="input-field flex-1"
                        />
                    </div>
                    {tripEstimate && tripDistance && (
                        <div className="grid grid-cols-2 gap-3 animate-fade-in">
                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-green-700">{tripEstimate.litresEstimes.toFixed(1)} L</p>
                                <p className="text-xs text-green-600">Litres estimés</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold text-green-700">{tripEstimate.coutEstime.toFixed(2)} €</p>
                                <p className="text-xs text-green-600">Coût estimé</p>
                            </div>
                        </div>
                    )}
                    {!tripDistance && (
                        <p className="text-sm text-gray-400 text-center py-4">Saisissez une distance pour voir l'estimation</p>
                    )}
                </div>

                {/* Question 4: Jusqu'où je peux rouler ? */}
                <QuestionCard
                    icon={<Car className="w-6 h-6" />}
                    iconBg="from-purple-400 to-pink-500"
                    question="Quelle autonomie ?"
                    mainValue={`${stats.autonomieEstimee.toFixed(0)} km`}
                    mainLabel="réservoir plein"
                    subValue={`Plein complet ≈ ${fullTankCost.toFixed(0)} €`}
                />
            </div>

            {/* Add Entry Form */}
            <div className="card p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Ajouter un plein
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <FormField label="Date">
                        <input
                            type="date"
                            value={newEntry.date}
                            onChange={(e) => onInputChange('date', e.target.value)}
                            className="input-field"
                        />
                    </FormField>
                    <FormField label="Km compteur">
                        <input
                            type="number"
                            value={newEntry.kmCompteur}
                            onChange={(e) => onInputChange('kmCompteur', e.target.value)}
                            onKeyPress={onKeyPress}
                            placeholder="152198"
                            className="input-field"
                        />
                    </FormField>
                    <FormField label="Litres">
                        <input
                            type="number"
                            step="0.01"
                            value={newEntry.litres}
                            onChange={(e) => onInputChange('litres', e.target.value)}
                            onKeyPress={onKeyPress}
                            placeholder="35.25"
                            className="input-field"
                        />
                    </FormField>
                    <FormField label="Prix/L (€)">
                        <input
                            type="number"
                            step="0.01"
                            value={newEntry.prixLitre}
                            onChange={(e) => onInputChange('prixLitre', e.target.value)}
                            onKeyPress={onKeyPress}
                            placeholder="1.69"
                            className="input-field"
                        />
                    </FormField>
                </div>
                <button
                    onClick={onAddEntry}
                    disabled={isLoading}
                    className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Ajout en cours...</>
                    ) : (
                        <><Plus className="w-5 h-5" /> Ajouter le plein</>
                    )}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat label="Total parcouru" value={`${stats.totalKm.toLocaleString('fr-FR')} km`} />
                <MiniStat label="Total litres" value={`${stats.totalLitres.toFixed(0)} L`} />
                <MiniStat label="Prix moyen/L" value={`${stats.prixMoyenLitreRecent.toFixed(3)} €`} />
                <MiniStat label="Nombre de pleins" value={`${Math.max(0, entries.length - 1)}`} />
            </div>
        </div>
    )
}
