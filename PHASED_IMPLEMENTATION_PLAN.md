# GovGPT Compile-Time Admin Panel – Phased Implementation Roadmap

> Goal: validate the side-car approach quickly, then scale to full configuration coverage with minimal upstream impact.

---

## Phase 1 • Core Proof-of-Concept

_Change a single, safe setting (`interface.customWelcome`) via the admin panel, reboot LibreChat, and verify the overlay file is respected._

| Step | Task | Owner | Notes |
|------|------|-------|-------|
| 1 | **Scaffold plugin package** `@govgpt/librechat-admin` with Express router | BE | Directory layout: `index.js`, `router/index.js`, `services/`, `models/` |
| 2 | **Singleton Model** `AdminConfig` (Mongoose) storing `{ overrides: {}, updatedBy, updatedAt }` | BE | One document only |
| 3 | **Allow-list & validation** (`interface.customWelcome` only) | BE | Reject writes outside list; unit tests |
| 4 | **Endpoint** `GET/POST /config` | BE | Return / update overrides document |
| 5 | **Overlay writer** | BE | Write `admin-overrides.yaml` with current overrides |
| 6 | **Merge loader hook** | BE | During boot, deep-merge original YAML + overlay (added via plugin) |
| 7 | **Audit logging** | BE | Log diff, user-id, IP to console/DB |
| 8 | **Admin UI (minimal)** | FE | Vite + React form with one text field for Welcome message |
| 9 | **Static serving** | BE | Serve `admin-frontend/dist` at `/admin` via router |
|10 | **Integration manual test** | QA | Change welcome text → commit → reboot → verify UI text on homepage |

**Acceptance criteria**
- No core LibreChat files modified (plugin mounted via `require('@govgpt/librechat-admin')`).
- `admin-overrides.yaml` contains only `interface.customWelcome`.
- After reboot, `/api/config` returns the new welcome text.
- Audit log entry recorded.

---

## Phase 2 • Full Configuration Coverage

_Extend CRUD UI & API to safely edit the complete set of keys defined in `configSchema`._

| Step | Task | Owner | Notes |
|------|------|-------|-------|
| 1 | **Generate schema allow-list** from `configSchema` (Zod) | BE | Build array of editable paths; still exclude secrets |
| 2 | **Dynamic form rendering** | FE | Render inputs based on schema meta (types, enums) |
| 3 | **Section navigation & search** | FE | Re-use original runtime AdminPage components where possible |
| 4 | **Batch update & diff viewer** | FE | Collect multiple edits → single apply, show YAML diff before save |
| 5 | **Enhanced validation** | BE | Validate incoming overrides against Zod schema + allow-list |
| 6 | **Rollback UI** | FE | List previous versions (store in `AdminConfig.history`) & restore |
| 7 | **Comprehensive audit storage** | BE | Persist audit docs to `AuditLog` collection |
| 8 | **E2E tests (Playwright)** | QA | Full CRUD across several settings, reboot, verify effects |
| 9 | **Documentation & release** | Docs | README-admin + usage examples; publish package |

**Acceptance criteria**
- Any non-secret key from `librechat.yaml` editable through UI.
- Strong validation prevents secrets / credentials edits.
- Overlay YAML only contains changed keys (sparse merge).
- End-to-end test suite green on CI.

---

### Out-of-Scope / Future Enhancements
- Live reload of non-critical flags.
- Role-based granular admin permissions.
- Cloud events to trigger automated redeploy instead of manual reboot.

---

This roadmap provides concise, testable checkpoints—deploy Phase 1 quickly to validate the side-car model, then iterate to full parity in Phase 2. 