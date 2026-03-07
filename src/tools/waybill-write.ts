import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { queueAction } from "../confirm.js";
import { config } from "../config.js";
import { buildWaybillXml } from "../xml/waybill-builder.js";

const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

const goodsItemSchema = z.object({
  id: z.number().optional().describe("Goods line ID, 0 for new"),
  w_name: z.string().describe("Product/service name"),
  unit_id: z.number().describe("Unit ID from get_waybill_units"),
  unit_txt: z.string().optional().describe("Custom unit text (when unit_id=99)"),
  quantity: z.number().describe("Quantity"),
  price: z.number().describe("Unit price"),
  bar_code: z.string().optional().describe("Barcode"),
  a_id: z.number().optional().describe("Akciz code ID"),
  vat_type: z.number().optional().describe("VAT type: 0=normal, 1=fixed"),
  quantity_ext: z.number().optional().describe("Additional quantity"),
});

const woodDocSchema = z.object({
  id: z.number().optional().describe("Wood document ID, 0 for new"),
  doc_n: z.string().describe("Document number"),
  doc_date: z.string().describe("Document date (YYYY-MM-DD)"),
  doc_desc: z.string().describe("Document description"),
});

const subWaybillSchema = z.object({
  id: z.number().optional().describe("Sub-waybill ID, 0 for new"),
  waybill_number: z.string().describe("Sub-waybill number"),
});

