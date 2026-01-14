# Plan de Test Complet - EasyBooking

## 1. Introduction

Ce document décrit la stratégie de test mise en œuvre pour l'application EasyBooking. L'objectif est de garantir la fiabilité, la sécurité et la performance de l'application avant son déploiement.

## 2. Périmètre des Tests

Les tests couvrent l'ensemble des fonctionnalités critiques de l'application :

* Authentification (Login, Logout, Protection des routes)
* Gestion des Salles (Affichage, Recherche)
* Réservation (Création, Annulation, Validation)
* Sécurité (Injections, IDOR, Droits)

## 3. Types de Tests Implémentés

### 3.1 Tests Unitaires

* **Objectif** : Valider le fonctionnement isolé des composants et fonctions utilitaires.
* **Outils** : Vitest, React Testing Library.
* **Couverture** : > 80% sur les composants critiques (`Navbar`, `BookedList`, `UsageForm`, etc.).
* **Exemples** :
  * `src/lib/utils.test.ts` : Validation des classes CSS.
  * `BookedList.test.tsx` : Vérification du rendu et des appels de mocks.

### 3.2 Tests d'Intégration

* **Objectif** : Valider les interactions entre les composants et les flux de données (API, Navigation).
* **Quantité** : 10 cas de tests validés.
* **Flux Testés** :
    1. Flux de Login complet (Formulaire -> API -> Redirection).
    2. Flux de Réservation (UI -> POST API -> Toast succès).
    3. Flux d'Annulation (UI -> Modal -> DELETE API).
    4. Navigation inter-pages.
    5. Gestion des erreurs réseau.

### 3.3 Tests de Sécurité (10 Scenarios)

* **Objectif** : Identifier les vulnérabilités courantes.
* **Fichier** : `src/__tests__/security/protection.test.ts`.
* **Scénarios** :
    1. Accès non authentifié (401).
    2. IDOR (Suppression réservation d'autrui - 403).
    3. Suppression légitime (Propriétaire - 200).
    4. Injection SQL (Simulation input malveillant).
    5. Injection XSS (Sanitization).
    6. Validation des dates (Rejet formats invalides).
    7. Méthodes HTTP strictes (GET sur endpoint POST).
    8. Content-Type JSON.
    9. Rejet des dates passées (400).
    10. Double Booking (Conflit de créneau - 409).

### 3.4 Tests de Performance (10 Scenarios)

* **Objectif** : Valider la tenue en charge.
* **Outil** : K6.
* **Script** : `src/__tests__/perf/script.js`.
* **Scénarios** :
    1. Chargement Asset Statique.
    2. Login Échoué.
    3. Login Succès.
    4. Accès Dashboard.
    5. Liste des Salles.
    6. Détail Salle.
    7. Liste Réservations.
    8. Création Réservation.
    9. Logout.
    10. Vérification Accès post-logout.

## 4. Environnement de Test

* **Local** : Exécution via `npm test` (Vitest).
* **Performance** : Exécution locale K6 (nécessite binaire K6).
* **CI/CD** : Prêt pour intégration (Github Actions).

## 5. Critères d'Acceptation

* Tous les tests automatisés (Unitaires, Intégration, Sécurité) doivent être VERTS.
* Aucune régression sur les flux existants.
* Tests de performance : 95% des requêtes < 500ms (ou 1000ms selon seuil).

## 6. Maintenance

* Les mocks sont centralisés dans `src/test/mocks.ts`.
* Toute nouvelle fonctionnalité doit être accompagnée de ses tests correspondants.
