import { config } from "../config.js";
import { escapeXml } from "./client.js";
import { parseXml } from "../xml/parser.js";

const TAX_NAMESPACE = "services.rs.ge";

function buildTaxEnvelope(
  method: string,
  params: Record<string, string | number | undefined>,
): string {
  const paramXml = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<${k}>${escapeXml(String(v))}</${k}>`)
    .join("");

  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"`,
    `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `  xmlns:xsd="http://www.w3.org/2001/XMLSchema">`,
    `<soap:Body>`,
    `<${method} xmlns="${TAX_NAMESPACE}">`,
    paramXml,
    `</${method}>`,
    `</soap:Body>`,
    `</soap:Envelope>`,
  ].join("\n");
}

/**
 * Calls an rs.ge TaxPayer SOAP method.
 * Uses the `services.rs.ge` namespace (different from waybill/invoice).
 * Does NOT auto-inject credentials -- tools pass them explicitly
 * because param names vary per method (UserName, userName, inUserName, user).
 */
export async function callTaxSoap(
  method: string,
  params: Record<string, string | number | undefined> = {},
): Promise<unknown> {
  const envelope = buildTaxEnvelope(method, params);

  const res = await fetch(config.taxUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${TAX_NAMESPACE}/${method}`,
    },
    body: envelope,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SOAP ${method} failed (${res.status}): ${body}`);
  }

  const xml = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any = parseXml(xml);

  const body = parsed?.["Envelope"]?.["Body"] ?? parsed;
  const responseKey = `${method}Response`;
  const response = body?.[responseKey];
  if (!response) return body;

  const resultKey = `${method}Result`;
  const dataKeys = Object.keys(response).filter((k) => !k.startsWith("@_"));

  if (dataKeys.length > 1) {
    return response;
  }

  return response[resultKey] ?? response;
}
