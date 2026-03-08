import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callSoap } from "../soap/client.js";
import { config } from "../config.js";
import { mcpQueueAction } from "../mcp-confirm.js";

const URL = config.invoiceUrl;
const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

export function registerInvoiceDescTools(server: McpServer): void {
  server.tool(
    "save_invoice_desc",
    "Save a goods/service line item on an invoice (საქონლის ჩანაწერის შენახვა). drg_amount: positive=normal VAT, 0=zero-rate, -1=non-taxable",
    {
      id: z.number().describe("Goods line ID, pass 0 to create new"),
      invois_id: z.number().describe("Invoice unique ID"),
      goods: z.string().describe("Goods/service name"),
      g_unit: z.string().describe("Unit of measurement"),
      g_number: z.number().describe("Quantity"),
      full_amount: z.number().describe("Total amount including VAT and excise"),
      drg_amount: z.number().describe("VAT amount (positive=normal, 0=zero-rate, -1=non-taxable)"),
      aqcizi_amount: z.number().optional().describe("Excise amount"),
      akciz_id: z.number().optional().describe("Excise product code ID"),
    },
    DESTRUCTIVE,
    async (params) => {
      const soapParams = {
        user_id: config.userId,
        id: params.id,
        invois_id: params.invois_id,
        goods: params.goods,
        g_unit: params.g_unit,
        g_number: params.g_number,
        full_amount: params.full_amount,
        drg_amount: params.drg_amount,
        aqcizi_amount: params.aqcizi_amount ?? 0,
        akciz_id: params.akciz_id ?? 0,
      };
      return mcpQueueAction(
        "save_invoice_desc",
        soapParams,
        `Save goods line #${params.id} on invoice #${params.invois_id}: "${params.goods}"`,
        URL,
      );
    },
  );

  server.tool(
    "get_invoice_desc",
    "Get all goods/service line items for an invoice (საქონლის ჩანაწერების ნახვა)",
    {
      invois_id: z.number().describe("Invoice unique ID"),
    },
    READONLY,
    async ({ invois_id }) => {
      const result = await callSoap("get_invoice_desc", {
        user_id: config.userId,
        invois_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "delete_invoice_desc",
    "Delete a goods/service line item from an invoice (საქონლის ჩანაწერის წაშლა)",
    {
      id: z.number().describe("Goods line item unique ID"),
      inv_id: z.number().describe("Invoice unique ID"),
    },
    DESTRUCTIVE,
    async ({ id, inv_id }) => {
      const soapParams = {
        user_id: config.userId,
        id,
        inv_id,
      };
      return mcpQueueAction(
        "delete_invoice_desc",
        soapParams,
        `Delete goods line #${id} from invoice #${inv_id}`,
        URL,
      );
    },
  );

  server.tool(
    "get_ntos_invoices_inv_nos",
    "Get waybills linked to an invoice (ანგარიშ-ფაქტურის ზედნადებები)",
    {
      invois_id: z.number().describe("Invoice unique ID"),
    },
    READONLY,
    async ({ invois_id }) => {
      const result = await callSoap("get_ntos_invoices_inv_nos", {
        user_id: config.userId,
        invois_id,
      }, URL);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "save_ntos_invoices_inv_nos",
    "Link a waybill to an invoice (ზედნადების მიბმა ანგარიშ-ფაქტურაზე)",
    {
      invois_id: z.number().describe("Invoice unique ID"),
      overhead_no: z.string().describe("Waybill number"),
      overhead_dt: z.string().describe("Waybill date (YYYY-MM-DDTHH:mm:ss)"),
    },
    DESTRUCTIVE,
    async ({ invois_id, overhead_no, overhead_dt }) => {
      const soapParams = {
        invois_id,
        user_id: config.userId,
        overhead_no,
        overhead_dt,
      };
      return mcpQueueAction(
        "save_ntos_invoices_inv_nos",
        soapParams,
        `Link waybill ${overhead_no} to invoice #${invois_id}`,
        URL,
      );
    },
  );

  server.tool(
    "delete_ntos_invoices_inv_nos",
    "Unlink a waybill from an invoice (ზედნადების მოხსნა ანგარიშ-ფაქტურიდან)",
    {
      id: z.number().describe("Waybill link record ID"),
      inv_id: z.number().describe("Invoice unique ID"),
    },
    DESTRUCTIVE,
    async ({ id, inv_id }) => {
      const soapParams = {
        user_id: config.userId,
        id,
        inv_id,
      };
      return mcpQueueAction(
        "delete_ntos_invoices_inv_nos",
        soapParams,
        `Unlink waybill link #${id} from invoice #${inv_id}`,
        URL,
      );
    },
  );
}
