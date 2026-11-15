# Cloud Storefront: cloud deployment and DevOps coursework

Kilmaine Kakes is a Next.js App Router bakery catalogue backed by MongoDB/Mongoose. Visitors browse products and the About page. A single configured administrator signs in to add, edit, and delete products. This is a catalogue, not a checkout, payments, inventory, or customer account system.

## Local development

Use Node 22 (`.nvmrc`), Next.js 16, and React 19 and MongoDB 8. Start a local MongoDB instance, then:

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

Admin cookies are HttpOnly, SameSite=Lax, signed with HMAC-SHA256, and expire after an hour. Password verification uses scrypt and a constant-time hash comparison. The product layout checks authentication, and every server action independently enforces it; hiding a link is not access control. Next server actions provide POST and origin checks; preserve the correct public Host/Origin through your reverse proxy. Production cookies require HTTPS. Logout clears the browser cookie, but a copied cookie remains valid until expiry or signing-key rotation.

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

This is an educational baseline. Add shared rate limiting before exposing login publicly (process-local limits do not work across replicas), stronger session revocation for account recovery, audit logging without secrets, automated dependency updates, and backup/restore procedures. There is one administrator and no self-service registration. Do not migrate the old plaintext admin records into configuration without changing the password.

## Builds behind an inspecting proxy

If a managed environment uses a private certificate authority, preserve certificate verification. Both Dockerfiles accept an optional BuildKit secret containing your approved CA bundle:

```sh
docker build --secret id=build_ca,src=/path/to/approved-ca-bundle.pem -t coursework-app .
```

The bundle is mounted only during dependency installation and is not copied into the image. Ordinary environments can use `docker build -t coursework-app .`. Do not disable TLS checks or commit private certificates/keys.

`npm run build` also copies static assets into the standalone directory. `npm start` runs that server; use `BIND_HOST=127.0.0.1 npm start` to restrict native local access. Sample bakery branding lives in `src/app/layout.js`, `src/components/navbar/Navbar.js`, and `src/app/about/page.js`; replace the demo address and contact placeholders there before publishing a real site.

## Review outcomes

Replaced plaintext database admin lookup with configured password hashing and signed sessions; protected every mutation; awaited and reused database connections; added validation, missing-record handling, visible form errors, and cache refresh. Replaced incompatible static Pages deployment with a server/container workflow, removed remote font build access, upgraded framework dependencies, and added a reproducible standalone startup. Multi-admin identity management, distributed login throttling, and database migrations remain separate extensions.