export function registerWaybillWriteTools(server: McpServer): void {
  server.tool(
    "save_waybill",
    "Create or update a waybill (ზედნადების შექმნა/რედაქტირება). Builds the full WAYBILL XML from structured input.",
    {
      id: z.number().optional().describe("Waybill ID, 0 or omit for new"),
      type: z
        .number()
        .describe("Waybill type (1=inner, 2=transportation, 3=without transport, 4=distribution, 5=return, 6=sub-waybill)"),
      buyer_tin: z.string().describe("Buyer TIN (taxpayer identification number)"),
      chek_buyer_tin: z
        .number()
        .optional()
        .describe("1=Georgian TIN, 0=foreign ID"),
      buyer_name: z.string().describe("Buyer name"),
      start_address: z.string().describe("Loading/start address"),
      end_address: z.string().describe("Unloading/end address"),
      driver_tin: z.string().describe("Driver personal number"),
      chek_driver_tin: z
        .number()
        .optional()
        .describe("1=Georgian TIN, 0=foreign ID"),
      driver_name: z.string().describe("Driver full name"),
      transport_coast: z.number().optional().describe("Transport cost"),
      reception_info: z.string().optional().describe("Reception info"),
      receiver_info: z.string().optional().describe("Receiver info"),
      delivery_date: z.string().optional().describe("Delivery date (YYYY-MM-DD)"),
      status: z
        .number()
        .describe("Status: 0=saved, 1=active, 2=closed"),
      seler_un_id: z.number().describe("Seller unique ID (from get_un_id)"),
      par_id: z.number().optional().describe("Parent waybill ID (for sub-waybills)"),
      car_number: z.string().optional().describe("Vehicle plate number"),
      waybill_number: z.string().optional().describe("Waybill number (assigned on activation)"),
      begin_date: z.string().describe("Transport start date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)"),
      tran_cost_payer: z
        .number()
        .optional()
        .describe("Transport cost payer: 1=buyer, 2=seller, 3=other"),
      trans_id: z
        .number()
        .describe("Transport type ID from get_trans_types"),
      trans_txt: z.string().optional().describe("Transport type text (when trans_id=other)"),
      comment: z.string().optional().describe("Comment"),
      category: z
        .number()
        .optional()
        .describe("Category: 0=normal, 1=wood"),
      is_med: z
        .number()
        .optional()
        .describe("0=normal, 1=medicine"),
      goods_list: z.array(goodsItemSchema).min(1).describe("Goods/items list (at least one item)"),
      wood_docs_list: z.array(woodDocSchema).optional().describe("Wood documents (for category=1)"),
      sub_waybills: z.array(subWaybillSchema).optional().describe("Sub-waybill references"),
    },
    DESTRUCTIVE,
    async (params) => {
      const waybillXml = buildWaybillXml(params);

      const goodsSummary = params.goods_list
        .map((g) => `${g.w_name} x${g.quantity}`)
        .join(", ");

      return queueAction(
        "save_waybill",
        {},
        `Save waybill (type=${params.type}, buyer=${params.buyer_tin}, goods: ${goodsSummary})`,
        config.baseUrl,
        { waybill: waybillXml },
      );
    },
  );

  server.tool(
    "send_waybill",
    "Activate a saved waybill — sets status to active and assigns a waybill number (ზედნადების გააქტიურება)",
    { waybill_id: z.number().describe("Waybill ID to activate") },
    DESTRUCTIVE,
    async ({ waybill_id }) => {
      return queueAction(
        "send_waybill",
        { waybill_id },
        `Activate waybill #${waybill_id}`,
      );
    },
  );

  server.tool(
    "send_waybill_vd",
    "Activate a saved waybill with a specific begin date (ზედნადების გააქტიურება თარიღით)",
    {
      waybill_id: z.number().describe("Waybill ID to activate"),
      begin_date: z.string().describe("Transport begin date (YYYY-MM-DDTHH:mm:ss)"),
    },
    DESTRUCTIVE,
    async ({ waybill_id, begin_date }) => {
      return queueAction(
        "send_waybill_vd",
        { waybill_id, begin_date },
        `Activate waybill #${waybill_id} with begin date ${begin_date}`,
      );
    },
  );

  server.tool(
    "confirm_waybill",
    "Buyer confirms receipt of goods from a waybill (ზედნადების დადასტურება მყიდველის მიერ)",
    { waybill_id: z.number().describe("Waybill ID to confirm") },
    DESTRUCTIVE,
    async ({ waybill_id }) => {
      return queueAction(
        "confirm_waybill",
        { waybill_id },
        `Confirm waybill #${waybill_id} (buyer confirmation)`,
      );
    },
  );

  server.tool(
    "reject_waybill",
    "Buyer rejects a waybill (ზედნადების უარყოფა მყიდველის მიერ)",
    { waybill_id: z.number().describe("Waybill ID to reject") },
    DESTRUCTIVE,
    async ({ waybill_id }) => {
      return queueAction(
        "reject_waybill",
        { waybill_id },
        `Reject waybill #${waybill_id} (buyer rejection)`,
      );
    },
  );

  server.tool(
    "close_waybill",
    "Close/complete a waybill — marks delivery as done (ზედნადების დახურვა)",
    { waybill_id: z.number().describe("Waybill ID to close") },
    DESTRUCTIVE,
    async ({ waybill_id }) => {
      return queueAction(
        "close_waybill",
        { waybill_id },
        `Close waybill #${waybill_id}`,
      );
    },
  );

  server.tool(
    "close_waybill_vd",
    "Close/complete a waybill with a specific delivery date (ზედნადების დახურვა მიწოდების თარიღით)",
    {
      waybill_id: z.number().describe("Waybill ID to close"),
      delivery_date: z.string().describe("Delivery date (YYYY-MM-DDTHH:mm:ss)"),
    },
    DESTRUCTIVE,
    async ({ waybill_id, delivery_date }) => {
      return queueAction(
        "close_waybill_vd",
        { waybill_id, delivery_date },
        `Close waybill #${waybill_id} with delivery date ${delivery_date}`,
      );
    },
  );

  server.tool(
    "del_waybill",
    "Delete a saved (not yet activated) waybill (ზედნადების წაშლა)",
    { waybill_id: z.number().describe("Waybill ID to delete") },
    DESTRUCTIVE,
    async ({ waybill_id }) => {
      return queueAction(
        "del_waybill",
        { waybill_id },
        `Delete waybill #${waybill_id}`,
      );
    },
  );

  server.tool(
    "ref_waybill",
    "Cancel an active waybill — sets status to cancelled (ზედნადების გაუქმება)",
    { waybill_id: z.number().describe("Waybill ID to cancel") },
    DESTRUCTIVE,
    async ({ waybill_id }) => {
      return queueAction(
        "ref_waybill",
        { waybill_id },
        `Cancel waybill #${waybill_id}`,
      );
    },
  );
}
