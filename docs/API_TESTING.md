# Tester les API Routes (Bruno / Postman)

Ce projet utilise Next.js App Router avec des routes API situées dans `src/app`.
Les routes sont protégées par l'authentification Supabase (Server-Side), ce qui nécessite l'envoi du cookie de session pour les tester avec des outils externes.

## Routes Disponibles

1. **GET** `/rooms`
   - **Description**: Récupère la liste des salles depuis la table `rooms`.
   - **Auth**: Requise (Cookie).
   - **URL**: `http://localhost:3000/rooms`

2. **GET** `/logout`
   - **Description**: Déconnecte l'utilisateur et redirige vers `/login`.
   - **Auth**: Requise (Cookie) pour avoir un effet.
   - **URL**: `http://localhost:3000/logout`

## Comment Tester avec Bruno / Postman

Puisque l'authentification dépend des cookies `HttpOnly` gérés par Supabase, vous devez extraire manuellement le cookie d'une session navigateur active.

### Étape 1 : Obtenir le Cookie de Session

1. Ouvrez votre navigateur et connectez-vous à l'application (`http://localhost:3000`).
2. Ouvrez les Outils de Développement (F12) -> Onglet **Application** (ou Storage).
3. Allez dans **Cookies** -> `http://localhost:3000`.
4. Cherchez un cookie dont le nom ressemble à `sb-[project-id]-auth-token` (ou parfois juste `token` selon la config, mais souvent préfixé `sb-`).
   - _Note : Avec `@supabase/ssr`, le cookie peut être une longue chaîne encodée._
   - Copiez la valeur complète du cookie (Nom + Valeur). Le format pour le header sera `nom=valeur;`.

### Étape 2 : Configurer Bruno / Postman

1. Créer une nouvelle requête **GET**.
2. URL : `http://localhost:3000/rooms`.
3. Allez dans l'onglet **Headers**.
4. Ajoutez une clé `Cookie`.
5. Collez la chaîne du cookie récupérée. Ex: `sb-xxxx-auth-token=votre_token_long_base64...;`
   - Astuce : Vous pouvez copier tous les cookies depuis l'onglet Network du navigateur (Req Header -> Cookie) pour être sûr.
6. Envoyez la requête. Vous devriez recevoir un JSON avec la liste des salles (ou un tableau vide `[]`).

### Étape 3 : Tester le Logout

- Notez que le endpoint `/logout` fait une redirection (`302`).
- Dans Bruno/Postman, si "Follow Redirects" est activé, vous verrez le contenu de la page de login HTML en réponse.
- Si vous désactivez "Follow Redirects", vous verrez le statut `302`.

---

## Alternative : Tester via le Navigateur

Pour les requêtes `GET` simples comme celles-ci, le plus simple reste souvent de :

1. Se connecter dans le navigateur.
2. Ouvrir un nouvel onglet.
3. Aller directement sur `http://localhost:3000/rooms`.
4. Le navigateur enverra automatiquement les cookies.
