import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callTaxSoap } from "../soap/tax-client.js";
import { config } from "../config.js";
import { mcpQueueAction } from "../mcp-confirm.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

export function registerTaxpayerReportTools(server: McpServer): void {
  server.tool(
    "tax_get_z_report_sum",
    "Get Z-report cash register totals for a date range (საკონტროლო-სალარო აპარატის Z-ანგარიშის ჯამი)",
    {
      start_date: z.string().describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
      end_date: z.string().describe("End date (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ start_date, end_date }) => {
      const result = await callTaxSoap("Get_Z_Report_Sum", {
        UserName: config.su,
        Password: config.sp,
        StartDate: start_date,
        EndDate: end_date,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_z_report_details",
    "Get Z-report per-device details -- device number, date, quantity, amounts (Z-ანგარიშის დეტალები)",
    {
      start_date: z.string().describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
      end_date: z.string().describe("End date (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ start_date, end_date }) => {
      const result = await callTaxSoap("Get_Z_Report_Details", {
        UserName: config.su,
        Password: config.sp,
        StartDate: start_date,
        EndDate: end_date,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_waybill_month_amount",
    "Get monthly waybill amounts by TIN and date range (ზედნადების თვიური თანხები)",
    {
      said_code: z.string().describe("Taxpayer identification code"),
      start_date: z.string().describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
      end_date: z.string().describe("End date (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ said_code, start_date, end_date }) => {
      const result = await callTaxSoap("Get_Waybill_Month_Amount", {
        userName: config.su,
        password: config.sp,
        saidCode: said_code,
        startDate: start_date,
        endDate: end_date,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_quick_cash_info",
    "Get financial dashboard -- income/VAT declarations, comparison card, salary/waybill/invoice monthly (სწრაფი ფინანსური მიმოხილვა)",
    {},
    READONLY,
    async () => {
      const result = await callTaxSoap("Get_QuickCash_Info", {
        user: config.su,
        password: config.sp,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_comp_act_old",
    "Get comparison act in old format -- DESC + 11 data columns (შედარების აქტი ძველი ფორმატით)",
    {
      said_code: z.string().describe("Taxpayer identification code"),
      start_date: z.string().describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
      end_date: z.string().describe("End date (YYYY-MM-DDTHH:mm:ss)"),
      session_id: z.string().optional().describe("Session ID from previous call (optional)"),
    },
    READONLY,
    async ({ said_code, start_date, end_date, session_id }) => {
      const result = await callTaxSoap("Get_comp_act_old", {
        userName: config.su,
        password: config.sp,
        saidCode: said_code,
        start_date,
        end_date,
        session_id: session_id ?? "",
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_comp_act_new",
    "Get comparison act in new format -- tax balances, markups, penalties (შედარების აქტი ახალი ფორმატით)",
    {
      said_code: z.string().describe("Taxpayer identification code"),
      start_date: z.string().describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
      end_date: z.string().describe("End date (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ said_code, start_date, end_date }) => {
      const result = await callTaxSoap("Get_comp_act_new", {
        userName: config.su,
        password: config.sp,
        saidCode: said_code,
        start_date,
        end_date,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_cargo200_info",
    "Get cargo 200 customs information for a date range (ტვირთი 200 საბაჟო ინფორმაცია)",
    {
      start_date: z.string().describe("Start date (YYYY-MM-DDTHH:mm:ss)"),
      end_date: z.string().describe("End date (YYYY-MM-DDTHH:mm:ss)"),
    },
    READONLY,
    async ({ start_date, end_date }) => {
      const result = await callTaxSoap("Get_Cargo200_Info", {
        inUserName: config.su,
        inPassword: config.sp,
        inStartDate: start_date,
        inEndDate: end_date,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_customs_warehouse_exit",
    "Register customs warehouse exit (საბაჟო საწყობიდან გასვლის რეგისტრაცია)",
    {
      declaration_number: z.string().describe("Customs declaration number"),
      customs_code: z.string().describe("Customs office code"),
      car_number: z.string().describe("Vehicle plate number"),
    },
    DESTRUCTIVE,
    async ({ declaration_number, customs_code, car_number }) => {
      return mcpQueueAction(
        "Customs_WareHouse_Exit",
        {
          UserName: config.su,
          Password: config.sp,
          DeclarationNumber: declaration_number,
          CustomsCode: customs_code,
          CarNumber: car_number,
        },
        `Customs warehouse exit: declaration=${declaration_number}, customs=${customs_code}, car=${car_number}`,
        undefined,
        undefined,
        true,
      );
    },
  );
}
