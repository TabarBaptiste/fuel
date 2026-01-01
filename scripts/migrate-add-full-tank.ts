/**
 * Migration script to add isFullTank field to existing fuel entries
 * This script updates all existing entries to have isFullTank = true by default
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🚀 Starting migration: Add isFullTank field...')

    // First, check if the migration is needed by trying to read the field
    const firstEntry = await prisma.fuelEntry.findFirst()
    
    if (!firstEntry) {
      console.log('✅ No entries in database, migration not needed')
      return
    }

    // Check if isFullTank field exists and has a value
    const hasField = 'isFullTank' in firstEntry
    
    if (hasField && firstEntry.isFullTank !== undefined) {
      console.log('✅ Migration already applied, skipping...')
      return
    }

    console.log('📝 Migration needed, applying default value...')
    
    // Update all entries to have isFullTank = true by default
    const result = await prisma.$executeRaw`
      UPDATE fuel_entries 
      SET "isFullTank" = true 
      WHERE "isFullTank" IS NULL
    `

    console.log(`✅ Migration complete! Updated ${result} entries`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
  .then(() => {
    console.log('✅ Migration finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
