# Guide d'Exécution des Tests

Ce document explique comment lancer les différentes suites de tests du projet **EasyBooking**.

## Prérequis

Assurez-vous d'avoir installé les dépendances :

```bash
npm install
```

---

## 1. Lancer les Tests Unitaires & Intégration

Nous utilisons **Vitest** pour ces tests. Ils sont situés dans `src/` (fichiers `*.test.ts` ou `*.test.tsx`).

### Commande Rapide

Pour lancer tous les tests (One-shot) :

```bash
npm run test
# ou directement
npx vitest run
```

### Mode Watch (Développement)

Pour lancer les tests en continu pendant que vous développez :

```bash
npx vitest
```

### Filtrer les tests

Pour ne lancer que les tests d'un fichier spécifique (ex: Navbar) :

```bash
npx vitest Navbar
```

### Couverture de Code (Coverage)

Pour générer un rapport de couverture :

````bash
```bash
npm run coverage
````

_Le rapport sera généré dans le dossier `coverage/`._

---

## 2. Lancer les Tests de Sécurité

Les tests de sécurité sont des tests d'intégration spécifiques situés dans `src/__tests__/security`.

Pour ne lancer **QUE** les tests de sécurité :

```bash
npx vitest security
```

_(Cela filtre les fichiers contenant "security" dans leur chemin)._

---

## 3. Lancer les Tests de Performance

Nous utilisons **k6** pour les tests de charge.

### Installation de K6

* **Windows (Winget)** : `winget install k6`
* **Windows (Choco)** : `choco install k6`
* **Mac** : `brew install k6`
* **Linux** : `sudo apt-get install k6` ou via snap

### Exécution du Script

Le script complet (10 scénarios) est situé dans : `src/__tests__/perf/script.js`.

```bash
k6 run src/__tests__/perf/script.js
```

### Scénarios Couverts

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

---

## Résumé des Commandes

| Type de Test    | Commande                              | Description                           |
| --------------- | ------------------------------------- | ------------------------------------- |
| **Tous**        | `npm run test`                        | Lance Unit, Integration, Security     |
| **Unitaires**   | `npx vitest src/components`           | Lance uniquement les tests composants |
| **Sécurité**    | `npx vitest security`                 | Lance les scénarios d'attaque         |
| **Performance** | `k6 run src/__tests__/perf/script.js` | Lance le test de charge (requiert k6) |
| **Couverture**  | `npm run coverage`                    | Affiche le % de code couvert          |
