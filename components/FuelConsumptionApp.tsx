'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Fuel, Plus, Trash2, TrendingUp, DollarSign, Gauge, Loader2, AlertCircle, Car } from 'lucide-react'
import { FuelEntry, NewEntryForm } from '@/lib/types'
import { calculateStats } from '@/lib/calculations'

interface Props {
  initialEntries: FuelEntry[]
}

export default function FuelConsumptionApp({ initialEntries }: Props) {
  const [entries, setEntries] = useState<FuelEntry[]>(initialEntries)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [newEntry, setNewEntry] = useState<NewEntryForm>({
    date: new Date().toISOString().split('T')[0],
    kmCompteur: '',
    litres: '',
    prixLitre: '',
  })

  const { enrichedEntries, stats } = useMemo(() => calculateStats(entries), [entries])

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

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout')
      }

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
      const response = await fetch(`/api/entries?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

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
    if (e.key === 'Enter' && !isLoading) {
      addEntry()
    }
  }, [addEntry, isLoading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="card p-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Fuel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Carburant</h1>
              <p className="text-gray-600 text-sm sm:text-base">Suivez votre consommation et vos dépenses</p>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            iconBg="bg-blue-100"
            title="Total Parcouru"
            value={`${stats.totalKm.toLocaleString('fr-FR')} km`}
            subtitle={`${stats.totalLitres.toFixed(2)} L consommés`}
          />
          <StatCard
            icon={<Gauge className="w-6 h-6 text-green-600" />}
            iconBg="bg-green-100"
            title="Consommation"
            value={`${stats.consoMoyenne.toFixed(2)} L`}
            subtitle="par 100 km"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-amber-600" />}
            iconBg="bg-amber-100"
            title="Coût moyen"
            value={`${stats.coutMoyenPer100km.toFixed(2)} €`}
            subtitle="pour 100 km"
          />
        </div>

        {/* Add Entry Form */}
        <div className="card p-6 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-indigo-600" />
            Ajouter un plein
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Date">
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input-field"
              />
            </FormField>
            <FormField label="Km Compteur">
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
            className="btn-primary mt-4 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Ajouter
              </>
            )}
          </button>
        </div>

        {/* Entries Table - Desktop */}
        <div className="card overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="table-header text-left">Date</th>
                  <th className="table-header text-right">Km Compteur</th>
                  <th className="table-header text-right">Km Parcourus</th>
                  <th className="table-header text-right">Litres</th>
                  <th className="table-header text-right">Prix/L</th>
                  <th className="table-header text-right">Coût</th>
                  <th className="table-header text-right">L/100km</th>
                  <th className="table-header text-right">€/100km</th>
                  <th className="table-header text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrichedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                    <td className="table-cell text-right">{entry.kmCompteur.toLocaleString('fr-FR')}</td>
                    <td className="table-cell text-right font-medium">
                      {entry.kmParcourus > 0 ? entry.kmParcourus.toFixed(0) : '-'}
                    </td>
                    <td className="table-cell text-right">{entry.litres > 0 ? entry.litres.toFixed(2) : '-'}</td>
                    <td className="table-cell text-right">{entry.prixLitre > 0 ? `${entry.prixLitre.toFixed(2)} €` : '-'}</td>
                    <td className="table-cell text-right font-medium">
                      {entry.coutTotal > 0 ? `${entry.coutTotal.toFixed(2)} €` : '-'}
                    </td>
                    <td className="table-cell text-right">
                      <ConsumptionBadge value={entry.consoL100km} />
                    </td>
                    <td className="table-cell text-right">
                      {entry.coutPer100km > 0 ? `${entry.coutPer100km.toFixed(2)} €` : '-'}
                    </td>
                    <td className="table-cell text-center">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        disabled={deletingId === entry.id}
                        className="btn-danger"
                        title="Supprimer"
                      >
                        {deletingId === entry.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entries Cards - Mobile */}
        <div className="lg:hidden space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Car className="w-6 h-6 text-indigo-600" />
            Historique des pleins
          </h2>
          {enrichedEntries.map((entry) => (
            <MobileEntryCard
              key={entry.id}
              entry={entry}
              onDelete={deleteEntry}
              isDeleting={deletingId === entry.id}
            />
          ))}
        </div>

        {/* Detailed Stats */}
        <div className="card p-6 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Statistiques Détaillées</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailStat label="Coût Moyen au Litre" value={`${stats.coutMoyenLitre.toFixed(2)} €`} />
            <DetailStat label="Total Litres Consommés" value={`${stats.totalLitres.toFixed(2)} L`} />
            <DetailStat label="Coût Total" value={`${stats.totalCout.toFixed(2)} €`} />
            <DetailStat label="Nombre de Pleins" value={`${Math.max(0, entries.length - 1)}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-components
interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  value: string
  subtitle: string
}

function StatCard({ icon, iconBg, title, value, subtitle }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${iconBg} p-2.5 rounded-xl`}>{icon}</div>
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  )
}

interface ConsumptionBadgeProps {
  value: number
}

function ConsumptionBadge({ value }: ConsumptionBadgeProps) {
  if (value <= 0) return <span>-</span>

  let colorClass = 'bg-gray-100 text-gray-800'
  if (value < 6) colorClass = 'bg-green-100 text-green-800'
  else if (value < 8) colorClass = 'bg-yellow-100 text-yellow-800'
  else colorClass = 'bg-red-100 text-red-800'

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {value.toFixed(2)}
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
    coutPer100km: number
  }
  onDelete: (id: number) => void
  isDeleting: boolean
}

function MobileEntryCard({ entry, onDelete, isDeleting }: MobileEntryCardProps) {
  return (
    <div className="card p-4 animate-slide-up">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">
            {new Date(entry.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-500">{entry.kmCompteur.toLocaleString('fr-FR')} km</p>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          disabled={isDeleting}
          className="btn-danger"
        >
          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>
      
      {entry.kmParcourus > 0 && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">Parcourus</p>
            <p className="font-semibold">{entry.kmParcourus} km</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">Litres</p>
            <p className="font-semibold">{entry.litres.toFixed(2)} L</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">Coût</p>
            <p className="font-semibold">{entry.coutTotal.toFixed(2)} €</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500">Conso</p>
            <ConsumptionBadge value={entry.consoL100km} />
          </div>
        </div>
      )}
    </div>
  )
}

interface DetailStatProps {
  label: string
  value: string
}

function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
