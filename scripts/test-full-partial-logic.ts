/**
 * Test script to verify the full/partial tank logic
 * This tests the consumption calculation with mixed full and partial fill-ups
 */

import { calculateStats } from '../lib/calculations'
import { FuelEntry } from '../lib/types'

console.log('🧪 Testing Full vs Partial Tank Logic\n')

// Test scenario: Mix of full and partial tanks
const testEntries: FuelEntry[] = [
  // First full tank - no consumption can be calculated yet
  {
    id: 1,
    date: '2025-01-01',
    kmCompteur: 100000,
    litres: 45,
    prixLitre: 1.70,
    isFullTank: true
  },
  // Second full tank - consumption should be calculated
  {
    id: 2,
    date: '2025-01-15',
    kmCompteur: 100650,
    litres: 42,
    prixLitre: 1.72,
    isFullTank: true
  },
  // Partial tank - should NOT affect consumption calculation
  {
    id: 3,
    date: '2025-01-20',
    kmCompteur: 101000,
    litres: 20,
    prixLitre: 1.71,
    isFullTank: false
  },
  // Another partial tank - should NOT affect consumption calculation
  {
    id: 4,
    date: '2025-01-25',
    kmCompteur: 101300,
    litres: 15,
    prixLitre: 1.69,
    isFullTank: false
  },
  // Third full tank - consumption should be calculated using all litres since last full tank
  {
    id: 5,
    date: '2025-02-01',
    kmCompteur: 101750,
    litres: 48,
    prixLitre: 1.73,
    isFullTank: true
  },
  // Fourth full tank - consumption should be calculated
  {
    id: 6,
    date: '2025-02-15',
    kmCompteur: 102450,
    litres: 44,
    prixLitre: 1.74,
    isFullTank: true
  }
]

const result = calculateStats(testEntries, 50)

console.log('📊 Test Results:\n')
console.log('Enriched Entries:')
result.enrichedEntries.forEach((entry, index) => {
  console.log(`\nEntry ${index + 1} (${entry.date}):`)
  console.log(`  - Type: ${entry.isFullTank ? '✅ Full Tank' : '⚠️  Partial Tank'}`)
  console.log(`  - Km: ${entry.kmCompteur}`)
  console.log(`  - Km Parcourus: ${entry.kmParcourus} km`)
  console.log(`  - Litres: ${entry.litres.toFixed(2)} L`)
  console.log(`  - Consumption: ${entry.consoL100km > 0 ? entry.consoL100km.toFixed(2) + ' L/100km' : 'N/A (partial or first entry)'}`)
})

console.log('\n' + '='.repeat(60))
console.log('\n📈 Overall Statistics:')
console.log(`  - Total KM: ${result.stats.totalKm} km`)
console.log(`  - Total Litres: ${result.stats.totalLitres.toFixed(2)} L`)
console.log(`  - Average Consumption (sliding): ${result.stats.consoMoyenneGlissante.toFixed(2)} L/100km`)
console.log(`  - Total Cost: ${result.stats.totalCout.toFixed(2)} €`)

console.log('\n' + '='.repeat(60))
console.log('\n✅ Expected Behavior:\n')
console.log('1. Entry 1 (Full Tank): No consumption (first entry)')
console.log('2. Entry 2 (Full Tank): Consumption = 42L / 650km = 6.46 L/100km')
console.log('3. Entry 3 (Partial Tank): No consumption calculated')
console.log('4. Entry 4 (Partial Tank): No consumption calculated')
console.log('5. Entry 5 (Full Tank): Consumption = (20+15+48)L / 1100km = 7.54 L/100km')
console.log('   (includes partial tanks between full tanks)')
console.log('6. Entry 6 (Full Tank): Consumption = 44L / 700km = 6.29 L/100km')

console.log('\n' + '='.repeat(60))
console.log('\n🔍 Verification:\n')

// Verify Entry 2
const entry2 = result.enrichedEntries[1]
const expectedConso2 = (42 / 650) * 100
const tolerance = 0.01
if (Math.abs(entry2.consoL100km - expectedConso2) < tolerance) {
  console.log(`✅ Entry 2: Consumption correct (${entry2.consoL100km.toFixed(2)} L/100km)`)
} else {
  console.log(`❌ Entry 2: Consumption incorrect. Expected ${expectedConso2.toFixed(2)}, got ${entry2.consoL100km.toFixed(2)}`)
}

// Verify Entry 3 and 4 have no consumption
const entry3 = result.enrichedEntries[2]
const entry4 = result.enrichedEntries[3]
if (entry3.consoL100km === 0) {
  console.log(`✅ Entry 3: No consumption calculated (partial tank)`)
} else {
  console.log(`❌ Entry 3: Should not have consumption calculated (${entry3.consoL100km.toFixed(2)})`)
}
if (entry4.consoL100km === 0) {
  console.log(`✅ Entry 4: No consumption calculated (partial tank)`)
} else {
  console.log(`❌ Entry 4: Should not have consumption calculated (${entry4.consoL100km.toFixed(2)})`)
}

// Verify Entry 5 - includes partial tanks
const entry5 = result.enrichedEntries[4]
const expectedConso5 = ((20 + 15 + 48) / 1100) * 100 // 83L / 1100km from last full tank
if (Math.abs(entry5.consoL100km - expectedConso5) < tolerance) {
  console.log(`✅ Entry 5: Consumption correct (${entry5.consoL100km.toFixed(2)} L/100km, includes partial tanks)`)
} else {
  console.log(`❌ Entry 5: Consumption incorrect. Expected ${expectedConso5.toFixed(2)}, got ${entry5.consoL100km.toFixed(2)}`)
}

// Verify Entry 6
const entry6 = result.enrichedEntries[5]
const expectedConso6 = (44 / 700) * 100
if (Math.abs(entry6.consoL100km - expectedConso6) < tolerance) {
  console.log(`✅ Entry 6: Consumption correct (${entry6.consoL100km.toFixed(2)} L/100km)`)
} else {
  console.log(`❌ Entry 6: Consumption incorrect. Expected ${expectedConso6.toFixed(2)}, got ${entry6.consoL100km.toFixed(2)}`)
}

console.log('\n' + '='.repeat(60))
console.log('\n🎉 Test completed!\n')
