# Shoutout

Shoutout enables easier communication between childcare and production teams for churches while searching for parents during behavioral incidents. By integrating with ProPresenter via. Bitfocus Companion, child codes can be sent from Kids team to Production producer/director to screen without interrupting graphics and switching operators.

> [!IMPORTANT]
> This project under active development. Have your production director's cell phone on speed dial until version 1.0 is released.

Future releases aim to be compatible with Raspberry Pi 4/5/Zero 2W units, although most modern computers or virtual machines with at least 1 GB RAM will do just fine.

## Getting Started

Clone this repo and install dependencies using Node 22 or later.

```bash
git clone https://github.com/zklosko/shoutout.git
nvm use 22
npm ci
```

Shoutout requires an admin account to change settings or approve/reject requests. The setup process is manual while the project is in early stages of development.

1. Create a `.env` file in the repo's directory with the following:

```env
DB_FILE_NAME=file:local.db
AUTH_USER=admin  # <-- replace with your desired username
AUTH_PASS_HASH=
```

2. Generate the password hash for your admin user with `npm run gen-password <yourpassword>`. Paste the long string into your `.env` file next to `AUTH_PASS_HASH=`.
3. Generate a session key using `npm run gen-session-key` on Mac, Linux, or WSL, or `npm run gen-session-key-windows` on Windows.

Run the server using `npm run dev`. The database will automatically populate on first run.

## Documentation

Further documentation can be found in the [docs directory](/docs/).

## v1.0 Roadmap (subject to change)

- [ ] Integration with ProPresenter via. Bitfocus Companion
- [ ] Multiple user accounts and user management
- [ ] Setup script or wizard for fresh installs
- [ ] NPX installer and/or Raspberry Pi image for easy deployment
- [ ] Guides for users and systems administrators
