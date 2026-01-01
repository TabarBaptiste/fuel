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

    // Calculer la consommation seulement si c'est un plein complet
    if (entry.isFullTank && entry.kmCompteur > 0) {
      // Trouver le dernier plein complet avant celui-ci
      let lastFullTankIndex = -1
      for (let j = i - 1; j >= 0; j--) {
        if (sortedEntries[j].isFullTank && sortedEntries[j].kmCompteur > 0) {
          lastFullTankIndex = j
          break
        }
      }

      if (lastFullTankIndex >= 0) {
        const lastFullTank = sortedEntries[lastFullTankIndex]
        kmParcourus = entry.kmCompteur - lastFullTank.kmCompteur
        
        // Calculer la consommation avec la somme de tous les litres entre les deux pleins complets
        const entriesBetween = sortedEntries.slice(lastFullTankIndex + 1, i + 1)
        const litresConsommes = entriesBetween.reduce((sum, e) => sum + e.litres, 0)
        
        if (kmParcourus > 0) {
          consoL100km = (litresConsommes / kmParcourus) * 100
          
          // Calculer le coût total pour cette période
          const coutPeriode = entriesBetween.reduce((sum, e) => sum + (e.litres * e.prixLitre), 0)
          coutPer100km = (coutPeriode / kmParcourus) * 100
          
          consumptions.push(consoL100km)
          totalKm += kmParcourus
        }
      }
    } else if (i > 0 && entry.kmCompteur > 0) {
      // Pour les pleins non complets, afficher les km parcourus depuis la dernière entrée
      // mais ne pas calculer la consommation
      const prevEntry = sortedEntries[i - 1]
      if (prevEntry.kmCompteur > 0) {
        kmParcourus = entry.kmCompteur - prevEntry.kmCompteur
      }
    }
    
    // Ajouter au total pour tous les pleins
    totalLitres += entry.litres
    totalCout += coutTotal

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

  // Coût estimé actuel par 100km (basé sur la conso et le prix récents)
  const coutMoyenPer100km = consoMoyenneGlissante > 0 && prixMoyenLitreRecent > 0
    ? consoMoyenneGlissante * prixMoyenLitreRecent
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
  const monthlyMap = new Map<string, { coutTotal: number; litresTotal: number; kmParcourus: number; litresAvecKm: number; nbPleins: number }>()

  for (const entry of enrichedEntries) {
    // Inclure toutes les entrées (avec ou sans kilométrage) pour les coûts et litres
    const date = new Date(entry.date)
    const moisKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyMap.has(moisKey)) {
      monthlyMap.set(moisKey, { coutTotal: 0, litresTotal: 0, kmParcourus: 0, litresAvecKm: 0, nbPleins: 0 })
    }

    const data = monthlyMap.get(moisKey)!
    data.coutTotal += entry.coutTotal
    data.litresTotal += entry.litres
    data.nbPleins += 1
    
    // Ajouter km et litres seulement si on a des données de kilométrage valides
    // Pour calculer une moyenne pondérée par km parcourus
    if (entry.kmParcourus > 0 && entry.consoL100km > 0) {
      data.kmParcourus += entry.kmParcourus
      data.litresAvecKm += entry.litres
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
        // Moyenne pondérée par km parcourus (plus précise)
        consoMoyenne: data.kmParcourus > 0
          ? (data.litresAvecKm / data.kmParcourus) * 100
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
