import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callTaxSoap } from "../soap/tax-client.js";
import { config } from "../config.js";
import { mcpQueueAction } from "../mcp-confirm.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

export function registerTaxpayerAuthTools(server: McpServer): void {
  server.tool(
    "tax_tp_sms_verification",
    "Verify SMS code for standard payer info 2-step auth (SMS კოდის ვერიფიკაცია გადამხდელის ინფორმაციისთვის)",
    {
      said_code: z.string().describe("Taxpayer identification code"),
      sms_code: z.string().describe("SMS verification code received on phone"),
    },
    READONLY,
    async ({ said_code, sms_code }) => {
      const result = await callTaxSoap("Tp_sms_verification", {
        userName: config.su,
        password: config.sp,
        saidCode: said_code,
        smsCode: sms_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_gita_sms_verification",
    "Verify SMS code for GITA payer info 2-step auth (SMS კოდის ვერიფიკაცია GITA ინფორმაციისთვის)",
    {
      payer_code: z.string().describe("Taxpayer identification code"),
      sms_code: z.string().describe("SMS verification code received on phone"),
    },
    READONLY,
    async ({ payer_code, sms_code }) => {
      const result = await callTaxSoap("Gita_Sms_Verification", {
        userName: config.su,
        password: config.sp,
        payerCode: payer_code,
        smsCode: sms_code,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "tax_payer_info_activation",
    "Activate or deactivate payer info access after SMS verification (გადამხდელის ინფორმაციაზე წვდომის აქტივაცია/დეაქტივაცია)",
    {
      said_code: z.string().describe("Taxpayer identification code"),
      status: z.number().describe("Activation status (1=activate, 0=deactivate)"),
    },
    DESTRUCTIVE,
    async ({ said_code, status }) => {
      return mcpQueueAction(
        "Payer_Info_Activation",
        {
          userName: config.su,
          password: config.sp,
          saidCode: said_code,
          status,
        },
        `Payer info activation: code=${said_code}, status=${status === 1 ? "activate" : "deactivate"}`,
        undefined,
        undefined,
        true,
      );
    },
  );

  server.tool(
    "tax_gita_payer_activation",
    "Activate GITA payer info access after SMS verification (GITA გადამხდელის ინფორმაციაზე წვდომის აქტივაცია)",
    {
      payer_code: z.string().describe("Taxpayer identification code"),
      start_date: z.string().describe("Activation start date (YYYY-MM-DDTHH:mm:ss)"),
      status: z.number().describe("Activation status (1=activate, 0=deactivate)"),
    },
    DESTRUCTIVE,
    async ({ payer_code, start_date, status }) => {
      return mcpQueueAction(
        "Gita_Payer_Activation",
        {
          userName: config.su,
          password: config.sp,
          payerCode: payer_code,
          startDate: start_date,
          status,
        },
        `GITA payer activation: code=${payer_code}, date=${start_date}, status=${status === 1 ? "activate" : "deactivate"}`,
        undefined,
        undefined,
        true,
      );
    },
  );
}
