import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callSoap } from "../soap/client.js";
import { config } from "../config.js";
import { mcpQueueAction } from "../mcp-confirm.js";

const URL = config.invoiceUrl;
const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

export function registerInvoiceHelperTools(server: McpServer): void {
  // --- Lookups ---

  server.tool(
    "ntos_get_un_id_from_tin",
    "Get taxpayer unique ID from TIN (საიდენტიფიკაციო ნომრიდან უნიკალური ნომრის გაგება)",
    {
      tin: z.string().describe("Taxpayer identification number"),
    },
    READONLY,
    async ({ tin }) => {
      const result = await callSoap("get_un_id_from_tin", {
        user_id: config.userId,
        tin,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "ntos_get_tin_from_un_id",
    "Get TIN from taxpayer unique ID (უნიკალური ნომრიდან საიდენტიფიკაციო ნომრის გაგება)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
    },
    READONLY,
    async ({ un_id }) => {
      const result = await callSoap("get_tin_from_un_id", {
        user_id: config.userId,
        un_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "ntos_get_org_name_from_un_id",
    "Get organization name from unique ID (უნიკალური ნომრიდან დასახელების გაგება)",
    {
      un_id: z.number().describe("Taxpayer unique ID"),
    },
    READONLY,
    async ({ un_id }) => {
      const result = await callSoap("get_org_name_from_un_id", {
        user_id: config.userId,
        un_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "ntos_get_un_id_from_user_id",
    "Get taxpayer unique ID from e-declaration user ID (მომხმარებლის ნომრიდან უნიკალური ნომრის გაგება)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_un_id_from_user_id", {
        user_id: config.userId,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "ntos_get_akciz",
    "Search excise/akciz codes for invoices (აქციზური საქონლის კოდები)",
    {
      s_text: z.string().optional().describe("Excise product code to search"),
    },
    READONLY,
    async ({ s_text }) => {
      const result = await callSoap("get_akciz", {
        s_text: s_text ?? "",
        user_id: config.userId,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  // --- Service user management ---

  server.tool(
    "ntos_chek",
    "Verify NTOS invoice service credentials and get user info (სერვისის მომხმარებლის შემოწმება)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("chek", {}, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "ntos_get_ser_users",
    "List NTOS invoice service users (სერვისის მომხმარებლების სია)",
    {
      user_name: z.string().describe("E-declaration username"),
      user_password: z.string().describe("E-declaration password"),
    },
    READONLY,
    async ({ user_name, user_password }) => {
      const result = await callSoap("get_ser_users", {
        user_name,
        user_password,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  // --- Invoice requests (reminders) ---

  server.tool(
    "save_invoice_request",
    "Create an invoice issuance reminder for seller (შეხსენების შენახვა)",
    {
      inv_id: z.number().describe("Invoice request ID, pass 0 for new"),
      bayer_un_id: z.number().describe("Buyer taxpayer unique ID"),
      seller_un_id: z.number().describe("Seller taxpayer unique ID"),
      overhead_no: z.string().optional().describe("Waybill number"),
      dt: z.string().describe("Date (YYYY-MM-DDTHH:mm:ss)"),
      notes: z.string().optional().describe("Comment/note"),
    },
    DESTRUCTIVE,
    async (params) => {
      const soapParams = {
        inv_id: params.inv_id,
        user_id: config.userId,
        bayer_un_id: params.bayer_un_id,
        seller_un_id: params.seller_un_id,
        overhead_no: params.overhead_no ?? "",
        dt: params.dt,
        notes: params.notes ?? "",
      };
      return mcpQueueAction(
        "save_invoice_request",
        soapParams,
        `Save invoice request #${params.inv_id} (buyer=${params.bayer_un_id}, seller=${params.seller_un_id})`,
        URL,
      );
    },
  );

  server.tool(
    "del_invoice_request",
    "Delete an invoice issuance reminder (შეხსენების წაშლა)",
    {
      inv_id: z.number().describe("Invoice request unique ID"),
      bayer_un_id: z.number().describe("Buyer taxpayer unique ID"),
    },
    DESTRUCTIVE,
    async ({ inv_id, bayer_un_id }) => {
      const soapParams = {
        inv_id,
        user_id: config.userId,
        bayer_un_id,
      };
      return mcpQueueAction(
        "del_invoice_request",
        soapParams,
        `Delete invoice request #${inv_id} (buyer=${bayer_un_id})`,
        URL,
      );
    },
  );

  server.tool(
    "get_invoice_request",
    "Get invoice issuance reminder details (შეხსენების ნახვა)",
    {
      inv_id: z.number().describe("Invoice request unique ID"),
    },
    READONLY,
    async ({ inv_id }) => {
      const result = await callSoap("get_invoice_request", {
        inv_id,
        user_id: config.userId,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "acsept_invoice_request_status",
    "Send/forward an invoice request to seller (შეხსენების გადაგზავნა)",
    {
      id: z.number().describe("Invoice request unique ID"),
      seller_un_id: z.number().describe("Seller taxpayer unique ID"),
    },
    DESTRUCTIVE,
    async ({ id, seller_un_id }) => {
      const soapParams = {
        id,
        user_id: config.userId,
        seller_un_id,
      };
      return mcpQueueAction(
        "acsept_invoice_request_status",
        soapParams,
        `Forward invoice request #${id} to seller ${seller_un_id}`,
        URL,
      );
    },
  );

  server.tool(
    "get_requested_invoices",
    "List invoice requests received by seller (გამყიდველის შეხსენებების სია)",
    {
      seller_un_id: z.number().describe("Seller taxpayer unique ID"),
    },
    READONLY,
    async ({ seller_un_id }) => {
      const result = await callSoap("get_requested_invoices", {
        user_id: config.userId,
        seller_un_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_invoice_requests",
    "List invoice requests sent by buyer (მყიდველის შეხსენებების სია)",
    {
      bayer_un_id: z.number().describe("Buyer taxpayer unique ID"),
    },
    READONLY,
    async ({ bayer_un_id }) => {
      const result = await callSoap("get_invoice_requests", {
        bayer_un_id,
        user_id: config.userId,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );
}
