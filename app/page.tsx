import { prisma } from '@/lib/db'
import FuelConsumptionApp from '@/components/FuelConsumptionApp'
import { FuelEntry } from '@/lib/types'

async function getEntries(): Promise<FuelEntry[]> {
  const entries = await prisma.fuelEntry.findMany({
    orderBy: { date: 'asc' },
  })
  
  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString().split('T')[0],
    kmCompteur: entry.kmCompteur,
    litres: entry.litres,
    prixLitre: entry.prixLitre,
  }))
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const initialEntries = await getEntries()
  
  return <FuelConsumptionApp initialEntries={initialEntries} />
}
