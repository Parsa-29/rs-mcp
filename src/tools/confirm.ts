import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  executeAction,
  removePendingAction,
  listPendingActions,
} from "../confirm.js";

const READONLY = { readOnlyHint: true, destructiveHint: false } as const;
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true } as const;

export function registerConfirmTools(server: McpServer): void {
  server.tool(
    "confirm_action",
    "Execute a previously queued destructive action. IMPORTANT: You MUST show the pending action details to the user and wait for their explicit approval BEFORE calling this tool. Never auto-confirm. (მოქმედების დადასტურება - მომხმარებლის ნებართვის გარეშე არ გამოიძახოთ)",
    {
      action_id: z.string().describe("The action_id returned by the queued action"),
      confirmation_text: z
        .literal("CONFIRM")
        .describe("Must be exactly 'CONFIRM' — only pass this after the user explicitly approves"),
    },
    DESTRUCTIVE,
    async ({ action_id, confirmation_text }) => {
      if (confirmation_text !== "CONFIRM") {
        return {
          content: [{ type: "text", text: "Confirmation rejected: confirmation_text must be exactly 'CONFIRM'." }],
        };
      }
      const result = await executeAction(action_id);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.tool(
    "reject_action",
    "Cancel a previously queued destructive action (მოქმედების გაუქმება)",
    { action_id: z.string().describe("The action_id to cancel") },
    { readOnlyHint: false, destructiveHint: false },
    async ({ action_id }) => {
      const removed = removePendingAction(action_id);
      return {
        content: [
          {
            type: "text",
            text: removed
              ? `Action ${action_id} cancelled successfully.`
              : `No pending action found for id "${action_id}".`,
          },
        ],
      };
    },
  );

  server.tool(
    "list_pending_actions",
    "List all pending actions awaiting confirmation (მოლოდინში მყოფი მოქმედებები)",
    {},
    READONLY,
    async () => {
      const actions = listPendingActions().map((a) => ({
        action_id: a.id,
        action: a.description,
        method: a.method,
        params: a.params,
        remaining_ms: 5 * 60 * 1000 - (Date.now() - a.createdAt),
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(actions, null, 2) }],
      };
    },
  );
}
