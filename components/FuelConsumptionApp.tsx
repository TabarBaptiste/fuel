'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Fuel, Plus, Trash2, TrendingUp, DollarSign, Gauge, Loader2, AlertCircle, 
  Car, Route, Calendar, Settings, ChevronDown, ChevronUp, BarChart3, 
  Droplets, Target, Wallet
} from 'lucide-react'
import { FuelEntry, NewEntryForm } from '@/lib/types'
import { calculateStats, estimateTrip, estimateFullTankCost } from '@/lib/calculations'

interface Props {
  initialEntries: FuelEntry[]
}

const DEFAULT_TANK_CAPACITY = 50

export default function FuelConsumptionApp({ initialEntries }: Props) {
  const [entries, setEntries] = useState<FuelEntry[]>(initialEntries)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [tankCapacity, setTankCapacity] = useState(DEFAULT_TANK_CAPACITY)
  const [tripDistance, setTripDistance] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'charts'>('dashboard')

  const [newEntry, setNewEntry] = useState<NewEntryForm>({
    date: new Date().toISOString().split('T')[0],
    kmCompteur: '',
    litres: '',
    prixLitre: '',
  })

  const { enrichedEntries, stats, monthlyStats } = useMemo(
    () => calculateStats(entries, tankCapacity), 
    [entries, tankCapacity]
  )

  const tripEstimate = useMemo(() => {
    if (!tripDistance || stats.consoMoyenneGlissante <= 0) return null
    return estimateTrip(
      parseFloat(tripDistance), 
      stats.consoMoyenneGlissante, 
      stats.prixMoyenLitreRecent
    )
  }, [tripDistance, stats.consoMoyenneGlissante, stats.prixMoyenLitreRecent])

  const fullTankCost = useMemo(
    () => estimateFullTankCost(tankCapacity, stats.prixMoyenLitreRecent),
    [tankCapacity, stats.prixMoyenLitreRecent]
  )

  const addEntry = useCallback(async () => {
    if (!newEntry.kmCompteur || !newEntry.litres || !newEntry.prixLitre) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newEntry.date,
          kmCompteur: parseFloat(newEntry.kmCompteur),
          litres: parseFloat(newEntry.litres),
          prixLitre: parseFloat(newEntry.prixLitre),
        }),
      })

      if (!response.ok) throw new Error('Erreur lors de l\'ajout')

      const entry = await response.json()
      setEntries((prev) => [...prev, entry])
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        kmCompteur: '',
        litres: '',
        prixLitre: '',
      })
    } catch (err) {
      setError('Impossible d\'ajouter l\'entrée. Veuillez réessayer.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [newEntry])

  const deleteEntry = useCallback(async (id: number) => {
    setDeletingId(id)
    setError(null)

    try {
      const response = await fetch(`/api/entries?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      setError('Impossible de supprimer l\'entrée. Veuillez réessayer.')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }, [])

  const handleInputChange = useCallback((field: keyof NewEntryForm, value: string) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) addEntry()
  }, [addEntry, isLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Carburant</h1>
                <p className="text-xs text-gray-500">Suivi intelligent</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité du réservoir (L)
              </label>
              <input
                type="number"
                value={tankCapacity}
                onChange={(e) => setTankCapacity(parseFloat(e.target.value) || DEFAULT_TANK_CAPACITY)}
                className="input-field w-32"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-xl">×</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex gap-2 p-1 bg-white rounded-xl shadow-sm">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: Gauge },
            { id: 'history', label: 'Historique', icon: Calendar },
            { id: 'charts', label: 'Graphiques', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
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
                    onChange={(e) => setTripDistance(e.target.value)}
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
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="input-field"
                  />
                </FormField>
                <FormField label="Km compteur">
                  <input
                    type="number"
                    value={newEntry.kmCompteur}
                    onChange={(e) => handleInputChange('kmCompteur', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="152198"
                    className="input-field"
                  />
                </FormField>
                <FormField label="Litres">
                  <input
                    type="number"
                    step="0.01"
                    value={newEntry.litres}
                    onChange={(e) => handleInputChange('litres', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="35.25"
                    className="input-field"
                  />
                </FormField>
                <FormField label="Prix/L (€)">
                  <input
                    type="number"
                    step="0.01"
                    value={newEntry.prixLitre}
                    onChange={(e) => handleInputChange('prixLitre', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="1.69"
                    className="input-field"
                  />
                </FormField>
              </div>
              <button
                onClick={addEntry}
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
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
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
                      <th className="table-header text-right">L/100km</th>
                      <th className="table-header text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...enrichedEntries].reverse().map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
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
                        <td className="table-cell text-right">
                          <ConsumptionBadge value={entry.consoL100km} />
                        </td>
                        <td className="table-cell text-center">
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            disabled={deletingId === entry.id}
                            className="btn-danger"
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
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
                  onDelete={deleteEntry}
                  isDeleting={deletingId === entry.id}
                />
              ))}
            </div>

            {entries.length === 0 && (
              <EmptyState message="Aucun plein enregistré. Ajoutez votre premier plein pour commencer le suivi !" />
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
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
        )}
      </main>
    </div>
  )
}

// Sub-components

interface QuestionCardProps {
  icon: React.ReactNode
  iconBg: string
  question: string
  mainValue: string
  mainLabel: string
  subValue: string
}

function QuestionCard({ icon, iconBg, question, mainValue, mainLabel, subValue }: QuestionCardProps) {
  return (
    <div className="card p-5 hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-3 mb-3">
        <div className={`bg-gradient-to-br ${iconBg} p-2.5 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-600 text-sm">{question}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">{mainValue}</p>
      <p className="text-sm text-gray-500">{mainLabel}</p>
      <p className="text-xs text-gray-400 mt-2">{subValue}</p>
    </div>
  )
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  )
}

function ConsumptionBadge({ value }: { value: number }) {
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
}

function MobileEntryCard({ entry, onDelete, isDeleting }: MobileEntryCardProps) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{formatDateLong(entry.date)}</p>
          <p className="text-sm text-gray-500">{entry.kmCompteur.toLocaleString('fr-FR')} km</p>
        </div>
        <button onClick={() => onDelete(entry.id)} disabled={isDeleting} className="btn-danger">
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
            <p className="font-semibold">{entry.litres.toFixed(2)} L</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Coût</p>
            <p className="font-semibold">{entry.coutTotal.toFixed(2)} €</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Conso</p>
            <ConsumptionBadge value={entry.consoL100km} />
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card p-12 text-center">
      <Fuel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

interface ChartCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      {children}
    </div>
  )
}

interface SimpleBarChartProps {
  data: Array<{ [key: string]: string | number }>
  valueKey: string
  labelKey: string
  color: string
  unit: string
  decimals?: number
}

function SimpleBarChart({ data, valueKey, labelKey, color, unit, decimals = 0 }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(d => Number(d[valueKey]) || 0))
  const displayData = data.slice(-6) // Show last 6 months

  return (
    <div className="space-y-3">
      {displayData.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
        
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{item[labelKey]}</span>
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

// Utility functions
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
