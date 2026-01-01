# Logique Plein vs Plein Partiel

## Problème résolu

Auparavant, l'application calculait la consommation en supposant que chaque plein était complet. Cela causait des calculs incorrects lorsque l'utilisateur faisait des pleins partiels.

### Exemple du problème

Si vous faisiez :
1. Plein complet : 40L à 150 000 km
2. Plein partiel : 20L à 150 500 km (500 km parcourus)
3. Plein complet : 45L à 151 000 km (500 km parcourus)

L'ancien calcul donnait :
- Entrée 2 : 20L / 500km = 4 L/100km (incorrect!)
- Entrée 3 : 45L / 500km = 9 L/100km (incorrect!)

## Solution implémentée

### 1. Nouveau champ `isFullTank`

Un champ booléen a été ajouté à la base de données pour indiquer si un plein est complet ou partiel :
- `isFullTank: true` = Plein complet (réservoir rempli)
- `isFullTank: false` = Plein partiel

### 2. Logique de calcul améliorée

La consommation n'est calculée que pour les pleins complets. Le calcul utilise :
- Les kilomètres depuis le dernier plein complet
- La somme de TOUS les litres depuis le dernier plein complet (incluant les partiels)

### Exemple avec la nouvelle logique

Avec les mêmes données :
1. Plein complet : 40L à 150 000 km
2. Plein partiel : 20L à 150 500 km → Pas de calcul de consommation
3. Plein complet : 45L à 151 000 km

Calcul pour l'entrée 3 :
- KM parcourus : 151 000 - 150 000 = 1000 km
- Litres consommés : 20L + 45L = 65L
- Consommation : 65L / 1000km × 100 = 6.5 L/100km ✅

## Interface utilisateur

### Formulaire d'ajout

Une case à cocher a été ajoutée dans le formulaire :
- ☑️ "Plein complet (réservoir rempli)"
- Par défaut : cochée (pour les pleins complets)
- Décocher si c'est un plein partiel

### Historique

Un badge visuel indique le type de plein :
- 🟢 "Plein" = Plein complet (badge vert)
- 🟠 "Partiel" = Plein partiel (badge orange)

### Calculs de consommation

- Les lignes avec plein complet affichent la consommation calculée
- Les lignes avec plein partiel affichent "-" pour la consommation

## Migration des données existantes

Un script de migration est fourni : `scripts/migrate-add-full-tank.ts`

Par défaut, toutes les entrées existantes sont marquées comme `isFullTank: true` car :
1. C'est le cas d'usage le plus courant
2. Cela préserve les calculs existants
3. L'utilisateur peut modifier les entrées si nécessaire

## Tests

Un script de test est disponible : `scripts/test-full-partial-logic.ts`

Ce script vérifie :
- ✅ Les pleins complets calculent correctement la consommation
- ✅ Les pleins partiels ne calculent pas de consommation
- ✅ Les pleins partiels entre deux pleins complets sont inclus dans le calcul
- ✅ Les statistiques globales sont cohérentes

Exécuter le test :
```bash
npx tsx scripts/test-full-partial-logic.ts
```

## Fichiers modifiés

### Base de données
- `prisma/schema.prisma` : Ajout du champ `isFullTank`

### Types
- `lib/types.ts` : Ajout de `isFullTank` aux interfaces

### Logique de calcul
- `lib/calculations.ts` : Nouvelle logique qui prend en compte `isFullTank`

### API
- `app/api/entries/route.ts` : Support du nouveau champ
- `app/page.tsx` : Inclusion du champ dans les données

### Composants UI
- `components/FuelConsumptionApp.tsx` : Gestion du nouveau champ dans le formulaire
- `components/fuel/DashboardTab.tsx` : Case à cocher pour plein complet
- `components/fuel/HistoryTab.tsx` : Badge visuel pour type de plein
- `components/fuel/MobileEntryCard.tsx` : Badge pour mobile

### Scripts
- `scripts/migrate-add-full-tank.ts` : Migration des données
- `scripts/test-full-partial-logic.ts` : Tests de validation

## Avantages

1. **Données précises** : Les calculs de consommation sont maintenant corrects même avec des pleins partiels
2. **Flexibilité** : L'utilisateur peut faire des pleins partiels sans fausser les statistiques
3. **Transparence** : Le type de plein est visible dans l'historique
4. **Rétrocompatibilité** : Les données existantes continuent de fonctionner avec la valeur par défaut

## Utilisation recommandée

- **Cocher "Plein complet"** : Quand vous remplissez le réservoir jusqu'à ce qu'il s'arrête automatiquement
- **Décocher "Plein complet"** : Quand vous mettez un montant ou un nombre de litres fixe sans remplir complètement

Les calculs de consommation (L/100km) seront plus précis si vous faites régulièrement des pleins complets.
