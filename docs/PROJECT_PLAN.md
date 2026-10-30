# StudentHub — Plan directeur de développement

**Version :** 1.0  
**Statut :** Plan initial — avant développement  
**Dépôt :** GitHub / StudentHub  
**Objectif :** Créer un environnement numérique centralisé pour organiser les études, gérer les documents et optimiser l'apprentissage grâce à une intelligence artificielle personnelle.

---

# 1. Vision du projet

StudentHub sera une application web accessible depuis un ordinateur, une tablette ou un téléphone.

L'application réunira cinq grands systèmes :

1. Dashboard étudiant : calendrier, horaire, tâches, examens et progression.
2. Gestion documentaire : bibliothèque centralisée, organisation des cours et importation de documents.
3. Apprentissage interactif : PDF annotables, tap-to-reveal, flashcards, quiz et révision.
4. Assistant IA : assistant personnel qui comprend les documents, répond aux questions et génère du matériel pédagogique.
5. Infrastructure personnelle : synchronisation entre appareils, serveur IA local et accès distant sécurisé.

## Principes fondamentaux

- L'utilisateur reste propriétaire de ses données.
- Les documents originaux ne sont jamais modifiés.
- Les fonctionnalités essentielles doivent rester utilisables sans IA.
- L'IA doit pouvoir citer ses sources et les pages utilisées.
- L'application doit être modulaire pour permettre l'ajout de fonctionnalités.
- Les documents déjà indexés ne doivent pas être retraités inutilement.
- Le code doit être compréhensible et documenté pour faciliter le travail avec plusieurs IA de développement.

---

# 2. Architecture technique

## 2.1 Application principale

| Technologie | Utilisation |
| --- | --- |
| Next.js | Application web et routage |
| React | Interface utilisateur |
| TypeScript | Langage principal |
| Tailwind CSS | Design |
| PostgreSQL | Base de données |
| Prisma | ORM et gestion des données |
| PDF.js | Affichage et interaction avec les PDF |
| Auth.js | Authentification |
| GitHub | Gestion du code |

## 2.2 Infrastructure IA

| Technologie | Utilisation |
| --- | --- |
| Ollama | Hébergement des modèles locaux |
| Qwen3 8B | Premier modèle de langage à tester |
| Embeddings | Transformation des documents en représentations vectorielles |
| pgvector | Recherche sémantique dans PostgreSQL |
| RAG | Récupération ciblée de connaissances |
| OCR | Extraction de texte des documents numérisés |

Le gros PC (RTX 3060 12 Go, 32 Go RAM) servira de serveur IA. Le modèle pourra être remplacé ou amélioré sans devoir reconstruire l'application.

## 2.3 Infrastructure réseau

| Technologie | Rôle |
| --- | --- |
| GitHub | Synchronisation du code |
| Tailscale | Réseau privé entre les appareils |
| OpenSSH Server | Connexion distante au gros PC |
| VS Code Remote SSH | Programmer directement sur le gros PC |
| Ollama | Service IA accessible sur le réseau privé |
| Docker | Déploiement reproductible, à introduire progressivement |

Important : le port d'Ollama (11434) ne sera jamais exposé directement sur Internet. Les communications avec le serveur IA doivent passer par une API sécurisée.

---

# 3. Plan de développement

## Phase 0 — Préparation de l'environnement

### 0.1 Environnement de développement

- Installer Node.js et npm sur les deux machines.
- Installer Git.
- Créer le dépôt GitHub.
- Connecter les deux ordinateurs au dépôt.
- Installer VS Code.
- Configurer Settings Sync.
- Installer les extensions de développement.
- Vérifier les configurations Git sur les deux machines.
- Créer les conventions de développement.
- Créer les instructions permanentes pour les IA.

### 0.2 Connexion distante

- Installer Tailscale sur les deux ordinateurs.
- Connecter les deux appareils au même réseau privé.
- Installer OpenSSH Server sur le gros PC.
- Configurer l'accès SSH uniquement sur le réseau privé.
- Installer/configurer Remote SSH dans VS Code.
- Tester l'accès au gros PC depuis le laptop.
- Tester l'accès à Ollama depuis le laptop ultérieurement.

### 0.3 Serveur IA

- Installer Ollama sur le gros PC.
- Tester un modèle Qwen3 compatible avec les 12 Go de VRAM.
- Vérifier l'utilisation du GPU.
- Tester les performances.
- Préparer un service d'API interne sécurisé.

Livrable : deux environnements de développement fonctionnels et un gros PC accessible à distance.

---

## Phase 1 — Fondations de StudentHub

### 1.1 Structure du projet

Organiser le code en modules indépendants :

- Dashboard
- Agenda
- Courses
- Documents
- PDF Viewer
- Study Tools
- AI Assistant
- Settings
- Authentication

