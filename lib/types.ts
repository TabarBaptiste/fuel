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
}

export interface CalculatedData {
  enrichedEntries: EnrichedFuelEntry[]
  stats: Stats
}

export interface NewEntryForm {
  date: string
  kmCompteur: string
  litres: string
  prixLitre: string
}
