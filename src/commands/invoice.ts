import { callSoap } from "../soap/client.js";
import { config } from "../config.js";
import { output, outputError } from "../output.js";
import { confirm } from "../prompt.js";

type Flags = Record<string, string | boolean | undefined>;

async function destructive(
  description: string,
  flags: Flags,
  fn: () => Promise<unknown>,
): Promise<void> {
  if (!flags.yes) {
    const ok = await confirm(`${description} [y/N] `);
    if (!ok) { output({ cancelled: true }); return; }
  }
  output(await fn());
}

const invoiceUrl = config.invoiceUrl;

export async function handleInvoice(args: string[], flags: Flags): Promise<void> {
  const [action, arg1] = args;

  switch (action) {
    // ── Read: single invoice ──────────────────────────────────────────────
    case "get":
      if (!arg1) outputError("Usage: rs-cli invoice get <id>");
      output(await callSoap("get_invoice", { invois_id: parseInt(arg1, 10) }, invoiceUrl));
      break;

    case "correction-id":
      if (!arg1) outputError("Usage: rs-cli invoice correction-id <id>");
      output(await callSoap("get_makoreqtirebeli", { inv_id: parseInt(arg1, 10) }, invoiceUrl));
      break;

    case "print":
      if (!arg1) outputError("Usage: rs-cli invoice print <id>");
      output(await callSoap("print_invoices", { inv_id: parseInt(arg1, 10) }, invoiceUrl));
      break;

    case "items":
      if (!arg1) outputError("Usage: rs-cli invoice items <id>");
      output(await callSoap("get_invoice_desc", { invois_id: parseInt(arg1, 10) }, invoiceUrl));
      break;

    case "waybills":
      if (!arg1) outputError("Usage: rs-cli invoice waybills <id>");
      output(await callSoap("get_ntos_invoices_inv_nos", { invois_id: parseInt(arg1, 10) }, invoiceUrl));
      break;

    case "reminder-get":
      if (!arg1) outputError("Usage: rs-cli invoice reminder-get <id>");
      output(await callSoap("get_invoice_request", { inv_id: parseInt(arg1, 10) }, invoiceUrl));
      break;

    // ── Read: lists & lookups ─────────────────────────────────────────────
    case "seller-list":
      if (!flags["un-id"]) outputError("Usage: rs-cli invoice seller-list --un-id <n>");
      output(await callSoap("get_seller_invoices", {
        un_id: Number(flags["un-id"]),
        s_dt: flags.from as string,
        e_dt: flags.to as string,
        op_s_dt: flags["op-from"] as string,
        op_e_dt: flags["op-to"] as string,
        invoice_no: flags["invoice-no"] as string,
        sa_ident_no: flags.tin as string,
        desc: flags.desc as string,
        doc_mos_nom: flags["doc-no"] as string,
      }, invoiceUrl));
      break;

    case "buyer-list":
      if (!flags["un-id"]) outputError("Usage: rs-cli invoice buyer-list --un-id <n>");
      output(await callSoap("get_buyer_invoices", {
        un_id: Number(flags["un-id"]),
        s_dt: flags.from as string,
        e_dt: flags.to as string,
        op_s_dt: flags["op-from"] as string,
        op_e_dt: flags["op-to"] as string,
        invoice_no: flags["invoice-no"] as string,
        sa_ident_no: flags.tin as string,
        desc: flags.desc as string,
        doc_mos_nom: flags["doc-no"] as string,
      }, invoiceUrl));
      break;

    case "list-updated":
      if (!flags["un-id"] || !flags.from || !flags.to)
        outputError("Usage: rs-cli invoice list-updated --un-id <n> --from <date> --to <date>");
      output(await callSoap("get_user_invoices", {
        un_id: Number(flags["un-id"]),
        last_update_date_s: flags.from as string,
        last_update_date_e: flags.to as string,
      }, invoiceUrl));
      break;

    case "seller-pending":
      if (!flags["un-id"] || !flags.status)
        outputError("Usage: rs-cli invoice seller-pending --un-id <n> --status <n>");
      output(await callSoap("get_seller_invoices_r", {
        un_id: Number(flags["un-id"]),
        status: Number(flags.status),
      }, invoiceUrl));
      break;

    case "buyer-pending":
      if (!flags["un-id"] || !flags.status)
        outputError("Usage: rs-cli invoice buyer-pending --un-id <n> --status <n>");
      output(await callSoap("get_buyer_invoices_r", {
        un_id: Number(flags["un-id"]),
        status: Number(flags.status),
      }, invoiceUrl));
      break;

    case "search-numbers":
      if (!flags["un-id"] || !flags.query)
        outputError("Usage: rs-cli invoice search-numbers --un-id <n> --query <text> --count <n>");
      output(await callSoap("get_invoice_numbers", {
        un_id: Number(flags["un-id"]),
        v_invoice_n: flags.query as string,
        v_count: Number(flags.count ?? 10),
      }, invoiceUrl));
      break;

    case "search-tins":
      if (!flags["un-id"] || !flags.query)
        outputError("Usage: rs-cli invoice search-tins --un-id <n> --query <text> --count <n>");
      output(await callSoap("get_invoice_tins", {
        un_id: Number(flags["un-id"]),
        v_invoice_t: flags.query as string,
        v_count: Number(flags.count ?? 10),
      }, invoiceUrl));
      break;

    case "search-decl":
      if (!flags["un-id"] || !flags.query)
        outputError("Usage: rs-cli invoice search-decl --un-id <n> --query <text> --count <n>");
      output(await callSoap("get_invoice_d", {
        un_id: Number(flags["un-id"]),
        v_invoice_d: flags.query as string,
        v_count: Number(flags.count ?? 10),
      }, invoiceUrl));
      break;

    case "decl-numbers":
      if (!flags.period) outputError("Usage: rs-cli invoice decl-numbers --period <YYYY-MM>");
      output(await callSoap("get_seq_nums", { sag_periodi: flags.period as string }, invoiceUrl));
      break;

    case "decl-date":
      if (!flags["decl-num"] || !flags["un-id"])
        outputError("Usage: rs-cli invoice decl-date --decl-num <n> --un-id <n>");
      output(await callSoap("get_decl_date", {
        decl_num: flags["decl-num"] as string,
        un_id: flags["un-id"] as string,
      }, invoiceUrl));
      break;

    // ── NTOS helpers (read-only) ──────────────────────────────────────────
    case "ntos-lookup-id":
      if (!flags.tin) outputError("Usage: rs-cli invoice ntos-lookup-id --tin <tin>");
      output(await callSoap("ntos_get_un_id_from_tin", { tin: flags.tin as string }, invoiceUrl));
      break;

    case "ntos-lookup-tin":
      if (!flags["un-id"]) outputError("Usage: rs-cli invoice ntos-lookup-tin --un-id <n>");
      output(await callSoap("ntos_get_tin_from_un_id", { un_id: Number(flags["un-id"]) }, invoiceUrl));
      break;

    case "ntos-lookup-name":
      if (!flags["un-id"]) outputError("Usage: rs-cli invoice ntos-lookup-name --un-id <n>");
      output(await callSoap("ntos_get_org_name_from_un_id", { un_id: Number(flags["un-id"]) }, invoiceUrl));
      break;

    case "ntos-my-id":
      output(await callSoap("ntos_get_un_id_from_user_id", {}, invoiceUrl));
      break;

    case "ntos-akciz":
      output(await callSoap("ntos_get_akciz", { s_text: flags.search as string }, invoiceUrl));
      break;

    case "ntos-check":
      output(await callSoap("ntos_chek", {}, invoiceUrl));
      break;

    case "ntos-users":
      if (!flags.username || !flags.password)
        outputError("Usage: rs-cli invoice ntos-users --username <u> --password <p>");
      output(await callSoap("ntos_get_ser_users", {
        user_name: flags.username as string,
        user_password: flags.password as string,
      }, invoiceUrl));
      break;

    case "reminders-received":
      if (!flags["seller-id"]) outputError("Usage: rs-cli invoice reminders-received --seller-id <n>");
      output(await callSoap("get_requested_invoices", { seller_un_id: Number(flags["seller-id"]) }, invoiceUrl));
      break;

    case "reminders-sent":
      if (!flags["buyer-id"]) outputError("Usage: rs-cli invoice reminders-sent --buyer-id <n>");
      output(await callSoap("get_invoice_requests", { bayer_un_id: Number(flags["buyer-id"]) }, invoiceUrl));
      break;

    case "reminder-get-inv":
      if (!flags["inv-id"]) outputError("Usage: rs-cli invoice reminder-get-inv --inv-id <n>");
      output(await callSoap("get_invoice_request", { inv_id: Number(flags["inv-id"]) }, invoiceUrl));
      break;

    // ── Destructive ───────────────────────────────────────────────────────
    case "save":
      if (!flags["inv-id"] || !flags["op-date"] || !flags["seller-id"] || !flags["buyer-id"])
        outputError("Usage: rs-cli invoice save --inv-id <n> --op-date <date> --seller-id <n> --buyer-id <n>");
      await destructive(`Save invoice (seller ${flags["seller-id"]}, buyer ${flags["buyer-id"]})?`, flags, () =>
        callSoap("save_invoice", {
          invois_id: Number(flags["inv-id"]),
          operation_date: flags["op-date"] as string,
          seller_un_id: Number(flags["seller-id"]),
          buyer_un_id: Number(flags["buyer-id"]),
          overhead_no: flags["overhead-no"] as string,
          overhead_dt: flags["overhead-dt"] as string,
          b_s_user_id: flags["b-user-id"] ? Number(flags["b-user-id"]) : undefined,
        }, invoiceUrl),
      );
      break;

    case "save-note":
      if (!flags["inv-id"] || !flags["op-date"] || !flags["seller-id"] || !flags["buyer-id"] || !flags.note)
        outputError("Usage: rs-cli invoice save-note --inv-id <n> --op-date <date> --seller-id <n> --buyer-id <n> --note <text>");
      await destructive(`Save invoice with note?`, flags, () =>
        callSoap("save_invoice_n", {
          invois_id: Number(flags["inv-id"]),
          operation_date: flags["op-date"] as string,
          seller_un_id: Number(flags["seller-id"]),
          buyer_un_id: Number(flags["buyer-id"]),
          overhead_no: flags["overhead-no"] as string,
          overhead_dt: flags["overhead-dt"] as string,
          b_s_user_id: flags["b-user-id"] ? Number(flags["b-user-id"]) : undefined,
          note: flags.note as string,
        }, invoiceUrl),
      );
      break;

    case "save-advance":
      if (!flags["inv-id"] || !flags["op-date"] || !flags["seller-id"] || !flags["buyer-id"])
        outputError("Usage: rs-cli invoice save-advance --inv-id <n> --op-date <date> --seller-id <n> --buyer-id <n>");
      await destructive(`Save advance invoice?`, flags, () =>
        callSoap("save_invoice_a", {
          invois_id: Number(flags["inv-id"]),
          operation_date: flags["op-date"] as string,
          seller_un_id: Number(flags["seller-id"]),
          buyer_un_id: Number(flags["buyer-id"]),
          overhead_no: flags["overhead-no"] as string,
          overhead_dt: flags["overhead-dt"] as string,
          b_s_user_id: flags["b-user-id"] ? Number(flags["b-user-id"]) : undefined,
        }, invoiceUrl),
      );
      break;

    case "status":
      if (!arg1 || !flags.status) outputError("Usage: rs-cli invoice status <id> --status <n>");
      await destructive(`Change invoice #${arg1} status to ${flags.status}?`, flags, () =>
        callSoap("change_invoice_status", { inv_id: parseInt(arg1, 10), status: Number(flags.status) }, invoiceUrl),
      );
      break;

    case "accept":
      if (!arg1 || !flags.status) outputError("Usage: rs-cli invoice accept <id> --status <n>");
      await destructive(`Accept invoice #${arg1}?`, flags, () =>
        callSoap("acsept_invoice_status", { inv_id: parseInt(arg1, 10), status: Number(flags.status) }, invoiceUrl),
      );
      break;

    case "reject":
      if (!arg1 || !flags.reason) outputError("Usage: rs-cli invoice reject <id> --reason <text>");
      await destructive(`Reject invoice #${arg1}?`, flags, () =>
        callSoap("ref_invoice_status", { inv_id: parseInt(arg1, 10), ref_text: flags.reason as string }, invoiceUrl),
      );
      break;

    case "correct":
      if (!arg1 || !flags.type) outputError("Usage: rs-cli invoice correct <id> --type <n>");
      await destructive(`Create correction invoice for #${arg1}?`, flags, () =>
        callSoap("k_invoice", { inv_id: parseInt(arg1, 10), k_type: Number(flags.type) }, invoiceUrl),
      );
      break;

    case "attach-decl":
      if (!flags["seq-num"] || !flags["inv-id"])
        outputError("Usage: rs-cli invoice attach-decl --seq-num <n> --inv-id <n>");
      await destructive(`Attach invoice #${flags["inv-id"]} to declaration?`, flags, () =>
        callSoap("add_inv_to_decl", {
          seq_num: Number(flags["seq-num"]),
          inv_id: Number(flags["inv-id"]),
        }, invoiceUrl),
      );
      break;

    case "item-save":
      if (!flags["inv-id"] || !flags.goods || !flags.unit || !flags.qty || !flags.amount || !flags.drg)
        outputError("Usage: rs-cli invoice item-save --id <n> --inv-id <n> --goods <text> --unit <text> --qty <n> --amount <n> --drg <n>");
      await destructive(`Save invoice line item?`, flags, () =>
        callSoap("save_invoice_desc", {
          id: flags.id ? Number(flags.id) : 0,
          invois_id: Number(flags["inv-id"]),
          goods: flags.goods as string,
          g_unit: flags.unit as string,
          g_number: Number(flags.qty),
          full_amount: Number(flags.amount),
          drg_amount: Number(flags.drg),
          aqcizi_amount: flags.akciz ? Number(flags.akciz) : undefined,
          akciz_id: flags["akciz-id"] ? Number(flags["akciz-id"]) : undefined,
        }, invoiceUrl),
      );
      break;

    case "item-delete":
      if (!flags.id || !flags["inv-id"])
        outputError("Usage: rs-cli invoice item-delete --id <n> --inv-id <n>");
      await destructive(`Delete invoice line item #${flags.id}?`, flags, () =>
        callSoap("delete_invoice_desc", { id: Number(flags.id), inv_id: Number(flags["inv-id"]) }, invoiceUrl),
      );
      break;

    case "waybill-link":
      if (!flags["inv-id"] || !flags.no || !flags.dt)
        outputError("Usage: rs-cli invoice waybill-link --inv-id <n> --no <number> --dt <date>");
      await destructive(`Link waybill ${flags.no} to invoice #${flags["inv-id"]}?`, flags, () =>
        callSoap("save_ntos_invoices_inv_nos", {
          invois_id: Number(flags["inv-id"]),
          overhead_no: flags.no as string,
          overhead_dt: flags.dt as string,
        }, invoiceUrl),
      );
      break;

    case "waybill-unlink":
      if (!flags.id || !flags["inv-id"])
        outputError("Usage: rs-cli invoice waybill-unlink --id <n> --inv-id <n>");
      await destructive(`Unlink waybill from invoice #${flags["inv-id"]}?`, flags, () =>
        callSoap("delete_ntos_invoices_inv_nos", { id: Number(flags.id), inv_id: Number(flags["inv-id"]) }, invoiceUrl),
      );
      break;

    case "reminder-save":
      if (!flags["inv-id"] || !flags["buyer-id"] || !flags["seller-id"] || !flags.dt)
        outputError("Usage: rs-cli invoice reminder-save --inv-id <n> --buyer-id <n> --seller-id <n> --dt <date>");
      await destructive(`Save invoice reminder?`, flags, () =>
        callSoap("save_invoice_request", {
          inv_id: Number(flags["inv-id"]),
          bayer_un_id: Number(flags["buyer-id"]),
          seller_un_id: Number(flags["seller-id"]),
          overhead_no: flags["overhead-no"] as string,
          dt: flags.dt as string,
          notes: flags.notes as string,
        }, invoiceUrl),
      );
      break;

    case "reminder-delete":
      if (!flags["inv-id"] || !flags["buyer-id"])
        outputError("Usage: rs-cli invoice reminder-delete --inv-id <n> --buyer-id <n>");
      await destructive(`Delete invoice reminder?`, flags, () =>
        callSoap("del_invoice_request", {
          inv_id: Number(flags["inv-id"]),
          bayer_un_id: Number(flags["buyer-id"]),
        }, invoiceUrl),
      );
      break;

    case "reminder-send":
      if (!flags.id || !flags["seller-id"])
        outputError("Usage: rs-cli invoice reminder-send --id <n> --seller-id <n>");
      await destructive(`Forward reminder to seller #${flags["seller-id"]}?`, flags, () =>
        callSoap("acsept_invoice_request_status", {
          id: Number(flags.id),
          seller_un_id: Number(flags["seller-id"]),
        }, invoiceUrl),
      );
      break;

    default:
      outputError(
        `Unknown invoice action: "${action}". Run 'rs-cli invoice --help' or read skills/invoice.md`,
      );
  }
}
