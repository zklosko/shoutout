# Notes for administrators

## Backups

Server admins should make regular backups of the database (`local.db`) using specialized tools like [Litestream](https://litestream.io/) or [`sqlite3_rsync`](https://sqlite.org/rsync.html). Manually copying the database file or using traditional backup tools will not work if the server is currently running.
