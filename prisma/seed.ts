import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Supprime les données existantes
  await prisma.fuelEntry.deleteMany()

  // Insère les données initiales
  await prisma.fuelEntry.createMany({
    data: [
      {
        date: new Date('2025-11-20'),
        kmCompteur: 151810,
        litres: 0,
        prixLitre: 0,
      },
      {
        date: new Date('2025-12-14'),
        kmCompteur: 152198,
        litres: 35.25,
        prixLitre: 1.69,
      },
    ],
  })

  console.log('✅ Base de données initialisée avec les données de départ')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
