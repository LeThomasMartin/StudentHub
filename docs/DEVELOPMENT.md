# Développement StudentHub

## 1. Objectif

Ce document décrit les outils, la configuration et les bonnes pratiques pour développer StudentHub dans un environnement local ou distant.

## 2. Prérequis

- Node.js et npm
- Git
- VS Code
- Deux machines de travail : laptop + gros PC
- Tailscale
- OpenSSH Server sur le gros PC
- PostgreSQL
- Ollama
- GitHub

## 3. Configuration initiale

### Environnement de développement

- Installer Node.js et npm sur les deux machines.
- Installer Git et configurer les identités.
- Créer le dépôt GitHub.
- Connecter les deux ordinateurs au dépôt.
- Installer VS Code.
- Configurer Settings Sync.
- Installer les extensions de développement utiles.
- Vérifier les configurations Git sur les deux machines.
- Définir les conventions de code et les fichiers d'instructions permanentes pour les IA.

### Connexion distante

- Installer Tailscale sur les machines.
- Connecter les appareils au même réseau privé.
- Installer OpenSSH Server sur le gros PC.
- Configurer l'accès SSH uniquement sur le réseau privé.
- Configurer VS Code Remote SSH.
- Tester l'accès au gros PC depuis le laptop.
- Tester l'accès à Ollama depuis le laptop plus tard.

### Serveur IA local

- Installer Ollama sur le gros PC.
- Tester un modèle compatible avec 12 Go de VRAM.
- Vérifier l'utilisation du GPU.
- Tester les performances du modèle.
- Préparer un service d'API interne sécurisé.

## 4. Workflow de développement

### Branches Git

- `main` : version stable.
- `develop` : intégration des fonctionnalités.
- `feature/nom-fonctionnalite` : développement indépendant.

### Règles de contribution

- Travailler par fonctionnalité.
- Éviter les modifications simultanées des mêmes fichiers sur plusieurs machines.
- Faire passer les changements importants par une Pull Request.
- Maintenir la documentation à jour.
- Vérifier le code avant de rendre la fonctionnalité.

## 5. Standards de qualité

- Utiliser TypeScript.
- Ajouter des tests pour les changements fonctionnels.
- Vérifier le code avant validation.
- Éviter les changements inutiles.
- Respecter l'architecture existante.
- Documenter les choix technologiques ou fonctionnels importants.

## 6. Vérification locale

Avant de considérer une fonctionnalité complète :

1. Vérifier que le code compile.
2. Exécuter les tests.
3. Corriger les erreurs.
4. Mettre à jour la documentation.
5. Résumer les fichiers modifiés.
6. Décrire les éventuels problèmes.
7. Préparer un commit Git clair.

## 7. Sécurité et environnement

- Ne pas exposer Ollama directement sur Internet.
- Ne pas stocker de secrets dans le dépôt.
- Passer par une API sécurisée entre le client et le serveur IA.
- Protéger les documents privés et les conversations utilisateur.

## 8. Évolution attendue

Le projet passera par plusieurs phases :

- préparation de l'environnement,
- fondations applicatives,
- organisation étudiante,
- gestion documentaire,
- PDF interactif,
- IA locale,
- apprentissage actif,
- automatisation,
- déploiement et accessibilité multiplateforme.

## 9. Critère de réussite

Le projet est considéré comme une première version complète lorsque l'utilisateur peut :

- se connecter depuis plusieurs appareils,
- organiser ses cours et son horaire,
- gérer son agenda et ses examens,
- importer et retrouver ses documents,
- consulter des PDF,
- masquer et révéler des éléments dans un PDF,
- poser des questions à son assistant IA,
- obtenir des réponses fondées sur ses documents,
- générer des flashcards et des quiz,
- réviser avec répétition espacée,
- retrouver ses données et annotations sur ses autres appareils.
