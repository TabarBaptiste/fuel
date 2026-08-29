'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, X, Loader2, Check, AlertTriangle, RotateCcw, ScanLine } from 'lucide-react'

interface ScanResult {
  date?: string | null
  litres?: string | null
  prixLitre?: string | null
  carburant?: string | null
  montantTotal?: string | null
}

interface ReceiptScannerProps {
  onScanComplete: (data: { date?: string; litres?: string; prixLitre?: string }) => void
  disabled?: boolean
}

export function ReceiptScanner({ onScanComplete, disabled = false }: ReceiptScannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setSelectedImage(null)
    setIsProcessing(false)
    setScanResult(null)
    setError(null)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    resetState()
  }, [resetState])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 10 MB)')
      return
    }

    setImageMimeType(file.type)

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string)
      setIsModalOpen(true)
      setError(null)
      setScanResult(null)
    }
    reader.readAsDataURL(file)

    e.target.value = ''
  }, [])

  const processImage = useCallback(async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: imageMimeType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l\'analyse')
        return
      }

      setScanResult(data)

      // Vérifier si au moins un champ a été trouvé
      const hasData = data.date || data.litres || data.prixLitre
      if (!hasData) {
        setError('Aucune information n\'a pu être extraite. Essayez avec une photo plus nette.')
      }
    } catch (err) {
      console.error('Erreur scan:', err)
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedImage, imageMimeType])

  const handleValidate = useCallback(() => {
    if (scanResult) {
      const formData: { date?: string; litres?: string; prixLitre?: string } = {}
      if (scanResult.date) formData.date = scanResult.date
      if (scanResult.litres) formData.litres = scanResult.litres
      if (scanResult.prixLitre) formData.prixLitre = scanResult.prixLitre
      onScanComplete(formData)
      closeModal()
    }
  }, [scanResult, onScanComplete, closeModal])

  const handleOpenCamera = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const fieldsFound = scanResult
    ? [scanResult.date, scanResult.litres, scanResult.prixLitre].filter(Boolean).length
    : 0

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={handleOpenCamera}
        disabled={disabled}
        className="btn-scan flex items-center gap-2"
        title="Scanner un ticket d'essence"
      >
        <Camera className="w-4 h-4" />
        <span className="hidden sm:inline">Scanner un ticket</span>
        <span className="sm:hidden">📸</span>
      </button>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modale */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          />

          {/* Contenu modale */}
          <div className="relative bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-gray-100">Scanner un ticket</h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-200 p-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Prévisualisation de l'image */}
              {selectedImage && (
                <div className="relative rounded-xl overflow-hidden border border-gray-600">
                  <img
                    src={selectedImage}
                    alt="Ticket sélectionné"
                    className="w-full max-h-64 object-contain bg-gray-900"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="scan-line-animation" />
                    </div>
                  )}
                </div>
              )}

              {/* Indicateur de traitement */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-3 animate-fade-in">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-gray-300 text-sm">Analyse par Gemini AI en cours...</span>
                </div>
              )}

              {/* Résultats du scan */}
              {scanResult && !isProcessing && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {fieldsFound === 3 ? (
                      <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Tous les champs détectés !</span></>
                    ) : fieldsFound > 0 ? (
                      <><AlertTriangle className="w-4 h-4 text-amber-400" /><span className="text-amber-400">{fieldsFound}/3 champ{fieldsFound > 1 ? 's' : ''} détecté{fieldsFound > 1 ? 's' : ''}</span></>
                    ) : (
                      <><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-red-400">Aucun champ détecté</span></>
                    )}
                  </div>

                  {/* Champs détectés */}
                  <div className="grid gap-2">
                    <ScanResultField
                      label="Date"
                      value={scanResult.date}
                      formatValue={(v) => {
                        const parts = v.split('-')
                        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
                        return v
                      }}
                    />
                    <ScanResultField
                      label="Litres"
                      value={scanResult.litres}
                      formatValue={(v) => `${v} L`}
                    />
                    <ScanResultField
                      label="Prix/L"
                      value={scanResult.prixLitre}
                      formatValue={(v) => `${v} €/L`}
                    />
                  </div>

                  {/* Infos complémentaires */}
                  {(scanResult.carburant || scanResult.montantTotal) && (
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <p className="text-xs text-gray-500 mb-1">Infos complémentaires</p>
                      <div className="flex gap-3 text-xs text-gray-400">
                        {scanResult.carburant && <span>⛽ {scanResult.carburant}</span>}
                        {scanResult.montantTotal && <span>💰 {scanResult.montantTotal} €</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Erreur */}
              {error && !isProcessing && (
                <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex gap-2">
              {!scanResult && !isProcessing && (
                <button
                  onClick={processImage}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <ScanLine className="w-5 h-5" />
                  Analyser le ticket
                </button>
              )}

              {scanResult && !isProcessing && fieldsFound > 0 && (
                <>
                  <button
                    onClick={handleValidate}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Valider et pré-remplir
                  </button>
                  <button
                    onClick={() => {
                      resetState()
                      fileInputRef.current?.click()
                    }}
                    className="btn-secondary flex items-center justify-center gap-2 px-4"
                    title="Réessayer avec une autre photo"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}

              {scanResult && !isProcessing && fieldsFound === 0 && (
                <button
                  onClick={() => {
                    resetState()
                    fileInputRef.current?.click()
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Réessayer avec une autre photo
                </button>
              )}

              {isProcessing && (
                <button
                  disabled
                  className="btn-primary flex-1 flex items-center justify-center gap-2 opacity-50"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse en cours...
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Affiche un champ détecté ou non détecté
 */
function ScanResultField({
  label,
  value,
  formatValue,
}: {
  label: string
  value?: string | null
  formatValue?: (v: string) => string
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      value ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-800/50 border border-gray-700/50'
    }`}>
      <span className="text-sm text-gray-400">{label}</span>
      {value ? (
        <span className="text-sm font-medium text-gray-100">
          {formatValue ? formatValue(value) : value}
        </span>
      ) : (
        <span className="text-sm text-gray-500 italic">Non détecté</span>
      )}
    </div>
  )
}
