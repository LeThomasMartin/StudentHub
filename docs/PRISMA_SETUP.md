# Connexion PostgreSQL avec Prisma

Prisma ORM 7 est configuré dans `packages/database`. Aucun modèle métier n'est
défini pour l'instant. Prisma lit `DATABASE_URL` depuis le `.env` à la racine
du dépôt; ne jamais commiter ce fichier ou y mettre des secrets de production.

## Connexion locale

1. Installer/démarrer PostgreSQL (localement ou via un service géré) et créer
   une base nommée `studenthub` ainsi qu'un utilisateur dédié.
2. À la racine du dépôt, créer le fichier local `.env` à partir de l'exemple :

   ```powershell
   Copy-Item .env.example .env
   ```

3. Remplacer la valeur d'exemple de `DATABASE_URL` dans `.env` :

   ```dotenv
   DATABASE_URL=postgresql://UTILISATEUR:MOT_DE_PASSE@localhost:5432/studenthub?schema=public
   ```

   Remplacer les éléments en majuscules par les identifiants/configurations de
   votre serveur. Encoder les caractères réservés du mot de passe au format URL.
4. Installer les dépendances à la racine (`pnpm install`), puis valider et
   générer le client :

   ```powershell
   pnpm --filter @studenthub/database prisma:validate
   pnpm db:generate
   ```

La validation du schéma et la génération du client ne nécessitent pas un
serveur PostgreSQL joignable. La connexion réelle sera exercée par la première
migration ou requête, une fois les modèles définis. Ne lance pas encore
`prisma migrate dev` : le schéma n'a volontairement aucun modèle à migrer.

`DATABASE_URL` doit rester une variable serveur uniquement; ne pas la préfixer
par `NEXT_PUBLIC_`. Prisma Client emploie l'adaptateur PostgreSQL `pg`.
