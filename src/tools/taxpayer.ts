import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callTaxSoap } from "../soap/tax-client.js";
import { config } from "../config.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;

export function registerTaxpayerTools(server: McpServer): void {
  server.tool(
    "tax_get_tp_info_public",
    "Get public taxpayer info by TIN -- name, legal form, status, VAT, address (გადამხდელის საჯარო ინფორმაცია)",
    {
      tp_code: z.string().describe("Taxpayer identification code (TIN / საიდენტიფიკაციო კოდი)"),
    },
    READONLY,
    async ({ tp_code }) => {
      const result = await callTaxSoap("GetTPInfoPublic", {
        Username: config.su,
        Password: config.sp,
        TP_Code: tp_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_tp_contacts",
    "Get taxpayer invoice/waybill contact info -- phone, email (გადამხდელის საკონტაქტო ინფორმაცია)",
    {
      tp_code: z.string().describe("Taxpayer identification code (TIN)"),
    },
    READONLY,
    async ({ tp_code }) => {
      const result = await callTaxSoap("GetTPInfoPublicContacts", {
        Username: config.su,
        Password: config.sp,
        TP_Code: tp_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_payer_info",
    "Get comprehensive payer info -- status, declarations, waybills, cash box, customs (გადამხდელის სრული ინფორმაცია)",
    {
      said_code: z.string().describe("Taxpayer identification code (TIN)"),
    },
    READONLY,
    async ({ said_code }) => {
      const result = await callTaxSoap("Get_Payer_Info", {
        userName: config.su,
        password: config.sp,
        saidCode: said_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_legal_person_info",
    "Get legal entity details -- name, form, address, status, responsible persons (იურიდიული პირის ინფორმაცია)",
    {
      said_code: z.string().describe("Legal entity identification code"),
    },
    READONLY,
    async ({ said_code }) => {
      const result = await callTaxSoap("Get_LegalPerson_Info", {
        inUserName: config.su,
        inPassword: config.sp,
        inSaidCode: said_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_person_income_data",
    "Get person income data -- yearly/monthly amounts, category (ფიზიკური პირის შემოსავლის მონაცემები)",
    {
      personal_number: z.string().describe("Personal identification number (პირადი ნომერი)"),
    },
    READONLY,
    async ({ personal_number }) => {
      const result = await callTaxSoap("GetPersonIncomeData", {
        inUserName: config.su,
        inPassword: config.sp,
        inPersonalNumber: personal_number,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_payer_nace_info",
    "Get NACE activity codes for a taxpayer (გადამხდელის NACE კოდები)",
    {
      said_code: z.string().describe("Taxpayer identification code"),
    },
    READONLY,
    async ({ said_code }) => {
      const result = await callTaxSoap("Get_Payer_Nace_Info", {
        inUserName: config.su,
        inPassword: config.sp,
        inSaidCode: said_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_income_amount",
    "Get joint/total income amount for a given year (ერთობლივი შემოსავლის თანხა წლის მიხედვით)",
    {
      year: z.number().describe("Year to query (e.g. 2025)"),
    },
    READONLY,
    async ({ year }) => {
      const result = await callTaxSoap("Get_Income_Amount", {
        UserName: config.su,
        Password: config.sp,
        Year: year,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_get_payer_info_gita",
    "Get GITA payer info with financial data -- salary, VAT, income, earnings declarations (GITA გადამხდელის ინფორმაცია)",
    {
      payer_code: z.string().describe("Taxpayer identification code"),
      start_date: z.string().describe("Period start date (YYYY-MM-DD)"),
      end_date: z.string().describe("Period end date (YYYY-MM-DD)"),
    },
    READONLY,
    async ({ payer_code, start_date, end_date }) => {
      const result = await callTaxSoap("get_payer_info_gita", {
        userName: config.su,
        password: config.sp,
        payerCode: payer_code,
        startDate: start_date,
        endDate: end_date,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
