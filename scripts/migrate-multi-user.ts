import { PrismaClient } from '@prisma/client'

/**
 * Script de migration pour le support multi-utilisateur.
 * 
 * 1. Crée les deux utilisateurs (1234 et 5678)
 * 2. Attribue toutes les entrées existantes à l'utilisateur 1 (code 1234)
 * 
 * Usage: npx tsx scripts/migrate-multi-user.ts
 */

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Début de la migration multi-utilisateur...')

  // 1. Créer les utilisateurs s'ils n'existent pas
  const user1 = await prisma.user.upsert({
    where: { pinCode: '1234' },
    update: {},
    create: {
      pinCode: '1234',
      name: 'Personne 1',
    },
  })
  console.log(`✅ Utilisateur 1 créé/existant: ${user1.name} (id: ${user1.id})`)

  const user2 = await prisma.user.upsert({
    where: { pinCode: '5678' },
    update: {},
    create: {
      pinCode: '5678',
      name: 'Personne 2',
    },
  })
  console.log(`✅ Utilisateur 2 créé/existant: ${user2.name} (id: ${user2.id})`)

  // 2. Attribuer toutes les entrées existantes sans userId à l'utilisateur 1
  const result = await prisma.fuelEntry.updateMany({
    where: {
      userId: user1.id, // Déjà assignées par le défaut de la migration
    },
    data: {
      userId: user1.id,
    },
  })
  console.log(`✅ ${result.count} entrées attribuées à ${user1.name}`)

  // Compter les entrées par utilisateur
  const countUser1 = await prisma.fuelEntry.count({ where: { userId: user1.id } })
  const countUser2 = await prisma.fuelEntry.count({ where: { userId: user2.id } })
  console.log(`\n📊 Résumé:`)
  console.log(`   ${user1.name}: ${countUser1} entrées`)
  console.log(`   ${user2.name}: ${countUser2} entrées`)

  console.log('\n✅ Migration terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
