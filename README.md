# Shoutout

Shoutout enables easier communication between childcare and production teams for churches while searching for parents during behavioral incidents. By integrating with ProPresenter via. Bitfocus Companion, child codes can be sent from Kids team to Production producer/director to screen without interrupting graphics and switching operators.

> [!IMPORTANT]
> This project under active development. Have your production director's cell phone on speed dial until version 1.0 is released.

Future releases aim to be compatible with Raspberry Pi 4/5/Zero 2W units, although most modern computers or virtual machines with at least 1 GB RAM will do just fine.

## Getting Started

### Production setup with Docker Compose

I strongly recommend running Shoutout behind a reverse proxy with HTTPS, like Caddy. A Caddyfile and Docker Compose setup are provided in this repo.

```caddyfile
shoutout.local { # <-- change to a local hostname of your choice, or your server's IP address
    tls internal

    reverse_proxy app:8080
}
```

> [!NOTE]
> Shoutout currently uses a local SSL/TLS certificate, which your browser will not trust by default. You will need to manually trust the certificate on each browser and device you use with Shoutout. This is common for locally-hosted software.

Install Docker Engine (Linux) or [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Mac/Win/Linux), clone this repo, and run:

```bash
docker compose up -d
```

Additionally, you can run the container without a reverse proxy using:

```bash
docker run -d -p 8080:8080 --name shoutout ghcr.io/zklosko/shoutout:latest
```

### Source

Clone this repo, install dependencies using Node 22 or later, and take it for a test drive. The database and admin login are created at first launch.

```bash
git clone https://github.com/zklosko/shoutout.git
nvm use 22
npm ci
npm run dev
```

See the [Companion setup guide](/docs/companion-setup.md) for integrating Shoutout with your Companion + ProPresenter setup.

## Documentation

Further documentation can be found in the [docs directory](/docs/).

## v1.0 Roadmap (subject to change)

- [x] Integration with ProPresenter via. Bitfocus Companion
- [ ] Multiple user accounts and user management
- [x] Ability to send messages to screen directly, bypassing the approval step
- [x] Setup script for fresh installs
- [ ] First user onbording
- [x] Docker ~~and/or Raspberry Pi~~ image for easy deployment
- [ ] Guides for users and systems administrators
