# Structure du projet Fuel App

## 📁 Organisation des fichiers

### 🎯 Composant principal
- **`components/FuelConsumptionApp.tsx`** - Composant racine orchestrant toute l'application (116 lignes vs 700+ avant)

### 🧩 Composants UI réutilisables
```
components/ui/
├── Header.tsx              # En-tête avec paramètres
└── NavigationTabs.tsx      # Onglets de navigation
```

### ⛽ Composants métier (fuel)
```
components/fuel/
├── DashboardTab.tsx        # Vue tableau de bord
├── HistoryTab.tsx          # Vue historique des pleins
├── ChartsTab.tsx           # Vue graphiques mensuels
├── QuestionCard.tsx        # Carte question/réponse
├── FormField.tsx           # Champ de formulaire
├── MiniStat.tsx            # Petite statistique
├── ConsumptionBadge.tsx    # Badge de consommation coloré
├── MobileEntryCard.tsx     # Carte plein (mobile)
├── EmptyState.tsx          # État vide
├── ChartCard.tsx           # Conteneur graphique
└── SimpleBarChart.tsx      # Graphique en barres
```

### 📚 Logique métier
```
lib/
├── types.ts                # Types TypeScript
├── calculations.ts         # Calculs de statistiques
├── db.ts                   # Client Prisma
└── utils/
    └── dateFormat.ts       # Utilitaires de formatage de date
```

### 🗄️ Base de données
```
prisma/
├── schema.prisma           # Schéma de la BDD
└── seed.ts                 # Données initiales
```

### 🛠️ Scripts utilitaires
```
scripts/
├── seed-fuel-data.ts       # Import de données carburant
├── check-data.ts           # Vérification des données
└── clear-data.ts           # Nettoyage de la BDD
```

## 🏗️ Architecture

### Flux de données
```
Page (Server Component)
    ↓ [getEntries()]
    ↓ initialEntries
    ↓
FuelConsumptionApp (Client Component)
    ↓ [calculateStats()]
    ↓ stats, enrichedEntries, monthlyStats
    ↓
┌───────────────┬────────────────┬─────────────┐
│ DashboardTab  │  HistoryTab    │  ChartsTab  │
└───────────────┴────────────────┴─────────────┘
```

### Séparation des responsabilités

| Couche | Responsabilité | Fichiers |
|--------|---------------|----------|
| **Présentation** | UI et interactions | `components/` |
| **Logique** | Calculs et transformations | `lib/calculations.ts` |
| **Données** | Accès base de données | `lib/db.ts`, `app/api/` |
| **Types** | Contrats de données | `lib/types.ts` |

## 📦 Composants par taille

| Composant | Lignes | Complexité |
|-----------|--------|------------|
| FuelConsumptionApp | 116 | Orchestration |
| DashboardTab | 185 | Vue complexe |
| HistoryTab | 95 | Vue moyenne |
| ChartsTab | 111 | Vue moyenne |
| SimpleBarChart | 42 | Logique d'affichage |
| MobileEntryCard | 58 | Présentation |
| Autres | 10-30 | Composants simples |

## 🎨 Avantages de cette structure

✅ **Maintenabilité** - Fichiers courts et ciblés  
✅ **Réutilisabilité** - Composants isolés  
✅ **Testabilité** - Logique séparée de la présentation  
✅ **Lisibilité** - Responsabilités claires  
✅ **Extensibilité** - Facile d'ajouter des fonctionnalités

## 🚀 Commandes utiles

```bash
# Développement
npm run dev

# Import de données
npx tsx scripts/seed-fuel-data.ts

# Vérifier les données
npx tsx scripts/check-data.ts

# Vider la base
npx tsx scripts/clear-data.ts

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```

## 📝 Convention de nommage

- **Composants** : PascalCase (`QuestionCard.tsx`)
- **Utilitaires** : camelCase (`dateFormat.ts`)
- **Dossiers** : kebab-case ou descriptifs (`fuel/`, `ui/`)
- **Types** : PascalCase (`FuelEntry`, `MonthlyStats`)
- **Fonctions** : camelCase (`calculateStats`, `formatDate`)
