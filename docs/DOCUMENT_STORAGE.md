# Stockage des documents

StudentHub conserve les fichiers hors du dépôt Git et leurs métadonnées dans
PostgreSQL. Le binaire n'est jamais stocké dans la base.

## Configuration du PC hôte

Définir dans le `.env` local du PC de bureau :

```dotenv
STUDENTHUB_STORAGE_ROOT="D:\StudentHubData"
```

Le dossier doit exister et être accessible en lecture/écriture par le compte
Windows qui lance StudentHub. L'application crée ensuite
`documents\<UUID>\original.<extension>` dans ce dossier. Les fichiers temporaires
et renommages de suppression restent sur le même volume pour permettre des
opérations atomiques.

Ne pas synchroniser ni commiter le contenu de ce dossier. Le portable doit
utiliser l'API du StudentHub lancé sur le PC de bureau via Tailscale; le stockage
physique n'est pas publié directement sur le réseau.

## API MVP

- `POST /api/documents` : multipart `file`, avec `name` et `courseId` facultatifs.
- `GET /api/documents` : liste, filtrable avec `?courseId=<uuid>`.
- `GET /api/documents/<uuid>` : métadonnées.
- `GET /api/documents/<uuid>/content` : téléchargement.
- `DELETE /api/documents/<uuid>` : suppression du fichier et des métadonnées.

Extensions autorisées : `.pdf`, `.doc`, `.docx`, `.one`. La taille maximale est
de 25 Mio. Le SHA-256 est calculé côté serveur. Le chemin conservé en base est
relatif et n'est jamais construit à partir du nom d'origine.

## Accès réseau

Le lanceur Next.js (`pnpm dev` et `pnpm start`) lit aussi
`STUDENTHUB_BIND_HOST` et `STUDENTHUB_PORT` depuis le `.env` à la racine. Par
défaut, il n'écoute que sur `127.0.0.1`. Il refuse les adresses générales et
n'accepte comme autre adresse qu'une IPv4 Tailscale dans `100.64.0.0/10`.

Pour l'accès du portable, configurer sur le bureau son IP Tailscale actuelle et
limiter la règle entrante Windows au port choisi, à l'adresse Tailscale du
bureau et à celle du portable. Ne pas créer de redirection de port Internet.
Le serveur ne doit pas écouter sur l'adresse Wi-Fi/Ethernet ou sur
`0.0.0.0`.

Avec les adresses actuelles, la règle entrante à créer dans PowerShell
**administrateur** est :

```powershell
New-NetFirewallRule `
  -DisplayName "StudentHub via Tailscale depuis le portable" `
  -Direction Inbound -Action Allow -Protocol TCP `
  -LocalPort 3000 -LocalAddress 100.123.29.126 `
  -RemoteAddress 100.88.146.22 -Profile Any `
  -EdgeTraversalPolicy Block
```

Cette règle est limitée aux deux adresses Tailscale et au port de StudentHub;
elle n'autorise pas les autres clients. Si l'adresse Tailscale du portable
change, mettre à jour la portée distante.

Ces routes ne fournissent pas d'authentification applicative. L'accès via
Tailscale et une règle pare-feu ciblée réduit l'exposition réseau, mais ne
remplace pas l'authentification; il faut l'ajouter avant une utilisation
permanente.
