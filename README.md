# Cloud Storefront: cloud deployment and DevOps coursework

Kilmaine Kakes is a Next.js App Router bakery catalogue backed by MongoDB/Mongoose. Visitors browse products and the About page. A single configured administrator signs in to add, edit, and delete products. This is a catalogue, not a checkout, payments, inventory, or customer account system.


## Coursework completion status

The implemented scope is complete: a public catalogue, single-admin login and product CRUD, server-side authorization and validation, shared login throttling, revocable sessions, pagination, database readiness, CI configuration, standalone/container delivery, and recovery tooling. Payments, checkout, customer accounts, and inventory tracking are outside this catalogue project.

Start with [`.env.example`](.env.example), [the CI workflow](.github/workflows/nextjs.yml), [the Dockerfile](Dockerfile), and [Compose](compose.yaml). All supplied account/contact/configuration values are examples or placeholders. The completed coursework is maintained on `main`; the repository's historical `master` branch was not rewritten or made equivalent automatically. Select `main` explicitly in your deployment provider or change the default branch yourself if desired.

## Local development

Use Node 22 (`.nvmrc`), Next.js 16, React 19, and MongoDB 8. Start a local MongoDB instance, then:

```sh
npm ci
cp .env.example .env.local
node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))'
# Put that output in SESSION_SECRET; replace ADMIN_USERNAME.
# Generate ADMIN_PASSWORD_HASH without putting the password in shell history:
read -rs -p 'Admin password: ' ADMIN_PASSWORD; echo
printf '%s' "$ADMIN_PASSWORD" | node scripts/hash-password.cjs
unset ADMIN_PASSWORD
npm run dev
```

Copy the generated hash into `ADMIN_PASSWORD_HASH` in `.env.local`. Use a password of at least 12 characters. Next loads `.env.local` automatically; never commit it. `MONGO` is a server-only MongoDB URI, `ADMIN_USERNAME` selects the single administrator, `ADMIN_PASSWORD_HASH` is a salted scrypt hash, and `SESSION_SECRET` signs one-hour admin sessions. No variable should use the `NEXT_PUBLIC_` prefix. `.env.example` contains placeholders, not working credentials. The old database `admins` collection is unused; remove legacy plaintext credentials after backing up any needed data.

Visit `/` for the public catalogue, `/login` to sign in, and `/products` for management. An empty database is valid: sign in and add a product. Images must use `https://images.pexels.com/`; titles are 3–50 characters, descriptions 1–500, and prices nonnegative with up to two decimals. Invalid form input displays an error. Invalid or missing product IDs return 404. The server validates all input, including requests bypassing browser constraints.

## Architecture and behavior

Server components query MongoDB directly. Public catalogue rendering is dynamic, so builds need neither a database connection nor production secrets. The connection helper caches an in-flight promise across concurrent requests and retries after failed connections. Mutations revalidate the catalogue and administration pages so edits appear immediately.

Admin cookies are HttpOnly, SameSite=Lax, signed with HMAC-SHA256, and expire after an hour. Password verification uses scrypt and a constant-time hash comparison. The product layout checks authentication, and every server action independently enforces it; hiding a link is not access control. Next server actions provide POST and origin checks; preserve the correct public Host/Origin through your reverse proxy. Production cookies require HTTPS. Every protected request also checks the server-side session record. Logout deletes it, invalidating copied cookies immediately.

## Build, containers, and deployment

```sh
npm test -- --runInBand
npm run lint
npm run build
npm start
```

For a container exercise, put the same admin values in a root `.env` file (Compose reads `.env`, not `.env.local`) and run `docker compose up --build`. This starts persistent MongoDB on a private Compose network; its port is not published. The web container uses Next's standalone output, runs as a non-root user, and reads secrets at runtime rather than embedding them in build layers. Because production cookies require HTTPS, put this container behind a local HTTPS reverse proxy before testing login. For ordinary HTTP local development use `npm run dev`. `docker compose down` preserves the database; `down -v` destroys it.

For cloud deployment, publish the tested image to your registry and run it on a container service, or deploy this server application to a Next-compatible platform. Supply `MONGO`, the admin hash/name, and `SESSION_SECRET` using runtime secret settings. Use an authenticated managed MongoDB service with verified TLS and restricted networking; the unauthenticated local Compose database is for isolated coursework only. Deploy behind HTTPS, route traffic to port 3000, and use `/api/health` as a database readiness check (200 ready, 503 unavailable). A process liveness check should be separate so a database outage does not cause restart loops.

GitHub Pages cannot execute this application's server actions or query its database. The previous Pages workflow has been replaced with CI that tests, lints, builds, and builds the container. Add your own provider deployment job using workload identity, protected GitHub environments, and repository variables such as your registry and service names. No personal cloud resource names or credentials are embedded in the workflow.

## DevOps learning map

