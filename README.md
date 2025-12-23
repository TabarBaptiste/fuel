# 🚗 Carburant - Application de Suivi de Consommation

Application Next.js 14 moderne et responsive pour suivre votre consommation de carburant.

## ✨ Fonctionnalités

- ✅ Ajout/suppression de pleins
- ✅ Calcul automatique des km parcourus, consommation et coûts
- ✅ Statistiques en temps réel avec cartes visuelles
- ✅ Design moderne et responsive (mobile-friendly)
- ✅ Interface en français
- ✅ Persistance des données avec NeonDB (PostgreSQL)

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **BDD**: Neon PostgreSQL + Prisma ORM
- **Hébergement**: Vercel

## 📁 Structure du Projet

```
fuel-app/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil (Server Component)
│   ├── globals.css         # Styles globaux + Tailwind
│   └── api/
│       └── entries/
│           └── route.ts    # API CRUD pour les entrées
├── lib/
│   ├── db.ts              # Client Prisma singleton
│   ├── types.ts           # Types TypeScript
│   └── calculations.ts    # Fonctions de calcul
├── components/
│   └── FuelConsumptionApp.tsx  # Composant principal (Client Component)
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   └── seed.ts            # Script de seed
└── public/
    └── manifest.json      # PWA manifest
```

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
cd fuel-app
npm install
```

### 2. Configurer NeonDB

1. Créez un compte sur [Neon](https://neon.tech)
2. Créez un nouveau projet
3. Copiez l'URL de connexion

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Editez `.env` et ajoutez votre URL de connexion NeonDB :

```
DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 4. Initialiser la base de données

```bash
# Créer les tables
npm run db:push

# (Optionnel) Insérer les données de test
npm run db:seed
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## 🌐 Déploiement sur Vercel

### 1. Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <votre-repo>
git push -u origin main
```

### 2. Déployer sur Vercel

1. Connectez-vous sur [Vercel](https://vercel.com)
2. Importez votre repository GitHub
3. Ajoutez la variable d'environnement `DATABASE_URL`
4. Déployez ! 🚀

## 📝 Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lance le serveur de production |
| `npm run db:push` | Synchronise le schéma Prisma avec la BDD |
| `npm run db:studio` | Lance Prisma Studio (interface graphique) |
| `npm run db:seed` | Insère les données de test |

## 🎨 Personnalisation

### Couleurs

Les couleurs principales sont définies dans `tailwind.config.ts`. Modifiez la palette `primary` pour personnaliser le thème.

### Animations

Les animations sont définies dans `tailwind.config.ts` et les classes utilitaires dans `globals.css`.

## 📱 PWA

L'application est configurée comme une Progressive Web App. Ajoutez des icônes dans `/public` pour activer l'installation sur mobile.

## 🔧 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/entries` | Liste toutes les entrées |
| POST | `/api/entries` | Crée une nouvelle entrée |
| DELETE | `/api/entries?id=X` | Supprime une entrée |

## 📄 License

MIT
