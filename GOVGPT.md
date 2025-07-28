_internal_

# GovGPT / LibreChat – quick run cheatsheet

For every mode below you need **two tiny setup steps first** – they are identical in all cases:

```bash
# 1  Environment file
cp .env.example .env          # used by both compose and local dev

# 2  Generated but empty YAML overlays – tracked by .gitignore
cp librechat.merged.example.yaml librechat.merged.yaml     # ← stays empty on first run
cp admin-overrides.example.yaml admin-overrides.yaml       # ← stays empty on first run
```

Now open `.env` and set at minimum:

```dotenv
# core runtime
CONFIG_PATH=./librechat.merged.yaml
LIBRECHAT_TAG=feat-adminpanel_compiletime   # or any tag you built/pulled

# AI provider (used by chat UI **and** RAG embeddings)
OPENAI_API_KEY=<your-openai-key>
# …or ANTHROPIC_API_KEY / GOOGLE_KEY …
# …or a custom endpoint like UbiOps (see the librechat.example.yaml)
```

---

## 1  Dev mode (code on host, services in Docker)

Spin up the required backing services once:

```bash
docker compose -f docker-compose.dev.yml up -d  # MongoDB, MeiliSearch, RAG, etc.
```

Then, in your working tree:

```bash
# install & build shared workspaces
npm i
npm run build:data-provider && npm run build:data-schemas && npm run build:api

# build the GovGPT admin package & admin frontend
cd packages/librechat-admin && npm run build
cd ../../admin-frontend       && npm run build
cd ..                         # back to repo root

# launch backend with hot-reload
npm run backend:dev

# (optional) second terminal – live-reload React client
npm run frontend:dev           # http://localhost:3090
```

The `docker-compose.dev.yml` stack exposes the same ports as the local and prod stacks, so no further configuration is required.

---

## 2  Local Docker stack (developer-friendly)

```bash
# build & start using local compose file
docker compose -f docker-compose.local.yml up --build -d

# the UI is now at http://localhost:3080
```

The stack watches `admin-overrides.yaml`; saving settings in the Admin Panel rewrites that file and regenerates `librechat.merged.yaml` automatically.

---

## 3  Production stack (pre-built image)

```bash
# optional: pull a tagged API image built by CI
docker pull ghcr.io/gradient-ds/librechat-api:${LIBRECHAT_TAG:-latest}

# start with production compose
docker compose -f docker-compose.prod.yml up -d
```

Mounts declared in `docker-compose.prod.yml` map the two YAML files as writable bind mounts so runtime updates persist to the host.

---

That’s all – choose the mode that fits your workflow, ensure the two env vars (`CONFIG_PATH`, `LIBRECHAT_TAG`) and an AI key are present, and LibreChat / GovGPT is ready to chat and embed documents.

## Project Structure

```
GovGPT/
├── api/                    # LibreChat backend (Express)
├── client/                 # Main user-facing React app
├── admin-frontend/         # React admin dashboard
├── packages/
│   ├── librechat-admin/    # Express router + admin logic
│   ├── data-provider/      # React-Query hooks & data utils
│   ├── data-schemas/       # Shared TypeScript/Zod schemas
│   └── api/                # Client-side API helpers
│   └── custom/             # Mounts additional routes (e.g. admin) into core app
├── config/                 # Configuration utilities & scripts
├── docker-compose.dev.yml  # Containers for dev services
├── docker-compose.local.yml
├── docker-compose.prod.yml
├── .env.example            # Environment template
├── librechat.yaml          # Base runtime config
└── GOVGPT.md               # This quick-start guide
```
