'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Camera, X, Loader2, Check, AlertTriangle, RotateCcw, ScanLine } from 'lucide-react'

interface ScanResult {
  date?: string
  litres?: string
  prixLitre?: string
}

interface ReceiptScannerProps {
  onScanComplete: (data: ScanResult) => void
  disabled?: boolean
}

/**
 * Parse le texte OCR d'un ticket de station-service pour extraire
 * la date, la quantité de litres et le prix unitaire.
 */
function parseReceiptText(text: string): ScanResult {
  const result: ScanResult = {}

  // Normaliser le texte : remplacer les sauts de ligne multiples, unifier les espaces
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')

  const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean)
  const fullText = lines.join(' ')

  // === DATE ===
  // Format ticket: "LE 19-11-25 A 12-33-47" → 2025-11-19
  // Aussi : "LE 08-06-26 A 18-55-32" → 2026-06-08
  const dateMatch = fullText.match(/LE\s+(\d{2})[.\-/](\d{2})[.\-/](\d{2})\s+[AÀa]/i)
  if (dateMatch) {
    const [, day, month, year] = dateMatch
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`
    result.date = `${fullYear}-${month}-${day}`
  }

  // === QUANTITÉ (LITRES) ===
  // "Quantite = 40,38 L" ou "Quantité = 15,18 L"
  // Aussi : "Quantite  40,38  L" (sans signe =)
  const quantityMatch = fullText.match(/Quantit[eéè]\s*=?\s*([\d]+[.,]\d+)\s*L/i)
  if (quantityMatch) {
    result.litres = quantityMatch[1].replace(',', '.')
  }

  // === PRIX UNITAIRE ===
  // "Prix unit. = 1,739 EUR" ou "Prix unit.  1,970 EUR"
  const priceMatch = fullText.match(/Prix\s*unit[.\s]*=?\s*([\d]+[.,]\d+)/i)
  if (priceMatch) {
    result.prixLitre = priceMatch[1].replace(',', '.')
  }

  // === FALLBACKS si les regex principales n'ont rien trouvé ===

  // Fallback litres : chercher un pattern "XX,XX L" isolé (pas dans MONTANT)
  if (!result.litres) {
    const fallbackLitres = fullText.match(/(\d{1,3}[.,]\d{1,2})\s*L(?:\s|$|[^a-zA-Z])/i)
    if (fallbackLitres) {
      result.litres = fallbackLitres[1].replace(',', '.')
    }
  }

  // Fallback prix : chercher un pattern "X,XXX" suivi de EUR
  if (!result.prixLitre) {
    const fallbackPrice = fullText.match(/(\d[.,]\d{3})\s*(?:EUR|€)/i)
    if (fallbackPrice) {
      result.prixLitre = fallbackPrice[1].replace(',', '.')
    }
  }

  return result
}

export function ReceiptScanner({ onScanComplete, disabled = false }: ReceiptScannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [rawText, setRawText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setSelectedImage(null)
    setIsProcessing(false)
    setProgress(0)
    setProgressLabel('')
    setScanResult(null)
    setRawText(null)
    setError(null)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    resetState()
  }, [resetState])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    // Limiter la taille (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 10 MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string)
      setIsModalOpen(true)
      setError(null)
      setScanResult(null)
      setRawText(null)
    }
    reader.readAsDataURL(file)

    // Reset le input pour permettre de re-sélectionner le même fichier
    e.target.value = ''
  }, [])

  const processImage = useCallback(async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    setProgress(0)
    setProgressLabel('Initialisation...')
    setError(null)

    try {
      const Tesseract = await import('tesseract.js')

      const result = await Tesseract.recognize(
        selectedImage,
        'fra', // Langue française
        {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100))
              setProgressLabel('Analyse en cours...')
            } else if (m.status === 'loading tesseract core') {
              setProgressLabel('Chargement du moteur OCR...')
            } else if (m.status === 'initializing tesseract') {
              setProgressLabel('Initialisation...')
            } else if (m.status === 'loading language traineddata') {
              setProgressLabel('Chargement du français...')
            } else if (m.status === 'initializing api') {
              setProgressLabel('Préparation...')
            }
          },
        }
      )

      const text = result.data.text
      setRawText(text)

      const parsed = parseReceiptText(text)
      setScanResult(parsed)

      // Vérifier si au moins un champ a été trouvé
      if (!parsed.date && !parsed.litres && !parsed.prixLitre) {
        setError('Aucune information n\'a pu être extraite. Essayez avec une photo plus nette.')
      }
    } catch (err) {
      console.error('Erreur OCR:', err)
      setError('Erreur lors de l\'analyse de l\'image. Veuillez réessayer.')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedImage])

  const handleValidate = useCallback(() => {
    if (scanResult) {
      onScanComplete(scanResult)
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

              {/* Barre de progression */}
              {isProcessing && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      {progressLabel}
                    </span>
                    <span className="text-indigo-400 font-mono">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
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
                        const [y, m, d] = v.split('-')
                        return `${d}/${m}/${y}`
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

                  {/* Texte brut (toggle) */}
                  {rawText && (
                    <RawTextToggle text={rawText} />
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
  value?: string
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

/**
 * Toggle pour afficher/masquer le texte brut OCR
 */
function RawTextToggle({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-gray-500 hover:text-gray-400 transition-colors underline"
      >
        {isOpen ? 'Masquer' : 'Voir'} le texte brut OCR
      </button>
      {isOpen && (
        <pre className="mt-2 p-3 bg-gray-900 rounded-lg text-xs text-gray-400 overflow-x-auto max-h-40 overflow-y-auto border border-gray-700 whitespace-pre-wrap">
          {text}
        </pre>
      )}
    </div>
  )
}
