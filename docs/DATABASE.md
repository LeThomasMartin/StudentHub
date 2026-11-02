# Base de données StudentHub

## État de l'implémentation

Les premiers modèles Prisma implémentés sont `Semester` et `Course`. Un
semestre possède plusieurs cours; chaque cours doit référencer exactement un
semestre. Les dates de semestre sont stockées comme dates PostgreSQL (`DATE`),
les identifiants sont des UUID, et les noms de tables/colonnes suivent la
convention SQL snake_case. La migration initiale est
`add_semester_and_course`. Les autres entités décrites ci-dessous restent
planifiées et ne sont pas encore présentes dans le schéma Prisma.
La création de semestre est disponible depuis le module Cours; les dates sont
validées et la date de fin ne peut précéder la date de début.

## 1. Objectif

La base de données doit stocker les informations universitaires, les documents, les annotations, les éléments d'apprentissage et les conversations IA de façon fiable, structurée et évolutive.

## 2. Technologies

- PostgreSQL : base principale
- Prisma : gestion des modèles et des migrations
- pgvector : indexation vectorielle pour le RAG documentaire

## 3. Entités principales

### User

- id
- email
- passwordHash
- displayName
- createdAt
- updatedAt

### Course (implémenté)

- id (UUID)
- name
- code (facultatif)
- description (facultative)
- semesterId (UUID, obligatoire)
- createdAt
- updatedAt

### Semester (implémenté)

- id (UUID)
- name
- startDate
- endDate
- createdAt
- updatedAt

### ScheduleEvent

- id
- courseId
- userId
- title
- startDateTime
- endDateTime
- location
- recurrenceRule
- isRecurring
- type

### Task

- id
- userId
- courseId
- title
- description
- dueDate
- status
- priority

### Exam

- id
- userId
- courseId
- title
- date
- location
- notes

### Document

- id
- userId
- courseId
- folderId
- title
- fileName
- mimeType
- storagePath
- checksum
- importedAt
- lastIndexedAt
- pageCount
- status

### DocumentFolder

- id
- userId
- parentId
- name
- courseId

### Annotation

- id
- documentId
- userId
- pageNumber
- x
- y
- width
- height
- content
- type
- createdAt

### Flashcard

- id
- userId
- courseId
- documentId
- front
- back
- tags
- mastered
- createdAt

### StudySession

- id
- userId
- courseId
- startedAt
- endedAt
- focusArea
- score

### AIConversation

- id
- userId
- title
- createdAt
- updatedAt

### AIMessage

- id
- conversationId
- role
- content
- sources
- createdAt

## 4. Relations principales

- Un `User` a plusieurs `Course`.
- Un `Course` a plusieurs `ScheduleEvent`, `Task`, `Exam`, `Document`, `Flashcard` et `StudySession`.
- Un `Semester` contient plusieurs `Course`.
- Un `Document` peut appartenir à un `DocumentFolder` et à un `Course`.
- Un `Document` a plusieurs `Annotation`.
- Une `AIConversation` contient plusieurs `AIMessage`.

## 5. Schéma relationnel cible

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  label TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE courses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  semester_id UUID REFERENCES semesters(id),
  code TEXT,
  name TEXT NOT NULL,
  professor TEXT,
  color TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  folder_id UUID REFERENCES document_folders(id),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  checksum TEXT,
  imported_at TIMESTAMP NOT NULL,
  last_indexed_at TIMESTAMP,
  page_count INTEGER,
  status TEXT NOT NULL
);

CREATE TABLE document_folders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES document_folders(id),
  course_id UUID REFERENCES courses(id),
  name TEXT NOT NULL
);

CREATE TABLE annotations (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  user_id UUID REFERENCES users(id),
  page_number INTEGER,
  x INTEGER,
  y INTEGER,
  width INTEGER,
  height INTEGER,
  content TEXT,
  type TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE flashcards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  document_id UUID REFERENCES documents(id),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  tags TEXT[],
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources JSONB,
  created_at TIMESTAMP NOT NULL
);
```

## 6. Indexation documentaire et IA

Les documents peuvent être décomposés en segments et stockés avec leurs embeddings dans PostgreSQL via pgvector. Cela permet une récupération ciblée par le système RAG.

Les principes sont :

- garder les documents originaux intacts,
- stocker les métadonnées avec les documents,
- éviter les recalculs inutiles si l'empreinte d'un fichier n'a pas changé,
- conserver les références aux pages sources pour chaque réponse IA.

## 7. Bonnes pratiques

- Utiliser des UUID pour les identifiants principaux.
- Ajouter des timestamps pour les créations et modifications.
- Conserver les références de course, user et document dans chaque table pertinente.
- Prévoir des index sur `user_id`, `course_id`, `document_id` et les champs de recherche.
- Signaliser les documents modifiés ou réindexés.
- Associer les réponses IA à des références de documents claires.

## 8. Évolution attendue

La base de données évoluera avec les phases du projet : gestion de cours, agenda, PDF, apprentissage actif, mémorisation, puis IA locale avec indexation avancée.
