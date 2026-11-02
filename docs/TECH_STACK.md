# Décisions technologiques

**Mise à jour : 2 novembre 2026 — fondation, choix révisables**

Les outils sont choisis pour être accessibles aux développeurs et agents IA,
testables localement et introduits quand une fonctionnalité en dépend.

| Domaine | Choix | Statut et raison |
| --- | --- | --- |
| Langage | TypeScript strict | Retenu; contrats client/serveur explicites. |
| Runtime | Node.js 22+ | Retenu; version à épingler dans CI. |
| Monorepo | pnpm workspaces | Retenu; dépendances et packages contrôlés. |
| Web | Next.js App Router, React | Retenu; interface responsive et serveur intégré. |
| UI | CSS natif au départ; Tailwind à décider avec le design system | Évite une dépendance visuelle prématurée. |
| Validation | Zod | Retenu et utilisé pour valider les entrées du module Cours. |
| Base | PostgreSQL | Retenu pour relations et évolution vers pgvector. |
| ORM/migrations | Prisma | Retenu provisoirement; valider pgvector avant le RAG. |
| Auth | Auth.js | À introduire avec le premier flux utilisateur persistant. |
| Tests | Vitest; Playwright pour parcours navigateur | Vitest retenu; Playwright avec les parcours UI. |
| IA locale | Ollama derrière un adaptateur serveur privé | Direction retenue; modèle à évaluer sur le matériel cible. |
| Recherche RAG | PostgreSQL + pgvector envisagé | Différé jusqu'à un prototype évalué. |
| Fichiers/OCR | Stockage privé et extracteurs à sélectionner | Différé selon les formats; originaux immuables, pages citées. |
| Déploiement | Docker lorsque les services requis sont établis | Différé pour ne pas figer l'exploitation trop tôt. |

## Collaboration humain + IA

- Une tâche annonce le périmètre, les interfaces touchées et les tests attendus.
- Une branche `feature/<sujet>` par changement; PR relue avant intégration.
- Les décisions partagées sont inscrites ici, pas seulement dans des prompts.
- Une responsabilité a une source de vérité; pas de types dupliqués entre web/API/IA.
- Ne pas toucher aux secrets ou données réelles; justifier les dépendances majeures.
- Les changements de schéma sont migrés et relus. La CI ne dépend pas d'Ollama.
- Chaque PR vérifie lint, types, tests et build.

## Architecture et ordre de livraison

Les règles métier vivent dans les modules fonctionnels (cours, agenda,
documents, apprentissage), pas dans les composants React. L'IA est appelée
uniquement côté serveur derrière un adaptateur remplaçable. On n'introduit pas
de microservices déployables, d'authentification fictive ni de schéma complet
avant d'avoir des cas d'usage concrets.

1. Fondation web, conventions et vérifications automatisées.
2. Vertical slice sans IA : créer/lister un cours, validation, PostgreSQL, tests.
3. Authentification, propriété des données et autorisations.
4. Semestres, tâches, examens et agenda.
5. Import documentaire, stockage privé, checksum et extraction testable.
6. Lecteur PDF, annotations et tap-to-reveal.
7. Prototype RAG : extraction → segments paginés → embeddings → retrieval évalué.
8. Adaptateur Ollama et assistant avec citations, timeouts et mode dégradé.
9. Flashcards, quiz, répétition espacée; automatisations avec confirmation humaine.
10. Durcissement, sauvegardes, PWA et déploiement.

Chaque phase livre un parcours utilisable et vérifié avant d'élargir le schéma.
