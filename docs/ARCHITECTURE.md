# Architecture technique de StudentHub

> Mise à jour de fondation : voir `TECH_STACK.md` pour les choix retenus,
> différés et l'ordre de livraison.

## 1. Vue d'ensemble

StudentHub est une application web centrée sur l'organisation étudiante et l'apprentissage personnel. Elle associe une interface web moderne, une base de données fiable, un système documentaire central, et un assistant IA local capable de répondre à partir des documents de l'utilisateur.

L'architecture est pensée pour rester modulaire : l'application principale, les services IA et les ressources périphériques sont découplés et évoluent séparément.

## 2. Composants principaux

### 2.1 Application principale

- Next.js : application web et routage
- React : interface utilisateur
- TypeScript : langage principal
- Tailwind CSS : style et composants d'interface
- Prisma : gestion des données et accès à PostgreSQL
- PDF.js : lecture et interactions sur les fichiers PDF
- Auth.js : authentification
- GitHub : gestion du code et collaboration

### 2.2 Infrastructure IA

- Ollama : exécution locale des modèles de langage
- Qwen3 8B : premier modèle de test
- Embeddings : conversion des documents en représentations vectorielles
- pgvector : recherche sémantique dans PostgreSQL
- RAG : récupération ciblée des connaissances
- OCR : extraction de texte depuis documents numérisés

Le gros PC (RTX 3060 12 Go, 32 Go RAM) sert de serveur IA local. Le modèle peut être remplacé ou amélioré sans devoir reconstruire entièrement l'application.

### 2.3 Infrastructure réseau

- GitHub : synchronisation du code
- Tailscale : réseau privé entre appareils
- OpenSSH Server : accès distant au gros PC
- VS Code Remote SSH : développement sur machine distante
- Ollama : service IA accessible sur le réseau privé
- Docker : déploiement reproductible, à introduire progressivement

Important : le port d'Ollama (11434) ne doit pas être exposé directement sur Internet. Les échanges passent par une API sécurisée.

## 3. Architecture fonctionnelle

### 3.1 Modules applicatifs

- Dashboard étudiant
- Agenda et calendrier
- Gestion des cours et semestres
- Gestion documentaire
- PDF interactif
- Outils d'apprentissage (flashcards, quiz, répétition)
- Assistant IA
- Paramètres et compte utilisateur

### 3.2 Flux de données

Le système suit un flux simple :

1. L'utilisateur interagit avec l'application web.
2. L'application enregistre ou récupère des données dans PostgreSQL.
3. Les documents importés sont analysés, indexés et vectorisés.
4. Le service IA récupère les passages pertinents via RAG.
5. Le modèle produit une réponse fondée sur les sources.
6. Les résultats sont renvoyés à l'utilisateur avec références et contexte.

### 3.3 Flux IA recommandé

Utilisateur → Application Web → API StudentHub → Service IA → Ollama → Modèle

Pour une question documentaire :

Utilisateur → API StudentHub → Recherche pgvector → Passages pertinents → Ollama → Réponse avec citations

## 4. Structure du dépôt

```text
StudentHub/
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       └── lib/
├── services/
│   └── ai/
│       ├── models/
│       ├── embeddings/
│       ├── indexing/
│       ├── retrieval/
│       └── api/
├── packages/
│   ├── database/
│   ├── shared/
│   └── types/
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── AI_GUIDELINES.md
│   ├── DEVELOPMENT.md
│   └── CHANGELOG.md
├── tests/
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── .git
```

## 5. Découpage logique

- Couches d'interface : navigation, dashboard, agenda, PDF, paramètres
- Couches applicatives : logique métier et gestion des données
- Couches IA : embeddings, indexing, retrieval, mémoire, génération
- Couches infrastructure : réseau privé, accès distant, stockage et services

## 6. Considérations de sécurité

- Les communications doivent être sécurisées.
- Les secrets ne doivent pas être stockés dans le dépôt.
- L'accès à l'IA locale ne doit pas être public.
- Les documents privés doivent être protégés.
- Les réponses IA doivent citer leurs sources.
- Les prompts et les documents ne doivent pas permettre d'exécuter des instructions non contrôlées.

## 7. Principes architecturaux

- L'utilisateur reste propriétaire de ses données.
- Les fichiers originaux ne sont pas modifiés.
- Les fonctionnalités essentielles doivent rester disponibles sans IA.
- Les documents indexés ne doivent pas être retraités inutilement.
- Les résultats d'indexation doivent être réutilisés autant que possible.
- Le système doit rester extensible pour ajouter de nouvelles fonctionnalités.

## 8. Objectif de l'architecture

L'architecture vise à proposer un environnement d'apprentissage personnel où les tâches académiques, les documents, la mémorisation et l'assistance intelligente fonctionnent comme un seul système cohérent, fiable et sécurisé.