### 1.2 Base de données

Créer les premières entités :

- User
- Course
- Semester
- ScheduleEvent
- Task
- Exam
- Document
- DocumentFolder
- Annotation
- Flashcard
- StudySession
- AIConversation
- AIMessage

### 1.3 Fonctions fondamentales

- Créer un compte.
- Se connecter.
- Enregistrer les données.
- Modifier et supprimer les données.
- Organiser les informations par session et par cours.
- Préparer une interface responsive.

### 1.4 Interface générale

Créer :

- Barre latérale de navigation.
- Dashboard principal.
- Navigation entre les cours.
- Recherche globale.
- Menu de paramètres.
- Interface adaptée aux téléphones.

Livrable : une application fonctionnelle avec authentification, navigation et base de données.

---

## Phase 2 — Organisation étudiante

### 2.1 Gestion des cours

- Ajouter des cours.
- Associer un sigle, un nom, une session et un professeur.
- Organiser les documents par cours.
- Consulter les informations de chaque cours.
- Archiver les anciennes sessions.

### 2.2 Horaire

- Ajouter les cours récurrents.
- Définir les journées, heures et locaux.
- Afficher l'horaire hebdomadaire.
- Afficher les changements ponctuels.
- Importer un horaire depuis un fichier ICS ou CSV.
- Associer les événements à un cours.

### 2.3 Agenda

- Vue quotidienne, hebdomadaire et mensuelle.
- Ajouter des événements.
- Ajouter des examens et des remises.
- Ajouter des rappels.
- Gérer les tâches.
- Définir des échéances.
- Associer une tâche à un cours.
- Synchroniser les données entre appareils.

### 2.4 Dashboard

Afficher :

- Prochains cours.
- Prochains examens.
- Travaux à remettre.
- Tâches prioritaires.
- Progression des révisions.
- Derniers documents consultés.
- Rappels importants.

Livrable : un agenda étudiant complet et un tableau de bord personnalisé.

---

## Phase 3 — Bibliothèque documentaire

### 3.1 Gestion des fichiers

- Importer des PDF.
- Importer des fichiers Word et PowerPoint.
- Importer des images.
- Organiser les documents par cours.
- Créer des dossiers personnalisés.
- Ajouter des étiquettes.
- Rechercher des documents.
- Prévisualiser les fichiers.
- Conserver les versions précédentes.

### 3.2 Importation depuis Brio

Développer un système d'importation en plusieurs étapes.

Version initiale :

- Accès à Brio dans un navigateur.
- Téléchargement manuel des documents.
- Importation par glisser-déposer dans StudentHub.
- Détection des doublons.
- Association automatique ou manuelle avec un cours.

Version avancée :

- Étudier les possibilités d'intégration officielle.
- Vérifier l'existence d'une API ou d'un mécanisme d'exportation autorisé.
- Étudier une automatisation du navigateur avec authentification institutionnelle conservée.
- Détecter les nouveaux documents.
- Proposer leur importation.
- Éviter de télécharger à nouveau les fichiers inchangés.

Ne jamais enregistrer le mot de passe institutionnel en clair ou contourner les protections d'accès.

### 3.3 Indexation documentaire

- Extraire le texte.
- Identifier les pages.
- Détecter les titres.
- Reconnaître les tableaux lorsque possible.
- Effectuer de l'OCR pour les documents numérisés.
- Enregistrer les métadonnées.
- Calculer une empreinte du fichier pour identifier les modifications.

Livrable : une bibliothèque documentaire centralisée et consultable.

---

## Phase 4 — Lecteur PDF interactif

### 4.1 Lecteur PDF

- Navigation par pages.
- Zoom.
- Recherche textuelle.
- Sélection de texte.
- Signets.
- Annotations.
- Surlignage.
- Notes personnelles.
- Synchronisation des annotations.

### 4.2 Tap-to-Reveal

Fonctionnalité prioritaire.

L'utilisateur pourra sélectionner un mot, une phrase ou une structure anatomique et masquer son contenu.

Fonctionnement :

1. Sélectionner une zone de texte.
2. Créer un masque visuel.
3. Enregistrer la position du masque dans les coordonnées de la page.
4. Afficher une zone masquée.
5. Révéler le texte avec un clic ou un toucher.
6. Masquer de nouveau la réponse.

Fonctionnalités supplémentaires :

- Masquer plusieurs éléments.
- Révéler individuellement.
- Révéler toutes les réponses.
- Masquer des mots ou des paragraphes.
- Créer des ensembles de masques.
- Sauvegarder les masques par document.
- Réutiliser les masques lors de prochaines révisions.

Le PDF original reste intact.

### 4.3 Mode révision

