# Kem's Points

Application Next.js exécutée avec [Deno](https://deno.com).

## Démarrage

```bash
deno install
deno task dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `deno task dev` : serveur de développement
- `deno task build` : build de production
- `deno task start` : serveur de production
- `deno task lint` : ESLint

## Docker

L'app est compilée et exécutée avec `denoland/deno:2.9.7`, derrière un reverse-proxy [Caddy](https://caddyserver.com).

```bash
docker compose up -d --build
```

La configuration se fait dans un fichier `.env` à la racine, lu par `docker compose` (il n'est pas versionné).

| Variable       | Défaut | Rôle                                                                                                 |
| -------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `LAN_ADDRESS`  | —      | IP de la machine sur le réseau local, utilisée dans le QR code quand l'écran est ouvert via `localhost` |
| `SITE_ADDRESS` | `:80`  | Adresse servie par Caddy ; avec un nom de domaine, Caddy active le HTTPS automatiquement             |
| `HTTP_PORT`    | `80`   | Port HTTP exposé sur l'hôte                                                                          |
| `HTTPS_PORT`   | `443`  | Port HTTPS exposé sur l'hôte                                                                         |

### Dev : Docker sur sa machine, en réseau local

```ini
LAN_ADDRESS=192.168.1.10
HTTP_PORT=8080
HTTPS_PORT=8443
```

- `LAN_ADDRESS` : IP de la machine sur le réseau local (`ipconfig`, carte Ethernet ou Wi-Fi), sinon le QR code pointe vers l'IP interne du conteneur
- `HTTP_PORT` / `HTTPS_PORT` : à changer seulement si `80` / `443` sont déjà utilisés sur la machine

Ouvrir [http://localhost:8080](http://localhost:8080) ; les téléphones connectés au même réseau rejoignent la partie en scannant le QR code.

Sans Docker (`deno task dev`), aucun `.env` n'est nécessaire : l'IP locale est détectée automatiquement.

### Prod : serveur avec un nom de domaine

```ini
SITE_ADDRESS=kems.example.com
```

- Le domaine doit pointer (enregistrement DNS `A` / `AAAA`) vers l'IP publique du serveur
- Les ports `80` et `443` doivent être libres et ouverts : Caddy s'en sert pour obtenir le certificat Let's Encrypt et rediriger le HTTP vers le HTTPS, donc ne pas définir `HTTP_PORT` / `HTTPS_PORT`
- `LAN_ADDRESS` est inutile : le QR code utilise le nom de domaine
- Les certificats sont stockés dans le volume `caddy_data` : éviter `docker compose down -v`, qui le supprime

Les parties sont gardées en mémoire : redémarrer le conteneur `app` les efface.
