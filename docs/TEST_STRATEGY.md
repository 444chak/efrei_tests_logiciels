# Stratégie de Tests & Guide d'Implémentation

Ce document définit la stratégie de test pour l'application **EasyBooking**. Notre objectif est d'atteindre une couverture de code de **100%** et d'assurer la robustesse, la sécurité et la performance de l'application.

## 🎯 Objectifs Globaux

- **Qualité** : Chaque fonctionnalité doit être validée par des tests.
- **Sécurité** : Aucun endpoint API ne doit être exposé sans validation d'autorisation.
- **Performance** : Les temps de réponse doivent rester sous les 200ms pour les APIs critiques.
- **Couverture** : Viser 100% de couverture sur les utilitaires, hooks et composants critiques.

---

## 1. Tests Unitaires (Unit Tests)

**Technologie** : Vitest + React Testing Library
**Localisation** : `src/components/ReviewList/ReviewList.test.tsx` (Colocation)

### Directives

- Chaque composant, hook, et fonction utilitaire doit avoir son propre fichier de test.
- Mocker systématiquement les dépendances externes (API calls, Supabase, Navigation).

### Cas de Tests Requis (Minimum 10) - Unit Tests

Les développeurs doivent implémenter les cas suivants pour assurer la couverture :

#### Utils & Helpers

1. `utils.ts/cn` : Vérifier la fusion des classes conditionnelles.
2. `utils.ts/formatDate` : Vérifier le formatage FR et la gestion des dates nulles/invalides.
3. `utils.ts/formatTime` : Vérifier le formatage de l'heure.

#### Composants UI (Design System)

1. `Button` : Vérifier le rendu des variants (ghost, default, destructive).
2. `Input` : Vérifier que l'input accepte du texte et gère les états `disabled`.
3. `Dialog/Modal` : Vérifier que la modale s'ouvre/se ferme au clic.

#### Composants Métier

1. `Navbar` :
   - Affichage liens "Login/Sign up" si déconnecté.
   - Affichage avatar/menu si connecté.
2. `BookedList` :
   - Affichage de la liste des réservations.
   - Ouverture de la modale de confirmation au clic sur "Annuler".
3. `ReservationForm` :
   - Validation des champs obligatoires (date, heure).
   - Affichage d'erreur si date passée.

#### Hooks

1. `useUserReservations` :
   - Vérifier l'état initial (loading).
   - Vérifier l'état après succès (data populated).
   - Vérifier la gestion d'erreur (API fail).

---

## 2. Tests d'Intégration (Integration Tests)

**Technologie** : Vitest (Environnement Node/DOM)
**Objectif** : Valider le flux de données entre l'API, le Client et la Base de données (Simulé).

### Cas de Tests Requis (Minimum 10) - Intégration

#### API Routes (Backend)

1. **DELETE** `/api/reservations/[id]` : Suppression réussie (200).
2. **DELETE** `/api/reservations/[id]` : Échec si réservation inexistante (404).
3. **GET** `/api/rooms` : Récupération de la liste des salles (200).
4. **POST** `/api/reservations` : Création valide (201).
5. **POST** `/api/reservations` : Rejet si salle déjà occupée (Conflict 409).

#### Flux Complet (Frontend <-> API simulée)

1. **Login Flow** : Soumission du formulaire -> Appel API Supabase -> Redirection Dashboard.
2. **Booking Flow** : Sélection date/salle -> Soumission -> Mise à jour liste réservations.
3. **Cancel Flow** : Clic bouton Annuler -> Confirmation -> Disparition de l'élément dans la liste.
4. **Date Navigation** : Changement de date dans le calendrier -> Rafraîchissement des disponibilités.
5. **Error Handling** : Coupure réseau simulée -> Affichage Toast d'erreur ("Toaster").

---

## 3. Tests de Sécurité (Security Tests)

**Technologie** : Vitest (Scénarios d'attaque)
**Objectif** : Prévenir les failles critiques (OWASP).

### Cas de Tests Requis (Minimum 10) - Sécurité

#### Authentification & Autorisation

1. **Protection Route API** : Accès `/api/reservations` sans token -> 401.
2. **Protection Page** : Accès `/dashboard` sans session -> Redirection `/login`.

#### IDOR (Insecure Direct Object Reference)

1. **Delete Others** : Utilisateur A tente de supprimer réservation de l'Utilisateur B -> 403.
2. **View Others** : Utilisateur A tente de voir détails facture Utilisateur B -> 403.

#### Input Validation & Injection

1. **XSS dans Nom** : Création compte avec `<script>alert(1)</script>` -> Le script ne s'exécute pas.
2. **SQL Injection** : Payload `' OR 1=1 --` dans login -> Rejeté ou traité comme string littéral.
3. **Bad Data Types** : Envoi `dates: "invalid"` à l'API -> 400 Bad Request (Validation Zod).
4. **Negative Numbers** : Envoi `duration: -5` -> Rejeté.

#### Logique Métier

1. **Rate Limiting** (Simulé) : 100 requêtes/seconde sur Login -> Blocage IP temporaire (si implémenté) ou 429.
2. **Privilege Escalation** : Utilisateur standard tente accès endpoint Admin -> 403.

---

## 4. Tests de Performance (Performance Tests)

**Technologie** : k6 (Load Testing)
**Objectif** : Garantir la stabilité sous charge.

### Cas de Tests Requis (Minimum 10 Scénarios) - Performance

#### Load Testing (Charge Moyenne)

1. **Homepage** : 50 VUs (Users Virtuels) naviguent sur la home pendant 30s.
2. **API Get Rooms** : 20 VUs appellent `GET /api/rooms`.
3. **Dashboard Load** : 20 VUs chargent le dashboard (complet).

#### Stress Testing (Pic de Charge)

1. **Login Spike** : 100 VUs se connectent simultanément en 10s.
2. **Search Spike** : 200 recherches de salles simultanées.

#### Endurance Testing (Durée)

1. **Browsing** : 10 VUs naviguent en continu pendant 10 minutes (fuite mémoire ?).

#### Latency Checks

1. **API Response Time** : Vérifier que 95% des requêtes `/api/reservations` < 200ms.
2. **Static Assets** : Temps de chargement des images/CSS (simulé).

#### Scénarios Critiques

1. **Concurrent Booking** : 2 utilisateurs réservent la même salle au même moment (Race condition).
2. **Database Connection** : Comportement si 50 connexion simultanées à Supabase.

---

## Bonnes Pratiques pour les Développeurs

1. **Nommage** : `describe('Composant', () => { it('devrait faire ceci', () => ...) })`
2. **Arrange-Act-Assert** : Structurez vos tests clairement.
3. **Nettoyage** : Utilisez `beforeEach` et `afterEach` pour reset les mocks.
4. **Cohérence** : Utilisez les utilitaires de test fournis dans `src/test/setup.ts`.