| Concept | Repository implementation | Further exercise |
| --- | --- | --- |
| Reproducible installation | `package-lock.json`, `npm ci`, Node version pin | Pin container base images by digest and automate reviewed updates |
| CI gates | Jest, ESLint, Next build, Docker build | Add a database-backed end-to-end test and image scan |
| Immutable delivery | Multi-stage Docker build, standalone server | Promote one image digest through staging and production |
| Configuration separation | `.env.example`, runtime-only secrets | Rotate signing keys and database credentials via a secret manager |
| Persistence | MongoDB volume / managed database | Restore a backup and measure recovery objectives |
| Observability | Database readiness endpoint and generic UI failure page | Add structured logs, metrics, traces, alerts, and request IDs |
| Safe release | Deployment intentionally requires your provider setup | Compare rolling, blue/green, and canary releases; practice rollback |

## Testing and limitations

Jest covers rendering, password hashing, session tampering/expiry, product input validation, and action authorization. These unit tests complement, rather than replace, real database and browser checks. Exercise login, create/edit/delete, stale product IDs, direct unauthenticated mutations, MongoDB outage recovery, and `/api/health` in staging.

This is an educational baseline. Keep network-level bot controls, audit logging without secrets, automated dependency updates, and off-host encrypted backups in your deployment plan. Shared login throttling, session revocation, and recovery drills are implemented below. There is one administrator and no self-service registration. Do not migrate the old plaintext admin records into configuration without changing the password.

## Builds behind an inspecting proxy

If a managed environment uses a private certificate authority, preserve certificate verification. The Dockerfile accepts an optional BuildKit secret containing your approved CA bundle:

```sh
docker build --secret id=build_ca,src=/path/to/approved-ca-bundle.pem -t coursework-app .
```

The bundle is mounted only during dependency installation and is not copied into the image. Ordinary environments can use `docker build -t coursework-app .`. Do not disable TLS checks or commit private certificates/keys.

`npm run build` also copies static assets into the standalone directory. `npm start` runs that server; use `BIND_HOST=127.0.0.1 npm start` to restrict native local access. Sample bakery branding lives in `src/app/layout.js`, `src/components/navbar/Navbar.js`, and `src/app/about/page.js`; replace the demo address and contact placeholders there before publishing a real site.

## Review outcomes

Replaced plaintext database admin lookup with configured password hashing and signed sessions; protected every mutation; awaited and reused database connections; added validation, missing-record handling, visible form errors, and cache refresh. Replaced incompatible static Pages deployment with a server/container workflow, removed remote font build access, upgraded framework dependencies, and added a reproducible standalone startup. Multi-admin identity management and versioned business-data migrations remain separate extensions.

## Robustness and operations

The catalogue and management table now use 20-row pages (`?page=2`) with stable `_id` ordering and Previous/Next links. Malformed or excessive page numbers normalize to page 1. The database retrieves at most 21 records per request; the extra row determines whether Next is available. Offset pagination is adequate for coursework; use cursor pagination for a large catalogue.

MongoDB pools are limited to 10 connections per process, with five-second connection/selection/pool-wait limits and a ten-second socket timeout. Listing/detail reads have a five-second server query limit. The readiness endpoint sends a real MongoDB ping with an operation timeout, returns 503 during an outage, and disables caching. Connection failures can retry on later requests without caching a rejected connection promise.

Login password derivation now runs asynchronously through Node's crypto worker pool, so it does not synchronously block unrelated requests. This does not prevent brute force or worker-pool exhaustion. Before public deployment, complement the database-backed controls below with network rate limits, bot detection, off-host backup storage, and alerting on readiness failures. Scale the connection pool budget with the total replica count, not just one instance.

## Shared login limits and revocable sessions

MongoDB now stores authentication metadata alongside the business collections. TTL indexes on `login_limits` and `auth_sessions` are initialized on first use; the application database account must be able to create those collections and indexes. No additional service or secret is required. Old self-contained cookies without a matching record no longer grant access.

The single administrator login has a **shared limit of 10 attempts per minute**, enforced by an atomic MongoDB update before password derivation. Successful attempts count too. The limit applies across replicas and across submitted usernames, so changing a username or spoofing a forwarded IP header does not create another bucket. All replicas need synchronized clocks. Expired counters are cleaned by a TTL index, but authorization and quota enforcement do not depend on timely TTL deletion. Fixed-window limits permit boundary bursts; an attacker can also temporarily occupy this shared quota. Protect the endpoint at the ingress against distributed traffic; this educational application intentionally does not trust arbitrary forwarded headers.

Session tokens include random IDs and a one-hour expiry and must match a database record containing only the token's hash. Protected layouts **and every mutation** check that record. Logout revokes one session; **Sign out all devices** revokes every admin session. Changing `ADMIN_USERNAME` or `ADMIN_PASSWORD_HASH` invalidates existing sessions once every replica uses the new configuration. The database never stores the raw cookie. For recovery without a working browser session:

