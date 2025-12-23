'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { AlertCircle, Fuel, Loader2, Trash2 } from 'lucide-react'
import { FuelEntry, NewEntryForm } from '@/lib/types'
import { calculateStats, estimateTrip, estimateFullTankCost } from '@/lib/calculations'
import { Header } from '@/components/ui/Header'
import { NavigationTabs } from '@/components/ui/NavigationTabs'
import { DashboardTab } from '@/components/fuel/DashboardTab'
import { HistoryTab } from '@/components/fuel/HistoryTab'
import { ChartsTab } from '@/components/fuel/ChartsTab'

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

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

  const handleLogin = useCallback(async (pin: string): Promise<boolean> => {
    setLoginLoading(true)
    setLoginError(null)

    // Simuler un délai pour l'UX
    await new Promise(resolve => setTimeout(resolve, 500))

    const correctPin = process.env.NEXT_PUBLIC_PIN_CODE
    if (pin === correctPin) {
      setIsAuthenticated(true)
      setLoginLoading(false)
      return true
    } else {
      setLoginError('Code incorrect. Veuillez réessayer.')
      setLoginLoading(false)
      return false
    }
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setLoginError(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header
        tankCapacity={tankCapacity}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onTankCapacityChange={setTankCapacity}
        defaultCapacity={DEFAULT_TANK_CAPACITY}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
        loginLoading={loginLoading}
        loginError={loginError}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-xl">×</button>
          </div>
        )}

        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'dashboard' && (
          <DashboardTab
            monthlyStats={monthlyStats}
            stats={stats}
            entries={entries}
            tripDistance={tripDistance}
            onTripDistanceChange={setTripDistance}
            tripEstimate={tripEstimate}
            fullTankCost={fullTankCost}
            newEntry={newEntry}
            onInputChange={handleInputChange}
            onKeyPress={handleKeyPress}
            isLoading={isLoading}
            onAddEntry={addEntry}
            isAuthenticated={isAuthenticated}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            enrichedEntries={enrichedEntries}
            onDelete={deleteEntry}
            deletingId={deletingId}
            hasEntries={entries.length > 0}
            isAuthenticated={isAuthenticated}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsTab monthlyStats={monthlyStats} />
        )}
      </main>
    </div>
  )
}
