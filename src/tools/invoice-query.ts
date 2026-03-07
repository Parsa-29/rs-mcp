import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callSoap } from "../soap/client.js";
import { config } from "../config.js";

const URL = config.invoiceUrl;
const READONLY = { readOnlyHint: true, destructiveHint: false } as const;

export function registerInvoiceQueryTools(server: McpServer): void {
  server.tool(
    "get_seller_invoices",
    "List seller-side invoices with filters (გამყიდველის ანგარიშ-ფაქტურები)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      s_dt: z.string().optional().describe("Registration date from (YYYY-MM-DDTHH:mm:ss)"),
      e_dt: z.string().optional().describe("Registration date to (YYYY-MM-DDTHH:mm:ss)"),
      op_s_dt: z.string().optional().describe("Operation date from (YYYY-MM-DDTHH:mm:ss)"),
      op_e_dt: z.string().optional().describe("Operation date to (YYYY-MM-DDTHH:mm:ss)"),
      invoice_no: z.string().optional().describe("Invoice number"),
      sa_ident_no: z.string().optional().describe("Buyer identification number"),
      desc: z.string().optional().describe("Buyer name"),
      doc_mos_nom: z.string().optional().describe("Declaration number"),
    },
    READONLY,
    async (params) => {
      const result = await callSoap("get_seller_invoices", {
        user_id: config.userId,
        un_id: params.un_id,
        s_dt: params.s_dt ?? "",
        e_dt: params.e_dt ?? "",
        op_s_dt: params.op_s_dt ?? "",
        op_e_dt: params.op_e_dt ?? "",
        invoice_no: params.invoice_no ?? "",
        sa_ident_no: params.sa_ident_no ?? "",
        desc: params.desc ?? "",
        doc_mos_nom: params.doc_mos_nom ?? "",
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_buyer_invoices",
    "List buyer-side invoices with filters (მყიდველის ანგარიშ-ფაქტურები)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      s_dt: z.string().optional().describe("Registration date from (YYYY-MM-DDTHH:mm:ss)"),
      e_dt: z.string().optional().describe("Registration date to (YYYY-MM-DDTHH:mm:ss)"),
      op_s_dt: z.string().optional().describe("Operation date from (YYYY-MM-DDTHH:mm:ss)"),
      op_e_dt: z.string().optional().describe("Operation date to (YYYY-MM-DDTHH:mm:ss)"),
      invoice_no: z.string().optional().describe("Invoice number"),
      sa_ident_no: z.string().optional().describe("Seller identification number"),
      desc: z.string().optional().describe("Seller name"),
      doc_mos_nom: z.string().optional().describe("Declaration number"),
    },
    READONLY,
    async (params) => {
      const result = await callSoap("get_buyer_invoices", {
        user_id: config.userId,
        un_id: params.un_id,
        s_dt: params.s_dt ?? "",
        e_dt: params.e_dt ?? "",
        op_s_dt: params.op_s_dt ?? "",
        op_e_dt: params.op_e_dt ?? "",
        invoice_no: params.invoice_no ?? "",
        sa_ident_no: params.sa_ident_no ?? "",
        desc: params.desc ?? "",
        doc_mos_nom: params.doc_mos_nom ?? "",
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_user_invoices",
    "List invoices by last update date range, max 3-day span (ანგარიშ-ფაქტურები განახლების თარიღით)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      last_update_date_s: z.string().describe("Last update date range start (YYYY-MM-DDTHH:mm:ss)"),
      last_update_date_e: z.string().describe("Last update date range end (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ un_id, last_update_date_s, last_update_date_e }) => {
      const result = await callSoap("get_user_invoices", {
        last_update_date_s,
        last_update_date_e,
        user_id: config.userId,
        un_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_seller_invoices_r",
    "List seller-side invoices needing reaction (რეაგირების მოთხოვნა - გამყიდველი)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      status: z.number().describe("Status bitmask filter"),
    },
    READONLY,
    async ({ un_id, status }) => {
      const result = await callSoap("get_seller_invoices_r", {
        user_id: config.userId,
        un_id,
        status,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_buyer_invoices_r",
    "List buyer-side invoices needing reaction (რეაგირების მოთხოვნა - მყიდველი)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      status: z.number().describe("Status bitmask filter"),
    },
    READONLY,
    async ({ un_id, status }) => {
      const result = await callSoap("get_buyer_invoices_r", {
        user_id: config.userId,
        un_id,
        status,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_invoice_numbers",
    "Autocomplete invoice numbers (ანგარიშ-ფაქტურის ნომრების ძებნა)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      v_invoice_n: z.string().describe("Partial invoice number to search"),
      v_count: z.number().describe("Max results to return"),
    },
    READONLY,
    async ({ un_id, v_invoice_n, v_count }) => {
      const result = await callSoap("get_invoice_numbers", {
        user_id: config.userId,
        un_id,
        v_invoice_n,
        v_count,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_invoice_tins",
    "Autocomplete buyer/seller TINs (საიდენტიფიკაციო ნომრების ძებნა)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      v_invoice_t: z.string().describe("Partial TIN to search"),
      v_count: z.number().describe("Max results to return"),
    },
    READONLY,
    async ({ un_id, v_invoice_t, v_count }) => {
      const result = await callSoap("get_invoice_tins", {
        user_id: config.userId,
        un_id,
        v_invoice_t,
        v_count,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_invoice_d",
    "Autocomplete declaration numbers (დეკლარაციის ნომრების ძებნა)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
      v_invoice_d: z.string().describe("Partial declaration number to search"),
      v_count: z.number().describe("Max results to return"),
    },
    READONLY,
    async ({ un_id, v_invoice_d, v_count }) => {
      const result = await callSoap("get_invoice_d", {
        user_id: config.userId,
        un_id,
        v_invoice_d,
        v_count,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "print_invoices",
    "Get invoice data for printing (საბეჭდი ფორმის მონაცემები)",
    {
      inv_id: z.number().describe("Invoice unique ID"),
    },
    READONLY,
    async ({ inv_id }) => {
      const result = await callSoap("print_invoices", {
        user_id: config.userId,
        inv_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