```sh
# Load MONGO securely into the shell; plain Node scripts do not read .env.local automatically.
node scripts/revoke-sessions.cjs --all
```

Database failure denies authentication rather than falling back to cookie-only authorization. Concurrent login and logout-all requests have normal database ordering: a new login committed after revocation may remain active. Rotate credentials as well when responding to compromise.

Run the database-backed tests separately from the unit suite:

```sh
TEST_MONGO=mongodb://127.0.0.1:27017/storefront_auth_test npm run test:integration
```

The test database name must start `storefront_auth_test`; tests clear authentication collections in that dedicated database. Tests verify simultaneous quota consumption, copied-token revocation, credential changes, and expiry before TTL cleanup. Do not point tests at a real application database.

## Backup, restore, and recovery drills

Install the official MongoDB Database Tools (`mongodump`/`mongorestore`) compatible with your server and run the helpers from the repository root. Plain Node scripts require `MONGO` exported in the process environment, with an explicit database name (simple letters/digits/underscore/hyphen). Use dedicated backup/restore credentials through your secret store. Optional `MONGODUMP_BIN` and `MONGORESTORE_BIN` select tool paths. A temporary mode-600 tool config avoids putting credential-bearing URIs in command arguments and is removed on exit.

```sh
mkdir -m 700 backups
node scripts/database.cjs backup backups/store.archive.gz
node scripts/database.cjs restore backups/store.archive.gz restore_store
node scripts/database.cjs verify restore_store
```

Keep the archive, `.sha256`, and `.manifest.json` together. Restore verifies their agreement, refuses the source or a non-empty target, remaps source namespaces only to a separate `restore_…` database, and checks restored collection names. MongoDB creates the empty target on restore. `auth_sessions` and `login_limits` are excluded so recovered data cannot resurrect revoked authentication state. Verify compares BSON documents and indexes against the paused source, including ObjectIds, dates, and nested values. Writes must be paused during a dump/verification drill: a live standalone logical dump is not a multi-collection point-in-time snapshot. On larger deployments use your provider's consistent backups/oplog recovery.

Run the non-empty, disposable drill with tool access and a test database account:

```sh
TEST_MONGO=mongodb://127.0.0.1:27017/storefront_backup_test npm run test:backup
```

The source must be empty and named `storefront_backup_test…`. The drill inserts BSON fixtures and an index, checks exact recovery and authentication exclusion, tests corrupt/source/nonempty-target refusal, and deletes its own generated test data. CI runs this drill using Database Tools from its MongoDB service image. A failed restore may leave a partial target: inspect and recreate it before retrying; never cut over automatically.

Artifacts are private, never overwritten, and ignored by Git/Docker. Checksums detect corruption; they do not authenticate an untrusted archive. Encrypt backups, restrict local OS access, keep encryption keys separate, and store copies off-host. No external destination or automatic schedule has been configured. As an exercise, agree an RPO/RTO, schedule unique daily archives with an explicit retention policy, and record monthly restore/smoke-test timings before trusting the recovery plan.

## Final validation and deployment handover

The following checks passed locally on 15 November 2026:

| Check | Evidence and coverage |
| --- | --- |
| `npm test -- --runInBand` | 13 unit tests covering rendering, password/session integrity, validation, authorization, throttled actions, database retry behavior, and readiness |
| `npm run test:integration` with a dedicated MongoDB | 4 tests covering atomic concurrent throttling, revocation, expiry, and admin credential changes |
| `npm run test:backup` with a dedicated empty test database | Non-empty BSON recovery, index preservation, authentication exclusion, and refusal of corrupt/unsafe restores |
| `npm run lint` / `npm run build` | ESLint and the standalone production build passed |
| Production-server HTTP requests | Login and secure cookie issuance, copied-cookie rejection after logout, logout-all, and shared throttling worked against MongoDB; earlier catalogue checks exercised product CRUD and pagination |

These are local validation results. The workflow is configured to repeat tests, recovery checks, lint, build, and container build on GitHub; this record does not assert that remote CI or a deployed service has passed. The HTTP checks exercised server behavior with explicit test cookies; they do not replace browser testing through a real HTTPS ingress.

Before a public release, configure actual runtime secrets, HTTPS, authenticated/TLS MongoDB, network restrictions, and consistent secrets/clocks across replicas. Verify `/api/health` and perform login, product CRUD, logout/replay, and recovery smoke tests in staging. Old cookie-only sessions must sign in again. Confirm database privileges permit initialization of the authentication collections and TTL indexes.

Off-host backup destinations, encryption keys, schedules/retention, alerts, and provider deployment jobs remain explicit operator settings. No external storage, scheduler, or cloud deployment has been provisioned. Multi-admin identity management, distributed bot controls, audit logging, and managed point-in-time recovery are further exercises rather than unfinished catalogue functionality.
