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

The AI provider currently uses mock responses, not a hosted GPT model.

## Server Deployment

GitHub stores the source code. GitHub Pages cannot run this application because
it needs Node.js API routes, a writable SQLite database, and file uploads.
Use a Node.js server or a container host with persistent storage.

On a server with Docker Compose:

```sh
git clone https://github.com/bettychen62442-jpg/Betty.git
cd Betty
docker compose up -d --build
docker compose ps
```

Compose binds port 3000 to the server's loopback interface. Put it behind an
HTTPS reverse proxy with authentication or a private network before granting
remote access. The application has no login; its APIs can edit/delete records,
and `POST /api/seed` clears the database.

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
Uploading this repository alone does not create a public website.
