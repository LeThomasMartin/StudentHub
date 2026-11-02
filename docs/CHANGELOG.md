# Journal des modifications

## Publiée

- Ajout du module Cours : liste regroupée par semestre, création, modification et suppression avec confirmation.
- Ajout de la création de semestre avec validation des dates et intégration à la liste des cours.
- Ajout d'endpoints API serveur utilisant Prisma et validation Zod des entrées.
- Ajout d'états de chargement, d'erreur et de listes vides, avec tests de schémas et de service.
- Ajout de Zod, de lint Next.js et de l'exposition du package de base de données au web.
- Ajout des modèles Prisma `Semester` et `Course`, avec relation obligatoire un-à-plusieurs, UUID, dates PostgreSQL et conventions snake_case.
- Création et application de la migration `20261102221448_add_semester_and_course`; génération de Prisma Client 7.10.1.
- Préparation de Prisma ORM 7 dans `packages/database` avec PostgreSQL, configuration centralisée et client utilisant l'adaptateur `pg`.
- Ajout de `DATABASE_URL` documentée dans `.env.example`; aucun secret réel n'est inclus.
- Aucun modèle métier créé; les migrations ne sont pas encore initialisées.
- Ajout des instructions de connexion PostgreSQL dans `docs/PRISMA_SETUP.md`.

## Publiée

- Mise en place du monorepo pnpm et du socle Next.js/React/TypeScript.
- Création d'une première page d'accueil responsive en français.
- Ajout des configurations de base Next.js et TypeScript.
- Documentation des décisions technologiques, des règles de collaboration humain/IA et de l'ordre de livraison dans `docs/TECH_STACK.md`.
- Mise à jour de l'architecture et du README pour référencer les choix de fondation.
- Vérification des modifications avec `git diff --check`.
- Initialisation de la structure du projet.
- Ajout de la documentation de référence : plan directeur, architecture, base de données, directives IA et développement.
- Mise en place de l'organisation du dépôt et des dossiers de travail principaux.

ajout du script magicTape.py devras être intégré plus tard
