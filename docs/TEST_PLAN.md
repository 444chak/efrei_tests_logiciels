# Plan de Test - EasyBooking

## 1. Introduction

Ce document définit la stratégie de test et le périmètre de validation pour l'application **EasyBooking**. Il a pour objectif de garantir la qualité, la fiabilité, la sécurité et les performances de l'application avant sa mise en production.

Le présent plan de test établit les critères d'acceptation, les méthodes de test et les outils utilisés pour valider l'ensemble des fonctionnalités critiques de la plateforme de réservation de salles.

---

## 2. Périmètre

Le périmètre de test couvre l'ensemble des fonctionnalités métier de l'application EasyBooking :

### 2.1 Authentification

- Connexion utilisateur (Login)
- Inscription utilisateur (Signup)
- Déconnexion (Logout)
- Protection des routes authentifiées
- Gestion des sessions utilisateur

### 2.2 Réservation

- Consultation des disponibilités de salles
- Création de réservation avec validation des conflits
- Annulation de réservation
- Visualisation des réservations (historique et à venir)
- Validation des créneaux horaires

### 2.3 Gestion des Chambres

- Affichage de la liste des salles disponibles
- Consultation des détails d'une salle
- Filtrage et recherche de salles
- Affichage des caractéristiques (capacité, équipements)

---

## 3. Stratégie de Test

La stratégie de test repose sur quatre niveaux de validation complémentaires, conformes aux standards ISTQB :

### 3.1 Tests Unitaires

**Objectif** : Valider le fonctionnement isolé des composants React et des fonctions utilitaires sans dépendances externes.

**Approche** : Tests white-box sur des unités de code isolées (composants, fonctions pures, helpers).

**Outils** : Vitest, React Testing Library, jsdom

**Couverture** :

- Composants UI (`Navbar`, `BookedList`, `RoomReservationForm`, `RoomsList`)
- Fonctions utilitaires (`src/lib/utils.ts`)
- Hooks personnalisés

**Localisation** : `src/components/**/*.test.tsx`, `src/lib/**/*.test.ts`

### 3.2 Tests d'Intégration API

**Objectif** : Valider l'interaction entre les composants frontend et les routes API, ainsi que l'assemblage technique des modules.

**Approche** : Tests white-box validant les flux de données entre les couches (UI → API → Base de données mockée).

**Outils** : Vitest, Mocks d'API, React Testing Library

**Flux testés** :

- Authentification complète (formulaire → API → redirection)
- Création de réservation (UI → POST API → feedback utilisateur)
- Annulation de réservation (UI → DELETE API → confirmation)
- Gestion des erreurs réseau et validation des réponses API

**Localisation** : `src/__tests__/integration/`

### 3.3 Tests de Sécurité

**Objectif** : Identifier et prévenir les vulnérabilités courantes selon le Top 10 OWASP.

**Approche** : Tests black-box validant les mécanismes de protection et la robustesse de l'application face aux attaques.

**Outils** : Vitest

**Scénarios couverts** :

1. Protection des routes non authentifiées (401 Unauthorized)
2. Prévention IDOR - Insecure Direct Object Reference (403 Forbidden)
3. Validation des droits d'accès (propriétaire vs tiers)
4. Protection contre l'injection SQL
5. Protection contre l'injection XSS (sanitization)
6. Validation stricte des formats de données (400 Bad Request)
7. Contrôle des méthodes HTTP autorisées
8. Validation du Content-Type JSON
9. Rejet des dates passées
10. Prévention des conflits de réservation (409 Conflict)

**Localisation** : `src/__tests__/security/protection.test.ts`

### 3.4 Tests de Performance

**Objectif** : Valider la tenue en charge, la latence et la stabilité de l'application sous stress.

**Approche** : Tests de charge simulés avec scénarios réalistes d'utilisation.

**Outils** : K6 (Grafana K6)

**Métriques cibles** :

- Temps de réponse p95 < 1000ms
- Taux d'erreur < 1%
- Stabilité sous charge modérée

**Scénarios de charge** :

1. Chargement d'assets statiques
2. Tentative de connexion échouée
3. Connexion réussie
4. Accès au dashboard utilisateur
5. Consultation de la liste des salles
6. Consultation du détail d'une salle
7. Consultation des réservations
8. Création d'une réservation
9. Déconnexion
10. Vérification d'accès post-déconnexion

**Localisation** : `src/__tests__/perf/script.js`

---

## 4. Outils

### 4.1 Framework et Technologies

- **Next.js 16** : Framework React avec App Router et API Routes
- **TypeScript** : Typage statique pour la robustesse du code
- **Supabase** : Backend as a Service (authentification, base de données PostgreSQL)

### 4.2 Outils de Test

- **Vitest 4.0** : Framework de test unitaire et d'intégration
- **React Testing Library 16.3** : Bibliothèque de test pour composants React
- **@testing-library/user-event 14.6** : Simulation d'interactions utilisateur
- **@testing-library/jest-dom 6.9** : Matchers DOM personnalisés
- **jsdom 27.4** : Environnement DOM simulé pour les tests
- **@vitest/coverage-v8 4.0** : Génération de rapports de couverture de code

### 4.3 Tests de Performance

- **K6 (Grafana K6)** : Outil de test de charge et de performance

### 4.4 Outils de Qualité

- **ESLint 9.39** : Analyse statique du code
- **Prettier 3.7** : Formatage automatique du code
- **TypeScript 5.9** : Vérification de types

---

## 5. Critères d'Acceptation

- Tous les tests automatisés (unitaires, intégration, sécurité) doivent passer avec succès
- Aucune régression fonctionnelle sur les flux existants
- Tests de performance : 95% des requêtes < 1000ms, taux d'erreur < 1%
- Couverture de code : > 80% sur les composants critiques

---

## 6. Maintenance et Évolution

- Les mocks et fixtures sont centralisés dans `src/test/mocks.ts` et `src/test/fixtures.ts`
- Toute nouvelle fonctionnalité doit être accompagnée de ses tests correspondants
- Les tests sont exécutés en continu via `npm test` et peuvent être intégrés dans un pipeline CI/CD

---

**Document Version** : 1.0  
**Date** : 14 jan. 2026
