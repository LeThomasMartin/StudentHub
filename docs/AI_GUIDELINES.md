# Directives de développement StudentHub

Ce document établit les règles de travail pour toute IA et tout contributeur impliqué dans le développement de StudentHub.

## 1. Règles générales

- Lire le README, le plan directeur, l'architecture et les instructions de développement avant toute modification.
- Évaluer les dépendances et les impacts avant d'éditer le code.
- Travailler une fonctionnalité à la fois.
- Éviter les changements inutiles et les refactorisations de confort.
- Respecter l'architecture existante et les conventions de codage.
- Utiliser TypeScript pour les éléments applicatifs.
- Ajouter des tests pour toute nouvelle fonctionnalité ou correction significative.
- Documenter les décisions importantes et les changements fonctionnels majeurs.
- Ne pas supprimer une fonctionnalité sans justification claire.
- Ne pas modifier les fichiers `.env` ou les secrets sans autorisation explicite.

## 2. Avant de modifier le code

1. Lire `README.md`.
2. Lire `docs/PROJECT_PLAN.md`.
3. Lire `docs/ARCHITECTURE.md`.
4. Lire les consignes de développement du projet.
5. Examiner les fichiers concernés.
6. Comprendre les dépendances existantes.
7. Proposer une stratégie avant une modification majeure.

## 3. Pendant le développement

- Une fonctionnalité à la fois.
- Éviter les modifications inutiles.
- Respecter l'architecture existante.
- Utiliser TypeScript.
- Ajouter des tests.
- Documenter les décisions importantes.
- Ne jamais supprimer une fonctionnalité sans justification.
- Ne jamais modifier les fichiers `.env` ou les secrets sans autorisation.

## 4. Après chaque fonctionnalité

1. Vérifier que le code compile.
2. Exécuter les tests.
3. Corriger les erreurs.
4. Mettre à jour la documentation.
5. Résumer les fichiers modifiés.
6. Décrire les éventuels problèmes.
7. Préparer un commit Git clair.

## 5. Gestion Git

- `main` : version stable.
- `develop` : intégration des fonctionnalités.
- `feature/nom-fonctionnalite` : développement indépendant.
- Chaque fonctionnalité importante doit passer par une Pull Request.
- Éviter de modifier simultanément les mêmes fichiers sur deux ordinateurs.

## 6. Philosophie de conception

StudentHub est pensé comme un environnement personnel d'apprentissage qui combine organisation, documents, mémorisation et intelligence artificielle. Les outils IA doivent rester utiles, explicables et basés sur des sources vérifiables.

Les principes fondamentaux sont :

- L'utilisateur reste propriétaire de ses données.
- Les documents originaux ne sont jamais modifiés.
- Les fonctionnalités essentielles restent utilisables sans IA.
- L'IA doit pouvoir citer ses sources et les pages utilisées.
- L'application doit rester modulaire.
- Les documents déjà indexés ne doivent pas être retraités inutilement.
- Le code doit être lisible et bien documenté, surtout dans un contexte où plusieurs IA collaborent.

## 7. Rôles des composants

- Web app : interface utilisateur, gestion de l'expérience académique.
- Base de données : stockage fiable des cours, tâches, documents et conversations.
- IA locale : traitement des documents, RAG, génération de contenu et révision.
- Services réseau : accès distant sécurisé, gestion de l'API IA, synchronisation.

## 8. Sécurité et confiance

- Les communications entre appareils doivent être sécurisées.
- Les secrets doivent rester hors du dépôt.
- Les documents privés doivent être protégés.
- Les documents fournis à l'IA doivent être traités dans un cadre de confiance et de traçabilité.
- Les réponses IA doivent citer les sources et les pages utilisées.

## 9. Critères de validation

Une fonctionnalité est considérée comme prête lorsque :

- elle est testée,
- elle est documentée,
- elle est conforme à l'architecture,
- elle est compatible avec le flux de développement,
- elle n'introduit pas de régression majeure.

