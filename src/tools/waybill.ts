import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callSoap } from "../soap/client.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;

export function registerWaybillTools(server: McpServer): void {
  server.tool(
    "get_waybill",
    "Get a single waybill by ID (ზედნადების გამოტანა)",
    { waybill_id: z.number().describe("Waybill ID") },
    READONLY,
    async ({ waybill_id }) => {
      const result = await callSoap("get_waybill", { waybill_id });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_waybills",
    "List seller waybills with filters (გამყიდველის ზედნადებები)",
    {
      types: z.string().optional().describe("Waybill types, comma-separated"),
      buyer_tin: z.string().optional().describe("Buyer TIN"),
      statuses: z
        .string()
        .optional()
        .describe("Statuses, comma-separated (0=saved, 1=active, 2=closed, -1=deleted, -2=cancelled)"),
      car_number: z.string().optional().describe("Car number"),
      begin_date_s: z.string().optional().describe("Transport start date from (YYYY-MM-DD)"),
      begin_date_e: z.string().optional().describe("Transport start date to (YYYY-MM-DD)"),
      create_date_s: z.string().optional().describe("Create date from (YYYY-MM-DD)"),
      create_date_e: z.string().optional().describe("Create date to (YYYY-MM-DD)"),
      driver_tin: z.string().optional().describe("Driver TIN"),
      delivery_date_s: z.string().optional().describe("Delivery date from (YYYY-MM-DD)"),
      delivery_date_e: z.string().optional().describe("Delivery date to (YYYY-MM-DD)"),
      full_amount: z.number().optional().describe("Full amount"),
      waybill_number: z.string().optional().describe("Waybill number"),
      close_date_s: z.string().optional().describe("Close date from (YYYY-MM-DD)"),
      close_date_e: z.string().optional().describe("Close date to (YYYY-MM-DD)"),
      s_user_ids: z.string().optional().describe("Service user IDs, comma-separated"),
      comment: z.string().optional().describe("Comment filter"),
    },
    READONLY,
    async (params) => {
      const result = await callSoap("get_waybills", {
        itypes: params.types,
        buyer_tin: params.buyer_tin,
        statuses: params.statuses,
        car_number: params.car_number,
        begin_date_s: params.begin_date_s,
        begin_date_e: params.begin_date_e,
        create_date_s: params.create_date_s,
        create_date_e: params.create_date_e,
        driver_tin: params.driver_tin,
        delivery_date_s: params.delivery_date_s,
        delivery_date_e: params.delivery_date_e,
        full_amount: params.full_amount,
        waybill_number: params.waybill_number,
        close_date_s: params.close_date_s,
        close_date_e: params.close_date_e,
        s_user_ids: params.s_user_ids,
        comment: params.comment,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_buyer_waybills",
    "List buyer waybills with filters (მყიდველის ზედნადებები)",
    {
      types: z.string().optional().describe("Waybill types, comma-separated"),
      seller_tin: z.string().optional().describe("Seller TIN"),
      statuses: z
        .string()
        .optional()
        .describe("Statuses, comma-separated (0=saved, 1=active, 2=closed, 8=sent to transporter, -1=deleted, -2=cancelled)"),
      car_number: z.string().optional().describe("Car number"),
      begin_date_s: z.string().optional().describe("Transport start date from (YYYY-MM-DD)"),
      begin_date_e: z.string().optional().describe("Transport start date to (YYYY-MM-DD)"),
      create_date_s: z.string().optional().describe("Create date from (YYYY-MM-DD)"),
      create_date_e: z.string().optional().describe("Create date to (YYYY-MM-DD)"),
      driver_tin: z.string().optional().describe("Driver TIN"),
      delivery_date_s: z.string().optional().describe("Delivery date from (YYYY-MM-DD)"),
      delivery_date_e: z.string().optional().describe("Delivery date to (YYYY-MM-DD)"),
      full_amount: z.number().optional().describe("Full amount"),
      waybill_number: z.string().optional().describe("Waybill number"),
      close_date_s: z.string().optional().describe("Close date from (YYYY-MM-DD)"),
      close_date_e: z.string().optional().describe("Close date to (YYYY-MM-DD)"),
      s_user_ids: z.string().optional().describe("Service user IDs, comma-separated"),
      comment: z.string().optional().describe("Comment filter"),
    },
    READONLY,
    async (params) => {
      const result = await callSoap("get_buyer_waybills", {
        itypes: params.types,
        seller_tin: params.seller_tin,
        statuses: params.statuses,
        car_number: params.car_number,
        begin_date_s: params.begin_date_s,
        begin_date_e: params.begin_date_e,
        create_date_s: params.create_date_s,
        create_date_e: params.create_date_e,
        driver_tin: params.driver_tin,
        delivery_date_s: params.delivery_date_s,
        delivery_date_e: params.delivery_date_e,
        full_amount: params.full_amount,
        waybill_number: params.waybill_number,
        close_date_s: params.close_date_s,
        close_date_e: params.close_date_e,
        s_user_ids: params.s_user_ids,
        comment: params.comment,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_waybills_v1",
    "List waybills by last update date range, max 3-day span (ზედნადებები განახლების თარიღით)",
    {
      buyer_tin: z.string().optional().describe("Buyer/seller TIN to filter by"),
      last_update_date_s: z
        .string()
        .describe("Last update date range start (YYYY-MM-DDTHH:mm:ss)"),
      last_update_date_e: z
        .string()
        .describe("Last update date range end (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ buyer_tin, last_update_date_s, last_update_date_e }) => {
      const result = await callSoap("get_waybills_v1", {
        buyer_tin,
        last_update_date_s,
        last_update_date_e,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_waybills_ex",
    "List seller waybills with confirmation filter (გამყიდველის ზედნადებები დადასტურების ფილტრით)",
    {
      types: z.string().optional().describe("Waybill types, comma-separated"),
      buyer_tin: z.string().optional().describe("Buyer TIN"),
      statuses: z
        .string()
        .optional()
        .describe("Statuses, comma-separated (0=saved, 1=active, 2=closed, -1=deleted, -2=cancelled)"),
      car_number: z.string().optional().describe("Car number"),
      begin_date_s: z.string().optional().describe("Transport start date from (YYYY-MM-DD)"),
      begin_date_e: z.string().optional().describe("Transport start date to (YYYY-MM-DD)"),
      create_date_s: z.string().optional().describe("Create date from (YYYY-MM-DD)"),
      create_date_e: z.string().optional().describe("Create date to (YYYY-MM-DD)"),
      driver_tin: z.string().optional().describe("Driver TIN"),
      delivery_date_s: z.string().optional().describe("Delivery date from (YYYY-MM-DD)"),
      delivery_date_e: z.string().optional().describe("Delivery date to (YYYY-MM-DD)"),
      full_amount: z.number().optional().describe("Full amount"),
      waybill_number: z.string().optional().describe("Waybill number"),
      close_date_s: z.string().optional().describe("Close date from (YYYY-MM-DD)"),
      close_date_e: z.string().optional().describe("Close date to (YYYY-MM-DD)"),
      s_user_ids: z.string().optional().describe("Service user IDs, comma-separated"),
      comment: z.string().optional().describe("Comment filter"),
      is_confirmed: z
        .number()
        .describe("Confirmation filter: 0=unconfirmed, 1=confirmed, -1=rejected"),
    },
    READONLY,
    async (params) => {
      const result = await callSoap("get_waybills_ex", {
        itypes: params.types,
        buyer_tin: params.buyer_tin,
        statuses: params.statuses,
        car_number: params.car_number,
        begin_date_s: params.begin_date_s,
        begin_date_e: params.begin_date_e,
        create_date_s: params.create_date_s,
        create_date_e: params.create_date_e,
        driver_tin: params.driver_tin,
        delivery_date_s: params.delivery_date_s,
        delivery_date_e: params.delivery_date_e,
        full_amount: params.full_amount,
        waybill_number: params.waybill_number,
        close_date_s: params.close_date_s,
        close_date_e: params.close_date_e,
        s_user_ids: params.s_user_ids,
        comment: params.comment,
        is_confirmed: params.is_confirmed,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_buyer_waybills_ex",
    "List buyer waybills with confirmation filter (მყიდველის ზედნადებები დადასტურების ფილტრით)",
    {
      types: z.string().optional().describe("Waybill types, comma-separated"),
      seller_tin: z.string().optional().describe("Seller TIN"),
      statuses: z
        .string()
        .optional()
        .describe("Statuses, comma-separated (0=saved, 1=active, 2=closed, 8=sent to transporter, -1=deleted, -2=cancelled)"),
      car_number: z.string().optional().describe("Car number"),
      begin_date_s: z.string().optional().describe("Transport start date from (YYYY-MM-DD)"),
      begin_date_e: z.string().optional().describe("Transport start date to (YYYY-MM-DD)"),
      create_date_s: z.string().optional().describe("Create date from (YYYY-MM-DD)"),
      create_date_e: z.string().optional().describe("Create date to (YYYY-MM-DD)"),
      driver_tin: z.string().optional().describe("Driver TIN"),
      delivery_date_s: z.string().optional().describe("Delivery date from (YYYY-MM-DD)"),
      delivery_date_e: z.string().optional().describe("Delivery date to (YYYY-MM-DD)"),
      full_amount: z.number().optional().describe("Full amount"),
      waybill_number: z.string().optional().describe("Waybill number"),
      close_date_s: z.string().optional().describe("Close date from (YYYY-MM-DD)"),
      close_date_e: z.string().optional().describe("Close date to (YYYY-MM-DD)"),
      s_user_ids: z.string().optional().describe("Service user IDs, comma-separated"),
      comment: z.string().optional().describe("Comment filter"),
      is_confirmed: z
        .number()
        .describe("Confirmation filter: 0=unconfirmed, 1=confirmed, -1=rejected"),
    },
    READONLY,
    async (params) => {
      const result = await callSoap("get_buyer_waybills_ex", {
        itypes: params.types,
        seller_tin: params.seller_tin,
        statuses: params.statuses,
        car_number: params.car_number,
        begin_date_s: params.begin_date_s,
        begin_date_e: params.begin_date_e,
        create_date_s: params.create_date_s,
        create_date_e: params.create_date_e,
        driver_tin: params.driver_tin,
        delivery_date_s: params.delivery_date_s,
        delivery_date_e: params.delivery_date_e,
        full_amount: params.full_amount,
        waybill_number: params.waybill_number,
        close_date_s: params.close_date_s,
        close_date_e: params.close_date_e,
        s_user_ids: params.s_user_ids,
        comment: params.comment,
        is_confirmed: params.is_confirmed,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