- Masquer toutes les réponses.
- Révéler progressivement.
- Marquer une réponse comme connue ou inconnue.
- Transformer les éléments masqués en flashcards.
- Suivre les difficultés rencontrées.

Livrable : un lecteur PDF interactif avec tap-to-reveal.

---

## Phase 5 — Intelligence artificielle locale

### 5.1 Assistant IA

- Interface conversationnelle.
- Questions générales.
- Questions sur un cours.
- Questions sur un document précis.
- Explications simplifiées.
- Exemples cliniques ou pratiques.
- Comparaison de concepts.
- Réponses avec références aux pages sources.

### 5.2 RAG documentaire

Mettre en place un système de recherche augmentée par génération.

Processus :

1. Importation du document.
2. Extraction du texte.
3. Découpage en segments intelligents.
4. Création d'embeddings.
5. Enregistrement dans PostgreSQL avec pgvector.
6. Recherche des passages pertinents.
7. Transmission des passages au modèle.
8. Génération de la réponse avec citations.

Le modèle ne reçoit pas l'ensemble de la bibliothèque à chaque question.

### 5.3 Mémoire persistante et optimisation

Développer plusieurs niveaux de mémoire :

Mémoire documentaire :

- Texte extrait.
- Résumés par section.
- Résumés par chapitre.
- Embeddings.
- Métadonnées.
- Références aux pages.

Mémoire des cours :

- Concepts importants.
- Définitions.
- Relations entre les notions.
- Objectifs d'apprentissage.
- Liens entre plusieurs documents.

Mémoire des conversations :

- Résumés des conversations précédentes.
- Sujets abordés.
- Questions non résolues.
- Préférences de réponse.

Optimisation :

- Ne pas retraiter un fichier dont l'empreinte n'a pas changé.
- Réutiliser les embeddings existants.
- Mettre en cache les réponses réutilisables.
- Mettre à jour uniquement les sections modifiées.
- Utiliser des résumés hiérarchiques.
- Récupérer seulement les passages pertinents.
- Conserver les références aux sources originales.

Attention : le cache doit être invalidé lorsqu'un document change ou lorsqu'une réponse dépend d'informations devenues obsolètes.

### 5.4 Outils IA avancés

- Génération de flashcards.
- Génération de QCM.
- Explication de schémas.
- Comparaison de documents.
- Résumé de chapitres.
- Création de plans de révision.
- Identification des concepts difficiles.
- Assistant de révision personnalisé.

Livrable : un assistant IA local capable de travailler avec la bibliothèque documentaire.

---

## Phase 6 — Apprentissage et mémorisation

### 6.1 Flashcards

- Création manuelle.
- Création par IA.
- Association aux cours.
- Association aux documents.
- Importation et exportation.
- Catégorisation.

### 6.2 Répétition espacée

- Système de répétition espacée.
- Planification automatique.
- Évaluation du niveau de maîtrise.
- Adaptation des intervalles.
- Historique des révisions.

### 6.3 Quiz

- QCM.
- Vrai ou faux.
- Réponses courtes.
- Questions à développement.
- Questions générées à partir des documents.
- Correction expliquée.
- Références aux pages sources.

### 6.4 Suivi des connaissances

- Concepts maîtrisés.
- Concepts à revoir.
- Résultats par cours.
- Historique des erreurs.
- Progression dans le temps.

Livrable : un système complet d'apprentissage actif.

---

## Phase 7 — Optimisation et automatisation

Objectif : rendre StudentHub plus intelligent et réduire les tâches répétitives.

- Détection automatique de nouveaux documents.
- Classement assisté par IA.
- Extraction des dates d'examen et de remise.
- Suggestions d'événements dans l'agenda.
- Suggestions de révisions.
- Détection des notions souvent oubliées.
- Génération automatique de fiches de cours.
- Résumés de documents nouvellement importés.
- Notifications personnalisées.

Toutes les actions importantes doivent rester modifiables et confirmables par l'utilisateur.

---

## Phase 8 — Accessibilité multiplateforme et déploiement

### 8.1 Application Web

- Interface responsive.
- Compatible ordinateur, tablette et téléphone.
- Authentification sécurisée.
- Synchronisation des données.
- Sauvegardes automatiques.

### 8.2 PWA

- Possibilité d'installer StudentHub comme application.
- Icône sur l'écran d'accueil.
- Cache de certaines ressources.
- Consultation hors ligne de documents déjà téléchargés.
- Synchronisation différée lorsque la connexion revient.

### 8.3 Déploiement

- Environnement de développement.
- Environnement de test.
- Environnement de production.
- Déploiement automatisé.
- Sauvegarde de la base de données.
- Gestion des erreurs et des journaux.

### 8.4 Connexion au serveur IA personnel

