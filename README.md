# Shoutout

Shoutout enables easier communication between childcare and production teams for churches while searching for parents during behavioral incidents. By integrating with ProPresenter via. Bitfocus Companion, child codes can be sent from Kids team to Production producer/director to screen without interrupting graphics and switching operators.

> [!IMPORTANT]
> This project under active development. Have your production director's cell phone on speed dial until version 1.0 is released.

Future releases aim to be compatible with Raspberry Pi 4/5/Zero 2W units, although most modern computers or virtual machines with at least 1 GB RAM will do just fine.

## Getting Started

Clone this repo, install dependencies using Node 22 or later, and take it for a test drive. The database and admin login are created at first launch.

```bash
git clone https://github.com/zklosko/shoutout.git
nvm use 22
npm ci
npm run dev
```

## Documentation

Further documentation can be found in the [docs directory](/docs/).

## v1.0 Roadmap (subject to change)

- [ ] Integration with ProPresenter via. Bitfocus Companion
- [ ] Multiple user accounts and user management
- [ ] Setup script or wizard for fresh installs
- [ ] NPX installer and/or Raspberry Pi image for easy deployment
- [ ] Guides for users and systems administrators
