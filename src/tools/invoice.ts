import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callSoap } from "../soap/client.js";
import { config } from "../config.js";
import { mcpQueueAction } from "../mcp-confirm.js";

const URL = config.invoiceUrl;
const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

export function registerInvoiceTools(server: McpServer): void {
  server.tool(
    "save_invoice",
    "Save/create a tax invoice (ანგარიშ-ფაქტურის შენახვა)",
    {
      invois_id: z.number().describe("Invoice ID, pass 0 to create new"),
      operation_date: z.string().describe("Operation date (YYYY-MM-DDTHH:mm:ss)"),
      seller_un_id: z.number().describe("Seller unique ID"),
      buyer_un_id: z.number().describe("Buyer unique ID"),
      overhead_no: z.string().optional().describe("Deprecated, pass empty string"),
      overhead_dt: z.string().optional().describe("Deprecated, pass any date"),
      b_s_user_id: z.number().optional().describe("Buyer's service user ID"),
    },
    DESTRUCTIVE,
    async (params) => {
      const soapParams = {
        user_id: config.userId,
        invois_id: params.invois_id,
        operation_date: params.operation_date,
        seller_un_id: params.seller_un_id,
        buyer_un_id: params.buyer_un_id,
        overhead_no: params.overhead_no ?? "",
        overhead_dt: params.overhead_dt ?? "2000-01-01T00:00:00",
        b_s_user_id: params.b_s_user_id ?? 0,
      };
      return mcpQueueAction(
        "save_invoice",
        soapParams,
        `Save invoice #${params.invois_id} (seller=${params.seller_un_id}, buyer=${params.buyer_un_id})`,
        URL,
      );
    },
  );

  server.tool(
    "save_invoice_n",
    "Save/create a tax invoice with comment (ანგარიშ-ფაქტურის შენახვა კომენტარით)",
    {
      invois_id: z.number().describe("Invoice ID, pass 0 to create new"),
      operation_date: z.string().describe("Operation date (YYYY-MM-DDTHH:mm:ss)"),
      seller_un_id: z.number().describe("Seller unique ID"),
      buyer_un_id: z.number().describe("Buyer unique ID"),
      overhead_no: z.string().optional().describe("Deprecated, pass empty string"),
      overhead_dt: z.string().optional().describe("Deprecated, pass any date"),
      b_s_user_id: z.number().optional().describe("Buyer's service user ID"),
      note: z.string().describe("Comment/note text"),
    },
    DESTRUCTIVE,
    async (params) => {
      const soapParams = {
        user_id: config.userId,
        invois_id: params.invois_id,
        operation_date: params.operation_date,
        seller_un_id: params.seller_un_id,
        buyer_un_id: params.buyer_un_id,
        overhead_no: params.overhead_no ?? "",
        overhead_dt: params.overhead_dt ?? "2000-01-01T00:00:00",
        b_s_user_id: params.b_s_user_id ?? 0,
        note: params.note,
      };
      return mcpQueueAction(
        "save_invoice_n",
        soapParams,
        `Save invoice #${params.invois_id} with note (seller=${params.seller_un_id}, buyer=${params.buyer_un_id})`,
        URL,
      );
    },
  );

  server.tool(
    "save_invoice_a",
    "Save/create an advance/compensation tax invoice (საკომპენსაციო ანგარიშ-ფაქტურის შენახვა)",
    {
      invois_id: z.number().describe("Invoice ID, pass 0 to create new"),
      operation_date: z.string().describe("Operation date (YYYY-MM-DDTHH:mm:ss)"),
      seller_un_id: z.number().describe("Seller unique ID"),
      buyer_un_id: z.number().describe("Buyer unique ID"),
      overhead_no: z.string().optional().describe("Deprecated, pass empty string"),
      overhead_dt: z.string().optional().describe("Deprecated, pass any date"),
      b_s_user_id: z.number().optional().describe("Buyer's service user ID"),
    },
    DESTRUCTIVE,
    async (params) => {
      const soapParams = {
        user_id: config.userId,
        invois_id: params.invois_id,
        operation_date: params.operation_date,
        seller_un_id: params.seller_un_id,
        buyer_un_id: params.buyer_un_id,
        overhead_no: params.overhead_no ?? "",
        overhead_dt: params.overhead_dt ?? "2000-01-01T00:00:00",
        b_s_user_id: params.b_s_user_id ?? 0,
      };
      return mcpQueueAction(
        "save_invoice_a",
        soapParams,
        `Save advance/compensation invoice #${params.invois_id} (seller=${params.seller_un_id}, buyer=${params.buyer_un_id})`,
        URL,
      );
    },
  );

  server.tool(
    "get_invoice",
    "Get a single tax invoice by ID (ანგარიშ-ფაქტურის ნახვა)",
    {
      invois_id: z.number().describe("Invoice unique ID"),
    },
    READONLY,
    async ({ invois_id }) => {
      const result = await callSoap("get_invoice", {
        user_id: config.userId,
        invois_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "change_invoice_status",
    "Change invoice status (სტატუსის ცვლილება). Statuses: -1=deleted, 0=saved, 1=sent, 2=confirmed, 3=corrected-primary, 4=correction, 5=correction-sent, 6=cancelled-sent, 7=cancellation-confirmed, 8=correction-confirmed",
    {
      inv_id: z.number().describe("Invoice unique ID"),
      status: z.number().describe("New status code"),
    },
    DESTRUCTIVE,
    async ({ inv_id, status }) => {
      const soapParams = {
        user_id: config.userId,
        inv_id,
        status,
      };
      return mcpQueueAction(
        "change_invoice_status",
        soapParams,
        `Change invoice #${inv_id} status to ${status}`,
        URL,
      );
    },
  );

  server.tool(
    "acsept_invoice_status",
    "Accept/confirm an invoice (ანგარიშ-ფაქტურის დადასტურება)",
    {
      inv_id: z.number().describe("Invoice unique ID"),
      status: z.number().describe("Status to confirm"),
    },
    DESTRUCTIVE,
    async ({ inv_id, status }) => {
      const soapParams = {
        user_id: config.userId,
        inv_id,
        status,
      };
      return mcpQueueAction(
        "acsept_invoice_status",
        soapParams,
        `Accept invoice #${inv_id} with status ${status}`,
        URL,
      );
    },
  );

  server.tool(
    "ref_invoice_status",
    "Reject an invoice with reason (ანგარიშ-ფაქტურის უარყოფა)",
    {
      inv_id: z.number().describe("Invoice unique ID"),
      ref_text: z.string().describe("Rejection reason text"),
    },
    DESTRUCTIVE,
    async ({ inv_id, ref_text }) => {
      const soapParams = {
        user_id: config.userId,
        inv_id,
        ref_text,
      };
      return mcpQueueAction(
        "ref_invoice_status",
        soapParams,
        `Reject invoice #${inv_id}: "${ref_text}"`,
        URL,
      );
    },
  );

  server.tool(
    "k_invoice",
    "Create a correction invoice (კორექტირება). k_type: 1=cancel operation, 2=change operation type, 3=price/compensation change, 4=goods return",
    {
      inv_id: z.number().describe("Original invoice unique ID"),
      k_type: z.number().describe("Correction type (1-4)"),
    },
    DESTRUCTIVE,
    async ({ inv_id, k_type }) => {
      const soapParams = {
        user_id: config.userId,
        inv_id,
        k_type,
      };
      return mcpQueueAction(
        "k_invoice",
        soapParams,
        `Create correction (type=${k_type}) for invoice #${inv_id}`,
        URL,
      );
    },
  );

  server.tool(
    "get_makoreqtirebeli",
    "Get the correction invoice ID for a corrected invoice (მაკორექტირებელის ნომრის გაგება)",
    {
      inv_id: z.number().describe("Invoice unique ID"),
    },
    READONLY,
    async ({ inv_id }) => {
      const result = await callSoap("get_makoreqtirebeli", {
        user_id: config.userId,
        inv_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "add_inv_to_decl",
    "Attach an invoice to a VAT declaration (დეკლარაციაზე მიბმა)",
    {
      seq_num: z.number().describe("Declaration number"),
      inv_id: z.number().describe("Invoice unique ID"),
    },
    DESTRUCTIVE,
    async ({ seq_num, inv_id }) => {
      const soapParams = {
        user_id: config.userId,
        seq_num,
        inv_id,
      };
      return mcpQueueAction(
        "add_inv_to_decl",
        soapParams,
        `Attach invoice #${inv_id} to declaration ${seq_num}`,
        URL,
      );
    },
  );

  server.tool(
    "get_seq_nums",
    "Get declaration numbers by tax period (დეკლარაციის ნომრები პერიოდის მიხედვით)",
    {
      sag_periodi: z.string().describe("Tax period (e.g. 202404)"),
    },
    READONLY,
    async ({ sag_periodi }) => {
      const result = await callSoap("get_seq_nums", {
        sag_periodi,
        user_id: config.userId,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_decl_date",
    "Get declaration date by declaration number (დეკლარაციის თარიღის წამოღება)",
    {
      decl_num: z.string().describe("Declaration number"),
      un_id: z.string().describe("User unique ID"),
    },
    READONLY,
    async ({ decl_num, un_id }) => {
      const result = await callSoap("get_decl_date", {
        decl_num,
        un_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
