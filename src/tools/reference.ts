import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callSoap } from "../soap/client.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;

export function registerReferenceTools(server: McpServer): void {
  server.tool(
    "get_waybill_types",
    "List all waybill types (ზედნადების ტიპები)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_waybill_types");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_waybill_units",
    "List all measurement units (ზომის ერთეულები)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_waybill_units");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_trans_types",
    "List all transport types (ტრანსპორტირების ტიპები)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_trans_types");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_akciz_codes",
    "List all excise/akciz codes (აქციზური კოდები)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_akciz_codes");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "get_wood_types",
    "List all wood types (ხეტყის ტიპები)",
    {},
    READONLY,
    async () => {
      const result = await callSoap("get_wood_types");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
