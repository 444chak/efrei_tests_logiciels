# 🏨 EasyBooking

> Application web moderne de gestion de réservation de salles et créneaux horaires

[![CI Pipeline](https://github.com/444chak/efrei_tests_logiciels/actions/workflows/ci.yml/badge.svg)](https://github.com/444chak/efrei_tests_logiciels/actions/workflows/ci.yml)
[![Performances](https://github.com/444chak/efrei_tests_logiciels/actions/workflows/nightly.yml/badge.svg)](https://github.com/444chak/efrei_tests_logiciels/actions/workflows/nightly.yml)
[![codecov](https://codecov.io/github/444chak/efrei_tests_logiciels/graph/badge.svg?token=NJD4RI30YU)](https://codecov.io/github/444chak/efrei_tests_logiciels)

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-FCC72B?style=flat-square&logo=vitest&logoColor=white)

Lien de l'application : [EasyBooking](https://efrei-tests-logiciels.vercel.app/)

---

## 📋 Présentation du Projet

**EasyBooking** est une application web full-stack permettant aux utilisateurs de **réserver des créneaux horaires** dans des salles disponibles. L'application offre une interface intuitive pour consulter les disponibilités, effectuer des réservations et gérer ses créneaux réservés.

### 🎯 Fonctionnalités Principales

- ✅ **Authentification sécurisée** (Login/Signup) via Supabase
- ✅ **Consultation des salles** disponibles avec leurs caractéristiques
- ✅ **Réservation de créneaux** avec validation des conflits
- ✅ **Gestion des réservations** (visualisation, annulation)
- ✅ **Dashboard utilisateur** avec vue d'ensemble des réservations

### 📚 Documentation QA

Toute la documentation qualité et tests est disponible dans le dossier [`/docs`](./docs/) :

- 📄 **[Plan de Test](./docs/TEST_PLAN.md)** - Planification et périmètre des tests
- 📄 **[Rapport Qualité](./docs/QUALITY_REPORT.md)** - Métriques et résultats
- 📄 **[Guide d'Exécution](./docs/RUN_TESTS.md)** - Commandes et procédures

---

## 🛠 Stack Technique

### Frontend

- **Next.js 16** - Framework React avec SSR/SSG
- **TypeScript** - Typage statique pour la robustesse
- **TailwindCSS** - Framework CSS utilitaire
- **Radix UI** - Composants UI accessibles
- **React Hook Form** + **Zod** - Validation de formulaires

### Backend & Infrastructure

- **Supabase** - Backend as a Service (Base de données PostgreSQL, Auth)
- **Next.js API Routes** - Endpoints REST pour la logique métier

### Outils de Test

- **Vitest** - Framework de test unitaire et d'intégration
- **React Testing Library** - Tests de composants React
- **K6** - Tests de performance et charge
- **@vitest/coverage-v8** - Rapport de couverture de code

---

## 🧪 Stratégie de Test & Assurance Qualité

Cette section présente l'architecture de tests conforme aux **standards ISTQB**, distinguant clairement la **validation technique** (Tests Unitaires) de la **validation des flux** (Tests d'Intégration).

### Architecture des Tests

| Type de Test | Localisation | Approche | Objectif | Outils |
| ------------ | ------------ | -------- | -------- | ------ |
| **🔬 Tests Unitaires** | `src/components/**/*.test.tsx`<br>`src/lib/**/*.test.ts` | **White Box** | Validation technique isolée : rendu des composants, logique pure, props | Vitest, React Testing Library |
| **🔗 Tests d'Intégration** | `src/__tests__/integration/` | **White Box** | Validation technique de l'assemblage : routes API, interaction entre modules techniques | Vitest, Mocks |
| **📋 Tests Fonctionnels** | `src/__tests__/functional/` | **Black Box** | Validation des scénarios métier : parcours utilisateur complets, user stories | Vitest, React Testing Library |
| **🔒 Tests de Sécurité** | `src/__tests__/security/` | **Black Box** | Protection des routes, validation des inputs, prévention des vulnérabilités | Vitest |
| **⚡ Tests de Performance** | `src/__tests__/perf/` | **Load Testing** | Validation de la tenue en charge, latence, stabilité sous stress | K6 |

### 📊 Détail des 4 Niveaux de Tests

#### 1. 🔬 Tests Unitaires (White Box)

**Localisation** : `src/components/**/*.test.tsx`, `src/lib/**/*.test.ts`

**Caractéristiques** :

- ✅ Tests **isolés** : chaque composant testé indépendamment
- ✅ **Mocks systématiques** : dépendances externes (API, Router, Supabase) mockées
- ✅ **Rapides** : exécution < 500ms par fichier
- ✅ **Smoke tests** : vérification du rendu et des props uniquement

**Exemples** :

- `src/components/BookedList/BookedList.test.tsx` - Vérifie le rendu avec différentes props
- `src/components/RoomReservationForm/RoomReservationForm.test.tsx` - Valide la structure du formulaire
- `src/lib/utils.test.ts` - Teste les fonctions utilitaires (formatDate, formatTime, cn)

**Principe ISTQB** : Validation technique d'un composant isolé sans dépendances externes.

#### 2. 🔗 Tests d'Intégration (White Box - Technique)

**Localisation** : `src/__tests__/integration/`

**Caractéristiques** :

- ✅ Validation de l'**assemblage technique** : routes API, interaction entre modules
- ✅ **Mocks d'API** : simulation des appels réseau sans serveur réel
- ✅ **Approche White Box** : connaissance de l'implémentation technique
- ✅ **Coopération entre composants** : validation des interactions techniques

**Fichiers** :

- `api.test.ts` - Tests des routes API (GET, POST, DELETE) - Validation technique
- `components/BookedList.integration.test.tsx` - Intégration composant avec API mockée
- `components/RoomReservationForm.integration.test.tsx` - Intégration formulaire avec API
- `components/RoomsList.integration.test.tsx` - Cycle de vie avec données externes

**Principe ISTQB** : Validation technique de l'assemblage de plusieurs composants/modules.

#### 3. 📋 Tests Fonctionnels (Black Box - Métier)

**Localisation** : `src/__tests__/functional/`

**Caractéristiques** :

- ✅ Tests de **scénarios métier complets** : parcours utilisateur (User Stories)
- ✅ **Approche Black Box** : pas de connaissance de l'implémentation
- ✅ **Validation des flux** : Login, Booking, Cancel, Error Handling
- ✅ **Focus sur le comportement** : ce que l'utilisateur voit et fait

**Fichiers** :

- `flow.test.tsx` - Tests des scénarios utilisateur complets :
  - Login Flow (connexion → redirection)
  - Booking Flow (réservation complète)
  - Cancel Flow (annulation avec confirmation)
  - Date Navigation (interaction calendrier)
  - Error Handling (gestion des erreurs réseau)

**Principe ISTQB** : Validation des scénarios métier et des parcours utilisateur (Black Box).

#### 4. 🔒 Tests de Sécurité

**Localisation** : `src/__tests__/security/protection.test.ts`

**Caractéristiques** :

- ✅ **10 scénarios** couvrant les vulnérabilités OWASP
- ✅ Protection des routes (401, 403)
- ✅ Validation des inputs (Injection SQL, XSS)
- ✅ Logique métier sécurisée (IDOR, Double Booking)

**Scénarios testés** :

1. Accès non authentifié → 401
2. IDOR (suppression réservation d'autrui) → 403
3. Suppression légitime → 200
4. Injection SQL → Rejet sécurisé
5. Injection XSS → Sanitization
6. Validation formats invalides → 400
7. Méthodes HTTP strictes
8. Content-Type JSON
9. Rejet dates passées → 400
10. Prévention double booking → 409

#### 5. ⚡ Tests de Performance

**Localisation** : `src/__tests__/perf/script.js`

**Caractéristiques** :

- ✅ **K6** pour les tests de charge
- ✅ **10 scénarios** réalistes (Login, Booking, Navigation)
- ✅ **Métriques** : p95 < 1000ms, taux d'erreur < 1%
- ✅ **Stages** : Ramp-up, stable, ramp-down

**Scénarios** :

1. Chargement Asset Statique
2. Login Échoué
3. Login Succès
4. Accès Dashboard
5. Liste des Salles
6. Détail Salle
7. Liste Réservations
8. Création Réservation
9. Logout
10. Vérification Accès post-logout

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** 20.x ou supérieur
- **npm** ou **yarn**
- **Clés API Supabase** (à configurer dans `.env.local`)

### Installation

```bash
# Cloner le repository (si applicable)
git clone <repository-url>
cd efrei_tests_logiciels

# Installer les dépendances
npm install
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Démarrage du serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## ✅ Comment Exécuter les Tests

### Tests Unitaires & Intégration (Vitest)

```bash
# Lancer tous les tests (Unitaires + Intégration + Sécurité)
npm run test

# Mode watch (développement continu) - lance tous les tests
npx vitest

# Tests unitaires uniquement (composants colocalisés)
npx vitest src/components

# Tests d'intégration uniquement (technique)
npx vitest integration

# Tests fonctionnels uniquement (métier)
npx vitest functional

# Tests de sécurité uniquement
npx vitest security
```

### Couverture de Code

```bash
# Générer le rapport de couverture
npm run coverage

# Le rapport HTML sera disponible dans coverage/index.html
```

### Tests de Performance (K6)

**Installation de K6** (si nécessaire) :

```bash
# Windows (Winget)
winget install k6

# Windows (Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

**Exécution** :

```bash
# Lancer le script de performance complet
k6 run src/__tests__/perf/script.js
```

### Résumé des Commandes

| Type de Test | Commande | Description |
| ------------ | -------- | ----------- |
| **Tous** | `npm run test` | Lance Unitaires, Intégration, Fonctionnels, Sécurité |
| **Unitaires** | `npx vitest src/components` | Tests isolés des composants |
| **Intégration** | `npx vitest src/__tests__/integration` | Tests techniques d'assemblage |
| **Fonctionnels** | `npx vitest src/__tests__/functional` | Tests de scénarios métier |
| **Sécurité** | `npx vitest security` | Scénarios de protection |
| **Performance** | `k6 run src/__tests__/perf/script.js` | Tests de charge (nécessite K6) |
| **Couverture** | `npm run coverage` | Rapport de couverture HTML |

---

## 📂 Structure du Projet

```text
efrei_tests_logiciels/
├── src/
│   ├── app/                    # Next.js App Router (Pages & Routes)
│   │   ├── api/                # API Routes (Backend)
│   │   ├── login/              # Page de connexion
│   │   ├── dashboard/          # Dashboard utilisateur
│   │   └── ...
│   │
│   ├── components/             # Composants React
│   │   ├── BookedList/
│   │   │   ├── index.tsx
│   │   │   └── BookedList.test.tsx        # Test unitaire (colocalisé)
│   │   ├── RoomReservationForm/
│   │   │   ├── index.tsx
│   │   │   └── RoomReservationForm.test.tsx  # Test unitaire
│   │   └── ...
│   │
│   ├── __tests__/              # Tests d'infrastructure
│   │   ├── integration/        # Tests d'intégration technique (White Box)
│   │   │   ├── api.test.ts
│   │   │   └── components/      # Tests d'intégration des composants
│   │   │       ├── BookedList.integration.test.tsx
│   │   │       ├── RoomReservationForm.integration.test.tsx
│   │   │       └── RoomsList.integration.test.tsx
│   │   ├── functional/          # Tests fonctionnels métier (Black Box)
│   │   │   └── flow.test.tsx
│   │   ├── security/           # Tests de sécurité
│   │   │   └── protection.test.ts
│   │   └── perf/               # Tests de performance
│   │       └── script.js
│   │
│   ├── lib/                     # Utilitaires et helpers
│   ├── hooks/                  # React Hooks personnalisés
│   ├── types/                  # Définitions TypeScript
│   └── test/                    # Mocks et fixtures centralisés
│       ├── mocks.ts
│       └── fixtures.ts
│
├── docs/                        # Documentation QA
│   ├── TEST_PLAN.md
│   ├── QUALITY_REPORT.md
│   ├── RUN_TESTS.md
│   └── API_TESTING.md
│
├── scripts/                     # Scripts utilitaires
│   └── generateTestUser.js
│
├── coverage/                    # Rapports de couverture (généré)
├── package.json
├── vitest.config.ts
└── README.md
```

### Séparation des Tests

- **`src/components/**/*.test.tsx`** : Tests unitaires purs (White Box) colocalisés avec les composants
- **`src/__tests__/integration/`** : Tests d'intégration technique (White Box) - validation de l'assemblage
- **`src/__tests__/functional/`** : Tests fonctionnels métier (Black Box) - validation des scénarios utilisateur
- **`src/__tests__/security/`** : Tests de sécurité (protection, validation)
- **`src/__tests__/perf/`** : Tests de performance (K6 scripts)

---

## 📝 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run test         # Exécuter tous les tests
npm run coverage     # Générer le rapport de couverture
npm run lint         # Vérifier le code avec ESLint
npm run format       # Formater le code avec Prettier
```

---

## 🎓 Conformité ISTQB

Cette architecture de tests respecte les principes enseignés dans la certification **ISTQB** :

- ✅ **Séparation stricte** entre Tests Unitaires, Tests d'Intégration (technique) et Tests Fonctionnels (métier)
- ✅ **Tests Unitaires** : Validation technique isolée, rapide, avec mocks (White Box)
- ✅ **Tests d'Intégration** : Validation technique de l'assemblage et des routes API (White Box)
- ✅ **Tests Fonctionnels** : Validation des scénarios métier et parcours utilisateur (Black Box)
- ✅ **Tests de Sécurité** : Protection contre les vulnérabilités OWASP
- ✅ **Tests de Performance** : Validation de la tenue en charge

Pour plus de détails, consultez le [Rapport d'Audit Architecture](./docs/AUDIT_ARCHITECTURE_TESTS.md).

---

## 🔄 CI/CD & GitHub Actions

Le projet utilise **GitHub Actions** pour automatiser les tests et la qualité du code.

### Workflows Disponibles

#### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Déclenchement** : À chaque push ou pull request sur la branche `master`

**Jobs** :

- ✅ **Linting** : Vérification ESLint
- ✅ **Type Checking** : Vérification TypeScript
- ✅ **Testing** : Exécution de tous les tests avec couverture de code
- ✅ **Codecov** : Upload de la couverture vers Codecov

#### 2. Nightly Tests (`.github/workflows/nightly.yml`)

**Déclenchement** :

- 🔄 **Automatique** : Tous les jours à 2h du matin UTC (cron)
- 🔧 **Manuel** : Via `workflow_dispatch` dans l'interface GitHub Actions

**Jobs** :

- ✅ **Security Tests** : Exécution des tests de sécurité (10 scénarios OWASP)
- ✅ **Performance Tests** : Tests de charge avec K6 (10 scénarios)

**Note** : Les tests de performance nécessitent un serveur Next.js en cours d'exécution, qui est démarré automatiquement dans le workflow.

---

## 👤 Auteur

Groupe 11

---

## 📄 Licence

Ce projet est privé et destiné à un usage académique.
