import FuelConsumptionApp from '@/components/FuelConsumptionApp'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  return <FuelConsumptionApp initialEntries={[]} />
}
