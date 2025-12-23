import { FuelEntry, EnrichedFuelEntry, Stats, CalculatedData } from './types'

export function calculateStats(entries: FuelEntry[]): CalculatedData {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let totalKm = 0
  let totalLitres = 0
  let totalCout = 0
  const enrichedEntries: EnrichedFuelEntry[] = []

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i]
    let kmParcourus = 0
    let coutTotal = 0
    let consoL100km = 0
    let coutPer100km = 0

    if (i > 0) {
      const prevEntry = sortedEntries[i - 1]
      kmParcourus = entry.kmCompteur - prevEntry.kmCompteur
      coutTotal = entry.litres * entry.prixLitre

      if (kmParcourus > 0) {
        consoL100km = (entry.litres / kmParcourus) * 100
        coutPer100km = (coutTotal / kmParcourus) * 100
      }

      totalKm += kmParcourus
      totalLitres += entry.litres
      totalCout += coutTotal
    }

    enrichedEntries.push({
      ...entry,
      kmParcourus,
      coutTotal,
      consoL100km,
      coutPer100km,
    })
  }

  const consoMoyenne = totalKm > 0 ? (totalLitres / totalKm) * 100 : 0
  const coutMoyenLitre = totalLitres > 0 ? totalCout / totalLitres : 0
  const coutMoyenPer100km = totalKm > 0 ? (totalCout / totalKm) * 100 : 0

  return {
    enrichedEntries,
    stats: {
      totalKm,
      totalLitres,
      totalCout,
      consoMoyenne,
      coutMoyenLitre,
      coutMoyenPer100km,
    },
  }
}
