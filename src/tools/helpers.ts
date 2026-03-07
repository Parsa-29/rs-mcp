import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { callSoap } from "../soap/client.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;

export function registerHelperTools(server: McpServer): void {
  server.tool(
    "get_name_from_tin",
    "Look up a taxpayer name by TIN/personal number (სახელის გამოტანა საიდენტიფიკაციო ნომრით)",
    {
      tin: z.string().describe("Taxpayer identification number or personal number"),
    },
    READONLY,
    async ({ tin }) => {
      const result = await callSoap("get_name_from_tin", { tin });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_error_codes",
    "List all waybill error codes (შეცდომების კოდები)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_error_codes");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "chek_service_user",
    "Verify service user credentials and get user info (სერვისის მომხმარებლის შემოწმება)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("chek_service_user");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_service_users",
    "List all service users for the account (სერვისის მომხმარებლების სია)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_service_users");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
