# Shoutout

Shoutout enables easier communication between childcare and production teams for churches while searching for parents during behavioral incidents.

Shoutout includes integrations with ProPresenter and Bitfocus Companion, allowing production staff to push child codes to screens in auditoriums and sanctuaries without interrupting slides/media volunteers.

## Getting Started

### Docker

Coming soonish(TM).

### Raspberry Pi Images

Coming kindasoonish(TM). Expecting hardware requirements to be a Raspberry Pi 4, 5, or Zero 2W. Strongly recommend a hardwired network connection.

### Run from source

Requires Node 22+. Strongly recommend running the SvelteKit server behind a proxy server like Nginx or Caddy.

```bash
nvm use 22
npm i
npm run db:push
npm run start
```

## Notes for administrators

### Backups

Server admins should make regular backups of the database (`local.db`) using specialized tools like [Litestream](https://litestream.io/) or [`sqlite3_rsync`](https://sqlite.org/rsync.html). Manually copying the database file or using traditional backup tools will not work if the server is currently running.

The database is used for authentication into the app, so user accounts will need to be recreated if the database is corrupted or lost.
