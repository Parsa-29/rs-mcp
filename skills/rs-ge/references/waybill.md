# rs-cli waybill & reference

Waybill (ზედნადები) commands for rs.ge WayBill service.

## Reference Data (no auth needed for lookup)

```bash
rs-cli reference waybill-types       # waybill type codes
rs-cli reference units               # measurement units
rs-cli reference transport-types     # transport type codes
rs-cli reference akciz-codes         # excise/akciz codes
rs-cli reference wood-types          # wood type codes
```

## Read Commands

### Get a single waybill
```bash
rs-cli waybill get <id>
# Example: rs-cli waybill get 12345
```

### List seller waybills
```bash
rs-cli waybill list [flags]
  --buyer-tin <tin>       filter by buyer TIN
  --statuses <csv>        filter by status codes (comma-separated)
  --types <csv>           filter by waybill types
  --from <date>           begin date start (YYYY-MM-DD)
  --to <date>             begin date end
  --create-from <date>    create date start
  --create-to <date>      create date end
  --driver-tin <tin>      filter by driver TIN
  --delivery-from <date>  delivery date start
  --delivery-to <date>    delivery date end
  --amount <n>            filter by full amount
  --number <text>         filter by waybill number
  --close-from <date>     close date start
  --close-to <date>       close date end
  --users <csv>           filter by service user IDs
  --comment <text>        filter by comment
```

### List buyer waybills
```bash
rs-cli waybill buyer-list [flags]
  # Same flags as list, but --seller-tin instead of --buyer-tin
  --seller-tin <tin>
```

### List waybills by last update date (max 3-day range)
```bash
rs-cli waybill list-updated --from <date> --to <date> [--buyer-tin <tin>]
```

### List with confirmation status filter
```bash
rs-cli waybill list-ex --confirmed <0|1> [same filters as list]
rs-cli waybill buyer-list-ex --confirmed <0|1> [same filters as buyer-list]
```

## Destructive Commands

All destructive commands prompt `[y/N]` unless `--yes` / `-y` is passed.

### Create or update a waybill
```bash
rs-cli waybill save \
  --type <n>               waybill type (from reference waybill-types)
  --buyer-tin <tin>        buyer TIN
  --buyer-name <name>      buyer name
  --start <address>        start address
  --end <address>          end address
  --driver-tin <tin>       driver TIN
  --driver-name <name>     driver name
  --begin-date <date>      begin date (YYYY-MM-DD)
  --status <n>             status (0=draft)
  --seller-id <n>          seller unique ID (seler_un_id)
  --trans-id <n>           transport type ID
  --goods '<json>'         goods list as JSON array
  [--id <n>]               existing waybill ID to update
  [--car <number>]         car number
  [--comment <text>]       comment

# goods JSON structure:
# [{"w_name":"Item","unit_id":1,"quantity":10,"price":5.00}]
# Optional fields: id, unit_txt, bar_code, a_id, vat_type, quantity_ext
```

### Activate (send) a waybill
```bash
rs-cli waybill send <id>
rs-cli waybill send <id> --begin-date <date>   # with specific begin date
```

### Confirm receipt (buyer)
```bash
rs-cli waybill confirm <id>
```

### Reject (buyer)
```bash
rs-cli waybill reject <id>
```

### Close (mark delivery done)
```bash
rs-cli waybill close <id>
rs-cli waybill close <id> --delivery-date <date>
```

### Delete (unsent draft only)
```bash
rs-cli waybill delete <id>
```

### Cancel (active waybill)
```bash
rs-cli waybill cancel <id>
```

## Waybill Status Codes

| Code | Meaning |
|------|---------|
| 0 | Draft (saved, not sent) |
| 1 | Active (sent) |
| 2 | Confirmed by buyer |
| 3 | Rejected by buyer |
| 10 | Closed |
| 27 | Cancelled |
