import { randomUUID } from "node:crypto";
import { callSoap, callSoapXml } from "./soap/client.js";
import { callTaxSoap } from "./soap/tax-client.js";

const TTL_MS = 5 * 60 * 1000;

export interface PendingAction {
  id: string;
  method: string;
  params: Record<string, string | number | undefined>;
  xmlParams?: Record<string, string>;
  baseUrl?: string;
  useTaxSoap?: boolean;
  description: string;
  createdAt: number;
}

export interface QueuedActionResult {
  action_id: string;
  action: string;
  method: string;
  params: Record<string, string | number | undefined>;
  expires_in: string;
}

const store = new Map<string, PendingAction>();

function purgeExpired(): void {
  const now = Date.now();
  for (const [key, action] of store) {
    if (now - action.createdAt > TTL_MS) store.delete(key);
  }
}

/**
 * Queues a destructive SOAP action and returns a plain result object.
 * Protocol-specific formatting (MCP content blocks, CLI prompts, etc.)
 * is handled by the consumer layer.
 */
export function queueAction(
  method: string,
  params: Record<string, string | number | undefined>,
  description: string,
  baseUrl?: string,
  xmlParams?: Record<string, string>,
  useTaxSoap?: boolean,
): QueuedActionResult {
  purgeExpired();

  const action: PendingAction = {
    id: randomUUID(),
    method,
    params,
    xmlParams,
    baseUrl,
    useTaxSoap,
    description,
    createdAt: Date.now(),
  };
  store.set(action.id, action);

  return {
    action_id: action.id,
    action: description,
    method,
    params,
    expires_in: "5 minutes",
  };
}

/**
 * Executes a previously queued action by its id,
 * removes it from the store, and returns the SOAP result.
 */
export async function executeAction(id: string): Promise<unknown> {
  purgeExpired();

  const action = store.get(id);
  if (!action) {
    throw new Error(
      `No pending action found for id "${id}". It may have expired or already been executed.`,
    );
  }

  store.delete(id);

  if (action.useTaxSoap) {
    return callTaxSoap(action.method, action.params);
  }
  if (action.xmlParams) {
    return callSoapXml(action.method, action.params, action.xmlParams, action.baseUrl);
  }
  return callSoap(action.method, action.params, action.baseUrl);
}

export function removePendingAction(id: string): boolean {
  return store.delete(id);
}

export function listPendingActions(): PendingAction[] {
  purgeExpired();
  return Array.from(store.values());
}
