# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

rs-mcp is a dual-interface system for Georgia's Revenue Service (rs.ge) SOAP APIs:
- **MCP server** (85 tools) — stdio transport for Claude Desktop, Cursor, Windsurf, Continue
- **CLI** (`rs-cli`) — command-line interface with same 85 operations
- Both interfaces share identical business logic and SOAP clients

Services: WayBill (24 tools), Invoice/NTOS (40 tools), TaxPayer (20 tools), Confirmation (3 tools)

## Build & Run Commands

```bash
# Build
npm run build              # Compiles TypeScript from src/ → dist/

# MCP server (normally spawned by client, not run manually)
npm start                  # node dist/index.js

# CLI
node dist/cli.js           # Show usage
node dist/cli.js reference waybill-types
node dist/cli.js waybill list --from 2025-01-01 --to 2025-03-31
node dist/cli.js waybill send 12345 --yes
```

After code changes: `npm run build`, then restart MCP server from client settings.

## Environment Setup

Required credentials in `.env`:
```
RS_SU=username:TIN          # Service username (shared across all services)
RS_SP=password              # Service password
RS_USER_ID=numeric_id       # For invoice tools
```

Optional endpoint overrides (have defaults):
- `RS_BASE_URL` — WayBill SOAP endpoint
- `RS_INVOICE_URL` — Invoice/NTOS SOAP endpoint
- `RS_TAX_URL` — TaxPayer SOAP endpoint

## Architecture

### Two-Layer System

**Entry points:**
- `src/index.ts` — MCP server, registers all tools from `src/tools/`
- `src/cli.ts` — CLI router, delegates to domain handlers in `src/commands/`

**Shared core:**
- `src/soap/client.ts` — WayBill & Invoice SOAP client (`callSoap`, `callSoapXml`) — `http://tempuri.org/` namespace
- `src/soap/tax-client.ts` — TaxPayer SOAP client (`callTaxSoap`) — `services.rs.ge` namespace
- `src/config.ts` — Loads env vars (credentials, endpoints)
- `src/xml/parser.ts` — XML response parser (fast-xml-parser)
- `src/xml/waybill-builder.ts` — JSON → Waybill XML converter

### HITL (Human-in-the-Loop) System

All 32 destructive operations (create/update/delete/send/confirm/reject) use two-phase confirmation:

**MCP flow:**
1. Destructive tool → `mcpQueueAction()` (src/mcp-confirm.ts)
2. Returns preview + `action_id`, instructions to show user
3. User approves → AI calls `confirm_action` with `confirmation_text: "CONFIRM"`
4. `executeAction()` (src/confirm.ts) runs actual SOAP call

**CLI flow:**
1. Destructive command → `confirm()` prompt (src/prompt.ts) shows `[y/N]`
2. User types `y` or passes `--yes` flag → calls SOAP directly
3. No action store involved

**Core logic:** `src/confirm.ts`
- `queueAction()` — stores action with 5-minute TTL, returns plain result object
- `executeAction()` — runs pending action's SOAP call, removes from store
- `removePendingAction()` — cancels queued action
- `listPendingActions()` — shows all pending (auto-purges expired)

### Code Organization

**MCP tools** (`src/tools/`):
- One file per domain: `reference.ts`, `waybill.ts`, `waybill-write.ts`, `invoice.ts`, `invoice-query.ts`, `invoice-desc.ts`, `invoice-helpers.ts`, `taxpayer.ts`, `taxpayer-reports.ts`, `taxpayer-auth.ts`, `confirm.ts`, `helpers.ts`
- Each exports `register*Tools(server: McpServer)`
- Destructive tools call `mcpQueueAction()`, read-only call SOAP directly
- Tool annotations: `READONLY` or `DESTRUCTIVE` hints

**CLI commands** (`src/commands/`):
- Matching structure: `reference.ts`, `waybill.ts`, `invoice.ts`, `taxpayer.ts`, `helpers.ts`, `confirm.ts`
- Each exports `handle*(args, flags)` function
- Destructive commands use `confirm()` prompt or `flags.yes` check
- All output through `output()` (src/output.ts) — auto-detects TTY for pretty JSON

**Types** (`src/types/`):
- `waybill.ts`, `invoice.ts`, `taxpayer.ts`, `reference.ts`
- TypeScript interfaces for SOAP responses

### SOAP Client Details

**WayBill & Invoice** (src/soap/client.ts):
- Namespace: `http://tempuri.org/`
- Auth: `su` and `sp` auto-injected into every request
- `callSoap(method, params, baseUrl?)` — standard key-value params
- `callSoapXml(method, flatParams, xmlParams, baseUrl?)` — for methods requiring raw XML (e.g., `save_waybill`)
- Invoice uses same client with `config.invoiceUrl`

**TaxPayer** (src/soap/tax-client.ts):
- Namespace: `services.rs.ge`
- Auth: credentials passed explicitly per method (param names vary: `UserName`, `userName`, `inUserName`, `user`)
- `callTaxSoap(method, params)` — uses `config.taxUrl`

## Common Development Tasks

### Adding a new MCP tool

1. Add to existing file in `src/tools/` (or create new)
2. Use `server.tool(name, description, schema, annotations, handler)`
3. Annotations:
   ```typescript
   const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
   const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;
   ```
4. Destructive tools: `return mcpQueueAction(method, params, description, baseUrl?, xmlParams?, useTaxSoap?)`
5. Read-only tools: `return { content: [{ type: "text", text: JSON.stringify(result) }] }`
6. Export `register*Tools(server)` and call in `src/index.ts`

### Adding a new CLI command

1. Add to matching file in `src/commands/`
2. Read-only: call SOAP directly, then `output(result)` (src/output.ts)
3. Destructive:
   ```typescript
   if (!flags.yes && !(await confirm(`Proceed with ${action}?`))) {
     return output({ cancelled: true });
   }
   const result = await callSoap(method, params);
   output(result);
   ```
4. Register new `--flag` names in `parseArgs` options in `src/cli.ts`

### Adding a new SOAP method

**Read-only method:**
- Add to appropriate `src/tools/*.ts` and `src/commands/*.ts`
- Call `callSoap(method, params)` or `callTaxSoap(method, params)`

**Destructive method:**
- MCP: use `mcpQueueAction()` wrapper
- CLI: use `confirm()` prompt or check `flags.yes`
- Both eventually call same SOAP client

## Tech Stack

- **TypeScript** — strict mode, ES2022 target, Node16 module resolution
- **ES Modules** (`"type": "module"`)
- **@modelcontextprotocol/sdk** — MCP server framework (stdio transport)
- **zod** — MCP input schema validation
- **fast-xml-parser** — XML response parsing
- **dotenv** — environment variable loading
- **node:util parseArgs** — CLI argument parsing (no external CLI framework)

## Important Notes

- Never run `npm start` manually during normal use — MCP clients spawn the server automatically
- After code changes: rebuild (`npm run build`) + restart MCP server from client settings
- HITL confirmation expires after 5 minutes
- `RS_SU` format: `username:TIN` (not just username)
- `RS_USER_ID` is separate from TIN — use `ntos_get_un_id_from_user_id` to find it
- Some TaxPayer methods require 2-step SMS verification or service activation via rs.ge portal
- WayBill and Invoice share same SOAP client (different endpoints)
- TaxPayer uses separate client (different namespace)
