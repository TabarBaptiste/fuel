import React, { useState } from 'react'
import { Fuel, Settings, LogIn, LogOut, Loader2, X } from 'lucide-react'

interface HeaderProps {
    tankCapacity: number
    showSettings: boolean
    onToggleSettings: () => void
    onTankCapacityChange: (value: number) => void
    defaultCapacity: number
    isAuthenticated: boolean
    onLogin: (pin: string) => Promise<boolean>
    onLogout: () => void
    loginLoading: boolean
    loginError: string | null
}

export function Header({
    tankCapacity,
    showSettings,
    onToggleSettings,
    onTankCapacityChange,
    defaultCapacity,
    isAuthenticated,
    onLogin,
    onLogout,
    loginLoading,
    loginError
}: HeaderProps) {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [pin, setPin] = useState('')
    const [capacityInput, setCapacityInput] = useState(tankCapacity.toString())

    // Synchroniser capacityInput quand tankCapacity change depuis l'extérieur
    React.useEffect(() => {
        setCapacityInput(tankCapacity.toString())
    }, [tankCapacity])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pin.length === 4) {
            const success = await onLogin(pin)
            if (success) {
                setPin('')
                setShowLoginModal(false)
            }
            // Si échec, on ne ferme pas la modal et on garde le PIN pour permettre une nouvelle tentative
        }
    }

    return (
        <>
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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={isAuthenticated ? onLogout : () => setShowLoginModal(true)}
                                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                                    isAuthenticated ? 'text-green-600' : 'text-gray-600'
                                }`}
                                title={isAuthenticated ? 'Se déconnecter' : 'Se connecter'}
                            >
                                {isAuthenticated ? (
                                    <LogOut className="w-5 h-5" />
                                ) : (
                                    <LogIn className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                onClick={onToggleSettings}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {showSettings && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacité du réservoir (L)
                            </label>
                            <input
                                type="number"
                                value={capacityInput}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setCapacityInput(value)
                                    // Mettre à jour tankCapacity seulement si la valeur est valide
                                    const numValue = parseFloat(value)
                                    if (!isNaN(numValue) && numValue > 0) {
                                        onTankCapacityChange(numValue)
                                    }
                                }}
                                onBlur={() => {
                                    // Si l'utilisateur quitte le champ avec une valeur invalide, remettre la valeur par défaut
                                    const numValue = parseFloat(capacityInput)
                                    if (isNaN(numValue) || numValue <= 0) {
                                        const defaultStr = defaultCapacity.toString()
                                        setCapacityInput(defaultStr)
                                        onTankCapacityChange(defaultCapacity)
                                    }
                                }}
                                min="1"
                                step="1"
                                className="input-field w-32"
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Connexion</h2>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code PIN (4 chiffres)
                                </label>
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                                        setPin(value)
                                    }}
                                    placeholder="0000"
                                    className="input-field text-center text-2xl tracking-widest"
                                    maxLength={4}
                                    autoFocus
                                />
                            </div>

                            {loginError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-700 text-sm">{loginError}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowLoginModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={loginLoading || pin.length !== 4}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {loginLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Vérification...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-4 h-4" />
                                            Se connecter
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
