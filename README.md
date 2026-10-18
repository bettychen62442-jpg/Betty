# Interview Coach

A Next.js application for interview questions, interview notes, study sessions,
and job applications. Source repository: `bettychen62442-jpg/Betty`.

## Local Development

Requires Node.js 24 and npm.

```sh
npm ci
npm run db:deploy
npm run dev
```

Open `http://localhost:3000/questions`. Without `DATABASE_URL`, both Prisma
migrations and the application use `dev.db` in the project root. Optional
configuration is documented in `.env.example`.

```sh
npm run build
npm start
```

Before `npm start`, set a strong `APP_PASSWORD` in `.env`. The username defaults
to `coach` and can be changed with `APP_USERNAME`. Production requests are refused
when the password is missing. Development remains open unless a password is set.

The AI provider currently uses mock responses, not a hosted GPT model.

Run `npm run test:auth` to check access protection and `npm run build` to check
the production bundle.

## Deploy on Render

[Deploy to Render](https://render.com/deploy?repo=https://github.com/bettychen62442-jpg/Betty)

The Blueprint in `render.yaml` creates one Docker web service in Singapore with
a paid Starter instance and a 1 GB persistent disk. Review Render's displayed
instance and disk charges before creating it. A free instance cannot provide
the persistent disk required by this configuration.

1. Open the deployment link, sign into Render, and authorize access to `Betty`.
2. Review the Blueprint and its charges, then create the service.
3. Wait for the service to become Live. Its public URL is shown by Render;
   append `/questions` to open the question bank.
4. In the service's Environment settings, retrieve the generated `APP_PASSWORD`.
   Log in with username `coach` and that password. Do not share it in chat or Git.

Render builds from `main` using the Dockerfile. Startup applies database
migrations before listening on Render's `PORT`. `/api/health` checks database
access without exposing records or requiring a password. Other pages and APIs
require authentication; use the Render HTTPS URL.

The new deployment starts with an empty database. The uploaded archive's personal
database and images remain separate and are not imported automatically. Keep a
backup before a separate private data migration. A Blueprint file and a GitHub
push alone do not create or verify a live Render service.

## Server Deployment

GitHub stores the source code. GitHub Pages cannot run this application because
it needs Node.js API routes, a writable SQLite database, and file uploads.
Use a Node.js server or a container host with persistent storage.

On a server with Docker Compose:

```sh
git clone https://github.com/bettychen62442-jpg/Betty.git
cd Betty
cp .env.example .env
# Set a strong APP_PASSWORD in .env, then:
docker compose up -d --build
docker compose ps
```

Compose binds port 3000 to the server's loopback interface. Put it behind an
HTTPS reverse proxy or a private network before granting remote access. Pages
and APIs use HTTP Basic authentication with `APP_USERNAME` and `APP_PASSWORD`.
Authenticated users can edit/delete records, and `POST /api/seed` clears the
database. This is a single-user application, not a multi-user account system.

The container applies committed migrations before starting. The `interview-data`
volume preserves the database, images, and audio across container replacement.
Back up this volume; do not run `docker compose down -v` unless you intend to
delete the data. Run only one application instance with this local SQLite volume.

The uploaded archive's personal database and images are not included in Git.
An existing database must be backed up and checked against the migration history
before importing; copying it into an initialized deployment is not an automatic
migration procedure.

Fonts are bundled through the `geist` package; builds do not contact Google Fonts.
Dependency installation needs access to npm and `binaries.prisma.sh` (including
its artifact checksum files).
When building behind a trusted TLS inspection proxy, the Dockerfile optionally
accepts a PEM CA bundle through BuildKit's `build_ca` secret. For example, pass
`--secret id=build_ca,src=/path/to/trusted-ca-bundle.pem` to `docker build`.
The bundle is available only during dependency installation, not in the image.
Uploading this repository alone does not create a public website.
