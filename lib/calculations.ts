import { FuelEntry, EnrichedFuelEntry, Stats, CalculatedData, MonthlyStats, TripEstimate } from './types'

const SLIDING_WINDOW = 5 // Nombre de pleins pour la moyenne glissante
export const DEFAULT_TANK_CAPACITY = 45 // Capacité par défaut en litres

export function calculateStats(entries: FuelEntry[], tankCapacity: number = DEFAULT_TANK_CAPACITY): CalculatedData {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let totalKm = 0
  let totalLitres = 0
  let totalCout = 0
  const enrichedEntries: EnrichedFuelEntry[] = []
  const consumptions: number[] = [] // Pour calculer la moyenne glissante

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i]
    let kmParcourus = 0
    let coutTotal = entry.litres * entry.prixLitre // Calculer le coût pour toutes les entrées
    let consoL100km = 0
    let coutPer100km = 0

    if (i > 0) {
      const prevEntry = sortedEntries[i - 1]
      
      // Seulement calculer kmParcourus si les deux entrées ont un kilométrage
      if (entry.kmCompteur > 0 && prevEntry.kmCompteur > 0) {
        kmParcourus = entry.kmCompteur - prevEntry.kmCompteur
        
        if (kmParcourus > 0) {
          consoL100km = (entry.litres / kmParcourus) * 100
          coutPer100km = (coutTotal / kmParcourus) * 100
          consumptions.push(consoL100km)
        }
        
        totalKm += kmParcourus
      }
      
      totalLitres += entry.litres
      totalCout += coutTotal
    } else {
      // Première entrée : ajouter au total même sans km parcourus
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

  // Moyenne glissante des 5 derniers pleins
  const recentConsumptions = consumptions.slice(-SLIDING_WINDOW)
  const consoMoyenneGlissante = recentConsumptions.length > 0
    ? recentConsumptions.reduce((a, b) => a + b, 0) / recentConsumptions.length
    : 0

  // Prix moyen des derniers pleins (ignore les entrées avec 0 litres)
  const validEntries = sortedEntries.filter(e => e.litres > 0)
  const recentEntries = validEntries.slice(-SLIDING_WINDOW)
  const prixMoyenLitreRecent = recentEntries.length > 0
    ? recentEntries.reduce((sum, e) => sum + e.prixLitre, 0) / recentEntries.length
    : 0

  // Autonomie estimée
  const autonomieEstimee = consoMoyenneGlissante > 0
    ? (tankCapacity / consoMoyenneGlissante) * 100
    : 0

  // Stats mensuelles
  const monthlyStats = calculateMonthlyStats(enrichedEntries)

  return {
    enrichedEntries,
    stats: {
      totalKm,
      totalLitres,
      totalCout,
      consoMoyenne,
      coutMoyenLitre,
      coutMoyenPer100km,
      consoMoyenneGlissante,
      prixMoyenLitreRecent,
      autonomieEstimee,
    },
    monthlyStats,
  }
}

export function calculateMonthlyStats(enrichedEntries: EnrichedFuelEntry[]): MonthlyStats[] {
  const monthlyMap = new Map<string, { coutTotal: number; litresTotal: number; consumptions: number[]; nbPleins: number }>()

  for (const entry of enrichedEntries) {
    // Inclure toutes les entrées (avec ou sans kilométrage) pour les coûts et litres
    const date = new Date(entry.date)
    const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyMap.has(moisKey)) {
      monthlyMap.set(moisKey, { coutTotal: 0, litresTotal: 0, consumptions: [], nbPleins: 0 })
    }

    const data = monthlyMap.get(moisKey)!
    data.coutTotal += entry.coutTotal
    data.litresTotal += entry.litres
    data.nbPleins += 1
    
    // Ajouter la consommation seulement si on a des données de kilométrage valides
    if (entry.kmParcourus > 0 && entry.consoL100km > 0) {
      data.consumptions.push(entry.consoL100km)
    }
  }

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  
  return Array.from(monthlyMap.entries())
    .map(([mois, data]) => {
      const [year, month] = mois.split('-')
      const monthIndex = parseInt(month) - 1
      return {
        mois,
        moisLabel: `${monthNames[monthIndex]} ${year}`,
        coutTotal: data.coutTotal,
        litresTotal: data.litresTotal,
        consoMoyenne: data.consumptions.length > 0
          ? data.consumptions.reduce((a, b) => a + b, 0) / data.consumptions.length
          : 0,
        nbPleins: data.nbPleins,
      }
    })
    .sort((a, b) => a.mois.localeCompare(b.mois))
}

export function estimateTrip(distance: number, consoMoyenne: number, prixLitre: number): TripEstimate {
  const litresEstimes = (distance * consoMoyenne) / 100
  const coutEstime = litresEstimes * prixLitre
  return {
    distance,
    litresEstimes,
    coutEstime,
  }
}

export function estimateFullTankCost(tankCapacity: number, prixLitre: number): number {
  return tankCapacity * prixLitre
}
