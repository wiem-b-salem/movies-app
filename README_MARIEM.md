# Partie de Mariem : films, favoris, playlist et recherche

Ce document décrit ce que Mariem a réalisé sur la branche `mariem`, pour qu'Eya et Wiem puissent l'utiliser et l'intégrer à leurs parties.

**Technologies :** Ionic + Angular (TypeScript), Firebase Firestore, API TMDB.

---

## 1. Ce qui est terminé

| N° | Tâche | Statut |
|---|---|---|
| 1 | API TMDB et `MovieService` | Terminée |
| 2 | Page liste des films (cartes) | Terminée |
| 3 | Fusion des films TMDB et des films Firebase ajoutés par l'admin | Code terminé, test avec un vrai film Firebase en attente |
| 4 | Page détails d'un film | Terminée |
| 5 | Favoris (cœur sur les cartes et sur la page détails) | Terminée |
| 6 | Page « Ma playlist » | Terminée |
| 7 | Recherche et filtre (Tous / TMDB / Admin) | Terminée |

---

## 2. Lancer le projet

### Prérequis
- **Node.js 22.22.3 ou plus récent** (ou Node 24). Le projet utilise Angular 22, qui refuse les versions plus anciennes. Vérifier avec `node -v`.
- **Ionic CLI** : `npm install -g @ionic/cli`

### Étapes
```bash
git clone https://github.com/wiem-b-salem/movies-app.git
cd movies-app
git checkout mariem
npm install
```

### Clé API TMDB (obligatoire)
Le dépôt est public, donc la clé TMDB **n'est pas** sur GitHub. Chaque personne utilise sa propre clé (gratuite).

1. Créer une clé API (v3) sur **themoviedb.org** : Paramètres, puis API.
2. Copier `src/app/tmdb.config.example.ts` en `src/app/tmdb.config.ts`.
3. Remplacer le texte par votre clé :
```ts
export const TMDB_API_KEY = 'VOTRE_CLE_ICI';
```
Le fichier `tmdb.config.ts` est dans le `.gitignore` : il ne partira jamais sur GitHub.

### Démarrer
```bash
ionic serve
```
Pages à ouvrir : `localhost:8100/movies`, `localhost:8100/playlist`.

---

## 3. Fichiers ajoutés ou modifiés

### Services (`src/app/services/`)
| Fichier | Rôle |
|---|---|
| `movie.service.ts` | Demandes à TMDB (films populaires, recherche, détails). Convertit chaque film TMDB au format `Movie`. |
| `firebase-movie.service.ts` | Lit les films de la collection Firestore `movies` (tous, ou un seul par id). |
| `favorites.service.ts` | Lit, ajoute et retire des favoris dans Firestore. |
| `playlist.service.ts` | Transforme une liste d'ids favoris en liste de films complets. |

### Pages (`src/app/pages/`)
| Page | Route | Contenu |
|---|---|---|
| `movies` | `/movies` | Grille de films, barre de recherche, filtre, cœur favori |
| `movie-details` | `/movie-details/:id` | Affiche, titre, date, note, résumé, cœur favori |
| `playlist` | `/playlist` | Films favoris de l'utilisateur, retrait d'un film |

### Autres
- `src/main.ts` : ajout de `provideHttpClient()`.
- `src/app/tmdb.config.example.ts` : modèle du fichier de clé TMDB.
- `.gitignore` : ajout de `src/app/tmdb.config.ts`.

---

## 4. Données dans Firestore

### Identifiants de films (préfixés)
Chaque film a un identifiant unique avec un préfixe, comme dans `models/movie.model.ts` :
- `tmdb_550` : film venant de TMDB
- `fb_Ab12Cd` : film ajouté par l'admin dans Firestore (`fb_` + id du document)

### Collection `movies` (films ajoutés par l'admin)
Un document par film, avec ces champs :

| Champ | Type | Exemple |
|---|---|---|
| `title` | string | `Mon film` |
| `overview` | string | `Résumé du film` |
| `posterUrl` | string | `https://...` (peut être vide) |
| `releaseDate` | string | `2024-05-17` |
| `rating` | number | `8.5` |

Ne pas mettre de champ `id` : l'id du document Firestore est utilisé, et le préfixe `fb_` est ajouté par le code.

### Collection `favorites` (favoris des utilisateurs)
Un document par utilisateur. **L'id du document est l'`uid` de l'utilisateur.**

```
favorites
  └── <uid>
        └── movieIds: ["tmdb_550", "fb_Ab12Cd", ...]
```

---

## 5. Notes pour Eya (connexion)

- Les favoris et la playlist ont besoin de l'utilisateur connecté. Le code lit `onAuthStateChanged(auth, ...)` avec `auth` exporté par `src/app/firebase.ts`.
- **En attendant ta connexion**, un faux utilisateur est utilisé : la constante `TEST_UID = 'test-user-mariem'` dans ces trois fichiers :
  - `src/app/pages/movies/movies.page.ts`
  - `src/app/pages/movie-details/movie-details.page.ts`
  - `src/app/pages/playlist/playlist.page.ts`
- Quand ta connexion marche, préviens Mariem : il faudra remplacer `user?.uid ?? TEST_UID` par `user?.uid ?? null` dans ces trois fichiers.
- Après la connexion, merci de rediriger l'utilisateur vers **`/movies`**.

## 6. Notes pour Wiem (administration et matching)

- Ton formulaire `admin-add-movie` doit enregistrer les films dans la collection **`movies`**, avec les champs de la section 4.
- Pour le **matching**, lis la collection `favorites` : le champ `movieIds` contient des ids préfixés, uniques entre TMDB et Firebase, donc comparables directement.
- **Ignore ou supprime le document `favorites/test-user-mariem`**, c'est un faux utilisateur de test.
- Pour ouvrir un film depuis tes pages, utilise `[routerLink]="['/movie-details', movie.id]"`.
- Les **règles de sécurité Firestore** : si la base est en « mode test », elles expirent après 30 jours. À remplacer avant la validation. Les règles devront autoriser la lecture de `movies` et la lecture et l'écriture de `favorites/<uid>` pour l'utilisateur connecté.
- Mariem a besoin d'un accès à la console Firebase (ou d'un film de test dans `movies`) pour terminer le test de la tâche 3.

---

## 7. Remarques techniques

- Le projet n'utilise pas `zone.js`. Les pages utilisent des **signals** (`signal()`, `computed()`) pour que l'écran se mette à jour après une requête. À reprendre dans vos pages.
- Si Firestore ne répond pas, la page `/movies` affiche quand même les films TMDB.
- La recherche attend 0,5 seconde après la dernière lettre tapée avant de contacter TMDB.

---

## 8. Reste à faire

1. Tester avec un vrai film Firebase (tâche 3 et filtre « Admin »).
2. Remplacer l'utilisateur de test par la connexion d'Eya.
3. Fusionner les trois branches (`eya`, `mariem`, `wiem`) dans `main` et tester l'application complète.
