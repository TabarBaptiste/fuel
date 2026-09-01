import { PrismaClient } from '@prisma/client'

/**
 * Migration SQL directe pour ajouter le support multi-utilisateur.
 * 
 * Étapes:
 * 1. Créer la table users
 * 2. Insérer les deux utilisateurs
 * 3. Ajouter la colonne userId à fuel_entries avec défaut = 1
 * 4. Ajouter la contrainte FK
 * 
 * Usage: npx tsx scripts/migrate-multi-user-sql.ts
 */

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Début de la migration multi-utilisateur (SQL directe)...\n')

  // Étape 1: Créer la table users si elle n'existe pas
  console.log('📋 Étape 1: Création de la table users...')
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      "pinCode" VARCHAR(4) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL
    )
  `)
  console.log('   ✅ Table users créée')

  // Étape 2: Insérer les utilisateurs
  console.log('📋 Étape 2: Insertion des utilisateurs...')
  await prisma.$executeRawUnsafe(`
    INSERT INTO users (id, "pinCode", name) VALUES (1, '1234', 'Personne 1')
    ON CONFLICT ("pinCode") DO NOTHING
  `)
  await prisma.$executeRawUnsafe(`
    INSERT INTO users (id, "pinCode", name) VALUES (2, '5678', 'Personne 2')
    ON CONFLICT ("pinCode") DO NOTHING
  `)
  console.log('   ✅ Utilisateurs créés (1234: Personne 1, 5678: Personne 2)')

  // Étape 3: Ajouter la colonne userId si elle n'existe pas
  console.log('📋 Étape 3: Ajout de la colonne userId à fuel_entries...')
  
  // Vérifier si la colonne existe déjà
  const columnExists = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fuel_entries' AND column_name = 'userId'
    )
  `)
  
  if (!columnExists[0]?.exists) {
    // Ajouter la colonne avec défaut = 1
    await prisma.$executeRawUnsafe(`
      ALTER TABLE fuel_entries ADD COLUMN "userId" INTEGER DEFAULT 1 NOT NULL
    `)
    console.log('   ✅ Colonne userId ajoutée (défaut = 1, toutes les entrées assignées à Personne 1)')
    
    // Ajouter la contrainte FK
    await prisma.$executeRawUnsafe(`
      ALTER TABLE fuel_entries 
      ADD CONSTRAINT fuel_entries_userId_fkey 
      FOREIGN KEY ("userId") REFERENCES users(id)
    `)
    console.log('   ✅ Contrainte FK ajoutée')
  } else {
    console.log('   ⏭️  Colonne userId existe déjà, mise à jour des entrées sans userId...')
    // Assigner les entrées sans userId à l'utilisateur 1
    await prisma.$executeRawUnsafe(`
      UPDATE fuel_entries SET "userId" = 1 WHERE "userId" IS NULL
    `)
  }

  // Étape 4: Vérification
  console.log('\n📊 Vérification:')
  const users = await prisma.$queryRawUnsafe<Array<{ id: number; pinCode: string; name: string }>>(`
    SELECT id, "pinCode", name FROM users ORDER BY id
  `)
  for (const user of users) {
    const count = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
      SELECT COUNT(*) as count FROM fuel_entries WHERE "userId" = ${user.id}
    `)
    console.log(`   👤 ${user.name} (code: ${user.pinCode}): ${count[0]?.count || 0} entrées`)
  }

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
