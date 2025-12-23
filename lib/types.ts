export interface FuelEntry {
  id: number
  date: string
  kmCompteur: number
  litres: number
  prixLitre: number
}

export interface EnrichedFuelEntry extends FuelEntry {
  kmParcourus: number
  coutTotal: number
  consoL100km: number
  coutPer100km: number
}

export interface Stats {
  totalKm: number
  totalLitres: number
  totalCout: number
  consoMoyenne: number
  coutMoyenLitre: number
  coutMoyenPer100km: number
  // Nouvelles stats
  consoMoyenneGlissante: number // Moyenne des 5 derniers pleins
  prixMoyenLitreRecent: number // Prix moyen des derniers pleins
  autonomieEstimee: number // En km
}

export interface MonthlyStats {
  mois: string // Format: "2024-01"
  moisLabel: string // Format: "Jan 2024"
  coutTotal: number
  litresTotal: number
  consoMoyenne: number
  nbPleins: number
}

export interface CalculatedData {
  enrichedEntries: EnrichedFuelEntry[]
  stats: Stats
  monthlyStats: MonthlyStats[]
}

export interface NewEntryForm {
  date: string
  kmCompteur: string
  litres: string
  prixLitre: string
}

export interface TripEstimate {
  distance: number
  litresEstimes: number
  coutEstime: number
}

// Configuration du véhicule
export interface VehicleConfig {
  capaciteReservoir: number // En litres
}
