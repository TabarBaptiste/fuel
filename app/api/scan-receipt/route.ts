import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const PROMPT = `Tu es un assistant spécialisé dans l'extraction de données de tickets de station-service.

Analyse cette photo de ticket d'essence et extrais les informations suivantes :
- **date** : la date de la transaction au format YYYY-MM-DD
- **litres** : la quantité de carburant en litres (nombre décimal avec un point)
- **prixLitre** : le prix unitaire au litre en euros (nombre décimal avec un point)
- **carburant** : le type de carburant (ex: SP95, SP98, E10, Gazole, etc.)
- **montantTotal** : le montant total payé en euros (nombre décimal avec un point)

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans backticks, sans explication. Exemple :
{"date":"2025-11-19","litres":"40.38","prixLitre":"1.739","carburant":"SP95","montantTotal":"70.22"}

Si tu ne peux pas lire une valeur, mets null pour ce champ.`

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée. Ajoutez GEMINI_API_KEY dans .env' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { image, mimeType } = body

    if (!image) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      )
    }

    // Retirer le préfixe data:image/xxx;base64, si présent
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text()
      console.error('Erreur Gemini API:', geminiResponse.status, errorData)
      return NextResponse.json(
        { error: `Erreur de l'API Gemini (${geminiResponse.status})` },
        { status: 502 }
      )
    }

    const geminiData = await geminiResponse.json()

    // Extraire le texte de la réponse Gemini
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!responseText) {
      return NextResponse.json(
        { error: 'Réponse vide de Gemini' },
        { status: 502 }
      )
    }

    // Parser le JSON retourné par Gemini
    // Nettoyer les éventuels backticks markdown
    const cleanedText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    let parsedResult
    try {
      parsedResult = JSON.parse(cleanedText)
    } catch {
      console.error('Impossible de parser la réponse Gemini:', responseText)
      return NextResponse.json(
        { error: 'Impossible de lire les données du ticket', rawText: responseText },
        { status: 422 }
      )
    }

    return NextResponse.json({
      date: parsedResult.date || null,
      litres: parsedResult.litres || null,
      prixLitre: parsedResult.prixLitre || null,
      carburant: parsedResult.carburant || null,
      montantTotal: parsedResult.montantTotal || null,
    })
  } catch (error) {
    console.error('Erreur POST /api/scan-receipt:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
