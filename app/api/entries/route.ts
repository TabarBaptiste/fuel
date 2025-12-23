import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Récupérer toutes les entrées
export async function GET() {
  try {
    const entries = await prisma.fuelEntry.findMany({
      orderBy: { date: 'asc' },
    })

    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      kmCompteur: entry.kmCompteur,
      litres: entry.litres,
      prixLitre: entry.prixLitre,
    }))

    return NextResponse.json(formattedEntries)
  } catch (error) {
    console.error('Erreur GET /api/entries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entrées' },
      { status: 500 }
    )
  }
}

// POST - Ajouter une nouvelle entrée
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, kmCompteur, litres, prixLitre } = body

    // Validation
    if (!date || kmCompteur === undefined || litres === undefined || prixLitre === undefined) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    const entry = await prisma.fuelEntry.create({
      data: {
        date: new Date(date),
        kmCompteur: parseFloat(kmCompteur),
        litres: parseFloat(litres),
        prixLitre: parseFloat(prixLitre),
      },
    })

    return NextResponse.json({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      kmCompteur: entry.kmCompteur,
      litres: entry.litres,
      prixLitre: entry.prixLitre,
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/entries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entrée' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une entrée
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    await prisma.fuelEntry.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur DELETE /api/entries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entrée' },
      { status: 500 }
    )
  }
}
