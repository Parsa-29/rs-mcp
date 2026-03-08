---
name: rs-ge
description: Georgia Revenue Service (rs.ge) tools for waybills, tax invoices, and taxpayer data. Use when the user asks to create a waybill, send a waybill, list waybills, check invoice, save invoice, look up a taxpayer, get z-report, run rs-cli commands, or work with Georgian tax documents. Also use when user mentions ზედნადები, ანგარიშ-ფაქტურა, or გადამხდელი.
metadata:
  author: rs-mcp
  version: 1.0.0
  mcp-server: rs-ge
---

# rs-ge — Georgia Revenue Service

Tools for rs.ge APIs: WayBill, Invoice (NTOS), and TaxPayer services.

## Authentication

Set environment variables or use a `.env` file:
```
RS_SU=service_username
RS_SP=service_password
RS_USER_ID=numeric_user_id
```

## Two Surfaces

**MCP tools** — use directly in conversation. 85 tools across 6 categories.
**CLI** — run `rs-cli <domain> <action>` for scripts and automation.

## MCP Tool Categories

| Category | Prefix | Tools |
|----------|--------|-------|
| Waybill | `get_waybill`, `get_waybills`, `save_waybill` | Read/write transport docs |
| Waybill write | `send_waybill`, `confirm_waybill`, `close_waybill` | Activate, confirm, close |
| Invoice | `get_invoice`, `save_invoice`, `change_invoice_status` | NTOS tax invoices |
| Invoice query | `get_seller_invoices`, `get_buyer_invoices` | List and filter |
| Taxpayer | `tax_get_tp_info_public`, `tax_get_payer_info` | Public info and reports |
| Reference | `get_waybill_types`, `get_waybill_units` | Lookup tables |

## Destructive Operations (HITL)

All write operations are queued — they return a preview with an `action_id` and require explicit user confirmation:
1. Tool returns `pending_confirmation: true` with preview
2. Show the preview to the user
3. User approves → call `confirm_action` with `confirmation_text: "CONFIRM"`
4. User declines → call `reject_action`

Never auto-confirm. Always show the preview first.

## CLI Usage

```bash
rs-cli reference waybill-types
rs-cli waybill get 12345
rs-cli waybill list --from 2025-01-01 --to 2025-03-31
rs-cli waybill send 12345          # prompts [y/N]
rs-cli waybill send 12345 --yes    # skips prompt
rs-cli invoice seller-list --un-id 999 --from 2025-01-01 --to 2025-03-31
rs-cli taxpayer info 123456789
```

All CLI output is JSON. Use `--pretty` for human-readable output.

## Detailed References

- `references/waybill.md` — all waybill and reference commands
- `references/invoice.md` — all invoice commands
- `references/taxpayer.md` — taxpayer and helpers commands
