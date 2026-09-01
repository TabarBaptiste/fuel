import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Récupérer les entrées d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      )
    }

    const entries = await prisma.fuelEntry.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { date: 'asc' },
    })

    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      kmCompteur: entry.kmCompteur,
      litres: entry.litres,
      prixLitre: entry.prixLitre,
      isFullTank: entry.isFullTank,
      userId: entry.userId,
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
    const { date, kmCompteur, litres, prixLitre, isFullTank, userId } = body

    // Validation
    if (!date || kmCompteur === undefined || litres === undefined || prixLitre === undefined || !userId) {
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
        isFullTank: isFullTank !== undefined ? isFullTank : true,
        userId: parseInt(userId),
      },
    })

    return NextResponse.json({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      kmCompteur: entry.kmCompteur,
      litres: entry.litres,
      prixLitre: entry.prixLitre,
      isFullTank: entry.isFullTank,
      userId: entry.userId,
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/entries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entrée' },
      { status: 500 }
    )
  }
}

// PUT - Modifier une entrée existante
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, date, kmCompteur, litres, prixLitre, isFullTank, userId } = body

    // Validation
    if (id === undefined || !date || kmCompteur === undefined || litres === undefined || prixLitre === undefined || !userId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'entrée appartient à l'utilisateur
    const existing = await prisma.fuelEntry.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing || existing.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Entrée non trouvée ou accès non autorisé' },
        { status: 403 }
      )
    }

    const entry = await prisma.fuelEntry.update({
      where: { id: parseInt(id) },
      data: {
        date: new Date(date),
        kmCompteur: parseFloat(kmCompteur),
        litres: parseFloat(litres),
        prixLitre: parseFloat(prixLitre),
        isFullTank: isFullTank !== undefined ? isFullTank : true,
      },
    })

    return NextResponse.json({
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      kmCompteur: entry.kmCompteur,
      litres: entry.litres,
      prixLitre: entry.prixLitre,
      isFullTank: entry.isFullTank,
      userId: entry.userId,
    })
  } catch (error) {
    console.error('Erreur PUT /api/entries:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'entrée' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une entrée
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'ID et userId requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'entrée appartient à l'utilisateur
    const existing = await prisma.fuelEntry.findUnique({
      where: { id: parseInt(id) },
    })

    if (!existing || existing.userId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Entrée non trouvée ou accès non autorisé' },
        { status: 403 }
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
