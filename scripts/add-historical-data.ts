import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addHistoricalData() {
    console.log('🔄 Ajout des données historiques...')

    const historicalData = [
        { date: '2025-05-11', litres: 36.41, prixLitre: 1.689 },
        { date: '2025-05-28', litres: 47.35, prixLitre: 1.709 },
        { date: '2025-07-16', litres: 41.20, prixLitre: 1.699 },
        { date: '2025-07-27', litres: 23.55, prixLitre: 1.669 },
        { date: '2025-08-14', litres: 12.27, prixLitre: 1.655 },
        { date: '2025-08-23', litres: 39.21, prixLitre: 1.699 },
        { date: '2025-09-05', litres: 30.46, prixLitre: 1.654 },
        { date: '2025-09-18', litres: 17.07, prixLitre: 1.759 },
        { date: '2025-09-23', litres: 40.55, prixLitre: 1.729 },
        { date: '2025-10-04', litres: 30.66, prixLitre: 1.729 },
        { date: '2025-10-24', litres: 42.90, prixLitre: 1.679 },
        { date: '2025-11-09', litres: 24.64, prixLitre: 1.628 },
        { date: '2025-11-19', litres: 40.38, prixLitre: 1.739 },
        { date: '2025-12-14', litres: 35.25, prixLitre: 1.689 }
    ]

    try {
        // Vérifier si ces données existent déjà
        for (const data of historicalData) {
            const existing = await prisma.fuelEntry.findFirst({
                where: {
                    date: new Date(data.date),
                    litres: data.litres,
                    prixLitre: data.prixLitre
                }
            })

            if (!existing) {
                await prisma.fuelEntry.create({
                    data: {
                        date: new Date(data.date),
                        kmCompteur: 0, // Pas de suivi kilométrique pour ces données historiques
                        litres: data.litres,
                        prixLitre: data.prixLitre
                    }
                })
                console.log(`✅ Ajouté: ${data.date} - ${data.litres}L à ${data.prixLitre}€/L`)
            } else {
                console.log(`⏭️  Existe déjà: ${data.date} - ${data.litres}L à ${data.prixLitre}€/L`)
            }
        }

        console.log('🎉 Données historiques ajoutées avec succès!')

        // Afficher un résumé
        const totalEntries = await prisma.fuelEntry.count()
        const entriesWithKm = await prisma.fuelEntry.count({ where: { kmCompteur: { gt: 0 } } })
        const entriesWithoutKm = await prisma.fuelEntry.count({ where: { kmCompteur: 0 } })

        console.log(`📊 Résumé de la base de données:`)
        console.log(`   - Total d'entrées: ${totalEntries}`)
        console.log(`   - Avec kilométrage: ${entriesWithKm}`)
        console.log(`   - Sans kilométrage (coûts uniquement): ${entriesWithoutKm}`)

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout des données:', error)
    } finally {
        await prisma.$disconnect()
    }
}

addHistoricalData()