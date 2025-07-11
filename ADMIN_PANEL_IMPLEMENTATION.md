# Admin Panel – Concise Implementation Summary

## New Files

- `packages/data-schemas/src/schema/adminConfig.ts`
- `packages/data-schemas/src/types/adminConfig.ts`
- `packages/data-schemas/src/schema/customEndpoint.ts`
- `packages/data-schemas/src/types/customEndpoint.ts`
- `packages/data-schemas/src/models/adminConfig.ts`
- `packages/data-schemas/src/models/customEndpoint.ts`
- `api/models/AdminConfig.js`
- `api/server/routes/admin.js`
- `client/src/components/Nav/AdminPage/CustomEndpoints/CustomEndpoints.tsx`

## Modified Files (selection)

Backend
- `packages/data-schemas/src/types/index.ts`
- `packages/data-schemas/src/models/index.ts`
- `api/models/index.js`
- `api/server/index.js`
- `api/server/routes/index.js`
- `api/server/routes/config.js`
- `api/server/services/AppService.js`
- `api/server/services/start/interface.js`
- `api/server/services/Config/loadConfigEndpoints.js`
- `api/server/services/Config/loadConfigModels.js`

Frontend & Shared
- `client/src/common/types.ts`
- `packages/data-provider/src/config.ts`
- `packages/data-provider/src/keys.ts`
- `packages/data-provider/src/permissions.ts`
- `packages/data-provider/src/data-service.ts`
- `client/src/data-provider/Admin/queries.ts`
- `client/src/data-provider/Endpoints/queries.ts`
- `client/src/components/Chat/Input/ArtifactsSubMenu.tsx`
- `client/src/components/Nav/AccountSettings.tsx`
- `client/src/components/Nav/AdminPage/constants.ts`
- `client/src/components/Nav/AdminPage/AdminPage.tsx`
- `client/src/hooks/Endpoint/useEndpoints.ts`


## How It Works

1. **Database Layer**
   Two schemas were added: `AdminConfig` stores UI and feature overrides; `CustomEndpoint` stores OpenAPI-defined AI providers. Each collection holds a single document per entry and is exported through the data-schemas package.

2. **API Routes**
   A new router at `/api/admin` provides CRUD endpoints for both collections, secured by the existing `checkAdmin` middleware.

3. **Configuration Loading**
   During startup `AppService` reads YAML, environment variables and, if present, the `AdminConfig` document. `loadDefaultInterface` now uses the priority `adminConfig ?? yamlConfig ?? defaults` for every interface value.

4. **Runtime Overrides**
   The `/api/config` endpoint fetches fresh `adminConfig` on every request and merges it into the cached startup payload, so admin changes take effect without a restart.

5. **Custom Endpoints at Runtime**
   Helpers `loadConfigEndpoints.js` and `loadConfigModels.js` merge enabled `CustomEndpoint` documents with YAML data. `getCustomEndpointConfig` falls back to the database when a provider is missing in YAML, enabling Together AI and similar providers immediately.

6. **Caching Strategy**
   Mutations that alter admin settings or endpoints clear `STARTUP_CONFIG`, `ENDPOINT_CONFIG` and `MODELS_CONFIG` caches. A brief delay (50 ms backend, 100 ms frontend) avoids race conditions between cache clearing and refetch.

7. **Frontend Integration**
   React Query hooks were extended to cover admin and endpoint operations. After any mutation, related queries are invalidated and `useGetStartupConfig` refetches automatically. The admin UI is available at `/admin` and is visible only to users with the `ADMIN` role.

8. **Feature Toggles**
   New interface flags (`plugins`, `webSearch`, `codeExecution`, `fileSearch`) map to permission checks and UI visibility. Disabling a flag immediately hides the associated endpoint or switch across the application.

This design delivers a database-backed admin panel with real-time configuration, custom endpoint management and zero impact on existing YAML workflows while touching only the necessary areas of the original codebase.
