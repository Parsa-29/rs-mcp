# rs-cli invoice

Tax invoice (ანგარიშ-ფაქტურა) commands for rs.ge NTOS service.

Most commands require a `un_id` (unique taxpayer ID). Use `rs-cli invoice ntos-my-id` to get yours.

## NTOS Lookups

```bash
rs-cli invoice ntos-my-id                       # get your own unique ID
rs-cli invoice ntos-lookup-id --tin <tin>       # TIN → unique ID
rs-cli invoice ntos-lookup-tin --un-id <n>      # unique ID → TIN
rs-cli invoice ntos-lookup-name --un-id <n>     # unique ID → org name
rs-cli invoice ntos-check                       # verify credentials
rs-cli invoice ntos-users --username <u> --password <p>
rs-cli invoice ntos-akciz [--search <text>]     # search excise codes
```

## Read Commands

### Single invoice
```bash
rs-cli invoice get <id>
rs-cli invoice print <id>          # printable form data
rs-cli invoice correction-id <id>  # get correction invoice ID
```

### List invoices
```bash
rs-cli invoice seller-list --un-id <n> [flags]
rs-cli invoice buyer-list  --un-id <n> [flags]
  --from <date>         registration date start
  --to <date>           registration date end
  --op-from <date>      operation date start
  --op-to <date>        operation date end
  --invoice-no <text>   filter by invoice number
  --tin <text>          filter by counterparty TIN
  --desc <text>         filter by description
  --doc-no <text>       filter by doc number

rs-cli invoice list-updated --un-id <n> --from <date> --to <date>   # max 3-day range

rs-cli invoice seller-pending --un-id <n> --status <n>  # needing reaction
rs-cli invoice buyer-pending  --un-id <n> --status <n>
```

### Search autocomplete
```bash
rs-cli invoice search-numbers --un-id <n> --query <text> --count <n>
rs-cli invoice search-tins    --un-id <n> --query <text> --count <n>
rs-cli invoice search-decl    --un-id <n> --query <text> --count <n>
```

### Declarations
```bash
rs-cli invoice decl-numbers --period <YYYY-MM>
rs-cli invoice decl-date --decl-num <n> --un-id <n>
```

### Line items
```bash
rs-cli invoice items <id>              # get all line items
rs-cli invoice waybills <id>           # get linked waybills
```

### Reminders
```bash
rs-cli invoice reminder-get <id>
rs-cli invoice reminders-received --seller-id <n>
rs-cli invoice reminders-sent     --buyer-id <n>
```

## Destructive Commands

All prompt `[y/N]` unless `--yes` is passed.

### Save invoice
```bash
rs-cli invoice save \
  --inv-id <n>        0 = new invoice
  --op-date <date>    operation date (YYYY-MM-DD)
  --seller-id <n>     seller unique ID
  --buyer-id <n>      buyer unique ID
  [--overhead-no]     waybill number reference
  [--overhead-dt]     waybill date reference
  [--b-user-id <n>]   buyer-side service user ID

rs-cli invoice save-note   ...same flags... --note <text>
rs-cli invoice save-advance ...same flags...   # advance/compensation invoice
```

### Change invoice status
```bash
rs-cli invoice status <id> --status <n>
rs-cli invoice accept <id> --status <n>
rs-cli invoice reject <id> --reason <text>
rs-cli invoice correct <id> --type <n>        # create correction invoice
```

### Attach to VAT declaration
```bash
rs-cli invoice attach-decl --seq-num <n> --inv-id <n>
```

### Line items
```bash
rs-cli invoice item-save \
  --inv-id <n>   --goods <text>  --unit <text>
  --qty <n>      --amount <n>    --drg <n>
  [--id <n>]     [--akciz <n>]   [--akciz-id <n>]

rs-cli invoice item-delete --id <n> --inv-id <n>
```

### Waybill links
```bash
rs-cli invoice waybill-link   --inv-id <n> --no <waybill-no> --dt <date>
rs-cli invoice waybill-unlink --id <n> --inv-id <n>
```

### Reminders
```bash
rs-cli invoice reminder-save \
  --inv-id <n> --buyer-id <n> --seller-id <n> --dt <date> [--notes <text>]

rs-cli invoice reminder-delete --inv-id <n> --buyer-id <n>
rs-cli invoice reminder-send   --id <n> --seller-id <n>
```
