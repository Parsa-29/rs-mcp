import { queueAction } from "./confirm.js";

/**
 * MCP wrapper around rs-core's queueAction.
 * Returns an MCP-formatted content block with a pending confirmation preview
 * and instructions for the AI agent to show the user before confirming.
 */
export function mcpQueueAction(
  method: string,
  params: Record<string, string | number | undefined>,
  description: string,
  baseUrl?: string,
  xmlParams?: Record<string, string>,
  useTaxSoap?: boolean,
): { content: { type: "text"; text: string }[] } {
  const result = queueAction(method, params, description, baseUrl, xmlParams, useTaxSoap);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            pending_confirmation: true,
            ...result,
            next_step:
              "SHOW THIS PREVIEW TO THE USER and ask for their explicit approval. Only call confirm_action (with confirmation_text='CONFIRM') after the user says yes. Call reject_action to cancel.",
          },
          null,
          2,
        ),
      },
    ],
  };
}