- Connexion sécurisée au gros PC.
- Vérification de disponibilité du serveur.
- Gestion des requêtes.
- File d'attente lorsque plusieurs demandes arrivent.
- Gestion des erreurs si le PC est éteint.
- Possibilité d'utiliser une IA de remplacement si cette option est ajoutée ultérieurement.

Livrable : StudentHub accessible sur plusieurs appareils, avec accès à l'IA personnelle lorsque le serveur est disponible.

---

## Phase 9 — Sécurité, fiabilité et amélioration continue

- Chiffrement des communications.
- Gestion des permissions.
- Protection des documents privés.
- Protection contre les injections de prompt dans les documents.
- Sauvegardes et restauration.
- Tests automatisés.
- Tests de synchronisation.
- Journalisation des opérations.
- Gestion des versions des documents.
- Vérification des accès et des sessions.
- Documentation technique complète.

---

# 4. Architecture du système IA

Le système IA doit être indépendant du reste de l'application.

Flux recommandé :

Utilisateur → Application Web → API StudentHub → Service IA → Ollama → Modèle

Pour une question documentaire :

Utilisateur → API StudentHub → Recherche pgvector → Passages pertinents → Ollama → Réponse avec références

Le système doit conserver les résultats d'indexation pour éviter de retraiter inutilement les documents.

---

# 5. Organisation du code

Structure indicative à faire évoluer au fil des phases :

```text
StudentHub/
│
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       └── lib/
│
├── services/
│   └── ai/
│       ├── models/
│       ├── embeddings/
│       ├── indexing/
│       ├── retrieval/
│       └── api/
│
├── packages/
│   ├── database/
│   ├── shared/
│   └── types/
│
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── AI_GUIDELINES.md
│   ├── DEVELOPMENT.md
│   └── CHANGELOG.md
│
├── tests/
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

# 6. Méthode de travail avec les IA

Toutes les IA participant au développement doivent respecter les mêmes règles.

## Avant de modifier le code

1. Lire `README.md`.
2. Lire `PROJECT_PLAN.md`.
3. Lire `ARCHITECTURE.md`.
4. Lire les instructions de développement.
5. Examiner les fichiers concernés.
6. Comprendre les dépendances existantes.
7. Proposer une stratégie avant une modification majeure.

## Pendant le développement

- Une fonctionnalité à la fois.
- Éviter les modifications inutiles.
- Respecter l'architecture existante.
- Utiliser TypeScript.
- Ajouter des tests.
- Documenter les décisions importantes.
- Ne jamais supprimer une fonctionnalité sans justification.
- Ne jamais modifier les fichiers `.env` ou les secrets sans autorisation.

## Après chaque fonctionnalité

1. Vérifier que le code compile.
2. Exécuter les tests.
3. Corriger les erreurs.
4. Mettre à jour la documentation.
5. Résumer les fichiers modifiés.
6. Décrire les éventuels problèmes.
7. Préparer un commit Git clair.

## Gestion Git

- `main` : version stable.
- `develop` : intégration des fonctionnalités.
- `feature/nom-fonctionnalite` : développement indépendant.
- Chaque fonctionnalité importante doit passer par une Pull Request.
- Éviter de modifier simultanément les mêmes fichiers sur les deux ordinateurs.

---

# 7. Priorités de développement

Ordre de priorité recommandé :

1. Infrastructure et environnement.
2. Architecture et base de données.
3. Authentification et interface.
4. Gestion des cours et agenda.
5. Bibliothèque documentaire.
6. Lecteur PDF.
7. Tap-to-reveal.
8. IA locale et RAG.
9. Flashcards et quiz.
10. Automatisation Brio.
11. Optimisation de l'IA.
12. Déploiement multiplateforme avancé.

L'ordre pourra être adapté aux difficultés techniques et aux besoins réels.

---

# 8. Définition du succès

StudentHub sera considéré comme une première version complète lorsque l'utilisateur pourra :

- Se connecter depuis plusieurs appareils.
- Organiser ses cours et son horaire.
- Gérer son agenda et ses examens.
- Importer et retrouver ses documents.
- Consulter un PDF.
- Masquer et révéler des éléments dans un PDF.
- Poser des questions à son assistant IA.
- Obtenir des réponses fondées sur ses documents.
- Générer des flashcards et des quiz.
- Réviser avec répétition espacée.
- Retrouver ses données et ses annotations sur ses autres appareils.
- Accéder à son IA personnelle lorsque son gros PC est en ligne.

Vision à long terme : StudentHub doit devenir un environnement d'apprentissage personnel dans lequel l'organisation, les documents, la mémorisation et l'intelligence artificielle fonctionnent ensemble plutôt que comme des outils indépendants.
