# rs-cli taxpayer & helpers

Taxpayer information, reports, and auth commands for rs.ge TaxPayer service.

## Helpers (WayBill service)

```bash
rs-cli helpers tin-lookup <tin>   # get taxpayer name from TIN or personal number
rs-cli helpers error-codes        # list waybill error codes
rs-cli helpers check-user         # verify service user credentials
rs-cli helpers service-users      # list all service users for account
```

## Taxpayer Info (read-only)

```bash
rs-cli taxpayer info <tin>             # public info: name, legal form, VAT status, address
rs-cli taxpayer contacts <tin>         # invoice/waybill contact info
rs-cli taxpayer payer <code>           # comprehensive payer info
rs-cli taxpayer legal <code>           # legal entity details
rs-cli taxpayer income <personal-no>   # personal income data
rs-cli taxpayer nace <code>            # NACE activity codes
rs-cli taxpayer income-amount --year <n>
rs-cli taxpayer gita <code> --from <date> --to <date>   # GITA payer data with financials
```

## Two-Step Authentication (SMS)

Some methods require SMS verification before accessing detailed data:

```bash
# Step 1: request SMS (done via separate API — check rs.ge docs)

# Step 2: verify SMS code
rs-cli taxpayer sms-verify <said-code> --sms <sms-code>
rs-cli taxpayer gita-sms-verify <payer-code> --sms <sms-code>

# Step 3: activate access (destructive — prompts [y/N])
rs-cli taxpayer activate <said-code> --status <1=activate|0=deactivate>
rs-cli taxpayer gita-activate <payer-code> --from <date> --status <1|0>
```

## Reports (read-only)

```bash
# Z-report (cash register)
rs-cli taxpayer z-report         --from <date> --to <date>
rs-cli taxpayer z-report-details --from <date> --to <date>

# Waybill monthly amounts
rs-cli taxpayer waybill-amounts <said-code> --from <date> --to <date>

# Financial dashboard
rs-cli taxpayer dashboard

# Act of comparison
rs-cli taxpayer comp-act-old <said-code> --from <date> --to <date> [--session-id <id>]
rs-cli taxpayer comp-act     <said-code> --from <date> --to <date>

# Customs
rs-cli taxpayer cargo200 --from <date> --to <date>
```

## Destructive Commands

```bash
# Register customs warehouse exit
rs-cli taxpayer customs-exit --decl <declaration-no> --code <customs-code> --car <car-number>
```

## Date Format

All dates use `YYYY-MM-DD` format (e.g. `2024-01-15`).

## Notes

- `<code>` and `<said-code>` are the taxpayer's identification code (TIN for individuals, registration code for companies)
- `<payer-code>` is used specifically for GITA queries
- GITA = Georgian Innovation and Technology Agency — special tax regime
