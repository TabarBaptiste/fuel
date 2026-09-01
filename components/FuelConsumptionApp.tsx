'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { AlertCircle, Fuel, Loader2, Trash2 } from 'lucide-react'
import { FuelEntry, NewEntryForm } from '@/lib/types'
import { calculateStats, estimateTrip, estimateFullTankCost, validateKmCompteur, DEFAULT_TANK_CAPACITY } from '@/lib/calculations'
import { Header } from '@/components/ui/Header'
import { NavigationTabs } from '@/components/ui/NavigationTabs'
import { DashboardTab } from '@/components/fuel/DashboardTab'
import { HistoryTab } from '@/components/fuel/HistoryTab'
import { ChartsTab } from '@/components/fuel/ChartsTab'

interface Props {
  initialEntries: FuelEntry[]
}

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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [kmCompteurError, setKmCompteurError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [successSignal, setSuccessSignal] = useState(0)
  const [dataLoading, setDataLoading] = useState(false)

  const [newEntry, setNewEntry] = useState<NewEntryForm>({
    date: new Date().toISOString().split('T')[0],
    kmCompteur: '',
    litres: '',
    prixLitre: '',
    isFullTank: true,
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

  // Charger les entrées d'un utilisateur depuis l'API
  const loadUserEntries = useCallback(async (userId: number) => {
    setDataLoading(true)
    try {
      const response = await fetch(`/api/entries?userId=${userId}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des données')
      const data = await response.json()
      setEntries(data)
    } catch (err) {
      console.error('Erreur chargement entrées:', err)
      setError('Impossible de charger les données. Veuillez réessayer.')
    } finally {
      setDataLoading(false)
    }
  }, [])

  // Charger l'état d'authentification depuis localStorage au montage
  useEffect(() => {
    const savedAuth = localStorage.getItem('fuelAppAuthenticated')
    const savedTimestamp = localStorage.getItem('fuelAppAuthTimestamp')
    const savedUserId = localStorage.getItem('fuelAppUserId')
    const savedUserName = localStorage.getItem('fuelAppUserName')
    
    if (savedAuth === 'true' && savedTimestamp && savedUserId) {
      const timestamp = parseInt(savedTimestamp)
      const now = Date.now()
      // Expiration après 30 jours (30 * 24 * 60 * 60 * 1000 ms)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      
      if (now - timestamp < thirtyDays) {
        const userId = parseInt(savedUserId)
        setIsAuthenticated(true)
        setCurrentUserId(userId)
        setCurrentUserName(savedUserName || null)
        // Charger les données de l'utilisateur
        loadUserEntries(userId)
      } else {
        // Nettoyer si l'authentification a expiré
        localStorage.removeItem('fuelAppAuthenticated')
        localStorage.removeItem('fuelAppAuthTimestamp')
        localStorage.removeItem('fuelAppUserId')
        localStorage.removeItem('fuelAppUserName')
      }
    }
  }, [loadUserEntries])

  const resetForm = useCallback(() => {
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      kmCompteur: '',
      litres: '',
      prixLitre: '',
      isFullTank: true,
    })
    setEditingId(null)
    setKmCompteurError(null)
    setError(null)
  }, [])

  const addEntry = useCallback(async () => {
    if (!newEntry.litres || !newEntry.prixLitre) {
      setError('Veuillez remplir tous les champs requis')
      return
    }

    if (!currentUserId) {
      setError('Vous devez être connecté pour ajouter une entrée')
      return
    }

    // Déterminer automatiquement le mode selon si kmCompteur est rempli
    const hasKilometers = newEntry.kmCompteur && newEntry.kmCompteur.trim() !== ''

    // Validation : le kilométrage doit être cohérent avec la date de la saisie
    // (supérieur aux relevés antérieurs, inférieur aux relevés postérieurs)
    if (hasKilometers) {
      const currentKmCompteur = parseFloat(newEntry.kmCompteur)
      const kmError = validateKmCompteur(
        entries,
        newEntry.date,
        currentKmCompteur,
        editingId ?? undefined
      )
      if (kmError) {
        setKmCompteurError(kmError)
        return
      }
    }

    setIsLoading(true)
    setError(null)
    setKmCompteurError(null)

    const payload = {
      date: newEntry.date,
      kmCompteur: hasKilometers ? parseFloat(newEntry.kmCompteur) : 0,
      litres: parseFloat(newEntry.litres),
      prixLitre: parseFloat(newEntry.prixLitre),
      isFullTank: newEntry.isFullTank,
      userId: currentUserId,
    }

    try {
      if (editingId !== null) {
        const response = await fetch('/api/entries', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        })

        if (!response.ok) throw new Error('Erreur lors de la modification')

        const updated = await response.json()
        setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
        resetForm()
        setSuccessSignal((s) => s + 1)
      } else {
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error('Erreur lors de l\'ajout')

        const entry = await response.json()
        setEntries((prev) => [...prev, entry])
        resetForm()
        setSuccessSignal((s) => s + 1)
      }
    } catch (err) {
      setError(
        editingId !== null
          ? 'Impossible de modifier l\'entrée. Veuillez réessayer.'
          : 'Impossible d\'ajouter l\'entrée. Veuillez réessayer.'
      )
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [newEntry, entries, editingId, resetForm, currentUserId])

  const startEdit = useCallback((entry: FuelEntry) => {
    setEditingId(entry.id)
    setNewEntry({
      date: entry.date,
      kmCompteur: entry.kmCompteur > 0 ? entry.kmCompteur.toString() : '',
      litres: entry.litres.toString(),
      prixLitre: entry.prixLitre.toString(),
      isFullTank: entry.isFullTank,
    })
    setKmCompteurError(null)
    setError(null)
    setActiveTab('dashboard')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const cancelEdit = useCallback(() => {
    resetForm()
  }, [resetForm])

  const deleteEntry = useCallback(async (id: number) => {
    if (!currentUserId) return

    setDeletingId(id)
    setError(null)

    try {
      const response = await fetch(`/api/entries?id=${id}&userId=${currentUserId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      setError('Impossible de supprimer l\'entrée. Veuillez réessayer.')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }, [currentUserId])

  const handleInputChange = useCallback((field: keyof NewEntryForm, value: string) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }))
    setError(null)
    if (field === 'kmCompteur') {
      setKmCompteurError(null)
    }
  }, [])

  const handleCheckboxChange = useCallback((field: keyof NewEntryForm, value: boolean) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleScanComplete = useCallback((data: { date?: string; litres?: string; prixLitre?: string }) => {
    setNewEntry((prev) => ({
      ...prev,
      ...(data.date && { date: data.date }),
      ...(data.litres && { litres: data.litres }),
      ...(data.prixLitre && { prixLitre: data.prixLitre }),
    }))
    setError(null)
    setKmCompteurError(null)
  }, [])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) addEntry()
  }, [addEntry, isLoading])

  const handleLogin = useCallback(async (pin: string): Promise<boolean> => {
    setLoginLoading(true)
    setLoginError(null)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (!response.ok) {
        const data = await response.json()
        setLoginError(data.error || 'Code incorrect. Veuillez réessayer.')
        setLoginLoading(false)
        return false
      }

      const data = await response.json()
      setIsAuthenticated(true)
      setCurrentUserId(data.userId)
      setCurrentUserName(data.name)
      // Sauvegarder l'authentification dans localStorage
      localStorage.setItem('fuelAppAuthenticated', 'true')
      localStorage.setItem('fuelAppAuthTimestamp', Date.now().toString())
      localStorage.setItem('fuelAppUserId', data.userId.toString())
      localStorage.setItem('fuelAppUserName', data.name)
      // Charger les données de l'utilisateur
      await loadUserEntries(data.userId)
      setLoginLoading(false)
      return true
    } catch (err) {
      console.error('Erreur login:', err)
      setLoginError('Erreur de connexion. Veuillez réessayer.')
      setLoginLoading(false)
      return false
    }
  }, [loadUserEntries])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setCurrentUserId(null)
    setCurrentUserName(null)
    setLoginError(null)
    setEntries([])
    // Supprimer l'authentification du localStorage
    localStorage.removeItem('fuelAppAuthenticated')
    localStorage.removeItem('fuelAppAuthTimestamp')
    localStorage.removeItem('fuelAppUserId')
    localStorage.removeItem('fuelAppUserName')
  }, [])

  const handleExportData = useCallback(() => {
    // Créer un objet avec toutes les données
    const exportData = {
      exportDate: new Date().toISOString(),
      tankCapacity,
      entries: entries.map(entry => ({
        id: entry.id,
        date: entry.date,
        kmCompteur: entry.kmCompteur,
        litres: entry.litres,
        prixLitre: entry.prixLitre
      })),
      stats: {
        totalKm: stats.totalKm,
        totalLitres: stats.totalLitres,
        totalCout: stats.totalCout,
        coutMoyenLitre: stats.coutMoyenLitre,
        coutMoyenPer100km: stats.coutMoyenPer100km,
        consoMoyenneGlissante: stats.consoMoyenneGlissante,
        prixMoyenLitreRecent: stats.prixMoyenLitreRecent,
        autonomieEstimee: stats.autonomieEstimee
      },
      monthlyStats: monthlyStats.map(month => ({
        mois: month.mois,
        moisLabel: month.moisLabel,
        coutTotal: month.coutTotal,
        litresTotal: month.litresTotal,
        consoMoyenne: month.consoMoyenne,
        nbPleins: month.nbPleins
      }))
    }

    // Convertir en JSON
    const jsonString = JSON.stringify(exportData, null, 2)
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Nom de fichier avec la date
    const dateStr = new Date().toISOString().split('T')[0]
    link.download = `fuel-data-${dateStr}.json`
    
    // Déclencher le téléchargement
    document.body.appendChild(link)
    link.click()
    
    // Nettoyer
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [entries, tankCapacity, stats, monthlyStats])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header
        tankCapacity={tankCapacity}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onTankCapacityChange={setTankCapacity}
        defaultCapacity={DEFAULT_TANK_CAPACITY}
        isAuthenticated={isAuthenticated}
        currentUserName={currentUserName}
        onLogin={handleLogin}
        onLogout={handleLogout}
        loginLoading={loginLoading}
        loginError={loginError}
        onExportData={handleExportData}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24">
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300 text-xl">×</button>
          </div>
        )}

        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="ml-3 text-gray-400">Chargement des données...</span>
          </div>
        ) : (
          <>
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
                onCheckboxChange={handleCheckboxChange}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                onAddEntry={addEntry}
                isAuthenticated={isAuthenticated}
                kmCompteurError={kmCompteurError}
                isEditing={editingId !== null}
                onCancelEdit={cancelEdit}
                successSignal={successSignal}
                onScanComplete={handleScanComplete}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                enrichedEntries={enrichedEntries}
                onDelete={deleteEntry}
                onEdit={startEdit}
                deletingId={deletingId}
                hasEntries={entries.length > 0}
                isAuthenticated={isAuthenticated}
              />
            )}

            {activeTab === 'charts' && (
              <ChartsTab monthlyStats={monthlyStats} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
