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

Run `npm test` to check access protection, database configuration, and storage
boundaries, and `npm run build` to check the production bundle.

## Free Cloud Deployment

[Deploy to Render](https://render.com/deploy?repo=https://github.com/bettychen62442-jpg/Betty)

The default Blueprint uses a **Render Free** web service with **no paid disk**.
Database records and uploaded images/audio are stored separately in a
**Supabase Free** project. Remain on both providers' Free plans and within their
quotas; do not select paid upgrades or paid resources. Check current eligibility,
limits, and pricing on their dashboards before creating resources.

1. Create a Supabase project on its Free plan. Keep its database password private.
2. In Supabase's Connect dialog, copy the **Session pooler** PostgreSQL URL on
   port 5432, including the URL-encoded database password. This is `DATABASE_URL`.
   Use the session pooler, not the transaction pooler or an IPv6-only direct URL.
3. Obtain the project URL (`SUPABASE_URL`) and a server-only secret API key
   (`SUPABASE_SECRET_KEY`) from the project's API settings. A legacy service-role
   key is also supported. Never use a browser/publishable key for server storage.
4. Open the Render deployment link, authorize `Betty`, confirm the **Free** plan,
   and enter those three values securely when prompted. Do not put them in chat
   or Git. The service applies migrations and creates a private storage bucket.
5. Wait for the service to become Live. Open the URL shown by Render and append
   `/questions`. In the service's Environment settings, retrieve `APP_PASSWORD`.
   Log in with username `coach` and that password. Do not share it in chat or Git.

Render supplies the non-secret `DATABASE_PROVIDER=postgresql` build argument and
runtime variable. This selects the PostgreSQL client and migrations under
`prisma/postgres`; local development still defaults to SQLite. Startup checks the
private bucket before listening on `PORT`. The backend uses a small PostgreSQL
connection pool and verified TLS for remote database connections. `/api/health`
checks the database without exposing records. Other pages and APIs require login.

Free storage is **not a promise of permanent retention**. A website restart does
not delete the separate Supabase data, but quotas, project deletion, account
restrictions, inactivity policies, and provider policy changes can affect access
or retention. Free services may sleep or pause. Paused access is not necessarily
deletion; restore it using the provider dashboard when applicable. Neither a paid
nor a free service replaces independent backups.

Keep original uploads on your computer. Back up the PostgreSQL database with
`pg_dump` (or Supabase CLI `db dump`), and download the private storage bucket
contents separately. A database backup alone does not include uploaded files.
Do not assume automatic database backups or permanent file retention on Free.
Keep backup credentials private and test restoration before relying on a backup.

The new deployment starts with an empty database. The uploaded archive's personal
database and images remain separate and are not imported automatically. Keep a
backup before a separate private data migration. A Blueprint file and a GitHub
push alone do not create or verify a live Render service. Actual cloud storage
and provider quotas must be checked with your own accounts after configuration.

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
