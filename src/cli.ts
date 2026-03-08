#!/usr/bin/env node
import { parseArgs } from "node:util";
import { handleWaybill } from "./commands/waybill.js";
import { handleInvoice } from "./commands/invoice.js";
import { handleTaxpayer } from "./commands/taxpayer.js";
import { handleReference } from "./commands/reference.js";
import { handleHelpers } from "./commands/helpers.js";
import { handleConfirm } from "./commands/confirm.js";

const USAGE = `
rs-cli — Georgia Revenue Service CLI

Usage: rs-cli <domain> <action> [args] [flags]

Domains:
  waybill     Transportation waybills (15 commands)
  reference   Lookup tables: types, units, codes (5 commands)
  helpers     Utility lookups (4 commands)
  invoice     Tax invoices (38 commands)
  taxpayer    Taxpayer data & reports (20 commands)
  confirm     Manage pending actions (3 commands)

Global flags:
  --yes, -y   Skip confirmation prompt on destructive operations
  --pretty    Force pretty-printed JSON output (default on TTY)

Examples:
  rs-cli reference waybill-types
  rs-cli waybill get 12345
  rs-cli waybill list --buyer-tin 123456789 --from 2024-01-01 --to 2024-01-31
  rs-cli waybill send 12345 --yes
  rs-cli invoice seller-list --un-id 999 --from 2024-01-01 --to 2024-12-31
  rs-cli taxpayer info 123456789
  rs-cli taxpayer dashboard

Authentication:
  Set RS_SU and RS_SP environment variables (or use a .env file).
`.trim();

const { values, positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    // Global booleans
    yes: { type: "boolean", short: "y", default: false },
    pretty: { type: "boolean", default: false },
    // Common string flags (must be declared so parseArgs treats them as strings, not booleans)
    from: { type: "string" },
    to: { type: "string" },
    id: { type: "string" },
    type: { type: "string" },
    status: { type: "string" },
    types: { type: "string" },
    statuses: { type: "string" },
    car: { type: "string" },
    comment: { type: "string" },
    number: { type: "string" },
    amount: { type: "string" },
    users: { type: "string" },
    confirmed: { type: "string" },
    "begin-date": { type: "string" },
    "delivery-date": { type: "string" },
    "buyer-tin": { type: "string" },
    "seller-tin": { type: "string" },
    "driver-tin": { type: "string" },
    "create-from": { type: "string" },
    "create-to": { type: "string" },
    "delivery-from": { type: "string" },
    "delivery-to": { type: "string" },
    "close-from": { type: "string" },
    "close-to": { type: "string" },
    "seller-id": { type: "string" },
    "buyer-id": { type: "string" },
    "trans-id": { type: "string" },
    "buyer-name": { type: "string" },
    "driver-name": { type: "string" },
    start: { type: "string" },
    end: { type: "string" },
    goods: { type: "string" },
    // Invoice flags
    "inv-id": { type: "string" },
    "op-date": { type: "string" },
    "op-from": { type: "string" },
    "op-to": { type: "string" },
    "overhead-no": { type: "string" },
    "overhead-dt": { type: "string" },
    "b-user-id": { type: "string" },
    "invoice-no": { type: "string" },
    "doc-no": { type: "string" },
    "un-id": { type: "string" },
    tin: { type: "string" },
    desc: { type: "string" },
    query: { type: "string" },
    count: { type: "string" },
    period: { type: "string" },
    "decl-num": { type: "string" },
    "seq-num": { type: "string" },
    note: { type: "string" },
    notes: { type: "string" },
    reason: { type: "string" },
    no: { type: "string" },
    dt: { type: "string" },
    unit: { type: "string" },
    qty: { type: "string" },
    drg: { type: "string" },
    akciz: { type: "string" },
    "akciz-id": { type: "string" },
    username: { type: "string" },
    password: { type: "string" },
    search: { type: "string" },
    "k-type": { type: "string" },
    // Taxpayer flags
    year: { type: "string" },
    sms: { type: "string" },
    "session-id": { type: "string" },
    decl: { type: "string" },
    code: { type: "string" },
  },
});

const [domain, ...rest] = positionals;

if (!domain || domain === "--help" || domain === "-h") {
  console.log(USAGE);
  process.exit(0);
}

const flags = values as Record<string, string | boolean | undefined>;

if (flags.pretty) process.env._RS_PRETTY = "1";

try {
  switch (domain) {
    case "waybill":
      await handleWaybill(rest, flags);
      break;
    case "invoice":
      await handleInvoice(rest, flags);
      break;
    case "taxpayer":
      await handleTaxpayer(rest, flags);
      break;
    case "reference":
      await handleReference(rest);
      break;
    case "helpers":
      await handleHelpers(rest);
      break;
    case "confirm":
      await handleConfirm(rest);
      break;
    default:
      console.error(`Unknown domain: "${domain}". Run 'rs-cli' for usage.`);
      process.exit(1);
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ error: message }));
  process.exit(1);
}
