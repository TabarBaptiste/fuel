import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST - Authentification par code PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body

    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Code PIN invalide (4 chiffres requis)' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { pinCode: pin },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Code incorrect. Veuillez réessayer.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      userId: user.id,
      name: user.name,
    })
  } catch (error) {
    console.error('Erreur POST /api/auth:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
