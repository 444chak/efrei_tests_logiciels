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

```bash
npx vitest run --coverage
```

*Le rapport sera généré dans le dossier `coverage/`.*

---

## 2. Lancer les Tests de Sécurité

Les tests de sécurité sont des tests d'intégration spécifiques situés dans `src/__tests__/security`.

Pour ne lancer **QUE** les tests de sécurité :

```bash
npx vitest security
```

*(Cela filtre les fichiers contenant "security" dans leur chemin).*

---

## 3. Lancer les Tests de Performance

Nous utilisons **k6** pour les tests de charge. Vous devez avoir k6 installé sur votre machine (<https://k6.io/docs/get-started/installation/>).

Script de test : `perf/load-test.js` (À créer selon la stratégie).

### Exécution

```bash
k6 run perf/load-test.js
```

### Exemple de script simple (k6)

Si le fichier n'existe pas encore, créez `perf/load-test.js` :

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('http://localhost:3000/api/rooms/booked');
  sleep(1);
}
```

---

## Résumé des Commandes

| Type de Test    | Commande                    | Description                           |
| --------------- | --------------------------- | ------------------------------------- |
| **Tous**        | `npx vitest run`            | Lance Unit, Integration, Security     |
| **Unitaires**   | `npx vitest src/components` | Lance uniquement les tests composants |
| **Sécurité**    | `npx vitest security`       | Lance les scénarios d'attaque         |
| **Performance** | `k6 run perf/script.js`     | Lance le test de charge (requiert k6) |
| **Couverture**  | `npx vitest run --coverage` | Affiche le % de code couvert          |
